import GlassCard from "../ui/GlassCard";
import VerdictCard from "./VerdictCard";
import EvidenceList from "./EvidenceList";
import ReasoningCard from "./ReasoningCard";
import PolicyCard from "./PolicyCard";

type InvestigationResult = {
  verdict: "fraud" | "legit" | "unknown";
  recommended_action: string;
  confidence: number;
  approval_route: string;
  evidence: string[];
  reasoning: string[];
  policy_reason?: string | null;
  action_allowed: boolean;
  requires_approval: boolean;
};

type InvestigationPanelProps = {
  caseId: string;
  result: InvestigationResult;
};


export default function InvestigationPanel({
  caseId,
  result,
}: InvestigationPanelProps) {

  return (
    <section className="mt-12 pb-20">

      <GlassCard
        className="
          p-6
          shadow-2xl
          shadow-black/20
          md:p-8
        "
      >

        <div
          className="
            flex
            flex-col
            gap-5
            border-b
            border-white/10
            pb-6
            md:flex-row
            md:items-center
            md:justify-between
          "
        >

          <div>

            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Investigation Complete
            </p>

            <h2 className="mt-2 text-3xl font-semibold">
              {caseId}
            </h2>

          </div>


          <div className="text-right">

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Next Best Action
            </p>

            <p className="mt-2 text-lg font-medium text-blue-400">
              {result.recommended_action}
            </p>

          </div>

        </div>


        <div
          className="
            mt-6
            grid
            gap-4
            md:grid-cols-3
          "
        >

          <VerdictCard result={result} />


          <GlassCard className="p-5">

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Confidence
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {(result.confidence * 100).toFixed(0)}
              <span className="text-lg text-slate-500">
                %
              </span>
            </p>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">

              <div
                className="h-full rounded-full bg-blue-500"
                style={{
                  width: `${result.confidence * 100}%`,
                }}
              />

            </div>

          </GlassCard>


          <GlassCard className="p-5">

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Approval Route
            </p>

            <p className="mt-2 text-lg font-medium">
              {result.approval_route}
            </p>

          </GlassCard>

        </div>


        <div
          className="
            mt-8
            grid
            gap-8
            lg:grid-cols-2
          "
        >

          <EvidenceList
            evidence={result.evidence}
          />


          <div>

            <ReasoningCard
              reasoning={result.reasoning.join(" ")}
            />

            <PolicyCard
              result={result}
            />

          </div>

        </div>


        {result.policy_reason && (

          <div
            className="
              mt-6
              rounded-xl
              border
              border-blue-500/10
              bg-blue-500/5
              p-4
              text-sm
              text-slate-400
            "
          >

            <span className="font-medium text-blue-400">
              Policy:
            </span>

            {" "}

            {result.policy_reason}

          </div>

        )}

      </GlassCard>

    </section>
  );
}