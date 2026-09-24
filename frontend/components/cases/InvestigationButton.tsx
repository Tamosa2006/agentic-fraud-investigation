type InvestigationButtonProps = {
  caseId: string;
  loading: boolean;
  selectedCase: string | null;
  onInvestigate: (caseId: string) => void;
};


export default function InvestigationButton({
  caseId,
  loading,
  selectedCase,
  onInvestigate,
}: InvestigationButtonProps) {

  const active =
    loading && selectedCase === caseId;


  return (
    <button
      onClick={() => onInvestigate(caseId)}
      disabled={loading}
      className="
        shrink-0
        rounded-xl
        border
        border-blue-500/30
        bg-blue-500/10
        px-4
        py-2
        text-sm
        font-medium
        text-blue-400
        transition
        hover:border-blue-400/50
        hover:bg-blue-500/20
        disabled:cursor-not-allowed
        disabled:opacity-40
      "
    >
      {active ? "Analyzing..." : "Investigate"}
    </button>
  );
}