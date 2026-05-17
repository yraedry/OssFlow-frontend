# Athlete Profile — Stripes, Peso y Categoría de Edad — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir stripes (0-4), peso (kg) y categoría de edad al perfil del atleta — editable por el atleta en onboarding y perfil, visible por el maestro en el header del atleta.

**Architecture:** Backend: migración V269 añade `stripes SMALLINT` y `weight NUMERIC(5,2)` a `user_profile`; DTOs, dominio y `AthleteProfileComposer` se actualizan para propagar los campos. Frontend: types → schemas → formularios (onboarding step 2 + perfil BJJ) → visualización (AthleteProfileHeader + ProfilePage).

**Tech Stack:** Spring Boot 4, Flyway, JPA, React 19, react-hook-form, zod, TanStack Query v5, Tailwind CSS.

---

## Mapa de archivos

### Backend (OssFlow/)
| Archivo | Acción |
|---|---|
| `src/main/resources/db/migration/V269__add_stripes_weight_to_user_profile.sql` | Crear |
| `src/main/java/com/ossflow/identity/profile/domain/UserProfile.java` | Modificar — añadir `stripes`, `weight` |
| `src/main/java/com/ossflow/identity/profile/infrastructure/persistence/UserProfileEntity.java` | Modificar — añadir columnas |
| `src/main/java/com/ossflow/identity/profile/infrastructure/persistence/UserProfilePersistenceAdapter.java` | Modificar — mapeo |
| `src/main/java/com/ossflow/identity/profile/infrastructure/web/dto/UpdateUserProfileRequest.java` | Modificar — añadir campos |
| `src/main/java/com/ossflow/identity/profile/infrastructure/web/dto/UserProfileResponse.java` | Modificar — añadir campos |
| `src/main/java/com/ossflow/identity/profile/application/UserProfileService.java` | Modificar — propagar campos |
| `src/main/java/com/ossflow/coaching/relationship/infrastructure/web/dto/AthleteSummaryResponse.java` | Modificar — añadir `stripes`, `weight` |
| `src/main/java/com/ossflow/coaching/relationship/application/AthleteProfileComposer.java` | Modificar — incluir campos en respuesta |

### Frontend (OssFlow-frontend/src/)
| Archivo | Acción |
|---|---|
| `features/identity/profile/types.ts` | Modificar — añadir `stripes`, `weight` |
| `features/identity/profile/schemas.ts` | Modificar — añadir campos al schema |
| `features/coaching/types.ts` | Modificar — añadir `stripes`, `weight` a `AthleteSummary` |
| `features/coaching/components/AthleteProfileHeader.tsx` | Modificar — barras + stats Categoría/Peso |
| `features/identity/profile/pages/ProfileEditPage.tsx` | Modificar — campos en tab BJJ |
| `pages/OnboardingPage.tsx` | Modificar — campos en step 2 |
| `features/identity/profile/pages/ProfilePage.tsx` | Modificar — mostrar stripes + peso + categoría |

---

## Task 1: Migración Flyway — stripes y weight

**Files:**
- Create: `OssFlow/src/main/resources/db/migration/V269__add_stripes_weight_to_user_profile.sql`

- [ ] **Step 1: Crear la migración**

```sql
ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS stripes SMALLINT CHECK (stripes BETWEEN 0 AND 4);
ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS weight NUMERIC(5, 2) CHECK (weight BETWEEN 30 AND 180);
```

- [ ] **Step 2: Verificar que arranca el backend con la migración aplicada**

```bash
cd OssFlow
./mvnw spring-boot:run -q 2>&1 | grep -E "Flyway|ERROR|Started" | head -20
```

Expected: `Successfully applied 1 migration` y `Started OssFlowApplication`.

- [ ] **Step 3: Commit**

```bash
git add OssFlow/src/main/resources/db/migration/V269__add_stripes_weight_to_user_profile.sql
git commit -m "feat(db): add stripes and weight columns to user_profile (V269)"
```

---

## Task 2: Backend — dominio y persistencia

**Files:**
- Modify: `OssFlow/src/main/java/com/ossflow/identity/profile/domain/UserProfile.java`
- Modify: `OssFlow/src/main/java/com/ossflow/identity/profile/infrastructure/persistence/UserProfileEntity.java`
- Modify: `OssFlow/src/main/java/com/ossflow/identity/profile/infrastructure/persistence/UserProfilePersistenceAdapter.java`

- [ ] **Step 1: Añadir campos al record de dominio**

Archivo: `OssFlow/src/main/java/com/ossflow/identity/profile/domain/UserProfile.java`

