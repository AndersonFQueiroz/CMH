import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

interface BaseInputProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function BaseInput({
  label,
  error,
  containerStyle,
  style,
  ...textInputProps
}: BaseInputProps): React.JSX.Element {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#687078"
        style={[styles.input, error && styles.inputError, style]}
        {...textInputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  error: { color: '#B3261E', fontSize: 13 },
  input: {
    backgroundColor: '#fff',
    borderColor: '#C7CDD1',
    borderRadius: 10,
    borderWidth: 1,
    color: '#202124',
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  inputError: { borderColor: '#B3261E' },
  label: { color: '#30363B', fontSize: 14, fontWeight: '600' },
});
