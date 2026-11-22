type Props = {
  data: { label: string; value: number }[];
  title: string;
  suffix?: string;
};

/** Компактный SVG-график (столбцы) без внешних зависимостей. */
export default function BarChart({ data, title, suffix = " ₽" }: Props) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const W = 100;
  const H = 46;

  return (
    <div className="border border-line bg-white p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">{title}</h3>
        <span className="text-xs text-muted">за 14 дней</span>
      </div>
      <div className="mt-5 flex h-44 items-end gap-[3px]">
        {data.map((d, i) => {
          const hPct = (d.value / max) * 100;
          const hasValue = d.value > 0;
          return (
            <div key={i} className="group relative flex h-full flex-1 items-end">
              <div
                className={`w-full rounded-t transition-all ${
                  hasValue ? "bg-accent-400 group-hover:bg-accent-500" : "bg-line"
                }`}
                style={{ height: `${Math.max(hPct, hasValue ? 3 : 1.5)}%` }}
              />
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap bg-brand-950 px-2.5 py-1.5 text-[11px] font-semibold text-accent-300 group-hover:block">
                {d.label}: {d.value.toLocaleString("ru-RU")}{suffix}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
      <svg className="hidden" width={W} height={H} aria-hidden />
    </div>
  );
}
