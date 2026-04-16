// ─────────────────────────────────────────────
//  hooks/useAuth.ts
//  Login con MSAL y obtención del access token
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  PublicClientApplication,
  AccountInfo,
  InteractionRequiredAuthError,
} from "@azure/msal-browser";
import { config } from "../config";

const msalInstance = new PublicClientApplication({
  auth: {
    clientId: config.clientId,
    authority: `https://login.microsoftonline.com/${config.tenantId}`,
    redirectUri: window.location.origin,
  },
  cache: { cacheLocation: "sessionStorage" },
});

export function useAuth() {
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    msalInstance.initialize().then(async () => {
      // Maneja el redirect de vuelta después del login
      await msalInstance.handleRedirectPromise();

      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await acquireToken(accounts[0]);
      }
      setLoading(false);
    });
  }, []);

  async function acquireToken(acc: AccountInfo) {
    try {
      // Intenta obtener el token en silencio (si ya hay sesión activa)
      const result = await msalInstance.acquireTokenSilent({
        scopes: config.scopes,
        account: acc,
      });
      setAccessToken(result.accessToken);
    } catch (e) {
      if (e instanceof InteractionRequiredAuthError) {
        // Si no hay sesión, redirige al login de Microsoft
        await msalInstance.acquireTokenRedirect({ scopes: config.scopes });
      }
    }
  }

  async function login() {
    await msalInstance.loginRedirect({ scopes: config.scopes });
  }

  function logout() {
    msalInstance.logoutRedirect();
  }

  return { account, accessToken, loading, login, logout };
}
