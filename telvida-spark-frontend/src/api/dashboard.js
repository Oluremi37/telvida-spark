import api from "./axios";

export async function getDashboardStats() {
  const response = await api.get("/dashboard/stats");
  return response.data.data; // unwraps { success, data: {...} } to just the stats object
}