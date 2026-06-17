import logo from "@/assets/nexafarm-logo.png.asset.json";

export function Logo({ size = 36, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src={logo.url}
        alt="NexaFarm"
        width={size}
        height={size}
        className="rounded-lg ring-1 ring-primary/40 shadow-[0_0_24px_oklch(0.82_0.22_155/0.45)]"
      />
      {withText && (
        <span className="text-lg font-bold tracking-tight">
          Nexa<span className="text-primary">Farm</span>
        </span>
      )}
    </div>
  );
}
