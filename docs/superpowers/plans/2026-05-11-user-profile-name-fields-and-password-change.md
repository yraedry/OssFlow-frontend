# User Profile Name Fields & Password Change Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add firstName/lastName/alias fields to UserProfile backend+frontend, activate password-change endpoint, add GET /auth/me, fix HomePage greeting to be dynamic, and improve onboarding federation step UX.

**Architecture:** Backend uses hexagonal architecture (domain → application → infrastructure). New DB fields added via Flyway migration V249. MapStruct mappers auto-map by name so only entity/domain/DTO record fields need updating. Two new controller endpoints (POST /api/auth/change-password, GET /api/auth/me) added to AuthController with a new AuthService method. Frontend reads new fields from profile response and uses them in HomePage and ProfileEditPage; password change uses a separate react-hook-form instance submitting to the new endpoint.

**Tech Stack:** Java 17, Spring Boot 3, MapStruct, Flyway, JPA/Hibernate; React 18, TypeScript, react-hook-form, zod, @tanstack/react-query, ky (apiClient)

---

## Files to create or modify

### Backend
- **Create:** `src/main/resources/db/migration/V249__user_profile_name_fields.sql`
- **Modify:** `src/main/java/com/ossflow/identity/profile/infrastructure/persistence/UserProfileEntity.java` — add 3 new JPA columns
- **Modify:** `src/main/java/com/ossflow/identity/profile/domain/UserProfile.java` — add 3 fields to record
- **Modify:** `src/main/java/com/ossflow/identity/profile/infrastructure/web/dto/UpdateUserProfileRequest.java` — add 3 fields
- **Modify:** `src/main/java/com/ossflow/identity/profile/infrastructure/web/dto/CreateUserProfileRequest.java` — add 3 fields
- **Modify:** `src/main/java/com/ossflow/identity/profile/infrastructure/web/dto/UserProfileResponse.java` — add 3 fields
- **Create:** `src/main/java/com/ossflow/identity/auth/infrastructure/web/dto/ChangePasswordRequest.java`
- **Create:** `src/main/java/com/ossflow/identity/auth/infrastructure/web/dto/MeResponse.java`
- **Modify:** `src/main/java/com/ossflow/identity/auth/application/AuthService.java` — add changePassword() method
- **Modify:** `src/main/java/com/ossflow/identity/auth/infrastructure/web/AuthController.java` — add POST /change-password and GET /me endpoints

### Frontend
- **Modify:** `src/features/identity/profile/types.ts` — add firstName?, lastName?, alias? to UserProfile; add fields to UpdateProfileRequest
- **Modify:** `src/pages/HomePage.tsx` — import useProfile, use alias/displayName in greeting
- **Modify:** `src/features/identity/profile/pages/ProfileEditPage.tsx` — fix reset() call, fix onSubmitAccount payload, add password change form
- **Modify:** `src/pages/OnboardingPage.tsx` — improve federation step UX

---

## Task 1: Flyway migration V249

**Files:**
- Create: `OssFlow/src/main/resources/db/migration/V249__user_profile_name_fields.sql`

- [ ] **Step 1: Create the migration file**

```sql
ALTER TABLE user_profile
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(80),
  ADD COLUMN IF NOT EXISTS last_name  VARCHAR(80),
  ADD COLUMN IF NOT EXISTS alias      VARCHAR(60) UNIQUE;
```

- [ ] **Step 2: Verify it compiles with the build (no test run yet — just ensure migration file is valid SQL)**

No command needed — Flyway validates on startup.

---

## Task 2: Backend — update UserProfileEntity, domain, DTOs

**Files:**
- Modify: `OssFlow/src/main/java/com/ossflow/identity/profile/infrastructure/persistence/UserProfileEntity.java`
- Modify: `OssFlow/src/main/java/com/ossflow/identity/profile/domain/UserProfile.java`
- Modify: `OssFlow/src/main/java/com/ossflow/identity/profile/infrastructure/web/dto/UpdateUserProfileRequest.java`
- Modify: `OssFlow/src/main/java/com/ossflow/identity/profile/infrastructure/web/dto/CreateUserProfileRequest.java`
- Modify: `OssFlow/src/main/java/com/ossflow/identity/profile/infrastructure/web/dto/UserProfileResponse.java`

