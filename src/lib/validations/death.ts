import { z } from "zod";

export const deathSubjectValues = ["ENEMY", "ALLY"] as const;

export const createDeathEventSchema = z
  .object({
    subjectType: z.enum(deathSubjectValues),
    enemyId: z.string().optional().or(z.literal("")),
    playerId: z.string().optional().or(z.literal("")),
    killedBy: z.string().optional(),
    cause: z.string().optional(),
    location: z.string().optional(),
  })
  .refine(
    (data) =>
      (data.subjectType === "ENEMY" && !!data.enemyId) ||
      (data.subjectType === "ALLY" && !!data.playerId),
    { message: "Selecione o inimigo ou aliado correspondente ao tipo escolhido" }
  );

export type CreateDeathEventInput = z.infer<typeof createDeathEventSchema>;
