import { Badge } from "@/components/ui/badge";
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
import { useCreateStory, useUsers } from "@/hooks/use-stories";
import { Artifact } from "@/types";
import { StoryFormData, storySchema } from "@/validations/storySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

export function AddStoryDialog() {
  const [open, setOpen] = useState(false);
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
      name: "",
      assignedTo: "",
      environment: "readyToDev",
      artifacts: [],
      artifactName: "",
      artifactVersion: "",
      type: "FRONT",
    },
  });

  const { data: users = [] } = useUsers();
  const { mutate: createStory, isPending: isUpdating } = useCreateStory();

  const artifacts = watch("artifacts");

  const handleAddArtifact = () => {
    const artifactName = getValues("artifactName");
    const artifactVersion = getValues("artifactVersion");
    if (artifactName && artifactVersion) {
      const newArtifact: Artifact = {
        name: artifactName,
        version: artifactVersion,
      };
      const currentArtifacts = getValues("artifacts");
      setValue("artifacts", [...currentArtifacts, newArtifact]);
      setValue("artifactName", "");
      setValue("artifactVersion", "");
    }
  };

  const handleRemoveArtifact = (index: number) => {
    const currentArtifacts = [...(getValues("artifacts") || [])];
    currentArtifacts.splice(index, 1);
    setValue("artifacts", currentArtifacts);
  };

  const handleSave = (data: StoryFormData) => {
    createStory(
      {
        story: {
          name: data.name,
          assigned_to: data.assignedTo,
          environment: data.environment,
          type: data.type,
        },
        artifacts: data.artifacts,
      },
      {
        onSuccess: () => {
          reset();
          setOpen(false);
        },
      }
    );
  };

  const handleDialogOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      reset();
    }
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
                    <Badge key={index} variant="secondary" className="text-xs">
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
