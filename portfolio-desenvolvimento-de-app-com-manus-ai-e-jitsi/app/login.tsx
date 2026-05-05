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

export default function LoginScreen() {
  const colors = useColors();
  const { login } = useRecruiter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = trpcRecruiter.recruiter.login.useMutation({
    onSuccess: async (data) => {
      await login(data.token, {
        id: data.id,
        name: data.name,
        email: data.email,
      });
      router.replace("/(tabs)");
    },
    onError: (err) => {
      if (err.message.includes("INVALID_CREDENTIALS")) {
        setError("Email ou senha incorretos. Verifique e tente novamente.");
      } else {
        setError("Erro ao fazer login. Tente novamente.");
      }
    },
  });

  const handleLogin = () => {
    setError("");
    if (!email.trim()) {
      setError("Informe seu email.");
      return;
    }
    if (!password) {
      setError("Informe sua senha.");
      return;
    }
    loginMutation.mutate({ email: email.trim(), password });
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
            <Text style={[styles.title, { color: colors.foreground }]}>ctBlun</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Recrutamento inteligente, entrevistas eficientes
            </Text>
          </View>

          {/* Formulário */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>
              Entrar na sua conta
            </Text>

            {/* Campo Email */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.muted }]}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    borderColor: error && !email ? colors.error : colors.border,
                    color: colors.foreground,
                  },
                ]}
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

            {/* Campo Senha */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.muted }]}>Senha</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    {
                      backgroundColor: colors.background,
                      borderColor: error && !password ? colors.error : colors.border,
                      color: colors.foreground,
                    },
                  ]}
                  placeholder="Sua senha"
                  placeholderTextColor={colors.muted}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setError(""); }}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
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

            {/* Mensagem de erro */}
            {!!error && (
              <View style={[styles.errorBox, { backgroundColor: colors.error + "18", borderColor: colors.error }]}>
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            )}

            {/* Botão Entrar */}
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                { backgroundColor: colors.primary },
                loginMutation.isPending && { opacity: 0.7 },
              ]}
              onPress={handleLogin}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>Entrar</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Link para cadastro */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.muted }]}>
              Ainda não tem conta?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/register" as never)}>
              <Text style={[styles.linkText, { color: colors.primary }]}>
                Criar conta
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 20,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    gap: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  passwordRow: {
    flexDirection: "row",
    gap: 8,
  },
  passwordInput: {
    flex: 1,
  },
  eyeBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
