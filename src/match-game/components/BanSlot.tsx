// import { MouseEvent } from "react";
import { Icon } from "@iconify/react";
import { Ban } from "../match-game.types";
import { usePickAndBanStore } from "../store/pickAndBanStore";
import { IconSlot } from "./PickSlot";
import { useDroppable } from "@dnd-kit/react";

export const BanSlot = ({ ban }: { ban: Ban }) => {
    const { ref, isDropTarget } = useDroppable({
        id: ban.id,
        data: { ban },
    });

    const { hero, is_active } = ban;
    const { loadingBanIds, updateBan } = usePickAndBanStore();
    const isLoading = loadingBanIds.has(ban.id);

    // const toggleLock = (e: MouseEvent) => {
    //     e.stopPropagation();
    //     updateBan(ban.id, { is_locked: !is_locked });
    // };

    const toggleActive = () => {
        updateBan(ban.id, { is_active: !is_active });
    };

    const resetHero = () => {
        updateBan(ban.id, { hero_id: null, is_active: true });
    };

    return (
        <div
            ref={ref}
            onClick={toggleActive}
            className={`
                flex justify-center items-center
                w-full h-full 
                border relative
                ${!hero && 'bg-slate-900/50'}
                ${is_active ? 'border-amber-400 animate-pulse' : 'border-slate-600'}
                ${isDropTarget && is_active ? 'ring-2 ring-amber-400/70 brightness-110' : ''}
            `}
            style={hero ? {
                backgroundImage: `url(${hero.image_slot_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 20%',
            } : {}}
        >
            {isLoading && (
                <div className={`
                    absolute inset-0 z-10
                    flex items-center justify-center 
                    bg-slate-900/60 backdrop-blur-sm
                    border border-amber-400/30
                    transition-all duration-500
                    animate-in fade-in
                `}>
                    <div className="flex flex-col items-center gap-2">
                        <div className="relative">
                            <Icon
                                icon="line-md:loading-twotone-loop"
                                className="
                                    text-amber-400 text-4xl 
                                    drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]
                                "
                            />
                            <div className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full animate-pulse" />
                        </div>
                    </div>
                </div>
            )}
            {hero && (
                <IconSlot
                    size="text-4xl opacity-50 hover:opacity-100"
                    icon="boxicons:refresh-cw-alt-dot-filled"
                    onClick={resetHero}
                />
            )}
            {/* <div className="absolute bottom-0 right-0">
                <IconSlot
                    icon={!is_locked ? "oi:lock-unlocked" : "oi:lock-locked"}
                    onClick={toggleLock}
                />
            </div> */}
        </div>
    );
}