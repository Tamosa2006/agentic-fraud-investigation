import SystemStatus from "./SystemStatus";


export default function DashboardHeader() {

  return (
    <header
      className="
        flex
        flex-col
        gap-6
        border-b
        border-white/10
        pb-8
        md:flex-row
        md:items-center
        md:justify-between
      "
    >

      <div>

        <div className="mb-3 flex items-center gap-3">

          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-blue-400/20
              bg-blue-500/10
              text-xl
            "
          >
            🛡️
          </div>

          <span
            className="
              text-xs
              font-medium
              uppercase
              tracking-[0.25em]
              text-blue-400
            "
          >
            AI Security Operations
          </span>

        </div>


        <h1
          className="
            text-4xl
            font-semibold
            tracking-tight
            md:text-5xl
          "
        >
          Fraud Investigation
          <span className="text-slate-500">
            {" "}Agent
          </span>
        </h1>


        <p className="mt-3 text-sm text-slate-400">

          Autonomous investigation powered by{" "}

          <span className="text-slate-200">
            Gemini
          </span>

          {" "}and{" "}

          <span className="text-slate-200">
            TigerGraph
          </span>

        </p>

      </div>


      <SystemStatus />

    </header>
  );
}