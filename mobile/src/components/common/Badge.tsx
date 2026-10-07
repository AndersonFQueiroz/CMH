import { StyleSheet, Text, View } from 'react-native';

export type BadgeVariant = 'type' | 'purpose' | 'available' | 'unavailable';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'type' }: BadgeProps): React.JSX.Element {
  return (
    <View style={[styles.badge, VARIANT_STYLES[variant]]}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  available: { backgroundColor: '#E7F6EC' },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  label: { color: '#263238', fontSize: 12, fontWeight: '600' },
  purpose: { backgroundColor: '#E8F0FE' },
  type: { backgroundColor: '#F1F3F4' },
  unavailable: { backgroundColor: '#FCE8E6' },
});

const VARIANT_STYLES = {
  type: styles.type,
  purpose: styles.purpose,
  available: styles.available,
  unavailable: styles.unavailable,
} satisfies Record<BadgeVariant, object>;
