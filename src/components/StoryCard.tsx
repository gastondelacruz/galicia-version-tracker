import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUsers } from "@/hooks/use-stories";
import { StoryWithDetails } from "@/types";
import { useDraggable } from "@dnd-kit/core";
import { Container, GripVertical, Package, User } from "lucide-react";
import { useState } from "react";
import { EditStoryDialog } from "./EditStoryDialog";

interface StoryCardProps {
  story: StoryWithDetails;
}

export function StoryCard({ story }: StoryCardProps) {
  const { data: users = [] } = useUsers();
  const [editOpen, setEditOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: story.id,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className="cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow"
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest("[data-drag-handle]")) {
            setEditOpen(true);
          }
        }}
        {...attributes}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start gap-2">
            <div
              data-drag-handle
              {...listeners}
              className="cursor-grab mt-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <GripVertical className="h-5 w-5" />
            </div>
            <CardTitle className="text-base font-semibold leading-tight flex-1">
              {story.name}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span className="font-medium">
              {users.find((user) => user.id === story.assigned_to)?.name}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Container className="h-4 w-4" />
              <span className="font-medium">Tipo:</span>
              <Badge
                key={story.id}
                variant={story.type === "FRONT" ? "front" : "back"}
                className="text-xs font-mono"
              >
                {story.type}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span className="font-medium">Artefactos:</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {story.artifacts.map((artifact) => (
                <Badge
                  key={artifact.id}
                  variant="secondary"
                  className="text-xs font-mono"
                >
                  {artifact.name} {artifact.version}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <EditStoryDialog
        story={story}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
