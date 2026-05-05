import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useRecruiter } from "@/lib/recruiter-context";
import { trpcRecruiter } from "@/lib/trpc-recruiter";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAndroidBackButton } from "@/components/android-optimizations";

function generateRoomName(candidateName: string): string {
  const slug = candidateName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 20);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `ctblun-${slug}-${suffix}`;
}

/**
 * Máscara para data: DD/MM/YYYY
 * Adiciona barras automaticamente enquanto o usuário digita
 */
function formatDate(text: string): string {
  const cleaned = text.replace(/\D/g, ""); // Remove tudo que não é número
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
}

/**
 * Máscara para hora: HH:MM
 * Adiciona dois-pontos automaticamente enquanto o usuário digita
 */
function formatTime(text: string): string {
  const cleaned = text.replace(/\D/g, ""); // Remove tudo que não é número
  if (cleaned.length <= 2) return cleaned;
  return `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`;
}

export default function NewInterviewScreen() {
  const colors = useColors();
  const { recruiter } = useRecruiter();
  useAndroidBackButton(() => router.back());

  const [candidateName, setCandidateName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [roomName, setRoomName] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = trpcRecruiter.interviews.create.useMutation({
    onSuccess: (data) => {
      Alert.alert(
        "Entrevista agendada!",
        `Sala criada: ${data.roomName}\n\nVocê pode entrar na videochamada pelo detalhe da entrevista.`,
        [{ text: "Ver entrevistas", onPress: () => router.replace("/(tabs)/interviews" as never) }]
      );
    },
    onError: (error) => {
      console.error("Erro ao criar entrevista:", error);
      Alert.alert("Erro", "Não foi possível criar a entrevista. Tente novamente.");
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!candidateName.trim() || candidateName.trim().length < 2) {
      newErrors.candidateName = "Informe o nome do candidato (mínimo 2 caracteres).";
    }
    if (!jobTitle.trim() || jobTitle.trim().length < 2) {
      newErrors.jobTitle = "Informe o cargo/vaga.";
    }
    if (!date.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      newErrors.date = "Informe a data no formato DD/MM/AAAA.";
    }
    if (!time.match(/^\d{2}:\d{2}$/)) {
      newErrors.time = "Informe o horário no formato HH:MM.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;

    try {
      // Converte data/hora para ISO
      const [day, month, year] = date.split("/");
      const [hour, minute] = time.split(":");
      const scheduledAt = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
      );

      if (isNaN(scheduledAt.getTime()) || scheduledAt < new Date()) {
        setErrors((e) => ({ ...e, date: "A data/hora deve ser no futuro." }));
        return;
      }

      const finalRoomName = roomName.trim() || generateRoomName(candidateName);

      console.log("Criando entrevista com dados:", {
        candidateName: candidateName.trim(),
        jobTitle: jobTitle.trim(),
        scheduledAt: scheduledAt.toISOString(),
        roomName: finalRoomName,
        notes: notes.trim() || undefined,
      });

      createMutation.mutate({
        candidateName: candidateName.trim(),
        jobTitle: jobTitle.trim(),
        scheduledAt: scheduledAt.toISOString(),
        roomName: finalRoomName,
        notes: notes.trim() || undefined,
      });
    } catch (error) {
      console.error("Erro ao processar formulário:", error);
      Alert.alert("Erro", "Erro ao processar o formulário.");
    }
  };

  const handleCandidateNameChange = (text: string) => {
    setCandidateName(text);
    if (text.trim().length >= 2 && !roomName) {
      setRoomName(generateRoomName(text));
    }
    setErrors((e) => ({ ...e, candidateName: "" }));
  };

  const handleDateChange = (text: string) => {
    const formatted = formatDate(text);
    setDate(formatted);
    setErrors((e) => ({ ...e, date: "" }));
  };

  const handleTimeChange = (text: string) => {
    const formatted = formatTime(text);
    setTime(formatted);
    setErrors((e) => ({ ...e, time: "" }));
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <IconSymbol name="arrow.left" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Nova Entrevista
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Candidato */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.muted }]}>Nome do candidato *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: errors.candidateName ? colors.error : colors.border,
                  color: colors.foreground,
                },
              ]}
              placeholder="Ex: João Silva"
              placeholderTextColor={colors.muted}
              value={candidateName}
              onChangeText={handleCandidateNameChange}
              autoCapitalize="words"
              returnKeyType="next"
            />
            {!!errors.candidateName && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.candidateName}
              </Text>
            )}
          </View>

          {/* Cargo */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.muted }]}>Cargo / Vaga *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: errors.jobTitle ? colors.error : colors.border,
                  color: colors.foreground,
                },
              ]}
              placeholder="Ex: Desenvolvedor Front-end"
              placeholderTextColor={colors.muted}
              value={jobTitle}
              onChangeText={(t) => {
                setJobTitle(t);
                setErrors((e) => ({ ...e, jobTitle: "" }));
              }}
              autoCapitalize="words"
              returnKeyType="next"
            />
            {!!errors.jobTitle && (
              <Text style={[styles.errorText, { color: colors.error }]}>{errors.jobTitle}</Text>
            )}
          </View>

          {/* Data e Hora */}
          <View style={styles.row}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.muted }]}>Data *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: errors.date ? colors.error : colors.border,
                    color: colors.foreground,
                  },
                ]}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={colors.muted}
                value={date}
                onChangeText={handleDateChange}
                keyboardType="numeric"
                maxLength={10}
                returnKeyType="next"
              />
              {!!errors.date && (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.date}</Text>
              )}
            </View>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.muted }]}>Horário *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: errors.time ? colors.error : colors.border,
                    color: colors.foreground,
                  },
                ]}
                placeholder="HH:MM"
                placeholderTextColor={colors.muted}
                value={time}
                onChangeText={handleTimeChange}
                keyboardType="numeric"
                maxLength={5}
                returnKeyType="next"
              />
              {!!errors.time && (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.time}</Text>
              )}
            </View>
          </View>

          {/* Nome da sala */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.muted }]}>
              Nome da sala Jitsi{" "}
              <Text style={{ color: colors.muted, fontWeight: "400" }}>
                (gerado automaticamente)
              </Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              placeholder="ctblun-nome-candidato-xxxxx"
              placeholderTextColor={colors.muted}
              value={roomName}
              onChangeText={setRoomName}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
            <Text style={[styles.hint, { color: colors.muted }]}>
              O link da sala será: meet.jit.si/{roomName || "ctblun-..."}
            </Text>
          </View>

          {/* Observações */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.muted }]}>Observações</Text>
            <TextInput
              style={[
                styles.textarea,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              placeholder="Notas sobre o candidato, requisitos da vaga..."
              placeholderTextColor={colors.muted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Botão */}
          <TouchableOpacity
            style={[
              styles.createBtn,
              { backgroundColor: colors.primary },
              createMutation.isPending && { opacity: 0.7 },
            ]}
            onPress={handleCreate}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={[styles.createBtnText, { color: colors.background }]}>
                Agendar Entrevista
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    height: 100,
  },
  hint: {
    fontSize: 12,
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  createBtn: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
