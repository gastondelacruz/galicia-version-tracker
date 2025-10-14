import { z } from "zod";

export const artifactSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  version: z.string().min(1, "La versión es requerida"),
});

export const storySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  assignedTo: z.string().min(1, "La persona asignada es requerida"),
  environment: z.enum([
    "dev",
    "qas",
    "readyToDev",
    "readyToQas",
    "readyToProd",
  ]),
  artifacts: z.array(artifactSchema).min(1, "Al menos un debe ser agregado"),
  artifactName: z.string().optional(),
  artifactVersion: z.string().optional(),
  type: z.enum(["FRONT", "BACK"]),
});

export type StoryFormData = z.infer<typeof storySchema>;
