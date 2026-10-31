import api from "./axios";

// Create Organization
export async function createOrganization(data) {
  const response = await api.post("/onboarding/organization", data);
  return response.data;
}

// Send Team Invites
export async function sendInvites(invites) {
  const response = await api.post("/onboarding/invites", { invites });
  return response.data;
}
