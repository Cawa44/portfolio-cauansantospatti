import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

// ─── Recrutadores (autenticação própria) ─────────────────────────────────────

import {
  recruiters,
  interviews,
  scorecards,
  type InsertRecruiter,
  type InsertInterview,
  type InsertScorecard,
} from "../drizzle/schema";
import { and, desc } from "drizzle-orm";

export async function getRecruiterByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(recruiters)
    .where(eq(recruiters.email, email.toLowerCase()))
    .limit(1);
  return result[0] ?? null;
}

export async function getRecruiterById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(recruiters)
    .where(eq(recruiters.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function createRecruiter(data: InsertRecruiter) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(recruiters).values({
    ...data,
    email: data.email.toLowerCase(),
  });
  return result[0].insertId;
}

// ─── Entrevistas ─────────────────────────────────────────────────────────────

export async function getInterviewsByRecruiter(recruiterId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(interviews)
    .where(eq(interviews.recruiterId, recruiterId))
    .orderBy(desc(interviews.scheduledAt));
}

export async function getInterviewById(id: number, recruiterId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(interviews)
    .where(and(eq(interviews.id, id), eq(interviews.recruiterId, recruiterId)))
    .limit(1);
  return result[0] ?? null;
}

export async function createInterview(data: InsertInterview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(interviews).values(data);
  return result[0].insertId;
}

export async function updateInterview(
  id: number,
  recruiterId: number,
  data: Partial<InsertInterview>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(interviews)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(interviews.id, id), eq(interviews.recruiterId, recruiterId)));
}

export async function deleteInterview(id: number, recruiterId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(interviews)
    .where(and(eq(interviews.id, id), eq(interviews.recruiterId, recruiterId)));
}

// ─── Scorecards ───────────────────────────────────────────────────────────────

export async function getScorecardByInterview(
  interviewId: number,
  recruiterId: number
) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(scorecards)
    .where(
      and(
        eq(scorecards.interviewId, interviewId),
        eq(scorecards.recruiterId, recruiterId)
      )
    )
    .limit(1);
  return result[0] ?? null;
}

export async function upsertScorecard(data: InsertScorecard) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getScorecardByInterview(
    data.interviewId,
    data.recruiterId
  );
  if (existing) {
    await db
      .update(scorecards)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(scorecards.id, existing.id));
    return existing.id;
  } else {
    const result = await db.insert(scorecards).values(data);
    return result[0].insertId;
  }
}

export async function getRecruiterStats(recruiterId: number) {
  const db = await getDb();
  if (!db) return { total: 0, approved: 0, rejected: 0, onHold: 0 };
  const allScorecards = await db
    .select()
    .from(scorecards)
    .where(eq(scorecards.recruiterId, recruiterId));
  const total = allScorecards.length;
  const approved = allScorecards.filter((s) => s.recommendation === "approved").length;
  const rejected = allScorecards.filter((s) => s.recommendation === "rejected").length;
  const onHold = allScorecards.filter((s) => s.recommendation === "on_hold").length;
  return { total, approved, rejected, onHold };
}
