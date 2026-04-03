import type { UseLoginReturn } from "@/features/auth/types";
import { toast } from "@/shared/hooks/use-toast";
import { ROUTES } from "@/shared/constants/routes";
import { supabase } from "@/infrastructure/supabaseClient";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useLogin(): UseLoginReturn {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async (): Promise<void> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        navigate(ROUTES.DASHBOARD);
      }
    };
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate(ROUTES.DASHBOARD);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${ROUTES.DASHBOARD}`,
        },
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return { handleGoogleLogin };
}
