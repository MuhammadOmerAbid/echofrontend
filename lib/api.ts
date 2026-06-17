import { getToken, removeToken } from "./auth";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handle<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    removeToken();
    throw new Error("UNAUTHORIZED");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

// ── Public ────────────────────────────────────────────────────────────────────

export async function getSetupStatus() {
  const res = await fetch(`${BASE}/setup/status`);
  return handle<{ setup_complete: boolean; institution_name: string }>(res);
}

export async function completeSetup(data: {
  institution_name: string;
  institution_city: string;
  password: string;
  locations: { name: string; building: string; x_grid: number; y_grid: number }[];
}) {
  const res = await fetch(`${BASE}/setup/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handle<{ success: boolean }>(res);
}

export async function getCategories() {
  const res = await fetch(`${BASE}/config/categories`);
  return handle<{ name: string; color: string }[]>(res);
}

export async function getLocations() {
  const res = await fetch(`${BASE}/config/locations`);
  return handle<{ name: string; building: string }[]>(res);
}

export async function submitSuggestion(data: {
  category: string;
  location: string;
  text: string;
  session_id: string;
}) {
  const res = await fetch(`${BASE}/suggestions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handle<{ success: boolean; token: string }>(res);
}

export async function getPublicStats() {
  const res = await fetch(`${BASE}/stats`);
  return handle<PublicStats>(res);
}

export async function trackSubmission(token: string) {
  const res = await fetch(`${BASE}/suggestions/track/${encodeURIComponent(token)}`);
  return handle<TrackData>(res);
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function adminLogin(password: string) {
  const res = await fetch(`${BASE}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  return handle<{ access_token: string; institution: string }>(res);
}

export async function getDashboard() {
  const res = await fetch(`${BASE}/admin/dashboard`, { headers: authHeaders() });
  return handle<DashboardData>(res);
}

export async function getInsights() {
  const res = await fetch(`${BASE}/admin/insights`, { headers: authHeaders() });
  return handle<InsightsData>(res);
}

export async function getAdminMe() {
  const res = await fetch(`${BASE}/admin/me`, { headers: authHeaders() });
  return handle<{ institution: string; city: string }>(res);
}

export async function getAnalytics() {
  const res = await fetch(`${BASE}/admin/analytics`, { headers: authHeaders() });
  return handle<AnalyticsData>(res);
}

export async function getTrends() {
  const res = await fetch(`${BASE}/admin/trends`, { headers: authHeaders() });
  return handle<TrendsData>(res);
}

export async function getSettings() {
  const res = await fetch(`${BASE}/admin/settings`, { headers: authHeaders() });
  return handle<SettingsData>(res);
}

export async function updateSettings(data: {
  institution_name?: string;
  institution_city?: string;
  new_password?: string;
  current_password?: string;
}) {
  const res = await fetch(`${BASE}/admin/settings`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handle<{ success: boolean }>(res);
}

export type LocationRow = { id: number; name: string; building: string; x_grid: number; y_grid: number };

export interface QAMetrics {
  total: number;
  processed: number;
  unprocessed: number;
  processed_rate_pct: number;
  empty_clean_text: number;
  short_text_count: number;
  unknown_location_count: number;
  sentiment_out_of_range: number;
  missing_keywords: number;
  duplicate_text_count: number;
  health: "good" | "degraded" | "poor";
}

export async function getQAMetrics() {
  const res = await fetch(`${BASE}/admin/qa`, { headers: authHeaders() });
  return handle<QAMetrics>(res);
}

export async function addLocation(data: { name: string; building: string; x_grid: number; y_grid: number }) {
  const res = await fetch(`${BASE}/admin/locations`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handle<{ success: boolean; locations: LocationRow[] }>(res);
}

export async function deleteLocation(id: number) {
  const res = await fetch(`${BASE}/admin/locations/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handle<{ success: boolean; locations: LocationRow[] }>(res);
}

export async function getSubmissions(params?: {
  limit?: number;
  offset?: number;
  category?: string;
  location?: string;
  sentiment?: string;
}) {
  const qp = new URLSearchParams();
  if (params?.limit != null) qp.set("limit", String(params.limit));
  if (params?.offset != null) qp.set("offset", String(params.offset));
  if (params?.category) qp.set("category", params.category);
  if (params?.location) qp.set("location", params.location);
  if (params?.sentiment) qp.set("sentiment", params.sentiment);
  const res = await fetch(`${BASE}/admin/submissions?${qp}`, { headers: authHeaders() });
  return handle<SubmissionsData>(res);
}

export function getExportUrl() {
  return `${BASE}/admin/export`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DashboardData {
  total: number;
  avg_sentiment: number;
  top_category: string;
  top_location: string;
  category_counts: Record<string, number>;
  location_counts: Record<string, number>;
  weekly_trend: { label: string; count: number }[];
  anomaly_weeks: string[];
  sentiment_counts: { positive: number; neutral: number; negative: number };
  avg_sentiment_by_category: Record<string, number>;
  heatmap: { location_x: number; location_y: number; location: string; count: number }[];
  sentiment_delta: Record<string, number>;
  active_anomaly: string | null;
}

export interface InsightsData extends DashboardData {
  top_priorities: {
    text_original: string;
    category: string;
    location: string;
    priority_score: number;
    sentiment_label: string;
  }[];
  scatter: {
    x: number;
    y: number;
    cluster: number;
    cluster_label: string;
    category: string;
    text: string;
  }[];
  cluster_labels: Record<string, string>;
}

export interface AnalyticsData {
  day_of_week: { day: string; count: number }[];
  avg_text_length: number;
  median_text_length: number;
  avg_word_count: number;
  total_words: number;
  text_length_dist: { bucket: string; count: number }[];
  category_evolution: Record<string, number | string>[];
  sentiment_evolution: { week: string; mean: number; std: number; upper: number; lower: number }[];
  location_ranking: { location: string; count: number; avg_sentiment: number }[];
  processed_rate: number;
  unique_locations: number;
  median_sentiment: number;
  std_sentiment: number;
  categories: string[];
}

export interface TrendsData {
  weekly_volume: { week: string; count: number }[];
  forecast: { week: string; count: number }[];
  slope: number;
  r_squared: number;
  momentum: "growing" | "stable" | "declining";
  category_momentum: Record<string, number>;
  wow_change: number;
  sentiment_trend: { week: string; avg_sentiment: number }[];
  cat_weekly: Record<string, number | string>[];
  categories: string[];
}

export interface PublicStats {
  total: number;
  this_week: number;
  positive_pct: number;
  top_category: string;
  locations_covered: number;
}

export interface TrackData {
  found: boolean;
  category: string;
  location: string;
  submitted: string;
  week_num: number;
  sentiment_label: string;
  sentiment_score: number;
  cluster_id: number;
  processed: boolean;
  priority_score: number;
}

export interface SettingsData {
  institution_name: string;
  institution_city: string;
  categories: { id: number; name: string; color: string }[];
  locations: { id: number; name: string; building: string; x_grid: number; y_grid: number }[];
}

export interface SubmissionsData {
  submissions: {
    token: string;
    category: string;
    location: string;
    sentiment_label: string;
    sentiment_score: number;
    priority_score: number;
    cluster_id: number;
    created_at: string;
    text_preview: string;
    processed: boolean;
  }[];
  total: number;
  limit: number;
  offset: number;
}
