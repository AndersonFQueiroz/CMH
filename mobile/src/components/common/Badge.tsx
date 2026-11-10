import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii } from '../../theme';

export type BadgeVariant = 'type' | 'purpose' | 'available' | 'unavailable' | 'photo';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'type' }: BadgeProps): React.JSX.Element {
  return (
    <View style={[styles.badge, VARIANT_STYLES[variant]]}>
      <Text style={[styles.label, variant === 'photo' && styles.photoLabel]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  available: { backgroundColor: colors.availableSoft },
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radii.sm,
    justifyContent: 'center',
    minHeight: 28,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  label: {
    color: colors.inkSoft,
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
  },
  photo: {
    backgroundColor: 'rgba(9, 20, 18, 0.58)',
    borderColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
  },
  photoLabel: { color: colors.white },
  purpose: { backgroundColor: colors.ink },
  type: { backgroundColor: colors.accentTint },
  unavailable: { backgroundColor: colors.unavailableSoft },
});

const VARIANT_STYLES: Record<BadgeVariant, object> = {
  available: styles.available,
  photo: styles.photo,
  purpose: styles.purpose,
  type: styles.type,
  unavailable: styles.unavailable,
};
