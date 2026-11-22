import { ORDER_STATUS_LABELS } from "@/lib/format";

const STYLES: Record<string, string> = {
  NEW: "bg-accent-400/15 text-accent-600 border-accent-400/40",
  CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
  PAID: "bg-violet-100 text-violet-700 border-violet-200",
  SHIPPED: "bg-amber-100 text-amber-700 border-amber-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block border px-2.5 py-0.5 text-xs font-semibold ${
        STYLES[status] ?? "bg-gray-100 text-gray-600 border-gray-200"
      }`}
    >
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}
