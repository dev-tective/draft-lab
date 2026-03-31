import { Pick } from "@/match-game/match-game.types";

export const DraftSlot = ({ pick }: { pick: Pick }) => {
    const { player, hero, is_active } = pick;

    return (
        <div className={`
            relative flex flex-col items-center justify-end
            transition-all
            ${is_active ? 'w-[120%]' : 'w-full'} h-full
        `}>
            {/* Top area for hero image */}
            <div className="
                relative flex-1 flex justify-center items-center
                w-full bg-white
                overflow-hidden
            ">
                {/* Hero Image Split In Transition */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    <div 
                        className={`
                            absolute inset-0 transition-transform duration-800 ease-out
                            ${hero ? 'translate-x-0 translate-y-0' : '-translate-x-full -translate-y-full'}
                        `}
                        style={{ clipPath: 'polygon(-1% -1%, 102% -1%, -1% 102%)' }} 
                    >
                        {hero?.image_slot_url && (
                            <img
                                className="absolute top-0 left-0 w-full h-full object-cover object-top"
                                src={hero.image_slot_url}
                                alt={hero.name}
                            />
                        )}
                    </div>
                    <div 
                        className={`
                            absolute inset-0 transition-transform duration-800 ease-out
                            ${hero ? 'translate-x-0 translate-y-0' : 'translate-x-full translate-y-full'}
                        `}
                        style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} 
                    >
                        {hero?.image_slot_url && (
                            <img
                                className="absolute top-0 left-0 w-full h-full object-cover object-top"
                                src={hero.image_slot_url}
                                alt={hero.name}
                            />
                        )}
                    </div>
                </div>
                
                <div className={`
                    z-10 absolute top-0 left-0
                    h-full w-8
                    bg-linear-to-r from-black/80 to-transparent
                    transition-all duration-1500 ease-in-out
                    ${hero ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
                `}>
                    {hero && (
                        <span className="
                            absolute top-3 left-1/2
                            origin-left -translate-y-1/2 rotate-90
                            text-white text-[11px] md:text-[13px]
                            font-bold tracking-widest 
                            uppercase whitespace-nowrap transition-all
                            drop-shadow
                        ">
                            {hero.name}
                        </span>
                    )}
                </div>

                {player?.lane && !hero && (
                    <div
                        className={`
                            w-full h-full bg-slate-800
                            transition-all z-21
                            ${is_active && 'animate-pulse'}
                        `}
                        style={{
                            maskImage: `url(${player.lane.image})`,
                            maskSize: '45%',
                            maskPosition: 'center',
                            maskRepeat: 'no-repeat',
                        }}
                    />
                )}
            </div>

            {/* Bottom area for player nickname */}
            <div className="
                shrink-0 text-center content-center
                w-full h-1/7
                bg-slate-800 
                text-white text-sm
                font-bold truncate uppercase
            ">
                {player?.nickname || "—"}
            </div>
            {is_active && (
                <span className="
                    absolute w-full h-1
                    bg-slate-500 animate-pulse
                " />
            )}
        </div>
    );
}