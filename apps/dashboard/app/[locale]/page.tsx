import { getTranslations } from "next-intl/server";
import { defaultLocale, LocaleCode } from "@smairthub/i18n";
import { modules } from "@modules/registry";
import Link from "next/link";

export default async function DashboardPage({
  params,
}: {
  params: { locale: LocaleCode };
}) {


  const resolvedParams = await params;
  const locale = resolvedParams.locale || defaultLocale;
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t("welcome")}</h2>
      <p className="text-gray-600">Válassz egy modult a bal oldali menüből.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {modules
          .filter((m) => m.meta.visibility === "public")
          .sort((a, b) => a.meta.order - b.meta.order)
          .map((mod) => (
            <Link
              key={mod.meta.id}
              href={`/${locale}/${mod.meta.slug}`}
              className="block p-6 rounded-md border hover:shadow-lg transition bg-white dark:bg-black"
            >
              <div className="text-4xl mb-3">
                {mod.meta.icon === "table" ? "📊" : "📦"}
              </div>

              <h3 className="text-lg font-semibold">{mod.meta.name[locale]}</h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {mod.meta.description[locale]}
              </p>
            </Link>
          ))}
      </div>
    </div>
  );
}
