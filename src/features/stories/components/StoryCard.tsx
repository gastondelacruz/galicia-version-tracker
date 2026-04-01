import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useStoryArtifacts } from "@/features/artifacts/hooks/use-artifacts";
import { useUsers } from "@/features/users/hooks/use-users";
import { Story } from "@/shared/types";
import { useDraggable } from "@dnd-kit/core";
import { Container, Package, User } from "lucide-react";
import { useState } from "react";
import { EditStoryDialog } from "@/features/stories/components/EditStoryDialog";

interface StoryCardProps {
  story: Story;
}

export function StoryCard({ story }: StoryCardProps) {
  const { data: users = [] } = useUsers();
  const { data: artifacts = [] } = useStoryArtifacts(story.id);
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
        className="cursor-pointer hover:shadow-lg transition-shadow select-none"
        onClick={() => setEditOpen(true)}
        {...listeners}
        {...attributes}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold leading-tight">
            {story.name}
          </CardTitle>
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
            {artifacts.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {artifacts.map((artifact) => (
                  <Badge
                    key={artifact.id}
                    variant={"secondary"}
                    className="text-xs font-mono"
                  >
                    {artifact.name}
                  </Badge>
                ))}
              </div>
            )}
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