```java
@Builder(toBuilder = true)
public record UserProfile(
        Long id,
        Long ownerId,
        String displayName,
        String firstName,
        String lastName,
        String alias,
        String currentBelt,
        LocalDate beltSince,
        String academy,
        String preferredModality,
        String ageCategory,
        Integer stripes,       // nuevo
        Double weight,         // nuevo
        boolean onboardingCompleted,
        List<UserProfileFederation> federations,
        Instant createdAt,
        Instant updatedAt,
        Long version
) {}
```

- [ ] **Step 2: Añadir campos a la entidad JPA**

Archivo: `OssFlow/src/main/java/com/ossflow/identity/profile/infrastructure/persistence/UserProfileEntity.java`

Añadir justo después de `ageCategory`:

```java
@Column(name = "stripes")
private Integer stripes;

@Column(name = "weight", precision = 5, scale = 2)
private Double weight;
```

- [ ] **Step 3: Actualizar el PersistenceAdapter — mapeo entidad→dominio y dominio→entidad**

Abrir `UserProfilePersistenceAdapter.java` y buscar el método `toDomain` (o equivalente). Añadir `.stripes(entity.getStripes()).weight(entity.getWeight())` al builder del dominio.

En el método `toEntity` (o `save`), añadir `entity.setStripes(domain.stripes()); entity.setWeight(domain.weight());`

El patrón exacto depende de la implementación actual — leer el archivo y aplicar consistentemente con los campos existentes como `ageCategory`.

- [ ] **Step 4: Compilar backend**

```bash
cd OssFlow && ./mvnw compile -q 2>&1 | tail -5
```

Expected: `BUILD SUCCESS`.

- [ ] **Step 5: Commit**

```bash
git add OssFlow/src/main/java/com/ossflow/identity/profile/domain/UserProfile.java \
        OssFlow/src/main/java/com/ossflow/identity/profile/infrastructure/persistence/UserProfileEntity.java \
        OssFlow/src/main/java/com/ossflow/identity/profile/infrastructure/persistence/UserProfilePersistenceAdapter.java
git commit -m "feat(profile): add stripes and weight to domain, entity and persistence adapter"
```

---

## Task 3: Backend — DTOs web y servicio

**Files:**
- Modify: `OssFlow/src/main/java/com/ossflow/identity/profile/infrastructure/web/dto/UpdateUserProfileRequest.java`
- Modify: `OssFlow/src/main/java/com/ossflow/identity/profile/infrastructure/web/dto/UserProfileResponse.java`
- Modify: `OssFlow/src/main/java/com/ossflow/identity/profile/application/UserProfileService.java`

- [ ] **Step 1: Añadir campos a UpdateUserProfileRequest**

```java
public record UpdateUserProfileRequest(
        @Size(max = 120) @Pattern(regexp = "^[^<>]*$", message = "No se permiten caracteres HTML") String displayName,
        @Size(max = 80)  @Pattern(regexp = "^[^<>]*$", message = "No se permiten caracteres HTML") String firstName,
        @Size(max = 80)  @Pattern(regexp = "^[^<>]*$", message = "No se permiten caracteres HTML") String lastName,
        @Size(max = 60)  @Pattern(regexp = "^[^<>]*$", message = "No se permiten caracteres HTML") String alias,
        @Size(max = 15) String currentBelt,
        LocalDate beltSince,
        @Size(max = 200) @Pattern(regexp = "^[^<>]*$", message = "No se permiten caracteres HTML") String academy,
        @Size(max = 10) String preferredModality,
        @Size(max = 20) String ageCategory,
        @Min(0) @Max(4) Integer stripes,          // nuevo
        @DecimalMin("30.0") @DecimalMax("180.0") Double weight  // nuevo
) {}
```

Añadir imports: `import jakarta.validation.constraints.DecimalMax; import jakarta.validation.constraints.DecimalMin; import jakarta.validation.constraints.Max; import jakarta.validation.constraints.Min;`

- [ ] **Step 2: Añadir campos a UserProfileResponse**

```java
public record UserProfileResponse(
        Long id,
        Long ownerId,
        String displayName,
        String firstName,
        String lastName,
        String alias,
        String currentBelt,
        LocalDate beltSince,
        String academy,
        String preferredModality,
        String ageCategory,
        Integer stripes,      // nuevo
        Double weight,        // nuevo
        boolean onboardingCompleted,
        List<UserProfileFederationResponse> federations,
        AccountRole role,
        Instant createdAt,
        Instant updatedAt,
        Long version
) {}
```

- [ ] **Step 3: Actualizar UserProfileService**

Abrir `UserProfileService.java`. Buscar donde se construye el dominio `UserProfile` a partir del request (método `update` o `create`). Añadir `.stripes(request.stripes()).weight(request.weight())`.

Buscar donde se construye `UserProfileResponse` a partir del dominio. Añadir `profile.stripes(), profile.weight()` en las posiciones correctas del record constructor.