- [ ] **Step 1: Add columns to UserProfileEntity**

After `private String displayName;` block, add:

```java
@Column(name = "first_name", length = 80)
private String firstName;

@Column(name = "last_name", length = 80)
private String lastName;

@Column(name = "alias", length = 60, unique = true)
private String alias;
```

- [ ] **Step 2: Add fields to UserProfile domain record**

After `String displayName,` add:

```java
String firstName,
String lastName,
String alias,
```

- [ ] **Step 3: Add fields to UpdateUserProfileRequest**

```java
public record UpdateUserProfileRequest(
        @Size(max = 120) String displayName,
        @Size(max = 80) String firstName,
        @Size(max = 80) String lastName,
        @Size(max = 60) String alias,
        @Size(max = 15) String currentBelt,
        LocalDate beltSince,
        @Size(max = 200) String academy,
        @Size(max = 10) String preferredModality
) {}
```

- [ ] **Step 4: Add fields to CreateUserProfileRequest**

```java
public record CreateUserProfileRequest(
        @NotBlank @Size(max = 120) String displayName,
        @Size(max = 80) String firstName,
        @Size(max = 80) String lastName,
        @Size(max = 60) String alias,
        @NotBlank @Size(max = 15) String currentBelt,
        LocalDate beltSince,
        @Size(max = 200) String academy,
        @NotBlank @Size(max = 10) String preferredModality
) {}
```

- [ ] **Step 5: Add fields to UserProfileResponse**

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
        boolean onboardingCompleted,
        List<UserProfileFederationResponse> federations,
        Instant createdAt,
        Instant updatedAt,
        Long version
) {}
```

- [ ] **Step 6: No mapper changes needed**

MapStruct maps by field name automatically. `UserProfilePersistenceMapper` and `UserProfileWebMapper` will pick up the new fields because they are named identically in entity, domain record, and response/request DTOs.

---

## Task 3: Backend — ChangePasswordRequest DTO, MeResponse DTO, AuthService.changePassword(), AuthController endpoints

**Files:**
- Create: `OssFlow/src/main/java/com/ossflow/identity/auth/infrastructure/web/dto/ChangePasswordRequest.java`
- Create: `OssFlow/src/main/java/com/ossflow/identity/auth/infrastructure/web/dto/MeResponse.java`
- Modify: `OssFlow/src/main/java/com/ossflow/identity/auth/application/AuthService.java`
- Modify: `OssFlow/src/main/java/com/ossflow/identity/auth/infrastructure/web/AuthController.java`

- [ ] **Step 1: Create ChangePasswordRequest DTO**

```java
package com.ossflow.identity.auth.infrastructure.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
    @NotBlank @Size(min = 8) String currentPassword,
    @NotBlank @Size(min = 8)
    @Pattern(regexp = ".*[A-Z].*", message = "Debe contener al menos una mayúscula")
    @Pattern(regexp = ".*[0-9].*", message = "Debe contener al menos un número")
    String newPassword
) {}
```

- [ ] **Step 2: Create MeResponse DTO**

```java
package com.ossflow.identity.auth.infrastructure.web.dto;

