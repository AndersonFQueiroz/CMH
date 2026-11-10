/// <reference types="node" />
// Substituto mínimo do react-native para testes de UI sob Node/tsx: o pacote
// real só é carregado pelo Metro e não pode ser exigido em Node. O arquivo
// instala o patch no loader de módulos no import e precisa ser importado
// ANTES de qualquer tela ou componente que importe 'react-native'.
import { createElement, type ReactElement, type ReactNode } from 'react';

type HostProps = Record<string, unknown>;

function criarHost(nome: string) {
  return function Host(props: HostProps): ReactElement {
    return createElement(nome, props);
  };
}

export interface BotaoDoAlerta {
  text: string;
  style?: string;
  onPress?: () => void;
}

export interface ChamadaDoAlerta {
  titulo: string;
  mensagem: string;
  botoes: BotaoDoAlerta[];
}

/** Chamadas registradas por Alert.alert, na ordem em que ocorreram. */
export const chamadasDoAlerta: ChamadaDoAlerta[] = [];

/** Último `data` recebido pela FlatList (null enquanto nenhuma é renderizada). */
export const flatList: { dados: unknown[] | null } = { dados: null };

const Alert = {
  alert(titulo: string, mensagem?: string, botoes?: readonly BotaoDoAlerta[]): void {
    chamadasDoAlerta.push({
      titulo,
      mensagem: mensagem ?? '',
      botoes: (botoes ?? []).map((botao) => ({ ...botao })),
    });
  },
};

function achatarEstilo(estilo: unknown): Record<string, unknown> {
  if (Array.isArray(estilo)) {
    return Object.assign({}, ...estilo.map(achatarEstilo));
  }
  return typeof estilo === 'object' && estilo !== null ? (estilo as Record<string, unknown>) : {};
}

const StyleSheet = {
  absoluteFill: { bottom: 0, left: 0, position: 'absolute' as const, right: 0, top: 0 },
  create: <T extends Record<string, unknown>>(estilos: T): T => estilos,
  flatten: achatarEstilo,
  hairlineWidth: 1,
};

const FlatList = (props: HostProps): ReactElement => {
  const dados = Array.isArray(props.data) ? (props.data as unknown[]) : [];
  flatList.dados = dados;
  const renderItem = props.renderItem as
    | ((info: { item: unknown }) => ReactNode)
    | undefined;
  const itens = renderItem ? dados.map((item) => renderItem({ item })) : [];
  return createElement(
    'flatlist',
    { onEndReached: props.onEndReached, refreshControl: props.refreshControl },
    (props.ListHeaderComponent ?? null) as ReactNode,
    itens.length > 0 ? itens : ((props.ListEmptyComponent ?? null) as ReactNode),
    (props.ListFooterComponent ?? null) as ReactNode,
  );
};

const mockRN = {
  ActivityIndicator: criarHost('activityindicator'),
  Alert,
  Button: criarHost('button'),
  FlatList,
  Image: criarHost('image'),
  Linking: { openURL: async (): Promise<void> => undefined },
  Platform: {
    OS: 'ios',
    select: <T,>(opcoes: { android?: T; default?: T; ios?: T; native?: T }): T | undefined =>
      opcoes.ios ?? opcoes.default,
  },
  Pressable: criarHost('pressable'),
  RefreshControl: criarHost('refreshcontrol'),
  ScrollView: criarHost('scrollview'),
  StyleSheet,
  Text: criarHost('text'),
  TextInput: criarHost('textinput'),
  View: criarHost('view'),
};

const Ionicons = Object.assign(criarHost('ionicons'), { glyphMap: {} });
const SafeAreaProvider = ({ children }: { children?: ReactNode }): ReactNode => children ?? null;
const statusBar = (): null => null;

const modulosMock: Record<string, unknown> = {
  '@expo/vector-icons/Ionicons': { __esModule: true, default: Ionicons },
  '@react-navigation/native': { __esModule: true, useIsFocused: () => true },
  'expo-linear-gradient': { __esModule: true, LinearGradient: criarHost('lineargradient') },
  'expo-status-bar': { __esModule: true, StatusBar: statusBar },
  'react-native': mockRN,
  'react-native-safe-area-context': {
    __esModule: true,
    SafeAreaProvider,
    useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
  },
};

type FuncaoLoad = (request: string, parent: NodeJS.Module | null, isMain: boolean) => unknown;

const Modulo = require('node:module') as unknown as { _load: FuncaoLoad };
const carregarOriginal = Modulo._load.bind(Modulo);
Modulo._load = (request, parent, isMain) =>
  request in modulosMock
    ? modulosMock[request]
    : carregarOriginal(request, parent, isMain);

export default mockRN;
