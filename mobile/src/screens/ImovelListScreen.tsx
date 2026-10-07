import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLayoutEffect } from 'react';
import { Button, FlatList, StyleSheet } from 'react-native';

import { ImovelCard } from '../components/imovel/ImovelCard';
import type { RootStackParamList } from '../navigation/types';
import type { Imovel } from '../types/imovel';

type Props = NativeStackScreenProps<RootStackParamList, 'ImovelList'>;

// RASCUNHO (#16, navegação apenas): mock local com tipo próprio para
// validar o fluxo lista → detalhe → edição sem backend e sem invadir
// a #17 (tipos canônicos) nem as telas reais (#19/#21). Será substituído.
type MockImovelResumo = Pick<
  Imovel,
  'id' | 'titulo' | 'cidade' | 'preco' | 'tipo' | 'finalidade' | 'disponivel' | 'foto_url'
>;

const MOCK_IMOVEIS: MockImovelResumo[] = [
  {
    id: 1,
    titulo: 'Casa 3 quartos c/ quintal',
    cidade: 'Praia Grande/SP',
    preco: 2500,
    tipo: 'casa',
    finalidade: 'aluguel',
    disponivel: true,
    foto_url: null,
  },
  {
    id: 2,
    titulo: 'Apartamento 2 quartos mobiliado',
    cidade: 'São Vicente/SP',
    preco: 350000,
    tipo: 'apartamento',
    finalidade: 'venda',
    disponivel: false,
    foto_url: null,
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
    <ImovelCard
      imovel={item}
      onPress={() => navigation.navigate('ImovelDetail', { id: item.id })}
    />
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
  list: {
    padding: 16,
  },
});

export default ImovelListScreen;
