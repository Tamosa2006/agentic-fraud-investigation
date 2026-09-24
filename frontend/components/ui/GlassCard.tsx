type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
};


export default function GlassCard({
  children,
  className = "",
}: GlassCardProps) {

  return (
    <div
      className={`
        rounded-2xl
        border
        border-white/10
        bg-white/[0.03]
        backdrop-blur-xl
        ${className}
      `}
    >
      {children}
    </div>
  );
}