import React from 'react';
import { motion } from 'framer-motion';
import { type Persona } from '@/lib/demo-personas';

interface EightPersonaLayoutProps {
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
        isCenter ? "w-36 h-40 md:w-40 md:h-44" : "w-28 h-32 md:w-32 md:h-36"
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
            isCenter ? "w-16 h-16 md:w-18 md:h-18" : "w-12 h-12 md:w-14 md:h-14"
          }`}
        />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
      </div>

      {/* Name */}
      <h3 className={`font-semibold text-gray-900 text-center leading-tight truncate px-1 ${
        isCenter ? "text-sm md:text-base" : "text-xs"
      }`}>
        {persona.name}
      </h3>

      {/* Occupation */}
      <p className={`text-gray-500 text-center leading-tight mt-1 px-1 ${
        isCenter ? "text-xs md:text-sm" : "text-xs"
      }`}>
        <span className="block truncate">
          {persona.occupation.length > 15 ? 
            persona.occupation.substring(0, 15) + '...' : 
            persona.occupation
          }
        </span>
      </p>

      {/* Location */}
      <p className={`text-gray-400 text-center truncate px-1 text-xs`}>
        {persona.location.split(',')[0]}
      </p>
    </motion.div>
  );
}

export const EightPersonaLayout: React.FC<EightPersonaLayoutProps> = ({ 
  personas, 
  onPersonaClick,
  onPersonaHover,
  onPersonaLeave
}) => {
  if (personas.length !== 8) {
    console.warn('EightPersonaLayout expects exactly 8 personas');
    return null;
  }

  return (
    <div className="relative w-full h-[500px] bg-white rounded-lg overflow-hidden flex items-center justify-center">
      {/* Connection Lines - Complex Network */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        {/* Top row horizontal connections */}
        <line x1="15%" y1="25%" x2="40%" y2="15%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="5,5" className="opacity-60" />
        <line x1="40%" y1="15%" x2="60%" y2="15%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="5,5" className="opacity-60" />
        <line x1="60%" y1="15%" x2="85%" y2="25%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="5,5" className="opacity-60" />
        
        {/* Bottom row horizontal connections */}
        <line x1="15%" y1="75%" x2="40%" y2="85%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="5,5" className="opacity-60" />
        <line x1="40%" y1="85%" x2="60%" y2="85%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="5,5" className="opacity-60" />
        <line x1="60%" y1="85%" x2="85%" y2="75%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="5,5" className="opacity-60" />
        
        {/* Vertical connections */}
        <line x1="15%" y1="25%" x2="15%" y2="75%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="5,5" className="opacity-60" />
        <line x1="40%" y1="15%" x2="40%" y2="85%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="5,5" className="opacity-60" />
        <line x1="60%" y1="15%" x2="60%" y2="85%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="5,5" className="opacity-60" />
        <line x1="85%" y1="25%" x2="85%" y2="75%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="5,5" className="opacity-60" />
        
        {/* Diagonal connections */}
        <line x1="15%" y1="25%" x2="40%" y2="85%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="5,5" className="opacity-60" />
        <line x1="40%" y1="15%" x2="60%" y2="85%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="5,5" className="opacity-60" />
        <line x1="60%" y1="15%" x2="85%" y2="75%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="5,5" className="opacity-60" />
        <line x1="40%" y1="15%" x2="15%" y2="75%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="5,5" className="opacity-60" />
        <line x1="60%" y1="15%" x2="40%" y2="85%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="5,5" className="opacity-60" />
        <line x1="85%" y1="25%" x2="60%" y2="85%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="5,5" className="opacity-60" />
      </svg>

      {/* Persona Cards - Top Row */}
      <div className="absolute" style={{ left: '15%', top: '25%', transform: 'translate(-50%, -50%)', zIndex: 50 }}>
        <PersonaNode persona={personas[0]} onClick={() => onPersonaClick?.(personas[0])} onHover={() => onPersonaHover?.(personas[0])} onLeave={() => onPersonaLeave?.()} />
      </div>
      <div className="absolute" style={{ left: '40%', top: '15%', transform: 'translate(-50%, -50%)', zIndex: 50 }}>
        <PersonaNode persona={personas[1]} onClick={() => onPersonaClick?.(personas[1])} onHover={() => onPersonaHover?.(personas[1])} onLeave={() => onPersonaLeave?.()} />
      </div>
      <div className="absolute" style={{ left: '60%', top: '15%', transform: 'translate(-50%, -50%)', zIndex: 50 }}>
        <PersonaNode persona={personas[2]} onClick={() => onPersonaClick?.(personas[2])} onHover={() => onPersonaHover?.(personas[2])} onLeave={() => onPersonaLeave?.()} />
      </div>
      <div className="absolute" style={{ left: '85%', top: '25%', transform: 'translate(-50%, -50%)', zIndex: 50 }}>
        <PersonaNode persona={personas[3]} onClick={() => onPersonaClick?.(personas[3])} onHover={() => onPersonaHover?.(personas[3])} onLeave={() => onPersonaLeave?.()} />
      </div>

      {/* Persona Cards - Bottom Row */}
      <div className="absolute" style={{ left: '15%', top: '75%', transform: 'translate(-50%, -50%)', zIndex: 50 }}>
        <PersonaNode persona={personas[4]} onClick={() => onPersonaClick?.(personas[4])} onHover={() => onPersonaHover?.(personas[4])} onLeave={() => onPersonaLeave?.()} />
      </div>
      <div className="absolute" style={{ left: '40%', top: '85%', transform: 'translate(-50%, -50%)', zIndex: 50 }}>
        <PersonaNode persona={personas[5]} onClick={() => onPersonaClick?.(personas[5])} onHover={() => onPersonaHover?.(personas[5])} onLeave={() => onPersonaLeave?.()} />
      </div>
      <div className="absolute" style={{ left: '60%', top: '85%', transform: 'translate(-50%, -50%)', zIndex: 50 }}>
        <PersonaNode persona={personas[6]} onClick={() => onPersonaClick?.(personas[6])} onHover={() => onPersonaHover?.(personas[6])} onLeave={() => onPersonaLeave?.()} />
      </div>
      <div className="absolute" style={{ left: '85%', top: '75%', transform: 'translate(-50%, -50%)', zIndex: 50 }}>
        <PersonaNode persona={personas[7]} onClick={() => onPersonaClick?.(personas[7])} onHover={() => onPersonaHover?.(personas[7])} onLeave={() => onPersonaLeave?.()} />
      </div>
    </div>
  );
};