import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { company } from "../config";
import Icon from "./Icon";

const links = [
  // "Invoices" stays highlighted on invoice detail, create and edit pages too.
  { to: "/", label: "Invoices", end: true, also: "/invoices" },
  { to: "/reports", label: "Reports" },
];

function Mark() {
  return (
    <svg className="brand__mark" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="currentColor" />
      <path d="M10 8v16h12" stroke="#e8d3a0" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  return (
    <div className="shell">
      <header className="topbar no-print">
        <div className="topbar__inner">
          <Link to="/" className="brand" aria-label="Ledgerly home">
            <Mark />
            <span className="brand__name">Ledgerly</span>
          </Link>
          <nav className="nav" aria-label="Main">
            {links.map(({ to, label, end, also }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `nav__link${isActive || (also && pathname.startsWith(also)) ? " active" : ""}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="topbar__end">
            <span className="topbar__company">{company.name}</span>
            <Link to="/invoices/new" className="btn btn--primary btn--sm">
              <Icon name="plus" size={16} />
              New invoice
            </Link>
          </div>
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
