import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  useAddStoryArtifactV2,
  useCreateStory,
  useUsers,
} from "@/hooks/use-stories";
import { ArtifactV2 } from "@/types";
import { StoryFormData, storySchema } from "@/validations/storySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ArtifactV2Selector } from "./ArtifactV2Selector";

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
      artifactsV2: [],
    },
  });

  const { data: users = [] } = useUsers();
  const { mutate: createStory, isPending: isUpdating } = useCreateStory();
  const { mutate: addStoryArtifact } = useAddStoryArtifactV2();

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
          data.artifactsV2.forEach((a) =>
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
              name="artifactsV2"
              control={control}
              render={({ field }) => (
                <ArtifactV2Selector
                  selected={field.value as ArtifactV2[]}
                  onChange={field.onChange}
                  error={errors.artifactsV2?.message}
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
