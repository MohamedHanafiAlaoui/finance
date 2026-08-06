const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Firebase 10 workaround: ensure .cjs and .mjs resolve before .js
// We reorder the default extensions rather than replacing them, to preserve
// CSS/SCSS support that Expo SDK 57 includes out of the box.
const exts = config.resolver.sourceExts;
const reorder = (ext) => {
  const i = exts.indexOf(ext);
  if (i > -1) exts.splice(i, 1);
  // Insert after tsx but before js
  const jsIdx = exts.indexOf('js');
  exts.splice(jsIdx > -1 ? jsIdx : 0, 0, ext);
};
reorder('cjs');
reorder('mjs');
config.resolver.sourceExts = exts;

module.exports = config;
