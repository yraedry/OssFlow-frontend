# Plan de mejoras OssFlow — Seguridad, arquitectura, CI/CD

**Fecha:** 2026-05-11
**Rama base:** `feature/auth`
**Estado actual:** auditoría completa (backend + frontend + CI/CD), 15 críticos detectados.
**Objetivo:** llevar a `feature/auth` a estado mergeable a `main` con seguridad, KISS/SOLID, BD coherente y CI/CD fiable. TFG-grade.

---

## Principios

1. **KISS:** mínima superficie de cambio. Cada fix toca lo necesario, sin refactors paralelos.
2. **SOLID:** separación clara de capas hexagonales (`domain → application → infrastructure`). No introducir nuevas god classes.
3. **Defense in depth:** no confiar en una sola capa. Si `@PreAuthorize` falla, el service filtra por `ownerId`. Si el service falla, la BD tiene un constraint.
4. **Tests primero para lógica crítica:** auth, rate limiting, OAuth2 linking, refresh rotation. Mínimo 70% coverage en `identity/auth/application/**` y `identity/auth/infrastructure/security/**` (sin exclusiones JaCoCo para estos paths).
5. **No romper compatibilidad con datos existentes en LXC y prod.** Migraciones Flyway aditivas (no destructivas) salvo donde sea inevitable, y documentadas.
6. **Variables de entorno > constantes en código.** Defaults seguros (Secure=true, fail-closed).

---

## Bloque A — CRÍTICO (bloquea merge a `main`)

### A1. Aislar catálogo público sin abusar de `owner_id = 1`

**Problema (C2 + C3 + A8):** `WHERE (owner_id = :ownerId OR owner_id = 1)` mezcla datos privados del user demo con catálogo curado. `CurrentOwner.id()` cae a `1L` cuando no hay auth → cualquier bug expone datos del demo. `BaseEntity.ownerId = 1L` default agrava esto.

**Solución:**
- Añadir columna `visibility VARCHAR(16) NOT NULL DEFAULT 'PRIVATE'` con valores `PRIVATE`/`SYSTEM` a las tablas: `position`, `technique`, `system_definition`, `exercise`, `ruleset`, `federation`. Migración Flyway `V245__add_visibility_column.sql`.
- **Migración de datos defensiva** (NO usar heurística de fecha): marcar `visibility='SYSTEM'` solo a IDs que sabemos pertenecen a las V2xx_seed. Se hace por **lista explícita de nombres canónicos** generada de los seeds:
  ```sql
  -- Ejemplo position (extender por tabla):
  UPDATE position SET visibility = 'SYSTEM'
  WHERE owner_id = 1
    AND name IN (SELECT name FROM (VALUES ('Closed Guard'),('Half Guard'),...) AS seed(name));
  ```
  La lista se genera con un script Python/grep sobre los archivos `V2xx__seed_*.sql`. Si algún registro de owner_id=1 NO está en esa lista, queda como PRIVATE (caso de bug previo del user demo).
- Cambiar queries en JpaRepository: `WHERE (owner_id = :ownerId OR visibility = 'SYSTEM')`.
- `BaseEntity.ownerId` → quitar default `1L`. Que sea `null` y NOT NULL constraint falle ruidosamente en test.
- `CurrentOwner.id()` → si `Authentication` es `null`/anónimo, lanzar `IllegalStateException` ("ownerId requerido"). NO devolver `1L`.
- Tests: `CurrentOwnerTest` (lanza si anonymous, devuelve id si autenticado), `PositionRepositoryTest` (no ve técnicas privadas del user 1, sí ve SYSTEM, sí ve propias).

### A2. OAuth2 — validar `email_verified` + bloquear linking silencioso

**Problema (C4 + C5):** `OAuth2UserService` lee `email` sin verificar `email_verified`, y si existe cuenta local con ese email la "convierte" a Google sin confirmación → account takeover.

