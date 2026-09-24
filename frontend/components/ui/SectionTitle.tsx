type SectionTitleProps = {
  eyebrow: string;
  title: string;
  count?: number;
};


export default function SectionTitle({
  eyebrow,
  title,
  count,
}: SectionTitleProps) {

  return (
    <div className="flex items-end justify-between">

      <div>

        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-2xl font-semibold text-white">
          {title}
        </h2>

      </div>

      {count !== undefined && (

        <span className="text-sm text-slate-500">
          {count} records
        </span>

      )}

    </div>
  );
}