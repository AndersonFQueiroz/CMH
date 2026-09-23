import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLayoutEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ImovelForm'>;

export function ImovelFormScreen({ navigation, route }: Props): React.JSX.Element {
  const editingId = route.params?.id;
  const isEditing = editingId !== undefined;

  const [titulo, setTitulo] = useState<string>('');

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? `Editar #${String(editingId)}` : 'Novo imóvel',
    });
  }, [navigation, isEditing, editingId]);

  const handleSave = (): void => {
    if (titulo.trim().length < 5) {
      Alert.alert('Validação', 'Título precisa de ao menos 5 caracteres.');
      return;
    }
    Alert.alert(
      'Rascunho salvo (mock)',
      isEditing ? `Edição do #${String(editingId)} validada.` : 'Criação validada.',
    );
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.mode}>
        {isEditing ? `Editando anúncio #${String(editingId)}` : 'Criando novo anúncio'}
      </Text>
      <Text>Título do anúncio</Text>
      <TextInput
        placeholder="Ex: Casa 3 quartos c/ quintal"
        style={styles.input}
        value={titulo}
        onChangeText={setTitulo}
      />
      <Button title={isEditing ? 'Salvar edição' : 'Criar anúncio'} onPress={handleSave} />
      <Text style={styles.hint}>
        Formulário completo (pickers, máscaras, foto) chega nas issues de CRUD.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
    padding: 16,
  },
  hint: {
    color: '#777',
    marginTop: 12,
  },
  input: {
    borderColor: '#ccc',
    borderRadius: 6,
    borderWidth: 1,
    padding: 10,
  },
  mode: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ImovelFormScreen;
