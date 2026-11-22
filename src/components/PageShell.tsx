import type { ReactNode } from "react";
import TextPageLayout from "@/components/TextPageLayout";
import SideNav from "@/components/SideNav";
import { INFO_PAGES } from "@/lib/info-pages";

export type PageShellSection = { id: string; title: string; content: ReactNode };

/** Общая обёртка контентных страниц (доставка, гарантия, о компании и т.д.) */
export default function PageShell({
  title,
  lead,
  sections,
}: {
  title: string;
  lead?: string;
  sections: PageShellSection[];
}) {
  return (
    <TextPageLayout
      leftNav={<SideNav title="Информация" items={INFO_PAGES} />}
      toc={sections.map(({ id, title: sectionTitle }) => ({ id, title: sectionTitle }))}
    >
      <h1 className="heading-caps text-3xl sm:text-5xl" data-reveal="heading">{title}</h1>
      {lead && <p className="mt-4 text-base leading-relaxed text-muted" data-reveal="up" data-reveal-delay="80">{lead}</p>}
      <div className="mt-8 space-y-6">
        {sections.map((section) => (
          <PageSection key={section.id} id={section.id} title={section.title}>
            {section.content}
          </PageSection>
        ))}
      </div>
    </TextPageLayout>
  );
}

export function PageSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div id={id} className="scroll-mt-24 border border-line bg-white p-6 sm:p-8" data-reveal="up">
      <h2 className="heading-caps text-lg">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted">{children}</div>
    </div>
  );
}

export function PageList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((li) => (
        <li key={li} className="flex items-start gap-2.5">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-accent-400" />
          {li}
        </li>
      ))}
    </ul>
  );
}
