import { Stack } from "expo-router";
import { colors } from "../src/constants/theme";

export default function Layout() {
  return (
    <Stack screenOptions={{
      headerStyle: { backgroundColor: colors.card },
      headerTintColor: colors.text,
      headerTitleStyle: { fontWeight: "800" },
      headerShadowVisible: false,
      contentStyle: { backgroundColor: colors.background }
    }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="medicamentos/index" options={{ title: "Meus medicamentos" }} />
      <Stack.Screen name="medicamentos/novo" options={{ title: "Novo medicamento" }} />
      <Stack.Screen name="medicamentos/[id]" options={{ title: "Detalhes" }} />
      <Stack.Screen name="bula/[id]" options={{ title: "Bula" }} />
    </Stack>
  );
}
