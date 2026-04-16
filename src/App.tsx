// ─────────────────────────────────────────────
//  App.tsx  —  Componente raíz
// ─────────────────────────────────────────────

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "./hooks/useAuth";
import { createGraphClient, fetchSamples, createSample, completeSample } from "./services/graphService";
import { SampleForm } from "./components/SampleForm";
import { SampleList } from "./components/SampleList";
import { SharePointItem } from "./types";
import "./styles.css";

type Tab = "register" | "list";

export default function App() {
  const { account, accessToken, loading, login, logout } = useAuth();
  const [items, setItems] = useState<SharePointItem[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("list");

  // ── Carga los registros desde SharePoint ────────────────────────────────────
  const loadSamples = useCallback(async () => {
    if (!accessToken) return;
    setListLoading(true);
    try {
      const client = createGraphClient(accessToken);
      const data = await fetchSamples(client);
      setItems(data);
    } catch (e) {
      console.error("Error cargando muestras:", e);
    } finally {
      setListLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) loadSamples();
  }, [accessToken, loadSamples]);

  // ── Crea un nuevo registro en SharePoint ────────────────────────────────────
  async function handleCreate(data: {
    sampleType: string;
    productionOrder: string;
    lot: string;
    deliveredAt: string;
    analystName: string;
  }) {
    if (!accessToken) return;
    const client = createGraphClient(accessToken);
    await createSample(client, {
      ...data,
      deliveredAt: new Date(data.deliveredAt).toISOString(),
    });
    await loadSamples();
    setTab("list");
  }

  // ── Cierra un registro existente ────────────────────────────────────────────
  async function handleComplete(itemId: string, completedAt: string) {
    if (!accessToken) return;
    const client = createGraphClient(accessToken);
    await completeSample(client, itemId, completedAt);
    await loadSamples();
  }

  // ── Estados de carga y login ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="splash">
        <div className="spinner" />
        <p>Iniciando sesión...</p>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="splash">
        <div className="login-box">
          <div className="app-logo">🧪</div>
          <h1>Control de Análisis</h1>
          <p>Inicia sesión con tu cuenta Microsoft para continuar</p>
          <button className="btn-primary" onClick={login}>
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="app-header">
        <div className="header-left">
          <span className="app-icon">🧪</span>
          <span className="app-name">Control de Análisis</span>
        </div>
        <div className="header-right">
          <span className="user-name">{account.name}</span>
          <button className="btn-ghost small" onClick={logout}>Salir</button>
        </div>
      </header>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <nav className="tabs">
        <button
          className={`tab ${tab === "list" ? "active" : ""}`}
          onClick={() => setTab("list")}
        >
          Muestras en curso
        </button>
        <button
          className={`tab ${tab === "register" ? "active" : ""}`}
          onClick={() => setTab("register")}
        >
          + Registrar entrega
        </button>
      </nav>

      {/* ── Contenido ──────────────────────────────────────────────────────── */}
      <main className="app-content">
        {tab === "register" ? (
          <SampleForm onSubmit={handleCreate} />
        ) : (
          <SampleList
            items={items}
            loading={listLoading}
            onComplete={handleComplete}
            onRefresh={loadSamples}
          />
        )}
      </main>
    </div>
  );
}
