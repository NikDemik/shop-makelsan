"use client";

import { useCompare, COMPARE_LIMIT, type CompareItem } from "@/lib/compare";
import { IconCompare, IconCheck } from "@/components/icons";

type Props = {
  item: CompareItem;
  /** compact — иконка-квадрат для карточки товара */
  compact?: boolean;
};

/** Кнопка-переключатель «К сравнению» */
export default function CompareButton({ item, compact }: Props) {
  const items = useCompare((s) => s.items);
  const toggle = useCompare((s) => s.toggle);

  const inCompare = items.some((i) => i.slug === item.slug);
  const isFull = items.length >= COMPARE_LIMIT;
  const disabled = !inCompare && isFull;

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => toggle(item)}
        disabled={disabled}
        title={
          inCompare
            ? "Убрать из сравнения"
            : isFull
              ? `В сравнении уже ${COMPARE_LIMIT} товара`
              : "Добавить к сравнению"
        }
        aria-label={inCompare ? "Убрать из сравнения" : "Добавить к сравнению"}
        aria-pressed={inCompare}
        className={`flex h-9 w-9 shrink-0 items-center justify-center border transition ${
          inCompare
            ? "border-accent-400 bg-accent-400/10 text-accent-600"
            : "border-line bg-white text-muted hover:border-accent-400 hover:text-accent-600"
        } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
      >
        {inCompare ? <IconCheck className="h-4 w-4" /> : <IconCompare className="h-4.5 w-4.5" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(item)}
      disabled={disabled}
      title={
        inCompare
          ? "Убрать из сравнения"
          : isFull
            ? `В сравнении уже ${COMPARE_LIMIT} товара`
            : undefined
      }
      className={`flex items-center justify-center gap-2 border px-5 py-3.5 text-sm font-semibold transition ${
        inCompare
          ? "border-accent-400 bg-accent-400/10 text-accent-600"
          : "border-line text-ink hover:border-accent-400 hover:text-accent-600"
      } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
    >
      {inCompare ? (
        <>
          <IconCheck className="h-4.5 w-4.5" /> В сравнении
        </>
      ) : (
        <>
          <IconCompare className="h-4.5 w-4.5" /> К сравнению
        </>
      )}
    </button>
  );
}
