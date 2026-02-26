import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.motomouthminiteam.app',
  appName: 'MMMT',
  webDir: 'dist',
  server: {
    // Allow the native app to reach the live backend
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'always',
  },
};

export default config;
