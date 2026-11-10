import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii } from '../../theme';

export interface PickerOption<T extends string> {
  label: string;
  value: T;
}

interface OptionPickerProps<T extends string> {
  label: string;
  options: PickerOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  error?: string;
  disabled?: boolean;
}

/** Seletor de opção única em chips (usado para `tipo` e `finalidade`). */
export function OptionPicker<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
  disabled = false,
}: OptionPickerProps<T>): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View aria-label={label} role="radiogroup" style={styles.options}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              aria-checked={selected}
              aria-disabled={disabled}
              aria-label={option.label}
              disabled={disabled}
              key={option.value}
              onPress={() => onChange(option.value)}
              role="radio"
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipSelected,
                error && !selected && styles.chipError,
                pressed && !disabled && styles.pressed,
                disabled && styles.disabled,
              ]}
            >
              <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.lineStrong,
    borderRadius: radii.sm,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
  },
  chipError: { borderColor: colors.danger },
  chipLabel: {
    color: colors.inkSoft,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
  },
  chipLabelSelected: { color: colors.white, fontFamily: fonts.bodySemiBold },
  chipSelected: { backgroundColor: colors.ink, borderColor: colors.ink },
  container: { gap: 7 },
  disabled: { opacity: 0.45 },
  error: { color: colors.danger, fontFamily: fonts.body, fontSize: 12.5 },
  label: {
    color: colors.inkSoft,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
  },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.985 }] },
});

export default OptionPicker;
