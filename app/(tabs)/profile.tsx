import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useRecruiter } from "@/lib/recruiter-context";
import { trpcRecruiter } from "@/lib/trpc-recruiter";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function ProfileScreen() {
  const colors = useColors();
  const { recruiter, logout } = useRecruiter();

  const { data: stats } = trpcRecruiter.recruiter.stats.useQuery(
    undefined,
    { enabled: !!recruiter }
  );

  const initials = recruiter?.name
    ? recruiter.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "R";

  const handleLogout = () => {
    Alert.alert(
      "Sair da conta",
      "Deseja encerrar sua sessão no ctBlun?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/login" as never);
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header do perfil */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatarLarge, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {recruiter?.name ?? "Recrutador"}
          </Text>
          <Text style={[styles.email, { color: colors.muted }]}>
            {recruiter?.email ?? ""}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: colors.primary + "20" }]}>
            <Text style={[styles.roleText, { color: colors.primary }]}>Recrutador</Text>
          </View>
        </View>

        {/* Estatísticas */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Resumo de avaliações
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.foreground }]}>
                {stats?.total ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Total</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.success }]}>
                {stats?.approved ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Aprovados</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.warning }]}>
                {stats?.onHold ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Em espera</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.error }]}>
                {stats?.rejected ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Reprovados</Text>
            </View>
          </View>
        </View>

        {/* Informações do app */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Sobre o ctBlun
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.muted }]}>Versão</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>1.0.0</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.muted }]}>Videoconferência</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>Jitsi Meet</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.muted }]}>Plataforma</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>Android / iOS</Text>
          </View>
        </View>

        {/* Botão de logout */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.error + "15", borderColor: colors.error + "40" }]}
          onPress={handleLogout}
        >
          <IconSymbol name="power" size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16 },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarText: { color: "#fff", fontSize: 32, fontWeight: "800" },
  name: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  email: { fontSize: 14 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 4 },
  roleText: { fontSize: 12, fontWeight: "700" },
  statsCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  statsGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: { alignItems: "center", flex: 1 },
  statNumber: { fontSize: 26, fontWeight: "800" },
  statLabel: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  statDivider: { width: 1, height: 40 },
  infoCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: "600" },
  divider: { height: 1 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
  },
  logoutText: { fontSize: 16, fontWeight: "700" },
});
