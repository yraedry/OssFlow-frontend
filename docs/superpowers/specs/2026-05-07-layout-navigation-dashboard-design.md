# OssFlow — Layout, Navegación y Dashboard Rediseño

**Fecha:** 2026-05-07  
**Estado:** Aprobado por usuario  
**Repo:** OssFlow-frontend

---

## Resumen ejecutivo

Rediseño completo de la navegación y el dashboard de inicio de OssFlow. Se reemplaza el sidebar lateral por una navegación mobile-first (bottom tabs + FAB en móvil, top nav en escritorio). Se añade soporte para sesiones físicas (gym/cardio/fuerza) y un dashboard combinado BJJ + físico con semana visual, anillos de actividad y plan del día.

---

## 1. Sistema de diseño

### Tipografía
| Rol | Familia | Peso |
|-----|---------|------|
| Títulos / display | Playfair Display | 700, 900 |
| Cuerpo / descripciones | Source Serif 4 | 300, 400, 600 |
| Labels / badges / monospace | JetBrains Mono | 400, 700 |

**Regla:** Los números de estadísticas usan Playfair Display 900 para máximo impacto visual. Los labels de navegación y badges usan JetBrains Mono uppercase con letter-spacing 0.08–0.12em.

### Paleta de colores (dark mode principal)
| Token | Valor | Uso |
|-------|-------|-----|
| `--bg` | `#0c0c0c` | Fondo principal |
| `--surface` | `#0f0f0f` | Tarjetas / surfaces |
| `--surface-2` | `#131313` | Bordes internos |
| `--border` | `#1c1c1c` | Bordes de componentes |
| `--border-strong` | `#252525` | Marco de frame |
| `--fg` | `#f0ebe3` | Texto principal / cream |
| `--fg-muted` | `#c0bbb5` | Texto secundario |
| `--fg-dim` | `#888` | Texto terciario |
| `--fg-subtle` | `#444` | Labels inactivos |
| `--accent-bjj` | `#f0ebe3` | Indicador BJJ (blanco cream) |
| `--accent-gym` | `#444` | Indicador físico (gris) |

**Modo claro:** pendiente para fase 2, usar tokens CSS que se puedan reasignar.

### Geometría
- **Border radius:** 0px en todos los componentes (brutalismo editorial)
- **Bordes:** 1px sólido, sin sombras decorativas
- **Spacing:** sistema 4/8dp (4, 8, 12, 16, 20, 24, 32, 48)
- **Touch targets:** mínimo 44×44px en todos los elementos interactivos

### Iconografía
- Librería: **Lucide React** (ya instalada)
- Stroke width: 1.5px en toda la app (nunca mezclar con filled)
- **Prohibido usar emojis como iconos** — solo SVG

---

## 2. Navegación

### Móvil (< 768px): Bottom Tab Bar + FAB

```
┌─────────────────────────────────────┐
│  [🏠]  [📖]  [  +  ]  [📅]  [👤]  │
│ Inicio Técn  (FAB)  Sesion Perfil   │
└─────────────────────────────────────┘
```

**5 tabs fijos:**
| Tab | Ruta | Icono (Lucide) |
|-----|------|----------------|
| Inicio | `/` | `Home` |
| Técnicas | `/catalog/techniques` | `BookOpen` |
| **[+] FAB** | — | `Plus` (FAB central) |
| Sesiones | `/journal/sessions` | `Calendar` |
| Perfil | `/profile` | `User` |

**FAB (Floating Action Button):**
- Posición: tab central elevado (-16px margin-top), círculo 44px, fondo `#f0ebe3`, borde 3px `#0c0c0c`
- Al pulsarlo abre un **bottom sheet** con 5 acciones rápidas:
  1. **Registrar sesión BJJ** → `/journal/sessions/new?type=bjj`
  2. **Registrar sesión física** → `/journal/sessions/new?type=physical`
  3. **Añadir técnica** → `/catalog/techniques/new`
  4. **Escribir nota** → `/notes/new`
  5. **Programar sesión** → `/planning/schedule/new`
- El sheet se cierra con swipe-down o tap en backdrop
- Animación: slide-up 200ms ease-out desde el borde inferior

**Tab activa:** icono y label en `#f0ebe3`, el resto en `#3a3a3a`

### Escritorio (≥ 768px): Top Navigation Bar

