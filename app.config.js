import os from 'os';

// Function to auto-detect your local machine's Wi-Fi / Ethernet IPv4 address
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      // Skip internal (127.0.0.1) and non-IPv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
} 

export default ({ config }) => {
  const isDev = process.env.NODE_ENV !== 'production';
  const localIp = getLocalIpAddress();

  // Define API endpoint dynamically based on environment
  const apiUrl = isDev
    ? `http://${localIp}:4000`
    : 'https://api.streamasap.com'; // Production URL

  return {
    ...config, // Preserves all static set
    // tings from app.json
    plugins: [
      ...(config.plugins || []),
      [
        'expo-video',
        {
          supportsBackgroundPlayback: true,
          supportsPictureInPicture: true,
        },
      ],
    ],
    extra: {
      ...config.extra,
      apiUrl,
      environment: isDev ? 'development' : 'production',
    },
  };
};