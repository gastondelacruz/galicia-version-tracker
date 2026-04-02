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
import { useEditStoryDialog } from "@/features/stories/hooks/use-edit-story-dialog";
import { Artifact, Story } from "@/shared/types";
import { ArtifactSelector } from "@/features/artifacts/components/ArtifactSelector";
import { Trash2 } from "lucide-react";
import { Controller } from "react-hook-form";

type EditStoryDialogProps = {
  readonly story: Story;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
};

export function EditStoryDialog({
  story,
  open,
  onOpenChange,
}: EditStoryDialogProps): JSX.Element {
  const {
    showDeleteAlert,
    setShowDeleteAlert,
    form,
    users,
    isUpdating,
    isDeleting,
    handleSave,
    handleDelete,
    handleOpenChange,
  } = useEditStoryDialog({ story, open, onOpenChange });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;

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
