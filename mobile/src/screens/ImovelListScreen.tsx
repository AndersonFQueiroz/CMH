import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BaseButton } from '../components/common/BaseButton';
import { BaseInput } from '../components/common/BaseInput';
import { Loader } from '../components/common/Loader';
import { ImovelCard } from '../components/imovel/ImovelCard';
import type { RootStackParamList } from '../navigation/types';
import imovelService from '../services/imovelService';
import type {
  FinalidadeImovel,
  Imovel,
  ImovelFiltros,
  TipoImovel,
} from '../types/imovel';

type Props = NativeStackScreenProps<RootStackParamList, 'ImovelList'>;

const ITENS_POR_PAGINA = 15;
const TIPOS: { label: string; value: TipoImovel }[] = [
  { label: 'Casa', value: 'casa' },
  { label: 'Apartamento', value: 'apartamento' },
  { label: 'Kitnet', value: 'kitnet' },
  { label: 'Comercial', value: 'comercial' },
  { label: 'Terreno', value: 'terreno' },
];
const FINALIDADES: { label: string; value: FinalidadeImovel }[] = [
  { label: 'Venda', value: 'venda' },
  { label: 'Aluguel', value: 'aluguel' },
];

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function FilterChip({ label, selected, onPress }: FilterChipProps): React.JSX.Element {
  return (
    <BaseButton
      accessibilityState={{ selected }}
      onPress={onPress}
      style={styles.filterChip}
      title={label}
      variant={selected ? 'secondary' : 'text'}
    />
  );
}

function parsePreco(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const digits = value.trim().replace(/[^\d,.-]/g, '');
  const normalized = digits.includes(',')
    ? digits.replace(/\./g, '').replace(',', '.')
    : digits;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Não foi possível carregar os imóveis. Tente novamente.';
}

interface FiltrosHeaderProps {
  textoBusca: string;
  onChangeTextoBusca: (value: string) => void;
  cidade: string;
  onChangeCidade: (value: string) => void;
  tipo: TipoImovel | undefined;
  onChangeTipo: (value: TipoImovel | undefined) => void;
  finalidade: FinalidadeImovel | undefined;
  onChangeFinalidade: (value: FinalidadeImovel | undefined) => void;
  precoMinimo: string;
  onChangePrecoMinimo: (value: string) => void;
  precoMaximo: string;
  onChangePrecoMaximo: (value: string) => void;
  erro: string | null;
  temResultados: boolean;
}

const FiltrosHeader = memo(function FiltrosHeader({
  textoBusca,
  onChangeTextoBusca,
  cidade,
  onChangeCidade,
  tipo,
  onChangeTipo,
  finalidade,
  onChangeFinalidade,
  precoMinimo,
  onChangePrecoMinimo,
  precoMaximo,
  onChangePrecoMaximo,
  erro,
  temResultados,
}: FiltrosHeaderProps): React.JSX.Element {
  return (
    <View style={styles.filters}>
      <BaseInput
        autoCapitalize="none"
        label="Buscar"
        onChangeText={onChangeTextoBusca}
        placeholder="Título ou endereço"
        returnKeyType="search"
        value={textoBusca}
      />
      <BaseInput
        label="Cidade"
        onChangeText={onChangeCidade}
        placeholder="Ex.: Praia Grande/SP"
        value={cidade}
      />

      <Text style={styles.filterLabel}>Tipo de imóvel</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chips}>
          <FilterChip label="Todos" onPress={() => onChangeTipo(undefined)} selected={!tipo} />
          {TIPOS.map((opcao) => (
            <FilterChip
              key={opcao.value}
              label={opcao.label}
              onPress={() => onChangeTipo(tipo === opcao.value ? undefined : opcao.value)}
              selected={tipo === opcao.value}
            />
          ))}
        </View>
      </ScrollView>

      <Text style={styles.filterLabel}>Finalidade</Text>
      <View style={styles.chips}>
        <FilterChip
          label="Todas"
          onPress={() => onChangeFinalidade(undefined)}
          selected={!finalidade}
        />
        {FINALIDADES.map((opcao) => (
          <FilterChip
            key={opcao.value}
            label={opcao.label}
            onPress={() =>
              onChangeFinalidade(finalidade === opcao.value ? undefined : opcao.value)
            }
            selected={finalidade === opcao.value}
          />
        ))}
      </View>

      <Text style={styles.filterLabel}>Faixa de preço (R$)</Text>
      <View style={styles.priceRange}>
        <BaseInput
          containerStyle={styles.priceInput}
          keyboardType="decimal-pad"
          label="Mínimo"
          onChangeText={onChangePrecoMinimo}
          placeholder="0"
          value={precoMinimo}
        />
        <BaseInput
          containerStyle={styles.priceInput}
          keyboardType="decimal-pad"
          label="Máximo"
          onChangeText={onChangePrecoMaximo}
          placeholder="Sem limite"
          value={precoMaximo}
        />
      </View>
      {erro && temResultados ? <Text style={styles.error}>{erro}</Text> : null}
    </View>
  );
});

interface ListaVaziaProps {
  isLoading: boolean;
  erro: string | null;
  onRetry: () => void;
}

const ListaVazia = memo(function ListaVazia({
  isLoading,
  erro,
  onRetry,
}: ListaVaziaProps): React.JSX.Element {
  return (
    <View style={styles.empty}>
      {isLoading ? (
        <Loader message="Carregando imóveis..." />
      ) : (
        <>
          <Text style={styles.emptyText}>
            {erro ?? 'Nenhum imóvel encontrado com esses filtros.'}
          </Text>
          {erro ? <BaseButton onPress={onRetry} title="Tentar novamente" /> : null}
        </>
      )}
    </View>
  );
});

