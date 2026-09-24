type ReasoningCardProps = {
  reasoning: string;
};


export default function ReasoningCard({
  reasoning,
}: ReasoningCardProps) {

  return (
    <div>

      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
        Agent Reasoning
      </h3>

      <div
        className="
          mt-4
          rounded-xl
          border
          border-white/5
          bg-black/20
          p-5
          text-sm
          leading-7
          text-slate-300
        "
      >
        {reasoning}
      </div>

    </div>
  );
}