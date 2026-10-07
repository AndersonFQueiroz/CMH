import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge } from '../components/common/Badge';
import { BaseButton } from '../components/common/BaseButton';
import { Loader } from '../components/common/Loader';
import { ImovelAvatar } from '../components/imovel/ImovelAvatar';
import type { RootStackParamList } from '../navigation/types';
import imovelService from '../services/imovelService';
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

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Não foi possível carregar este imóvel.';
}

export function ImovelDetailScreen({ navigation, route }: Props): React.JSX.Element {
  const { id } = route.params;
  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  useLayoutEffect(() => {
    navigation.setOptions({ title: imovel?.titulo ?? 'Detalhes do imóvel' });
  }, [imovel?.titulo, navigation]);

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

  const tentarNovamente = useCallback(() => setRetryKey((atual) => atual + 1), []);

  if (isLoading && !imovel) {
    return (
      <View style={styles.stateContainer}>
        <Loader message="Carregando detalhes do imóvel..." />
      </View>
    );
  }

  if (erro || !imovel) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.error}>{erro ?? 'Imóvel não encontrado.'}</Text>
        <BaseButton onPress={tentarNovamente} title="Tentar novamente" />
        <BaseButton onPress={() => navigation.goBack()} title="Voltar" variant="text" />
      </View>
    );
  }

  const disponibilidade = imovel.disponivel ? 'Disponível' : 'Indisponível';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImovelAvatar fotoUrl={imovel.foto_url} style={styles.photo} />
      <Text style={styles.title}>{imovel.titulo}</Text>
      <Text style={styles.price}>{formatPreco(imovel.preco, imovel.finalidade)}</Text>
      <Text style={styles.city}>{imovel.cidade}</Text>

      <View style={styles.badges}>
        <Badge label={TIPO_LABELS[imovel.tipo]} variant="type" />
        <Badge label={FINALIDADE_LABELS[imovel.finalidade]} variant="purpose" />
        <Badge
          label={disponibilidade}
          variant={imovel.disponivel ? 'available' : 'unavailable'}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre o imóvel</Text>
        <Text style={styles.description}>{imovel.descricao || 'Sem descrição informada.'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Características</Text>
        <DetailRow label="Área" value={formatArea(imovel.area_m2)} />
        <DetailRow label="Quartos" value={String(imovel.quartos)} />
        <DetailRow label="Banheiros" value={String(imovel.banheiros)} />
        <DetailRow label="Vagas" value={String(imovel.vagas)} />
        <DetailRow label="Disponível a partir de" value={formatDataBR(imovel.data_disponibilidade)} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Localização e contato</Text>
        <DetailRow label="Endereço" value={imovel.endereco} />
        <DetailRow label="Cidade" value={imovel.cidade} />
        <DetailRow label="Telefone" value={formatTelefone(imovel.contato_telefone)} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datas do anúncio</Text>
        <DetailRow label="Publicado em" value={formatDataBR(imovel.created_at)} />
        <DetailRow label="Atualizado em" value={formatDataBR(imovel.updated_at)} />
      </View>

      <View style={styles.actions}>
        <BaseButton
          onPress={() => navigation.navigate('ImovelForm', { id })}
          title="Editar anúncio"
        />
        <BaseButton onPress={() => navigation.goBack()} title="Voltar" variant="secondary" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  actions: { gap: 10, marginTop: 4 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  city: { color: '#5F676D', fontSize: 15 },
  container: { gap: 14, padding: 16, paddingBottom: 32 },
  description: { color: '#41484D', fontSize: 15, lineHeight: 22 },
  detailLabel: { color: '#5F676D', flex: 1, fontSize: 14 },
  detailRow: {
    borderBottomColor: '#E7EAED',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
  },
  detailValue: {
    color: '#202124',
    flex: 1.4,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
  },
  error: { color: '#B3261E', fontSize: 15, textAlign: 'center' },
  photo: { height: 230, width: '100%' },
  price: { color: '#174EA6', fontSize: 23, fontWeight: '700' },
  section: { gap: 8, paddingTop: 6 },
  sectionTitle: { color: '#202124', fontSize: 17, fontWeight: '700' },
  stateContainer: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
  title: { color: '#202124', fontSize: 23, fontWeight: '700' },
});

export default ImovelDetailScreen;
