import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../../theme';

interface SectionTitleProps {
  children: string;
}

/** Título de seção com filete de acento, usado nas telas de detalhe e formulário. */
export function SectionTitle({ children }: SectionTitleProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.rule} />
      <Text accessibilityRole="header" style={styles.title}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flexDirection: 'row', gap: 9 },
  rule: { backgroundColor: colors.accent, borderRadius: 2, height: 17, width: 3 },
  title: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 18,
    letterSpacing: -0.25,
  },
});
