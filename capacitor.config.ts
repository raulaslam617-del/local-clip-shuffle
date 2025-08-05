import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.b5832d583a354f3a823808cc4de0e2c5',
  appName: 'local-clip-shuffle',
  webDir: 'dist',
  server: {
    url: 'https://b5832d58-3a35-4f3a-8238-08cc4de0e2c5.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;