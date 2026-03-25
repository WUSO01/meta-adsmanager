import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: 'Meta 广告数据提取器',
  version: pkg.version,
  description: pkg.description,
  icons: {
    48: 'public/logo.png',
  },
  action: {
    default_icon: {
      48: 'public/logo.png',
    },
    default_popup: 'src/popup/index.html',
    default_title: "Meta 广告数据提取器"
  },
  permissions: [
    "tabs",
    'sidePanel',
    'contentSettings',
    "activeTab",
    "scripting",
    "downloads",
    "storage",
  ],
  content_scripts: [{
    js: ['src/content/index.ts'],
    matches: ["*://adsmanager.facebook.com/*", "*://business.facebook.com/*"],
  }],
  background: {
    service_worker: 'src/background/service-worker.ts',
  },
  side_panel: {
    default_path: 'src/sidepanel/index.html',
  },
})