export function ImovelListScreen({ navigation }: Props): React.JSX.Element {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [textoBusca, setTextoBusca] = useState('');
  const [busca, setBusca] = useState('');
  const [cidade, setCidade] = useState('');
  const [precoMinimo, setPrecoMinimo] = useState('');
  const [precoMaximo, setPrecoMaximo] = useState('');
  const [tipo, setTipo] = useState<TipoImovel | undefined>();
  const [finalidade, setFinalidade] = useState<FinalidadeImovel | undefined>();
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [ultimaPagina, setUltimaPagina] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const hasLoaded = useRef(false);
  const loadingNextPage = useRef(false);
  const listRequestId = useRef(0);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button title="Novo" onPress={() => navigation.navigate('ImovelForm', {})} />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const timer = setTimeout(() => setBusca(textoBusca.trim()), 350);
    return () => clearTimeout(timer);
  }, [textoBusca]);

  const filtros = useMemo<ImovelFiltros>(
    () => ({
      busca: busca || undefined,
      cidade: cidade.trim() || undefined,
      finalidade,
      preco_max: parsePreco(precoMaximo),
      preco_min: parsePreco(precoMinimo),
      tipo,
    }),
    [busca, cidade, finalidade, precoMaximo, precoMinimo, tipo],
  );

  useEffect(() => {
    let isCurrentRequest = true;
    listRequestId.current += 1;
    setPaginaAtual(1);
    setUltimaPagina(1);
    loadingNextPage.current = false;
    setIsLoadingMore(false);
    if (!hasLoaded.current) setIsLoading(true);
    setErro(null);

    imovelService
      .list({ ...filtros, page: 1, per_page: ITENS_POR_PAGINA })
      .then((response) => {
        if (!isCurrentRequest) return;
        setImoveis(response.data);
        setPaginaAtual(response.meta.current_page);
        setUltimaPagina(response.meta.last_page);
      })
      .catch((error: unknown) => {
        if (isCurrentRequest) setErro(errorMessage(error));
      })
      .finally(() => {
        if (isCurrentRequest) {
          hasLoaded.current = true;
          setIsLoading(false);
          setIsRefreshing(false);
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [filtros, refreshKey]);

  const atualizar = useCallback(() => {
    setIsRefreshing(true);
    setRefreshKey((current) => current + 1);
  }, []);

  const carregarProximaPagina = useCallback(async () => {
    if (loadingNextPage.current || paginaAtual >= ultimaPagina) return;
    loadingNextPage.current = true;
    setIsLoadingMore(true);
    const requestId = listRequestId.current;

    try {
      const response = await imovelService.list({
        ...filtros,
        page: paginaAtual + 1,
        per_page: ITENS_POR_PAGINA,
      });
      if (requestId !== listRequestId.current) return;
      setImoveis((atuais) => {
        const idsExistentes = new Set(atuais.map((imovel) => imovel.id));
        return [...atuais, ...response.data.filter((imovel) => !idsExistentes.has(imovel.id))];
      });
      setPaginaAtual(response.meta.current_page);
      setUltimaPagina(response.meta.last_page);
    } catch (error: unknown) {
      if (requestId === listRequestId.current) setErro(errorMessage(error));
    } finally {
      loadingNextPage.current = false;
      if (requestId === listRequestId.current) setIsLoadingMore(false);
    }
  }, [filtros, paginaAtual, ultimaPagina]);

  const renderItem = useCallback(
    ({ item }: { item: Imovel }): React.JSX.Element => (
      <ImovelCard
        imovel={item}
        onPress={() => navigation.navigate('ImovelDetail', { id: item.id })}
      />
    ),
    [navigation],
  );

  const headerElement = (
    <FiltrosHeader
      cidade={cidade}
      erro={erro}
      finalidade={finalidade}
      onChangeCidade={setCidade}
      onChangeFinalidade={setFinalidade}
      onChangePrecoMaximo={setPrecoMaximo}
      onChangePrecoMinimo={setPrecoMinimo}
      onChangeTextoBusca={setTextoBusca}
      onChangeTipo={setTipo}
      precoMaximo={precoMaximo}
      precoMinimo={precoMinimo}
      temResultados={imoveis.length > 0}
      textoBusca={textoBusca}
      tipo={tipo}
    />
  );

  const emptyElement = <ListaVazia erro={erro} isLoading={isLoading} onRetry={atualizar} />;

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={imoveis}
      keyExtractor={(item) => String(item.id)}
      ListEmptyComponent={emptyElement}
      ListFooterComponent={
        isLoadingMore ? <Loader message="Carregando mais imóveis..." size="small" /> : null
      }
      ListHeaderComponent={headerElement}
      onEndReached={() => void carregarProximaPagina()}
      onEndReachedThreshold={0.5}
      refreshControl={<RefreshControl onRefresh={atualizar} refreshing={isRefreshing} />}
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  chips: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  empty: { alignItems: 'center', gap: 12, paddingVertical: 28 },
  emptyText: { color: '#5F676D', fontSize: 15, textAlign: 'center' },
  error: { color: '#B3261E', fontSize: 13 },
  filterChip: { minHeight: 40, paddingHorizontal: 12, paddingVertical: 7 },
  filterLabel: { color: '#30363B', fontSize: 14, fontWeight: '600', marginTop: 4 },
  filters: { gap: 12, paddingBottom: 18 },
  list: { flexGrow: 1, padding: 16 },
  priceInput: { flex: 1 },
  priceRange: { flexDirection: 'row', gap: 12 },
});

export default ImovelListScreen;
