import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import YandexMap from "@/components/YandexMap";
import { SITE_ADDRESS, SITE_EMAIL, SITE_PHONE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Контакты",
  description:
    "Контакты MAKELSAN Маркет: 8 800 505-10-10 (звонок по России бесплатный), sales@makelsan-ups.ru. Склад и шоурум: Москва, ул. Электрозаводская, д. 21, стр. 4. Пн–пт 9:00–18:00.",
  alternates: { canonical: "/contacts" },
};

export default function ContactsPage() {
  return (
    <PageShell
      title="Контакты"
      lead="Отвечаем на звонки и письма в будни с 9:00 до 18:00. Подберём ИБП, подготовим КП и счёт в течение рабочего дня."
      sections={[
        {
          id: "sales",
          title: "Отдел продаж",
          content: (
            <>
              <p>
                Телефон:{" "}
                <a href="tel:+78005051010" className="font-bold text-accent-600">
                  {SITE_PHONE}
                </a>{" "}
                — звонок по России бесплатный
              </p>
              <p>
                E-mail:{" "}
                <a href={`mailto:${SITE_EMAIL}`} className="font-bold text-accent-600">
                  {SITE_EMAIL}
                </a>
              </p>
            </>
          ),
        },
        {
          id: "warehouse",
          title: "Склад и шоурум",
          content: (
            <>
              <p>{SITE_ADDRESS}</p>
              <p>Режим работы: пн–пт, 9:00–18:00. Резерв товара на складе — до 5 рабочих дней.</p>
            </>
          ),
        },
        {
          id: "map",
          title: "Как нас найти",
          content: (
            <>
              <YandexMap />
              <p>Адрес для навигатора: {SITE_ADDRESS}. Склад и шоурум — в будни с 9:00 до 18:00.</p>
            </>
          ),
        },
        {
          id: "b2b",
          title: "Для юридических лиц",
          content: (
            <>
              <p>
                Работаем по договору: безналичная оплата по счёту, скидка 5% на заказ,
                закрывающие документы в течение дня. Присылайте реквизиты на{" "}
                <a href={`mailto:${SITE_EMAIL}`} className="font-semibold text-accent-600">
                  {SITE_EMAIL}
                </a>{" "}
                — подготовим коммерческое предложение.
              </p>
              <p>
                Готовы к заказу? <Link href="/register?type=b2b" className="font-semibold text-accent-600">Регистрация B2B</Link>{" "}
                открывает безналичную оплату и персонального менеджера.
              </p>
            </>
          ),
        },
        {
          id: "price-request",
          title: "Запрос цены на модель без цены",
          content: (
            <p>
              Если в карточке модели указано «Цена по запросу» — напишите нам название
              модели и количество. Коммерческое предложение направим в течение рабочего
              дня. Крупные проекты (ЦОД, промышленные объекты) просчитываем по спецификации.
            </p>
          ),
        },
      ]}
    />
  );
}
