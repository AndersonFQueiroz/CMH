import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ImovelDetailScreen from '../screens/ImovelDetailScreen';
import ImovelFormScreen from '../screens/ImovelFormScreen';
import ImovelListScreen from '../screens/ImovelListScreen';
import { colors, fonts } from '../theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      initialRouteName="ImovelList"
      screenOptions={{
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.ink,
        headerTitleAlign: 'left',
        headerTitleStyle: {
          color: colors.ink,
          fontFamily: fonts.bodySemiBold,
          fontSize: 16.5,
        },
      }}
    >
      <Stack.Screen
        component={ImovelListScreen}
        name="ImovelList"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={ImovelDetailScreen}
        name="ImovelDetail"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={ImovelFormScreen}
        name="ImovelForm"
        options={({ route }) => ({
          headerBackTitle: 'Voltar',
          title: route.params?.id !== undefined ? 'Editar anúncio' : 'Novo anúncio',
        })}
      />
    </Stack.Navigator>
  );
}

export default AppNavigator;
