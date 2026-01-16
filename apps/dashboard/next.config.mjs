import withNextIntl from "next-intl/plugin";

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [ 
    "panels", 
  ],
};

export default withNextIntl()(nextConfig);
