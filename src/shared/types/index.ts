export interface Person {
  id: string;
  name: string;
  created_at: string;
}

export interface Artifact {
  id?: string;
  name: string;
  type: "FRONT" | "BACK";
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
