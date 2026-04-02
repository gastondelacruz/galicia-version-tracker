export const ARTIFACT_TYPE = {
  FRONT: "FRONT",
  BACK: "BACK",
} as const;

export type ArtifactType = (typeof ARTIFACT_TYPE)[keyof typeof ARTIFACT_TYPE];

export const STORY_ENVIRONMENT = {
  READY_TO_DEV: "readyToDev",
  DEV: "dev",
  READY_TO_QAS: "readyToQas",
  QAS: "qas",
  READY_TO_PROD: "readyToProd",
} as const;

export type StoryEnvironment =
  (typeof STORY_ENVIRONMENT)[keyof typeof STORY_ENVIRONMENT];

export interface Person {
  id: string;
  name: string;
  created_at: string;
}

export interface Artifact {
  id?: string;
  name: string;
  type: ArtifactType;
  created_at?: string;
}

export interface Story {
  id: string;
  name: string;
  assigned_to: string;
  environment: StoryEnvironment;
  type: ArtifactType;
  created_at: string;
}

export type StoryWithDetails = Story & {
  assigned_user: Pick<Person, "id" | "name" | "created_at"> | null;
};
