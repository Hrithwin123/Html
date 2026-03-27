import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { type Persona } from '@/lib/demo-personas';

interface GraphNetworkLayoutProps {
  personas: Persona[];
  onPersonaClick?: (persona: Persona) => void;
}

interface NodePosition {
  x: number;
  y: number;
  persona: Persona;
}

interface Edge {
  from: number;
  to: number;
}

// Generate structured but varied positions (not truly random)
const generateNodePositions = (count: number): NodePosition[] => {
  const positions: NodePosition[] = [];
  
  if (count <= 15) {
    // For smaller networks, use a more structured approach
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      
      // Base grid position with some variation
      const baseX = 15 + (col * (70 / (cols - 1 || 1)));
      const baseY = 20 + (row * (60 / (rows - 1 || 1)));
      
      // Add small random offset for organic feel
      const offsetX = (Math.random() - 0.5) * 8;
      const offsetY = (Math.random() - 0.5) * 8;
      
      positions.push({ 
        x: Math.max(10, Math.min(90, baseX + offsetX)), 
        y: Math.max(15, Math.min(85, baseY + offsetY)), 
        persona: {} as Persona 
      });
    }
  } else {
    // For larger networks, use circular/spiral arrangement
    const centerX = 50;
    const centerY = 50;
    const maxRadius = 35;
    
    for (let i = 0; i < count; i++) {
      const angle = (i * 2 * Math.PI) / count;
      const radius = maxRadius * (0.3 + 0.7 * Math.random()); // Vary radius
      
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      positions.push({ x, y, persona: {} as Persona });
    }
  }
  
  return positions;
};

// Generate structured edges for better visual balance
const generateEdges = (nodeCount: number): Edge[] => {
  const edges: Edge[] = [];
  
  if (nodeCount <= 15) {
    // For smaller networks, connect nearby nodes
    for (let i = 0; i < nodeCount; i++) {
      const connectionsToMake = Math.min(3, nodeCount - 1);
      const connections = new Set<number>();
      
      // Connect to next few nodes (with wraparound)
      for (let j = 1; j <= connectionsToMake; j++) {
        const target = (i + j) % nodeCount;
        if (!connections.has(target)) {
          connections.add(target);
          edges.push({ from: i, to: target });
        }
      }
      
      // Add one random connection for variety
      if (nodeCount > 4) {
        let randomTarget;
        let attempts = 0;
        do {
          randomTarget = Math.floor(Math.random() * nodeCount);
          attempts++;
        } while (
          (randomTarget === i || connections.has(randomTarget)) && 
          attempts < 10
        );
        
        if (randomTarget !== i && !connections.has(randomTarget)) {
          const edgeExists = edges.some(e => 
            (e.from === i && e.to === randomTarget) || (e.from === randomTarget && e.to === i)
          );
          if (!edgeExists) {
            edges.push({ from: i, to: randomTarget });
          }
        }
      }
    }
  } else {
    // For larger networks, use more structured approach
    const connectionsPerNode = Math.min(4, Math.max(2, Math.floor(nodeCount / 4)));
    
    for (let i = 0; i < nodeCount; i++) {
      for (let j = 1; j <= connectionsPerNode; j++) {
        const target = (i + j) % nodeCount;
        const edgeExists = edges.some(e => 
          (e.from === i && e.to === target) || (e.from === target && e.to === i)
        );
        if (!edgeExists) {
          edges.push({ from: i, to: target });
        }
      }
    }
  }
  
  return edges;
};

export const GraphNetworkLayout: React.FC<GraphNetworkLayoutProps> = ({ 
  personas, 
  onPersonaClick 
}) => {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  
  // Generate stable positions and edges using useMemo
  const { nodePositions, edges } = useMemo(() => {
    const positions = generateNodePositions(personas.length);
    // Assign personas to positions
    positions.forEach((pos, index) => {
      pos.persona = personas[index];
    });
    
    return {
      nodePositions: positions,
      edges: generateEdges(personas.length)
    };
  }, [personas.length]);

  return (
    <div className="relative w-full h-[500px] bg-white rounded-lg overflow-hidden flex items-center justify-center">
      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        {edges.map((edge, index) => (
          <line
            key={index}
            x1={`${nodePositions[edge.from].x}%`}
            y1={`${nodePositions[edge.from].y}%`}
            x2={`${nodePositions[edge.to].x}%`}
            y2={`${nodePositions[edge.to].y}%`}
            stroke="#d1d5db"
            strokeWidth="1.5"
            strokeDasharray="3,3"
            className="opacity-50"
          />
        ))}
      </svg>

      {/* Graph Nodes */}
      {nodePositions.map((node, index) => (
        <div key={node.persona.id || index}>
          {/* Node Circle */}
          <div
            className="absolute cursor-pointer"
            style={{ 
              left: `${node.x}%`, 
              top: `${node.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 50
            }}
            onMouseEnter={() => setHoveredNode(index)}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={() => onPersonaClick?.(node.persona)}
          >
            <div className={`w-10 h-10 rounded-full transition-all duration-200 shadow-sm ${
              hoveredNode === index 
                ? 'bg-black border-2 border-gray-300 shadow-md' 
                : 'bg-white border-2 border-gray-400 hover:border-gray-500'
            }`}>
              {/* Node label */}
              <div className={`w-full h-full flex items-center justify-center text-sm font-semibold ${
                hoveredNode === index ? 'text-white' : 'text-gray-700'
              }`}>
                {node.persona.name ? node.persona.name.charAt(0).toUpperCase() : index + 1}
              </div>
            </div>
          </div>

          {/* Hover Tooltip */}
          {hoveredNode === index && (
            <motion.div
              className="absolute bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none"
              style={{ 
                left: `${node.x}%`, 
                top: `${node.y - 8}%`,
                transform: 'translate(-50%, -100%)',
                zIndex: 60
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="font-semibold">{node.persona.name}</div>
              <div className="text-gray-300 text-xs">{node.persona.occupation}</div>
              <div className="text-gray-400 text-xs">{node.persona.location}</div>
              
              {/* Tooltip Arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                <div className="border-4 border-transparent border-t-gray-900"></div>
              </div>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
};