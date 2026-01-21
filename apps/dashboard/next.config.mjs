import withNextIntl from "next-intl/plugin";
import path from "path";

const nextConfig = {
  reactStrictMode: true,

  transpilePackages: ["@panels"],

  webpack: (config) => {
    config.resolve.alias["@panels"] = path.resolve(__dirname, "../../panels");
    return config;
  },

  async rewrites() {
    return [
      {
        source: "/animations/:path*",
        destination: "/animations/:path*",
        locale: false,
      },
    ];
  },
};

export default withNextIntl({
  localePrefix: "as-needed",
})(nextConfig);
