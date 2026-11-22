export function formatPrice(kopecks: number): string {
  return (
    (kopecks / 100).toLocaleString("ru-RU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " ₽"
  );
}

export function formatPriceShort(kopecks: number): string {
  return (
    (kopecks / 100).toLocaleString("ru-RU", {
      maximumFractionDigits: 0,
    }) + " ₽"
  );
}

export function formatKva(kva: number): string {
  const s = Number.isInteger(kva) ? String(kva) : String(kva).replace(".", ",");
  return s + " кВА";
}

export function formatPower(kw: number): string {
  const s = Number.isInteger(kw) ? String(kw) : String(kw).replace(".", ",");
  return s + " кВт";
}

export function pluralModels(n: number): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "модель";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "модели";
  return "моделей";
}

export function pluralGoods(n: number): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "товар";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "товара";
  return "товаров";
}

export function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(d: Date | string): string {
  return new Date(d).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  NEW: "Новый",
  CONFIRMED: "Подтверждён",
  PAID: "Оплачен",
  SHIPPED: "Отправлен",
  COMPLETED: "Выполнен",
  CANCELLED: "Отменён",
};

export const DELIVERY_LABELS: Record<string, string> = {
  pickup: "Самовывоз со склада (Москва)",
  tc: "Транспортная компания",
};

export const PAYMENT_LABELS: Record<string, string> = {
  card: "Банковской картой онлайн",
  receipt: "При получении",
  invoice: "Счёт на оплату (безналичный расчёт)",
};

/**
 * Итоговая цена товара в копейках: ручная цена админа → акционная → обычная.
 * null — цена по запросу.
 */
export function effectivePriceKopecks(p: {
  priceOverrideKopecks?: number | null;
  priceKopecks?: number | null;
  saleKopecks?: number | null;
}): number | null {
  if (p.priceOverrideKopecks != null) return p.priceOverrideKopecks;
  if (p.saleKopecks != null) return p.saleKopecks;
  return p.priceKopecks ?? null;
}

/** Короткая метка типа ИБП для бейджей/фильтров */
export const UPS_TYPE_LABELS: Record<string, string> = {
  "двойного преобразования (on-line)": "On-line (двойное преобразование)",
  "линейно-интерактивный (line-interactive)": "Линейно-интерактивный",
};

/** Категории файлов документации → человекочитаемые названия */
export const FILE_CAT_LABELS: Record<string, string> = {
  tech: "Техническое описание",
  instruction: "Инструкции и руководства",
  software: "ПО и драйверы",
  certificate: "Сертификаты",
  presentation: "Презентации",
  project: "Проектные решения",
  drawing: "Чертежи и схемы",
  passport: "Паспорта",
  price: "Прайс-листы",
  catalog: "Каталоги",
  other: "Прочее",
};
