/**
 * ScorecardModal — Avaliação privada do recrutador.
 *
 * Este modal é sobreposto à videochamada Jitsi Meet e é visível
 * APENAS para o recrutador logado. O candidato não tem acesso a
 * estas informações em nenhum momento.
 *
 * Funcionalidades:
 * - Avaliação por critérios com estrelas (1–5)
 * - Campos de texto livre (pontos fortes e de melhoria)
 * - Recomendação final (Aprovado / Em espera / Reprovado)
 * - Salvamento automático ao fechar
 * - Carrega avaliação existente se já foi preenchida antes
 */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { trpcRecruiter } from "@/lib/trpc-recruiter";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

type Recommendation = "approved" | "on_hold" | "rejected";

type ScorecardData = {
  communication: number;
  technicalSkills: number;
  culturalFit: number;
  proactivity: number;
  presentation: number;
  strengths: string;
  improvements: string;
  recommendation: Recommendation;
};

const INITIAL_DATA: ScorecardData = {
  communication: 0,
  technicalSkills: 0,
  culturalFit: 0,
  proactivity: 0,
  presentation: 0,
  strengths: "",
  improvements: "",
  recommendation: "on_hold",
};

const CRITERIA = [
  { key: "communication" as const, label: "Comunicação", icon: "💬" },
  { key: "technicalSkills" as const, label: "Conhecimento Técnico", icon: "🧠" },
  { key: "culturalFit" as const, label: "Fit Cultural", icon: "🤝" },
  { key: "proactivity" as const, label: "Proatividade", icon: "⚡" },
  { key: "presentation" as const, label: "Apresentação Pessoal", icon: "✨" },
];

const RECOMMENDATIONS: { key: Recommendation; label: string; color: string; emoji: string }[] = [
  { key: "approved", label: "Aprovado", color: "#10B981", emoji: "✅" },
  { key: "on_hold", label: "Em espera", color: "#F59E0B", emoji: "⏳" },
  { key: "rejected", label: "Reprovado", color: "#EF4444", emoji: "❌" },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  interviewId: number;
  candidateName: string;
};

function StarRating({
  value,
  onChange,
  color,
}: {
  value: number;
  onChange: (v: number) => void;
  color: string;
}) {
  return (
    <View style={starStyles.row}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onChange(star)}
          style={starStyles.star}
        >
          <Text style={{ fontSize: 28, opacity: star <= value ? 1 : 0.25 }}>
            ⭐
          </Text>
        </TouchableOpacity>
      ))}
      <Text style={[starStyles.valueText, { color }]}>
        {value > 0 ? `${value}/5` : "—"}
      </Text>
    </View>
  );
}

const starStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 2 },
  star: { padding: 2 },
  valueText: { fontSize: 13, fontWeight: "700", marginLeft: 6 },
});

