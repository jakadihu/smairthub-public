import { modules } from "@modules/registry";
import { notFound } from "next/navigation";

export default async function ModulePage({
  params,
}: {
  params: { locale: string; module: string };
}) {
  const { locale, module: slug } = await params;

  const mod = modules.find((m) => m.meta.slug === slug);
  if (!mod) return notFound();

  const Component = mod.meta.component;

  return (
    <div className="p-6">
      <Component locale={locale} />
    </div>
  );
}
