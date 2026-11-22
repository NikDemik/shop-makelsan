/**
 * Векторная иллюстрация ИБП (башенного исполнения) — для hero и пустых
 * состояний. Не привязана к конкретному товару.
 */
type Props = { className?: string; tone?: "dark" | "light" };

export default function UpsImage({ className = "", tone = "dark" }: Props) {
  const body = tone === "dark" ? "#1f2937" : "#e3e6ea";
  const bodyEdge = tone === "dark" ? "#2c3849" : "#c8cdd4";
  const panel = tone === "dark" ? "#10151d" : "#f6f7f9";
  const text = tone === "dark" ? "#9aa4b1" : "#626d7b";

  return (
    <svg viewBox="0 0 200 320" className={className} fill="none" aria-hidden="true">
      {/* корпус */}
      <rect x="30" y="16" width="140" height="288" rx="14" fill={body} stroke={bodyEdge} strokeWidth="2" />
      {/* верхняя вентрешётка */}
      <g stroke={text} strokeWidth="1.6" opacity="0.55">
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1="44" y1={30 + i * 6} x2="156" y2={30 + i * 6} />
        ))}
      </g>
      {/* дисплей */}
      <rect x="48" y="60" width="104" height="52" rx="8" fill={panel} />
      <rect x="56" y="70" width="88" height="20" rx="4" fill="#0a0e14" />
      <text x="100" y="85" textAnchor="middle" fontFamily="monospace" fontSize="14" fontWeight="700" fill="#f28232">
        220V
      </text>
      <circle cx="64" cy="102" r="3" fill="#4ade80" />
      <rect x="74" y="99" width="52" height="6" rx="3" fill={text} opacity="0.5" />
      {/* кнопка */}
      <circle cx="100" cy="134" r="10" fill={panel} stroke={bodyEdge} strokeWidth="2" />
      <path d="M100 129v10" stroke="#f28232" strokeWidth="2.4" strokeLinecap="round" />
      {/* логотип-импульс */}
      <path
        d="M44 176h14l6-20 9 34 8-24 4 8h27"
        stroke="#f28232"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* разъёмы */}
      <g fill={panel} stroke={bodyEdge} strokeWidth="1.6">
        <rect x="52" y="212" width="40" height="18" rx="4" />
        <rect x="108" y="212" width="40" height="18" rx="4" />
        <rect x="52" y="240" width="40" height="18" rx="4" />
        <rect x="108" y="240" width="40" height="18" rx="4" />
      </g>
      {/* нижняя вентрешётка */}
      <g stroke={text} strokeWidth="1.6" opacity="0.55">
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="44" y1={272 + i * 5} x2="156" y2={272 + i * 5} />
        ))}
      </g>
      {/* ножки */}
      <rect x="42" y="304" width="24" height="8" rx="3" fill={bodyEdge} />
      <rect x="134" y="304" width="24" height="8" rx="3" fill={bodyEdge} />
    </svg>
  );
}
