import { z } from "zod";

export const playerStatusValues = ["ONLINE", "OFFLINE"] as const;

export const createEnemySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  level: z.coerce.number().int().min(1).default(1),
  vocation: z.string().optional(),
  guild: z.string().optional(),
  residence: z.string().optional(),
  status: z.enum(playerStatusValues).default("OFFLINE"),
  notes: z.string().optional(),
});

export const updateEnemySchema = createEnemySchema.partial();

export type CreateEnemyInput = z.infer<typeof createEnemySchema>;
export type UpdateEnemyInput = z.infer<typeof updateEnemySchema>;
