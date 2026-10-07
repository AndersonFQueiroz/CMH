import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface LoaderProps {
  message?: string;
  size?: 'small' | 'large';
}

export function Loader({ message, size = 'large' }: LoaderProps): React.JSX.Element {
  return (
    <View accessibilityRole="progressbar" style={styles.container}>
      <ActivityIndicator color="#174EA6" size={size} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 10, justifyContent: 'center', padding: 20 },
  message: { color: '#4B5359', fontSize: 14, textAlign: 'center' },
});
