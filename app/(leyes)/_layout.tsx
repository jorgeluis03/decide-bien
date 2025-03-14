import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function LeyesLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="detalle"
          options={{
            title: 'Detalles de Ley',
            headerTitleStyle: {
              fontWeight: 'medium',
            },
            headerShown: false,
          }}
        />
        <Stack.Screen name="votarLey"
          options={{
            title: 'Votar Ley',
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
