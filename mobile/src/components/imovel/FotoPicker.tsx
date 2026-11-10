import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import type { OrigemFoto } from '../../hooks/useImagePicker';
import type { FotoImovel } from '../../types/imovel';
import { BaseButton } from '../common/BaseButton';
import { ImovelAvatar } from './ImovelAvatar';
import { colors, fonts, radii } from '../../theme';

interface FotoPickerProps {
  /** Foto nova escolhida neste formulário (ainda não enviada). */
  foto: FotoImovel | null;
  /** Foto já salva no anúncio, exibida na edição enquanto nenhuma nova é escolhida. */
  fotoAtualUrl?: string | null;
  onSelecionar: (origem: OrigemFoto) => void;
  onRemover: () => void;
  processando?: boolean;
  disabled?: boolean;
  error?: string;
}

/** Preview da foto da fachada com ações de câmera, galeria e remoção. */
export function FotoPicker({
  foto,
  fotoAtualUrl = null,
  onSelecionar,
  onRemover,
  processando = false,
  disabled = false,
  error,
}: FotoPickerProps): React.JSX.Element {
  const temFoto = Boolean(foto ?? fotoAtualUrl);
  const legenda = foto
    ? 'Nova foto selecionada. Ela será enviada ao salvar.'
    : fotoAtualUrl
      ? 'Foto atual do anúncio.'
      : 'Use uma foto horizontal da fachada. JPG, PNG ou WEBP até 2 MB.';
  const bloqueado = disabled || processando;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Foto da fachada</Text>
      <View style={[styles.preview, !temFoto && styles.previewEmpty, error && styles.previewError]}>
        {foto ? (
          <>
            <Image
              accessibilityLabel="Prévia da nova foto do imóvel"
              resizeMode="cover"
              source={{ uri: foto.uri }}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={['rgba(9, 20, 18, 0)', 'rgba(9, 20, 18, 0.48)']}
              pointerEvents="none"
              style={styles.scrim}
            />
            <View style={styles.previewTag}>
              <Ionicons color={colors.white} name="image-outline" size={15} />
              <Text style={styles.previewTagText}>Nova foto</Text>
            </View>
          </>
        ) : fotoAtualUrl ? (
          <ImovelAvatar fotoUrl={fotoAtualUrl} style={styles.avatar} />
        ) : null}

        {!temFoto ? (
          <View pointerEvents="none" style={styles.emptyContent}>
            <View style={styles.emptyIcon}>
              <Ionicons color={colors.accent} name="camera-outline" size={26} />
            </View>
            <Text style={styles.emptyTitle}>Adicione a fachada</Text>
            <Text style={styles.emptyHint}>Uma boa foto vende mais rápido.</Text>
          </View>
        ) : null}

        {processando ? (
          <View style={styles.overlay}>
            <ActivityIndicator color={colors.white} size="large" />
            <Text style={styles.overlayText}>Preparando foto...</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.hint}>{legenda}</Text>

      <View style={styles.actions}>
        <BaseButton
          disabled={bloqueado}
          icon="camera-outline"
          onPress={() => onSelecionar('camera')}
          style={styles.action}
          title={temFoto ? 'Nova foto' : 'Câmera'}
          variant="secondary"
        />
        <BaseButton
          disabled={bloqueado}
          icon="images-outline"
          onPress={() => onSelecionar('galeria')}
          style={styles.action}
          title="Galeria"
          variant="secondary"
        />
      </View>
      {foto ? (
        <BaseButton
          disabled={bloqueado}
          icon="close"
          onPress={onRemover}
          title={fotoAtualUrl ? 'Descartar nova foto' : 'Remover foto'}
          variant="text"
        />
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  action: { flex: 1 },
  actions: { flexDirection: 'row', gap: 10 },
  avatar: { borderRadius: 0, height: '100%', width: '100%' },
  container: { gap: 8 },
  emptyContent: {
    alignItems: 'center',
    bottom: 0,
    gap: 6,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  emptyHint: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 12.5,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    marginBottom: 2,
    width: 52,
  },
  emptyTitle: {
    color: colors.ink,
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
  },
  error: { color: colors.danger, fontFamily: fonts.body, fontSize: 12.5 },
  hint: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
  },
  label: {
    color: colors.inkSoft,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(9, 20, 18, 0.58)',
    bottom: 0,
    gap: 8,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  overlayText: {
    color: colors.white,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  preview: {
    aspectRatio: 4 / 3,
    backgroundColor: colors.accentTint,
    borderRadius: radii.lg,
    overflow: 'hidden',
    width: '100%',
  },
  previewEmpty: {
    borderColor: colors.lineStrong,
    borderStyle: 'dashed',
    borderWidth: 1.5,
  },
  previewError: { borderColor: colors.danger, borderStyle: 'solid' },
  previewTag: {
    alignItems: 'center',
    backgroundColor: 'rgba(9, 20, 18, 0.62)',
    borderRadius: radii.sm,
    bottom: 12,
    flexDirection: 'row',
    gap: 6,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    position: 'absolute',
  },
  previewTagText: {
    color: colors.white,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
  },
  scrim: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
});
