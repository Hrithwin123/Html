export interface PersonaPosition {
  x: number;
  y: number;
  gridClass: string;
}

export interface ConnectionLine {
  x1: string;
  y1: string;
  x2: string;
  y2: string;
}

/**
 * Generate persona positions based on count
 * @param count Number of personas (3, 5, 8, 10, 15, 30, 100)
 * @returns Array of position data for each persona
 */
export function generatePersonaPositions(count: number): PersonaPosition[] {
  switch (count) {
    case 3:
      // Triangle layout: 2 nodes on top, 1 at bottom center
      return [
        { x: 25, y: 20, gridClass: "" }, // top left
        { x: 75, y: 20, gridClass: "" }, // top right
        { x: 50, y: 70, gridClass: "" }, // bottom center
      ];
    
    case 5:
      // Star/Pentagon layout: center node with 4 outer nodes forming a square
      return [
        { x: 50, y: 50, gridClass: "" }, // center
        { x: 20, y: 20, gridClass: "" }, // top left
        { x: 80, y: 20, gridClass: "" }, // top right
        { x: 20, y: 80, gridClass: "" }, // bottom left
        { x: 80, y: 80, gridClass: "" }, // bottom right
      ];
    
    case 8:
      // Complex network layout: 2x4 grid with interconnections
      return [
        { x: 15, y: 25, gridClass: "" }, // top row left
        { x: 40, y: 15, gridClass: "" }, // top row center-left
        { x: 60, y: 15, gridClass: "" }, // top row center-right
        { x: 85, y: 25, gridClass: "" }, // top row right
        { x: 15, y: 75, gridClass: "" }, // bottom row left
        { x: 40, y: 85, gridClass: "" }, // bottom row center-left
        { x: 60, y: 85, gridClass: "" }, // bottom row center-right
        { x: 85, y: 75, gridClass: "" }, // bottom row right
      ];
    
    case 10:
      return [
        { x: 20, y: 20, gridClass: "md:col-start-1 md:row-start-1" },
        { x: 40, y: 15, gridClass: "md:col-start-2 md:row-start-1" },
        { x: 60, y: 15, gridClass: "md:col-start-3 md:row-start-1" },
        { x: 80, y: 20, gridClass: "md:col-start-4 md:row-start-1" },
        { x: 85, y: 40, gridClass: "md:col-start-4 md:row-start-2" },
        { x: 85, y: 60, gridClass: "md:col-start-4 md:row-start-3" },
        { x: 80, y: 80, gridClass: "md:col-start-4 md:row-start-4" },
        { x: 60, y: 85, gridClass: "md:col-start-3 md:row-start-4" },
        { x: 40, y: 85, gridClass: "md:col-start-2 md:row-start-4" },
        { x: 20, y: 80, gridClass: "md:col-start-1 md:row-start-4" },
      ];
    
    case 15:
      return [
        { x: 10, y: 10, gridClass: "md:col-start-1 md:row-start-1" },
        { x: 30, y: 10, gridClass: "md:col-start-2 md:row-start-1" },
        { x: 50, y: 10, gridClass: "md:col-start-3 md:row-start-1" },
        { x: 70, y: 10, gridClass: "md:col-start-4 md:row-start-1" },
        { x: 90, y: 10, gridClass: "md:col-start-5 md:row-start-1" },
        { x: 90, y: 30, gridClass: "md:col-start-5 md:row-start-2" },
        { x: 90, y: 50, gridClass: "md:col-start-5 md:row-start-3" },
        { x: 90, y: 70, gridClass: "md:col-start-5 md:row-start-4" },
        { x: 90, y: 90, gridClass: "md:col-start-5 md:row-start-5" },
        { x: 70, y: 90, gridClass: "md:col-start-4 md:row-start-5" },
        { x: 50, y: 90, gridClass: "md:col-start-3 md:row-start-5" },
        { x: 30, y: 90, gridClass: "md:col-start-2 md:row-start-5" },
        { x: 10, y: 90, gridClass: "md:col-start-1 md:row-start-5" },
        { x: 10, y: 70, gridClass: "md:col-start-1 md:row-start-4" },
        { x: 10, y: 50, gridClass: "md:col-start-1 md:row-start-3" },
      ];

    case 30:
      // 6x5 grid layout for 30 personas
      const positions30: PersonaPosition[] = [];
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 6; col++) {
          positions30.push({
            x: 10 + (col * 16), // 10% margin, then 16% spacing
            y: 15 + (row * 17.5), // 15% margin, then 17.5% spacing
            gridClass: "",
          });
        }
      }
      return positions30;

    case 100:
      // 10x10 grid layout for 100 personas
      const positions100: PersonaPosition[] = [];
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          positions100.push({
            x: 5 + (col * 9), // 5% margin, then 9% spacing
            y: 5 + (row * 9), // 5% margin, then 9% spacing
            gridClass: "",
          });
        }
      }
      return positions100;
    
    default:
      // Fallback for any other number - arrange in a circle
      const positions: PersonaPosition[] = [];
      const centerX = 50;
      const centerY = 50;
      const radius = 35;
      
      for (let i = 0; i < count; i++) {
        const angle = (i * 2 * Math.PI) / count - Math.PI / 2; // Start from top
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        positions.push({
          x,
          y,
          gridClass: "", // No specific grid class for dynamic layouts
        });
      }
      return positions;
  }
}

