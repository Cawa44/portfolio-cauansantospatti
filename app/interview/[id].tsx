import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Share,
  StyleSheet,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpcRecruiter } from "@/lib/trpc-recruiter";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRecruiter } from "@/lib/recruiter-context";
import { useAndroidBackButton } from "@/components/android-optimizations";

const STATUS_COLORS: Record<string, string> = {
  scheduled: "#1A56DB",
  completed: "#10B981",
  cancelled: "#EF4444",
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendada",
  completed: "Realizada",
  cancelled: "Cancelada",
};

function formatFullDateTime(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InterviewDetailScreen() {
  const colors = useColors();
  const { recruiter } = useRecruiter();
  useAndroidBackButton(() => router.back()); // Suporte a botão back do Android
  const { id } = useLocalSearchParams<{ id: string }>();
  const interviewId = parseInt(id ?? "0");

  const { data: interview, isLoading, refetch } = trpcRecruiter.interviews.get.useQuery(
    { id: interviewId },
    { enabled: !!interviewId }
  );

  const { data: scorecard } = trpcRecruiter.scorecards.get.useQuery(
    { interviewId },
    { enabled: !!interviewId }
  );

  const updateMutation = trpcRecruiter.interviews.update.useMutation({
    onSuccess: () => refetch(),
  });

  const handleCopyLink = async () => {
    const link = `https://meet.jit.si/${interview?.roomName}`;
    try {
      await Share.share({ message: `Link da entrevista: ${link}` });
    } catch {
      Alert.alert("Link copiado", link);
    }
  };

  const handleMarkCompleted = () => {
    Alert.alert(
      "Marcar como realizada",
      "Confirma que esta entrevista foi realizada?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: () => updateMutation.mutate({ id: interviewId, status: "completed" }),
        },
      ]
    );
  };

  const handleStartCall = () => {
    router.push(`/call/${interview?.roomName}` as never);
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 48 }} />
      </ScreenContainer>
    );
  }

  if (!interview) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: colors.foreground }]}>
            Entrevista não encontrada
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backLink, { color: colors.primary }]}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const statusColor = STATUS_COLORS[interview.status] ?? "#6B7280";
  const canStart = interview.status === "scheduled";

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="arrow.left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Detalhe da Entrevista
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Card principal */}
        <View style={[styles.mainCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Avatar e nome */}
          <View style={styles.candidateRow}>
            <View style={[styles.avatar, { backgroundColor: statusColor + "20" }]}>
              <Text style={[styles.avatarText, { color: statusColor }]}>
                {interview.candidateName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.candidateInfo}>
              <Text style={[styles.candidateName, { color: colors.foreground }]}>
                {interview.candidateName}
              </Text>
              <Text style={[styles.jobTitle, { color: colors.muted }]}>
                {interview.jobTitle}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {STATUS_LABELS[interview.status]}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Data/hora */}
          <View style={styles.infoRow}>
            <IconSymbol name="clock.fill" size={16} color={colors.muted} />
            <Text style={[styles.infoText, { color: colors.foreground }]}>
              {formatFullDateTime(interview.scheduledAt)}
            </Text>
          </View>

          {/* Sala Jitsi */}
          <View style={styles.infoRow}>
            <IconSymbol name="video.fill" size={16} color={colors.muted} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoText, { color: colors.foreground }]}>
                {interview.roomName}
              </Text>
              <Text style={[styles.roomLink, { color: colors.primary }]}>
                meet.jit.si/{interview.roomName}
              </Text>
            </View>
          </View>

          {/* Observações */}
          {!!interview.notes && (
            <View style={styles.infoRow}>
              <IconSymbol name="clipboard.fill" size={16} color={colors.muted} />
              <Text style={[styles.infoText, { color: colors.foreground }]}>
                {interview.notes}
              </Text>
            </View>
          )}
        </View>

        {/* Scorecard resumo (se existir) */}
        {scorecard && (
          <View style={[styles.scorecardPreview, { backgroundColor: "#7C3AED15", borderColor: "#7C3AED40" }]}>
            <View style={styles.scorecardHeader}>
              <IconSymbol name="star.fill" size={16} color="#7C3AED" />
              <Text style={[styles.scorecardTitle, { color: "#7C3AED" }]}>
                Avaliação registrada
              </Text>
            </View>
            <Text style={[styles.scorecardRec, { color: colors.foreground }]}>
              Recomendação:{" "}
              <Text style={{ fontWeight: "700", color: scorecard.recommendation === "approved" ? colors.success : scorecard.recommendation === "rejected" ? colors.error : colors.warning }}>
                {scorecard.recommendation === "approved" ? "Aprovado" : scorecard.recommendation === "rejected" ? "Reprovado" : "Em espera"}
              </Text>
            </Text>
            <TouchableOpacity onPress={() => router.push(`/call/${interview.roomName}` as never)}>
              <Text style={[styles.editScorecard, { color: "#7C3AED" }]}>
                Ver / editar avaliação →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Ações */}
        <View style={styles.actions}>
          {canStart && (
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={handleStartCall}
            >
              <IconSymbol name="video.fill" size={22} color="#fff" />
              <Text style={styles.primaryBtnText}>Iniciar entrevista</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={handleCopyLink}
          >
            <IconSymbol name="square.and.arrow.up" size={20} color={colors.primary} />
            <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>
              Compartilhar link da sala
            </Text>
          </TouchableOpacity>

          {canStart && (
            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: colors.success + "40", backgroundColor: colors.success + "10" }]}
              onPress={handleMarkCompleted}
            >
              <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
              <Text style={[styles.secondaryBtnText, { color: colors.success }]}>
                Marcar como realizada
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  content: { padding: 20, gap: 16 },
  mainCard: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 14 },
  candidateRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 22, fontWeight: "700" },
  candidateInfo: { flex: 1 },
  candidateName: { fontSize: 18, fontWeight: "800", marginBottom: 2 },
  jobTitle: { fontSize: 14 },
  statusBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { fontSize: 12, fontWeight: "700" },
  divider: { height: 1 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  infoText: { fontSize: 14, flex: 1, lineHeight: 20 },
  roomLink: { fontSize: 12, marginTop: 2 },
  scorecardPreview: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 8 },
  scorecardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  scorecardTitle: { fontSize: 14, fontWeight: "700" },
  scorecardRec: { fontSize: 14 },
  editScorecard: { fontSize: 13, fontWeight: "600", marginTop: 4 },
  actions: { gap: 12 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 56,
    borderRadius: 16,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: "600" },
  errorContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  errorTitle: { fontSize: 18, fontWeight: "700" },
  backLink: { fontSize: 15, fontWeight: "600" },
});
