import { z } from "zod";

export const artifactSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: z.enum(["FRONT", "BACK"]),
});

export type ArtifactFormData = z.infer<typeof artifactSchema>;

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
  type: z.enum(["FRONT", "BACK"]),
  artifacts: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1),
        type: z.enum(["FRONT", "BACK"]),
      })
    )
    .min(1, "Debe seleccionar al menos un artefacto"),
});

export type StoryFormData = z.infer<typeof storySchema>;
