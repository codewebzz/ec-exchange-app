// const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
// const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

// const defaultConfig = getDefaultConfig(__dirname);

// // Merge your custom config here if needed
// const mergedConfig = mergeConfig(defaultConfig, {
//   // Your custom config here if any
// });

// module.exports = wrapWithReanimatedMetroConfig(mergedConfig);
// metro.config.js
// const { getDefaultConfig } = require('metro-config');

// module.exports = (async () => {
//   const config = await getDefaultConfig();
//   config.watchFolders = [__dirname];
//   config.watch = {
//     usePolling: true,
//   };
//   return config;
// })();
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Enable polling
defaultConfig.watchFolders = [__dirname];
defaultConfig.server = {
  ...defaultConfig.server,
  unstable_watchOptions: {
    usePolling: true,
    interval: 1000, // you can tweak this
  },
};

const mergedConfig = mergeConfig(defaultConfig, {
  // You can add more custom config here if needed
});

module.exports = wrapWithReanimatedMetroConfig(mergedConfig);
