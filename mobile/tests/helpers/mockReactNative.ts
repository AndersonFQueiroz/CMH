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

const StyleSheet = {
  absoluteFill: { bottom: 0, left: 0, position: 'absolute' as const, right: 0, top: 0 },
  create: <T extends Record<string, unknown>>(estilos: T): T => estilos,
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
  Platform: { OS: 'ios' },
  Pressable: criarHost('pressable'),
  RefreshControl: criarHost('refreshcontrol'),
  ScrollView: criarHost('scrollview'),
  StyleSheet,
  Text: criarHost('text'),
  TextInput: criarHost('textinput'),
  View: criarHost('view'),
};

type FuncaoLoad = (request: string, parent: NodeJS.Module | null, isMain: boolean) => unknown;

const Modulo = require('node:module') as unknown as { _load: FuncaoLoad };
const carregarOriginal = Modulo._load.bind(Modulo);
Modulo._load = (request, parent, isMain) =>
  request === 'react-native' ? mockRN : carregarOriginal(request, parent, isMain);

export default mockRN;
