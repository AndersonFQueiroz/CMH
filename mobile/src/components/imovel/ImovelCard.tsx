import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '../common/Badge';
import { ImovelAvatar } from './ImovelAvatar';
import { colors, fonts, radii } from '../../theme';
import type { FinalidadeImovel, Imovel, TipoImovel } from '../../types/imovel';
import { formatArea, formatPreco } from '../../utils/format';

type ImovelCardData = Pick<
  Imovel,
  | 'titulo'
  | 'preco'
  | 'cidade'
  | 'tipo'
  | 'finalidade'
  | 'disponivel'
  | 'foto_url'
  | 'area_m2'
  | 'quartos'
  | 'banheiros'
  | 'vagas'
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

interface MetaProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

function Meta({ icon, label, value }: MetaProps): React.JSX.Element {
  return (
    <View accessibilityLabel={`${value} ${label}`} style={styles.metaItem}>
      <Ionicons color={colors.muted} name={icon} size={15} />
      <Text style={styles.metaText}>{value}</Text>
    </View>
  );
}

export function ImovelCard({ imovel, onPress }: ImovelCardProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityLabel={`${imovel.titulo}, ${formatPreco(imovel.preco, imovel.finalidade)}, ${imovel.cidade}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.media}>
        <ImovelAvatar fotoUrl={imovel.foto_url} style={styles.photo} />
        <LinearGradient
          colors={['rgba(9, 20, 18, 0)', 'rgba(9, 20, 18, 0.62)']}
          locations={[0.45, 1]}
          pointerEvents="none"
          style={styles.scrim}
        />
        <View style={styles.topRow}>
          <Badge label={FINALIDADE_LABELS[imovel.finalidade]} variant="photo" />
          <View style={styles.status}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: imovel.disponivel ? colors.available : colors.unavailable },
              ]}
            />
            <Text style={styles.statusText}>
              {imovel.disponivel ? 'Disponível' : 'Indisponível'}
            </Text>
          </View>
        </View>
        <View style={styles.priceTag}>
          <Text numberOfLines={1} style={styles.price}>
            {formatPreco(imovel.preco, imovel.finalidade)}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.kindRow}>
          <Text style={styles.kind}>{TIPO_LABELS[imovel.tipo]}</Text>
          <View style={styles.cityRow}>
            <Ionicons color={colors.muted} name="location-outline" size={13} />
            <Text numberOfLines={1} style={styles.city}>
              {imovel.cidade}
            </Text>
          </View>
        </View>
        <Text numberOfLines={2} style={styles.title}>
          {imovel.titulo}
        </Text>
        <View style={styles.metaRow}>
          <Meta icon="bed-outline" label="quartos" value={String(imovel.quartos)} />
          <Meta icon="water-outline" label="banheiros" value={String(imovel.banheiros)} />
          <Meta icon="car-outline" label="vagas" value={String(imovel.vagas)} />
          <Meta icon="resize-outline" label="de área" value={formatArea(imovel.area_m2)} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: { gap: 7, paddingHorizontal: 2 },
  card: { gap: 12 },
  city: {
    color: colors.muted,
    flexShrink: 1,
    fontFamily: fonts.body,
    fontSize: 12.5,
  },
  cityRow: { alignItems: 'center', flexDirection: 'row', flexShrink: 1, gap: 3 },
  kind: {
    color: colors.inkSoft,
    fontFamily: fonts.bodySemiBold,
    fontSize: 12.5,
  },
  kindRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  media: {
    backgroundColor: colors.bgDeep,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  metaItem: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, paddingTop: 2 },
  metaText: {
    color: colors.muted,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
  },
  photo: { aspectRatio: 4 / 3, borderRadius: 0, width: '100%' },
  pressed: { opacity: 0.9, transform: [{ scale: 0.988 }] },
  price: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 18,
    letterSpacing: -0.3,
  },
  priceTag: {
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    bottom: 12,
    left: 12,
    maxWidth: '82%',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scrim: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  status: {
    alignItems: 'center',
    backgroundColor: 'rgba(9, 20, 18, 0.55)',
    borderRadius: radii.sm,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusDot: { borderRadius: 4, height: 7, width: 7 },
  statusText: {
    color: colors.white,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 20,
    letterSpacing: -0.35,
    lineHeight: 25,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 12,
    position: 'absolute',
    right: 12,
    top: 12,
  },
});

export default ImovelCard;
