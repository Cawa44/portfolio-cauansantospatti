import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useRecruiter } from "@/lib/recruiter-context";
import { trpcRecruiter } from "@/lib/trpc-recruiter";
import { useColors } from "@/hooks/use-colors";

export default function RegisterScreen() {
  const colors = useColors();
  const { login } = useRecruiter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const registerMutation = trpcRecruiter.recruiter.register.useMutation({
    onSuccess: async (data) => {
      await login(data.token, {
        id: data.id,
        name: data.name,
        email: data.email,
      });
      router.replace("/(tabs)");
    },
    onError: (err) => {
      if (err.message.includes("EMAIL_ALREADY_EXISTS")) {
        setError("Este email já está cadastrado. Tente fazer login.");
      } else {
        setError("Erro ao criar conta. Tente novamente.");
      }
    },
  });

  const handleRegister = () => {
    setError("");
    if (!name.trim() || name.trim().length < 2) {
      setError("Informe seu nome completo (mínimo 2 caracteres).");
      return;
    }
    if (!email.trim()) {
      setError("Informe um email válido.");
      return;
    }
    if (password.length < 8) {
      setError("A senha deve ter ao menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    registerMutation.mutate({ name: name.trim(), email: email.trim(), password });
  };

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo e título */}
          <View style={styles.header}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: colors.foreground }]}>Criar conta</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Comece a usar o ctBlun gratuitamente
            </Text>
          </View>

          {/* Formulário */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Nome */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.muted }]}>Nome completo</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Seu nome"
                placeholderTextColor={colors.muted}
                value={name}
                onChangeText={(t) => { setName(t); setError(""); }}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.muted }]}>Email</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                placeholder="seu@email.com"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={(t) => { setEmail(t); setError(""); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            {/* Senha */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.muted }]}>Senha</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="Mínimo 8 caracteres"
                  placeholderTextColor={colors.muted}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setError(""); }}
                  secureTextEntry={!showPassword}
                  returnKeyType="next"
                />
                <TouchableOpacity
                  style={[styles.eyeBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={{ color: colors.muted, fontSize: 18 }}>
                    {showPassword ? "🙈" : "👁️"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirmar Senha */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.muted }]}>Confirmar senha</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Repita sua senha"
                placeholderTextColor={colors.muted}
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); setError(""); }}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
            </View>

            {/* Erro */}
            {!!error && (
              <View style={[styles.errorBox, { backgroundColor: colors.error + "18", borderColor: colors.error }]}>
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            )}

            {/* Botão */}
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary }, registerMutation.isPending && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>Criar conta</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Link para login */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.muted }]}>Já tem conta? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.linkText, { color: colors.primary }]}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 24 },
  header: { alignItems: "center", marginBottom: 32 },
  logo: { width: 72, height: 72, borderRadius: 18, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: { fontSize: 14, textAlign: "center", marginTop: 4, lineHeight: 20 },
  card: { borderRadius: 20, padding: 24, borderWidth: 1, gap: 16 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: "600", letterSpacing: 0.3 },
  input: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 15 },
  passwordRow: { flexDirection: "row", gap: 8 },
  passwordInput: { flex: 1 },
  eyeBtn: { width: 48, height: 48, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  errorBox: { borderRadius: 10, borderWidth: 1, padding: 12 },
  errorText: { fontSize: 13, lineHeight: 18 },
  primaryBtn: { height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 4 },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 24 },
  footerText: { fontSize: 14 },
  linkText: { fontSize: 14, fontWeight: "700" },
});
