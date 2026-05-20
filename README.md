<div align="center">

# OssFlow — Frontend

**Segundo cerebro técnico para Brazilian Jiu-Jitsu**

[![CI](https://github.com/yraedry/OssFlow-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/yraedry/OssFlow-frontend/actions/workflows/ci.yml)
![React 19](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-06b6d4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.x-646cff?logo=vite&logoColor=white)
![Node](https://img.shields.io/badge/Node-22-339933?logo=nodedotjs&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

SPA React + TypeScript con diseño oscuro optimizado para móvil y escritorio.

</div>

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Estilos | Tailwind CSS v4 |
| Routing | React Router v7 |
| Server state | TanStack Query v5 |
| Formularios | React Hook Form + Zod |
| Gráficas | Recharts |
| Tests | Vitest + Testing Library |

---

## Requisitos

- Node.js 22
- npm 10+
- Backend OssFlow corriendo en `http://localhost:8080`

---

## Arrancar en local

```bash
npm install
npm run dev
```

La app arranca en `http://localhost:5173`.

Para desarrollo local con el backend en otro puerto, crea `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

## Comandos

```bash
npm run dev          # Servidor de desarrollo con HMR
npm run build        # Build de producción (TypeScript + Vite)
npm run preview      # Previsualizar el build de producción
npm run type-check   # Verificación de tipos sin emitir archivos
npm run lint         # ESLint
npm run test         # Tests en modo watch
npm run test:ci      # Tests sin watch (para CI)
```

---

## Estructura del proyecto

```
src/
├── app/              # Router, layout raíz
├── features/         # Módulos de dominio
│   ├── analisis/     # Radares de análisis técnico y físico
│   ├── catalog/      # Técnicas, posiciones, ejercicios, reglamentos
│   ├── coaching/     # Relación maestro-atleta, observaciones, notas
│   ├── journal/      # Sesiones BJJ y físicas, notas, competiciones
│   ├── planning/     # Planes de estudio, rutinas, recomendaciones
│   └── identity/     # Perfil de usuario, cinturón, federaciones
├── pages/            # Páginas de nivel superior (composición)
└── shared/           # Componentes UI, API client, hooks comunes
```

---

## Docker

```bash
docker build -t ossflow-frontend .

docker run -d -p 80:80 ossflow-frontend
```

La imagen usa Nginx para servir la SPA y redirige `/api` al backend.

---

## Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | URL base del backend | `/api/v1` |
