export interface SampleRecord {
  id?: string;
  sampleType: string;
  productionOrder: string;
  lot: string;
  deliveredAt: string;
  completedAt?: string;
  analystName?: string;
  status: "pending" | "completed";
}

// Nombres internos reales de SharePoint (field_1 a field_7)
export interface SharePointItem {
  id: string;
  fields: {
    field_1: string;   // TipoMuestra
    field_2: string;   // OrdenProduccion
    field_3: string;   // Lote
    field_4: string;   // FechaEntrega
    field_5?: string;  // FechaTerminado
    field_6?: string;  // Analista
    field_7: string;   // Estado
  };
}
