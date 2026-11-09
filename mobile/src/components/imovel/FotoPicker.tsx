import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import type { OrigemFoto } from '../../hooks/useImagePicker';
import type { FotoImovel } from '../../types/imovel';
import { BaseButton } from '../common/BaseButton';
import { ImovelAvatar } from './ImovelAvatar';

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
      : 'Nenhuma foto. Adicione uma foto da fachada.';
  const bloqueado = disabled || processando;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Foto da fachada</Text>
      <View style={[styles.preview, error && styles.previewError]}>
        {foto ? (
          <Image
            accessibilityLabel="Prévia da nova foto do imóvel"
            resizeMode="cover"
            source={{ uri: foto.uri }}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <ImovelAvatar fotoUrl={fotoAtualUrl} style={styles.avatar} />
        )}
        {processando ? (
          <View style={styles.overlay}>
            <ActivityIndicator color="#fff" size="large" />
            <Text style={styles.overlayText}>Preparando foto...</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.hint}>{legenda}</Text>

      <View style={styles.actions}>
        <BaseButton
          disabled={bloqueado}
          onPress={() => onSelecionar('camera')}
          style={styles.action}
          title={temFoto ? 'Nova foto' : 'Tirar foto'}
          variant="secondary"
        />
        <BaseButton
          disabled={bloqueado}
          onPress={() => onSelecionar('galeria')}
          style={styles.action}
          title={temFoto ? 'Trocar da galeria' : 'Galeria'}
          variant="secondary"
        />
      </View>
      {foto ? (
        <BaseButton
          disabled={bloqueado}
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
  error: { color: '#B3261E', fontSize: 13 },
  hint: { color: '#5F676D', fontSize: 13 },
  label: { color: '#30363B', fontSize: 14, fontWeight: '600' },
  overlay: {
    alignItems: 'center',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: 'rgba(32, 33, 36, 0.55)',
    gap: 8,
    justifyContent: 'center',
  },
  overlayText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  preview: {
    aspectRatio: 4 / 3,
    backgroundColor: '#E8F0FE',
    borderColor: '#C7CDD1',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    width: '100%',
  },
  previewError: { borderColor: '#B3261E' },
});

export default FotoPicker;
