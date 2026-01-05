import withNextIntl from "next-intl/plugin";

const nextConfig = {
  reactStrictMode: true
};

export default withNextIntl("../../next-intl.config.ts")(nextConfig);
