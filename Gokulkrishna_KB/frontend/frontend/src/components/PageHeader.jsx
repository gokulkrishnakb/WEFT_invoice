export default function PageHeader({ title, description, actions, back, className = "" }) {
  return (
    <div className={`page-header ${className}`.trim()}>
      {back}
      <div className="page-header__row">
        <div className="page-header__text">
          <h1>{title}</h1>
          {description && <p className="page-header__description">{description}</p>}
        </div>
        {actions && <div className="page-header__actions no-print">{actions}</div>}
      </div>
    </div>
  );
}
