export interface Person {
  id: string;
  name: string;
  created_at: string;
}

export interface ArtifactV2 {
  id?: string;
  name: string;
  type: "FRONT" | "BACK";
  created_at?: string;
}

export interface Artifact {
  id?: string;
  story_id?: string;
  name?: string;
  version?: string;
  created_at?: string;
}

export interface Story {
  id: string;
  name: string;
  assigned_to: string;
  environment: string;
  type: "FRONT" | "BACK";
  created_at: string;
}
