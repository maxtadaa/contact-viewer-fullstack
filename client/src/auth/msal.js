import { PublicClientApplication } from "@azure/msal-browser";

const tenant = import.meta.env.VITE_MS_TENANT_ID || "common";

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: import.meta.env.VITE_MS_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${tenant}`,
    redirectUri: window.location.origin,
  },
  cache: { cacheLocation: "sessionStorage" },
});

let initialized = false;
async function ensureInit() {
  if (!initialized) {
    await msalInstance.initialize();
    initialized = true;
  }
}

// เปิด popup ให้ผู้ใช้ล็อกอิน Microsoft แล้วคืน id_token
export async function getMicrosoftIdToken() {
  await ensureInit();
  const result = await msalInstance.loginPopup({
    scopes: ["openid", "profile", "email"],
  });
  return result.idToken;
}
