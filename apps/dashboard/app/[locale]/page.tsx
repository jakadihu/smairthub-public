import { getTranslations } from "next-intl/server";
import { defaultLocale } from "@smairthub/i18n";

export default async function DashboardPage() {

  /*const locale = params.locale || defaultLocale;*/
  const t = await getTranslations("common");


  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{t("welcome")}</h2>
      <p className="text-gray-600">Válassz egy modult a bal oldali menüből.</p>
    </div>
  );
}
