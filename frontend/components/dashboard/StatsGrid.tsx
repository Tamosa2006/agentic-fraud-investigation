import GlassCard from "../ui/GlassCard";


type StatsGridProps = {
  totalCases: number;
};


export default function StatsGrid({
  totalCases,
}: StatsGridProps) {

  const stats = [
    {
      label: "Total Cases",
      value: totalCases.toString(),
    },
    {
      label: "Investigation Engine",
      value: "Gemini",
    },
    {
      label: "Graph Intelligence",
      value: "TigerGraph",
    },
    {
      label: "Policy Layer",
      value: "Active",
    },
  ];


  return (
    <section
      className="
        mt-8
        grid
        gap-4
        sm:grid-cols-2
        lg:grid-cols-4
      "
    >

      {stats.map((stat) => (

        <GlassCard
          key={stat.label}
          className="stat-card p-5"
        >

          <p
            className="
              text-xs
              uppercase
              tracking-wider
              text-slate-500
            "
          >
            {stat.label}
          </p>

          <p
            className={`
              mt-2
              text-xl
              font-semibold
              ${
                stat.value === "Active"
                  ? "text-emerald-400"
                  : "text-white"
              }
            `}
          >
            {stat.value}
          </p>

        </GlassCard>

      ))}

    </section>
  );
}