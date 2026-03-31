import { create } from "zustand";
import { MatchGame } from "@/match-game/match-game.types";
import { supabase } from "@/supabaseClient";
import { AlertType, useAlertStore } from "@/stores/alertStore";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useTeamStore } from "@/stores/teamStore";

interface GameState {
    games: MatchGame[];
    channel: RealtimeChannel | null;
    loading: boolean;
    loadingGameIds: Set<number>;
    setGameLoading: (id: number, val: boolean) => void;
    updateGame: (gameId: number, gameData: Partial<MatchGame>) => Promise<void>;
    subscribeToMatch: (matchId: number) => void;
    closeChannel: () => void;
    unsubscribe: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    games: [],
    loading: false,
    loadingGameIds: new Set(),
    channel: null,

    setGameLoading: (id: number, val: boolean) => {
        const { loadingGameIds } = get();
        const ids = new Set(loadingGameIds);
        val ? ids.add(id) : ids.delete(id);
        set({ loadingGameIds: ids });
    },

    updateGame: async (gameId: number, gameData: Partial<MatchGame>) => {
        if (!gameId) return;
        get().setGameLoading(gameId, true);

        // Solo se permite actualizar el winner, status e intercambiar los ids de red y blue
        const updatePayload: any = {};
        if (gameData.winner_team_id !== undefined) updatePayload.winner_team_id = gameData.winner_team_id;
        if (gameData.team_red_id !== undefined) updatePayload.team_red_id = gameData.team_red_id;
        if (gameData.team_blue_id !== undefined) updatePayload.team_blue_id = gameData.team_blue_id;
        if (gameData.status !== undefined) updatePayload.status = gameData.status;

        try {
            const { error } = await supabase
                .from('games')
                .update(updatePayload)
                .eq('id', gameId);

            if (error) throw error;
        } catch (error: any) {
            useAlertStore.getState().addAlert({ message: error.message, type: AlertType.ERROR });
            throw error;
        } finally {
            get().setGameLoading(gameId, false);
        }
    },

    subscribeToMatch: (matchId: number) => {
        const currentChannel = get().channel;
        if (currentChannel) currentChannel.unsubscribe();

        set({
            loading: true,
            games: []
        });

        const enrichGame = (game: any): MatchGame => {
            const teams = useTeamStore.getState().teams;
            const team_blue = teams.find(t => t.id === game.team_blue_id);
            const team_red = teams.find(t => t.id === game.team_red_id);
            return { ...game, team_blue, team_red } as MatchGame;
        };

        const channel = supabase
            .channel(`match_games:${matchId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "games",
                    filter: `match_id=eq.${matchId}`,
                },
                (payload) => {
                    if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
                        const updatedGame = enrichGame(payload.new);
                        set((state) => {
                            const filteredGames = state.games.filter(g => g.id !== updatedGame.id);
                            filteredGames.push(updatedGame);
                            filteredGames.sort((a, b) => a.game_number - b.game_number);
                            return { games: filteredGames };
                        });
                    } else if (payload.eventType === "DELETE") {
                        set(state => ({
                            games: state.games.filter(g => g.id !== payload.old.id)
                        }));
                    }
                }
            )
            .subscribe();

        set({ channel });

        supabase
            .from("games")
            .select('*')
            .eq("match_id", matchId)
            .order("game_number", { ascending: true })
            .then(({ data, error }) => {
                if (error) {
                    console.error("[GameStore] Error cargando games:", error);
                } else {
                    const allGames = (data || []).map(enrichGame);
                    set({ games: allGames });
                }
                set({ loading: false });
            });
    },

    closeChannel: () => {
        const channel = get().channel;
        if (channel) {
            channel.unsubscribe();
            set({ channel: null });
        }
    },

    unsubscribe: () => {
        const channel = get().channel;
        if (channel) channel.unsubscribe();
        set({ channel: null, games: [] });
    },
}));