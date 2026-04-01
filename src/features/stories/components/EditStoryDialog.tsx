import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  useAddStoryArtifact,
  useRemoveStoryArtifact,
  useStoryArtifacts,
} from "@/features/artifacts/hooks/use-artifacts";
import {
  useDeleteStory,
  useUpdateStory,
} from "@/features/stories/hooks/use-stories";
import { useUsers } from "@/features/users/hooks/use-users";
import { useToast } from "@/shared/hooks/use-toast";
import { Artifact, Story } from "@/shared/types";
import { ArtifactSelector } from "@/features/artifacts/components/ArtifactSelector";
import { StoryFormData, storySchema } from "@/features/stories/validations/storySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

interface EditStoryDialogProps {
  story: Story;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditStoryDialog({
  story,
  open,
  onOpenChange,
}: EditStoryDialogProps) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<StoryFormData>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      name: story.name,
      assignedTo: story.assigned_to,
      environment: story.environment as "dev" | "qas",
      type: story.type,
      artifacts: [],
    },
  });

  const { data: users = [] } = useUsers();
  const { data: existingArtifacts = [] } = useStoryArtifacts(story.id);
  const { mutate: updateStory, isPending: isUpdating } = useUpdateStory();
  const { mutate: deleteStory, isPending: isDeleting } = useDeleteStory();
  const { mutate: addArtifact } = useAddStoryArtifact();
  const { mutate: removeArtifact } = useRemoveStoryArtifact();
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    reset({
      name: story.name,
      assignedTo: story.assigned_to,
      environment: story.environment as "dev" | "qas",
      type: story.type,
      artifacts: existingArtifacts,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story.id, open]);

  const handleSave = (data: StoryFormData) => {
    updateStory(
      {
        id: story.id,
        updates: {
          name: data.name,
          assigned_to: data.assignedTo,
          environment: data.environment,
          type: data.type,
        },
      },
      {
        onSuccess: () => {
          const selected = data.artifacts as Artifact[];
          const toAdd = selected.filter(
            (a) => !existingArtifacts.some((e) => e.id === a.id),
          );
          const toRemove = existingArtifacts.filter(
            (e) => !selected.some((a) => a.id === e.id),
          );
          toAdd.forEach((a) =>
            addArtifact({ storyId: story.id, artifactId: a.id! }),
          );
          toRemove.forEach((a) =>
            removeArtifact({ storyId: story.id, artifactId: a.id! }),
          );

          toast({
            title: "Historia actualizada",
            description: "Los cambios se guardaron correctamente.",
          });
          onOpenChange(false);
        },
      },
    );
  };

  const handleDelete = () => {
    deleteStory(
      { storyId: story.id },
      {
        onSuccess: () => {
          toast({
            title: "Historia eliminada",
            description: "La historia se eliminó correctamente.",
            variant: "destructive",
          });
          onOpenChange(false);
          setShowDeleteAlert(false);
        },
      },
    );
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) setShowDeleteAlert(false);
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit(handleSave)}>
          <DialogHeader>
            <DialogTitle>Editar Historia</DialogTitle>
            <DialogDescription>
              Modifica los detalles de la historia y los artefactos afectados.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre de la historia</Label>
              <Input
                id="name"
                placeholder="ej. Implementar autenticación OAuth"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="assignedTo">Persona asignada</Label>
              <Controller
                name="assignedTo"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="assignedTo">
                      <SelectValue placeholder="Selecciona una persona" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.assignedTo && (
                <p className="text-sm text-red-500">
                  {errors.assignedTo.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="environment">Ambiente</Label>
              <Controller
                name="environment"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="environment">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="readyToDev">LISTO PARA DEV</SelectItem>
                      <SelectItem value="dev">DEV</SelectItem>
                      <SelectItem value="readyToQas">LISTO PARA QAS</SelectItem>
                      <SelectItem value="qas">QAS</SelectItem>
                      <SelectItem value="readyToProd">
                        LISTO PARA PROD
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Tipo</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FRONT">FRONT</SelectItem>
                      <SelectItem value="BACK">BACK</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            <Controller
              name="artifacts"
              control={control}
              render={({ field }) => (
                <ArtifactSelector
                  selected={field.value as Artifact[]}
                  onChange={field.onChange}
                  error={errors.artifacts?.message}
                />
              )}
            />
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteAlert(true)}
              className="sm:mr-auto"
              disabled={isUpdating || isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
            <div className="flex gap-2 sm:ml-auto">
              <Button
                disabled={isUpdating || isDeleting}
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button disabled={isUpdating} type="submit">
                Guardar Cambios
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              historia
              <span className="font-semibold"> "{story.name}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
