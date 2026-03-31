import { Team } from "@/stores/teamStore";
import { Pick, Ban } from "../match-game.types";
import { BanSlot } from "./BanSlot";
import { PickSlot } from "./PickSlot";
import { useGameStore } from "@/match-game/store/gameStore";

interface Props {
    team: Team;
    alternative: boolean;
    picks: Pick[];
    bans: Ban[];
}

export const DraftPanel = ({ team, alternative, picks, bans }: Props) => {
    const { id, name } = team;
    const games = useGameStore(s => s.games);
    
    // Contar victorias
    const wins = games.filter(g => g.winner_team_id === id).length;

    // Generar barras de victoria
    const winBars = Array.from({ length: wins }).map((_, i) => (
        <div 
            key={i} 
            className={`
                h-1.5 w-6 md:w-8 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]
                ${alternative ? 'bg-cyan-400 shadow-cyan-400/50' : 'bg-fuchsia-400 shadow-fuchsia-400/50'}
            `} 
        />
    ));

    return (
        <div className="
            flex-1 flex flex-col
            gap-2 
        ">
            <div className={`
                flex items-center justify-between
                w-full border-b-2 py-2 px-2
                ${alternative ? 'border-cyan-500/30 flex-row' : 'border-fuchsia-500/30 flex-row-reverse'}
            `}>
                <div className={`
                    grid gap-1
                    ${wins > 3 ? 'grid-cols-2' : 'grid-cols-1'}
                `}>
                    {winBars}
                </div>
                
                <span className={`
                    text-lg font-bold
                    uppercase tracking-widest text-center
                    ${alternative ? 'text-cyan-400' : 'text-fuchsia-400'}
                `}>
                    {name}
                </span>

                <div className="flex flex-col gap-1 items-center invisible">
                    {winBars}
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-2">
                <div className="h-16 flex gap-1">
                    {bans.map((ban) => (
                    <BanSlot 
                        key={ban.id} 
                        ban={ban} 
                    />
                ))}
                </div>
                <div className="grid grid-cols-1 grid-rows-5 gap-1 flex-1">
                    {picks.map((pick) => (
                        <PickSlot key={pick.id} pick={pick} />
                    ))}
                </div>
            </div>
        </div>
    );
};
