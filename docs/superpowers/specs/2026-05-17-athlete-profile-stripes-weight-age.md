# Athlete Profile — Stripes, Peso y Categoría de Edad

## Contexto

El header del atleta en la vista del maestro (`AthleteProfileHeader`) actualmente muestra cinturón y días, pero no los grados (stripes 0-4), la categoría de edad ni el peso del atleta. El atleta tampoco puede introducir estos datos en el onboarding ni en su perfil. Este spec cubre el ciclo completo: el atleta los introduce, el maestro los ve.

---

## Diseño aprobado

### Campos nuevos

| Campo | Tipo TS | Valores | Notas |
|---|---|---|---|
| `stripes` | `0 \| 1 \| 2 \| 3 \| 4 \| null` | entero 0-4 | nuevo en todo el stack |
| `ageCategory` | `'JUVENILE' \| 'ADULT' \| 'MASTER_1' \| 'MASTER_2' \| 'MASTER_3' \| 'MASTER_4' \| null` | enum | ya existe en `UserProfile` y `AthleteSummary` pero sin UI |
| `weight` | `number \| null` | kg, acepta decimales (ej. 73.5), rango 30-180 | nuevo en todo el stack |

### Visualización del chip de cinturón — barras

El chip del cinturón pasa de `WHITE · 848D` a `WHITE · 848D · ▌▌░░` usando 4 barras verticales:
- Barra rellena (`rgba(255,255,255,0.92)`) = stripe completado
- Barra vacía (`rgba(255,255,255,0.20)`) = stripe pendiente
- Si `stripes === null` o `stripes === 0`: las 4 barras aparecen vacías (se muestran igualmente para mantener el ancho constante del chip)

Implementación React (dentro del chip):
```tsx
<span className="inline-flex gap-[2px] items-center ml-0.5">
  {[0,1,2,3].map(i => (
    <span
      key={i}
      className="w-1 h-[11px] rounded-[1px]"
      style={{ background: i < (stripes ?? 0) ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.20)' }}
    />
  ))}
</span>
```

### Stats del header del atleta

Se añaden dos columnas al footer de stats de `AthleteProfileHeader`:
- **Categoría**: label formateado (`'MASTER_1'` → `'Master 1'`, `'JUVENILE'` → `'Juvenil'`, `'ADULT'` → `'Adulto'`)
- **Peso**: `76 kg` o `—` si null

Pasan de 4 columnas a 6 (o 5 si no hay peso ni categoría, con `—`).

### Formulario (onboarding + perfil BJJ)

Los tres campos se añaden al **Step 2 del onboarding** (`OnboardingPage`) y al **tab "Perfil BJJ"** de `ProfileEditPage`, justo debajo del selector de cinturón.

**Selector de stripes**: 5 botones (0-4), cada uno muestra el número y 4 mini-barras que representan visualmente los grados. Estado activo: fondo `foreground`, texto `background`. Estado inactivo: borde `border`, texto `muted-foreground`.

**Categoría de edad**: `<select>` con 6 opciones. Opcional.

**Peso**: `<input type="number">` con sufijo `kg`, min=30 max=180 step=0.5. Opcional.

---

## Arquitectura

### Frontend — archivos a tocar

**Types** (`src/features/identity/profile/types.ts`):
- Añadir `stripes: 0 | 1 | 2 | 3 | 4 | null` y `weight: number | null` a `UserProfile`, `CreateProfileRequest` y `UpdateProfileRequest`
- `ageCategory` ya existe en `UserProfile` — añadir a `UpdateProfileRequest` y `CreateProfileRequest` si no está

**Schemas** (`src/features/identity/profile/schemas.ts`):
- Añadir a `updateProfileSchema`: `stripes: z.number().int().min(0).max(4).nullable().optional()`, `ageCategory: z.string().nullable().optional()`, `weight: z.number().min(30).max(180).nullable().optional()`

**Coaching types** (`src/features/coaching/types.ts`):
- Añadir `stripes: number | null` y `weight: number | null` a `AthleteSummary` (ya tiene `ageCategory`)

**AthleteProfileHeader** (`src/features/coaching/components/AthleteProfileHeader.tsx`):
- Chip cinturón: añadir 4 barras after `daysInBelt`
- Stats footer: añadir columnas Categoría y Peso

**ProfileEditPage** (`src/features/identity/profile/pages/ProfileEditPage.tsx`):
- Tab "Perfil BJJ": añadir selector stripes + select ageCategory + input weight

**OnboardingPage** (`src/pages/OnboardingPage.tsx`):
- Step 2 (`step1Schema`): añadir los 3 campos al schema y al form

**ProfilePage** (`src/features/identity/profile/pages/ProfilePage.tsx`):
- Mostrar stripes (barras) junto al cinturón propio, y ageCategory + weight en la sección de stats

### Backend — campos nuevos

Los campos `stripes` (SMALLINT) y `weight` (NUMERIC 5,2) son nuevos en la tabla `profile`. `age_category` ya puede existir — verificar.

Migración Flyway necesaria (incluida en el plan de implementación).

Endpoints afectados:
- `PUT /identity/profile` — aceptar `stripes`, `weight`, `ageCategory`
- `GET /identity/profile` — devolver los tres campos
- `GET /coaching/athletes/:id/summary` — devolver `stripes` y `weight` (ageCategory ya se devuelve)

---

## Labels de categoría de edad

```ts
const AGE_CATEGORY_LABELS: Record<string, string> = {
  JUVENILE: 'Juvenil',
  ADULT:    'Adulto',
  MASTER_1: 'Master 1',
  MASTER_2: 'Master 2',
  MASTER_3: 'Master 3',
  MASTER_4: 'Master 4',
}
```

---

## Fuera de alcance

- El maestro no puede editar los campos del atleta (solo lectura en el header)
- No se calcula ni sugiere la categoría de peso de competición a partir del peso
- No hay validación cruzada entre cinturón y stripes (un negro con 4 stripes es válido)
- El campo `weightCategory` de Competition Log no se toca
