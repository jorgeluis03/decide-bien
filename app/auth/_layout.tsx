import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function AuthLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="login"
          options={{
            title: 'Login',
            headerTitleStyle: {
              fontWeight: 'medium',
            },
            headerShown: false,
          }}
        />
        <Stack.Screen name="register"
          options={{
            title: 'Registro',
            headerTitleStyle: {
              fontWeight: 'medium',
            },
            headerShown: false,
          }}
        />
        <Stack.Screen name="completeProfile"
          options={{
            title: 'Completar Perfil',
            headerTitleStyle: {
              fontWeight: 'medium',
            },
            headerShown: false,
          }}
        />
        <Stack.Screen name="forgotPassword"
          options={{
            title: 'forgotPassword',
            headerTitleStyle: {
              fontWeight: 'medium',
            },
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
