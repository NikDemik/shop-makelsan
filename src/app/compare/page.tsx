import type { Metadata } from "next";
import CompareView from "@/components/CompareView";

export const metadata: Metadata = {
  title: "Сравнение товаров",
  robots: { index: false },
};

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-site px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="heading-caps text-3xl sm:text-5xl" data-reveal="heading">Сравнение</h1>
      <div className="mt-8">
        <CompareView />
      </div>
    </div>
  );
}