**Solución:**
- En `OAuth2UserService.loadUser()`:
  - Si `attributes.get("email_verified") != Boolean.TRUE`, lanzar `OAuth2AuthenticationException("EMAIL_NOT_VERIFIED")`.
  - Si existe `AccountEntity` con `email` Y `provider != GOOGLE`, lanzar `OAuth2AuthenticationException("ACCOUNT_EXISTS_DIFFERENT_PROVIDER")` con mensaje "ya existe una cuenta con email/contraseña — inicia sesión con tu contraseña primero".
  - El linking explícito (asociar Google a cuenta local) será una feature futura con confirmación por email; queda fuera de scope.
- `OAuth2FailureHandler` redirige a `/login?error=oauth_email_unverified` o `oauth_account_exists`.
- Frontend `LoginPage` muestra mensaje según query param.
- Tests: `OAuth2UserServiceTest` cubriendo los 3 paths (nuevo user verified, email_verified=false rechazado, cuenta local existente rechazada).

### A3. Cookie refresh — `Secure`/`SameSite` configurables, paths consistentes

**Problema (C7 + C8):** `cookie.setSecure(false)` hardcoded en `AuthController`. `setSecure(true)` en `OAuth2SuccessHandler`. Paths distintos (`/api/auth` vs `/api/auth/refresh`). Falta `SameSite`.

**Solución:**
- Property `app.cookie.secure: ${APP_COOKIE_SECURE:true}` (default secure) en `application.yml`.
- Property `app.cookie.same-site: ${APP_COOKIE_SAME_SITE:Lax}`.
- Property `app.cookie.path: /api/auth` (siempre, para que cubra `refresh`, `logout`, `me`).
- Property `app.refresh-token.expiry: ${APP_REFRESH_EXPIRY:2592000}` (30 días) — y leerla, no hardcodear `2592000` en `AuthController` (línea actual rompe SoT con `application.yml:67`).
- Usar `ResponseCookie.from(name, value).httpOnly(true).secure(secure).path(path).maxAge(expiry).sameSite(sameSite).build()` y `response.addHeader("Set-Cookie", cookie.toString())`. Esto da control sobre `SameSite` (que `jakarta.servlet.http.Cookie` no soporta nativo).
- LXC dev override: `APP_COOKIE_SECURE=false` en su docker-compose. Default sigue siendo true (fail-closed).
- Tests: `AuthControllerCookieTest` verificando atributos.

**Nota arquitectónica (prerequisito):** `SameSite=Lax` funciona porque frontend (nginx puerto 80) y backend (proxy_pass al contenedor backend) comparten origen via nginx en LXC y en prod. Si en el futuro se separa a subdominios (ej. `api.ossflow.com` vs `app.ossflow.com`), la cookie no se enviará en peticiones fetch cross-origin y habrá que cambiar a `SameSite=None; Secure`. Documentado para que el frontend nunca se despliegue en dominio distinto al backend sin revisar esta decisión.

### A4. Refresh token rotation con reuse detection + ventana de gracia (double-click)

**Problema (C6 + A1):** rotación revoca tokens, pero si reusan uno revocado simplemente devuelve 401 — no invalida el access token actual. Token version no incrementa al rotar. Además: double-click / retry de red dispara la segunda request con el mismo token ya revocado → reuse detection logout al usuario legítimo.

**Solución:**
- Migración `V246__refresh_token_chain.sql` añade `replaced_by_id BIGINT REFERENCES refresh_token(id)` a la tabla `refresh_token` existente (V243 NO la incluye — verificado: solo tiene `id, account_id, token_hash, token_version, expires_at, created_at, revoked_at`). `replaced_by_id` ES requerido para implementar la ventana de gracia (no es solo auditoría).
- En `refresh()`:
  - Buscar token por hash. Si no existe → 401.
  - Si `revoked_at IS NOT NULL`:
    - **Ventana de gracia (idempotencia):** si `revoked_at > now() - 5s` Y `replaced_by_id` apunta a un token aún válido (`revoked_at IS NULL`), devolver el access token correspondiente al `replaced_by_id` (re-emitir, NO crear nuevo). Esto cubre double-click y retries.
    - Si la ventana ya pasó O `replaced_by_id` también está revocado → **REUSE DETECTADO**: invalidar TODA la familia (UPDATE refresh_token SET revoked_at = now() WHERE account_id = :id AND revoked_at IS NULL), incrementar `account.token_version` (invalida access tokens vivos), devolver 401.
  - Si OK (no revocado): marcar como revoked, crear nuevo refresh_token con `replaced_by_id` referencia, devolver nuevo access+refresh.
