import type { Person } from "@/shared/types";
import { QUERY_KEYS } from "@/shared/constants/queryKeys";
import { DB_TABLES } from "@/shared/constants/tables";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/infrastructure/supabaseClient";

export const useUsers = () => {
  return useQuery({
    queryKey: QUERY_KEYS.USERS,
    queryFn: async (): Promise<Person[]> => {
      const { data, error } = await supabase
        .from(DB_TABLES.PEOPLE)
        .select("*")
        .order("name", { ascending: true });

      if (error) throw new Error(error.message);
      return data as Person[];
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const { data, error } = await supabase
        .from(DB_TABLES.PEOPLE)
        .insert({ name })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Person;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from(DB_TABLES.PEOPLE)
        .update({ name })
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Person;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from(DB_TABLES.PEOPLE)
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
    },
  });
};