- [ ] **Step 4: Compilar y tests unitarios del servicio**

```bash
cd OssFlow && ./mvnw test -pl . -Dtest=UserProfileServiceTest -q 2>&1 | tail -10
```

Expected: `BUILD SUCCESS`, tests en verde.

- [ ] **Step 5: Commit**

```bash
git add OssFlow/src/main/java/com/ossflow/identity/profile/infrastructure/web/dto/UpdateUserProfileRequest.java \
        OssFlow/src/main/java/com/ossflow/identity/profile/infrastructure/web/dto/UserProfileResponse.java \
        OssFlow/src/main/java/com/ossflow/identity/profile/application/UserProfileService.java
git commit -m "feat(profile): expose stripes and weight in update request and response DTOs"
```

---

## Task 4: Backend — AthleteSummaryResponse y AthleteProfileComposer

**Files:**
- Modify: `OssFlow/src/main/java/com/ossflow/coaching/relationship/infrastructure/web/dto/AthleteSummaryResponse.java`
- Modify: `OssFlow/src/main/java/com/ossflow/coaching/relationship/application/AthleteProfileComposer.java`

- [ ] **Step 1: Añadir stripes y weight a AthleteSummaryResponse**

```java
public record AthleteSummaryResponse(
        Long athleteId,
        String displayName,
        String currentBelt,
        long daysInBelt,
        String academy,
        String ageCategory,
        Integer stripes,      // nuevo
        Double weight,        // nuevo
        String preferredModality,
        List<ActiveInjury> activeInjuries,
        List<RecentCompetition> recentCompetitions,
        LocalDate lastSessionDate,
        long daysSinceLastSession
) {
    public record ActiveInjury(String bodyPart, String severity, String status) {}
    public record RecentCompetition(String eventName, LocalDate eventDate, String result) {}
}
```

- [ ] **Step 2: Actualizar AthleteProfileComposer — pasar los nuevos campos**

En `AthleteProfileComposer.compose()`, el constructor final de `AthleteSummaryResponse` debe incluir `profile.stripes()` y `profile.weight()` en las posiciones correctas (tras `ageCategory`):

```java
return new AthleteSummaryResponse(
        athleteId,
        profile.displayName(),
        profile.currentBelt(),
        daysInBelt,
        profile.academy(),
        profile.ageCategory(),
        profile.stripes(),       // nuevo
        profile.weight(),        // nuevo
        profile.preferredModality(),
        activeInjuries,
        recentCompetitions,
        lastSessionDate,
        daysSinceLastSession
);
```

- [ ] **Step 3: Compilar**

```bash
cd OssFlow && ./mvnw compile -q 2>&1 | tail -5
```

Expected: `BUILD SUCCESS`.

- [ ] **Step 4: Test de integración manual — verificar el endpoint summary**

```bash
# Arrancar backend
cd OssFlow && ./mvnw spring-boot:run -q &
sleep 15
# Obtener token (usa credenciales de demo del seed)
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"coach@demo.com","password":"Demo1234!"}' | jq -r '.accessToken')
# Llamar al summary de un atleta (id=2 según seed demo)
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/coaching/athletes/2/summary | jq '{stripes,weight,ageCategory}'
```

Expected: `{"stripes": null, "weight": null, "ageCategory": null}` (null hasta que el atleta los rellene).

- [ ] **Step 5: Commit**

```bash
git add OssFlow/src/main/java/com/ossflow/coaching/relationship/infrastructure/web/dto/AthleteSummaryResponse.java \
        OssFlow/src/main/java/com/ossflow/coaching/relationship/application/AthleteProfileComposer.java
git commit -m "feat(coaching): include stripes and weight in AthleteSummaryResponse"
```

---

## Task 5: Frontend — types y schemas

**Files:**
- Modify: `OssFlow-frontend/src/features/identity/profile/types.ts`
- Modify: `OssFlow-frontend/src/features/identity/profile/schemas.ts`
- Modify: `OssFlow-frontend/src/features/coaching/types.ts`

- [ ] **Step 1: Actualizar UserProfile, CreateProfileRequest y UpdateProfileRequest**

Archivo: `src/features/identity/profile/types.ts`

