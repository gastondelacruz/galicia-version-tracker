import { cn } from "@/lib/utils";
import { StoryWithDetails } from "@/types";
import { useDroppable } from "@dnd-kit/core";
import { StoryCard } from "./StoryCard";

interface KanbanColumnProps {
  id: "readyToDev" | "dev" | "readyToQas" | "qas";
  title: string;
  stories: StoryWithDetails[];
  count: number;
}

export function KanbanColumn({ id, title, stories, count }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex-1 min-w-[320px]">
      <div
        className={cn(
          "rounded-lg p-4 h-full transition-colors",
          id === "readyToDev" &&
            "bg-[hsl(var(--ready-to-dev-light))] border-2 border-[hsl(var(--ready-to-dev))]",
          id === "dev" &&
            "bg-[hsl(var(--dev-light))] border-2 border-[hsl(var(--dev))]",
          id === "readyToQas" &&
            "bg-[hsl(var(--ready-to-qas-light))] border-2 border-[hsl(var(--ready-to-qas))]",
          id === "qas" &&
            "bg-[hsl(var(--qas-light))] border-2 border-[hsl(var(--qas))]",
          isOver && "ring-2 ring-primary ring-offset-2"
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground uppercase tracking-wide">
            {title}
          </h2>
          <span
            className={cn(
              "px-3 py-1 rounded-full text-sm font-semibold",
              id === "readyToDev" &&
                "bg-[hsl(var(--ready-to-dev))] text-[hsl(var(--ready-to-dev-foreground))]",
              id === "dev" &&
                "bg-[hsl(var(--dev))] text-[hsl(var(--dev-foreground))]",
              id === "readyToQas" &&
                "bg-[hsl(var(--ready-to-qas))] text-[hsl(var(--ready-to-qas-foreground))]",
              id === "qas" &&
                "bg-[hsl(var(--qas))] text-[hsl(var(--qas-foreground))]"
            )}
          >
            {count}
          </span>
        </div>

        <div ref={setNodeRef} className="space-y-3 min-h-[200px]">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
          {stories.length === 0 && (
            <div className="flex items-center justify-center h-32 text-muted-foreground border-2 border-dashed border-border rounded-lg">
              Arrastra historias aquí
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
