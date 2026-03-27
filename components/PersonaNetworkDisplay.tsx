import React from 'react';
import { ThreePersonaLayout, FivePersonaLayout, EightPersonaLayout } from './persona-layouts';
import { GraphNetworkLayout } from './persona-layouts/GraphNetworkLayout';
import { type Persona } from '@/lib/demo-personas';

interface PersonaNetworkDisplayProps {
  personas: Persona[];
  onPersonaClick?: (persona: Persona) => void;
  onPersonaHover?: (persona: Persona) => void;
  onPersonaLeave?: () => void;
}

export const PersonaNetworkDisplay: React.FC<PersonaNetworkDisplayProps> = ({
  personas,
  onPersonaClick,
  onPersonaHover,
  onPersonaLeave
}) => {
  const personaCount = personas.length;

  // Use specific layout components for 3, 5, and 8 personas
  switch (personaCount) {
    case 3:
      return <ThreePersonaLayout personas={personas} onPersonaClick={onPersonaClick} onPersonaHover={onPersonaHover} onPersonaLeave={onPersonaLeave} />;

    case 5:
      return <FivePersonaLayout personas={personas} onPersonaClick={onPersonaClick} onPersonaHover={onPersonaHover} onPersonaLeave={onPersonaLeave} />;

    case 8:
      return <EightPersonaLayout personas={personas} onPersonaClick={onPersonaClick} onPersonaHover={onPersonaHover} onPersonaLeave={onPersonaLeave} />;

    default:
      // For 10+ personas, use graph network visualization
      if (personaCount >= 10) {
        return <GraphNetworkLayout personas={personas} onPersonaClick={onPersonaClick} />;
      }

      // Fallback for other counts (like 15, 30, 100) - simple grid layout
      return (
        <div className="w-full bg-gray-50 rounded-lg p-6">
          <div className={`grid gap-4 ${personaCount <= 15 ? 'grid-cols-4 md:grid-cols-5' :
              personaCount <= 30 ? 'grid-cols-5 md:grid-cols-6' :
                'grid-cols-8 md:grid-cols-10'
            }`}>
            {personas.map((persona, index) => (
              <div
                key={persona.id}
                className="cursor-pointer"
                onClick={() => onPersonaClick?.(persona)}
              >
                <div className="w-full bg-green-200 border-2 border-green-400 rounded-lg p-2 flex flex-col items-center hover:bg-green-300 transition-colors">
                  <img
                    src={persona.image}
                    alt={persona.name}
                    className="w-8 h-8 rounded-full object-cover mb-1"
                  />
                  <span className="text-xs font-medium text-center truncate w-full">
                    {persona.name.split(' ')[0]}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            {personaCount} personas in network
          </div>
        </div>
      );
  }
};