/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['cdn3.iconfinder.com'],  // Add the domain to this array
    },
    productionBrowserSourceMaps: false
};

export default nextConfig;
