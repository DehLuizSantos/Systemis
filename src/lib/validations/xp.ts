import { z } from "zod";

export const createXpRecordSchema = z.object({
  enemyId: z.string().min(1, "Selecione um inimigo"),
  level: z.coerce.number().int().min(1),
  xpGained: z.coerce.number().int().min(0).optional(),
  note: z.string().optional(),
});

export type CreateXpRecordInput = z.infer<typeof createXpRecordSchema>;
