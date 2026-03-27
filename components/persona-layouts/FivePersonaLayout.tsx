import React from 'react';
import { motion } from 'framer-motion';
import { type Persona } from '@/lib/demo-personas';

interface FivePersonaLayoutProps {
  personas: Persona[];
  onPersonaClick?: (persona: Persona) => void;
  onPersonaHover?: (persona: Persona) => void;
  onPersonaLeave?: () => void;
}

// PersonaNode component (same as in simulation page)
function PersonaNode({ persona, isCenter = false, onClick, onHover, onLeave }: {
  persona: Persona;
  isCenter?: boolean;
  onClick?: () => void;
  onHover?: () => void;
  onLeave?: () => void;
}) {
  return (
    <motion.div
      className={`relative bg-white rounded-2xl shadow-lg border border-gray-200 p-3 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden ${
        isCenter ? "w-36 h-40 md:w-40 md:h-44" : "w-32 h-36 md:w-36 md:h-40"
      }`}
      whileHover={{ scale: 1.05, y: -5 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: Math.random() * 0.3 }}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Profile Image */}
      <div className="relative mb-2">
        <img
          src={persona.image}
          alt={persona.name}
          className={`rounded-full object-cover mx-auto ${
            isCenter ? "w-16 h-16 md:w-18 md:h-18" : "w-14 h-14 md:w-16 md:h-16"
          }`}
        />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
      </div>

      {/* Name */}
      <h3 className={`font-semibold text-gray-900 text-center leading-tight truncate px-1 ${
        isCenter ? "text-sm md:text-base" : "text-xs md:text-sm"
      }`}>
        {persona.name}
      </h3>

      {/* Occupation */}
      <p className={`text-gray-500 text-center leading-tight mt-1 px-1 ${
        isCenter ? "text-xs md:text-sm" : "text-xs"
      }`}>
        <span className="block truncate">
          {persona.occupation.length > 20 ? 
            persona.occupation.substring(0, 20) + '...' : 
            persona.occupation
          }
        </span>
      </p>

      {/* Location */}
      <p className={`text-gray-400 text-center truncate px-1 ${
        isCenter ? "text-xs" : "text-xs"
      }`}>
        {persona.location.split(',')[0]}
      </p>
    </motion.div>
  );
}

export const FivePersonaLayout: React.FC<FivePersonaLayoutProps> = ({ 
  personas, 
  onPersonaClick,
  onPersonaHover,
  onPersonaLeave
}) => {
  if (personas.length !== 5) {
    console.warn('FivePersonaLayout expects exactly 5 personas');
    return null;
  }

  return (
    <div className="relative w-full h-[500px] bg-white rounded-lg overflow-hidden flex items-center justify-center">
      {/* Connection Lines - Star + Square Pattern */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        {/* Star connections - Center to all corners */}
        <line x1="50%" y1="50%" x2="20%" y2="20%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="5,5" className="opacity-60" />
        <line x1="50%" y1="50%" x2="80%" y2="20%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="5,5" className="opacity-60" />
        <line x1="50%" y1="50%" x2="20%" y2="80%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="5,5" className="opacity-60" />
        <line x1="50%" y1="50%" x2="80%" y2="80%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="5,5" className="opacity-60" />
        
        {/* Square connections between corners */}
        <line x1="20%" y1="20%" x2="80%" y2="20%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="5,5" className="opacity-60" />
        <line x1="80%" y1="20%" x2="80%" y2="80%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="5,5" className="opacity-60" />
        <line x1="80%" y1="80%" x2="20%" y2="80%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="5,5" className="opacity-60" />
        <line x1="20%" y1="80%" x2="20%" y2="20%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="5,5" className="opacity-60" />
      </svg>

      {/* Persona Cards */}
      {/* Center */}
      <div
        className="absolute"
        style={{ 
          left: '50%', 
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 50
        }}
      >
        <PersonaNode 
          persona={personas[0]} 
          isCenter={true}
          onClick={() => onPersonaClick?.(personas[0])}
          onHover={() => onPersonaHover?.(personas[0])}
          onLeave={() => onPersonaLeave?.()}
        />
      </div>

      {/* Top Left */}
      <div
        className="absolute"
        style={{ 
          left: '20%', 
          top: '20%',
          transform: 'translate(-50%, -50%)',
          zIndex: 50
        }}
      >
        <PersonaNode 
          persona={personas[1]} 
          onClick={() => onPersonaClick?.(personas[1])}
          onHover={() => onPersonaHover?.(personas[1])}
          onLeave={() => onPersonaLeave?.()}
        />
      </div>

      {/* Top Right */}
      <div
        className="absolute"
        style={{ 
          left: '80%', 
          top: '20%',
          transform: 'translate(-50%, -50%)',
          zIndex: 50
        }}
      >
        <PersonaNode 
          persona={personas[2]} 
          onClick={() => onPersonaClick?.(personas[2])}
          onHover={() => onPersonaHover?.(personas[2])}
          onLeave={() => onPersonaLeave?.()}
        />
      </div>

      {/* Bottom Left */}
      <div
        className="absolute"
        style={{ 
          left: '20%', 
          top: '80%',
          transform: 'translate(-50%, -50%)',
          zIndex: 50
        }}
      >
        <PersonaNode 
          persona={personas[3]} 
          onClick={() => onPersonaClick?.(personas[3])}
          onHover={() => onPersonaHover?.(personas[3])}
          onLeave={() => onPersonaLeave?.()}
        />
      </div>

      {/* Bottom Right */}
      <div
        className="absolute"
        style={{ 
          left: '80%', 
          top: '80%',
          transform: 'translate(-50%, -50%)',
          zIndex: 50
        }}
      >
        <PersonaNode 
          persona={personas[4]} 
          onClick={() => onPersonaClick?.(personas[4])}
          onHover={() => onPersonaHover?.(personas[4])}
          onLeave={() => onPersonaLeave?.()}
        />
      </div>
    </div>
  );
};