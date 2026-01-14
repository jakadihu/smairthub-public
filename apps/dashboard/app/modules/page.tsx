import { modules } from "@modules/registry";
import type { LocaleCode } from "@smairthub/i18n";

type ModulesPageProps = {
  params: {
    locale: LocaleCode;
  };
};

export default function ModulesPage({ params }: ModulesPageProps) {
  const locale = params.locale;

  return (
    <div className="grid grid-cols-3 gap-6 p-8">
      {modules.map((mod) => (
        <div key={mod.meta.id} className="border rounded-lg p-4 shadow">
          <h2 className="text-xl font-semibold mb-2">
            {mod.meta.name[locale]}
          </h2>

          <p className="text-gray-600 mb-4">
            {mod.meta.description[locale]}
          </p>

          <mod.Component locale={locale} />
        </div>
      ))}
    </div>
  );
}
