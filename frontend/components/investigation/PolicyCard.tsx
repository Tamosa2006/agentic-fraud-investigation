type InvestigationResult = {
  action_allowed: boolean;
  requires_approval: boolean;
  approval_route: string;
};

type PolicyCardProps = {
  result: InvestigationResult;
};


export default function PolicyCard({
  result,
}: PolicyCardProps) {

  return (
    <div
      className="
        mt-4
        rounded-xl
        border
        border-white/5
        bg-black/20
        p-5
      "
    >

      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
        Policy Check
      </h3>


      <div className="mt-4 space-y-3 text-sm">

        <div className="flex justify-between">

          <span className="text-slate-500">
            Action allowed
          </span>

          <span
            className={
              result.action_allowed
                ? "text-emerald-400"
                : "text-red-400"
            }
          >
            {result.action_allowed ? "YES" : "NO"}
          </span>

        </div>


        <div className="flex justify-between">

          <span className="text-slate-500">
            Human approval
          </span>

          <span className="text-yellow-400">
            {result.requires_approval
              ? "REQUIRED"
              : "NOT REQUIRED"}
          </span>

        </div>


        <div className="flex justify-between">

          <span className="text-slate-500">
            Route
          </span>

          <span className="text-slate-300">
            {result.approval_route}
          </span>

        </div>

      </div>

    </div>
  );
}