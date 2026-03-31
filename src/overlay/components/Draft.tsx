import { Ban, Pick } from "@/match-game/match-game.types";
import { DraftSlot } from "./DraftSlot";
import { BanSlot } from "./BanSlot";
import { Icon } from "@iconify/react";

interface Props {
    picks: Pick[];
    bans: Ban[];
    team: "blue" | "red";
    coach?: string | null;
}

export const Draft = ({ picks, bans, team, coach }: Props) => {
    return (
        <div className="
            flex-1 flex flex-col justify-end
        ">
            <div className={`
                flex w-full min-h-[8dvh]
                ${team === "blue" && "flex-row-reverse"}
            `}>
                <div className={`flex gap-px w-3/5`}>
                    {bans.map(ban => (
                        <BanSlot
                        key={ban.id}
                        ban={ban}
                        team={team}
                        />
                    ))}
                </div>
                <div className={`
                    flex gap-2 items-center 
                    ${team === "blue" ? "flex-row" : "flex-row-reverse"}
                    px-4 bg-white w-2/5
                    text-slate-800 min-w-max shrink-0
                `}>
                    <Icon icon="tdesign:earphone-filled"
                     className="text-2xl text-slate-400" />
                    <span className="font-bold uppercase tracking-wider text-sm whitespace-nowrap">
                        {coach || 'Sin Coach'}
                    </span>
                </div>
            </div>
            <div className="
                flex-1 w-full h-full
                flex justify-between items-center
                gap-px
                min-h-[25dvh]
            ">
                {picks.map(pick => (
                    <DraftSlot key={pick.id} pick={pick} />
                ))}
            </div>
        </div>
    );
}