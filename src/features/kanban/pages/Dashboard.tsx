import { AddArtifactDialog } from "@/features/artifacts/components/AddArtifactDialog";
import { AddUserDialog } from "@/features/users/components/AddUserDialog";
import { AddStoryDialog } from "@/features/stories/components/AddStoryDialog";
import { KanbanBoard } from "@/features/kanban/components/KanbanBoard";
import { PersonFilter } from "@/features/users/components/PersonFilter";
import { useDashboard } from "@/features/kanban/hooks/use-dashboard";
import { Button } from "@/shared/components/ui/button";
import { Layers, LogOut } from "lucide-react";

export default function Dashboard(): JSX.Element {
  const { loading, handleLogout } = useDashboard();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Layers className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Gestor de versiones
                </h1>
                <p className="text-sm text-muted-foreground">
                  Gestión de historias y ambientes
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <PersonFilter />
              <AddArtifactDialog />
              <AddUserDialog />
              <AddStoryDialog />
              <Button
                size="lg"
                className="shadow-lg"
                variant="destructive"
                onClick={handleLogout}
                disabled={loading}
              >
                <LogOut className="mr-2 h-5 w-5" />
                {loading ? "Cerrando sesión..." : "Cerrar sesión"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 h-[calc(100vh-120px)] overflow-auto">
        <KanbanBoard />
      </main>
    </div>
  );
}
