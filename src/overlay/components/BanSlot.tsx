import { Icon } from "@iconify/react";
import { Ban } from "@/match-game/match-game.types";

interface Props {
    ban: Ban;
    team: "blue" | "red";
}

export const BanSlot = ({ ban, team }: Props) => {
    const { hero, is_active } = ban;
    
    return (
        <div className={`
            relative flex items-center justify-center
            w-full h-full
            bg-slate-950/80 overflow-hidden
            transition-all duration-300
            ${is_active && 'animate-pulse'}
            ${!hero && 'opacity-70'}
        `}>
            {hero?.image_slot_url ? (
                <img 
                    src={hero.image_slot_url} 
                    alt={hero.name} 
                    className="absolute -top-2 inset-0 w-full object-cover grayscale" 
                />
            ) : (
                <Icon 
                    icon="mdi:close" 
                    className={`
                        text-2xl md:text-3xl font-thin 
                        ${team === "blue" ? "text-blue-500" : "text-red-500"}`}
                />
            )}
        </div>
    );
}