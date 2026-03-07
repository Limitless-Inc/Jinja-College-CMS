import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jinjacollege.cms',
  appName: 'Jinja College CMS',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