```typescript
export type UserProfile = {
  id: number
  ownerId: number
  displayName: string
  firstName?: string
  lastName?: string
  alias?: string
  currentBelt: string
  beltSince?: string
  academy?: string
  preferredModality: string
  ageCategory?: string | null
  stripes?: 0 | 1 | 2 | 3 | 4 | null   // nuevo
  weight?: number | null                  // nuevo
  onboardingCompleted: boolean
  federations: ProfileFederationEntry[]
  role: AccountRole
  createdAt: string
  updatedAt: string
  version: number
}

export type CreateProfileRequest = {
  displayName: string
  firstName?: string
  lastName?: string
  alias?: string
  currentBelt: string
  beltSince?: string
  academy?: string
  preferredModality: string
  ageCategory?: string | null            // nuevo
  stripes?: number | null                // nuevo
  weight?: number | null                 // nuevo
}

export type UpdateProfileRequest = {
  displayName: string
  firstName?: string
  lastName?: string
  alias?: string
  currentBelt: string
  beltSince?: string
  academy?: string
  preferredModality: string
  ageCategory?: string | null            // nuevo
  stripes?: number | null                // nuevo
  weight?: number | null                 // nuevo
}
```

- [ ] **Step 2: Actualizar el schema de validación**

Archivo: `src/features/identity/profile/schemas.ts`

```typescript
import { z } from 'zod'

export const updateProfileSchema = z.object({
  firstName: z.string().max(80).optional(),
  lastName: z.string().max(80).optional(),
  displayName: z.string().min(1, 'El alias es requerido').max(120),
  currentBelt: z.string().min(1, 'El cinturón es requerido'),
  preferredModality: z.string().min(1, 'La modalidad es requerida'),
  academy: z.string().max(200).optional(),
  beltSince: z.string().optional(),
  ageCategory: z.string().nullable().optional(),
  stripes: z.number().int().min(0).max(4).nullable().optional(),
  weight: z.number().min(30).max(180).nullable().optional(),
})

export type UpdateProfileForm = z.infer<typeof updateProfileSchema>
```

- [ ] **Step 3: Añadir stripes y weight a AthleteSummary**

Archivo: `src/features/coaching/types.ts`

Modificar el type `AthleteSummary`:

```typescript
export type AthleteSummary = {
  athleteId: number
  displayName: string
  currentBelt: string
  daysInBelt: number
  academy: string | null
  ageCategory: AgeCategory
  stripes: number | null     // nuevo
  weight: number | null      // nuevo
  preferredModality: 'GI' | 'NOGI' | 'BOTH' | null
  activeInjuries: ActiveInjuryItem[]
  recentCompetitions: CompetitionItem[]
  lastSessionDate: string | null
  daysSinceLastSession: number
}
```

- [ ] **Step 4: TypeScript check**

```bash
cd OssFlow-frontend && npx tsc --noEmit 2>&1 | head -20
```

Expected: sin errores.

- [ ] **Step 5: Commit**

```bash
cd OssFlow-frontend
git add src/features/identity/profile/types.ts \
        src/features/identity/profile/schemas.ts \
        src/features/coaching/types.ts
git commit -m "feat(types): add stripes, weight, ageCategory to profile and AthleteSummary types"
```

---

## Task 6: Frontend — AthleteProfileHeader (chip barras + stats)

**Files:**
- Modify: `OssFlow-frontend/src/features/coaching/components/AthleteProfileHeader.tsx`

- [ ] **Step 1: Añadir constantes de color de cinturón y helper de barras**

Abrir el archivo. Justo después de `MODALITY_LABELS`, añadir:

```typescript
const BELT_COLORS: Record<string, string> = {
  WHITE:  '#374151',
  BLUE:   '#2563eb',
  PURPLE: '#9333ea',
  BROWN:  '#92400e',
  BLACK:  '#111827',
}

const AGE_CATEGORY_LABELS: Record<string, string> = {
  JUVENILE: 'Juvenil',
  ADULT:    'Adulto',
  MASTER_1: 'Master 1',
  MASTER_2: 'Master 2',
  MASTER_3: 'Master 3',
  MASTER_4: 'Master 4',
}

function StripeBars({ stripes }: { stripes: number | null }) {
  const count = stripes ?? 0
  return (
    <span className="inline-flex gap-[2px] items-center ml-0.5">
      {[0, 1, 2, 3].map(i => (
        <span
          key={i}
          className="w-1 rounded-[1px]"
          style={{
            height: '11px',
            background: i < count ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.20)',
          }}
        />
      ))}
    </span>
  )
}
```

- [ ] **Step 2: Actualizar el chip del cinturón para usar el color dinámico y las barras**

En `AthleteProfileHeaderInner`, reemplazar el chip estático (fondo `bg-blue-600` hardcodeado):

```tsx
// Antes:
<span className="bg-blue-600 text-white font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-2 py-0.5">
  {athlete.currentBelt.toUpperCase()} · {athlete.daysInBelt}d
</span>

// Después:
<span
  className="text-white font-mono text-[10px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 inline-flex items-center gap-1.5"
  style={{ background: BELT_COLORS[athlete.currentBelt.toUpperCase()] ?? '#374151' }}
>
  {athlete.currentBelt.toUpperCase()} · {athlete.daysInBelt}d
  <StripeBars stripes={athlete.stripes} />
</span>
```

