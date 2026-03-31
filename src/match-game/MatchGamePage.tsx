import { useEffect, useRef, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { DragDropProvider, useDragDropMonitor } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { MatchGame } from "./match-game.types";
import { useStaffStore } from "@/staff/store/staffStore";
import { useMatchStore } from "@/macth/store/matchStore";
import { GameIndicator } from "./components/GameIndicator";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { usePickAndBanStore } from "./store/pickAndBanStore";
import { WarningMessage } from "@/components/shared/WarningMessage";
import { DraftPanel } from "./components/DraftPanel";
import { HeroesPanel } from "./components/heroes/HeroPanel";
import { Hero } from "@/stores/heroesStore";
import { supabase } from "@/supabaseClient";
import { useGameStore } from "@/match-game/store/gameStore";
import { AlertType, useAlertStore } from "@/stores/alertStore";

// ─── Access denied ────────────────────────────────────────────────────────────

const AccessDenied = () => (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center py-20">
        <div className="
            flex items-center justify-center
            w-20 h-20 rounded-full
            bg-red-950/30 border border-red-500/30
        ">
            <Icon icon="mdi:shield-lock" className="text-4xl text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-200">Acceso Denegado</h2>
        <p className="text-slate-500 text-sm max-w-xs">
            No tienes staff activo en la sala asociada a este match. Solicita acceso al dueño de la sala.
        </p>
    </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────

export const MatchGamePage = () => {
    const { id } = useParams<{ id: string }>();
    const matchId = id ? Number(id) : undefined;
    const navigate = useNavigate();

    const { myStaff, myStaffLoading } = useStaffStore();
    const [localRoomId, setLocalRoomId] = useState<string | null>(null);
    const matches = useMatchStore(s => s.matches);
    const match = matches.find(m => m.id === matchId);

    const { games, loading, subscribeToMatch, unsubscribe: unsubscribeGameStore } = useGameStore();
    const { subscribeToGame, unsubscribe: unsubscribePickAndBan } = usePickAndBanStore();
    const [currentGameId, setCurrentGameId] = useState<number | null>(null);
    const btnRefs = useRef<Record<number, HTMLDivElement | null>>({});

    // Sincronizar room_id incluso si recargamos directamente
    useEffect(() => {
        if (match) {
            setLocalRoomId(match.room_id);
        } else if (matchId) {
            supabase.from('matches').select('room_id').eq('id', matchId).single().then(({data}) => {
                if (data) setLocalRoomId(data.room_id);
            });
        }
    }, [match, matchId]);

    // Suscribir al gameStore y desuscribir ambos stores en desmontaje de pagina
    useEffect(() => {
        if (matchId) subscribeToMatch(matchId);
        return () => {
            unsubscribeGameStore();
            unsubscribePickAndBan();
        };
    }, [matchId]);

    // Auto-select first pending or first game
    useEffect(() => {
        if (games.length === 0) return;
        const pending = games.find(g => !g.winner_team_id);
        setCurrentGameId(pending?.id ?? games[0].id);
    }, [games]);

    // Scroll active tab into view
    useEffect(() => {
        if (!currentGameId) return;
        btnRefs.current[currentGameId]?.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest",
        });
    }, [currentGameId]);

    const currentGame = games.find(g => g.id === currentGameId) ?? null;

    useEffect(() => {
        if (currentGame) {
            subscribeToGame(currentGame);
        }
    }, [currentGame?.id, currentGame?.team_blue_id, currentGame?.team_red_id]);

    if (!matchId) return <Navigate to="/matches" replace />;

    // Guard: wait for staff data
    if (myStaffLoading) return <LoadingSpinner message="Cargando acceso..." />;

    // Guard: must have a staff entry for this match's room
    const hasAccess = localRoomId 
        ? myStaff.some(s => String(s.room_id) === String(localRoomId)) 
        : null;

    if (hasAccess === null) return <LoadingSpinner message="Verificando sala..." />;
    if (!hasAccess) return <AccessDenied />;

    return (
        <div className="min-h-full flex flex-col relative">
            {/* Game tabs */}
            <div className="
                sticky top-0 z-10
                flex w-full
                bg-slate-950 border-b border-slate-700
            ">
                {/* Controls */}
                <div className="flex items-center gap-3 p-4 pr-2 shrink-0 border-r border-slate-800">
                    <button
                        onClick={() => navigate('/matches')}
                        className="
                            flex items-center justify-center
                            w-10 h-10 rounded-xl bg-slate-900 border border-slate-700
                            text-slate-400 hover:text-cyan-400 hover:border-cyan-500 hover:bg-slate-800
                            transition-all cursor-pointer shadow-md
                        "
                        title="Volver a Matches"
                    >
                        <Icon icon="mdi:arrow-left" className="text-2xl" />
                    </button>
                    <button
                        onClick={() => {
                            const params = `/${localRoomId}/${matchId}/${currentGame?.game_number}/overlay`;
                            navigator.clipboard.writeText(
                                window.location.origin + 
                                params
                            );
                            useAlertStore.getState().addAlert({
                                message: "Enlace del match copiado al portapapeles",
                                type: AlertType.SUCCESS
                            });
                        }}
                        className="
                            flex items-center justify-center
                            w-10 h-10 rounded-xl bg-slate-900 border border-slate-700
                            text-slate-400 hover:text-emerald-400 hover:border-emerald-500 hover:bg-slate-800
                            transition-all cursor-pointer shadow-md
                        "
                        title="Copiar link del Match"
                    >
                        <Icon icon="mdi:link-variant" className="text-xl" />
                    </button>
                </div>

                {/* Game tabs scrollable */}
                <div className="
                    grid grid-flow-col auto-cols-[minmax(12rem,1fr)] items-stretch
                    overflow-x-auto h-full w-full gap-3 p-3
                    [&::-webkit-scrollbar]:hidden
                ">
                    {games.map(game => (
                        <div
                            key={game.id}
                            className="w-full h-full relative"
                            ref={el => { btnRefs.current[game.id] = el; }}
                        >
                            <GameIndicator
                                game={game}
                                isActive={game.id === currentGameId}
                                onClick={() => setCurrentGameId(game.id)}
                            />
                        </div>
                    ))}
                    {games.length === 0 && !loading && (
                        <p className="text-slate-500 text-sm self-center pl-2">Sin juegos registrados</p>
                    )}
                </div>
            </div>

            {loading ? (
                <LoadingSpinner message="Cargando juegos..." />
            ) : !currentGame ? (
                <WarningMessage
                    title="No hay juegos"
                    message="Selecciona un match valido"
                />
            ) : (
                <GameContent game={currentGame} />
            )}
        </div>
    );
};

