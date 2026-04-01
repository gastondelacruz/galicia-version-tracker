import { z } from "zod";

export const artifactSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: z.enum(["FRONT", "BACK"]),
});

export type ArtifactFormData = z.infer<typeof artifactSchema>;