```
┌─────────────────────────────────────────────────────────┐
│  OSSFLOW  │ Inicio  Técnicas  Sesiones  Planes  ···  │ AN │
└─────────────────────────────────────────────────────────┘
```

- Altura: 48px, fondo `#0c0c0c`, borde inferior 1px `#1c1c1c`
- Logo: "OSSFLOW" Playfair Display 900, izquierda
- Nav items: JetBrains Mono 8px uppercase, tab activa con underline 2px `#f0ebe3`
- Acciones derecha: botón "+ Registrar" (primary) + avatar con iniciales
- El "···" expande un dropdown con rutas secundarias (Reglamentos, Competencias, Planes de estudio, Notas)
- **El sidebar lateral existente se elimina completamente**

### Rutas secundarias (accesibles desde "···" en desktop / dentro de cada tab en móvil)
- `/catalog/positions` — Posiciones
- `/catalog/rulesets` — Reglamentos  
- `/competition/logs` — Competencias
- `/planning/study-plans` — Planes de estudio
- `/notes` — Notas
- `/profile` — Perfil / configuración

---

## 3. Dashboard — Página de Inicio (`/`)

### Diseño móvil

**Estructura vertical (de arriba a abajo):**

1. **Status bar** — hora, iconos sistema (SVG)
2. **App header** — logo "OSS", campana, avatar con iniciales
3. **Saludo** — "Buenas, [nombre]." (Playfair Display 700) + fecha/semana (mono)
4. **Week strip** — 7 celdas (Lu–Do), día actual invertido (fondo cream, texto negro)
   - Cada celda muestra: nombre día, número, dots (blanco=BJJ, gris=físico)
5. **Leyenda** — dot blanco "BJJ" · dot gris "Físico" (JetBrains Mono 7px)
6. **Stats band** — 3 celdas sin borde-radius: `BJJ (semana)` / `Físico (semana)` / `Racha (días)` — números Playfair 900
7. **Anillos de actividad** — SVG donut chart 80×80px con 2 anillos concéntricos:
   - Anillo exterior (r=34): progreso BJJ semanal, color `#f0ebe3`
   - Anillo interior (r=23): progreso físico semanal, color `#444`
   - Centro: "METAS" + fracción total (ej. "5/7")
   - Leyenda lateral con 3 filas: BJJ, Físico, Racha
8. **Plan de hoy** — título italic, tarjetas de sesión programada para hoy:
   - Borde izquierdo 2px cream = BJJ, gris = físico
   - Badge tipo (BJJ/GYM), nombre, hora, chevron
9. **Bottom tab bar** — 5 tabs + FAB

### Diseño escritorio

**Layout:** top nav + cuerpo 2 columnas, separadas por 1px borde

**Columna izquierda:**
1. Título "Semana 19" (Playfair) + subtítulo rango fechas (mono)
2. Week grid 7 columnas (igual que móvil)
3. Leyenda BJJ / Físico
4. Stats 2×2 grid: BJJ semana / Físico semana / Racha / Técnicas mes
5. Lista "Últimas sesiones" — badge tipo, nombre, fecha relativa

**Columna derecha:**
1. Título italic "Plan de hoy" + fecha
2. Tarjetas de sesiones planificadas para hoy (misma estructura que móvil)
3. Planes activos — título plan, barra de progreso 2px + porcentaje
4. Lista "Próximas sesiones planificadas"

---

## 4. Feature nueva: Sesiones Físicas

### Modelo de datos (backend — nuevo bounded context)

```
PhysicalSession {
  id: Long
  sessionDate: LocalDate          // requerido
  sessionType: PhysicalSessionType // STRENGTH | CARDIO | FLEXIBILITY | HIIT | OTHER
  title: String (max 200)         // ej. "Fuerza — Empuje"
  durationMinutes: Integer        // opcional
  notes: String (max 5000)        // opcional
  createdAt / updatedAt
}
```

**PhysicalSessionType enum:** `STRENGTH`, `CARDIO`, `FLEXIBILITY`, `HIIT`, `OTHER`

### Rutas de API
- `GET /api/physical-sessions?page=0&size=20` — listar paginado
- `POST /api/physical-sessions` — crear
- `GET /api/physical-sessions/{id}` — detalle
- `PUT /api/physical-sessions/{id}` — actualizar
- `DELETE /api/physical-sessions/{id}` — eliminar (soft delete)
- `GET /api/physical-sessions/stats/weekly` — stats de la semana actual (count por tipo)

