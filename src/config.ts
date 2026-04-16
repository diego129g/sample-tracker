// ─────────────────────────────────────────────
//  config.ts
//  Ajusta estos valores con los de tu tenant
// ─────────────────────────────────────────────

export const config = {
  // Azure AD — App Registration
  clientId: "48bf7972-becb-4dbf-b27a-73765320d458",          // Application (client) ID del App Registration
  tenantId: "40157cf6-b33e-4306-b93c-28ef225ebd05",          // Directory (tenant) ID

  // SharePoint
  siteId: "d49b6aeb-ff65-4266-92aa-f51bd3172fcf,f637e890-e8a0-4b7e-941b-3ea202ffc0d4",              // ID del sitio SharePoint (ver instrucciones abajo)
  listId: "cb9875d4-1256-445c-b3d5-9dc1296efde1",              // ID de la lista SharePoint

  // Scopes que necesita la app para Graph API
  scopes: ["Sites.ReadWrite.All", "User.Read"],
};

/*
──────────────────────────────────────────────────────────────
  CÓMO OBTENER siteId y listId
──────────────────────────────────────────────────────────────

  1. siteId:
     GET https://graph.microsoft.com/v1.0/sites/{tu-dominio}.sharepoint.com:/sites/{nombre-sitio}
     → Copia el campo "id"

  2. listId:
     GET https://graph.microsoft.com/v1.0/sites/{siteId}/lists
     → Busca tu lista por nombre y copia el campo "id"

  Puedes probar estas llamadas fácilmente en:
  https://developer.microsoft.com/en-us/graph/graph-explorer
──────────────────────────────────────────────────────────────
*/
