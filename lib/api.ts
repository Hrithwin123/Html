/**
 * PersonaLabs GNN Backend API client
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://personalabs-production.up.railway.app';

export interface SimulateRequest {
  product: string;
  market: string;
  personas?: number;
  weeks?: number;
  no_insights?: boolean;
  user_id?: string;
}

export async function getUserJobs(userId: string): Promise<JobStatus[]> {
  const res = await fetch(`${API_BASE}/jobs?user_id=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error(`Failed to get jobs: ${res.status}`);
  return res.json();
}

export interface JobStatus {
  job_id: string;
  status: 'queued' | 'running' | 'done' | 'failed';
  progress: string;
  progress_step: number;
  progress_total: number;
  created_at: number;
  completed_at?: number;
  duration_seconds?: number;
  error?: string;
  final_adoption_pct?: number;
}

export interface AdoptionCurvePoint {
  week: number;
  adopted_pct: number;
  new_adopters: number;
  avg_social_influence: number;
}

export interface GraphNode {
  id: string;
  name: string;
  segment: string;
  gender: string;
  age: number;
  fit_score: number;
  fit_percentile: number;
  resistance: number;
  adopted: boolean;
  adoption_week: number | null;
  social_influence: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface SimulationInsights {
  product: string;
  final_adoption_pct: number;
  time_to_50_pct: string;
  peak_growth_week: number;
  peak_new_adopters: number;
  top_influencers: string[];
}

export interface AdoptionIntelligence {
  executive_summary?: string;
  why_they_adopted: {
    top_drivers: [string, number][];
    representative_thoughts: { persona: string; segment: string; thought: string }[];
  };
  why_they_didnt: {
    blocked_count: number;
    negative_count: number;
    top_objections: [string, number][];
    top_fixes: [string, number][];
    by_segment: Record<string, { top_objection: string; count: number }>;
    representative_thoughts: { persona: string; segment: string; thought: string; sentiment: string }[];
  };
}

export interface MarketConfig {
  market_name: string;
  bass_category: string;
  total_personas: number;
  segments: {
    name: string;
    count: number;
    fit_score_range: [number, number];
    fit_reasoning: string;
  }[];
  fit_driving_attributes: {
    attribute: string;
    direction: string;
    weight: number;
    reasoning: string;
  }[];
}

// ── API calls ─────────────────────────────────────────────────────────

export async function startSimulation(req: SimulateRequest): Promise<{ job_id: string }> {
  const res = await fetch(`${API_BASE}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Failed to start simulation: ${res.status}`);
  return res.json();
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const res = await fetch(`${API_BASE}/simulate/${jobId}`);
  if (!res.ok) throw new Error(`Failed to get job status: ${res.status}`);
  return res.json();
}

export async function getAdoptionCurve(jobId: string): Promise<AdoptionCurvePoint[]> {
  const res = await fetch(`${API_BASE}/simulate/${jobId}/data/curve`);
  if (!res.ok) throw new Error(`Failed to get curve: ${res.status}`);
  return res.json();
}

export async function getGraphData(jobId: string): Promise<GraphData> {
  const res = await fetch(`${API_BASE}/simulate/${jobId}/data/graph`);
  if (!res.ok) throw new Error(`Failed to get graph: ${res.status}`);
  return res.json();
}

export async function getInsights(jobId: string): Promise<SimulationInsights> {
  const res = await fetch(`${API_BASE}/simulate/${jobId}/data/insights`);
  if (!res.ok) throw new Error(`Failed to get insights: ${res.status}`);
  return res.json();
}

export async function getIntelligence(jobId: string): Promise<AdoptionIntelligence> {
  const res = await fetch(`${API_BASE}/simulate/${jobId}/data/intelligence`);
  if (!res.ok) throw new Error(`Failed to get intelligence: ${res.status}`);
  return res.json();
}

export async function getMarketConfig(jobId: string): Promise<MarketConfig> {
  const res = await fetch(`${API_BASE}/simulate/${jobId}/data/market`);
  if (!res.ok) throw new Error(`Failed to get market config: ${res.status}`);
  return res.json();
}

export async function getNarratives(jobId: string): Promise<{ type: string; week?: number; narrative: string }[]> {
  const res = await fetch(`${API_BASE}/simulate/${jobId}/data/narratives`);
  if (!res.ok) throw new Error(`Failed to get narratives: ${res.status}`);
  return res.json();
}

export async function listJobs(): Promise<JobStatus[]> {
  const res = await fetch(`${API_BASE}/jobs`);
  if (!res.ok) throw new Error(`Failed to list jobs: ${res.status}`);
  return res.json();
}

/** Poll until done or failed. Calls onProgress on each poll. */
export async function pollUntilDone(
  jobId: string,
  onProgress: (status: JobStatus) => void,
  intervalMs = 5000,
  timeoutMs = 1800000, // 30 min
): Promise<JobStatus> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const status = await getJobStatus(jobId);
    onProgress(status);
    if (status.status === 'done' || status.status === 'failed') return status;
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error('Simulation timed out');
}
