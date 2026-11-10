import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '../../theme';

interface CobogoProps {
  columns?: number;
  rows?: number;
  size?: number;
  gap?: number;
  color?: string;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Padrão de cobogó (elemento da arquitetura modernista brasileira) usado como
 * textura discreta em estados vazios. É decorativo e não entra na árvore de
 * acessibilidade.
 */
export function Cobogo({
  columns = 5,
  rows = 3,
  size = 12,
  gap = 7,
  color = colors.accent,
  opacity = 0.18,
  style,
}: CobogoProps): React.JSX.Element {
  const cells = Array.from({ length: columns * rows });

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[
        styles.grid,
        { gap, opacity, width: columns * size + (columns - 1) * gap },
        style,
      ]}
    >
      {cells.map((_, index) => (
        <View
          key={index}
          style={{
            borderColor: color,
            borderRadius: 2,
            borderWidth: 1.5,
            height: size,
            width: size,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});

export default Cobogo;
