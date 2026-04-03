import { ARTIFACT_TYPE } from "@/shared/types";
import { z } from "zod";

const ARTIFACT_TYPE_VALUES = Object.values(ARTIFACT_TYPE) as [string, ...string[]];

export const artifactSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: z.enum(ARTIFACT_TYPE_VALUES),
});

export type ArtifactFormData = z.infer<typeof artifactSchema>;
