import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useRecruiter } from "@/lib/recruiter-context";
import { trpcRecruiter } from "@/lib/trpc-recruiter";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useInterviewNotifications } from "@/hooks/use-interview-notifications";
import { useAndroidBackButton, ANDROID_PERFORMANCE_CONFIG } from "@/components/android-optimizations";

type Interview = {
  id: number;
  candidateName: string;
  jobTitle: string;
  roomName: string;
  scheduledAt: Date | string;
  status: "scheduled" | "completed" | "cancelled";
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function formatDateTime(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isToday(date: Date | string) {
  const d = new Date(date);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function isThisWeek(date: Date | string) {
  const d = new Date(date);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return d >= startOfWeek && d <= endOfWeek;
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendada",
  completed: "Realizada",
  cancelled: "Cancelada",
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: "#1A56DB",
  completed: "#10B981",
  cancelled: "#EF4444",
};

export default function DashboardScreen() {
  const colors = useColors();
  const { recruiter } = useRecruiter();
  useInterviewNotifications(); // Inicializa notificações
  useAndroidBackButton(); // Suporte a botão back do Android

  const { data: interviews, isLoading, refetch } = trpcRecruiter.interviews.list.useQuery(
    undefined,
    { enabled: !!recruiter }
  );

  const todayInterviews = useMemo(
    () => (interviews ?? []).filter((i) => isToday(i.scheduledAt) && i.status === "scheduled"),
    [interviews]
  );

  const weekInterviews = useMemo(
    () => (interviews ?? []).filter((i) => isThisWeek(i.scheduledAt) && i.status === "scheduled"),
    [interviews]
  );

  const upcomingInterviews = useMemo(
    () =>
      (interviews ?? [])
        .filter((i) => i.status === "scheduled")
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        .slice(0, 5),
    [interviews]
  );

  const firstName = recruiter?.name?.split(" ")[0] ?? "Recrutador";

  const renderInterview = ({ item }: { item: Interview }) => (
    <TouchableOpacity
      style={[styles.interviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => router.push(`/interview/${item.id}` as never)}
    >
      <View style={styles.interviewCardLeft}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {item.candidateName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.interviewInfo}>
          <Text style={[styles.candidateName, { color: colors.foreground }]} numberOfLines={1}>
            {item.candidateName}
          </Text>
          <Text style={[styles.jobTitle, { color: colors.muted }]} numberOfLines={1}>
            {item.jobTitle}
          </Text>
          <Text style={[styles.dateTime, { color: colors.muted }]}>
            {formatDateTime(item.scheduledAt)}
          </Text>
        </View>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[item.status] ?? "#6B7280") + "20" }]}>
        <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] ?? "#6B7280" }]}>
          {STATUS_LABELS[item.status] ?? item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      <FlatList
        data={upcomingInterviews}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderInterview}
        contentContainerStyle={styles.listContent}
        onRefresh={refetch}
        refreshing={isLoading}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={[styles.greeting, { color: colors.muted }]}>
                  {getGreeting()},
                </Text>
                <Text style={[styles.name, { color: colors.foreground }]}>
                  {firstName} 👋
                </Text>
              </View>
              <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
                <Text style={styles.logoText}>ct</Text>
              </View>
            </View>

            {/* Cards de resumo */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "40" }]}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>
                  {isLoading ? "—" : todayInterviews.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>Hoje</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.success + "15", borderColor: colors.success + "40" }]}>
                <Text style={[styles.statNumber, { color: colors.success }]}>
                  {isLoading ? "—" : weekInterviews.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>Esta semana</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.warning + "15", borderColor: colors.warning + "40" }]}>
                <Text style={[styles.statNumber, { color: colors.warning }]}>
                  {isLoading ? "—" : (interviews ?? []).filter((i) => i.status === "scheduled").length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>Agendadas</Text>
              </View>
            </View>

            {/* Título da lista */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Próximas entrevistas
              </Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/interviews" as never)}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>Ver todas</Text>
              </TouchableOpacity>
            </View>

            {isLoading && (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
            )}

            {!isLoading && upcomingInterviews.length === 0 && (
              <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>📋</Text>
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                  Nenhuma entrevista agendada
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
                  Crie sua primeira entrevista tocando no botão abaixo
                </Text>
              </View>
            )}
          </View>
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
      />

      {/* FAB — Nova Entrevista */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/interview/new" as never)}
      >
        <IconSymbol name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: { padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 8,
  },
  greeting: { fontSize: 14, fontWeight: "500" },
  name: { fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 28 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
  },
  statNumber: { fontSize: 28, fontWeight: "800" },
  statLabel: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  seeAll: { fontSize: 13, fontWeight: "600" },
  interviewCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  interviewCardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: "700" },
  interviewInfo: { flex: 1 },
  candidateName: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  jobTitle: { fontSize: 13, marginBottom: 2 },
  dateTime: { fontSize: 12 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginLeft: 8 },
  statusText: { fontSize: 11, fontWeight: "700" },
  emptyBox: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
    marginTop: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", textAlign: "center", marginBottom: 8 },
  emptySubtitle: { fontSize: 13, textAlign: "center", lineHeight: 20 },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
});