- Tests: `AuthServiceRefreshTest` con 5 casos: (1) token válido rota normal, (2) reuse de token revocado >5s → invalida familia, (3) double-click <5s con replaced_by_id válido → devuelve el mismo nuevo token (idempotente), (4) token expirado 401, (5) account inexistente 401.

### A5. Cerrar `/actuator/**`

**Problema (C1):** `permitAll` en todos los actuators.

**Solución:**
- En `SecurityConfig`: `.requestMatchers("/actuator/health", "/actuator/info").permitAll()` y todo lo demás bajo `authenticated()` o restringido.
- `application.yml` ya limita `exposure.include: health,info`, pero defensa en profundidad.

### A6. `displayName` perdido en register

**Problema (B6):** `RegisterRequest.displayName` recibido pero no guardado.

**Solución:**
- `AuthService.register()` crea `UserProfileEntity` con `displayName` tras `accountRepository.save(...)`.
- Si el flujo ya delega a onboarding (frontend manda displayName de nuevo allí), entonces aceptarlo opcional. Verificar y decidir: como el onboarding lo vuelve a pedir (`OnboardingPage step 1 displayName`), lo más KISS es **eliminar** `displayName` del `RegisterRequest` y del form de registro. El nombre se establece en onboarding.
- Frontend: quitar campo `displayName` de `RegisterPage`. Schema sin él.
- Tests: `AuthServiceRegisterTest` (sin displayName, profile se crea vacío para onboarding).

### A7. Enumeración usuarios en register

**Problema (C10):** 400 EMAIL_ALREADY_REGISTERED vs 201 → enumeración.

**Solución:**
- `register()` devuelve siempre 201 con cuerpo `{ status: "verification_sent" }`. Si email existe Y verificado: enviar email "ya tienes cuenta, prueba login o forgot-password". Si existe pero NO verificado: reenviar verificación. Si no existe: crear cuenta y enviar.
- Latencia constante (hash bcrypt aunque no se use, o `Thread.sleep` similar) para evitar timing attacks.
- Tests: `AuthServiceRegisterTest.shouldReturnSameResponseForExistingAndNew`.

### A8. CSP + headers seguridad nginx (frontend)

**Problema (SEC-2):** nginx sin `Content-Security-Policy`, `X-Frame-Options`, `Referrer-Policy`, `X-Content-Type-Options`.

