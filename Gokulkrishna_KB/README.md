# Ledgerly — Sales Invoice Management

A full-stack invoice management application built with React, Vite, Tailwind CSS, FastAPI, SQLAlchemy, and PostgreSQL. The frontend calls the versioned API directly; invoices and line items are persisted in PostgreSQL.

## Requirements

- Python 3.10 or newer
- Node.js 20 or newer and npm
- PostgreSQL 14 or newer

## Create the PostgreSQL database

Create a database and a role with permission to connect to it. For example, from `psql` as a PostgreSQL administrator:

```sql
CREATE USER invoice_app WITH PASSWORD 'replace-with-a-local-password';
CREATE DATABASE invoice_manager OWNER invoice_app;
```

Do not use the example password in a shared or production environment.

## Configure and run the backend

From the project root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` and set `DATABASE_URL` to your PostgreSQL connection string. The `.env` file is local configuration and must not be committed. `CORS_ORIGINS` accepts a JSON array, for example `["http://localhost:5173"]`.

Start the API:

```powershell
uvicorn app.main:app --reload
```

On startup SQLAlchemy creates the `invoices` and `invoice_items` tables if they do not exist. Interactive Swagger documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs); the health endpoint is `GET /api/v1/health`.

### API overview

- `POST /api/v1/invoices` — create an invoice and its line items
- `GET /api/v1/invoices?page=1&limit=10` — list and paginate; optional `invoice_number`, `start_date`, and `end_date` filters
- `GET /api/v1/invoices/{id}` — invoice details
- `PUT /api/v1/invoices/{id}` — replace invoice details and item set; include an existing item `id` to update it, omit it to add an item, and omit existing IDs to remove those items
- `DELETE /api/v1/invoices/{id}` — delete the invoice and its associated items

List responses include `total`, `page`, `limit`, `pages`, and `filtered_total_amount`. Invoice numbers are assigned on the server and protected against concurrent duplicate generation with a PostgreSQL transaction-level advisory lock.

## Configure and run the frontend

In another terminal:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

`frontend/.env` may set `VITE_API_URL` if the API is not at `http://localhost:8000/api/v1`. Open the Vite URL printed in the terminal (normally [http://localhost:5173](http://localhost:5173)).

## Tests

Run backend schema and decimal-calculation tests from the backend directory:

```powershell
python -m pytest
```

Build the frontend to validate the production bundle:

```powershell
cd frontend
npm run build
```

For an end-to-end manual check, start PostgreSQL and the API, open `/docs`, then create an invoice with multiple items, list/filter it, inspect it by ID, update and remove an item, and delete the invoice. The browser UI exercises the same API flows and includes pagination, date and invoice-number filters, inline totals, and delete confirmation.

## Notes

- Prices, quantities, line totals, and invoice totals use PostgreSQL `NUMERIC(12,2)` and Python `Decimal`.
- Invoice totals and item totals are recalculated by the backend; frontend values are previews only.
- Invoice deletion cascades to associated line items.
- Database credentials are read from `backend/.env`, not source code.

