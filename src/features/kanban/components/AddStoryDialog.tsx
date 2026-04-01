import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  useCreateStory,
  useUsers,
} from "@/features/kanban/hooks/use-stories";
import { Artifact } from "@/shared/types";
import { StoryFormData, storySchema } from "@/features/kanban/validations/storySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ArtifactSelector } from "./ArtifactSelector";

export function AddStoryDialog() {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<StoryFormData>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      name: "",
      assignedTo: "",
      environment: "readyToDev",
      type: "FRONT",
      artifacts: [],
    },
  });

  const { data: users = [] } = useUsers();
  const { mutate: createStory, isPending: isUpdating } = useCreateStory();
  const { mutate: addStoryArtifact } = useAddStoryArtifact();

  const handleSave = (data: StoryFormData) => {
    createStory(
      {
        story: {
          name: data.name,
          assigned_to: data.assignedTo,
          environment: data.environment,
          type: data.type,
        },
      },
      {
        onSuccess: (story) => {
          data.artifacts.forEach((a) =>
            addStoryArtifact({ storyId: story.id, artifactId: a.id! }),
          );
          reset();
          setOpen(false);
        },
      },
    );
  };

  const handleDialogOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="shadow-lg">
          <Plus className="mr-2 h-5 w-5" />
          Nueva Historia
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit(handleSave)}>
          <DialogHeader>
            <DialogTitle>Crear Nueva Historia</DialogTitle>
            <DialogDescription>
              Completa los detalles de la historia y los artefactos afectados.
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
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="environment">
                      <SelectValue placeholder="Selecciona un ambiente" />
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
              {errors.environment && (
                <p className="text-sm text-red-500">
                  {errors.environment.message}
                </p>
              )}
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
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Creando..." : "Crear Historia"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
