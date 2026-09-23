import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ImovelDetailScreen from '../screens/ImovelDetailScreen';
import ImovelFormScreen from '../screens/ImovelFormScreen';
import ImovelListScreen from '../screens/ImovelListScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      initialRouteName="ImovelList"
      screenOptions={{ headerTitleAlign: 'center' }}
    >
      <Stack.Screen
        name="ImovelList"
        component={ImovelListScreen}
        options={{ title: 'Imóveis' }}
      />
      <Stack.Screen
        name="ImovelDetail"
        component={ImovelDetailScreen}
        options={{ title: 'Detalhe' }}
      />
      <Stack.Screen
        name="ImovelForm"
        component={ImovelFormScreen}
        options={({ route }) => ({
          title: route.params?.id !== undefined ? 'Editar imóvel' : 'Novo imóvel',
        })}
      />
    </Stack.Navigator>
  );
}

export default AppNavigator;
