/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
  common: {
    primary: '#0a7ea4',
    secondaryText: '#687076',
    border: '#D1D5DB',
    disabledButton: '#9CA3AF',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FFCC00',
    info: '#007AFF',
    white: '#FFFFFF', // Color blanco
    errorBackground: '#FFF1F0', // Fondo de error
    errorBorder: '#FFA39E', // Borde de error
    errorText: '#CF1322', // Texto de error
  },
};
