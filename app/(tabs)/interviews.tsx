import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useRecruiter } from "@/lib/recruiter-context";
import { trpcRecruiter } from "@/lib/trpc-recruiter";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ANDROID_PERFORMANCE_CONFIG, useAndroidBackButton } from "@/components/android-optimizations";

type FilterType = "all" | "scheduled" | "completed" | "cancelled";

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "scheduled", label: "Agendadas" },
  { key: "completed", label: "Realizadas" },
  { key: "cancelled", label: "Canceladas" },
];

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

function formatDateTime(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InterviewsScreen() {
  const colors = useColors();
  const { recruiter } = useRecruiter();
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchText, setSearchText] = useState("");
  useAndroidBackButton(); // Suporte a botão back do Android

  const { data: interviews, isLoading, refetch } = trpcRecruiter.interviews.list.useQuery(
    undefined,
    { enabled: !!recruiter }
  );

  const deleteMutation = trpcRecruiter.interviews.delete.useMutation({
    onSuccess: () => refetch(),
  });

  // Filtra por status e busca por nome/cargo
  const filtered = useMemo(() => {
    if (!interviews) return [];
    
    let result = interviews;
    
    // Filtro por status
    if (filter !== "all") {
      result = result.filter((i) => i.status === filter);
    }
    
    // Filtro por busca (nome ou cargo)
    if (searchText.trim()) {
      const query = searchText.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.candidateName.toLowerCase().includes(query) ||
          i.jobTitle.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [interviews, filter, searchText]);

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      "Remover entrevista",
      `Deseja remover a entrevista com ${name}? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => deleteMutation.mutate({ id }),
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: (typeof filtered)[0] }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => router.push(`/interview/${item.id}` as never)}
    >
      <View style={styles.cardLeft}>
        <View style={[styles.avatar, { backgroundColor: STATUS_COLORS[item.status] + "20" }]}>
          <Text style={[styles.avatarText, { color: STATUS_COLORS[item.status] }]}>
            {item.candidateName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.info}>
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
      <View style={styles.cardRight}>
        <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] + "20" }]}>
          <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] }]}>
            {STATUS_LABELS[item.status]}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.id, item.candidateName)}
        >
          <IconSymbol name="trash.fill" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Entrevistas</Text>
        <TouchableOpacity
          style={[styles.newBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/interview/new" as never)}
        >
          <IconSymbol name="plus" size={20} color="#fff" />
          <Text style={styles.newBtnText}>Nova</Text>
        </TouchableOpacity>
      </View>

      {/* Barra de Pesquisa */}
      <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Buscar por nome ou cargo..."
            placeholderTextColor={colors.muted}
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <IconSymbol name="xmark.circle.fill" size={18} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filtros */}
      <View style={[styles.filterRow, { borderBottomColor: colors.border }]}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterBtn,
              filter === f.key && { backgroundColor: colors.primary },
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === f.key ? "#fff" : colors.muted },
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 48 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isLoading}
          scrollEnabled={true}
          // Otimizações para Android
          {...(Platform.OS === "android" && ANDROID_PERFORMANCE_CONFIG)}
          ListEmptyComponent={
            <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>
                {searchText ? "🔍" : "🗂️"}
              </Text>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                {searchText ? "Nenhuma entrevista encontrada" : "Nenhuma entrevista encontrada"}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
                {searchText
                  ? `Nenhuma entrevista corresponde a "${searchText}"`
                  : filter === "all"
                  ? "Crie sua primeira entrevista tocando em Nova"
                  : `Não há entrevistas com status "${STATUS_LABELS[filter]}"`}
              </Text>
            </View>
          }
          ListFooterComponent={<View style={{ height: 32 }} />}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  title: { fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  newBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 0.5,
    overflow: "hidden",
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterText: { fontSize: 13, fontWeight: "600" },
  listContent: { padding: 16, gap: 10 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: "700" },
  info: { flex: 1 },
  candidateName: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  jobTitle: { fontSize: 13, marginBottom: 2 },
  dateTime: { fontSize: 12 },
  cardRight: { alignItems: "flex-end", gap: 8 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  deleteBtn: { padding: 4 },
  emptyBox: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
    marginTop: 24,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", textAlign: "center", marginBottom: 8 },
  emptySubtitle: { fontSize: 13, textAlign: "center", lineHeight: 20 },
});
