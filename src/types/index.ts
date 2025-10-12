export interface Person {
  id: string;
  name: string;
  created_at: string;
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

export interface StoryWithDetails extends Story {
  assigned_user: Person;
  artifacts: Artifact[];
}