- [ ] **Step 3: Añadir Categoría y Peso al array de stats**

En `AthleteProfileHeaderInner`, modificar el array `stats`:

```typescript
const stats = [
  {
    label: 'Última sesión',
    value: formatLastSession(athlete.lastSessionDate),
    red: false,
  },
  {
    label: 'Lesiones',
    value: athlete.activeInjuries.length > 0 ? String(athlete.activeInjuries.length) : 'Ninguna',
    red: athlete.activeInjuries.length > 0,
  },
  {
    label: 'Próx. Comp.',
    value: nextComp ? nextComp.name : '—',
    red: false,
  },
  {
    label: 'Modalidad',
    value: modalityLabel ?? '—',
    red: false,
  },
  {
    label: 'Categoría',
    value: athlete.ageCategory ? (AGE_CATEGORY_LABELS[athlete.ageCategory] ?? athlete.ageCategory) : '—',
    red: false,
  },
  {
    label: 'Peso',
    value: athlete.weight != null ? `${athlete.weight} kg` : '—',
    red: false,
  },
]
```

- [ ] **Step 4: TypeScript check**

```bash
cd OssFlow-frontend && npx tsc --noEmit 2>&1 | head -20
```

Expected: sin errores.

- [ ] **Step 5: Commit**

```bash
cd OssFlow-frontend
git add src/features/coaching/components/AthleteProfileHeader.tsx
git commit -m "feat(coaching): show stripes bars, age category and weight in AthleteProfileHeader"
```

---

## Task 7: Frontend — ProfileEditPage (tab BJJ)

**Files:**
- Modify: `OssFlow-frontend/src/features/identity/profile/pages/ProfileEditPage.tsx`

- [ ] **Step 1: Añadir constantes de categoría de edad y stripes**

Al principio del archivo, junto a `BELTS` y `MODALITIES`:

```typescript
const AGE_CATEGORIES = [
  { value: 'ADULT',    label: 'Adulto' },
  { value: 'JUVENILE', label: 'Juvenil' },
  { value: 'MASTER_1', label: 'Master 1' },
  { value: 'MASTER_2', label: 'Master 2' },
  { value: 'MASTER_3', label: 'Master 3' },
  { value: 'MASTER_4', label: 'Master 4' },
]

const STRIPES_OPTIONS = [0, 1, 2, 3, 4] as const
```

- [ ] **Step 2: Añadir campos al defaultValues del useForm**

En `useForm<UpdateProfileForm>`, añadir a `defaultValues`:

```typescript
defaultValues: {
  firstName: '',
  lastName: '',
  displayName: '',
  currentBelt: '',
  preferredModality: '',
  academy: '',
  beltSince: '',
  ageCategory: null,   // nuevo
  stripes: null,       // nuevo
  weight: null,        // nuevo
},
```

- [ ] **Step 3: Rellenar los nuevos campos en el useEffect de reset**

```typescript
useEffect(() => {
  if (profile) {
    reset({
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      displayName: profile.alias ?? profile.displayName ?? '',
      currentBelt: profile.currentBelt ?? '',
      preferredModality: profile.preferredModality ?? '',
      academy: profile.academy ?? '',
      beltSince: profile.beltSince ?? '',
      ageCategory: profile.ageCategory ?? null,   // nuevo
      stripes: profile.stripes ?? null,            // nuevo
      weight: profile.weight ?? null,              // nuevo
    })
  }
}, [profile, reset])
```

- [ ] **Step 4: Añadir los campos al payload de onSubmitBjj**

```typescript
function onSubmitBjj(data: UpdateProfileForm) {
  const payload = {
    displayName: data.displayName,
    currentBelt: data.currentBelt,
    preferredModality: data.preferredModality,
    academy: data.academy || undefined,
    beltSince: data.beltSince || undefined,
    ageCategory: data.ageCategory || null,   // nuevo
    stripes: data.stripes ?? null,           // nuevo
    weight: data.weight ?? null,             // nuevo
  }
  if (profile) {
    updateProfile.mutate(payload, { onSuccess: () => navigate('/profile') })
  } else {
    createProfile.mutate(payload, { onSuccess: () => navigate('/profile') })
  }
}
```

- [ ] **Step 5: Añadir los controles UI en el tab "Perfil BJJ"**

Buscar en el JSX donde está el selector de cinturón (`currentBelt`) y `beltSince`. Justo debajo de `beltSince`, añadir los tres campos nuevos usando los componentes `Label`, `Input`, `CardSection` ya existentes en el archivo:

