import { Stack } from "expo-router";

export default function CallLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="[roomId]"
        options={{
          // Tela cheia sem header para a videochamada
          presentation: "fullScreenModal",
        }}
      />
    </Stack>
  );
}
