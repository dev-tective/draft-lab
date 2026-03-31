import { Icon } from "@iconify/react";
import { useState } from "react";
import { Pick } from "../match-game.types";
import { ChangePlayerModal } from "./modal/ChangePlayerModal";
import { usePickAndBanStore } from "../store/pickAndBanStore";
import { useDraggable, useDroppable } from "@dnd-kit/react";

export const PickSlot = ({ pick }: { pick: Pick }) => {
    const { hero, player, is_active } = pick;
    const hasHero = !!hero?.image_profile_url;
    const lane = player?.lane;

    const profileUrl = hero?.game === "LOL" ?
         hero?.image_slot_url : hero?.image_profile_url;

    const { updatePick, loadingPickIds } = usePickAndBanStore();
    const isLoading = loadingPickIds.has(pick.id);

    // Droppable: toda la caja puede recibir swaps o nuevos heroes
    const { ref: dropRef, isDropTarget } = useDroppable({
        id: pick.id,
        data: { pick },
    });

    // Draggable Handle 1: Swap Player
    const { ref: dragPlayerRef, isDragging: isDraggingPlayer } = useDraggable({
        id: `drag_player_${pick.id}`,
        data: { type: 'swapPlayer', pick },
    });

    // Draggable Handle 2: Swap Hero
    const { ref: dragHeroRef, isDragging: isDraggingHero } = useDraggable({
        id: `drag_hero_${pick.id}`,
        data: { type: 'swapHero', pick },
    });

    const isDragging = isDraggingPlayer || isDraggingHero;

    const [show, setShow] = useState(false);
    const [modalCoords, setModalCoords] = useState({ x: 0, y: 0 });

    const toggleActive = () => {
        updatePick(pick.id, { is_active: !is_active });
    };

    const resetHero = () => {
        updatePick(pick.id, { hero_id: null, is_active: true });
    };

    return (
        <div 
            className={`
                flex relative border-r-3
                ${isDragging && 'opacity-50'}
                ${is_active ? 'border-amber-400 animate-pulse' : 'border-slate-600'}
            `}
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

            {show && <ChangePlayerModal
                pick={pick}
                coords={modalCoords}
                setShow={setShow}
            />}

            <div className="flex flex-col">
                <button
                    ref={dragPlayerRef}
                    className="
                        flex items-center justify-center
                        h-full w-full px-2 text-2xl font-bold
                        bg-amber-950/70 hover:bg-amber-400
                        transition-colors cursor-pointer
                        border border-amber-400/50 hover:text-amber-950
                    "
                    title="Intercambair jugador"
                >
                    <Icon 
                        icon="ph:user-switch-fill" 
                        className="pointer-events-none" 
                    />
                </button>
                <button
                    ref={dragHeroRef}
                    className="
                        flex items-center justify-center
                        h-full w-full px-2 text-2xl font-bold
                        bg-amber-950/70 hover:bg-amber-400
                        transition-colors cursor-pointer
                        border border-amber-400/50 hover:text-amber-950
                    "
                    title="Intercambiar heroe"
                >
                    <Icon 
                        icon="tabler:transfer-vertical" 
                        className="pointer-events-none" 
                    />
                </button>
            </div>

            <div
                ref={dropRef}
                onClick={toggleActive}
                className={`
                    relative flex items-end justify-between
                    w-full h-full p-3
                    ${isDropTarget && !isDragging ? 'ring-2 ring-amber-400 brightness-150' : ''}
                `}
            >
                {/* Background Layer */}
                <div className={`
                    absolute inset-0 -z-1
                    flex items-center justify-center
                    overflow-hidden ${!hasHero && 'bg-slate-900'}
                `}>
                    {lane && (
                        <div
                            className={`
                                absolute aspect-square transition-all duration-500 ease-in-out
                                ${hasHero ?
                                    'top-3 left-3 h-1/5 bg-amber-400 drop-shadow' :
                                    'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2/6 bg-slate-400/50'}
                            `}
                            style={{
                                maskImage: `url(${lane?.image})`,
                                maskSize: 'cover',
                                maskPosition: 'center',
                                maskRepeat: 'no-repeat',
                                WebkitMaskImage: `url(${lane?.image})`,
                            }}
                        />
                    )}
                    <div
                        className="absolute inset-0 -z-2 transition-all duration-700"
                        style={hasHero ? {
                            backgroundImage: `url(${profileUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center 22%',
                            opacity: 0.75
                        } : {}}
                    />
                </div>

                <div className="flex flex-col text-xl uppercase font-bold drop-shadow">
                    <span className="text-amber-400">{hero?.name ?? '??'}</span>
                    <span className="text-cyan-400">{player?.nickname}</span>
                </div>

                <div className="flex flex-col justify-between items-end h-full drop-shadow">
                    <IconSlot
                        icon="ph:user-switch-fill"
                        onClick={(e) => {
                            e.stopPropagation();
                            setModalCoords({ x: e.clientX, y: e.clientY });
                            setShow(true);
                        }}
                    />
                    {hero && (
                        <IconSlot
                            icon="boxicons:refresh-cw-alt-dot-filled"
                            onClick={resetHero}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

interface IconSlotProps {
    icon: string;
    size?: string;
    onClick: (e: React.MouseEvent) => void;
}
export const IconSlot = ({ icon, size = 'text-3xl', onClick }: IconSlotProps) => {
    return (
        <button
            onClick={onClick}
            className={`
                flex items-center justify-center
                ${size} text-slate-200 hover:text-amber-400
                transition-all cursor-pointer font-bold
            `}
        >
            <Icon icon={icon} />
        </button>
    );
}