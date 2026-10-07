import { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

interface ImovelAvatarProps {
  fotoUrl: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function ImovelAvatar({
  fotoUrl,
  size = 88,
  style,
}: ImovelAvatarProps): React.JSX.Element {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(fotoUrl) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [fotoUrl]);

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={showImage ? 'Foto do imóvel' : 'Imóvel sem foto'}
      style={[styles.container, { height: size, width: size }, style]}
    >
      {showImage && fotoUrl ? (
        <Image
          accessibilityLabel="Foto do imóvel"
          onError={() => setImageFailed(true)}
          resizeMode="cover"
          source={{ uri: fotoUrl }}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <Text accessibilityLabel="Ícone de casa" style={styles.fallback}>
          🏠
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#E8F0FE',
    borderRadius: 12,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fallback: { fontSize: 38 },
});
