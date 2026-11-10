import Ionicons from '@expo/vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BaseButton } from '../components/common/BaseButton';
import { BaseInput } from '../components/common/BaseInput';
import { Chip } from '../components/common/Chip';
import { Cobogo } from '../components/common/Cobogo';
import { Loader } from '../components/common/Loader';
import { ImovelCard } from '../components/imovel/ImovelCard';
import type { RootStackParamList } from '../navigation/types';
import { onImovelExcluido, onImovelSalvo } from '../services/imovelEvents';
import imovelService from '../services/imovelService';
import { colors, fonts, radii } from '../theme';
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
  total: number;
  temFiltros: boolean;
  onLimparFiltros: () => void;
  onNovo: () => void;
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
  total,
  temFiltros,
  onLimparFiltros,
  onNovo,
}: FiltrosHeaderProps): React.JSX.Element {
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const filtrosAtivos = [
    tipo,
    finalidade,
    cidade.trim() || undefined,
    precoMinimo || undefined,
    precoMaximo || undefined,
  ].filter(Boolean).length;

  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View style={styles.brandLockup}>
          <View style={styles.brandMark}>
            <Ionicons color={colors.white} name="home" size={19} />
          </View>
          <View>
            <Text style={styles.brand}>CMH</Text>
            <Text style={styles.brandSub}>Imóveis para viver</Text>
          </View>
        </View>
        <Pressable
          accessibilityLabel="Anunciar imóvel"
          accessibilityRole="button"
          onPress={onNovo}
          style={({ pressed }) => [styles.announceButton, pressed && styles.pressed]}
        >
          <Ionicons color={colors.ink} name="add" size={18} />
          <Text style={styles.announceLabel}>Anunciar</Text>
        </Pressable>
      </View>

      <View style={styles.headlineGroup}>
        <Text style={styles.headline}>Seu próximo endereço começa aqui.</Text>
        <Text style={styles.subhead}>
          Casas, apartamentos e terrenos para comprar ou alugar.
        </Text>
      </View>

      <View style={styles.search}>
        <Ionicons color={colors.muted} name="search-outline" size={20} />
        <TextInput
          accessibilityLabel="Buscar imóveis"
          autoCapitalize="none"
          onChangeText={onChangeTextoBusca}
          placeholder="Busque por título, bairro ou cidade"
          placeholderTextColor={colors.muted}
          returnKeyType="search"
          style={styles.searchInput}
          value={textoBusca}
        />
        {textoBusca ? (
          <Pressable
            accessibilityLabel="Limpar busca"
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => onChangeTextoBusca('')}
          >
            <Ionicons color={colors.muted} name="close-circle" size={19} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.chipRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <Chip label="Todos" onPress={() => onChangeTipo(undefined)} selected={!tipo} />
        {TIPOS.map((opcao) => (
          <Chip
            key={opcao.value}
            label={opcao.label}
            onPress={() => onChangeTipo(tipo === opcao.value ? undefined : opcao.value)}
            selected={tipo === opcao.value}
          />
        ))}
      </ScrollView>

      <View style={styles.finalidadeRow}>
        <Chip
          label="Todas"
          onPress={() => onChangeFinalidade(undefined)}
          selected={!finalidade}
        />
        {FINALIDADES.map((opcao) => (
          <Chip
            key={opcao.value}
            label={opcao.label}
            onPress={() =>
              onChangeFinalidade(finalidade === opcao.value ? undefined : opcao.value)
            }
            selected={finalidade === opcao.value}
          />
        ))}
      </View>

      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>
          <Text style={styles.resultsStrong}>{total}</Text>{' '}
          {total === 1 ? 'imóvel' : 'imóveis'}
        </Text>
        <View style={styles.resultsActions}>
          {temFiltros ? (
            <Pressable
              accessibilityLabel="Limpar filtros"
              accessibilityRole="button"
              hitSlop={8}
              onPress={onLimparFiltros}
            >
              <Text style={styles.clearLabel}>Limpar</Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityLabel="Abrir filtros avançados"
            accessibilityRole="button"
            accessibilityState={{ expanded: filtrosAbertos }}
            onPress={() => setFiltrosAbertos((aberto) => !aberto)}
            style={({ pressed }) => [styles.filtersButton, pressed && styles.pressed]}
          >
            <Ionicons color={colors.ink} name="options-outline" size={18} />
            <Text style={styles.filtersLabel}>Filtros</Text>
            {filtrosAtivos > 0 ? (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{filtrosAtivos}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>

      {filtrosAbertos ? (
        <View style={styles.advanced}>
          <BaseInput
            autoCapitalize="words"
            label="Cidade"
            onChangeText={onChangeCidade}
            placeholder="Ex.: Santos/SP"
            value={cidade}
          />
          <View style={styles.priceRange}>
            <BaseInput
              containerStyle={styles.priceInput}
              keyboardType="decimal-pad"
              label="Preço mínimo"
              onChangeText={onChangePrecoMinimo}
              placeholder="0"
              value={precoMinimo}
            />
            <BaseInput
              containerStyle={styles.priceInput}
              keyboardType="decimal-pad"
              label="Preço máximo"
              onChangeText={onChangePrecoMaximo}
              placeholder="Sem limite"
              value={precoMaximo}
            />
          </View>
        </View>
      ) : null}

      {erro && temResultados ? <Text style={styles.error}>{erro}</Text> : null}
    </View>
  );
});

interface ListaVaziaProps {
  isLoading: boolean;
  erro: string | null;
  onRetry: () => void;
  temFiltros: boolean;
  onLimparFiltros: () => void;
}

const ListaVazia = memo(function ListaVazia({
  isLoading,
  erro,
  onRetry,
  temFiltros,
  onLimparFiltros,
}: ListaVaziaProps): React.JSX.Element {
  if (isLoading) {
    return <Loader message="Carregando imóveis..." />;
  }

  return (
    <View style={styles.empty}>
      <Cobogo columns={5} opacity={0.22} rows={3} />
      <Text style={styles.emptyTitle}>
        {erro ? 'Não foi possível carregar' : 'Nenhum imóvel por aqui'}
      </Text>
      <Text style={styles.emptyText}>
        {erro ?? 'Tente ajustar a busca ou remover alguns filtros para ver mais opções.'}
      </Text>
      <View style={styles.emptyActions}>
        {erro ? <BaseButton onPress={onRetry} title="Tentar novamente" /> : null}
        {!erro && temFiltros ? (
          <BaseButton onPress={onLimparFiltros} title="Limpar filtros" variant="secondary" />
        ) : null}
      </View>
    </View>
  );
});

export function ImovelListScreen({ navigation }: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [total, setTotal] = useState(0);
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

  const temFiltros = Boolean(
    busca || cidade.trim() || tipo || finalidade || precoMinimo || precoMaximo,
  );

  const limparFiltros = useCallback((): void => {
    setTextoBusca('');
    setBusca('');
    setCidade('');
    setTipo(undefined);
    setFinalidade(undefined);
    setPrecoMinimo('');
    setPrecoMaximo('');
  }, []);

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
        setTotal(response.meta.total);
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

  // Recarrega em segundo plano quando um anúncio é criado ou editado no formulário.
  useEffect(() => onImovelSalvo(() => setRefreshKey((current) => current + 1)), []);

  // Remove localmente quando um anúncio é excluído no detalhe, sem nova requisição.
  useEffect(
    () =>
      onImovelExcluido((idExcluido) => {
        setImoveis((atuais) =>
          atuais.some((imovel) => imovel.id === idExcluido)
            ? atuais.filter((imovel) => imovel.id !== idExcluido)
            : atuais,
        );
        setTotal((atual) => Math.max(0, atual - 1));
      }),
    [],
  );

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
      setTotal(response.meta.total);
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
      onLimparFiltros={limparFiltros}
      onNovo={() => navigation.navigate('ImovelForm', {})}
      precoMaximo={precoMaximo}
      precoMinimo={precoMinimo}
      temFiltros={temFiltros}
      temResultados={imoveis.length > 0}
      textoBusca={textoBusca}
      tipo={tipo}
      total={total}
    />
  );

  const emptyElement = (
    <ListaVazia
      erro={erro}
      isLoading={isLoading}
      onLimparFiltros={limparFiltros}
      onRetry={atualizar}
      temFiltros={temFiltros}
    />
  );

  return (
    <FlatList
      contentContainerStyle={[styles.list, { paddingTop: insets.top + 12 }]}
      data={imoveis}
      ItemSeparatorComponent={Separador}
      keyExtractor={(item) => String(item.id)}
      ListEmptyComponent={emptyElement}
      ListFooterComponent={
        isLoadingMore ? (
          <Loader message="Carregando mais imóveis..." size="small" />
        ) : undefined
      }
      ListHeaderComponent={headerElement}
      onEndReached={() => void carregarProximaPagina()}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          colors={[colors.accent]}
          onRefresh={atualizar}
          refreshing={isRefreshing}
          tintColor={colors.accent}
        />
      }
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      style={styles.screen}
    />
  );
}

function Separador(): React.JSX.Element {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  advanced: { gap: 12, paddingTop: 2 },
  announceButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.lineStrong,
    borderRadius: radii.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    minHeight: 44,
    paddingHorizontal: 14,
  },
  announceLabel: {
    color: colors.ink,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13.5,
  },
  brand: {
    color: colors.ink,
    fontFamily: fonts.displayBold,
    fontSize: 20,
    letterSpacing: 0.2,
  },
  brandLockup: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  brandMark: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brandSub: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 11.5,
    marginTop: 1,
  },
  chipRow: { gap: 8, paddingRight: 8 },
  clearLabel: {
    color: colors.accent,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },
  empty: {
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
  emptyActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  emptyText: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 14.5,
    lineHeight: 21,
    maxWidth: 300,
    textAlign: 'center',
  },
  emptyTitle: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: -0.4,
    marginTop: 6,
    textAlign: 'center',
  },
  error: { color: colors.danger, fontFamily: fonts.body, fontSize: 12.5 },
  filterBadge: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 20,
    minWidth: 20,
    paddingHorizontal: 5,
  },
  filterBadgeText: {
    color: colors.white,
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
  },
  filterLabel: {
    color: colors.inkSoft,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
  },
  filtersButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    minHeight: 44,
    paddingLeft: 8,
  },
  filtersLabel: {
    color: colors.ink,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13.5,
  },
  finalidadeRow: { flexDirection: 'row', gap: 8 },
  headline: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 32,
    letterSpacing: -1,
    lineHeight: 35,
    maxWidth: 330,
  },
  headlineGroup: { gap: 8, marginTop: 4 },
  header: { gap: 18, paddingBottom: 22 },
  list: { flexGrow: 1, paddingBottom: 44, paddingHorizontal: 20 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  priceInput: { flex: 1 },
  priceRange: { flexDirection: 'row', gap: 10 },
  resultsActions: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  resultsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  resultsStrong: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 16,
  },
  resultsText: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 13.5,
  },
  screen: { backgroundColor: colors.bg, flex: 1 },
  search: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.lineStrong,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 14,
  },
  searchInput: {
    color: colors.ink,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15.5,
    paddingVertical: 12,
  },
  separator: { height: 24 },
  subhead: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 14.5,
    lineHeight: 21,
    maxWidth: 330,
  },
});

export default ImovelListScreen;
