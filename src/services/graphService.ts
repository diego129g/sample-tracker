// ─────────────────────────────────────────────
//  services/graphService.ts
//  Todas las llamadas a Microsoft Graph API
// ─────────────────────────────────────────────

import { Client } from "@microsoft/microsoft-graph-client";
import { config } from "../config";
import { SampleRecord, SharePointItem } from "../types";

/*
  Mapa de columnas SharePoint (nombres internos reales):
  field_1 = TipoMuestra
  field_2 = OrdenProduccion
  field_3 = Lote
  field_4 = FechaEntrega
  field_5 = FechaTerminado
  field_6 = Analista
  field_7 = Estado
*/

export function createGraphClient(accessToken: string): Client {
  return Client.init({
    authProvider: (done) => done(null, accessToken),
  });
}

const baseUrl = `/sites/${config.siteId}/lists/${config.listId}/items`;

// ── Trae todos los registros recientes ──────────────────────────────────────
export async function fetchSamples(client: Client): Promise<SharePointItem[]> {
  const response = await client
    .api(`${baseUrl}?expand=fields&$top=50`)
    .get();
  return response.value as SharePointItem[];
}

// ── Crea un nuevo registro (registro de entrega) ─────────────────────────────
export async function createSample(
  client: Client,
  data: Omit<SampleRecord, "id" | "status" | "completedAt">
): Promise<SharePointItem> {
  const body = {
    fields: {
      field_1: data.sampleType,
      field_2: data.productionOrder,
      field_3: data.lot,
      field_4: data.deliveredAt,
      field_6: data.analystName ?? "",
      field_7: "Pendiente",
    },
  };
  return await client.api(baseUrl).post(body);
}

// ── Cierra un registro existente (el analista marca como terminado) ───────────
export async function completeSample(
  client: Client,
  itemId: string,
  completedAt: string
): Promise<void> {
  await client.api(`${baseUrl}/${itemId}/fields`).patch({
    field_5: completedAt,
    field_7: "Completado",
  });
}
