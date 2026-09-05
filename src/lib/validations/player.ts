import { z } from "zod";

export const playerStatusValues = ["ONLINE", "OFFLINE"] as const;

export const createPlayerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  level: z.coerce.number().int().min(1).default(1),
  vocation: z.string().optional(),
  guild: z.string().optional(),
  status: z.enum(playerStatusValues).default("OFFLINE"),
  residence: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export const updatePlayerSchema = createPlayerSchema.partial();

export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;
