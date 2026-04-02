import type { UseDashboardReturn } from "@/features/kanban/types";
import { toast } from "@/shared/hooks/use-toast";
import { ROUTES } from "@/shared/constants/routes";
import { supabase } from "@/infrastructure/supabaseClient";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function useDashboard(): UseDashboardReturn {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate(ROUTES.LOGIN);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        navigate(ROUTES.LOGIN);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async (): Promise<void> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Exito",
        description: "Se ha cerrado sesión correctamente",
      });
      navigate(ROUTES.LOGIN);
    } catch {
      toast({
        title: "Error",
        description: "Error al cerrar sesión",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { loading, handleLogout };
}