### Frontend — módulo `src/features/journal/physicalsession/`
Estructura análoga a `trainingsession/`:
```
physicalsession/
  api.ts          — funciones ky
  hooks.ts        — TanStack Query hooks
  schemas.ts      — Zod v4 schemas
  types.ts        — TypeScript types
  components/
    PhysicalSessionCard.tsx
    PhysicalSessionForm.tsx
  pages/
    PhysicalSessionsPage.tsx
    PhysicalSessionDetailPage.tsx
```

---

## 5. Dashboard Stats — API

El dashboard necesita un endpoint de resumen semanal combinado:

```
GET /api/dashboard/weekly-stats

Response:
{
  weekNumber: Integer,
  weekStart: LocalDate,
  weekEnd: LocalDate,
  bjjSessions: Integer,        // count sesiones BJJ esta semana
  physicalSessions: Integer,   // count sesiones físicas esta semana  
  bjjGoal: Integer,            // meta semanal BJJ (hardcoded 4 en fase 1)
  physicalGoal: Integer,       // meta semanal físico (hardcoded 3 en fase 1)
  streakDays: Integer,         // días consecutivos con al menos 1 sesión (cualquier tipo)
  techniquesThisMonth: Integer // técnicas revisadas/añadidas este mes
}
```

---

## 6. Componente FAB + Bottom Sheet

```
src/shared/components/ui/fab-menu.tsx
```

**Props:**
```typescript
type FabMenuProps = {
  actions: Array<{
    label: string
    icon: LucideIcon
    onClick: () => void
  }>
}
```

**Comportamiento:**
- Estado: abierto/cerrado gestionado localmente
- Al abrir: overlay backdrop semitransparente + sheet desde abajo
- Cada acción: min-height 48px, icono + label, separador 1px
- Cerrar: tap backdrop, swipe-down, o seleccionar acción
- Animación: translateY de 100% → 0 en 200ms ease-out

---

## 7. AppLayout — Cambios

### Archivo: `src/app/AppLayout.tsx`

**Cambios:**
1. Eliminar `<aside>` sidebar completamente
2. En móvil (`< md`): renderizar `<BottomTabBar>` + `<FabMenu>`
3. En escritorio (`≥ md`): renderizar `<TopNavBar>`
4. El `<main>` ocupa todo el ancho, sin padding-left del sidebar
5. En móvil: añadir `pb-20` al main para no quedar detrás de la tab bar

### Archivos nuevos:
- `src/shared/components/layout/BottomTabBar.tsx`
- `src/shared/components/layout/TopNavBar.tsx`
- `src/shared/components/ui/fab-menu.tsx`

---

## 8. Orden de implementación

1. **AppLayout** — eliminar sidebar, añadir BottomTabBar + TopNavBar
2. **FAB + BottomSheet** — componente genérico
3. **Backend PhysicalSession** — modelo, repositorio, servicio, controller, tests
4. **Frontend PhysicalSession** — módulo completo (CRUD)
5. **Backend dashboard/weekly-stats** — endpoint combinado
6. **Dashboard HomePage** — rediseño completo con week strip, stats, rings, plan del día

---

## 9. Decisiones de diseño tomadas

| Decisión | Elección | Razón |
|----------|----------|-------|
| Navegación móvil | Bottom tabs + FAB | Opción C — pulgar accesible, patrón estándar iOS/Android |
| Navegación desktop | Top nav bar | Reemplaza sidebar lateral que no gustaba, más limpio |
| Tipografía cuerpo | Source Serif 4 | Recomendación ui-ux-pro-max para editorial brutal |
| Peso display | Playfair 900 (black) | Máximo impacto en números de stats |
| Indicador BJJ | Cream `#f0ebe3` | Color principal de la paleta |
| Indicador físico | Gris `#444` | Secundario, no compite con BJJ |
| Anillos | 2 concéntricos SVG | Inspiración Apple Fitness, muestra 2 metas al mismo tiempo |
| FAB acciones | 5 (todas) | BJJ, físico, técnica, nota, programar |
| Border radius | 0px | Brutalismo editorial consistente |
| Iconos | Lucide SVG stroke 1.5 | Sin emojis — guideline ui-ux-pro-max |
