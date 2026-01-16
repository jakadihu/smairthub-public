import { panels } from "@panels/registry";
import { notFound } from "next/navigation";

export default async function ModulePage({
  params,
}: {
  params: { locale: string; panel: string };
}) {
  const { locale, panel: slug } = await params;

  const pan = panels.find((p) => p.meta.slug === slug);
  if (!pan) return notFound();

  const Component = pan.meta.component;

  return (
    <div className="p-6">
      <Component locale={locale} />
    </div>
  );
}
