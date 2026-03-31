import { HeroCard } from "./HeroCard";
import { Icon } from "@iconify/react";
import { useHeroesStore } from "@/stores/heroesStore";
import { usePickAndBanStore } from "@/match-game/store/pickAndBanStore";
import { useTagStore } from "@/stores/tagStore";
import { useRef, useState } from "react";
import { GameStatusPanelModal } from "../modal/GameStatusPanelModal";
import { MatchGame } from "@/match-game/match-game.types";
import { ModalRef } from "@/layout/ModalLayout";

export const HeroesPanel = ({ game }: { game: MatchGame }) => {
    const { heroes, setSearchQuery, searchQuery, filterHeroesByLane } = useHeroesStore();
    const { bluePicks, redPicks, blueBans, redBans } = usePickAndBanStore();
    const { lanes } = useTagStore();
    const [activeLaneId, setActiveLaneId] = useState<number>(0);
    const modalRef = useRef<ModalRef>(null);

    const availableHeroes = heroes.filter(hero => {
        return !bluePicks.some(pick => pick.hero_id === hero.id) &&
            !redPicks.some(pick => pick.hero_id === hero.id) &&
            !blueBans.some(ban => ban.hero_id === hero.id) &&
            !redBans.some(ban => ban.hero_id === hero.id);
    });

    const handleLaneClick = (laneId: number) => {
        if (activeLaneId === laneId) {
            setActiveLaneId(0);
            setSearchQuery(""); // Limpia el input también al desactivar si hace falta
            filterHeroesByLane(0);
        } else {
            setActiveLaneId(laneId);
            setSearchQuery(""); // DEBE llamarse ANTES para que su reset a allHeroes no aplaste el filtro de lane
            filterHeroesByLane(laneId);
        }
    };

    return (
        <div className="flex flex-col gap-3 h-full w-full">
            <div className="flex gap-2">
                <GameStatusPanelModal 
                    ref={modalRef} 
                    game={game} 
                />
                <button
                    onClick={() => modalRef.current?.open()}
                    className={`
                        flex items-center justify-center
                        w-10 h-10 text-3xl
                        border rounded-lg transition-colors 
                        bg-slate-900 border-slate-700 
                        hover:bg-slate-800 hover:border-cyan-500/50
                    `}
                >
                    <Icon
                        icon="eos-icons:rotating-gear"
                        className="pointer-events-none"
                    />
                </button>

                <div className="relative flex-1">
                    <Icon
                        icon="mdi:magnify"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        type="text"
                        placeholder="Buscar héroe..."
                        value={searchQuery}
                        onChange={e => {
                            setSearchQuery(e.target.value);
                            if (activeLaneId !== 0) {
                                setActiveLaneId(0); // Limpia la línea si se busca por texto
                                // filterHeroesByName que llama setSearchQuery usará allHeroes,
                                // así que los filtros son independientes.
                            }
                        }}
                        className="
                            w-full pl-9 pr-4 py-2.5
                            bg-slate-900 border border-slate-700
                            rounded-lg text-sm text-slate-200
                            placeholder-slate-600
                            focus:outline-none focus:border-cyan-500/50
                            transition-colors
                        "
                    />
                </div>
                <div className="flex gap-1 items-center">
                    {lanes.map(lane => (
                        <button
                            key={lane.id}
                            onClick={() => handleLaneClick(lane.id)}
                            className={`
                                w-10 h-10
                                border rounded-lg transition-colors
                                ${activeLaneId === lane.id
                                    ? 'bg-amber-400 border-amber-500'
                                    : 'bg-slate-900 border-slate-700 hover:bg-slate-800 hover:border-cyan-500/50'
                                }
                            `}
                        >
                            <div
                                className={`w-full h-full ${activeLaneId === lane.id ? 'bg-amber-950' : 'bg-slate-300'}`}
                                style={{
                                    maskImage: `url(${lane.image})`,
                                    maskSize: '65%',
                                    maskPosition: 'center',
                                    maskRepeat: 'no-repeat',
                                }}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="
                grid grid-cols-5 gap-2 
                overflow-y-auto 
                max-h-[calc(100vh-200px)] 
                pr-1
                custom-scrollbar
            ">
                {availableHeroes.map(hero => (
                    <HeroCard key={hero.id} hero={hero} />
                ))}
            </div>
        </div>
    );
};
