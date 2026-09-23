import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLayoutEffect } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '../navigation/types';
import { formatArea, formatDataBR, formatPreco } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'ImovelDetail'>;

// Mesmo mock da lista — só para provar lista → detalhe → edição (#16).
const MOCK_TITULOS: Record<number, string> = {
  1: 'Casa 3 quartos c/ quintal',
  2: 'Apartamento 2 quartos mobiliado',
};

export function ImovelDetailScreen({ navigation, route }: Props): React.JSX.Element {
  const { id } = route.params;
  const titulo = MOCK_TITULOS[id] ?? `Imóvel #${id}`;

  useLayoutEffect(() => {
    navigation.setOptions({ title: titulo });
  }, [navigation, titulo]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{titulo}</Text>
      <Text>ID: {id}</Text>
      <Text>{formatPreco(id === 2 ? 350000 : 2500, id === 2 ? 'venda' : 'aluguel')}</Text>
      <Text>{formatArea(id === 2 ? 65 : 120.5)}</Text>
      <Text>Disponível a partir de {formatDataBR('2026-10-01')}</Text>
      <View style={styles.actions}>
        <Button
          title="Editar"
          onPress={() => navigation.navigate('ImovelForm', { id })}
        />
        <Button title="Voltar" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  container: {
    flex: 1,
    gap: 6,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
});

export default ImovelDetailScreen;
