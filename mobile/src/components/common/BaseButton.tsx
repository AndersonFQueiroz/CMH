import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'text';

interface BaseButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: ButtonVariant;
  isLoading?: boolean;
}

export function BaseButton({
  title,
  variant = 'primary',
  isLoading = false,
  disabled,
  style,
  ...pressableProps
}: BaseButtonProps): React.JSX.Element {
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(isDisabled), busy: isLoading }}
      disabled={isDisabled}
      style={(state) => [
        styles.button,
        VARIANT_STYLES[variant],
        isDisabled && styles.disabled,
        state.pressed && !isDisabled && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...pressableProps}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#174EA6'} />
      ) : (
        <Text style={[styles.label, variant !== 'primary' && styles.alternativeLabel]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  disabled: { opacity: 0.55 },
  label: { color: '#fff', fontSize: 15, fontWeight: '600' },
  pressed: { opacity: 0.82 },
  primary: { backgroundColor: '#174EA6' },
  secondary: { backgroundColor: '#E8F0FE' },
  textButton: { backgroundColor: 'transparent' },
  alternativeLabel: { color: '#174EA6' },
});

const VARIANT_STYLES = {
  primary: styles.primary,
  secondary: styles.secondary,
  text: styles.textButton,
} satisfies Record<ButtonVariant, object>;
