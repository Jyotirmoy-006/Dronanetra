// All backend HTTP calls must go through this module — no inline fetch()
// calls in components (see docs/CONTEXT.md Section 18, Engineering Conventions).

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function getJSON(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`Request failed: ${path} (${res.status})`);
  return res.json();
}

async function postJSON(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST failed: ${path} (${res.status})`);
  return res.json();
}

export const api = {
  getLiveTelemetry: () => getJSON("/api/engine/live"),
  getHealth: () => getJSON("/api/engine/health"),
  getAlerts: () => getJSON("/api/alerts"),
  getHistory: (limit = 100) => getJSON(`/api/engine/history?limit=${limit}`),
  getMissions: () => getJSON("/api/missions"),
  getMission: (id) => getJSON(`/api/missions/${id}`),
  getMissionTelemetry: (id) => getJSON(`/api/missions/${id}/telemetry`),
  injectFault: (faultType) => postJSON("/api/engine/inject-fault", { fault_type: faultType }),
  setScenario: (scenario) => postJSON("/api/engine/set-scenario", { scenario }),
  getFleetSummary: () => getJSON("/api/fleet/summary"),
  simulateWhatIf: (plan) => postJSON("/api/whatif/simulate", plan),
  getCanBus: () => getJSON("/api/engine/can-bus"),
  getMaintenance: () => getJSON("/api/engine/maintenance"),
  getGeminiRulAdvisor: (params) => postJSON("/api/engine/gemini-rul-advisor", params),
  getMissionReport: (id) => getJSON(`/api/missions/${id}/report`),
};
