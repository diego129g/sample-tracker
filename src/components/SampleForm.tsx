// ─────────────────────────────────────────────
//  components/SampleForm.tsx
//  Formulario de registro de entrega de muestra
// ─────────────────────────────────────────────

import React, { useState } from "react";

interface Props {
  onSubmit: (data: {
    sampleType: string;
    productionOrder: string;
    lot: string;
    deliveredAt: string;
    analystName: string;
  }) => Promise<void>;
}

const SAMPLE_TYPES = [
  "Materia Prima",
  "Producto en Proceso",
  "Producto Terminado",
  "Agua",
  "Ambiental",
];

export function SampleForm({ onSubmit }: Props) {
  const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
  .toISOString()
  .slice(0, 16);

  const [form, setForm] = useState({
    sampleType: "",
    productionOrder: "",
    lot: "",
    deliveredAt: now,
    analystName: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function handle(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(false);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.sampleType || !form.productionOrder || !form.lot) {
      setError("Completa todos los campos obligatorios.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(form);
      setSuccess(true);
      setForm({ ...form, productionOrder: "", lot: "", deliveredAt: now });
    } catch {
      setError("No se pudo guardar el registro. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="sample-form">
      <h2 className="form-title">Registrar Entrega de Muestra</h2>

      <div className="field-group">
        <label htmlFor="sampleType">Tipo de muestra *</label>
        <select
          id="sampleType"
          name="sampleType"
          value={form.sampleType}
          onChange={handle}
          required
        >
          <option value="">Selecciona...</option>
          {SAMPLE_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="field-group">
        <label htmlFor="productionOrder">Orden de producción *</label>
        <input
          id="productionOrder"
          name="productionOrder"
          type="text"
          placeholder="Ej: OP-2025-0042"
          value={form.productionOrder}
          onChange={handle}
          required
        />
      </div>

      <div className="field-group">
        <label htmlFor="lot">Lote *</label>
        <input
          id="lot"
          name="lot"
          type="text"
          placeholder="Ej: L-240115"
          value={form.lot}
          onChange={handle}
          required
        />
      </div>

      <div className="field-group">
        <label htmlFor="deliveredAt">Fecha y hora de entrega *</label>
        <input
          id="deliveredAt"
          name="deliveredAt"
          type="datetime-local"
          value={form.deliveredAt}
          onChange={handle}
          required
        />
      </div>

      <div className="field-group">
        <label htmlFor="analystName">Analista asignado</label>
        <input
          id="analystName"
          name="analystName"
          type="text"
          placeholder="Nombre del analista"
          value={form.analystName}
          onChange={handle}
        />
      </div>

      {error && <p className="msg error">{error}</p>}
      {success && <p className="msg success">✓ Muestra registrada correctamente</p>}

      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? "Guardando..." : "Registrar entrega"}
      </button>
    </form>
  );
}
