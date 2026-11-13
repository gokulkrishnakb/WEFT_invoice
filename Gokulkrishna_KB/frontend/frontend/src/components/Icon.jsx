// A small, consistent icon set (1.6px stroke, 20px grid) so the app has no icon-library dependency.
const paths = {
  plus: <path d="M10 4.5v11M4.5 10h11" />,
  search: (
    <>
      <circle cx="9" cy="9" r="5.25" />
      <path d="m13 13 3.5 3.5" />
    </>
  ),
  print: (
    <>
      <path d="M6 7.5V3.5h8v4" />
      <rect x="3" y="7.5" width="14" height="6.5" rx="1.5" />
      <path d="M6 12h8v4.5H6z" />
    </>
  ),
  download: (
    <>
      <path d="M10 3.5v9M6.5 9 10 12.5 13.5 9" />
      <path d="M4 14.5v2h12v-2" />
    </>
  ),
  edit: (
    <>
      <path d="M12.5 4.5 15.5 7.5 7.5 15.5H4.5v-3z" />
      <path d="m11 6 3 3" />
    </>
  ),
  trash: (
    <>
      <path d="M4 6h12M8 6V4.5h4V6M5.5 6l.75 10h7.5l.75-10" />
    </>
  ),
  back: <path d="M16 10H4.5M9 5.5 4.5 10 9 14.5" />,
  left: <path d="M12 5 7 10l5 5" />,
  right: <path d="m8 5 5 5-5 5" />,
  close: <path d="m5.5 5.5 9 9m0-9-9 9" />,
  check: <path d="m4.5 10.5 3.5 3.5 7.5-8" />,
  alert: (
    <>
      <path d="M10 3.5 17 16H3z" />
      <path d="M10 8.5v3.5M10 14v.01" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="4.5" width="13" height="12" rx="1.5" />
      <path d="M3.5 8.5h13M7 3v3M13 3v3" />
    </>
  ),
};

export default function Icon({ name, size = 18, className = "", title }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : "true"}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {paths[name]}
    </svg>
  );
}
