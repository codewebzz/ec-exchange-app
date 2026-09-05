import packageJson from '../../package.json';

export const APP_CONFIG = {
  version: packageJson.version || '1.0',
  downloadApkUrl: 'https://jc110.online/api/app/download-apk',
};
