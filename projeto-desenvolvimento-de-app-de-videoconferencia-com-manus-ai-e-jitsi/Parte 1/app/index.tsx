/**
 * Tela de entrada do ctBlun.
 * Verifica se o recrutador está autenticado e redireciona adequadamente.
 */
import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useRecruiter } from "@/lib/recruiter-context";
import { useColors } from "@/hooks/use-colors";

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useRecruiter();
  const colors = useColors();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      router.replace("/(tabs)");
    } else {
      router.replace("/login" as never);
    }
  }, [isAuthenticated, isLoading]);

  return (
    <View style={[styles.container, { backgroundColor: "#1A2540" }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
