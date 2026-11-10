import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fonts, radii } from '../../theme';

interface ChipProps {
  label: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

export function Chip({
  label,
  onPress,
  selected = false,
  disabled = false,
  icon,
  style,
}: ChipProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selected,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon ? (
        <Ionicons
          color={selected ? colors.white : colors.muted}
          name={icon}
          size={15}
        />
      ) : null}
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    borderColor: colors.lineStrong,
    borderRadius: radii.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 14,
  },
  disabled: { opacity: 0.45 },
  label: {
    color: colors.inkSoft,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
  },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  selected: { backgroundColor: colors.ink, borderColor: colors.ink },
  selectedLabel: { color: colors.white, fontFamily: fonts.bodySemiBold },
});

export default Chip;
