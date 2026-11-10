import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const colors = {
  accent: '#0D6B5A',
  accentDark: '#095447',
  accentSoft: '#D8E9E3',
  accentTint: '#EEF5F2',
  available: '#2F6B4F',
  availableSoft: '#DDEDE3',
  bg: '#F3F5F2',
  bgDeep: '#E7ECE8',
  danger: '#A64337',
  dangerSoft: '#F6E4E0',
  ink: '#111C1A',
  inkSoft: '#33413E',
  line: '#DCE3DE',
  lineStrong: '#C3CEC8',
  muted: '#697571',
  overlay: 'rgba(9, 20, 18, 0.55)',
  overlaySoft: 'rgba(9, 20, 18, 0.10)',
  surface: '#FFFFFF',
  unavailable: '#A35B3B',
  unavailableSoft: '#F4E6DD',
  white: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

export const radii = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 28,
  pill: 999,
} as const;

export const fonts = {
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodySemiBold: 'DMSans_600SemiBold',
  bodyBold: 'DMSans_700Bold',
  display: 'SpaceGrotesk_600SemiBold',
  displayBold: 'SpaceGrotesk_700Bold',
  displayMedium: 'SpaceGrotesk_500Medium',
} as const;

export const type = {
  caption: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  body: {
    color: colors.inkSoft,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
  },
  label: {
    color: colors.inkSoft,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    color: colors.ink,
    fontFamily: fonts.bodySemiBold,
    fontSize: 17,
    lineHeight: 23,
  },
  display: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 30,
    letterSpacing: -0.8,
    lineHeight: 34,
  },
} satisfies Record<string, TextStyle>;

export const shadows = {
  floating: Platform.select<ViewStyle>({
    android: { elevation: 6 },
    ios: {
      shadowColor: '#0B1F1B',
      shadowOffset: { height: 8, width: 0 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
    },
    default: {},
  }),
  soft: Platform.select<ViewStyle>({
    android: { elevation: 2 },
    ios: {
      shadowColor: '#0B1F1B',
      shadowOffset: { height: 4, width: 0 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    default: {},
  }),
};