export default function ScorecardModal({ visible, onClose, interviewId, candidateName }: Props) {
  const colors = useColors();
  const [data, setData] = useState<ScorecardData>(INITIAL_DATA);
  const [isDirty, setIsDirty] = useState(false);

  // Carrega scorecard existente
  const { data: existing, isLoading: loadingExisting } = trpcRecruiter.scorecards.get.useQuery(
    { interviewId },
    { enabled: visible && !!interviewId }
  );

  // Preenche o formulário com dados existentes ao abrir
  useEffect(() => {
    if (existing && visible) {
      setData({
        communication: existing.communication,
        technicalSkills: existing.technicalSkills,
        culturalFit: existing.culturalFit,
        proactivity: existing.proactivity,
        presentation: existing.presentation,
        strengths: existing.strengths ?? "",
        improvements: existing.improvements ?? "",
        recommendation: existing.recommendation as Recommendation,
      });
      setIsDirty(false);
    } else if (!existing && visible) {
      setData(INITIAL_DATA);
      setIsDirty(false);
    }
  }, [existing, visible]);

  const saveMutation = trpcRecruiter.scorecards.save.useMutation({
    onSuccess: () => {
      setIsDirty(false);
      Alert.alert("Avaliação salva!", "O scorecard foi salvo com sucesso.");
    },
    onError: () => {
      Alert.alert("Erro", "Não foi possível salvar a avaliação. Tente novamente.");
    },
  });

  const update = (field: keyof ScorecardData, value: number | string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    if (!interviewId) {
      Alert.alert("Erro", "Entrevista não identificada. Volte e tente novamente.");
      return;
    }
    saveMutation.mutate({
      interviewId,
      ...data,
    });
  };

  const handleClose = () => {
    if (isDirty) {
      Alert.alert(
        "Salvar avaliação?",
        "Você tem alterações não salvas. Deseja salvar antes de fechar?",
        [
          { text: "Descartar", style: "destructive", onPress: onClose },
          { text: "Salvar", onPress: () => { handleSave(); onClose(); } },
          { text: "Continuar editando", style: "cancel" },
        ]
      );
    } else {
      onClose();
    }
  };

  const avgScore = CRITERIA.reduce((acc, c) => acc + data[c.key], 0) / CRITERIA.length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header do modal */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.privateBadge, { backgroundColor: "#7C3AED20" }]}>
              <Text style={[styles.privateText, { color: "#7C3AED" }]}>🔒 Privado</Text>
            </View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              Avaliação
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
              {candidateName}
            </Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {loadingExisting ? (
          <ActivityIndicator color="#7C3AED" style={{ marginTop: 48 }} />
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
            >
              {/* Pontuação média */}
              {avgScore > 0 && (
                <View style={[styles.avgCard, { backgroundColor: "#7C3AED15", borderColor: "#7C3AED30" }]}>
                  <Text style={[styles.avgLabel, { color: "#7C3AED" }]}>Média geral</Text>
                  <Text style={[styles.avgScore, { color: "#7C3AED" }]}>
                    {avgScore.toFixed(1)} / 5.0
                  </Text>
                </View>
              )}

              {/* Critérios de avaliação */}
              <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  Critérios de avaliação
                </Text>
                {CRITERIA.map((criterion) => (
                  <View key={criterion.key} style={styles.criterionRow}>
                    <View style={styles.criterionLabel}>
                      <Text style={{ fontSize: 18 }}>{criterion.icon}</Text>
                      <Text style={[styles.criterionText, { color: colors.foreground }]}>
                        {criterion.label}
                      </Text>
                    </View>
                    <StarRating
                      value={data[criterion.key]}
                      onChange={(v) => update(criterion.key, v)}
                      color="#7C3AED"
                    />
                  </View>
                ))}
              </View>

              {/* Pontos fortes */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.muted }]}>
                  💪 Pontos fortes
                </Text>
                <TextInput
                  style={[styles.textarea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="Descreva os pontos positivos observados durante a entrevista..."
                  placeholderTextColor={colors.muted}
                  value={data.strengths}
                  onChangeText={(t) => update("strengths", t)}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              {/* Pontos de melhoria */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.muted }]}>
                  📈 Pontos de melhoria
                </Text>
                <TextInput
                  style={[styles.textarea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="Aspectos que o candidato pode desenvolver..."
                  placeholderTextColor={colors.muted}
                  value={data.improvements}
                  onChangeText={(t) => update("improvements", t)}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              {/* Recomendação final */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.muted }]}>
                  🎯 Recomendação final
                </Text>
                <View style={styles.recommendationRow}>
                  {RECOMMENDATIONS.map((rec) => (
                    <TouchableOpacity
                      key={rec.key}
                      style={[
                        styles.recBtn,
                        {
                          borderColor: data.recommendation === rec.key ? rec.color : colors.border,
                          backgroundColor:
                            data.recommendation === rec.key
                              ? rec.color + "20"
                              : colors.surface,
                        },
                      ]}
                      onPress={() => update("recommendation", rec.key)}
                    >
                      <Text style={{ fontSize: 20 }}>{rec.emoji}</Text>
                      <Text
                        style={[
                          styles.recText,
                          {
                            color:
                              data.recommendation === rec.key ? rec.color : colors.muted,
                          },
                        ]}
                      >
                        {rec.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Botão salvar */}
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  { backgroundColor: "#7C3AED" },
                  saveMutation.isPending && { opacity: 0.7 },
                ]}
                onPress={handleSave}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <IconSymbol name="checkmark.circle.fill" size={20} color="#fff" />
                    <Text style={styles.saveBtnText}>Salvar avaliação</Text>
                  </>
                )}
              </TouchableOpacity>

              {isDirty && (
                <Text style={[styles.unsavedHint, { color: colors.warning }]}>
                  ⚠️ Alterações não salvas
                </Text>
              )}

              <View style={{ height: 40 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
  },
  headerLeft: { gap: 4 },
  privateBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 4,
  },
  privateText: { fontSize: 11, fontWeight: "700" },
  headerTitle: { fontSize: 20, fontWeight: "800" },
  headerSubtitle: { fontSize: 14 },
  closeBtn: { padding: 4 },
  content: { padding: 20, gap: 16 },
  avgCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avgLabel: { fontSize: 14, fontWeight: "600" },
  avgScore: { fontSize: 24, fontWeight: "800" },
  section: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  criterionRow: { gap: 8 },
  criterionLabel: { flexDirection: "row", alignItems: "center", gap: 8 },
  criterionText: { fontSize: 14, fontWeight: "600" },
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 14, fontWeight: "600" },
  textarea: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 90,
    lineHeight: 20,
  },
  recommendationRow: { flexDirection: "row", gap: 10 },
  recBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 2,
    padding: 12,
    alignItems: "center",
    gap: 6,
  },
  recText: { fontSize: 12, fontWeight: "700", textAlign: "center" },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 54,
    borderRadius: 16,
    marginTop: 8,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  unsavedHint: { textAlign: "center", fontSize: 13, fontWeight: "600" },
});
