type EvidenceListProps = {
  evidence: string[];
};


export default function EvidenceList({
  evidence,
}: EvidenceListProps) {

  return (
    <div>

      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
        Evidence
      </h3>


      <div className="mt-4 space-y-3">

        {evidence.map((item, index) => (

          <div
            key={index}
            className="
              rounded-xl
              border
              border-white/5
              bg-black/20
              p-4
              text-sm
              leading-6
              text-slate-300
            "
          >

            <span className="mr-2 text-blue-400">
              {String(index + 1).padStart(2, "0")}
            </span>

            {item}

          </div>

        ))}

      </div>

    </div>
  );
}