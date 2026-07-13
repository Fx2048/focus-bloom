import { useIslandExploration } from '@/hooks/useIslandExploration';
import { Button } from '@/components/ui/button';
import { Map, Compass } from 'lucide-react';

export function IslandExplorer() {
  const { zones, unlockedZones, currentZone, setCurrentZone, explorationPoints } = useIslandExploration();

  return (
    <div className="rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-sky-950 to-emerald-950 text-white">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Compass className="w-8 h-8" /> Explorando la Isla
          </h2>
          <div className="text-sm bg-black/30 px-4 py-1.5 rounded-full">
            {explorationPoints} puntos de exploración
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {zones.map(zone => {
            const isUnlocked = unlockedZones.includes(zone.id);
            return (
              <Button
                key={zone.id}
                variant={currentZone === zone.id ? "default" : "outline"}
                disabled={!isUnlocked}
                onClick={() => setCurrentZone(zone.id)}
                className={`h-28 flex flex-col gap-2 ${isUnlocked ? 'border-emerald-400' : 'opacity-50'}`}
              >
                <div className="text-3xl">🏝️</div>
                <div>
                  <p className="font-medium">{zone.name}</p>
                  {!isUnlocked && <p className="text-xs text-amber-400">{zone.required} pts</p>}
                </div>
              </Button>
            );
          })}
        </div>

        {/* Vista de la zona actual */}
        <div className="mt-8 p-6 bg-black/30 rounded-2xl min-h-[200px] relative">
          <p className="text-lg font-semibold mb-3">Estás en: {zones.find(z => z.id === currentZone)?.name}</p>
          <p className="text-emerald-300">
            {currentZone === 'beach' && "Las olas traen calma. Encuentras conchas que te dan +5 Puntos de Descanso."}
            {currentZone === 'forest' && "El bosque te da sabiduría. +15% Motivación por 3 días."}
            {/* Añade más descripciones */}
          </p>
        </div>
      </div>
    </div>
  );
}
