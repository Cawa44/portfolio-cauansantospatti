/**
 * Componente de otimizações específicas para Android.
 *
 * Implementa:
 * - Suporte a gestos nativos do Android (back button)
 * - Layout responsivo para telas pequenas
 * - Otimizações de performance para Android
 */
import { useEffect } from "react";
import { BackHandler, Platform } from "react-native";
import { router } from "expo-router";

/**
 * Hook para lidar com o botão back do Android.
 * Navega para trás quando o usuário pressiona o botão back.
 */
export function useAndroidBackButton(onBack?: () => void) {
  useEffect(() => {
    if (Platform.OS !== "android") return;

    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (onBack) {
        onBack();
      } else {
        router.back();
      }
      return true;
    });

    return () => subscription.remove();
  }, [onBack]);
}

/**
 * Função para obter tamanho de fonte responsivo baseado no tamanho da tela.
 * Útil para adaptar texto em diferentes tamanhos de dispositivo Android.
 */
export function getResponsiveFontSize(
  baseSize: number,
  screenWidth: number
): number {
  // Reduz o tamanho da fonte em telas pequenas (< 360px)
  if (screenWidth < 360) {
    return baseSize * 0.9;
  }
  // Aumenta em telas grandes (> 480px)
  if (screenWidth > 480) {
    return baseSize * 1.1;
  }
  return baseSize;
}

/**
 * Função para obter padding responsivo baseado no tamanho da tela.
 */
export function getResponsivePadding(
  basePadding: number,
  screenWidth: number
): number {
  if (screenWidth < 360) {
    return basePadding * 0.8;
  }
  if (screenWidth > 480) {
    return basePadding * 1.1;
  }
  return basePadding;
}

/**
 * Configurações de performance para Android.
 * Use em componentes com listas grandes.
 */
export const ANDROID_PERFORMANCE_CONFIG = {
  // Número máximo de itens renderizados por vez
  maxToRenderPerBatch: 10,
  // Número de itens renderizados inicialmente
  initialNumToRender: 10,
  // Atualizar intervalo em ms
  updateCellsBatchingPeriod: 50,
  // Remover itens fora da tela após este tempo (ms)
  removeClippedSubviews: true,
};

/**
 * Estilos otimizados para Android.
 */
export const ANDROID_OPTIMIZED_STYLES = {
  // Usar hardware acceleration em Android para melhor performance
  hardwareAccelerated: true,
  // Desabilitar sombras complexas em Android (usar elevation em vez disso)
  elevation: 4,
};
