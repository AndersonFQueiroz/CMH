import Ionicons from '@expo/vector-icons/Ionicons';
import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '../components/common/Badge';
import { BaseButton } from '../components/common/BaseButton';
import { Cobogo } from '../components/common/Cobogo';
import { Loader } from '../components/common/Loader';
import { SectionTitle } from '../components/common/SectionTitle';
import { ImovelAvatar } from '../components/imovel/ImovelAvatar';
import type { RootStackParamList } from '../navigation/types';
import { notificarImovelExcluido, onImovelSalvo } from '../services/imovelEvents';
import imovelService from '../services/imovelService';
import { colors, fonts, radii, shadows } from '../theme';
import type { Imovel } from '../types/imovel';
import { formatArea, formatDataBR, formatPreco, formatTelefone } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'ImovelDetail'>;

const TIPO_LABELS: Record<Imovel['tipo'], string> = {
  apartamento: 'Apartamento',
  casa: 'Casa',
  comercial: 'Comercial',
  kitnet: 'Kitnet',
  terreno: 'Terreno',
};
const FINALIDADE_LABELS: Record<Imovel['finalidade'], string> = {
  aluguel: 'Aluguel',
  venda: 'Venda',
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Não foi possível carregar este imóvel.';
}

function erroDeExclusao(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Não foi possível excluir o anúncio. Tente novamente.';
}

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps): React.JSX.Element {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

interface SpecCellProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

function SpecCell({ icon, label, value }: SpecCellProps): React.JSX.Element {
  return (
    <View accessibilityLabel={`${label}: ${value}`} style={styles.specCell}>
      <View style={styles.specValueRow}>
        <Ionicons color={colors.accent} name={icon} size={18} />
        <Text style={styles.specValue}>{value}</Text>
      </View>
      <Text style={styles.specLabel}>{label}</Text>
    </View>
  );
}

interface StatusPillProps {
  disponivel: boolean;
}

function StatusPill({ disponivel }: StatusPillProps): React.JSX.Element {
  return (
    <View style={[styles.statusPill, !disponivel && styles.statusPillOff]}>
      <View
        style={[
          styles.statusDot,
          { backgroundColor: disponivel ? colors.available : colors.unavailable },
        ]}
      />
      <Text style={styles.statusText}>{disponivel ? 'Disponível' : 'Indisponível'}</Text>
    </View>
  );
}

export function ImovelDetailScreen({ navigation, route }: Props): React.JSX.Element {
  const { id } = route.params;
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [excluindo, setExcluindo] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const montado = useRef(true);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  useEffect(() => {
    let isCurrentRequest = true;
    setImovel(null);
    setIsLoading(true);
    setErro(null);

    imovelService
      .getById(id)
      .then((response) => {
        if (isCurrentRequest) setImovel(response);
      })
      .catch((error: unknown) => {
        if (isCurrentRequest) setErro(errorMessage(error));
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [id, retryKey]);

  // Após editar no formulário, usa o anúncio devolvido pela API sem nova requisição.
  useEffect(
    () =>
      onImovelSalvo((salvo) => {
        if (salvo.id === id) setImovel(salvo);
      }),
    [id],
  );

  const tentarNovamente = useCallback(() => setRetryKey((atual) => atual + 1), []);

  const excluirAnuncio = useCallback(async (): Promise<void> => {
    if (excluindo) return;
    setExcluindo(true);

    try {
      await imovelService.delete(id);
      notificarImovelExcluido(id);
      navigation.goBack();
    } catch (error: unknown) {
      if (!montado.current) return;
      Alert.alert('Erro ao excluir', erroDeExclusao(error));
    } finally {
      if (montado.current) setExcluindo(false);
    }
  }, [excluindo, id, navigation]);

  // RF-15: a exclusão só acontece depois de confirmada no alerta.
  const confirmarExclusao = useCallback((): void => {
    if (!imovel) return;
    Alert.alert(
      'Excluir anúncio?',
      `Excluir "${imovel.titulo}"? Essa ação é definitiva e o anúncio não poderá ser recuperado.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => void excluirAnuncio() },
      ],
    );
  }, [excluirAnuncio, imovel]);

  const abrirMapa = useCallback((): void => {
    if (!imovel) return;
    const consulta = encodeURIComponent(`${imovel.endereco}, ${imovel.cidade}`);
    void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${consulta}`).catch(
      () => Alert.alert('Mapa indisponível', 'Não foi possível abrir o aplicativo de mapas.'),
    );
  }, [imovel]);

  const ligar = useCallback((): void => {
    if (!imovel) return;
    const telefone = imovel.contato_telefone.replace(/\D/g, '');
    void Linking.openURL(`tel:${telefone}`).catch(() =>
      Alert.alert('Ligação indisponível', 'Não foi possível abrir o discador.'),
    );
  }, [imovel]);

  if (isLoading && !imovel) {
    return (
      <View style={styles.stateContainer}>
        <Loader message="Carregando detalhes do imóvel..." />
      </View>
    );
  }

  if (erro || !imovel) {
    return (
      <View style={[styles.stateContainer, { paddingTop: insets.top }]}>
        <Cobogo columns={4} rows={2} />
        <Text style={styles.stateTitle}>Anúncio indisponível</Text>
        <Text style={styles.stateText}>{erro ?? 'Imóvel não encontrado.'}</Text>
        <BaseButton onPress={tentarNovamente} title="Tentar novamente" />
        <BaseButton onPress={() => navigation.goBack()} title="Voltar" variant="text" />
      </View>
    );
  }

  const isTerreno = imovel.tipo === 'terreno';

  return (
    <View style={styles.screen}>
      {isFocused ? <StatusBar style="light" /> : null}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 104 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <ImovelAvatar fotoUrl={imovel.foto_url} iconSize={46} style={styles.heroImage} />
          <LinearGradient
            colors={['rgba(9, 20, 18, 0.42)', 'rgba(9, 20, 18, 0)']}
            pointerEvents="none"
            style={[styles.topScrim, { height: insets.top + 78 }]}
          />
        </View>

        <View style={styles.sheet}>
          <View style={styles.badges}>
            <Badge label={TIPO_LABELS[imovel.tipo]} variant="type" />
            <Badge label={FINALIDADE_LABELS[imovel.finalidade]} variant="purpose" />
            <StatusPill disponivel={imovel.disponivel} />
          </View>

          <View style={styles.heading}>
            <Text style={styles.title}>{imovel.titulo}</Text>
            <Pressable
              accessibilityLabel={`Ver ${imovel.endereco}, ${imovel.cidade} no mapa`}
              accessibilityRole="button"
              onPress={abrirMapa}
              style={({ pressed }) => [styles.cityRow, pressed && styles.pressed]}
            >
              <Ionicons color={colors.muted} name="location-outline" size={16} />
              <Text style={styles.city}>
                {imovel.endereco}, {imovel.cidade}
              </Text>
              <Ionicons color={colors.accent} name="arrow-forward" size={14} />
            </Pressable>
            <Text style={styles.price}>{formatPreco(imovel.preco, imovel.finalidade)}</Text>
          </View>

          <View style={styles.section}>
            <SectionTitle>Sobre o imóvel</SectionTitle>
            <Text style={styles.description}>
              {imovel.descricao || 'Sem descrição informada.'}
            </Text>
          </View>

          <View style={styles.section}>
            <SectionTitle>Características</SectionTitle>
            <View style={styles.specPanel}>
              <View style={styles.specRow}>
                <SpecCell icon="resize-outline" label="Área" value={formatArea(imovel.area_m2)} />
                {!isTerreno ? (
                  <>
                    <View style={styles.specDivider} />
                    <SpecCell icon="bed-outline" label="Quartos" value={String(imovel.quartos)} />
                  </>
                ) : null}
              </View>
              {!isTerreno ? (
                <>
                  <View style={styles.specHairline} />
                  <View style={styles.specRow}>
                    <SpecCell
                      icon="water-outline"
                      label="Banheiros"
                      value={String(imovel.banheiros)}
                    />
                    <View style={styles.specDivider} />
                    <SpecCell icon="car-outline" label="Vagas" value={String(imovel.vagas)} />
                  </View>
                </>
              ) : null}
            </View>
          </View>

          <View style={styles.section}>
            <SectionTitle>Localização e contato</SectionTitle>
            <DetailRow label="Endereço" value={imovel.endereco} />
            <DetailRow label="Cidade" value={imovel.cidade} />
            <DetailRow
              label="Disponível a partir de"
              value={formatDataBR(imovel.data_disponibilidade)}
            />
            <DetailRow label="Telefone" value={formatTelefone(imovel.contato_telefone)} />
            <View style={styles.contactActions}>
              <BaseButton
                icon="call-outline"
                onPress={ligar}
                style={styles.contactButton}
                title="Ligar"
                variant="secondary"
              />
              <BaseButton
                icon="map-outline"
                onPress={abrirMapa}
                style={styles.contactButton}
                title="Ver no mapa"
                variant="secondary"
              />
            </View>
          </View>

          <Text style={styles.dates}>
            Publicado em {formatDataBR(imovel.created_at)} · Atualizado em{' '}
            {formatDataBR(imovel.updated_at)}
          </Text>
        </View>
      </ScrollView>

      <Pressable
        accessibilityLabel="Voltar para a lista"
        accessibilityRole="button"
        onPress={() => navigation.goBack()}
        style={({ pressed }) => [
          styles.backButton,
          { top: insets.top + 12 },
          pressed && styles.pressed,
        ]}
      >
        <Ionicons color={colors.ink} name="arrow-back" size={21} />
      </Pressable>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <BaseButton
          disabled={excluindo}
          icon="create-outline"
          onPress={() => navigation.navigate('ImovelForm', { id })}
          style={styles.editButton}
          title="Editar anúncio"
        />
        <Pressable
          accessibilityLabel="Excluir anúncio"
          accessibilityRole="button"
          accessibilityState={{ busy: excluindo, disabled: excluindo }}
          disabled={excluindo}
          onPress={confirmarExclusao}
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.pressed,
            excluindo && styles.deleteButtonDisabled,
          ]}
        >
          {excluindo ? (
            <ActivityIndicator color={colors.danger} />
          ) : (
            <Ionicons color={colors.danger} name="trash-outline" size={21} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    left: 16,
    position: 'absolute',
    width: 44,
    ...shadows.floating,
  },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bottomBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    left: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    position: 'absolute',
    right: 0,
  },
  city: {
    color: colors.muted,
    flexShrink: 1,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  cityRow: { alignItems: 'center', flexDirection: 'row', gap: 4, minHeight: 32 },
  contactActions: { flexDirection: 'row', gap: 10, paddingTop: 8 },
  contactButton: { flex: 1 },
  dates: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 17,
    paddingTop: 4,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerSoft,
    borderRadius: radii.md,
    borderWidth: 1,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  deleteButtonDisabled: { opacity: 0.6 },
  description: {
    color: colors.inkSoft,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23.5,
  },
  detailLabel: {
    color: colors.muted,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13.5,
  },
  detailRow: {
    borderBottomColor: colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 11,
  },
  detailValue: {
    color: colors.inkSoft,
    flex: 1.5,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    textAlign: 'right',
  },
  editButton: { flex: 1 },
  heading: { gap: 4 },
  hero: { backgroundColor: colors.bgDeep },
  heroImage: { aspectRatio: 4 / 3, borderRadius: 0, width: '100%' },
  pressed: { opacity: 0.8, transform: [{ scale: 0.985 }] },
  price: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 31,
    letterSpacing: -1,
    lineHeight: 36,
    marginTop: 6,
  },
  screen: { backgroundColor: colors.bg, flex: 1 },
  section: { gap: 10 },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    gap: 22,
    marginTop: -28,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  specCell: { flex: 1, gap: 3, paddingHorizontal: 16, paddingVertical: 14 },
  specDivider: { backgroundColor: colors.line, width: StyleSheet.hairlineWidth },
  specHairline: { backgroundColor: colors.line, height: StyleSheet.hairlineWidth },
  specLabel: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 12.5,
  },
  specPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  specRow: { flexDirection: 'row' },
  specValue: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 20,
    letterSpacing: -0.4,
  },
  specValueRow: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  stateContainer: {
    alignItems: 'center',
    backgroundColor: colors.bg,
    flex: 1,
    gap: 11,
    justifyContent: 'center',
    padding: 28,
  },
  stateText: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 14.5,
    lineHeight: 21,
    maxWidth: 300,
    textAlign: 'center',
  },
  stateTitle: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: -0.4,
    marginTop: 6,
  },
  statusDot: { borderRadius: 4, height: 7, width: 7 },
  statusPill: {
    alignItems: 'center',
    backgroundColor: colors.availableSoft,
    borderRadius: radii.sm,
    flexDirection: 'row',
    gap: 6,
    minHeight: 28,
    paddingHorizontal: 10,
  },
  statusPillOff: { backgroundColor: colors.unavailableSoft },
  statusText: {
    color: colors.inkSoft,
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 26,
    letterSpacing: -0.7,
    lineHeight: 31,
  },
  topScrim: { left: 0, position: 'absolute', right: 0, top: 0 },
});

export default ImovelDetailScreen;