public record MeResponse(Long id, String email, String provider) {}
```

- [ ] **Step 3: Add changePassword() to AuthService**

Add this method after `resetPassword()`:

```java
@Transactional
public void changePassword(Long accountId, String currentPassword, String newPassword) {
    AccountEntity account = ((com.ossflow.identity.auth.infrastructure.persistence.AccountJpaRepository)
            ((com.ossflow.identity.auth.infrastructure.persistence.AccountPersistenceAdapter) accountRepository)
            .getRepository()).findById(accountId)
            .orElseThrow(() -> new IllegalStateException("Account not found"));
    if (!passwordEncoder.matches(currentPassword, account.getPasswordHash())) {
        throw new com.ossflow.shared.exception.BadRequestException("WRONG_PASSWORD", "Contraseña actual incorrecta");
    }
    account.setPasswordHash(passwordEncoder.encode(newPassword));
    // save via repository port to keep architecture clean
    accountRepository.save(new Account(account.getId(), account.getEmail(), account.getPasswordHash(),
            account.getProvider(), account.getProviderId(), account.isEmailVerified(),
            account.getTokenVersion(), account.getCreatedAt(), account.getUpdatedAt()));
}
```

NOTE: The AccountPersistenceAdapter wraps AccountJpaRepository. We should use the repository port. Check how AccountPersistenceAdapter works — it likely has `findById`. The cleanest way is:

```java
@Transactional
public void changePassword(Long accountId, String currentPassword, String newPassword) {
    Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new NotFoundException("ACCOUNT_NOT_FOUND", "Cuenta no encontrada"));
    if (account.passwordHash() == null || !passwordEncoder.matches(currentPassword, account.passwordHash())) {
        throw new BadRequestException("WRONG_PASSWORD", "Contraseña actual incorrecta");
    }
    String newHash = passwordEncoder.encode(newPassword);
    accountRepository.save(new Account(account.id(), account.email(), newHash,
            account.provider(), account.providerId(), account.emailVerified(),
            account.tokenVersion(), account.createdAt(), account.updatedAt()));
}
```

- [ ] **Step 4: Add POST /change-password and GET /me to AuthController**

Add these two methods before the private helper methods:

```java
@PostMapping("/change-password")
public ResponseEntity<Void> changePassword(
        @Valid @RequestBody ChangePasswordRequest request,
        org.springframework.security.core.Authentication authentication) {
    com.ossflow.identity.auth.infrastructure.security.AccountPrincipal principal =
            (com.ossflow.identity.auth.infrastructure.security.AccountPrincipal) authentication.getPrincipal();
    authService.changePassword(principal.id(), request.currentPassword(), request.newPassword());
    return ResponseEntity.noContent().build();
}

@GetMapping("/me")
public ResponseEntity<MeResponse> me(
        org.springframework.security.core.Authentication authentication) {
    com.ossflow.identity.auth.infrastructure.security.AccountPrincipal principal =
            (com.ossflow.identity.auth.infrastructure.security.AccountPrincipal) authentication.getPrincipal();
    var account = authService.findAccountById(principal.id());
    return ResponseEntity.ok(new MeResponse(account.id(), account.email(), account.provider().name()));
}
```

Also add `findAccountById()` to AuthService:

```java
public Account findAccountById(Long id) {
    return accountRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("ACCOUNT_NOT_FOUND", "Cuenta no encontrada"));
}
```

- [ ] **Step 5: Run backend tests**

```bash
cd /Users/adrian/Programacion/repositorio/ossflow/OssFlow && ./mvnw test -q 2>&1 | tail -20
```

Expected: BUILD SUCCESS

- [ ] **Step 6: Commit backend changes**

```bash
cd /Users/adrian/Programacion/repositorio/ossflow/OssFlow
git add src/main/resources/db/migration/V249__user_profile_name_fields.sql \
  src/main/java/com/ossflow/identity/profile/infrastructure/persistence/UserProfileEntity.java \
  src/main/java/com/ossflow/identity/profile/domain/UserProfile.java \
  src/main/java/com/ossflow/identity/profile/infrastructure/web/dto/UpdateUserProfileRequest.java \
  src/main/java/com/ossflow/identity/profile/infrastructure/web/dto/CreateUserProfileRequest.java \
  src/main/java/com/ossflow/identity/profile/infrastructure/web/dto/UserProfileResponse.java \
  src/main/java/com/ossflow/identity/auth/infrastructure/web/dto/ChangePasswordRequest.java \
  src/main/java/com/ossflow/identity/auth/infrastructure/web/dto/MeResponse.java \
  src/main/java/com/ossflow/identity/auth/application/AuthService.java \
  src/main/java/com/ossflow/identity/auth/infrastructure/web/AuthController.java
git commit -m "feat(identity): add firstName/lastName/alias to user_profile; add change-password and /me endpoints"
```

---

## Task 4: Frontend — update UserProfile types

**Files:**
- Modify: `OssFlow-frontend/src/features/identity/profile/types.ts`

- [ ] **Step 1: Add new fields to UserProfile type and UpdateProfileRequest**

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
  onboardingCompleted: boolean
  federations: ProfileFederationEntry[]
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
}
```