```tsx
{/* Grados (stripes) */}
<div>
  <Label>Grados (stripes)</Label>
  <Controller
    name="stripes"
    control={control}
    render={({ field }) => (
      <div className="flex gap-2">
        {STRIPES_OPTIONS.map(n => (
          <button
            key={n}
            type="button"
            onClick={() => field.onChange(field.value === n ? null : n)}
            className={`w-12 h-10 border text-xs font-mono font-bold transition-colors flex flex-col items-center justify-center gap-1 ${
              field.value === n
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:border-foreground/50'
            }`}
          >
            <span>{n}</span>
            <span className="flex gap-[2px]">
              {[0,1,2,3].map(i => (
                <span
                  key={i}
                  className="w-1 h-[6px] rounded-[1px]"
                  style={{
                    background: i < n
                      ? (field.value === n ? 'currentColor' : 'var(--foreground)')
                      : 'var(--border)',
                  }}
                />
              ))}
            </span>
          </button>
        ))}
      </div>
    )}
  />
  {errors.stripes && <p className="text-[9px] text-destructive mt-1" style={MONO}>{errors.stripes.message}</p>}
</div>

{/* Categoría de edad */}
<div>
  <Label>Categoría de edad</Label>
  <Controller
    name="ageCategory"
    control={control}
    render={({ field }) => (
      <Select onValueChange={v => field.onChange(v === 'none' ? null : v)} value={field.value ?? 'none'}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecciona categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Sin especificar</SelectItem>
          {AGE_CATEGORIES.map(c => (
            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    )}
  />
</div>

{/* Peso */}
<div>
  <Label>Peso</Label>
  <div className="flex">
    <Input
      type="number"
      min={30}
      max={180}
      step={0.5}
      placeholder="ej. 76"
      className="flex-1"
      {...register('weight', { valueAsNumber: true })}
      error={errors.weight?.message}
    />
    <span className="px-3 flex items-center border border-l-0 border-border text-xs text-muted-foreground bg-muted" style={MONO}>
      kg
    </span>
  </div>
</div>
```

- [ ] **Step 6: TypeScript check**

```bash
cd OssFlow-frontend && npx tsc --noEmit 2>&1 | head -20
```

Expected: sin errores.

- [ ] **Step 7: Commit**

```bash
cd OssFlow-frontend
git add src/features/identity/profile/pages/ProfileEditPage.tsx
git commit -m "feat(profile): add stripes, age category and weight fields to ProfileEditPage BJJ tab"
```

---

## Task 8: Frontend — OnboardingPage (step 2)

**Files:**
- Modify: `OssFlow-frontend/src/pages/OnboardingPage.tsx`

- [ ] **Step 1: Actualizar step1Schema con los nuevos campos**

```typescript
const step1Schema = z.object({
  firstName: z.string().max(80).optional(),
  lastName: z.string().max(80).optional(),
  displayName: z.string().min(1, 'El alias es requerido').max(120),
  currentBelt: z.string().min(1, 'El cinturón es requerido'),
  preferredModality: z.string().min(1, 'La modalidad es requerida'),
  academy: z.string().max(200).optional(),
  ageCategory: z.string().nullable().optional(),
  stripes: z.number().int().min(0).max(4).nullable().optional(),
  weight: z.number().min(30).max(180).nullable().optional(),
})

type Step1Form = z.infer<typeof step1Schema>
```

- [ ] **Step 2: Añadir los campos a OnboardingData y al estado inicial**

```typescript
type OnboardingData = {
  firstName?: string
  lastName?: string
  displayName: string
  currentBelt: string
  preferredModality: string
  academy?: string
  ageCategory?: string | null   // nuevo
  stripes?: number | null       // nuevo
  weight?: number | null        // nuevo
  federations: FederationAssignment[]
  weeklyTemplateSet: boolean
}
```

En el `useState` inicial:

```typescript
const [data, setDataRaw] = useState<OnboardingData>(persisted?.data ?? {
  ...
  ageCategory: null,    // nuevo
  stripes: null,        // nuevo
  weight: null,         // nuevo
  federations: [],
  weeklyTemplateSet: false,
})
```

- [ ] **Step 3: Añadir los nuevos campos al defaultValues del useForm**

```typescript
const { register, handleSubmit, control, formState: { errors } } = useForm<Step1Form>({
  resolver: zodResolver(step1Schema),
  defaultValues: {
    firstName: data.firstName,
    lastName: data.lastName,
    displayName: data.displayName,
    currentBelt: data.currentBelt,
    preferredModality: data.preferredModality,
    academy: data.academy,
    ageCategory: data.ageCategory ?? null,  // nuevo
    stripes: data.stripes ?? null,          // nuevo
    weight: data.weight ?? null,            // nuevo
  },
})
```

- [ ] **Step 4: Añadir constantes AGE_CATEGORIES y STRIPES_OPTIONS**

