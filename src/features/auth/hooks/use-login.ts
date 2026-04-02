import { toast } from "@/shared/hooks/use-toast";
import { supabase } from "@/infrastructure/supabaseClient";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

type UseLoginReturn = {
  readonly handleGoogleLogin: () => Promise<void>;
};

export function useLogin(): UseLoginReturn {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async (): Promise<void> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
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
