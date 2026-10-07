import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '../common/Badge';
import { ImovelAvatar } from './ImovelAvatar';
import type { FinalidadeImovel, Imovel, TipoImovel } from '../../types/imovel';
import { formatPreco } from '../../utils/format';

type ImovelCardData = Pick<
  Imovel,
  'titulo' | 'preco' | 'cidade' | 'tipo' | 'finalidade' | 'disponivel' | 'foto_url'
>;

interface ImovelCardProps {
  imovel: ImovelCardData;
  onPress: () => void;
}

const TIPO_LABELS: Record<TipoImovel, string> = {
  apartamento: 'Apartamento',
  casa: 'Casa',
  comercial: 'Comercial',
  kitnet: 'Kitnet',
  terreno: 'Terreno',
};

const FINALIDADE_LABELS: Record<FinalidadeImovel, string> = {
  aluguel: 'Aluguel',
  venda: 'Venda',
};

export function ImovelCard({ imovel, onPress }: ImovelCardProps): React.JSX.Element {
  const disponibilidade = imovel.disponivel ? 'Disponível' : 'Indisponível';

  return (
    <Pressable
      accessibilityLabel={`${imovel.titulo}, ${formatPreco(imovel.preco, imovel.finalidade)}, ${imovel.cidade}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <ImovelAvatar fotoUrl={imovel.foto_url} style={styles.photo} />
      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.title}>
          {imovel.titulo}
        </Text>
        <Text style={styles.price}>{formatPreco(imovel.preco, imovel.finalidade)}</Text>
        <Text numberOfLines={1} style={styles.city}>
          {imovel.cidade}
        </Text>
        <View style={styles.badges}>
          <Badge label={TIPO_LABELS[imovel.tipo]} variant="type" />
          <Badge label={FINALIDADE_LABELS[imovel.finalidade]} variant="purpose" />
          <Badge
            label={disponibilidade}
            variant={imovel.disponivel ? 'available' : 'unavailable'}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderColor: '#E0E4E7',
    borderRadius: 14,
    borderWidth: 1,
    elevation: 2,
    gap: 12,
    marginBottom: 14,
    padding: 12,
    shadowColor: '#202124',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  city: { color: '#5F676D', fontSize: 14 },
  content: { gap: 5 },
  photo: { height: 168, width: '100%' },
  price: { color: '#174EA6', fontSize: 18, fontWeight: '700' },
  pressed: { opacity: 0.9 },
  title: { color: '#202124', fontSize: 17, fontWeight: '700' },
});
