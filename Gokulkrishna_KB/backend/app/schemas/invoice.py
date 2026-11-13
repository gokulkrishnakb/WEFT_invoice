from datetime import date
from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

Name = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]
Money = Annotated[Decimal, Field(ge=0, max_digits=12, decimal_places=2)]
Quantity = Annotated[Decimal, Field(gt=0, max_digits=12, decimal_places=2)]


class InvoiceItemFields(BaseModel):
    product_name: Name
    quantity: Quantity
    price: Money


class InvoiceItemCreate(InvoiceItemFields):
    pass


class InvoiceItemUpdate(InvoiceItemFields):
    id: int | None = Field(default=None, gt=0)


class InvoiceCreate(BaseModel):
    customer_name: Name
    date: date
    items: Annotated[list[InvoiceItemCreate], Field(min_length=1)]


class InvoiceUpdate(BaseModel):
    customer_name: Name
    date: date
    items: Annotated[list[InvoiceItemUpdate], Field(min_length=1)]


class InvoiceItemRead(BaseModel):
    id: int
    product_name: str
    quantity: Decimal
    price: Decimal
    total: Decimal

    model_config = ConfigDict(from_attributes=True)


class InvoiceRead(BaseModel):
    id: int
    invoice_number: str
    customer_name: str
    date: date
    total_amount: Decimal
    items: list[InvoiceItemRead]

    model_config = ConfigDict(from_attributes=True)


class InvoiceListItem(BaseModel):
    id: int
    invoice_number: str
    customer_name: str
    date: date
    total_amount: Decimal

    model_config = ConfigDict(from_attributes=True)


class InvoicePage(BaseModel):
    items: list[InvoiceListItem]
    total: int
    page: int
    limit: int
    pages: int
    filtered_total_amount: Decimal


class DeleteResponse(BaseModel):
    message: str
    id: int
