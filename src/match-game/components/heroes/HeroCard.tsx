import { Hero } from "@/stores/heroesStore";
import { useDraggable } from "@dnd-kit/react";
import { Icon } from "@iconify/react";

export const HeroCard = ({ hero }: { hero: Hero }) => {
    const { image_slot_url } = hero;
    const { ref, isDragging } = useDraggable({
        id: hero.id,
        data: hero,
    })
    
    return (
        <div
            ref={ref}
            className={`
                relative flex justify-center items-center
                group aspect-2/3
                cursor-pointer transition-all
                ${isDragging && 'opacity-50'}
            `}
            style={{
                backgroundImage: `url(${image_slot_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="
                flex items-end justify-center 
                h-full w-full pb-1
                text-center text-sm font-bold text-amber-400 drop-shadow
                bg-linear-to-t from-slate-950/70 to-transparent
            ">
                {hero.name}
            </div>
            {isDragging && (
                <Icon
                    className="absolute text-slate-200 text-4xl"
                    icon="mdi:drag-variant" 
                />
            )}
        </div>
    )
};
