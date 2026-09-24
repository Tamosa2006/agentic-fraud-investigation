type StatusBadgeProps = {
  status: string;
};

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  let className = "status-badge";

  if (
    normalized.includes("fraud") ||
    normalized.includes("block")
  ) {
    className += " danger";
  }

  if (
    normalized.includes("legit") ||
    normalized.includes("no_action")
  ) {
    className += " success";
  }

  if (
    normalized.includes("uncertain") ||
    normalized.includes("escalate")
  ) {
    className += " warning";
  }

  return (
    <span className={className}>
      {status.replaceAll("_", " ")}
    </span>
  );
}