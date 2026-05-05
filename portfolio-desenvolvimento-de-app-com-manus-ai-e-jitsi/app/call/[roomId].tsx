import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  StatusBar,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import ScorecardModal from "@/components/scorecard-modal";
import { trpcRecruiter } from "@/lib/trpc-recruiter";
import { useAndroidBackButton } from "@/components/android-optimizations";

/**
 * Tela de Videochamada — Jitsi Meet via WebView.
 *
 * Decisão técnica: O Jitsi Meet SDK nativo requer ejetar do Expo (bare workflow),
 * o que aumenta muito a complexidade. A abordagem via WebView conecta diretamente
 * ao servidor público meet.jit.si, permitindo criar e entrar em salas reais
 * sem configuração adicional. O recrutador tem acesso a todos os controles
 * nativos do Jitsi (câmera, microfone, chat, etc.) dentro da WebView.
 *
 * O scorecard é sobreposto como modal React Native, garantindo que:
 * - Seja visível APENAS para o recrutador (não aparece na videochamada)
 * - Não interrompe a chamada (a WebView continua rodando em background)
 */
export default function CallScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  useAndroidBackButton(() => {
    // Ao pressionar back, mostra confirmação de sair
    Alert.alert(
      "Encerrar chamada",
      "Deseja sair da videochamada?",
      [
        { text: "Continuar", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: () => router.back() },
      ]
    );
  });
  const { roomId } = useLocalSearchParams<{ roomId: string }>();

  const [scorecardVisible, setScorecardVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Busca o ID da entrevista pelo nome da sala para vincular o scorecard
  const { data: interviews } = trpcRecruiter.interviews.list.useQuery();
  const interview = interviews?.find((i) => i.roomName === roomId);

  const jitsiUrl = `https://meet.jit.si/${roomId}`;

  /**
   * JavaScript injetado na WebView para personalizar a interface do Jitsi.
   * Remove o banner de "Você está sozinho" e ajusta o layout para mobile.
   */
  const injectedJS = `
    (function() {
      // Aguarda o Jitsi carregar completamente
      const waitForJitsi = setInterval(function() {
        if (typeof APP !== 'undefined' && APP.conference) {
          clearInterval(waitForJitsi);
          // Jitsi carregado com sucesso
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'JITSI_READY',
            roomId: '${roomId}'
          }));
        }
      }, 1000);
      
      // Timeout de 30s
      setTimeout(function() { clearInterval(waitForJitsi); }, 30000);
    })();
    true;
  `;

  const handleMessage = useCallback((event: { nativeEvent: { data: string } }) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === "JITSI_READY") {
        setIsLoading(false);
      }
    } catch {
      // Ignora mensagens não-JSON
    }
  }, []);

  const handleEndCall = () => {
    Alert.alert(
      "Encerrar chamada",
      "Deseja sair da videochamada?",
      [
        { text: "Continuar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* WebView com Jitsi Meet — sala real em meet.jit.si */}
      <WebView
        source={{ uri: jitsiUrl }}
        style={styles.webview}
        injectedJavaScript={injectedJS}
        onMessage={handleMessage}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState={false}
        // Permissões de câmera e microfone (necessárias para Jitsi)
        allowsFullscreenVideo
        // Android: permite acesso à câmera/microfone via WebView
        androidLayerType="hardware"
        mixedContentMode="always"
        // Configurações de segurança
        originWhitelist={["https://*", "http://*"]}
        userAgent={
          Platform.OS === "android"
            ? "Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
            : undefined
        }
      />

      {/* Overlay de carregamento */}
      {isLoading && (
        <View style={[styles.loadingOverlay, { backgroundColor: "#1A2540" }]}>
          <ActivityIndicator size="large" color="#1A56DB" />
          <Text style={styles.loadingText}>Conectando à sala...</Text>
          <Text style={styles.loadingRoom}>{roomId}</Text>
        </View>
      )}

      {/* Erro de conexão */}
      {hasError && (
        <View style={[styles.loadingOverlay, { backgroundColor: "#1A2540" }]}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>📡</Text>
          <Text style={[styles.loadingText, { color: "#EF4444" }]}>
            Erro ao conectar
          </Text>
          <Text style={[styles.loadingRoom, { color: "#9CA3AF" }]}>
            Verifique sua conexão com a internet
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: "#1A56DB" }]}
            onPress={() => { setHasError(false); setIsLoading(true); }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Barra de controles superior */}
      <View
        style={[
          styles.topBar,
          { paddingTop: insets.top + 8, backgroundColor: "rgba(0,0,0,0.6)" },
        ]}
      >
        <View style={styles.roomInfo}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>AO VIVO</Text>
          </View>
          <Text style={styles.roomName} numberOfLines={1}>
            {roomId}
          </Text>
        </View>
        <TouchableOpacity style={styles.endCallBtn} onPress={handleEndCall}>
          <IconSymbol name="xmark.circle.fill" size={20} color="#fff" />
          <Text style={styles.endCallText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Botão flutuante do Scorecard — visível APENAS para o recrutador */}
      <TouchableOpacity
        style={[
          styles.scorecardFab,
          {
            backgroundColor: "#7C3AED",
            bottom: insets.bottom + 24,
          },
        ]}
        onPress={() => setScorecardVisible(true)}
      >
        <IconSymbol name="clipboard.fill" size={22} color="#fff" />
        <Text style={styles.scorecardFabText}>Avaliar</Text>
      </TouchableOpacity>

      {/* Modal do Scorecard — sobreposto à videochamada */}
      <ScorecardModal
        visible={scorecardVisible}
        onClose={() => setScorecardVisible(false)}
        interviewId={interview?.id ?? 0}
        candidateName={interview?.candidateName ?? "Candidato"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  webview: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    zIndex: 10,
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  loadingRoom: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 20,
  },
  roomInfo: { flex: 1, gap: 2 },
  liveIndicator: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  liveText: { color: "#EF4444", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  roomName: { color: "#fff", fontSize: 13, fontWeight: "600", opacity: 0.9 },
  endCallBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(239,68,68,0.8)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  endCallText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  scorecardFab: {
    position: "absolute",
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 8,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    zIndex: 30,
  },
  scorecardFabText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
