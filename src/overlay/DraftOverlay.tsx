import { useParams } from "react-router-dom";
import { useGameStore } from "@/match-game/store/gameStore";
import { useEffect } from "react";
import { useRoomStore } from "@/room/store/roomStore";
import { usePickAndBanStore } from "@/match-game/store/pickAndBanStore";
import { useMatchStore } from "@/macth/store/matchStore";
import { Draft } from "./components/Draft";
import { useTeamStore } from "@/stores/teamStore";
import DEFAULT_LOGO from "@/assets/ui/shield.svg";

export const DraftOverlay = () => {
    const { roomId, matchId, gameNumber } = useParams<{
        roomId: string;
        matchId: string;
        gameNumber: string
    }>();

    const { subscribeToRoomStaff } = useRoomStore();
    const { subscribeToRoom: subscribeToRoomTeams } = useTeamStore();
    const { subscribeToRoom } = useMatchStore()
    const { subscribeToMatch, games } = useGameStore();
    const { subscribeToGame, redPicks, bluePicks, redBans, blueBans } = usePickAndBanStore();

    const currentGame = games.find(g => 
        g.match_id === Number(matchId) && 
        g.game_number === Number(gameNumber)
    );
    
    useEffect(() => {
        if (roomId && matchId) {
            subscribeToRoomStaff(roomId);
            subscribeToRoom(roomId);
            subscribeToRoomTeams(roomId);
            subscribeToMatch(Number(matchId));
        }
    }, [roomId, matchId]);

    useEffect(() => {
        if (roomId && matchId && gameNumber && games.length > 0) {
            if (currentGame) {
                subscribeToGame(currentGame);
            }
        }
    }, [roomId, matchId, gameNumber, games, currentGame]);
    
    return (
        <div className="
            flex
            min-w-dvw bg-slate-700
        ">
            <Draft picks={bluePicks} bans={blueBans} team="blue" coach={currentGame?.team_blue?.coach} />
            <div className="
                w-1/5 flex flex-col justify-between 
                bg-white border-x-4 border-slate-900 shadow-2xl z-50
            ">
                {/* Header: Game Info */}
                <div className="flex flex-col items-center justify-center pt-4 pb-2 w-full border-b-2 border-slate-100">
                    <span className="text-slate-500 font-bold text-[10px] md:text-xs tracking-widest uppercase">
                        MATCH {matchId}
                    </span>
                    <span className="text-slate-900 font-extrabold text-sm md:text-xl tracking-widest uppercase">
                        GAME {currentGame?.game_number || gameNumber}
                    </span>
                </div>

                {/* Bottom Stats: Teams & Wins */}
                {/* Teams & Wins */}
                {/* Teams & Wins */}
                <div className="flex items-center justify-center gap-6 md:gap-12 w-full mt-auto mb-auto">
                    {/* BLUE SIDE */}
                    <div className="flex items-center gap-4 text-blue-600 drop-shadow-sm">
                        <div className="flex flex-col items-center">
                            <img 
                                src={currentGame?.team_blue?.logo_url || DEFAULT_LOGO} 
                                alt="Blue Team" 
                                className="w-10 h-10 md:w-12 md:h-12 object-contain drop-shadow-md"
                            />
                            <span className="font-black text-[10px] md:text-lg uppercase tracking-tighter truncate max-w-20">
                                {currentGame?.team_blue?.acronym || 'BLUE'}
                            </span>
                        </div>
                        <span className="font-black text-3xl md:text-5xl">
                            {games.filter(g => g.winner_team_id === currentGame?.team_blue_id).length}
                        </span>
                    </div>

                    <span className="text-slate-500 font-extrabold text-xl md:text-2xl">-</span>

                    {/* RED SIDE */}
                    <div className="flex items-center gap-4 text-red-600 drop-shadow-sm">
                        <span className="font-black text-3xl md:text-5xl">
                            {games.filter(g => g.winner_team_id === currentGame?.team_red_id).length}
                        </span>
                        <div className="flex flex-col items-center text-right">
                            <img 
                                src={currentGame?.team_red?.logo_url || DEFAULT_LOGO} 
                                alt="Red Team" 
                                className="w-10 h-10 md:w-12 md:h-12 object-contain drop-shadow-md"
                            />
                            <span className="font-black text-[10px] md:text-lg uppercase tracking-tighter truncate max-w-20">
                                {currentGame?.team_red?.acronym || 'RED'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <Draft picks={redPicks} bans={redBans} team="red" coach={currentGame?.team_red?.coach} />
        </div>
    );
}
