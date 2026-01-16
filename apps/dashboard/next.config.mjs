import withNextIntl from "next-intl/plugin";

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [ 
    "modules", 
  ],
};

export default withNextIntl()(nextConfig);
