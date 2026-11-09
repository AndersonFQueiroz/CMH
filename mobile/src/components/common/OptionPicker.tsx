import { Pressable, StyleSheet, Text, View } from 'react-native';

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
              role="radio"
              key={option.value}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipSelected,
                error && !selected && styles.chipError,
                pressed && styles.pressed,
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
    backgroundColor: '#fff',
    borderColor: '#C7CDD1',
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  chipError: { borderColor: '#B3261E' },
  chipLabel: { color: '#30363B', fontSize: 14, fontWeight: '500' },
  chipLabelSelected: { color: '#fff', fontWeight: '600' },
  chipSelected: { backgroundColor: '#174EA6', borderColor: '#174EA6' },
  container: { gap: 6 },
  disabled: { opacity: 0.55 },
  error: { color: '#B3261E', fontSize: 13 },
  label: { color: '#30363B', fontSize: 14, fontWeight: '600' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pressed: { opacity: 0.82 },
});

export default OptionPicker;
