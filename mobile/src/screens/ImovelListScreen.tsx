import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useLayoutEffect } from 'react';
import { ActivityIndicator, Button, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import { ImovelCard } from '../components/imovel/ImovelCard';
import { useImoveis } from '../hooks/useImoveis';
import type { RootStackParamList } from '../navigation/types';
import type { Imovel } from '../types/imovel';

type Props = NativeStackScreenProps<RootStackParamList, 'ImovelList'>;
const keyExtractor = (item: Imovel): string => String(item.id);

export function ImovelListScreen({ navigation }: Props): React.JSX.Element {
  const { imoveis, carregamento, erro, temMais, atualizar, carregarMais } = useImoveis();
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <Button title="Novo" onPress={() => navigation.navigate('ImovelForm', {})} />,
    });
  }, [navigation]);
  const abrirDetalhe = useCallback((id: number) => {
    navigation.navigate('ImovelDetail', { id });
  }, [navigation]);
  const renderItem = useCallback(({ item }: ListRenderItemInfo<Imovel>) => (
    <ImovelCard imovel={item} onPress={() => abrirDetalhe(item.id)} />
  ), [abrirDetalhe]);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={[styles.lista, imoveis.length === 0 && styles.listaVazia]}
      data={imoveis}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      windowSize={7}
      alwaysBounceVertical
      refreshControl={<RefreshControl refreshing={carregamento === 'atualizacao'} onRefresh={atualizar} />}
      ListHeaderComponent={erro ? (
        <View style={styles.mensagem} accessibilityLiveRegion="polite">
          <Text style={styles.erro}>{erro}</Text>
          <Button title="Tentar novamente" onPress={atualizar} disabled={carregamento !== null} />
        </View>
      ) : null}
      ListEmptyComponent={
        <View style={styles.vazio}>
          {carregamento ? (
            <>
              <ActivityIndicator size="large" accessibilityLabel="Carregando imóveis" />
              <Text style={styles.texto}>Carregando imóveis…</Text>
            </>
          ) : !erro ? (
            <>
              <Text style={styles.titulo}>Nenhum imóvel cadastrado</Text>
              <Text style={styles.texto}>Os anúncios aparecerão aqui. Toque em Novo para cadastrar um imóvel.</Text>
            </>
          ) : null}
        </View>
      }
      ListFooterComponent={imoveis.length > 0 && temMais ? (
        <View style={styles.mensagem}>
          {carregamento === 'pagina'
            ? <ActivityIndicator accessibilityLabel="Carregando mais imóveis" />
            : <Button title="Carregar mais imóveis" onPress={carregarMais} disabled={carregamento !== null} />}
        </View>
      ) : null}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7f9' },
  lista: { padding: 16 },
  listaVazia: { flexGrow: 1 },
  vazio: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  mensagem: { gap: 12, paddingVertical: 16 },
  titulo: { fontSize: 20, fontWeight: '600', textAlign: 'center', color: '#172b3a' },
  texto: { textAlign: 'center', color: '#526576' },
  erro: { color: '#a32424', textAlign: 'center' },
});

export default ImovelListScreen;
