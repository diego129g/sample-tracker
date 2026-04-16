// ─────────────────────────────────────────────
//  components/SampleList.tsx
// ─────────────────────────────────────────────

import React, { useState } from "react";
import { SharePointItem } from "../types";

interface Props {
  items: SharePointItem[];
  loading: boolean;
  onComplete: (itemId: string, completedAt: string) => Promise<void>;
  onRefresh: () => void;
}

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-CO", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function elapsedMinutes(start: string, end?: string): string {
  const from = new Date(start).getTime();
  const to = end ? new Date(end).getTime() : Date.now();
  const mins = Math.round((to - from) / 60000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export function SampleList({ items, loading, onComplete, onRefresh }: Props) {
  const [closingId, setClosingId] = useState<string | null>(null);
  const [completedAt, setCompletedAt] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [saving, setSaving] = useState(false);

  async function handleComplete(itemId: string) {
    setSaving(true);
    try {
      await onComplete(itemId, new Date(completedAt).toISOString());
      setClosingId(null);
    } finally {
      setSaving(false);
    }
  }

  const pending   = items.filter((i) => i.fields.field_7 !== "Completado");
  const completed = items.filter((i) => i.fields.field_7 === "Completado");

  if (loading) return <div className="loading-state">Cargando registros...</div>;

  return (
    <section className="sample-list">
      <div className="list-header">
        <h2 className="form-title">Muestras en proceso</h2>
        <button className="btn-ghost" onClick={onRefresh}>↻ Actualizar</button>
      </div>

      {pending.length === 0 && (
        <p className="empty-state">No hay muestras pendientes.</p>
      )}

      {pending.map((item) => {
        const f = item.fields;
        const isClosing = closingId === item.id;

        return (
          <div key={item.id} className={`sample-card pending ${isClosing ? "closing" : ""}`}>
            <div className="card-main">
              <div className="card-badges">
                <span className="badge type">{f.field_1}</span>
                <span className="badge status pending-badge">Pendiente</span>
              </div>
              <div className="card-fields">
                <span><strong>Orden:</strong> {f.field_2}</span>
                <span><strong>Lote:</strong> {f.field_3}</span>
                {f.field_6 && <span><strong>Analista:</strong> {f.field_6}</span>}
              </div>
              <div className="card-times">
                <span>📥 Entregada: {formatDate(f.field_4)}</span>
                <span className="elapsed">⏱ Tiempo transcurrido: {elapsedMinutes(f.field_4)}</span>
              </div>
            </div>

            {!isClosing ? (
              <button
                className="btn-complete"
                onClick={() => {
                  setClosingId(item.id);
                  setCompletedAt(new Date().toISOString().slice(0, 16));
                }}
              >
                Marcar como terminada
              </button>
            ) : (
              <div className="close-panel">
                <label>Fecha y hora de terminación</label>
                <input
                  type="datetime-local"
                  value={completedAt}
                  onChange={(e) => setCompletedAt(e.target.value)}
                />
                <div className="close-actions">
                  <button
                    className="btn-primary"
                    onClick={() => handleComplete(item.id)}
                    disabled={saving}
                  >
                    {saving ? "Guardando..." : "Confirmar cierre"}
                  </button>
                  <button className="btn-ghost" onClick={() => setClosingId(null)}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {completed.length > 0 && (
        <>
          <h3 className="section-label">Completadas recientes</h3>
          {completed.slice(0, 10).map((item) => {
            const f = item.fields;
            return (
              <div key={item.id} className="sample-card completed">
                <div className="card-main">
                  <div className="card-badges">
                    <span className="badge type">{f.field_1}</span>
                    <span className="badge status completed-badge">Completado</span>
                  </div>
                  <div className="card-fields">
                    <span><strong>Orden:</strong> {f.field_2}</span>
                    <span><strong>Lote:</strong> {f.field_3}</span>
                  </div>
                  <div className="card-times">
                    <span>📥 {formatDate(f.field_4)}</span>
                    <span>✅ {formatDate(f.field_5!)}</span>
                    <span className="elapsed">
                      ⏱ Duración: {elapsedMinutes(f.field_4, f.field_5)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </section>
  );
}
