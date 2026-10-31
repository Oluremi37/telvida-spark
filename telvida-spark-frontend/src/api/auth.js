import api from "./axios";

export async function login(email, password) {
  const response = await api.post("/auth/login", { email, password });
  return response.data.data; // { user, accessToken }
}

export async function googleLogin(idToken) {
  const response = await api.post("/auth/google", { idToken });
  return response.data.data; // { user, accessToken }
}

export async function register(fullName, email, password) {
  const response = await api.post("/auth/register", {
    fullName,
    email,
    password,
  });
  return response.data;
}



// Create Organization
export async function createOrganization(data) {
  const response = await api.post("/onboarding/organization", data);
  return response.data;
}

// Invite a single team member
export async function inviteTeamMember(email, role) {
  const response = await api.post("/onboarding/invite", { email, role });
  return response.data;
}