**Solución (frontend repo, `nginx.conf`):**
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; frame-src https://www.youtube.com https://www.youtube-nocookie.com; connect-src 'self' http://10.10.100.15:8080 https://*; frame-ancestors 'none'" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), camera=(), microphone=()" always;
```
- Validar que el SPA no rompe (sin inline scripts).
- Tests: e2e Playwright que valide presencia de headers.

### A9. nginx proxy `/oauth2/` y `/login/oauth2/`

**Problema (ARCH-6):** click en GoogleLoginButton hace navegación a `/oauth2/authorize/google` que nginx no proxea → 404 en prod.

**Solución (frontend `nginx.conf`):**
```nginx
location /oauth2/ { proxy_pass http://backend:8080/oauth2/; proxy_set_header Host $host; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto $scheme; }
location /login/oauth2/ { proxy_pass http://backend:8080/login/oauth2/; proxy_set_header Host $host; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto $scheme; }
```
- Tests: e2e flow OAuth (mockear endpoint Google si es viable, o smoke test que `/oauth2/authorize/google` redirige).

### A10. Frontend `client.ts` — `ApiClientError` antes de uso + race condition refresh

**Problema (SEC-3 + SEC-4):**
- `ApiClientError` declarada en línea 123, usada en línea 89 → `ReferenceError` en runtime de 401.
- `refreshPromise = refreshPromise.finally(...)` reasigna y deja chain frágil.

**Solución (frontend `src/shared/api/client.ts`):**
- Mover declaración `class ApiClientError` arriba (antes de `apiClient`).
- Cambiar:
  ```ts
  if (!refreshPromise) {
    refreshPromise = silentRefresh().finally(() => { refreshPromise = null })
  }
  await refreshPromise
  ```
- Tests: `client.test.ts` con `msw` o fetch-mock: 401 → refresh ok → retry; 401 → refresh falla → throw `ApiClientError`; 2 requests paralelas 401 → un solo refresh.

### A11. OAuth callback — validar `state`

**Problema (SEC-1):** OAuthCallbackPage acepta `#token=...` sin verificar state.

**Solución:**
- Backend: `OAuth2SuccessHandler` ya recibe `state` de Spring Security (gestionado por `OAuth2AuthorizationRequestRepository`). Verificar que está activo y no se desactiva.
- Frontend: en lugar de leer `#token=...`, redirigir a `/` y dejar que el frontend haga `/api/auth/refresh` (cookie ya establecida). El access token NO debe viajar por URL fragment. **Cambiar contrato**: `OAuth2SuccessHandler` setea cookie refresh + redirect a `/auth/callback?ok=1`, y el callback hace `silentRefresh()` para obtener access token.
- Tests: e2e simulando OAuth → cookie set, access en memoria.

### A12. `private.pem` fuera del classpath (base64-encoded en env var)

**Problema (C9 + CI/CD C1):** `private.pem` está en `.gitignore` pero el Dockerfile copia `src/` → se incluye en el JAR si existe en build context.

**Solución:**
- **Formato env var: base64-encoded PEM** (no raw PEM). Razón: Docker Compose no soporta saltos de línea literales en valores de env, y un PEM 2048 son ~1700 chars con `\n`. Base64 single-line evita el problema.
- `application.yml`: `auth.jwt.private-key-b64: ${AUTH_JWT_PRIVATE_KEY_B64:}` y `auth.jwt.public-key-b64: ${AUTH_JWT_PUBLIC_KEY_B64:}`.
- `RsaKeyConfig`:
  - `@Bean rsaPrivateKey()`: si la property está vacía:
    - Si `spring.profiles.active=dev`, fallback a path classpath (`classpath:certs/private.pem`).
    - En cualquier otro profile, lanzar `IllegalStateException("AUTH_JWT_PRIVATE_KEY_B64 env var required in non-dev profiles")` en el propio bean (falla startup, no en primer request).
  - Si no está vacía: `Base64.getDecoder().decode(value)` → parsear como PEM.
- Dockerfile backend: añadir `.dockerignore` con `src/main/resources/certs/private.pem`. Defensivo.
- CI: añadir step `if unzip -l target/*.jar | grep -q "private.pem"; then echo "PRIVATE KEY LEAKED IN JAR"; exit 1; fi` tras build.
- LXC: añadir al `.env` con `chmod 600`: `AUTH_JWT_PRIVATE_KEY_B64=$(base64 -w0 < private.pem)`. Mismo para public.
- Tests: `RsaKeyConfigTest` (lee desde env var b64, fallback a classpath solo en dev, **falla startup** si no hay key en prod profile).

### A13. Branch protection + release.yml con tests

**Problema (CI/CD C2 + C3):** main sin protection, release.yml publica sin tests.

**Solución:**
- `gh api -X PUT repos/.../branches/main/protection` con requireStatusChecks `[test]`, requirePR, prohibirDirectPush. Aplicar en ambos repos.
- `release.yml` backend: añadir job `test` (mvn verify) como `needs:` del `build-and-push`.
- `release.yml` frontend: idem `npm test && npm run type-check && npm run lint`.
- Tests: smoke — un commit a feature dispara CI con test pasando antes de imagen.

---

## Bloque B — ALTO (entra en este sprint)

### B1. RateLimitingFilter con Caffeine

`ConcurrentHashMap` reemplazado por `Caffeine.newBuilder().expireAfterAccess(Duration.ofMinutes(15)).maximumSize(10_000).build()`. Tests: `RateLimitingFilterTest` con clock fake.

### B2. `X-Forwarded-For` confiable

Configurar `server.forward-headers-strategy: framework` en `application.yml`. En `RateLimitingFilter` usar `request.getRemoteAddr()` (Spring ya resuelve X-Forwarded-For si está detrás de proxy conocido). Documentar IP del nginx en config.

### B3. EmailService — no tragar excepciones

- `EmailService.send()` lanza `EmailDeliveryException` (runtime). `AuthService.register()` la captura: si falla, el account se crea como `EMAIL_NOT_VERIFIED` y un job programado reintenta envío cada 1h hasta 3 intentos (outbox pattern simplificado: nueva tabla `email_outbox` con `status`, `attempts`, `last_attempt_at`).
- KISS alternative: log + alert (Sentry futuro) + reintentar manualmente. Para TFG, el outbox es overkill — usar **fallthrough loggeado**, devolver 201 al user pero con `verification_status: pending` para que frontend muestre "si no recibes el email en 5 min, pulsa reenviar".

**Decisión:** simple log + retry manual vía `resend-verification`. Sin outbox tabla.

### B4. Demo data fuera de Flyway versionada

- `V224__seed_demo_data.sql` no se puede borrar (ya está aplicada en LXC y prod), pero:
  - Marcar con `-- demo data only, do not depend on this in tests` al inicio.
  - Crear `R__seed_demo_data.sql` repetible **condicionada por profile** vía un `CommandLineRunner` (`DevDataInitializer`) en lugar de Flyway pura. Pero como V224 ya se aplicó, el daño está hecho.
- Para usuarios NUEVOS: como con A1 el catálogo será `visibility=SYSTEM`, los datos del user 1 ya no se verán. La V224 sigue contaminando el user 1 pero ya nadie más lo ve.
- Sin cambios urgentes (queda mitigado por A1).

### B5. `@PreAuthorize` en controllers

Añadir `@PreAuthorize("isAuthenticated()")` a nivel de clase en todos los controllers no-auth. Endpoints públicos (login, register, forgot, reset, verify) explícitamente `@PreAuthorize("permitAll()")`. Es defensa en profundidad.

### B6. AccountEntity.provider como Enum

`@Enumerated(EnumType.STRING)` + revisar mapper. Migración: ninguna (los valores actuales LOCAL/GOOGLE son válidos).

### B7. `JwtAuthenticationFilter` cache con Caffeine

Cache `account_id → AccountEntity` con TTL 60s. Reduce queries BD x10 en endpoints autenticados. Test: `JwtAuthenticationFilterCacheTest` validando hit/miss y expiración.

### B8. Frontend Landing + GoogleLoginButton + OAuthCallback al sistema de diseño

Reescribir igual que hicimos con login/register/etc. Logo BJJ SVG, Playfair Display, JetBrains Mono, sin colores hardcoded. Mantener funcionalidad. Tests: snapshot o playwright que valide colores básicos.

### B9. AuthGuard carga profile tras silent refresh

Tras `setAuth(token, placeholder)`, llamar `getProfile()` y `setAuth(token, fullUser)`. Si profile 404, redirect a `/onboarding`.

### B10. Sonar real

- `pom.xml`: añadir `sonar-maven-plugin` 5.1+. Property `sonar.host.url`, `sonar.token` desde GitHub secrets.
- `sonar-project.properties` en raíz backend Y frontend.
- CI: nuevo step `mvn sonar:sonar -Dsonar.projectKey=ossflow-backend` tras `verify`.
- Frontend: `sonarsource/sonarqube-scan-action`.
- Si no hay instancia Sonar disponible: usar SonarCloud free para repos públicos. **Si no se quiere SonarCloud:** quitar mención de Sonar en la memoria TFG (alineación con realidad).

**Decisión:** dado que es TFG y no hay Sonar configurado, **eliminar mención en memoria.docx**. Mantener Jacoco + Checkstyle como análisis de calidad.

### B11. JaCoCo — quitar exclusión `infrastructure/**` para auth/security

- `pom.xml` plugin Jacoco: cambiar exclude a algo más granular:
  ```xml
  <exclude>**/infrastructure/persistence/*Entity.class</exclude>
  <exclude>**/infrastructure/persistence/*JpaRepository.class</exclude>
  <exclude>**/MapperImpl.class</exclude>
  <exclude>**/config/*.class</exclude>
  <exclude>**/OssflowApplication.class</exclude>
  <exclude>**/portability/**</exclude>
  ```
  Ya **NO excluye** `infrastructure/web/**` (controllers) ni `infrastructure/security/**` (filtros).
- Subir umbral global a 0.55 (compromiso realista). Para paquete `identity/auth/**`, regla específica con 0.70.

### B12. ThemeInitializer en index.html (FOUC)

Mover el script `document.documentElement.classList.add(localStorage.getItem('ossflow-theme') ?? 'dark')` a un `<script>` en el `<head>` de `index.html`, antes del bundle. Quitar `ThemeInitializer` de `providers.tsx`.

---

## Bloque C — MEDIO (mejor esfuerzo, no bloquea)

- **C1.** Centralizar `MONO`/`SERIF` en `src/shared/lib/typography.ts`. Eliminar duplicados de 8 archivos.
- **C2.** Migrar 79 violaciones `rounded-*` a sistema (radius:0). Permitidos solo `rounded-full` para badges circulares (puntos de estado, avatares).
- **C3.** Self-host fonts (Playfair Display, JetBrains Mono, Inter) bajo `src/assets/fonts/` con `@font-face`. Eliminar `@import` de Google Fonts en `index.css` (mejora privacidad + FOUT + CSP estricta).
- **C4.** `dark:` classes → tokens semánticos (`bg-card`, etc.). 19 ocurrencias.
- **C5.** Vite proxy en `vite.config.ts`: `server.proxy: { '/api': 'http://localhost:8080', '/oauth2': 'http://localhost:8080', '/login/oauth2': 'http://localhost:8080' }`. `.env.development`: `VITE_API_BASE_URL=/api/v1`.
- **C6.** `AuthField` con `htmlFor` y `useId()`. A11y.
- **C7.** Borrar `ProfileForm.tsx` y `AvatarUpload.tsx` huérfanos. `--full-page` PNG basura.
- **C8.** `lang="es"` en index.html, meta description, theme-color.
- **C9.** `index.html` con preconnect a Google Fonts (si no se self-hostea aún).

---

## Bloque D — Tests obligatorios

### Backend (mínimo nuevo)

| Test | Cubre | Path |
|------|-------|------|
| `CurrentOwnerTest` | A1 | `shared/web/CurrentOwnerTest.java` |
| `PositionRepositoryVisibilityTest` | A1 | `catalog/position/...` |
| `OAuth2UserServiceTest` | A2 | `identity/auth/application/` |
| `AuthControllerCookieTest` | A3 | `identity/auth/infrastructure/web/` |
| `AuthServiceRefreshRotationTest` | A4 | `identity/auth/application/` |
| `SecurityConfigActuatorTest` | A5 | `identity/auth/infrastructure/security/` |
| `AuthServiceRegisterTest` | A6 + A7 | `identity/auth/application/` |
| `RsaKeyConfigTest` | A12 | `identity/auth/application/` |
| `RateLimitingFilterCaffeineTest` | B1 | `identity/auth/infrastructure/security/` |
| `JwtAuthenticationFilterCacheTest` | B7 | `identity/auth/infrastructure/security/` |
| `EmailServiceTest` | B3 | `identity/auth/application/` |

Mockear `JavaMailSender`, `OAuth2User`, `Clock` donde aplique. Sin `@WebMvcTest` (memoria dice: usar `standaloneSetup` + `@SpringBootTest(NONE)`).

### Frontend (mínimo nuevo)

| Test | Cubre | Path |
|------|-------|------|
| `client.test.ts` | A10 | `src/shared/api/` |
| `LoginPage.test.tsx` | smoke | `src/features/auth/pages/` |
| `OnboardingGuard.test.tsx` | SEC-5 | `src/app/` |
| `e2e/auth-flow.spec.ts` | full | `e2e/` |

Vitest + Testing Library, MSW para mocks HTTP. Playwright e2e ya existe, añadir spec auth.

---

## Bloque E — Implementación en orden

1. **CI/CD primero (A13):** activar branch protection y validar que el CI mínimo existente pasa en `feature/auth` ANTES de empezar a cambiar código. Si CI está roto, repararlo es el primer fix. Razonamiento: arrancar el sprint con protección activa previene exposición accidental de los problemas que vamos a corregir.
2. **Backend críticos (A1-A7, A12):** sprint 1, todo en `feature/auth`. Cada bloque su commit. Tests por commit.
3. **Backend altos (B1-B3, B5-B7, B10-B11):** sprint 1 tardío.
4. **Frontend críticos (A8, A9, A10, A11):** paralelo a backend.
5. **Frontend altos (B8, B9, B12):** sprint 1 tardío.
6. **Medios (C1-C9):** opcionales, no bloquean merge.

---

## Bloque F — Criterios de aceptación (gate de merge)

- ✅ `mvn verify` verde local y CI (incluye Jacoco 55% bundle + 70% en `identity/auth/**`, checkstyle).
- ✅ `npm run type-check && npm run lint && npm test && npm run build` verde.
- ✅ E2E Playwright auth-flow verde en CI.
- ✅ Smoke test manual en LXC: registrar usuario → recibir email → verificar → login → onboarding → home. Logout → no acceso. Login → refresh tab → sesión intacta. OAuth Google (si hay credenciales test) → home.
- ✅ Headers de seguridad en respuesta nginx (curl -I).
- ✅ Branch protection activa.
- ✅ Memoria TFG actualizada con realidad: Sonar OUT, Jacoco IN, paths reales.

---

## Riesgos y mitigaciones

- **Riesgo:** A1 (columna `visibility`) rompe queries existentes que no migremos. **Mitigación:** grep exhaustivo de `ownerId = 1`, `ownerId == 1L`, `OR owner_id = 1` antes de mergear.
- **Riesgo:** A11 (cambiar contrato OAuth callback) rompe el frontend en uso. **Mitigación:** desplegar backend y frontend en una sola ventana sin tráfico (LXC dev, no afecta prod).
- **Riesgo:** A12 (key fuera del classpath) deja a la app sin key si la env var no se setea. **Mitigación:** fallback explícito a classpath si profile=dev, falla ruidosa si profile=prod sin env var.
- **Riesgo:** A4 (rotation con reuse detection) puede invalidar sesiones legítimas si hay double-click. **Mitigación:** debounce frontend (TanStack Query ya deduplica), test con request paralelo.

---

## Fuera de scope (futuro)

- Outbox pattern para emails (B3 mantiene log+retry).
- 2FA / TOTP.
- WebAuthn / passkeys.
- Federación SAML.
- Logs centralizados (Loki/ELK).
- Rate limit por usuario (no solo por IP).
- Audit log (account.events).
- Account linking explícito Google ↔ local con confirmación email.

---

## Resumen para defensa de TFG

Este plan lleva OssFlow de un estado de "muchos parches sueltos en auth" a una capa de identidad coherente y testeada con multi-tenancy real, rotación de refresh tokens con reuse-detection, OAuth2 verificado, headers de seguridad estándar y CI/CD con branch protection. El esfuerzo: ~3 días de implementación + ~1 día de QA, asumiendo dedicación full-time.
