import Ionicons from '@expo/vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  type ScrollViewInstance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BaseButton } from '../components/common/BaseButton';
import { BaseInput } from '../components/common/BaseInput';
import { Cobogo } from '../components/common/Cobogo';
import { Loader } from '../components/common/Loader';
import { OptionPicker } from '../components/common/OptionPicker';
import { SectionTitle } from '../components/common/SectionTitle';
import { FotoPicker } from '../components/imovel/FotoPicker';
import { useImagePicker, type OrigemFoto } from '../hooks/useImagePicker';
import type { RootStackParamList } from '../navigation/types';
import { notificarImovelSalvo } from '../services/imovelEvents';
import imovelService from '../services/imovelService';
import { colors, fonts, radii } from '../theme';
import type { FotoImovel, Imovel, TipoImovel } from '../types/imovel';
import {
  camposAlterados,
  errosDaApi,
  FINALIDADE_OPCOES,
  montarDTO,
  temErros,
  TIPO_OPCOES,
  validarImovelForm,
  VALORES_INICIAIS,
  valoresDoImovel,
  type ImovelFormErrors,
  type ImovelFormField,
  type ImovelFormValues,
} from '../utils/imovelForm';
import {
  mascaraData,
  mascaraDecimal,
  mascaraInteiro,
  mascaraMoeda,
  mascaraTelefone,
} from '../utils/masks';

type Props = NativeStackScreenProps<RootStackParamList, 'ImovelForm'>;

const MENSAGEM_CORRIGIR = 'Corrija os campos destacados e tente novamente.';

