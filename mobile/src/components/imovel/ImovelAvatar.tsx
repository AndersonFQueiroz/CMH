import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radii } from '../../theme';

interface ImovelAvatarProps {
  fotoUrl: string | null;
  size?: number;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
}

export function ImovelAvatar({
  fotoUrl,
  size = 88,
  iconSize = 34,
  style,
}: ImovelAvatarProps): React.JSX.Element {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(fotoUrl) && !imageFailed;
  const flatStyle = StyleSheet.flatten(style);
  const hasCustomSize =
    flatStyle?.aspectRatio !== undefined ||
    flatStyle?.height !== undefined ||
    flatStyle?.width !== undefined;

  useEffect(() => {
    setImageFailed(false);
  }, [fotoUrl]);

  return (
    <View
      accessibilityLabel={showImage ? 'Foto do imóvel' : 'Imóvel sem foto'}
      accessibilityRole="image"
      style={[styles.container, !hasCustomSize && { height: size, width: size }, style]}
    >
      {showImage && fotoUrl ? (
        <Image
          accessibilityLabel="Foto do imóvel"
          fadeDuration={160}
          onError={() => setImageFailed(true)}
          resizeMode="cover"
          source={{ uri: fotoUrl }}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <Ionicons color={colors.accent} name="home-outline" size={iconSize} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.accentTint,
    borderRadius: radii.lg,
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
