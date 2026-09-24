export default function SystemStatus() {

  return (
    <div
      className="
        flex
        items-center
        gap-3
        rounded-full
        border
        border-emerald-500/20
        bg-emerald-500/5
        px-4
        py-2
      "
    >

      <span
        className="
          h-2
          w-2
          animate-pulse
          rounded-full
          bg-emerald-400
        "
      />

      <span className="text-xs text-emerald-400">
        SYSTEM ONLINE
      </span>

    </div>
  );
}