import { useState } from "react";
import { MatchGame } from "../match-game.types";
import { supabase } from "@/supabaseClient";
import { useAlertStore, AlertType } from "@/stores/alertStore";

export const useUpdateMatchGame = () => {
    const [isUpdating, setIsUpdating] = useState(false);

    const updateGame = async (gameId: number, updates: Partial<MatchGame>) => {
        setIsUpdating(true);
        try {
            const { error } = await supabase
                .from('games')
                .update(updates)
                .eq('id', gameId);

            if (error) throw error;
        } catch (error: any) {
            useAlertStore.getState().addAlert({
                message: error.message || "Error al actualizar el juego",
                type: AlertType.ERROR
            });
        } finally {
            setIsUpdating(false);
        }
    };

    return { updateGame, isUpdating };
};
