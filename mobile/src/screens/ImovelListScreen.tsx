import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLayoutEffect } from 'react';
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '../navigation/types';
import { formatPreco } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'ImovelList'>;

// RASCUNHO (#16, navegação apenas): mock local com tipo próprio para
// validar o fluxo lista → detalhe → edição sem backend e sem invadir
// a #17 (tipos canônicos) nem as telas reais (#19/#21). Será substituído.
interface MockImovelResumo {
  id: number;
  titulo: string;
  cidade: string;
  preco: number;
  tipo: string;
  finalidade: 'venda' | 'aluguel';
}

const MOCK_IMOVEIS: MockImovelResumo[] = [
  {
    id: 1,
    titulo: 'Casa 3 quartos c/ quintal',
    cidade: 'Praia Grande/SP',
    preco: 2500,
    tipo: 'casa',
    finalidade: 'aluguel',
  },
  {
    id: 2,
    titulo: 'Apartamento 2 quartos mobiliado',
    cidade: 'São Vicente/SP',
    preco: 350000,
    tipo: 'apartamento',
    finalidade: 'venda',
  },
];

export function ImovelListScreen({ navigation }: Props): React.JSX.Element {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button title="Novo" onPress={() => navigation.navigate('ImovelForm', {})} />
      ),
    });
  }, [navigation]);

  const renderItem = ({ item }: { item: MockImovelResumo }): React.JSX.Element => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.titulo}</Text>
      <Text>
        {formatPreco(item.preco, item.finalidade)} · {item.cidade}
      </Text>
      <Text style={styles.badges}>
        {item.tipo} · {item.finalidade}
      </Text>
      <Button
        title="Ver detalhe"
        onPress={() => navigation.navigate('ImovelDetail', { id: item.id })}
      />
    </View>
  );

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={MOCK_IMOVEIS}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  badges: {
    color: '#555',
    marginBottom: 8,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    marginBottom: 12,
    padding: 12,
  },
  list: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ImovelListScreen;
