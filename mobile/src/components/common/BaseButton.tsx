import Ionicons from '@expo/vector-icons/Ionicons';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native';

import { colors, fonts, radii } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'text';

interface BaseButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  title: string;
  variant?: ButtonVariant;
  isLoading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: PressableProps['style'];
}

export function BaseButton({
  title,
  variant = 'primary',
  isLoading = false,
  icon,
  disabled,
  style,
  ...pressableProps
}: BaseButtonProps): React.JSX.Element {
  const isDisabled = disabled || isLoading;
  const iconColor =
    variant === 'primary' || variant === 'destructive'
      ? colors.white
      : variant === 'text'
        ? colors.accent
        : colors.ink;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: isLoading, disabled: Boolean(isDisabled) }}
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
        <ActivityIndicator
          color={variant === 'primary' || variant === 'destructive' ? colors.white : colors.accent}
        />
      ) : (
        <>
          {icon ? <Ionicons color={iconColor} name={icon} size={19} /> : null}
          <Text
            style={[
              styles.label,
              variant === 'secondary' && styles.secondaryLabel,
              variant === 'text' && styles.textLabel,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  disabled: { opacity: 0.48 },
  destructive: { backgroundColor: colors.danger },
  label: {
    color: colors.white,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
  },
  pressed: { opacity: 0.86, transform: [{ scale: 0.985 }] },
  primary: { backgroundColor: colors.accent },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.lineStrong,
    borderWidth: 1,
  },
  secondaryLabel: { color: colors.ink },
  textButton: { backgroundColor: 'transparent', minHeight: 44 },
  textLabel: { color: colors.accent },
});

const VARIANT_STYLES = {
  destructive: styles.destructive,
  primary: styles.primary,
  secondary: styles.secondary,
  text: styles.textButton,
} satisfies Record<ButtonVariant, object>;
