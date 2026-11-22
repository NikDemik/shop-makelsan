import { IconPin } from "@/components/icons";
import { SITE_ADDRESS } from "@/lib/seo";

/** Ссылка на адрес офиса в Яндекс.Картах (работает и без скрипта карты). */
export const YMAPS_LINK = `https://yandex.ru/maps/?text=${encodeURIComponent(SITE_ADDRESS)}`;

/**
 * Блок Яндекс.Карты для страницы «Контакты».
 * Скрипт карты подключается позже: пока выводится заглушка с адресом
 * и ссылкой «Открыть в Яндекс.Картах». Когда скрипт появится, заменить
 * разметку заглушки на контейнер виджета (id="yandex-map") и загрузку
 * api-maps.yandex.ru.
 */
export default function YandexMap({ className = "" }: { className?: string }) {
  return (
    <a
      id="yandex-map"
      href={YMAPS_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex h-72 w-full flex-col items-center justify-center gap-3 overflow-hidden border border-white/10 bg-brand-950 text-center sm:h-96 ${className}`}
    >
      {/* Координатная сетка на месте будущей карты */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-accent-500/15 ring-1 ring-accent-400/40">
        <IconPin className="h-5 w-5 text-accent-400" />
      </span>
      <span className="relative text-sm font-semibold text-paper">{SITE_ADDRESS}</span>
      <span className="relative text-xs text-paper/60 transition group-hover:text-accent-300">
        Открыть в Яндекс.Картах →
      </span>
    </a>
  );
}
