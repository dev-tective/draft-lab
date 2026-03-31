import { forwardRef, useState } from "react";
import { Icon } from "@iconify/react";
import { ModalLayout, ModalRef } from "@/layout/ModalLayout";
import { GameState, MatchGame } from "../../match-game.types";
import { useGameStore } from "@/match-game/store/gameStore";
import { usePickAndBanStore } from "../../store/pickAndBanStore";
import { ModalSection } from "@/components/shared/ModalSection";
import { supabase } from "@/supabaseClient"; // Assuming supabase is needed to update status if updateGame from store doesn't allow it
import { AlertType, useAlertStore } from "@/stores/alertStore";

export const GameStatusPanelModal = forwardRef<ModalRef, { game: MatchGame }>(({ game }, ref) => {
    const { updateGame, loadingGameIds } = useGameStore();
    const isUpdatingGame = loadingGameIds.has(game.id);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    
    const { 
        bluePicks, redPicks, blueBans, redBans, 
        updatePick, updateBan, 
        loadingPickIds, loadingBanIds 
    } = usePickAndBanStore();

    const isUpdatingDraft = loadingPickIds.size > 0 || loadingBanIds.size > 0;
    const isLoading = isUpdatingGame || isUpdatingDraft || isUpdatingStatus;

    const [clearSelections, setClearSelections] = useState({
        bluePicks: false,
        blueBans: false,
        redPicks: false,
        redBans: false,
    });

    const hasClearSelection = Object.values(clearSelections).some(Boolean);

    const statuses = [
        { state: GameState.WAITING, label: 'Espera', icon: 'mdi:clock-outline', color: 'text-slate-400', activeBg: 'bg-slate-700/50' },
        { state: GameState.IN_PROGRESS, label: 'En Vivo', icon: 'mdi:play-circle-outline', color: 'text-amber-400', activeBg: 'bg-amber-500/20' },
        { state: GameState.FINISHED, label: 'Finalizado', icon: 'mdi:check-circle-outline', color: 'text-emerald-400', activeBg: 'bg-emerald-500/20' }
    ];

    const handleUpdateStatus = async (status: GameState) => {
        setIsUpdatingStatus(true);
        const { error } = await supabase.from('games').update({ status }).eq('id', game.id);
        setIsUpdatingStatus(false);
        if (error) {
            useAlertStore.getState().addAlert({ message: error.message, type: AlertType.ERROR });
        }
    };

    const handleClearDraft = async () => {
        const promises: Promise<void>[] = [];
        if (clearSelections.bluePicks) {
            bluePicks.filter(p => p.hero_id !== null).forEach(p => promises.push(updatePick(p.id, { hero_id: null, is_locked: false })));
        }
        if (clearSelections.redPicks) {
            redPicks.filter(p => p.hero_id !== null).forEach(p => promises.push(updatePick(p.id, { hero_id: null, is_locked: false })));
        }
        if (clearSelections.blueBans) {
            blueBans.filter(b => b.hero_id !== null).forEach(b => promises.push(updateBan(b.id, { hero_id: null, is_locked: false })));
        }
        if (clearSelections.redBans) {
            redBans.filter(b => b.hero_id !== null).forEach(b => promises.push(updateBan(b.id, { hero_id: null, is_locked: false })));
        }
        await Promise.all(promises);
        setClearSelections({ bluePicks: false, blueBans: false, redPicks: false, redBans: false });
    };

    const handleSwapPlaces = async () => {
        await updateGame(game.id, {
            team_blue_id: game.team_red_id,
            team_red_id: game.team_blue_id
        });
    };

    const handleSetWinner = async (winnerId: number | null) => {
        await updateGame(game.id, { winner_team_id: winnerId, status: GameState.FINISHED });
    };

    const handleClose = () => {
        if (isLoading) return;
        if (ref && typeof ref !== 'function' && ref.current) {
            ref.current.close();
        }
    };

    const toggleSelection = (key: keyof typeof clearSelections) => {
        setClearSelections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <ModalLayout ref={ref} canClose={!isLoading}>
            <div className="
                absolute flex flex-col
                max-w-2xl w-11/12 md:w-10/12
                p-5 md:p-8 gap-5
                rounded-tr-3xl rounded-bl-3xl
                beveled-bl-tr border beveled
                bg-slate-950 border-cyan-800
                max-h-[90vh] overflow-y-auto
                [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-indigo-900/50 
                [&::-webkit-scrollbar-thumb]:rounded-full
            ">
                {isLoading && (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-3xl">
                        <Icon icon="line-md:loading-twotone-loop" className="text-4xl text-indigo-400 drop-shadow" />
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl md:text-2xl text-slate-200 uppercase tracking-widest font-bold italic">
                            Opciones del Game
                        </h1>
                        <p className="text-cyan-500 text-xs md:text-sm tracking-wider uppercase">
                            Configuración y Estado
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="text-slate-500 hover:text-indigo-400 transition-colors disabled:opacity-30"
                    >
                        <Icon icon="mdi:close" className="text-3xl" />
                    </button>
                </div>

                {/* Estado del Game */}
                <ModalSection icon="mdi:state-machine" iconColor="text-pink-400" title="Estado">
                    <div className="grid grid-cols-3 gap-3">
                        {statuses.map(s => {
                            const isActive = game.status === s.state;
                            return (
                                <button
                                    key={s.state}
                                    onClick={() => handleUpdateStatus(s.state)}
                                    className={`flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-lg font-bold transition-all ${isActive
                                            ? `${s.activeBg} ${s.color} border border-${s.color.replace('text-', '')}/50 shadow-inner`
                                            : 'bg-slate-900/50 text-slate-500 border border-slate-800 hover:bg-slate-800 hover:text-slate-300'
                                        }`}
                                >
                                    <Icon icon={s.icon} className="text-2xl" />
                                    <span className="text-xs uppercase tracking-wider">{s.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </ModalSection>

                {/* Resultado y Lados */}
                <ModalSection icon="mdi:trophy-outline" iconColor="text-amber-400" title="Resultado y Lados">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="flex-1 w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 flex flex-col gap-2">
                                <span className="text-xs text-slate-400 uppercase tracking-widest text-center">Declarar Ganador</span>
                                <div className="flex gap-2 justify-center">
                                    <button 
                                        onClick={() => handleSetWinner(game.team_blue_id)}
                                        className={`flex-1 py-2 text-xs font-bold rounded uppercase tracking-wider transition-all border ${
                                            game.winner_team_id === game.team_blue_id
                                            ? 'bg-cyan-900/50 border-cyan-500 text-cyan-400 shadow-inner'
                                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-cyan-700 hover:text-cyan-200'
                                        }`}
                                    >Blue</button>
                                    <button 
                                        onClick={() => handleSetWinner(game.team_red_id)}
                                        className={`flex-1 py-2 text-xs font-bold rounded uppercase tracking-wider transition-all border ${
                                            game.winner_team_id === game.team_red_id
                                            ? 'bg-fuchsia-900/50 border-fuchsia-500 text-fuchsia-400 shadow-inner'
                                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-fuchsia-700 hover:text-fuchsia-200'
                                        }`}
                                    >Red</button>
                                </div>
                                <button 
                                    onClick={() => handleSetWinner(null)}
                                    className={`w-full py-1 text-[10px] font-bold rounded uppercase tracking-wider transition-all border ${
                                        game.winner_team_id === null
                                        ? 'bg-slate-700/50 border-slate-500 text-slate-300 shadow-inner'
                                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'
                                    }`}
                                >Sin Ganador</button>
                            </div>

                            <button
                                onClick={handleSwapPlaces}
                                className="
                                    flex flex-col items-center justify-center gap-2
                                    w-full md:w-32 h-24 shrink-0
                                    border border-slate-700 bg-slate-900/50 rounded-xl
                                    text-slate-400
                                    hover:border-indigo-500 hover:text-indigo-300 hover:bg-indigo-950/30
                                    transition-all
                                "
                            >
                                <Icon icon="tdesign:swap" className="text-3xl" />
                                <span className="text-[10px] uppercase font-bold tracking-widest text-center">Intercambiar<br/>Lados</span>
                            </button>
                        </div>
                    </div>
                </ModalSection>

                {/* Limpiar Draft */}
                <ModalSection icon="mdi:broom" iconColor="text-emerald-400" title="Limpiar Draft">
                    <div className="flex flex-col gap-3">
                        <p className="text-xs text-slate-500">Selecciona los elementos a los que les deseas remover el héroe asociado.</p>
                        
                        <div className="grid grid-cols-2 gap-3">
                            {/* Blue picks */}
                            <button
                                onClick={() => toggleSelection('bluePicks')}
                                className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                                    clearSelections.bluePicks ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                                }`}
                            >
                                <Icon icon={clearSelections.bluePicks ? "mdi:checkbox-marked" : "mdi:checkbox-blank-outline"} className="text-xl" />
                                <span className="text-xs uppercase font-bold tracking-wider">Blue Picks</span>
                            </button>
                            
                            {/* Red picks */}
                            <button
                                onClick={() => toggleSelection('redPicks')}
                                className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                                    clearSelections.redPicks ? 'bg-fuchsia-950/60 border-fuchsia-500 text-fuchsia-300' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                                }`}
                            >
                                <Icon icon={clearSelections.redPicks ? "mdi:checkbox-marked" : "mdi:checkbox-blank-outline"} className="text-xl" />
                                <span className="text-xs uppercase font-bold tracking-wider">Red Picks</span>
                            </button>
                            
                            {/* Blue bans */}
                            <button
                                onClick={() => toggleSelection('blueBans')}
                                className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                                    clearSelections.blueBans ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 opacity-80' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                                }`}
                            >
                                <Icon icon={clearSelections.blueBans ? "mdi:checkbox-marked" : "mdi:checkbox-blank-outline"} className="text-xl" />
                                <span className="text-xs uppercase font-bold tracking-wider">Blue Bans</span>
                            </button>

                            {/* Red bans */}
                            <button
                                onClick={() => toggleSelection('redBans')}
                                className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                                    clearSelections.redBans ? 'bg-fuchsia-950/60 border-fuchsia-500 text-fuchsia-300 opacity-80' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                                }`}
                            >
                                <Icon icon={clearSelections.redBans ? "mdi:checkbox-marked" : "mdi:checkbox-blank-outline"} className="text-xl" />
                                <span className="text-xs uppercase font-bold tracking-wider">Red Bans</span>
                            </button>
                        </div>

                        <button
                            onClick={handleClearDraft}
                            disabled={!hasClearSelection}
                            className={`
                                mt-2 flex items-center justify-center gap-2 py-3 rounded-xl border
                                uppercase font-bold tracking-widest text-sm transition-all
                                ${hasClearSelection 
                                    ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400 hover:bg-emerald-800/50' 
                                    : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                                }
                            `}
                        >
                            <Icon icon="mdi:delete-sweep-outline" className="text-xl" />
                            Limpiar Seleccionados
                        </button>
                    </div>
                </ModalSection>
                
            </div>
        </ModalLayout>
    );
});