---

## Task 5: Frontend — dynamic greeting in HomePage

**Files:**
- Modify: `OssFlow-frontend/src/pages/HomePage.tsx`

- [ ] **Step 1: Add useProfile import and usage**

At top of file, add import:
```tsx
import { useProfile } from '@/features/identity/profile/hooks'
```

Inside `HomePage` function, after the existing hooks, add:
```tsx
const { data: profile } = useProfile()
```

- [ ] **Step 2: Replace hardcoded greeting**

Change:
```tsx
{getGreeting(today.getHours())}, Adrián.
```

To:
```tsx
{getGreeting(today.getHours())}{profile?.alias ? `, ${profile.alias}` : profile?.displayName ? `, ${profile.displayName}` : ''}.
```

---

## Task 6: Frontend — fix ProfileEditPage reset and onSubmitAccount

**Files:**
- Modify: `OssFlow-frontend/src/features/identity/profile/pages/ProfileEditPage.tsx`

- [ ] **Step 1: Fix the useEffect reset call to use profile fields**

Replace the current `useEffect` that calls `reset()`:
```tsx
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
    })
  }
}, [profile, reset])
```

- [ ] **Step 2: Fix onSubmitAccount to send firstName, lastName, alias**

Replace the current `onSubmitAccount` function:
```tsx
function onSubmitAccount(data: UpdateProfileForm) {
  const payload = {
    firstName: data.firstName || undefined,
    lastName: data.lastName || undefined,
    alias: data.displayName,  // the "Alias" field maps to alias in backend
    displayName: [data.firstName, data.lastName].filter(Boolean).join(' ') || data.displayName,
    currentBelt: profile?.currentBelt ?? 'WHITE',
    preferredModality: profile?.preferredModality ?? 'GI',
    academy: profile?.academy || undefined,
    beltSince: profile?.beltSince || undefined,
  }
  if (profile) {
    updateProfile.mutate(payload, { onSuccess: () => navigate('/profile') })
  } else {
    createProfile.mutate(payload, { onSuccess: () => navigate('/profile') })
  }
}
```

---

## Task 7: Frontend — activate password change section in ProfileEditPage

**Files:**
- Modify: `OssFlow-frontend/src/features/identity/profile/pages/ProfileEditPage.tsx`

- [ ] **Step 1: Add imports for zod, useQuery, apiClient, useAuthStore at top of file**

Add to existing imports:
```tsx
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { useAuthStore } from '@/features/auth/store/authStore'
```

- [ ] **Step 2: Add changePasswordSchema and ChangePasswordForm type**

After the existing `MODALITIES` const, add:
```tsx
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Requerido'),
  newPassword: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
})
type ChangePasswordForm = z.infer<typeof changePasswordSchema>
```

- [ ] **Step 3: Add second useForm and accountData query inside ProfileEditPage component**

After existing `useForm` setup, add:
```tsx
const { register: regPwd, handleSubmit: handlePwd, formState: { errors: pwdErrors }, setError: setPwdError, reset: resetPwd } = useForm<ChangePasswordForm>({
  resolver: zodResolver(changePasswordSchema),
})

const { data: accountData } = useQuery({
  queryKey: ['account-me'],
  queryFn: () => apiClient.get('auth/me').json<{ id: number; email: string; provider: string }>(),
})
```

- [ ] **Step 4: Add onSubmitPassword function**

After `onSubmitAccount` function, add:
```tsx
async function onSubmitPassword(data: ChangePasswordForm) {
  try {
    await apiClient.post('auth/change-password', { json: data })
    resetPwd()
    toast.success('Contraseña actualizada')
  } catch {
    setPwdError('currentPassword', { message: 'Contraseña actual incorrecta' })
  }
}
```

Note: need `import { toast } from 'sonner'` — check if already imported. If not, add it.

- [ ] **Step 5: Update the "Credenciales de acceso" CardSection**

