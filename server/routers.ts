import { z } from "zod";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

// Chave secreta para JWT dos recrutadores (usa a mesma variável de ambiente do sistema)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.SESSION_SECRET || "ctblun-secret-key-change-in-production"
);

// Procedimento protegido para recrutadores (valida o token JWT do ctBlun)
const recruiterProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const authHeader = ctx.req.headers["authorization"];
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const recruiterId = payload.sub ? parseInt(payload.sub) : null;
    if (!recruiterId) throw new Error("Invalid token");

    const recruiter = await db.getRecruiterById(recruiterId);
    if (!recruiter) throw new Error("Recruiter not found");

    return next({ ctx: { ...ctx, recruiter } });
  } catch {
    throw new Error("UNAUTHORIZED");
  }
});

export const appRouter = router({
  system: systemRouter,

  // Rota de logout do sistema OAuth (mantida para compatibilidade)
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Autenticação de Recrutadores ──────────────────────────────────────────
  recruiter: router({
    /**
     * Cadastro de novo recrutador.
     * Valida email único, faz hash da senha com bcrypt e retorna JWT.
     */
    register: publicProcedure
      .input(
        z.object({
          name: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(255),
          email: z.string().email("Email inválido"),
          password: z
            .string()
            .min(8, "Senha deve ter ao menos 8 caracteres"),
        })
      )
      .mutation(async ({ input }) => {
        // Verifica se o email já está em uso
        const existing = await db.getRecruiterByEmail(input.email);
        if (existing) {
          throw new Error("EMAIL_ALREADY_EXISTS");
        }

        // Gera hash da senha (custo 12 = bom equilíbrio segurança/performance)
        const passwordHash = await bcrypt.hash(input.password, 12);

        const id = await db.createRecruiter({
          name: input.name,
          email: input.email,
          passwordHash,
        });

        // Gera JWT com validade de 30 dias
        const token = await new SignJWT({ name: input.name, email: input.email })
          .setProtectedHeader({ alg: "HS256" })
          .setSubject(String(id))
          .setIssuedAt()
          .setExpirationTime("30d")
          .sign(JWT_SECRET);

        return { token, name: input.name, email: input.email, id };
      }),

    /**
     * Login de recrutador com email e senha.
     * Verifica hash da senha e retorna JWT.
     */
    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        const recruiter = await db.getRecruiterByEmail(input.email);
        if (!recruiter) {
          throw new Error("INVALID_CREDENTIALS");
        }

        const passwordMatch = await bcrypt.compare(
          input.password,
          recruiter.passwordHash
        );
        if (!passwordMatch) {
          throw new Error("INVALID_CREDENTIALS");
        }

        const token = await new SignJWT({
          name: recruiter.name,
          email: recruiter.email,
        })
          .setProtectedHeader({ alg: "HS256" })
          .setSubject(String(recruiter.id))
          .setIssuedAt()
          .setExpirationTime("30d")
          .sign(JWT_SECRET);

        return {
          token,
          name: recruiter.name,
          email: recruiter.email,
          id: recruiter.id,
        };
      }),

    /**
     * Retorna os dados do recrutador autenticado.
     */
    me: recruiterProcedure.query(async ({ ctx }) => {
      return {
        id: ctx.recruiter.id,
        name: ctx.recruiter.name,
        email: ctx.recruiter.email,
      };
    }),

    /**
     * Retorna estatísticas do recrutador (total de avaliações, aprovados, etc).
     */
    stats: recruiterProcedure.query(async ({ ctx }) => {
      return db.getRecruiterStats(ctx.recruiter.id);
    }),
  }),

  // ─── Entrevistas ───────────────────────────────────────────────────────────
  interviews: router({
    /**
     * Lista todas as entrevistas do recrutador autenticado.
     */
    list: recruiterProcedure.query(async ({ ctx }) => {
      return db.getInterviewsByRecruiter(ctx.recruiter.id);
    }),

    /**
     * Retorna uma entrevista específica pelo ID.
     */
    get: recruiterProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const interview = await db.getInterviewById(input.id, ctx.recruiter.id);
        if (!interview) throw new Error("NOT_FOUND");
        return interview;
      }),

    /**
     * Cria uma nova entrevista.
     * O nome da sala Jitsi é gerado automaticamente se não fornecido.
     */
    create: recruiterProcedure
      .input(
        z.object({
          candidateName: z.string().min(2).max(255),
          jobTitle: z.string().min(2).max(255),
          scheduledAt: z.string(), // ISO string
          roomName: z.string().min(3).max(255).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Gera nome de sala único se não fornecido
        const roomName =
          input.roomName ||
          `ctblun-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        const scheduledDate = new Date(input.scheduledAt);
        const id = await db.createInterview({
          recruiterId: ctx.recruiter.id,
          candidateName: input.candidateName,
          jobTitle: input.jobTitle,
          scheduledAt: scheduledDate,
          roomName,
          notes: input.notes,
          status: "scheduled",
        });

        // Retorna os dados completos da entrevista criada
        return {
          id,
          recruiterId: ctx.recruiter.id,
          candidateName: input.candidateName,
          jobTitle: input.jobTitle,
          roomName,
          scheduledAt: scheduledDate.toISOString(),
          status: "scheduled" as const,
          notes: input.notes || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }),

    /**
     * Atualiza status ou dados de uma entrevista.
     */
    update: recruiterProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateInterview(id, ctx.recruiter.id, data);
        return { success: true };
      }),

    /**
     * Remove uma entrevista.
     */
    delete: recruiterProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteInterview(input.id, ctx.recruiter.id);
        return { success: true };
      }),
  }),

  // ─── Scorecards ────────────────────────────────────────────────────────────
  scorecards: router({
    /**
     * Retorna o scorecard de uma entrevista (apenas do recrutador autenticado).
     */
    get: recruiterProcedure
      .input(z.object({ interviewId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getScorecardByInterview(input.interviewId, ctx.recruiter.id);
      }),

    /**
     * Cria ou atualiza o scorecard de uma entrevista.
     * Garante que apenas o recrutador dono pode salvar.
     */
    save: recruiterProcedure
      .input(
        z.object({
          interviewId: z.number(),
          communication: z.number().min(0).max(5),
          technicalSkills: z.number().min(0).max(5),
          culturalFit: z.number().min(0).max(5),
          proactivity: z.number().min(0).max(5),
          presentation: z.number().min(0).max(5),
          strengths: z.string().optional(),
          improvements: z.string().optional(),
          recommendation: z.enum(["approved", "on_hold", "rejected"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Verifica que a entrevista pertence ao recrutador
        const interview = await db.getInterviewById(
          input.interviewId,
          ctx.recruiter.id
        );
        if (!interview) throw new Error("NOT_FOUND");

        const id = await db.upsertScorecard({
          ...input,
          recruiterId: ctx.recruiter.id,
        });

        return { id };
      }),
  }),
});

export type AppRouter = typeof appRouter;
