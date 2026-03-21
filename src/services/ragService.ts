// Mock RAG Service: Anchoring AI in proprietary growth marketing knowledge
// In production, this would use a vector database (Pinecone/pgvector)

const KNOWLEDGE_BASE = [
  {
    keywords: ["cta", "conversion", "button", "mars"],
    snippet: "High-Performance CTA Strategy: Always use active verbs (Manifest, Secure, Align). Mars energy requires direct movement. Avoid passive 'Submit' or 'Click Here'.",
  },
  {
    keywords: ["seo", "structure", "saturn", "technical"],
    snippet: "Technical Excellence Pillar: Saturn rules structure. Ensure H1-H3 hierarchy is perfectly aligned. Load times must be under 2s to maintain the cosmic flow.",
  },
  {
    keywords: ["design", "aesthetic", "venus", "ui"],
    snippet: "Visual Harmony Strategy: Venus demands beauty and harmony. Use glassmorphism and deep space gradients to create an 'alive' feeling. White space is breathing room for data.",
  },
  {
    keywords: ["content", "communication", "mercury", "copy"],
    snippet: "Mercury Copywriting Framework: Communication must be clear but evocative. Use the 'Problem-Alignment-Manifestation' framework for all landing page copy.",
  },
];

export function getRelevantContext(query: string): string {
  const lowercaseQuery = query.toLowerCase();
  const matches = KNOWLEDGE_BASE.filter(entry => 
    entry.keywords.some(keyword => lowercaseQuery.includes(keyword))
  );

  if (matches.length === 0) return "";

  return `\nPROPRIETARY STRATEGY CONTEXT:\n${matches.map(m => m.snippet).join("\n")}\n`;
}
