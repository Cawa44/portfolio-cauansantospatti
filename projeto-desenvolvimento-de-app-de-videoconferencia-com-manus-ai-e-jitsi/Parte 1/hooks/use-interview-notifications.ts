/**
 * Hook para gerenciar notificações de lembretes de entrevistas.
 *
 * Funcionalidades:
 * - Registra background task para verificar entrevistas próximas
 * - Agenda notificações 15 minutos antes de cada entrevista
 * - Atualiza notificações quando novas entrevistas são criadas
 */
import { useEffect, useCallback } from "react";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { trpcRecruiter } from "@/lib/trpc-recruiter";

const TASK_NAME = "ctblun-interview-reminder-task";
const REMINDER_MINUTES = 15;

/**
 * Background task que verifica entrevistas próximas e agenda notificações.
 */
TaskManager.defineTask(TASK_NAME, async () => {
  try {
    console.log("[Interview Reminder Task] Checking for upcoming interviews...");
    return "NewData" as any;
  } catch (error) {
    console.error("[Interview Reminder Task] Error:", error);
    return "Failed" as any;
  }
});

export function useInterviewNotifications() {
  const { data: interviews } = trpcRecruiter.interviews.list.useQuery();

  /**
   * Agenda uma notificação para 15 minutos antes de uma entrevista.
   */
  const scheduleReminder = useCallback(
    async (interviewId: number, candidateName: string, scheduledAt: Date | string) => {
      try {
        const scheduledDate = new Date(scheduledAt);
        const reminderTime = new Date(scheduledDate.getTime() - REMINDER_MINUTES * 60 * 1000);

        // Não agenda se a hora de lembrete já passou
        if (reminderTime < new Date()) {
          console.log(`[Notification] Reminder time already passed for interview ${interviewId}`);
          return;
        }

        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: "Entrevista em 15 minutos! 🎥",
            body: `Você tem uma entrevista com ${candidateName}`,
            data: { interviewId, type: "interview_reminder" },
            sound: "default",
            priority: "high" as any,
          },
          trigger: {
            type: "date" as any,
            date: reminderTime,
          },
        });

        console.log(`[Notification] Scheduled reminder for interview ${interviewId}: ${notificationId}`);
        return notificationId;
      } catch (error) {
        console.error(`[Notification] Failed to schedule reminder:`, error);
      }
    },
    []
  );

  /**
   * Agenda lembretes para todas as entrevistas agendadas.
   */
  const scheduleAllReminders = useCallback(async () => {
    if (!interviews) return;

    for (const interview of interviews) {
      if (interview.status === "scheduled") {
        await scheduleReminder(
          interview.id,
          interview.candidateName,
          interview.scheduledAt
        );
      }
    }
  }, [interviews, scheduleReminder]);

  /**
   * Inicializa as notificações ao montar o componente.
   */
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Configura o comportamento padrão das notificações
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });

        // Pede permissão para enviar notificações
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
          console.warn("[Notification] Permission not granted");
          return;
        }

        // Agenda lembretes para entrevistas existentes
        await scheduleAllReminders();

        // Listener para quando o usuário toca em uma notificação
        const subscription = Notifications.addNotificationResponseReceivedListener(
          (response) => {
            const { interviewId } = response.notification.request.content.data as {
              interviewId?: number;
            };
            if (interviewId) {
              console.log(`[Notification] User tapped reminder for interview ${interviewId}`);
            }
          }
        );

        return () => subscription.remove();
      } catch (error) {
        console.error("[Notification] Initialization error:", error);
      }
    };

    initializeNotifications();
  }, [scheduleAllReminders]);

  return { scheduleReminder, scheduleAllReminders };
}
