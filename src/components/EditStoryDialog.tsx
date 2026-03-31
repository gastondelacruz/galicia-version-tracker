import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddStoryArtifactV2, useDeleteStory, useRemoveStoryArtifactV2, useStoryArtifactsV2, useUpdateStory, useUsers } from "@/hooks/use-stories";
import { useToast } from "@/hooks/use-toast";
import { Artifact, ArtifactV2, StoryWithDetails } from "@/types";
import { ArtifactV2Selector } from "./ArtifactV2Selector";
import { StoryFormData, storySchema } from "@/validations/storySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

interface EditStoryDialogProps {
  story: StoryWithDetails;
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
    setValue,
    getValues,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<StoryFormData>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      name: story.name,
      assignedTo: story.assigned_to,
      environment: story.environment as "dev" | "qas",
      artifacts: story.artifacts,
      artifactName: "",
      artifactVersion: "",
      type: story.type,
    },
  });

  const { data: users = [] } = useUsers();
  const { data: existingArtifactsV2 = [] } = useStoryArtifactsV2(story.id);
  const [selectedArtifactsV2, setSelectedArtifactsV2] = useState<ArtifactV2[]>([]);
  const { mutate: updateStory, isPending: isUpdating } = useUpdateStory();
  const { mutate: deleteStory, isPending: isDeleting } = useDeleteStory();
  const { mutate: addArtifactV2 } = useAddStoryArtifactV2();
  const { mutate: removeArtifactV2 } = useRemoveStoryArtifactV2();
  const { toast } = useToast();

  const artifacts = watch("artifacts");

  useEffect(() => {
    reset({
      name: story.name,
      assignedTo: story.assigned_to,
      environment: story.environment as "dev" | "qas",
      artifacts: story.artifacts,
      artifactName: "",
      artifactVersion: "",
      type: story.type,
    });
    setSelectedArtifactsV2(existingArtifactsV2);
  }, [story, reset, existingArtifactsV2]);

  const handleAddArtifact = () => {
    const artifactName = getValues("artifactName");
    const artifactVersion = getValues("artifactVersion");
    if (artifactName && artifactVersion) {
      const newArtifact: Artifact = {
        name: artifactName,
        version: artifactVersion,
        story_id: story.id,
        created_at: new Date().toISOString(),
      };
      const currentArtifacts = getValues("artifacts");
      setValue("artifacts", [...currentArtifacts, newArtifact]);
      setValue("artifactName", "");
      setValue("artifactVersion", "");
    }
  };

  const handleRemoveArtifact = (index: number) => {
    const currentArtifacts = [...getValues("artifacts")];
    currentArtifacts.splice(index, 1);
    setValue("artifacts", currentArtifacts);
  };

  const handleSave = (data: StoryFormData) => {
    updateStory(
      {
        id: story.id,
        updates: {
          name: data.name,
          assigned_to: data.assignedTo,
          environment: data.environment,
          type: data.type,
          artifacts: data.artifacts.map((artifact) => ({
            id: (artifact as Artifact).id || "",
            name: artifact.name,
            version: artifact.version,
            story_id: story.id,
            created_at:
              (artifact as Artifact).created_at || new Date().toISOString(),
          })),
        },
      },
      {
        onSuccess: () => {
          // Sincronizar artefactos v2: agregar los nuevos, quitar los removidos
          const toAdd = selectedArtifactsV2.filter(
            (a) => !existingArtifactsV2.some((e) => e.id === a.id)
          );
          const toRemove = existingArtifactsV2.filter(
            (e) => !selectedArtifactsV2.some((a) => a.id === e.id)
          );
          toAdd.forEach((a) => addArtifactV2({ storyId: story.id, artifactId: a.id! }));
          toRemove.forEach((a) => removeArtifactV2({ storyId: story.id, artifactId: a.id! }));

          toast({
            title: "Historia actualizada",
            description: "Los cambios se guardaron correctamente.",
          });
          onOpenChange(false);
        },
      }
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
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

            <div className="grid gap-2">
              <Label>Artefactos</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nombre del artefacto"
                  {...register("artifactName")}
                />
                <Input
                  placeholder="Versión"
                  {...register("artifactVersion")}
                  className="w-32"
                />
                <Button
                  type="button"
                  onClick={handleAddArtifact}
                  variant="secondary"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {artifacts.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {artifacts.map((artifact, index) => (
                    <Badge
                      key={(artifact as Artifact).id || index}
                      variant="secondary"
                      className="text-xs"
                    >
                      {artifact.name} {artifact.version}
                      <button
                        type="button"
                        onClick={() => handleRemoveArtifact(index)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              {errors.artifacts && (
                <p className="text-sm text-red-500">
                  {errors.artifacts.message}
                </p>
              )}
            </div>

            <hr className="border-border" />

            <ArtifactV2Selector
              selected={selectedArtifactsV2}
              onChange={setSelectedArtifactsV2}
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
