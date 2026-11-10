import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../../theme';

interface LoaderProps {
  message?: string;
  size?: 'small' | 'large';
}

export function Loader({ message, size = 'large' }: LoaderProps): React.JSX.Element {
  return (
    <View accessibilityRole="progressbar" style={styles.container}>
      <ActivityIndicator color={colors.accent} size={size} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 12, justifyContent: 'center', padding: 24 },
  message: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 14,
    textAlign: 'center',
  },
});
