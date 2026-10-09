// plugins/withAndroidWindowBackground.js
const { withAndroidStyles } = require('expo/config-plugins');

/**
 * Expo Config Plugin to ensure AppTheme in Android styles.xml always includes
 * <item name="android:windowBackground">@color/splashscreen_background</item>
 * to prevent native white flashes during screen transitions on Android.
 */
const withAndroidWindowBackground = (config) => {
  return withAndroidStyles(config, (modConfig) => {
    const { resources } = modConfig.modResults;
    const styles = resources.style || [];

    const appTheme = styles.find((s) => s.$ && s.$.name === 'AppTheme');
    if (appTheme) {
      if (!appTheme.item) {
        appTheme.item = [];
      }

      const hasWindowBg = appTheme.item.some(
        (item) => item.$ && item.$.name === 'android:windowBackground'
      );

      if (!hasWindowBg) {
        appTheme.item.push({
          $: { name: 'android:windowBackground' },
          _: '@color/splashscreen_background',
        });
      }
    }

    return modConfig;
  });
};

module.exports = withAndroidWindowBackground;