Replace the entire `<CardSection title="Credenciales de acceso">` block with:

```tsx
<CardSection title="Credenciales de acceso">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <Label>Email</Label>
      <Input
        type="email"
        disabled
        value={accountData?.email ?? ''}
        placeholder="email@ejemplo.com"
        readOnly
      />
      {accountData?.provider && accountData.provider !== 'LOCAL' && (
        <p className="text-[9px] text-muted-foreground mt-1" style={MONO}>
          Cuenta vinculada con {accountData.provider.toLowerCase()}
        </p>
      )}
    </div>
  </div>
  {(!accountData?.provider || accountData.provider === 'LOCAL') && (
    <form onSubmit={handlePwd(onSubmitPassword)} className="mt-4">
      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-3 pb-3 border-b border-border" style={MONO}>Cambiar contraseña</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Contraseña actual</Label>
          <div className="relative">
            <Input
              {...regPwd('currentPassword')}
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              error={pwdErrors.currentPassword?.message}
            />
            <button type="button" onClick={() => setShowPass(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPass ? <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} /> : <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />}
            </button>
          </div>
        </div>
        <div>
          <Label>Nueva contraseña</Label>
          <Input
            {...regPwd('newPassword')}
            type="password"
            placeholder="••••••••"
            error={pwdErrors.newPassword?.message}
          />
        </div>
      </div>
      <BtnRow>
        <button type="submit"
          className="px-5 py-2.5 bg-foreground text-background text-[10px] font-bold uppercase tracking-wide hover:opacity-85 transition-opacity disabled:opacity-50 cursor-pointer" style={MONO}>
          Cambiar contraseña
        </button>
      </BtnRow>
    </form>
  )}
</CardSection>
```

---

## Task 8: Frontend — improve OnboardingPage federation step UX

**Files:**
- Modify: `OssFlow-frontend/src/pages/OnboardingPage.tsx`

- [ ] **Step 1: Update the step 2 block**

Replace the `{step === 2 && (` block's inner content:

Change the existing explanatory text and add a "Saltar" button:

```tsx
{step === 2 && (
  <div className="space-y-4">
    <div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1" style={MONO}>
        Federaciones
      </p>
      <p className="text-xs text-muted-foreground mb-3" style={MONO}>
        ¿Con qué federaciones compites? (opcional — puedes añadirlas más tarde desde tu perfil)
      </p>
      {loadingFeds ? (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      ) : (
        <FederationSelector
          federations={federations ?? []}
          selected={data.federations}
          onChange={(selected) => setData((prev) => ({ ...prev, federations: selected }))}
        />
      )}
    </div>
    <div className="flex gap-3">
      <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Atrás</Button>
      <Button className="flex-1" onClick={() => setStep(3)}>Siguiente</Button>
    </div>
    <button
      type="button"
      onClick={() => { setData(prev => ({ ...prev, federations: [] })); setStep(3) }}
      className="w-full text-center text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors cursor-pointer"
      style={MONO}
    >
      Saltar este paso
    </button>
  </div>
)}
```

---

## Task 9: Frontend — build verification and commit

- [ ] **Step 1: Run frontend build**

```bash
cd /Users/adrian/Programacion/repositorio/ossflow/OssFlow-frontend && npm run build 2>&1 | tail -20
```

Expected: no TypeScript errors, build succeeds.

- [ ] **Step 2: Commit frontend changes**

```bash
cd /Users/adrian/Programacion/repositorio/ossflow/OssFlow-frontend
git add src/features/identity/profile/types.ts \
  src/pages/HomePage.tsx \
  src/features/identity/profile/pages/ProfileEditPage.tsx \
  src/pages/OnboardingPage.tsx
git commit -m "feat(frontend): dynamic greeting, profile name fields, password change, onboarding UX"
```

---

## Task 10: Push both repos

- [ ] **Step 1: Push backend**

```bash
cd /Users/adrian/Programacion/repositorio/ossflow/OssFlow && git push origin feature/auth
```

- [ ] **Step 2: Push frontend**

```bash
cd /Users/adrian/Programacion/repositorio/ossflow/OssFlow-frontend && git push origin feature/auth
```