/**
 * Generate connection lines between personas
 * @param positions Array of persona positions
 * @param connectionType Type of connections to generate
 * @returns Array of connection line data
 */
export function generateConnectionLines(
  positions: PersonaPosition[],
  connectionType: 'full' | 'star' | 'ring' | 'minimal' | 'custom' = 'custom'
): ConnectionLine[] {
  const lines: ConnectionLine[] = [];
  const count = positions.length;
  
  // Custom connection patterns based on persona count
  if (connectionType === 'custom') {
    switch (count) {
      case 3:
        // Triangle: all nodes connected to each other
        lines.push(
          // Top left to top right
          {
            x1: `${positions[0].x}%`,
            y1: `${positions[0].y}%`,
            x2: `${positions[1].x}%`,
            y2: `${positions[1].y}%`,
          },
          // Top left to bottom center
          {
            x1: `${positions[0].x}%`,
            y1: `${positions[0].y}%`,
            x2: `${positions[2].x}%`,
            y2: `${positions[2].y}%`,
          },
          // Top right to bottom center
          {
            x1: `${positions[1].x}%`,
            y1: `${positions[1].y}%`,
            x2: `${positions[2].x}%`,
            y2: `${positions[2].y}%`,
          }
        );
        break;

      case 5:
        // Star pattern: center connects to all 4 corners, corners form a square
        // Center to all corners
        for (let i = 1; i < 5; i++) {
          lines.push({
            x1: `${positions[0].x}%`,
            y1: `${positions[0].y}%`,
            x2: `${positions[i].x}%`,
            y2: `${positions[i].y}%`,
          });
        }
        // Square connections between corners: 1→2→4→3→1
        const cornerConnections = [
          [1, 2], // top-left to top-right
          [2, 4], // top-right to bottom-right  
          [4, 3], // bottom-right to bottom-left
          [3, 1], // bottom-left to top-left
        ];
        cornerConnections.forEach(([from, to]) => {
          lines.push({
            x1: `${positions[from].x}%`,
            y1: `${positions[from].y}%`,
            x2: `${positions[to].x}%`,
            y2: `${positions[to].y}%`,
          });
        });
        break;

      case 8:
        // Complex network: horizontal, vertical, and diagonal connections
        // Horizontal connections within rows
        // Top row: 0-1, 1-2, 2-3
        for (let i = 0; i < 3; i++) {
          lines.push({
            x1: `${positions[i].x}%`,
            y1: `${positions[i].y}%`,
            x2: `${positions[i + 1].x}%`,
            y2: `${positions[i + 1].y}%`,
          });
        }
        // Bottom row: 4-5, 5-6, 6-7
        for (let i = 4; i < 7; i++) {
          lines.push({
            x1: `${positions[i].x}%`,
            y1: `${positions[i].y}%`,
            x2: `${positions[i + 1].x}%`,
            y2: `${positions[i + 1].y}%`,
          });
        }
        
        // Vertical connections between rows: 0-4, 1-5, 2-6, 3-7
        for (let i = 0; i < 4; i++) {
          lines.push({
            x1: `${positions[i].x}%`,
            y1: `${positions[i].y}%`,
            x2: `${positions[i + 4].x}%`,
            y2: `${positions[i + 4].y}%`,
          });
        }
        
        // Diagonal connections as shown in the image
        // Cross connections: 0-5, 1-6, 2-7, 1-4, 2-5, 3-6
        const diagonalConnections = [
          [0, 5], [1, 6], [2, 7], // top-left to bottom-right diagonals
          [1, 4], [2, 5], [3, 6]  // top-right to bottom-left diagonals
        ];
        diagonalConnections.forEach(([from, to]) => {
          lines.push({
            x1: `${positions[from].x}%`,
            y1: `${positions[from].y}%`,
            x2: `${positions[to].x}%`,
            y2: `${positions[to].y}%`,
          });
        });
        break;

      default:
        // For other counts, use star pattern with center node
        if (positions.length > 1) {
          for (let i = 1; i < positions.length; i++) {
            lines.push({
              x1: `${positions[0].x}%`,
              y1: `${positions[0].y}%`,
              x2: `${positions[i].x}%`,
              y2: `${positions[i].y}%`,
            });
          }
        }
        break;
    }
    return lines;
  }
  
  // Original connection patterns for backward compatibility
  switch (connectionType) {
    case 'full':
      // Connect every persona to every other persona
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          lines.push({
            x1: `${positions[i].x}%`,
            y1: `${positions[i].y}%`,
            x2: `${positions[j].x}%`,
            y2: `${positions[j].y}%`,
          });
        }
      }
      break;
    
    case 'star':
      // Simple star pattern
      for (let i = 1; i < positions.length; i++) {
        lines.push({
          x1: `${positions[0].x}%`,
          y1: `${positions[0].y}%`,
          x2: `${positions[i].x}%`,
          y2: `${positions[i].y}%`,
        });
      }
      break;
    
    case 'ring':
      // Connect each persona to the next one in a ring
      for (let i = 0; i < positions.length; i++) {
        const nextIndex = (i + 1) % positions.length;
        lines.push({
          x1: `${positions[i].x}%`,
          y1: `${positions[i].y}%`,
          x2: `${positions[nextIndex].x}%`,
          y2: `${positions[nextIndex].y}%`,
        });
      }
      break;
    
    case 'minimal':
      // Simple adjacent connections
      for (let i = 0; i < positions.length - 1; i++) {
        lines.push({
          x1: `${positions[i].x}%`,
          y1: `${positions[i].y}%`,
          x2: `${positions[i + 1].x}%`,
          y2: `${positions[i + 1].y}%`,
        });
      }
      break;
  }
  
  return lines;
}

/**
 * Get appropriate grid classes for container based on persona count
 * @param count Number of personas
 * @returns CSS grid classes
 */
export function getGridClasses(count: number): string {
  if (count <= 3) {
    return "grid grid-cols-2 md:grid-cols-3 gap-8 relative";
  } else if (count <= 5) {
    return "grid grid-cols-2 md:grid-cols-3 gap-8 relative";
  } else if (count <= 8) {
    return "grid grid-cols-3 md:grid-cols-4 gap-6 relative";
  } else if (count <= 10) {
    return "grid grid-cols-3 md:grid-cols-4 gap-6 relative";
  } else if (count <= 15) {
    return "grid grid-cols-4 md:grid-cols-5 gap-4 relative";
  } else if (count <= 30) {
    return "grid grid-cols-5 md:grid-cols-6 gap-3 relative";
  } else if (count <= 100) {
    return "grid grid-cols-8 md:grid-cols-10 gap-2 relative";
  } else {
    return "grid grid-cols-8 md:grid-cols-12 gap-1 relative";
  }
}