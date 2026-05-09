# OssFlow — Frontend

Interfaz web para OssFlow, el segundo cerebro técnico de Brazilian Jiu-Jitsu. SPA React + TypeScript con diseño oscuro optimizado para móvil y escritorio.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite |
| Estilos | Tailwind CSS v4 |
| Routing | React Router v7 |
| Server state | TanStack Query v5 |
| Formularios | React Hook Form + Zod |
| Gráficas | Recharts |
| Tests | Vitest + Testing Library |
| E2E | Playwright |

## Requisitos

- Node.js 20+
- npm 10+
- Backend OssFlow corriendo en `http://localhost:8080`

## Arrancar en local

```bash
npm install
npm run dev
```

La app arranca en `http://localhost:5173`.

Por defecto el cliente apunta a `/api/v1`. Para desarrollo local con el backend en otro puerto, crea un archivo `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

## Comandos disponibles

```bash
npm run dev          # Servidor de desarrollo con HMR
npm run build        # Build de producción (TypeScript + Vite)
npm run preview      # Previsualizar el build de producción
npm run type-check   # Verificación de tipos sin emitir archivos
npm run lint         # ESLint
npm run test         # Tests en modo watch
npm run test:ci      # Tests sin watch (para CI)
```

## Docker

```bash
# Build imagen
docker build -t ossflow-frontend .

# Ejecutar
docker run -d -p 80:80 ossflow-frontend
```

La imagen usa Nginx para servir la SPA y redirige `/api` al backend.

## Estructura del proyecto

```
src/
├── app/              # Router, layout raíz
├── features/         # Módulos de dominio
│   ├── analisis/     # Radares de análisis
│   ├── catalog/      # Técnicas, posiciones, ejercicios
│   ├── journal/      # Sesiones BJJ y físicas, notas
│   ├── competition/  # Competiciones
│   └── identity/     # Perfil de usuario
├── pages/            # Páginas de nivel superior (composición)
└── shared/           # Componentes UI, API client, hooks comunes
```

## Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | URL base del backend | `/api/v1` |
