import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Alert, Linking } from 'react-native';

import type { FotoImovel } from '../types/imovel';
import { fotoJpeg, larguraRedimensionada, QUALIDADE_FOTO } from '../utils/foto';

export type OrigemFoto = 'camera' | 'galeria';

interface UseImagePickerResult {
  /** Abre a câmera ou a galeria; retorna `null` se o usuário cancelar ou negar a permissão. */
  selecionarFoto: (origem: OrigemFoto) => Promise<FotoImovel | null>;
  processando: boolean;
}

const OPCOES_PICKER: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [4, 3],
  quality: 1,
};

async function pedirPermissao(origem: OrigemFoto): Promise<boolean> {
  const permissao =
    origem === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (permissao.granted) return true;

  const recurso = origem === 'camera' ? 'à câmera' : 'às fotos';
  const mensagem = `Para adicionar a foto da fachada, permita o acesso ${recurso} do aparelho.`;
  if (permissao.canAskAgain) {
    Alert.alert('Permissão necessária', mensagem);
  } else {
    Alert.alert('Permissão necessária', `${mensagem} Ative a permissão nas configurações.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Abrir configurações', onPress: () => void Linking.openSettings() },
    ]);
  }
  return false;
}

/** Reduz a largura e grava como JPEG comprimido para respeitar o limite de 2 MB da API. */
async function comprimir(asset: ImagePicker.ImagePickerAsset): Promise<FotoImovel> {
  const contexto = ImageManipulator.manipulate(asset.uri);
  const largura = larguraRedimensionada(asset.width);
  if (largura) contexto.resize({ width: largura });

  const imagem = await contexto.renderAsync();
  const resultado = await imagem.saveAsync({ compress: QUALIDADE_FOTO, format: SaveFormat.JPEG });
  return fotoJpeg(resultado.uri);
}

export function useImagePicker(): UseImagePickerResult {
  const [processando, setProcessando] = useState(false);

  const selecionarFoto = useCallback(async (origem: OrigemFoto): Promise<FotoImovel | null> => {
    try {
      if (!(await pedirPermissao(origem))) return null;

      const resultado =
        origem === 'camera'
          ? await ImagePicker.launchCameraAsync(OPCOES_PICKER)
          : await ImagePicker.launchImageLibraryAsync(OPCOES_PICKER);
      const asset = resultado.canceled ? undefined : resultado.assets[0];
      if (!asset) return null;

      setProcessando(true);
      return await comprimir(asset);
    } catch {
      Alert.alert(
        'Foto não carregada',
        origem === 'camera'
          ? 'Não foi possível usar a câmera. Tente novamente ou escolha da galeria.'
          : 'Não foi possível carregar a foto escolhida. Tente outra imagem.',
      );
      return null;
    } finally {
      setProcessando(false);
    }
  }, []);

  return { selecionarFoto, processando };
}
