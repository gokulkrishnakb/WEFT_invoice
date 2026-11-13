from datetime import date as Date
from decimal import Decimal, ROUND_HALF_UP

from fastapi import HTTPException, status
from sqlalchemy import Integer, cast, func, select, text
from sqlalchemy.orm import Session, selectinload

from app.models import Invoice, InvoiceItem
from app.schemas.invoice import InvoiceCreate, InvoiceItemCreate, InvoiceItemUpdate, InvoiceUpdate

CENT = Decimal("0.01")


def _money(value: Decimal) -> Decimal:
    return value.quantize(CENT, rounding=ROUND_HALF_UP)


def calculate_item_total(quantity: Decimal, price: Decimal) -> Decimal:
    return _money(_money(quantity) * _money(price))


def _apply_items(
    invoice: Invoice,
    items: list[InvoiceItemCreate] | list[InvoiceItemUpdate],
) -> None:
    existing = {item.id: item for item in invoice.items}
    retained: set[int] = set()
    total_amount = Decimal("0.00")

    for item_data in items:
        quantity = _money(item_data.quantity)
        price = _money(item_data.price)
        item_total = calculate_item_total(quantity, price)
        total_amount += item_total

        item_id = item_data.id if isinstance(item_data, InvoiceItemUpdate) else None
        if item_id is None:
            item = InvoiceItem(
                product_name=item_data.product_name,
                quantity=quantity,
                price=price,
                total=item_total,
            )
            invoice.items.append(item)
        else:
            item = existing.get(item_id)
            if item is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Item {item_id} does not belong to this invoice.",
                )
            retained.add(item.id)
            item.product_name = item_data.product_name
            item.quantity = quantity
            item.price = price
            item.total = item_total

    for item_id, item in existing.items():
        if item_id not in retained:
            invoice.items.remove(item)

    invoice.total_amount = _money(total_amount)


def create_invoice(session: Session, payload: InvoiceCreate) -> Invoice:
    year_prefix = f"{Date.today().year % 100:02d}INV"
    session.execute(
        text("SELECT pg_advisory_xact_lock(:lock_key)"),
        {"lock_key": Date.today().year},
    )
    last_number = session.scalar(
        select(func.max(cast(func.substring(Invoice.invoice_number, 6), Integer))).where(
            Invoice.invoice_number.like(f"{year_prefix}%")
        )
    )

    invoice = Invoice(
        invoice_number=f"{year_prefix}{(last_number or 0) + 1:04d}",
        customer_name=payload.customer_name,
        date=payload.date,
        total_amount=Decimal("0.00"),
    )
    session.add(invoice)
    _apply_items(invoice, payload.items)
    session.commit()
    session.refresh(invoice)
    return invoice


def list_invoices(
    session: Session,
    page: int,
    limit: int,
    invoice_number: str | None,
    start_date: Date | None,
    end_date: Date | None,
) -> tuple[list[Invoice], int, int, Decimal]:
    filters = []
    if invoice_number:
        filters.append(Invoice.invoice_number.ilike(f"%{invoice_number.strip()}%"))
    if start_date:
        filters.append(Invoice.date >= start_date)
    if end_date:
        filters.append(Invoice.date <= end_date)

    base_query = select(Invoice).where(*filters)
    count = session.scalar(select(func.count()).select_from(base_query.subquery())) or 0
    filtered_total = session.scalar(
        select(func.coalesce(func.sum(Invoice.total_amount), 0)).where(*filters)
    )
    invoices = session.scalars(
        base_query.order_by(Invoice.date.desc(), Invoice.id.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    ).all()
    return invoices, count, (count + limit - 1) // limit, Decimal(filtered_total)


def get_invoice(session: Session, invoice_id: int) -> Invoice:
    invoice = session.scalar(
        select(Invoice)
        .options(selectinload(Invoice.items))
        .where(Invoice.id == invoice_id)
    )
    if invoice is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found.")
    return invoice


def update_invoice(session: Session, invoice_id: int, payload: InvoiceUpdate) -> Invoice:
    invoice = get_invoice(session, invoice_id)
    invoice.customer_name = payload.customer_name
    invoice.date = payload.date
    _apply_items(invoice, payload.items)
    session.commit()
    return get_invoice(session, invoice_id)


def delete_invoice(session: Session, invoice_id: int) -> None:
    invoice = get_invoice(session, invoice_id)
    session.delete(invoice)
    session.commit()