Al principio del archivo, junto a `BELTS` y `MODALITIES`:

```typescript
const AGE_CATEGORIES = [
  { value: 'ADULT',    label: 'Adulto' },
  { value: 'JUVENILE', label: 'Juvenil' },
  { value: 'MASTER_1', label: 'Master 1' },
  { value: 'MASTER_2', label: 'Master 2' },
  { value: 'MASTER_3', label: 'Master 3' },
  { value: 'MASTER_4', label: 'Master 4' },
]

const STRIPES_OPTIONS = [0, 1, 2, 3, 4] as const
```

- [ ] **Step 5: Añadir los controles UI en el step 2 del form**

Buscar el JSX del step 2 donde está el selector de cinturón y modalidad. Justo después del selector de `currentBelt`, añadir (usando el componente `FieldBlock` y el `Input` de este archivo):

```tsx
{/* Stripes */}
<FieldBlock label="Grados (stripes)" error={errors.stripes?.message}>
  <Controller
    name="stripes"
    control={control}
    render={({ field }) => (
      <div className="flex gap-2">
        {STRIPES_OPTIONS.map(n => (
          <button
            key={n}
            type="button"
            onClick={() => field.onChange(field.value === n ? null : n)}
            className={`w-12 h-10 border text-xs font-mono font-bold transition-colors flex flex-col items-center justify-center gap-1 ${
              field.value === n
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:border-foreground/50'
            }`}
          >
            <span>{n}</span>
            <span className="flex gap-[2px]">
              {[0,1,2,3].map(i => (
                <span
                  key={i}
                  className="w-1 h-[6px] rounded-[1px]"
                  style={{
                    background: i < n
                      ? (field.value === n ? 'currentColor' : 'var(--foreground)')
                      : 'var(--border)',
                  }}
                />
              ))}
            </span>
          </button>
        ))}
      </div>
    )}
  />
</FieldBlock>

{/* Categoría de edad */}
<FieldBlock label="Categoría de edad" error={errors.ageCategory?.message}>
  <Controller
    name="ageCategory"
    control={control}
    render={({ field }) => (
      <Select onValueChange={v => field.onChange(v === 'none' ? null : v)} value={field.value ?? 'none'}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecciona categoría (opcional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Sin especificar</SelectItem>
          {AGE_CATEGORIES.map(c => (
            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    )}
  />
</FieldBlock>

{/* Peso */}
<FieldBlock label="Peso (opcional)" error={errors.weight?.message}>
  <div className="flex">
    <Input
      type="number"
      min={30}
      max={180}
      step={0.5}
      placeholder="ej. 76"
      {...register('weight', { valueAsNumber: true })}
    />
    <span className="px-3 flex items-center border border-l-0 border-border text-xs text-muted-foreground bg-muted shrink-0" style={MONO}>
      kg
    </span>
  </div>
</FieldBlock>
```

- [ ] **Step 6: Pasar los nuevos campos a handleFinish → createProfile**

```typescript
const handleFinish = async () => {
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ')
  await createProfile.mutateAsync({
    firstName: data.firstName || undefined,
    lastName: data.lastName || undefined,
    alias: data.displayName || undefined,
    displayName: fullName || data.displayName,
    currentBelt: data.currentBelt,
    preferredModality: data.preferredModality,
    academy: data.academy || undefined,
    ageCategory: data.ageCategory || null,   // nuevo
    stripes: data.stripes ?? null,           // nuevo
    weight: data.weight ?? null,             // nuevo
  })
  if (data.federations.length > 0) {
    await replaceFederations(data.federations)
  }
  clearOnboarding()
  navigate('/', { replace: true })
}
```

- [ ] **Step 7: TypeScript check**

```bash
cd OssFlow-frontend && npx tsc --noEmit 2>&1 | head -20
```

Expected: sin errores.

- [ ] **Step 8: Commit**

```bash
cd OssFlow-frontend
git add src/pages/OnboardingPage.tsx
git commit -m "feat(onboarding): add stripes, age category and weight to step 2"
```

---

## Task 9: Frontend — ProfilePage (visualización propia)

**Files:**
- Modify: `OssFlow-frontend/src/features/identity/profile/pages/ProfilePage.tsx`

- [ ] **Step 1: Añadir stripes en el chip de cinturón propio**

Buscar en `ProfilePage.tsx` donde se renderiza el cinturón del usuario (buscar `currentBelt`). Añadir las barras de stripes junto al chip, usando el mismo componente `StripeBars` — o inline si el componente no es accesible desde este archivo. Crear una función local `StripeBars` idéntica a la de `AthleteProfileHeader`:

