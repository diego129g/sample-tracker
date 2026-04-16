# 🧪 Control de Análisis de Muestras — Tab App para Microsoft Teams

Aplicación web para registrar y hacer seguimiento al tiempo de análisis de muestras de laboratorio.
Se integra directamente con una lista de SharePoint via Microsoft Graph API y se distribuye como app en Teams.

---

## Estructura del proyecto

```
sample-tracker/
├── src/
│   ├── config.ts              ← Configuración de Azure y SharePoint
│   ├── types/index.ts         ← Tipos TypeScript
│   ├── hooks/useAuth.ts       ← Login con MSAL
│   ├── services/graphService.ts ← Llamadas a Graph API
│   ├── components/
│   │   ├── SampleForm.tsx     ← Formulario de entrega
│   │   └── SampleList.tsx     ← Lista con opción de cierre
│   ├── App.tsx                ← Componente raíz
│   ├── styles.css             ← Estilos
│   └── index.tsx              ← Entry point
├── teams-manifest/
│   └── manifest.json          ← Manifiesto de la app de Teams
└── package.json
```

---

## Paso 1 — Crear la lista en SharePoint

En tu sitio de SharePoint crea una lista con estas columnas:

| Nombre interno    | Tipo                   | Obligatorio |
|-------------------|------------------------|-------------|
| TipoMuestra       | Línea de texto         | Sí          |
| OrdenProduccion   | Línea de texto         | Sí          |
| Lote              | Línea de texto         | Sí          |
| FechaEntrega      | Fecha y hora           | Sí          |
| FechaTerminado    | Fecha y hora           | No          |
| Analista          | Línea de texto         | No          |
| Estado            | Línea de texto         | Sí          |

---

## Paso 2 — Registrar la app en Azure Active Directory

1. Ve a https://portal.azure.com → Azure Active Directory → App registrations
2. Haz clic en **New registration**
   - Name: `Sample Tracker`
   - Supported account types: *Accounts in this organizational directory only*
   - Redirect URI: `Single-page application (SPA)` → `http://localhost:3000`
3. Copia el **Application (client) ID** y el **Directory (tenant) ID**

### Agregar permisos de API
En el App Registration → **API permissions** → **Add a permission**:
- Microsoft Graph → Delegated → `Sites.ReadWrite.All`
- Microsoft Graph → Delegated → `User.Read`
- Haz clic en **Grant admin consent**

---

## Paso 3 — Obtener los IDs de SharePoint

Abre **Graph Explorer** (https://developer.microsoft.com/graph/graph-explorer) e inicia sesión.

**siteId:**
```
GET https://graph.microsoft.com/v1.0/sites/{tu-dominio}.sharepoint.com:/sites/{nombre-del-sitio}
```
Copia el valor del campo `"id"`.

**listId:**
```
GET https://graph.microsoft.com/v1.0/sites/{siteId}/lists
```
Busca tu lista por nombre y copia el `"id"`.

---

## Paso 4 — Configurar el proyecto

Edita `src/config.ts` con los valores obtenidos:

```typescript
export const config = {
  clientId: "tu-application-client-id",
  tenantId: "tu-directory-tenant-id",
  siteId:   "tu-site-id",
  listId:   "tu-list-id",
  scopes:   ["Sites.ReadWrite.All", "User.Read"],
};
```

---

## Paso 5 — Instalar dependencias y correr localmente

```bash
npm install
npm start
```

La app se abre en http://localhost:3000. Inicia sesión con tu cuenta Microsoft para probarla.

---

## Paso 6 — Desplegar la app

### Opción A — SharePoint (sin infraestructura adicional)
```bash
npm run build
```
Sube el contenido de la carpeta `build/` a una biblioteca de documentos de SharePoint.
La URL pública de esa biblioteca será el `contentUrl` del manifiesto.

### Opción B — Azure Static Web Apps (recomendado para producción)
1. Crea un recurso **Static Web App** en Azure
2. Conecta el repositorio (GitHub o Azure DevOps)
3. Azure detecta automáticamente que es una app de React y la despliega

---

## Paso 7 — Instalar en Microsoft Teams

1. Edita `teams-manifest/manifest.json`:
   - Reemplaza `REEMPLAZA-CON-UN-GUID-UNICO` con un GUID nuevo (puedes generar uno en https://guidgenerator.com)
   - Reemplaza `TU-DOMINIO-DE-DEPLOY` con la URL donde desplegaste la app
   - Agrega esa URL también en el `Redirect URI` del App Registration en Azure

2. Agrega dos íconos PNG en la carpeta `teams-manifest/`:
   - `icon-color.png` — 192×192px, fondo de color
   - `icon-outline.png` — 32×32px, solo silueta blanca

3. Comprime los tres archivos en un `.zip`

4. En Teams → **Apps** → **Manage your apps** → **Upload an app** → selecciona el `.zip`

5. La app queda disponible para instalar como pestaña en canales o en modo personal.

---

## Flujo de uso

```
Quien entrega la muestra:
  → Tab "Registrar entrega"
  → Llena: tipo de muestra, orden, lote, fecha-hora de entrega
  → Guarda → aparece en "Muestras en curso" con estado Pendiente

Analista:
  → Tab "Muestras en curso"
  → Encuentra su muestra (ve el tiempo transcurrido en tiempo real)
  → Clic en "Marcar como terminada"
  → Confirma fecha-hora de terminación
  → El registro se actualiza en SharePoint con duración calculada
```
