import Icon from "./Icon";

/** Inline message that stays on the page (e.g. a request that failed). */
export default function Notice({ children, tone = "error" }) {
  if (!children) return null;
  return (
    <div className={`notice notice--${tone}`} role={tone === "error" ? "alert" : "status"}>
      <Icon name={tone === "error" ? "alert" : "check"} size={17} />
      <div>{children}</div>
    </div>
  );
}
