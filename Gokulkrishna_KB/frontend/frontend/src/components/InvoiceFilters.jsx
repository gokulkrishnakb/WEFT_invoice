import Icon from "./Icon";

export default function InvoiceFilters({ values, onChange, onSubmit, onClear, idPrefix, active }) {
  return (
    <form
      className="filters no-print"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="filters__search">
        <Icon name="search" size={17} />
        <label className="sr-only" htmlFor={`${idPrefix}-number`}>
          Invoice number
        </label>
        <input
          id={`${idPrefix}-number`}
          className="input input--bare"
          placeholder="Search by invoice number"
          value={values.invoice_number}
          onChange={(event) => onChange("invoice_number", event.target.value)}
        />
      </div>
      <div className="filters__dates">
        <label className="filters__date">
          <span>From</span>
          <input
            className="input input--bare"
            type="date"
            value={values.start_date}
            max={values.end_date || undefined}
            onChange={(event) => onChange("start_date", event.target.value)}
          />
        </label>
        <label className="filters__date">
          <span>To</span>
          <input
            className="input input--bare"
            type="date"
            value={values.end_date}
            min={values.start_date || undefined}
            onChange={(event) => onChange("end_date", event.target.value)}
          />
        </label>
      </div>
      <div className="filters__actions">
        {active && (
          <button className="btn btn--sm btn--quiet" type="button" onClick={onClear}>
            Clear
          </button>
        )}
        <button className="btn btn--sm btn--primary" type="submit">
          Apply
        </button>
      </div>
    </form>
  );
}
