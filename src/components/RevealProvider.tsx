"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Scroll-reveal витрины: один IntersectionObserver на все элементы
 * с атрибутом data-reveal. Скрытие элемента до появления делает CSS
 * (селектор .js [data-reveal]) — класс .js ставит инлайновый скрипт
 * в layout до первой отрисовки, поэтому без JS (роботы, no-script)
 * контент виден полностью.
 *
 * Варианты: data-reveal="up" | "heading" | "img" (см. globals.css),
 * ступенчатая задержка — data-reveal-delay="120" (мс).
 *
 * Страховка: при быстрой прокрутке или прыжке по якорю элемент может
 * «перепрыгнуть» кадр и оказаться выше вьюпорта, не пересекшись с ним —
 * такие элементы дораскрываются проверкой на scroll (они всё равно за
 * кадром, визуальной резкости нет).
 *
 * Эффект перезапускается при смене маршрута: новые элементы страницы
 * наблюдаются заново и плавно появляются при входе в кадр.
 */
export default function RevealProvider() {
  const pathname = usePathname();

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const pending = new Set<HTMLElement>();

    const reveal = (el: HTMLElement) => {
      if (pending.delete(el)) el.classList.add("is-visible");
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target as HTMLElement);
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0, rootMargin: "0px 0px -40px 0px" }
    );

    for (const el of els) {
      if (el.classList.contains("is-visible")) continue;
      const delay = el.dataset.revealDelay;
      if (delay) el.style.setProperty("--reveal-delay", `${parseInt(delay, 10) || 0}ms`);
      pending.add(el);
      io.observe(el);
    }

    // Элементы выше вьюпорта (пропущенные при мгновенных прыжках) — сразу видимы
    const revealPassed = () => {
      if (!pending.size) return;
      for (const el of pending) {
        if (el.getBoundingClientRect().top < 0) {
          reveal(el);
          io.unobserve(el);
        }
      }
    };
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        revealPassed();
      });
    };
    revealPassed();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
