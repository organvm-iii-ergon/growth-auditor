// Dimensional Inference Engine (Submerged RAG)
// Maps proprietary playbooks to a 3D coordinate space (Execution, Aesthetic, Communication)

type Coordinates = [number, number, number]; // [Execution, Aesthetic, Communication] (-100 to 100)

interface DimensionalPlaybook {
  id: string;
  coords: Coordinates;
  content: string;
}

// The deep ocean of proprietary knowledge
const KNOWLEDGE_SPACE: DimensionalPlaybook[] = [
  {
    id: "high_execution",
    coords: [90, 0, 0],
    content: "High-Performance CTA Strategy: Always use active verbs (Manifest, Secure, Align). Mars energy requires direct movement. Avoid passive 'Submit' or 'Click Here'.",
  },
  {
    id: "high_aesthetic",
    coords: [0, 90, 0],
    content: "Visual Harmony Strategy: Venus demands beauty and harmony. Use glassmorphism and deep space gradients to create an 'alive' feeling. White space is breathing room for data.",
  },
  {
    id: "high_communication",
    coords: [0, 0, 90],
    content: "Mercury Copywriting Framework: Communication must be clear but evocative. Use the 'Problem-Alignment-Manifestation' framework for all landing page copy.",
  },
  {
    id: "balanced_core",
    coords: [50, 50, 50],
    content: "The Golden Triad: Balance action, beauty, and clarity. Do not overwhelm the user with choices (reduce friction), ensure the primary CTA is the most visually striking element on the page, and articulate the value proposition within the first 3 seconds of scroll.",
  },
  {
    id: "technical_structure",
    coords: [80, -20, 20],
    content: "Technical Excellence Pillar: Saturn rules structure. Ensure H1-H3 hierarchy is perfectly aligned. Load times must be under 2s to maintain the cosmic flow. Schema.org markup is non-negotiable for serious entities.",
  }
];

function calculateDistance(a: Coordinates, b: Coordinates): number {
  return Math.sqrt(
    Math.pow(a[0] - b[0], 2) +
    Math.pow(a[1] - b[1], 2) +
    Math.pow(a[2] - b[2], 2)
  );
}

function inferCoordinates(query: string): Coordinates {
  const lowerQuery = query.toLowerCase();
  let execution = 0;
  let aesthetic = 0;
  let communication = 0;

  // Simple heuristic dimensional mapping
  if (lowerQuery.includes("conversion") || lowerQuery.includes("sales") || lowerQuery.includes("action") || lowerQuery.includes("grow")) execution += 50;
  if (lowerQuery.includes("design") || lowerQuery.includes("brand") || lowerQuery.includes("look") || lowerQuery.includes("visual")) aesthetic += 50;
  if (lowerQuery.includes("copy") || lowerQuery.includes("message") || lowerQuery.includes("clear") || lowerQuery.includes("voice")) communication += 50;
  if (lowerQuery.includes("seo") || lowerQuery.includes("technical") || lowerQuery.includes("structure")) execution += 30;

  // Normalize
  return [
    Math.min(100, Math.max(-100, execution)),
    Math.min(100, Math.max(-100, aesthetic)),
    Math.min(100, Math.max(-100, communication)),
  ];
}

export function getRelevantContext(query: string): string {
  const targetCoords = inferCoordinates(query);

  // Find the closest playbooks in the dimensional space
  const sortedPlaybooks = [...KNOWLEDGE_SPACE].sort((a, b) => {
    return calculateDistance(targetCoords, a.coords) - calculateDistance(targetCoords, b.coords);
  });

  // Return the top 2 closest conceptual neighbors
  const topMatches = sortedPlaybooks.slice(0, 2);

  return `\nPROPRIETARY DIMENSIONAL STRATEGY CONTEXT (Coordinates: ${targetCoords.join(", ")}):\n${topMatches.map(m => m.content).join("\n")}\n`;
}
