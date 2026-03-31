import { Icon } from "@iconify/react";
import { MatchGame, GameState } from "../match-game.types";

interface Props {
    game: MatchGame;
    isActive: boolean;
    onClick: () => void;
}

export const GameIndicator = ({ game, isActive, onClick }: Props) => {
    // 1. Setup Status Colors
    let statusColor = "text-slate-400 border-slate-700 hover:border-slate-500";
    let statusBg = "bg-slate-900/50 hover:bg-slate-800";
    let statusText = "En espera";
    let statusIcon = "mdi:clock-outline";
    let activeColor = "bg-slate-300 text-slate-950 border-slate-300";

    if (game.status === GameState.IN_PROGRESS) {
        statusColor = "text-cyan-400 border-cyan-800 hover:border-cyan-500";
        statusBg = "bg-cyan-950/40 hover:bg-cyan-900/60";
        statusText = "En Vivo";
        statusIcon = "mdi:play-circle-outline";
        activeColor = "bg-cyan-400 text-slate-950 border-cyan-400";
    } else if (game.status === GameState.FINISHED) {
        statusColor = "text-fuchsia-400 border-fuchsia-800 hover:border-fuchsia-500";
        statusBg = "bg-fuchsia-950/40 hover:bg-fuchsia-900/60";
        statusText = "Finalizado";
        statusIcon = "mdi:check-circle-outline";
        activeColor = "bg-fuchsia-500 text-slate-950 border-fuchsia-500";
    }

    // 2. Setup Winner Name & Color
    let winnerName = null;
    let winnerColor = "";
    if (game.winner_team_id) {
        if (game.winner_team_id === game.team_blue_id) {
            winnerName = game.team_blue?.name || "Blue";
            winnerColor = "text-cyan-400";
        } else if (game.winner_team_id === game.team_red_id) {
            winnerName = game.team_red?.name || "Red";
            winnerColor = "text-fuchsia-400";
        }
    }

    return (
        <button
            onClick={onClick}
            className={`
                flex flex-col items-center justify-center
                w-full h-full min-w-48 py-2 px-5 gap-1
                border beveled-tr beveled-bl rounded-tr-2xl rounded-bl-2xl
                cursor-pointer transition-all
                ${isActive ? `${activeColor} pointer-events-none` : `${statusColor} ${statusBg}`}
            `}
        >
            <div className="flex items-center gap-2 font-bold">
                <Icon 
                    icon={isActive ? "game-icons:pointy-sword" : "game-icons:bouncing-sword"} 
                    className="text-lg md:text-xl"
                />
                <span className="text-sm md:text-base uppercase tracking-widest font-black">
                    Game {game.game_number}
                </span>
            </div>

            <div className={`flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest ${isActive ? 'text-slate-800' : 'opacity-80'}`}>
                <Icon icon={statusIcon} className="text-sm" />
                <span>{statusText}</span>

                {winnerName && (
                    <>
                        <span className="mx-1 font-black opacity-30">|</span>
                        <Icon icon="mdi:trophy" className={`text-sm ${isActive ? 'text-slate-900' : winnerColor}`} />
                        <span className={isActive ? 'text-slate-900' : winnerColor}>
                            {winnerName}
                        </span>
                    </>
                )}
            </div>
        </button>
    );
};
