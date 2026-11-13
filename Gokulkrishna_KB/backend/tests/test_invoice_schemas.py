from datetime import date
from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.schemas.invoice import InvoiceCreate, InvoiceUpdate
from app.main import app
from app.services.invoice_service import _money, calculate_item_total


def valid_invoice() -> dict:
    return {
        "customer_name": "Northstar Studio",
        "date": date(2026, 11, 13),
        "items": [{"product_name": "Consulting", "quantity": "2", "price": "125.50"}],
    }


def test_invoice_schema_accepts_decimal_line_items() -> None:
    payload = InvoiceCreate.model_validate(valid_invoice())

    assert payload.customer_name == "Northstar Studio"
    assert payload.items[0].quantity == Decimal("2")
    assert payload.items[0].price == Decimal("125.50")


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("customer_name", "  "),
        ("date", None),
        ("items", []),
    ],
)
def test_invoice_schema_rejects_missing_required_values(field: str, value: object) -> None:
    request = valid_invoice()
    request[field] = value

    with pytest.raises(ValidationError):
        InvoiceCreate.model_validate(request)


@pytest.mark.parametrize(
    ("quantity", "price"),
    [("0", "1.00"), ("-1", "1.00"), ("1", "-0.01")],
)
def test_invoice_schema_rejects_invalid_item_values(quantity: str, price: str) -> None:
    request = valid_invoice()
    request["items"] = [{"product_name": "Service", "quantity": quantity, "price": price}]

    with pytest.raises(ValidationError):
        InvoiceCreate.model_validate(request)


def test_create_schema_ignores_client_supplied_item_id() -> None:
    request = valid_invoice()
    request["items"][0]["id"] = 1

    payload = InvoiceCreate.model_validate(request)

    assert not hasattr(payload.items[0], "id")


def test_update_schema_accepts_existing_item_id() -> None:
    request = valid_invoice()
    request["items"][0]["id"] = 1

    payload = InvoiceUpdate.model_validate(request)

    assert payload.items[0].id == 1


def test_money_rounds_to_cents_using_decimal_arithmetic() -> None:
    assert _money(Decimal("11.235")) == Decimal("11.24")


def test_item_total_is_calculated_and_rounded_to_cents() -> None:
    assert calculate_item_total(Decimal("1.11"), Decimal("2.22")) == Decimal("2.46")


def test_versioned_invoice_endpoints_are_in_openapi() -> None:
    paths = app.openapi()["paths"]

    assert "/api/v1/invoices" in paths
    assert "/api/v1/invoices/{invoice_id}" in paths