export function ImovelFormScreen({ navigation, route }: Props): React.JSX.Element {
  const editingId = route.params?.id;
  const isEditing = editingId !== undefined;
  const insets = useSafeAreaInsets();

  const [valores, setValores] = useState<ImovelFormValues>(VALORES_INICIAIS);
  const [erros, setErros] = useState<ImovelFormErrors>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [original, setOriginal] = useState<Imovel | null>(null);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [foto, setFoto] = useState<FotoImovel | null>(null);
  const { selecionarFoto, processando: processandoFoto } = useImagePicker();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const montado = useRef(true);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  useEffect(() => {
    if (editingId === undefined) return undefined;

    let isCurrentRequest = true;
    setIsLoading(true);
    setErroCarregamento(null);

    imovelService
      .getById(editingId)
      .then((imovel) => {
        if (!isCurrentRequest) return;
        setOriginal(imovel);
        setValores(valoresDoImovel(imovel));
      })
      .catch((error: unknown) => {
        if (!isCurrentRequest) return;
        setErroCarregamento(
          error instanceof Error ? error.message : 'Não foi possível carregar o anúncio.',
        );
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [editingId, retryKey]);

  const limparErro = useCallback((campo: keyof ImovelFormErrors): void => {
    setErros((atuais) => {
      if (atuais[campo] === undefined) return atuais;
      const proximos = { ...atuais };
      delete proximos[campo];
      return proximos;
    });
  }, []);

  const alterar = useCallback(
    <K extends ImovelFormField>(campo: K, valor: ImovelFormValues[K]): void => {
      setValores((atuais) => ({ ...atuais, [campo]: valor }));
      limparErro(campo);
    },
    [limparErro],
  );

  const escolherFoto = useCallback(
    async (origem: OrigemFoto): Promise<void> => {
      const escolhida = await selecionarFoto(origem);
      if (!escolhida || !montado.current) return;
      setFoto(escolhida);
      limparErro('foto');
    },
    [limparErro, selecionarFoto],
  );

  const removerFoto = useCallback((): void => {
    setFoto(null);
    limparErro('foto');
  }, [limparErro]);

  // O aviso "corrija os campos" some quando o último erro de campo é resolvido.
  useEffect(() => {
    if (!temErros(erros)) {
      setErroGeral((atual) => (atual === MENSAGEM_CORRIGIR ? null : atual));
    }
  }, [erros]);

  const alterarTipo = useCallback(
    (tipo: TipoImovel): void => {
      alterar('tipo', tipo);
      // Terreno não tem quartos nem banheiros (regra espelhada da API).
      if (tipo === 'terreno') {
        alterar('quartos', '0');
        alterar('banheiros', '0');
      }
    },
    [alterar],
  );

  const mostrarTopo = (): void => {
    scrollRef.current?.scrollTo({ animated: true, y: 0 });
  };

  const salvar = async (): Promise<void> => {
    if (isSaving || processandoFoto) return;

    const dataOriginal = original?.data_disponibilidade.split('T')[0];
    const errosLocais = validarImovelForm(valores, { dataOriginal });
    if (temErros(errosLocais)) {
      setErros(errosLocais);
      setErroGeral(MENSAGEM_CORRIGIR);
      mostrarTopo();
      return;
    }

    setErros({});
    setErroGeral(null);
    setIsSaving(true);

    try {
      const dto = montarDTO(valores);
      let salvo: Imovel;

      if (original) {
        const alterados = camposAlterados(montarDTO(valoresDoImovel(original)), dto);
        if (Object.keys(alterados).length === 0 && !foto) {
          Alert.alert('Nada para salvar', 'Nenhum campo do anúncio foi alterado.');
          return;
        }
        salvo = await imovelService.update(original.id, foto ? { ...alterados, foto } : alterados);
      } else {
        salvo = await imovelService.create(foto ? { ...dto, foto } : dto);
      }

      notificarImovelSalvo(salvo);
      Alert.alert(
        'Sucesso',
        original ? 'Anúncio atualizado com sucesso.' : 'Anúncio cadastrado com sucesso.',
      );
      if (original) navigation.goBack();
      else navigation.replace('ImovelDetail', { id: salvo.id });
    } catch (error: unknown) {
      if (!montado.current) return;
      const { campos, geral } = errosDaApi(error);
      setErros(campos);
      setErroGeral(temErros(campos) && !geral ? MENSAGEM_CORRIGIR : geral);
      mostrarTopo();
    } finally {
      if (montado.current) setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.stateContainer}>
        <Loader message="Carregando anúncio..." />
      </View>
    );
  }

  if (isEditing && (erroCarregamento || !original)) {
    return (
      <View style={styles.stateContainer}>
        <Cobogo columns={4} rows={2} />
        <Text style={styles.stateTitle}>Anúncio indisponível</Text>
        <Text style={styles.stateError}>{erroCarregamento ?? 'Anúncio não encontrado.'}</Text>
        <BaseButton
          onPress={() => setRetryKey((atual) => atual + 1)}
          title="Tentar novamente"
        />
        <BaseButton onPress={() => navigation.goBack()} title="Voltar" variant="text" />
      </View>
    );
  }

  const isTerreno = valores.tipo === 'terreno';
  const labelPreco = valores.finalidade === 'aluguel' ? 'Aluguel mensal' : 'Preço de venda';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: 104 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
      >
        {erroGeral ? (
          <View accessibilityLiveRegion="polite" accessibilityRole="alert" style={styles.banner}>
            <Ionicons color={colors.danger} name="alert-circle" size={19} />
            <Text style={styles.bannerText}>{erroGeral}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionTitle>Anúncio</SectionTitle>
          <FotoPicker
            disabled={isSaving}
            error={erros.foto}
            foto={foto}
            fotoAtualUrl={original?.foto_url}
            onRemover={removerFoto}
            onSelecionar={(origem) => void escolherFoto(origem)}
            processando={processandoFoto}
          />
          <BaseInput
            error={erros.titulo}
            label="Título *"
            maxLength={150}
            onChangeText={(texto) => alterar('titulo', texto)}
            placeholder="Ex.: Casa 3 quartos com quintal"
            value={valores.titulo}
          />
          <BaseInput
            error={erros.descricao}
            label="Descrição"
            multiline
            numberOfLines={4}
            onChangeText={(texto) => alterar('descricao', texto)}
            placeholder="Detalhes do imóvel, condomínio, diferenciais..."
            style={styles.textArea}
            textAlignVertical="top"
            value={valores.descricao}
          />
          <OptionPicker
            error={erros.tipo}
            label="Tipo *"
            onChange={alterarTipo}
            options={TIPO_OPCOES}
            value={valores.tipo}
          />
          <OptionPicker
            error={erros.finalidade}
            label="Finalidade *"
            onChange={(finalidade) => alterar('finalidade', finalidade)}
            options={FINALIDADE_OPCOES}
            value={valores.finalidade}
          />
        </View>

        <View style={styles.section}>
          <SectionTitle>Valores e características</SectionTitle>
          <BaseInput
            error={erros.preco}
            keyboardType="number-pad"
            label={`${labelPreco} *`}
            onChangeText={(texto) => alterar('preco', mascaraMoeda(texto))}
            placeholder="R$ 0,00"
            value={valores.preco}
          />
          <BaseInput
            error={erros.area_m2}
            keyboardType="decimal-pad"
            label="Área (m²) *"
            onChangeText={(texto) => alterar('area_m2', mascaraDecimal(texto))}
            placeholder="Ex.: 120,5"
            value={valores.area_m2}
          />
          <View style={styles.row}>
            <BaseInput
              containerStyle={styles.column}
              editable={!isTerreno}
              error={erros.quartos}
              keyboardType="number-pad"
              label="Quartos *"
              onChangeText={(texto) => alterar('quartos', mascaraInteiro(texto))}
              style={isTerreno ? styles.inputDisabled : undefined}
              value={valores.quartos}
            />
            <BaseInput
              containerStyle={styles.column}
              editable={!isTerreno}
              error={erros.banheiros}
              keyboardType="number-pad"
              label="Banheiros *"
              onChangeText={(texto) => alterar('banheiros', mascaraInteiro(texto))}
              style={isTerreno ? styles.inputDisabled : undefined}
              value={valores.banheiros}
            />
            <BaseInput
              containerStyle={styles.column}
              error={erros.vagas}
              keyboardType="number-pad"
              label="Vagas"
              onChangeText={(texto) => alterar('vagas', mascaraInteiro(texto))}
              value={valores.vagas}
            />
          </View>
          {isTerreno ? (
            <View style={styles.hintRow}>
              <Ionicons color={colors.muted} name="information-circle-outline" size={15} />
              <Text style={styles.hint}>Terrenos não têm quartos nem banheiros.</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <SectionTitle>Localização e contato</SectionTitle>
          <BaseInput
            error={erros.endereco}
            label="Endereço *"
            maxLength={200}
            onChangeText={(texto) => alterar('endereco', texto)}
            placeholder="Rua, número, bairro"
            value={valores.endereco}
          />
          <BaseInput
            error={erros.cidade}
            label="Cidade *"
            maxLength={100}
            onChangeText={(texto) => alterar('cidade', texto)}
            placeholder="Ex.: Santos/SP"
            value={valores.cidade}
          />
          <BaseInput
            error={erros.contato_telefone}
            keyboardType="phone-pad"
            label="Telefone de contato *"
            onChangeText={(texto) => alterar('contato_telefone', mascaraTelefone(texto))}
            placeholder="(13) 99999-1234"
            value={valores.contato_telefone}
          />
        </View>

        <View style={styles.section}>
          <SectionTitle>Disponibilidade</SectionTitle>
          <BaseInput
            error={erros.data_disponibilidade}
            keyboardType="number-pad"
            label="Disponível a partir de *"
            onChangeText={(texto) => alterar('data_disponibilidade', mascaraData(texto))}
            placeholder="DD/MM/AAAA"
            value={valores.data_disponibilidade}
          />
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchLabel}>Anúncio disponível</Text>
              <Text style={styles.hint}>
                {valores.disponivel ? 'Aparece como disponível.' : 'Marcado como indisponível.'}
              </Text>
            </View>
            <Switch
              accessibilityLabel="Anúncio disponível"
              ios_backgroundColor={colors.lineStrong}
              onValueChange={(disponivel) => alterar('disponivel', disponivel)}
              thumbColor={colors.white}
              trackColor={{ false: colors.lineStrong, true: colors.accent }}
              value={valores.disponivel}
            />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <BaseButton
          disabled={processandoFoto}
          icon="checkmark"
          isLoading={isSaving}
          onPress={() => void salvar()}
          style={styles.saveButton}
          title={isEditing ? 'Salvar alterações' : 'Cadastrar anúncio'}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'flex-start',
    backgroundColor: colors.dangerSoft,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: 9,
    padding: 13,
  },
  bannerText: {
    color: colors.danger,
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 13.5,
    lineHeight: 20,
  },
  bottomBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    bottom: 0,
    left: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    position: 'absolute',
    right: 0,
  },
  column: { flex: 1 },
  container: { gap: 26, padding: 20 },
  hint: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
  },
  hintRow: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  inputDisabled: { backgroundColor: colors.bgDeep, color: colors.muted },
  row: { flexDirection: 'row', gap: 10 },
  saveButton: { width: '100%' },
  screen: { backgroundColor: colors.bg, flex: 1 },
  section: { gap: 12 },
  stateContainer: {
    alignItems: 'center',
    backgroundColor: colors.bg,
    flex: 1,
    gap: 11,
    justifyContent: 'center',
    padding: 28,
  },
  stateError: {
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
  switchLabel: {
    color: colors.ink,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  switchRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  switchText: { flex: 1, gap: 3 },
  textArea: { minHeight: 108, paddingTop: 12 },
});

export default ImovelFormScreen;
