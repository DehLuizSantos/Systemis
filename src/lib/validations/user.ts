import { z } from "zod";

export const roleValues = ["ADMIN", "MEMBER"] as const;

export const createUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
  role: z.enum(roleValues).default("MEMBER"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
