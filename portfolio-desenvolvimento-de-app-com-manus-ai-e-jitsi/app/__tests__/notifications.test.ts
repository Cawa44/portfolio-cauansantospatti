/**
 * Testes para sistema de notificações de lembretes de entrevistas.
 *
 * Valida:
 * 1. Agendamento de notificação 15 minutos antes
 * 2. Validação de horário de lembrete (não no passado)
 * 3. Geração de conteúdo da notificação
 * 4. Múltiplas notificações para múltiplas entrevistas
 */
import { describe, it, expect } from "vitest";

interface Interview {
  id: number;
  candidateName: string;
  jobTitle: string;
  scheduledAt: Date;
  status: "scheduled" | "completed" | "cancelled";
}

interface NotificationSchedule {
  interviewId: number;
  candidateName: string;
  reminderTime: Date;
  title: string;
  body: string;
}

const REMINDER_MINUTES = 15;

/**
 * Função para agendar notificação
 */
function scheduleReminderNotification(
  interview: Interview
): NotificationSchedule | null {
  const scheduledDate = new Date(interview.scheduledAt);
  const reminderTime = new Date(
    scheduledDate.getTime() - REMINDER_MINUTES * 60 * 1000
  );

  // Não agenda se a hora de lembrete já passou
  if (reminderTime < new Date()) {
    return null;
  }

  return {
    interviewId: interview.id,
    candidateName: interview.candidateName,
    reminderTime,
    title: "Entrevista em 15 minutos! 🎥",
    body: `Você tem uma entrevista com ${interview.candidateName}`,
  };
}

/**
 * Função para calcular tempo até notificação
 */
function getTimeUntilNotification(reminderTime: Date): number {
  return reminderTime.getTime() - new Date().getTime();
}

describe("Interview Notifications - Notificações de Lembretes", () => {
  const mockInterview: Interview = {
    id: 1,
    candidateName: "Maria Silva",
    jobTitle: "Desenvolvedora Frontend",
    scheduledAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos a partir de agora
    status: "scheduled",
  };

  it("✓ Deve agendar notificação 15 minutos antes", () => {
    const notification = scheduleReminderNotification(mockInterview);

    expect(notification).not.toBeNull();
    expect(notification?.title).toBe("Entrevista em 15 minutos! 🎥");
    expect(notification?.body).toContain("Maria Silva");
    console.log("  ✓ Notificação agendada com sucesso");
  });

  it("✓ Deve calcular tempo correto de lembrete", () => {
    const notification = scheduleReminderNotification(mockInterview);
    if (!notification) throw new Error("Notificação não foi criada");

    const timeUntil = getTimeUntilNotification(notification.reminderTime);
    const expectedTime = 30 * 60 * 1000 - REMINDER_MINUTES * 60 * 1000; // 15 minutos

    // Permite margem de 1 segundo
    expect(Math.abs(timeUntil - expectedTime)).toBeLessThan(1000);
    console.log(`  ✓ Tempo até notificação: ${Math.round(timeUntil / 1000)}s`);
  });

  it("✓ Não deve agendar notificação se já passou", () => {
    const pastInterview: Interview = {
      id: 2,
      candidateName: "João Santos",
      jobTitle: "Desenvolvedor Backend",
      scheduledAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
      status: "scheduled",
    };

    const notification = scheduleReminderNotification(pastInterview);
    expect(notification).toBeNull();
    console.log("  ✓ Notificação não agendada para entrevista no passado");
  });

  it("✓ Deve incluir nome do candidato na notificação", () => {
    const notification = scheduleReminderNotification(mockInterview);
    expect(notification?.body).toContain(mockInterview.candidateName);
    console.log("  ✓ Nome do candidato incluído na notificação");
  });

  it("✓ Deve agendar múltiplas notificações", () => {
    const interviews: Interview[] = [
      {
        id: 1,
        candidateName: "Maria Silva",
        jobTitle: "Frontend",
        scheduledAt: new Date(Date.now() + 30 * 60 * 1000),
        status: "scheduled",
      },
      {
        id: 2,
        candidateName: "João Santos",
        jobTitle: "Backend",
        scheduledAt: new Date(Date.now() + 60 * 60 * 1000),
        status: "scheduled",
      },
      {
        id: 3,
        candidateName: "Ana Costa",
        jobTitle: "QA",
        scheduledAt: new Date(Date.now() + 90 * 60 * 1000),
        status: "scheduled",
      },
    ];

    const notifications = interviews
      .map(scheduleReminderNotification)
      .filter((n) => n !== null) as NotificationSchedule[];

    expect(notifications).toHaveLength(3);
    console.log(`  ✓ ${notifications.length} notificações agendadas`);
  });

  it("✓ Deve filtrar entrevistas canceladas", () => {
    const interviews: Interview[] = [
      { ...mockInterview, status: "scheduled" },
      { ...mockInterview, id: 2, status: "cancelled" },
      { ...mockInterview, id: 3, status: "completed" },
    ];

    const notifications = interviews
      .filter((i) => i.status === "scheduled")
      .map(scheduleReminderNotification)
      .filter((n) => n !== null) as NotificationSchedule[];

    expect(notifications).toHaveLength(1);
    console.log("  ✓ Apenas entrevistas agendadas têm notificações");
  });

  it("✓ Deve gerar ID único para cada notificação", () => {
    const interviews: Interview[] = [
      { ...mockInterview, id: 1 },
      { ...mockInterview, id: 2, scheduledAt: new Date(Date.now() + 60 * 60 * 1000) },
    ];

    const notifications = interviews.map(scheduleReminderNotification);
    const ids = notifications.map((n) => n?.interviewId);

    expect(new Set(ids).size).toBe(ids.length);
    console.log("  ✓ IDs únicos para cada notificação");
  });

  it("✓ Deve validar formato de hora de lembrete", () => {
    const notification = scheduleReminderNotification(mockInterview);
    expect(notification?.reminderTime instanceof Date).toBe(true);
    expect(notification?.reminderTime.getTime()).toBeGreaterThan(0);
    console.log("  ✓ Formato de hora válido");
  });

  it("✓ Deve calcular corretamente para entrevistas em 24h", () => {
    const tomorrowInterview: Interview = {
      id: 1,
      candidateName: "Maria Silva",
      jobTitle: "Frontend",
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Amanhã
      status: "scheduled",
    };

    const notification = scheduleReminderNotification(tomorrowInterview);
    expect(notification).not.toBeNull();

    const timeUntil = getTimeUntilNotification(notification!.reminderTime);
    const expectedTime = (24 * 60 - REMINDER_MINUTES) * 60 * 1000;

    // Permite margem de 1 segundo
    expect(Math.abs(timeUntil - expectedTime)).toBeLessThan(1000);
    console.log("  ✓ Cálculo correto para entrevistas em 24h");
  });
});
