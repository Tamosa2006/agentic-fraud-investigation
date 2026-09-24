import GlassCard from "../ui/GlassCard";


type VerdictCardProps = {
  result: {
    verdict: "fraud" | "legit" | "unknown";
  };
};


export default function VerdictCard({
  result,
}: VerdictCardProps) {

  const fraud = result.verdict === "fraud";
  const legit = result.verdict === "legit";


  const color = fraud
    ? "text-red-400"
    : legit
      ? "text-emerald-400"
      : "text-yellow-400";


  return (
    <GlassCard className="p-5">

      <p className="text-xs uppercase tracking-wider text-slate-500">
        Verdict
      </p>

      <p className={`mt-2 text-3xl font-semibold ${color}`}>
        {result.verdict.toUpperCase()}
      </p>

    </GlassCard>
  );
}