const GameContent = ({ game }: { game: MatchGame }) => {
    const { bluePicks, redPicks, blueBans, redBans } = usePickAndBanStore();

    return (
        <DragDropProvider>
            <GameDraftMonitor />
            
            
            <div className="flex-1 flex justify-between gap-5 p-5">
                {/* Blue side */}
                <DraftPanel
                    team={game.team_blue!}
                    alternative={true}
                    picks={bluePicks}
                    bans={blueBans}
                />

                <div className="w-[45%]">
                    {/* Center: heroes */}
                    <HeroesPanel game={game} />
                </div>

                {/* Red side */}
                <DraftPanel
                    team={game.team_red!}
                    alternative={false}
                    picks={redPicks}
                    bans={redBans}
                />
            </div>
        </DragDropProvider>
    );
};

// Handles hero→pick and hero→ban drops from the shared DnD context.
// Uses isSortable to ensure we only act when source is a HeroCard (not a pick being sorted).
// Uses target.data to identify the destination type without relying on ID naming.
const GameDraftMonitor = () => {
    const { bluePicks, redPicks, blueBans, redBans, updatePick, updateBan } = usePickAndBanStore();

    useDragDropMonitor({
        onDragEnd({ operation, canceled }) {
            if (canceled || !operation.source) return;

            // Ignora a los sortables (si alguno llegara a existir)
            if (isSortable(operation.source)) return;

            const sourceData = operation.source.data as any;
            const targetData = operation.target?.data as any;
            if (!targetData) return;

            // 1. Manejo del Drag de las manijas (Swap Player o Swap Hero)
            if (sourceData.type === 'swapPlayer' || sourceData.type === 'swapHero') {
                if (!targetData.pick) return; // Solo se puede hacer swap de picks

                const sourcePick = sourceData.pick;
                const targetPick = targetData.pick;
                if (sourcePick.id === targetPick.id) return;

                if (sourceData.type === 'swapPlayer') {
                    // Muta ignorando is_locked e is_active
                    updatePick(sourcePick.id, { player_id: targetPick.player_id });
                    updatePick(targetPick.id, { player_id: sourcePick.player_id });
                } else if (sourceData.type === 'swapHero') {
                    const allPicks = [...bluePicks, ...redPicks];
                    const actualSource = allPicks.find(p => (p as any).id === sourcePick.id);
                    const actualTarget = allPicks.find(p => (p as any).id === targetPick.id);

                    if (!actualSource || !actualTarget) return;

                    // Solo intercambia si hay al menos un heroe involucrado
                    if (!actualSource.hero_id && !actualTarget.hero_id) return;

                    updatePick(actualSource.id, { hero_id: actualTarget.hero_id });
                    updatePick(actualTarget.id, { hero_id: actualSource.hero_id });
                }
                return;
            }

            // 2. Manejo del Drag de los Heroes (Seteo normal)
            const droppedHero = sourceData as Hero;
            if (droppedHero?.id && !sourceData.type) {
                // Hero → active Pick slot
                if (targetData.pick) {
                    const pick = [...bluePicks, ...redPicks].find(p => p.id === targetData.pick.id);
                    if (!pick?.is_active) return;
                    updatePick(pick.id, { hero_id: droppedHero.id, is_active: false, is_locked: true });
                    return;
                }

                // Hero → active Ban slot
                if (targetData.ban) {
                    const ban = [...blueBans, ...redBans].find(b => b.id === targetData.ban.id);
                    if (!ban?.is_active) return;
                    updateBan(ban.id, { hero_id: droppedHero.id, is_active: false, is_locked: true });
                }
            }
        },
    });

    return null;
};
