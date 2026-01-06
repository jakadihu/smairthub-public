import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {
  const safeLocale = locale || "hu";

  return {
    locale: safeLocale,
    messages: {
      common: (await import(`../messages/${safeLocale}/common.json`)).default      
    }
  };
});
