/**
 * Testes para máscaras de data e hora.
 *
 * Valida:
 * 1. Máscara de data (DD/MM/YYYY)
 * 2. Máscara de hora (HH:MM)
 * 3. Comportamento com entrada inválida
 */
import { describe, it, expect } from "vitest";

/**
 * Máscara para data: DD/MM/YYYY
 */
function formatDate(text: string): string {
  const cleaned = text.replace(/\D/g, ""); // Remove tudo que não é número
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
}

/**
 * Máscara para hora: HH:MM
 */
function formatTime(text: string): string {
  const cleaned = text.replace(/\D/g, ""); // Remove tudo que não é número
  if (cleaned.length <= 2) return cleaned;
  return `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`;
}

describe("Date and Time Masks - Máscaras de Data e Hora", () => {
  describe("Máscara de Data (DD/MM/YYYY)", () => {
    it("✓ Deve formatar data com 2 dígitos", () => {
      expect(formatDate("01")).toBe("01");
      expect(formatDate("31")).toBe("31");
      console.log("  ✓ Formatação com 2 dígitos funcionando");
    });

    it("✓ Deve adicionar barra após 2 dígitos", () => {
      expect(formatDate("0101")).toBe("01/01");
      expect(formatDate("3112")).toBe("31/12");
      console.log("  ✓ Barra adicionada após 2 dígitos");
    });

    it("✓ Deve formatar data completa com 8 dígitos", () => {
      expect(formatDate("01012026")).toBe("01/01/2026");
      expect(formatDate("31122025")).toBe("31/12/2025");
      console.log("  ✓ Data completa formatada corretamente");
    });

    it("✓ Deve ignorar caracteres não numéricos", () => {
      expect(formatDate("01/01/2026")).toBe("01/01/2026");
      expect(formatDate("01-01-2026")).toBe("01/01/2026");
      expect(formatDate("01.01.2026")).toBe("01/01/2026");
      console.log("  ✓ Caracteres não numéricos ignorados");
    });

    it("✓ Deve limitar a 8 dígitos", () => {
      const result = formatDate("010120261234");
      expect(result).toBe("01/01/2026");
      console.log("  ✓ Limitado a 8 dígitos");
    });

    it("✓ Deve lidar com entrada vazia", () => {
      expect(formatDate("")).toBe("");
      console.log("  ✓ Entrada vazia tratada");
    });

    it("✓ Deve validar formato completo", () => {
      const formatted = formatDate("01012026");
      expect(formatted).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      console.log("  ✓ Formato válido: DD/MM/YYYY");
    });
  });

  describe("Máscara de Hora (HH:MM)", () => {
    it("✓ Deve formatar hora com 2 dígitos", () => {
      expect(formatTime("00")).toBe("00");
      expect(formatTime("23")).toBe("23");
      console.log("  ✓ Formatação com 2 dígitos funcionando");
    });

    it("✓ Deve adicionar dois-pontos após 2 dígitos", () => {
      expect(formatTime("0000")).toBe("00:00");
      expect(formatTime("2359")).toBe("23:59");
      console.log("  ✓ Dois-pontos adicionados após 2 dígitos");
    });

    it("✓ Deve formatar hora completa com 4 dígitos", () => {
      expect(formatTime("0830")).toBe("08:30");
      expect(formatTime("1445")).toBe("14:45");
      console.log("  ✓ Hora completa formatada corretamente");
    });

    it("✓ Deve ignorar caracteres não numéricos", () => {
      expect(formatTime("08:30")).toBe("08:30");
      expect(formatTime("08-30")).toBe("08:30");
      expect(formatTime("08.30")).toBe("08:30");
      console.log("  ✓ Caracteres não numéricos ignorados");
    });

    it("✓ Deve limitar a 4 dígitos", () => {
      const result = formatTime("083012345");
      expect(result).toBe("08:30");
      console.log("  ✓ Limitado a 4 dígitos");
    });

    it("✓ Deve lidar com entrada vazia", () => {
      expect(formatTime("")).toBe("");
      console.log("  ✓ Entrada vazia tratada");
    });

    it("✓ Deve validar formato completo", () => {
      const formatted = formatTime("0830");
      expect(formatted).toMatch(/^\d{2}:\d{2}$/);
      console.log("  ✓ Formato válido: HH:MM");
    });
  });

  describe("Casos de Uso Reais", () => {
    it("✓ Deve formatar data de hoje", () => {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, "0");
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const year = today.getFullYear();
      const input = `${day}${month}${year}`;
      const formatted = formatDate(input);
      expect(formatted).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      console.log(`  ✓ Data de hoje formatada: ${formatted}`);
    });

    it("✓ Deve formatar hora atual", () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const input = `${hours}${minutes}`;
      const formatted = formatTime(input);
      expect(formatted).toMatch(/^\d{2}:\d{2}$/);
      console.log(`  ✓ Hora atual formatada: ${formatted}`);
    });

    it("✓ Deve aceitar entrada gradual do usuário", () => {
      // Simula usuário digitando: 0 -> 01 -> 010 -> 0101 -> 01012 -> 010126
      const inputs = ["0", "01", "010", "0101", "01012", "010126"];
      const outputs = ["0", "01", "01/0", "01/01", "01/01/2", "01/01/26"];

      inputs.forEach((input, index) => {
        const result = formatDate(input);
        expect(result).toBe(outputs[index]);
      });
      console.log("  ✓ Entrada gradual do usuário funcionando");
    });
  });
});