```tsx
function StripeBars({ stripes }: { stripes: number | null | undefined }) {
  const count = stripes ?? 0
  return (
    <span className="inline-flex gap-[2px] items-center ml-0.5">
      {[0, 1, 2, 3].map(i => (
        <span
          key={i}
          className="w-1 rounded-[1px]"
          style={{
            height: '11px',
            background: i < count ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.20)',
          }}
        />
      ))}
    </span>
  )
}
```

Añadir `<StripeBars stripes={profile.stripes} />` dentro del chip de cinturón existente.

- [ ] **Step 2: Mostrar categoría de edad y peso en la sección de stats**

Buscar en `ProfilePage.tsx` la sección de stats (donde aparece modalidad, academia, etc.). Añadir dos entradas más:

```tsx
{profile.ageCategory && (
  <div className="...">  {/* misma clase que las otras stats */}
    <span className="...">Categoría</span>
    <span>{AGE_CATEGORY_LABELS[profile.ageCategory] ?? profile.ageCategory}</span>
  </div>
)}
{profile.weight != null && (
  <div className="...">
    <span className="...">Peso</span>
    <span>{profile.weight} kg</span>
  </div>
)}
```

Añadir la constante `AGE_CATEGORY_LABELS` al inicio del archivo (mismos valores que en `AthleteProfileHeader`):

```typescript
const AGE_CATEGORY_LABELS: Record<string, string> = {
  JUVENILE: 'Juvenil',
  ADULT:    'Adulto',
  MASTER_1: 'Master 1',
  MASTER_2: 'Master 2',
  MASTER_3: 'Master 3',
  MASTER_4: 'Master 4',
}
```

- [ ] **Step 3: TypeScript check**

```bash
cd OssFlow-frontend && npx tsc --noEmit 2>&1 | head -20
```

Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
cd OssFlow-frontend
git add src/features/identity/profile/pages/ProfilePage.tsx
git commit -m "feat(profile): show stripes bars, age category and weight in ProfilePage"
```

---

## Task 10: Verificación end-to-end y deploy

- [ ] **Step 1: Arrancar backend y frontend en local**

```bash
# Terminal 1
cd OssFlow && ./mvnw spring-boot:run

# Terminal 2
cd OssFlow-frontend && npm run dev
```

- [ ] **Step 2: Verificar como atleta**

1. Login como atleta (`athlete@demo.com` / `Demo1234!`)
2. Ir a `/profile/edit` → tab "Perfil BJJ"
3. Seleccionar 2 stripes, categoría "Adulto", peso 76.5 → Guardar
4. Ir a `/profile` → verificar que aparecen: chip con 2 barras rellenas, "Adulto", "76.5 kg"

- [ ] **Step 3: Verificar como maestro**

1. Login como maestro (`coach@demo.com` / `Demo1234!`)
2. Ir a `/gimnasio/atletas/:id` del atleta que acaba de actualizar su perfil
3. Verificar en el header: chip de cinturón con 2 barras, stats con "Categoría: Adulto" y "Peso: 76.5 kg"

- [ ] **Step 4: Verificar onboarding**

1. Con una cuenta nueva (o en modo incógnito), completar el onboarding
2. En step 2, rellenar stripes=3, categoría=Master 1, peso=82
3. Completar hasta el final y verificar que el perfil quedó guardado correctamente

- [ ] **Step 5: Push y deploy**

```bash
cd OssFlow-frontend && git push origin feature/maestro-atleta
cd ../OssFlow && git push origin feature/maestro-atleta
```

Esperar CI verde → `ssh root@10.10.100.15 "cd /home/ossflow/ossflow-deploy && docker compose pull && docker compose up -d"`

---

## Self-review

**Spec coverage:**
- ✅ `stripes` (0-4): migración V269, dominio, entity, adapter, DTO request/response, AthleteSummaryResponse, AthleteProfileComposer, types TS, schema, ProfileEditPage, OnboardingPage, AthleteProfileHeader (barras), ProfilePage
- ✅ `ageCategory`: ya existe en BD y dominio → solo falta en DTOs request (añadido en Task 3), forms (Tasks 7-8), header (Task 6), ProfilePage (Task 9)
- ✅ `weight`: migración V269, mismo flujo que stripes
- ✅ Visualización barras en header del atleta (maestro ve)
- ✅ Formulario con selector 0-4 (barras mini) + select edad + input peso
- ✅ Atleta solo edita, maestro solo ve
- ✅ Onboarding step 2 incluye los tres campos

**Placeholders:** ninguno detectado — todos los pasos tienen código concreto.

**Consistencia de tipos:** `stripes: number | null` en TS ↔ `Integer` en Java ↔ `SMALLINT` en SQL. `weight: number | null` en TS ↔ `Double` en Java ↔ `NUMERIC(5,2)` en SQL. Consistente en todos los tasks.
