/** @type {import('next').NextConfig} */
const nextConfig = {
    // webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    //     // Add or modify webpack configuration to enable WebAssembly support
    //     config.experiments = {
    //       asyncWebAssembly: true, // Enable async WebAssembly support
    //     };
    
    //     // Return the modified configuration
    //     return config;
    //   },
    logging: {
        fetches: {
            fullUrl: true,
        }
    },
    images: {
        domains: ['cdn3.iconfinder.com'],  // Add the domain to this array
    },
    productionBrowserSourceMaps: false
};

export default nextConfig;
