from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.invoice import DeleteResponse, InvoiceCreate, InvoicePage, InvoiceRead, InvoiceUpdate
from app.services import invoice_service

router = APIRouter(prefix="/invoices", tags=["invoices"])


@router.post("", response_model=InvoiceRead, status_code=status.HTTP_201_CREATED)
def create_invoice(payload: InvoiceCreate, session: Session = Depends(get_db)) -> InvoiceRead:
    return invoice_service.create_invoice(session, payload)


@router.get("", response_model=InvoicePage)
def read_invoices(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    invoice_number: str | None = Query(default=None, max_length=20),
    start_date: date | None = None,
    end_date: date | None = None,
    session: Session = Depends(get_db),
) -> InvoicePage:
    if start_date and end_date and start_date > end_date:
        raise HTTPException(status_code=400, detail="Start date must be on or before end date.")

    invoices, total, pages, filtered_total_amount = invoice_service.list_invoices(
        session, page, limit, invoice_number, start_date, end_date
    )
    return InvoicePage(
        items=invoices,
        total=total,
        page=page,
        limit=limit,
        pages=pages,
        filtered_total_amount=filtered_total_amount,
    )


@router.get("/{invoice_id}", response_model=InvoiceRead)
def read_invoice(invoice_id: int, session: Session = Depends(get_db)) -> InvoiceRead:
    return invoice_service.get_invoice(session, invoice_id)


@router.put("/{invoice_id}", response_model=InvoiceRead)
def replace_invoice(
    invoice_id: int, payload: InvoiceUpdate, session: Session = Depends(get_db)
) -> InvoiceRead:
    return invoice_service.update_invoice(session, invoice_id, payload)


@router.delete("/{invoice_id}", response_model=DeleteResponse)
def remove_invoice(invoice_id: int, session: Session = Depends(get_db)) -> DeleteResponse:
    invoice_service.delete_invoice(session, invoice_id)
    return DeleteResponse(message="Invoice deleted successfully.", id=invoice_id)
