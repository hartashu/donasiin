/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, { isServer }) {
    // Hanya jalankan konfigurasi ini untuk build sisi server
    if (isServer) {
      // Cari tahu apakah ini build untuk Edge runtime (middleware)
      const isEdgeServer = config.resolve?.conditionNames?.includes('edge-light');

      if (isEdgeServer) {
        config.externals = config.externals || [];
        config.externals.push(
          '@mongodb-js/zstd',
          'kerberos',
          'mongodb-client-encryption',
          '@aws-sdk/credential-providers',
          'gcp-metadata',
          'snappy',
          'socks',
          'aws4'
        );
      }
    }

    return config;
  },
};

export default nextConfig;