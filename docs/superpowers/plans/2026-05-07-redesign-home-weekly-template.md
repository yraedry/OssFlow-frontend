# Home Rediseño (Opción C) + WeeklyTemplate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar el home con el layout "Opción C" (Hoy toca + Racha + Stats + Botón registrar) e implementar el bounded context WeeklyTemplate en backend y frontend para que "Hoy toca" se calcule automáticamente desde una plantilla semanal fija.

**Architecture:** Backend: nuevo bounded context `planning/weekly-template` con una sola plantilla por usuario (7 entradas día→tipos de sesión). Frontend: módulo `features/planning/weeklytemplate/` con types/schemas/api/hooks, y `HomePage.tsx` completamente reescrita con bento grid de dos columnas (7/5 en doce columnas). La semana strip se elimina del home y queda solo en la vista de sesiones.

**Tech Stack:** Spring Boot 4 + Java 25 + SQLite (backend), React 19 + TypeScript + TanStack Query v5 + React Hook Form + Zod v4 + Tailwind v4 (frontend). Repos separados: `OssFlow/` (backend) y `OssFlow-frontend/` (frontend).

---

## Scope

Este plan tiene dos subsistemas en orden:

- **Parte A (Backend)** — WeeklyTemplate entity + API en `OssFlow/`
- **Parte B (Frontend)** — types/schemas/api/hooks/page WeeklyTemplate + HomePage rewrite en `OssFlow-frontend/`
- **Parte C (Nav typography)** — aumentar tamaños de texto en TopNavBar y nav móvil

Ejecutar en orden: Parte A → Parte B → Parte C.

---

## Contexto clave

**Cómo arrancar el backend:**
```bash
cd /Users/adrian/Programacion/repositorio/OssFlow
export JAVA_HOME=$(/usr/libexec/java_home -v 25) && ./mvnw spring-boot:run
```

**Cómo arrancar el frontend:**
```bash
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
npm run dev
```

**Patrón backend (PhysicalSession como referencia):**
- Domain record con Lombok @Builder en `domain/`
- Port interface en `application/port/`
- Service en `application/`
- JPA entity en `infrastructure/persistence/`
- Controller + WebMapper + DTOs en `infrastructure/web/`
- URL base: `/api/v1/planning/weekly-template`

**Patrón frontend (PhysicalSession como referencia):**
- `types.ts`, `schemas.ts`, `api.ts`, `hooks.ts` en `features/planning/weeklytemplate/`
- Componentes en `components/`, páginas en `pages/`
- Hook usa TanStack Query v5: `useQuery({ queryKey, queryFn })`
- Tests en archivo `weeklytemplate.test.ts` con Vitest, testean solo schemas (sin mocks de red)

**Modelo de datos WeeklyTemplate:**
Una sola plantilla por usuario. Siete entradas, una por día de la semana (MONDAY…SUNDAY). Cada entrada define qué tipos de sesión toca ese día: `bjj: boolean`, `strength: boolean`, `cardio: boolean`. El home calcula "Hoy toca" comparando la entrada del día actual con las sesiones ya registradas hoy.

**Tests:**
```bash
# Backend
cd /Users/adrian/Programacion/repositorio/OssFlow
export JAVA_HOME=$(/usr/libexec/java_home -v 25) && ./mvnw test

# Frontend
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
npm test -- --run
```

---

## File Structure

### Backend (`OssFlow/`)

**Crear:**
- `src/main/java/com/ossflow/planning/weeklytemplate/domain/WeeklyTemplate.java` — record dominio
- `src/main/java/com/ossflow/planning/weeklytemplate/domain/DayEntry.java` — record con dayOfWeek + 3 booleans
- `src/main/java/com/ossflow/planning/weeklytemplate/application/port/WeeklyTemplateRepositoryPort.java`
- `src/main/java/com/ossflow/planning/weeklytemplate/application/WeeklyTemplateService.java`
- `src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/persistence/WeeklyTemplateEntity.java`
- `src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/persistence/WeeklyTemplateJpaRepository.java`
- `src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/persistence/WeeklyTemplatePersistenceAdapter.java`
- `src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/persistence/WeeklyTemplatePersistenceMapper.java`
- `src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/web/WeeklyTemplateController.java`
- `src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/web/WeeklyTemplateWebMapper.java`
- `src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/web/dto/WeeklyTemplateResponse.java`
- `src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/web/dto/SaveWeeklyTemplateRequest.java`
- `src/test/java/com/ossflow/planning/weeklytemplate/WeeklyTemplateServiceTest.java`

### Frontend (`OssFlow-frontend/`)

**Crear:**
- `src/features/planning/weeklytemplate/types.ts`
- `src/features/planning/weeklytemplate/schemas.ts`
- `src/features/planning/weeklytemplate/api.ts`
- `src/features/planning/weeklytemplate/hooks.ts`
- `src/features/planning/weeklytemplate/weeklytemplate.test.ts`
- `src/features/planning/weeklytemplate/components/WeeklyTemplateForm.tsx`
- `src/features/planning/weeklytemplate/pages/WeeklyTemplatePage.tsx`

**Modificar:**
- `src/pages/HomePage.tsx` — reescritura completa con layout opción C
- `src/app/router.tsx` — añadir ruta `/planning/weekly-template`
- `src/shared/components/layout/TopNavBar.tsx` — aumentar font-size de nav links y botón
- `src/shared/components/layout/BottomTabBar.tsx` — aumentar font-size de labels

---

## PARTE A — Backend WeeklyTemplate

### Task 1: Domain + Port

**Archivos:**
- Crear: `OssFlow/src/main/java/com/ossflow/planning/weeklytemplate/domain/DayEntry.java`
- Crear: `OssFlow/src/main/java/com/ossflow/planning/weeklytemplate/domain/WeeklyTemplate.java`
- Crear: `OssFlow/src/main/java/com/ossflow/planning/weeklytemplate/application/port/WeeklyTemplateRepositoryPort.java`

- [ ] **Step 1: Crear DayEntry record**

```java
// src/main/java/com/ossflow/planning/weeklytemplate/domain/DayEntry.java
package com.ossflow.planning.weeklytemplate.domain;

import lombok.Builder;
import java.time.DayOfWeek;

@Builder(toBuilder = true)
public record DayEntry(
        DayOfWeek dayOfWeek,
        boolean bjj,
        boolean strength,
        boolean cardio
) {}
```

- [ ] **Step 2: Crear WeeklyTemplate record**

```java
// src/main/java/com/ossflow/planning/weeklytemplate/domain/WeeklyTemplate.java
package com.ossflow.planning.weeklytemplate.domain;

import lombok.Builder;
import java.time.Instant;
import java.util.List;

@Builder(toBuilder = true)
public record WeeklyTemplate(
        Long id,
        Long ownerId,
        List<DayEntry> days,
        Instant createdAt,
        Instant updatedAt
) {}
```

- [ ] **Step 3: Crear port interface**

```java
// src/main/java/com/ossflow/planning/weeklytemplate/application/port/WeeklyTemplateRepositoryPort.java
package com.ossflow.planning.weeklytemplate.application.port;

import com.ossflow.planning.weeklytemplate.domain.WeeklyTemplate;
import java.util.Optional;

public interface WeeklyTemplateRepositoryPort {
    Optional<WeeklyTemplate> findByOwnerId(Long ownerId);
    WeeklyTemplate save(WeeklyTemplate template);
}
```

- [ ] **Step 4: Compilar para verificar**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow
export JAVA_HOME=$(/usr/libexec/java_home -v 25) && ./mvnw compile -q
```
Esperado: BUILD SUCCESS

- [ ] **Step 5: Commit**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow
git add src/main/java/com/ossflow/planning/weeklytemplate/domain/ src/main/java/com/ossflow/planning/weeklytemplate/application/
git commit -m "feat: WeeklyTemplate domain records + repository port"
```

---

### Task 2: Service

**Archivos:**
- Crear: `OssFlow/src/main/java/com/ossflow/planning/weeklytemplate/application/WeeklyTemplateService.java`
- Crear: `OssFlow/src/test/java/com/ossflow/planning/weeklytemplate/WeeklyTemplateServiceTest.java`

- [ ] **Step 1: Escribir el test**

```java
// src/test/java/com/ossflow/planning/weeklytemplate/WeeklyTemplateServiceTest.java
package com.ossflow.planning.weeklytemplate;

import com.ossflow.planning.weeklytemplate.application.WeeklyTemplateService;
import com.ossflow.planning.weeklytemplate.application.port.WeeklyTemplateRepositoryPort;
import com.ossflow.planning.weeklytemplate.domain.DayEntry;
import com.ossflow.planning.weeklytemplate.domain.WeeklyTemplate;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WeeklyTemplateServiceTest {

    @Mock
    WeeklyTemplateRepositoryPort repo;

    @InjectMocks
    WeeklyTemplateService service;

    private WeeklyTemplate buildTemplate(Long ownerId) {
        return WeeklyTemplate.builder()
                .ownerId(ownerId)
                .days(List.of(
                        DayEntry.builder().dayOfWeek(DayOfWeek.MONDAY).bjj(true).strength(true).cardio(true).build()
                ))
                .build();
    }

    @Test
    void upsert_crea_cuando_no_existe() {
        when(repo.findByOwnerId(1L)).thenReturn(Optional.empty());
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        WeeklyTemplate result = service.upsert(1L, buildTemplate(1L));

        assertThat(result.ownerId()).isEqualTo(1L);
        assertThat(result.days()).hasSize(1);
    }

    @Test
    void get_devuelve_template_vacia_si_no_existe() {
        when(repo.findByOwnerId(2L)).thenReturn(Optional.empty());

        WeeklyTemplate result = service.getOrEmpty(2L);

        assertThat(result.ownerId()).isEqualTo(2L);
        assertThat(result.days()).isEmpty();
    }

    @Test
    void get_devuelve_template_existente() {
        WeeklyTemplate stored = buildTemplate(3L).toBuilder().id(10L).build();
        when(repo.findByOwnerId(3L)).thenReturn(Optional.of(stored));

        WeeklyTemplate result = service.getOrEmpty(3L);

        assertThat(result.id()).isEqualTo(10L);
    }
}
```

- [ ] **Step 2: Ejecutar test para verificar que falla**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow
export JAVA_HOME=$(/usr/libexec/java_home -v 25) && ./mvnw test -pl . -Dtest=WeeklyTemplateServiceTest -q 2>&1 | tail -5
```
Esperado: error de compilación (clase no existe)

- [ ] **Step 3: Implementar el servicio**

```java
// src/main/java/com/ossflow/planning/weeklytemplate/application/WeeklyTemplateService.java
package com.ossflow.planning.weeklytemplate.application;

import com.ossflow.planning.weeklytemplate.application.port.WeeklyTemplateRepositoryPort;
import com.ossflow.planning.weeklytemplate.domain.WeeklyTemplate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WeeklyTemplateService {

    private final WeeklyTemplateRepositoryPort repo;

    public WeeklyTemplate getOrEmpty(Long ownerId) {
        return repo.findByOwnerId(ownerId)
                .orElse(WeeklyTemplate.builder().ownerId(ownerId).days(List.of()).build());
    }

    public WeeklyTemplate upsert(Long ownerId, WeeklyTemplate incoming) {
        WeeklyTemplate toSave = incoming.toBuilder().ownerId(ownerId).build();
        return repo.save(toSave);
    }
}
```

- [ ] **Step 4: Ejecutar test para verificar que pasa**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow
export JAVA_HOME=$(/usr/libexec/java_home -v 25) && ./mvnw test -Dtest=WeeklyTemplateServiceTest -q 2>&1 | tail -5
```
Esperado: BUILD SUCCESS, 3 tests passed

- [ ] **Step 5: Commit**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow
git add src/main/java/com/ossflow/planning/weeklytemplate/application/WeeklyTemplateService.java \
        src/test/java/com/ossflow/planning/weeklytemplate/WeeklyTemplateServiceTest.java
git commit -m "feat: WeeklyTemplateService con upsert + getOrEmpty"
```

---

### Task 3: Capa de persistencia JPA

**Archivos:**
- Crear: `OssFlow/src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/persistence/WeeklyTemplateEntity.java`
- Crear: `OssFlow/src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/persistence/WeeklyTemplateJpaRepository.java`
- Crear: `OssFlow/src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/persistence/WeeklyTemplatePersistenceMapper.java`
- Crear: `OssFlow/src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/persistence/WeeklyTemplatePersistenceAdapter.java`

La plantilla semanal se almacena como JSON en una columna `days_json` de tipo TEXT (SQLite no tiene JSON nativo pero admite TEXT). Se usa un `AttributeConverter` para serializar/deserializar `List<DayEntry>`.

- [ ] **Step 1: Crear la entity JPA**

```java
// src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/persistence/WeeklyTemplateEntity.java
package com.ossflow.planning.weeklytemplate.infrastructure.persistence;

import com.ossflow.planning.weeklytemplate.domain.DayEntry;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "weekly_template")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyTemplateEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_id", nullable = false, unique = true)
    private Long ownerId;

    @Convert(converter = DayEntryListConverter.class)
    @Column(name = "days_json", columnDefinition = "TEXT")
    private List<DayEntry> days;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;
}
```

- [ ] **Step 2: Crear el AttributeConverter para serializar List<DayEntry>**

```java
// src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/persistence/DayEntryListConverter.java
package com.ossflow.planning.weeklytemplate.infrastructure.persistence;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.ossflow.planning.weeklytemplate.domain.DayEntry;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.List;

@Converter
public class DayEntryListConverter implements AttributeConverter<List<DayEntry>, String> {

    private static final ObjectMapper MAPPER = new ObjectMapper()
            .findAndRegisterModules()
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @Override
    public String convertToDatabaseColumn(List<DayEntry> attribute) {
        if (attribute == null) return "[]";
        try {
            return MAPPER.writeValueAsString(attribute);
        } catch (Exception e) {
            throw new IllegalStateException("Error serializando DayEntry list", e);
        }
    }

    @Override
    public List<DayEntry> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) return List.of();
        try {
            return MAPPER.readValue(dbData, new TypeReference<>() {});
        } catch (Exception e) {
            throw new IllegalStateException("Error deserializando DayEntry list", e);
        }
    }
}
```

- [ ] **Step 3: Crear el JpaRepository**

```java
// src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/persistence/WeeklyTemplateJpaRepository.java
package com.ossflow.planning.weeklytemplate.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WeeklyTemplateJpaRepository extends JpaRepository<WeeklyTemplateEntity, Long> {
    Optional<WeeklyTemplateEntity> findByOwnerId(Long ownerId);
}
```

- [ ] **Step 4: Crear el PersistenceMapper**

```java
// src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/persistence/WeeklyTemplatePersistenceMapper.java
package com.ossflow.planning.weeklytemplate.infrastructure.persistence;

import com.ossflow.planning.weeklytemplate.domain.WeeklyTemplate;
import org.springframework.stereotype.Component;

@Component
public class WeeklyTemplatePersistenceMapper {

    public WeeklyTemplate toDomain(WeeklyTemplateEntity e) {
        return WeeklyTemplate.builder()
                .id(e.getId())
                .ownerId(e.getOwnerId())
                .days(e.getDays() != null ? e.getDays() : java.util.List.of())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    public WeeklyTemplateEntity toEntity(WeeklyTemplate d) {
        return WeeklyTemplateEntity.builder()
                .id(d.id())
                .ownerId(d.ownerId())
                .days(d.days())
                .build();
    }
}
```

- [ ] **Step 5: Crear el PersistenceAdapter**

```java
// src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/persistence/WeeklyTemplatePersistenceAdapter.java
package com.ossflow.planning.weeklytemplate.infrastructure.persistence;

import com.ossflow.planning.weeklytemplate.application.port.WeeklyTemplateRepositoryPort;
import com.ossflow.planning.weeklytemplate.domain.WeeklyTemplate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class WeeklyTemplatePersistenceAdapter implements WeeklyTemplateRepositoryPort {

    private final WeeklyTemplateJpaRepository jpa;
    private final WeeklyTemplatePersistenceMapper mapper;

    @Override
    public Optional<WeeklyTemplate> findByOwnerId(Long ownerId) {
        return jpa.findByOwnerId(ownerId).map(mapper::toDomain);
    }

    @Override
    public WeeklyTemplate save(WeeklyTemplate template) {
        WeeklyTemplateEntity entity = template.id() != null
                ? jpa.findByOwnerId(template.ownerId())
                        .map(existing -> {
                            existing.setDays(template.days());
                            return existing;
                        })
                        .orElse(mapper.toEntity(template))
                : mapper.toEntity(template);
        return mapper.toDomain(jpa.save(entity));
    }
}
```

- [ ] **Step 6: Compilar**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow
export JAVA_HOME=$(/usr/libexec/java_home -v 25) && ./mvnw compile -q
```
Esperado: BUILD SUCCESS

- [ ] **Step 7: Commit**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow
git add src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/persistence/
git commit -m "feat: WeeklyTemplate JPA persistence (entity + converter + adapter)"
```

---

### Task 4: Capa web (Controller + DTOs + WebMapper)

**Archivos:**
- Crear: `OssFlow/src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/web/dto/DayEntryDto.java`
- Crear: `OssFlow/src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/web/dto/WeeklyTemplateResponse.java`
- Crear: `OssFlow/src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/web/dto/SaveWeeklyTemplateRequest.java`
- Crear: `OssFlow/src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/web/WeeklyTemplateWebMapper.java`
- Crear: `OssFlow/src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/web/WeeklyTemplateController.java`

- [ ] **Step 1: Crear DayEntryDto**

```java
// src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/web/dto/DayEntryDto.java
package com.ossflow.planning.weeklytemplate.infrastructure.web.dto;

import jakarta.validation.constraints.NotNull;
import java.time.DayOfWeek;

public record DayEntryDto(
        @NotNull DayOfWeek dayOfWeek,
        boolean bjj,
        boolean strength,
        boolean cardio
) {}
```

- [ ] **Step 2: Crear WeeklyTemplateResponse**

```java
// src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/web/dto/WeeklyTemplateResponse.java
package com.ossflow.planning.weeklytemplate.infrastructure.web.dto;

import java.time.Instant;
import java.util.List;

public record WeeklyTemplateResponse(
        Long id,
        List<DayEntryDto> days,
        Instant updatedAt
) {}
```

- [ ] **Step 3: Crear SaveWeeklyTemplateRequest**

```java
// src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/web/dto/SaveWeeklyTemplateRequest.java
package com.ossflow.planning.weeklytemplate.infrastructure.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record SaveWeeklyTemplateRequest(
        @NotNull @Size(max = 7) @Valid List<DayEntryDto> days
) {}
```

- [ ] **Step 4: Crear WebMapper**

```java
// src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/web/WeeklyTemplateWebMapper.java
package com.ossflow.planning.weeklytemplate.infrastructure.web;

import com.ossflow.planning.weeklytemplate.domain.DayEntry;
import com.ossflow.planning.weeklytemplate.domain.WeeklyTemplate;
import com.ossflow.planning.weeklytemplate.infrastructure.web.dto.DayEntryDto;
import com.ossflow.planning.weeklytemplate.infrastructure.web.dto.SaveWeeklyTemplateRequest;
import com.ossflow.planning.weeklytemplate.infrastructure.web.dto.WeeklyTemplateResponse;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class WeeklyTemplateWebMapper {

    public WeeklyTemplateResponse toResponse(WeeklyTemplate t) {
        List<DayEntryDto> days = t.days().stream()
                .map(d -> new DayEntryDto(d.dayOfWeek(), d.bjj(), d.strength(), d.cardio()))
                .toList();
        return new WeeklyTemplateResponse(t.id(), days, t.updatedAt());
    }

    public WeeklyTemplate fromRequest(SaveWeeklyTemplateRequest req) {
        List<DayEntry> days = req.days().stream()
                .map(d -> DayEntry.builder()
                        .dayOfWeek(d.dayOfWeek())
                        .bjj(d.bjj())
                        .strength(d.strength())
                        .cardio(d.cardio())
                        .build())
                .toList();
        return WeeklyTemplate.builder().days(days).build();
    }
}
```

- [ ] **Step 5: Crear Controller**

```java
// src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/web/WeeklyTemplateController.java
package com.ossflow.planning.weeklytemplate.infrastructure.web;

import com.ossflow.planning.weeklytemplate.application.WeeklyTemplateService;
import com.ossflow.planning.weeklytemplate.infrastructure.web.dto.WeeklyTemplateResponse;
import com.ossflow.planning.weeklytemplate.infrastructure.web.dto.SaveWeeklyTemplateRequest;
import com.ossflow.shared.web.CurrentOwner;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/planning/weekly-template")
@RequiredArgsConstructor
public class WeeklyTemplateController {

    private final WeeklyTemplateService service;
    private final WeeklyTemplateWebMapper mapper;
    private final CurrentOwner currentOwner;

    @GetMapping
    public WeeklyTemplateResponse get() {
        return mapper.toResponse(service.getOrEmpty(currentOwner.id()));
    }

    @PutMapping
    public WeeklyTemplateResponse save(@Valid @RequestBody SaveWeeklyTemplateRequest req) {
        return mapper.toResponse(
                service.upsert(currentOwner.id(), mapper.fromRequest(req))
        );
    }
}
```

- [ ] **Step 6: Compilar y ejecutar todos los tests**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow
export JAVA_HOME=$(/usr/libexec/java_home -v 25) && ./mvnw test -q 2>&1 | tail -10
```
Esperado: BUILD SUCCESS, todos los tests pasando (incluyendo los anteriores de WeeklyTemplateServiceTest)

- [ ] **Step 7: Verificar endpoint manualmente arrancando el backend**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow
export JAVA_HOME=$(/usr/libexec/java_home -v 25) && ./mvnw spring-boot:run &
sleep 15
curl -s -X PUT http://localhost:8080/api/v1/planning/weekly-template \
  -H "Content-Type: application/json" \
  -d '{"days":[{"dayOfWeek":"MONDAY","bjj":true,"strength":true,"cardio":true},{"dayOfWeek":"TUESDAY","bjj":false,"strength":false,"cardio":true}]}' | python3 -m json.tool
curl -s http://localhost:8080/api/v1/planning/weekly-template | python3 -m json.tool
```
Esperado: JSON con `id`, `days` array con 2 entradas, `updatedAt`

- [ ] **Step 8: Commit**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow
git add src/main/java/com/ossflow/planning/weeklytemplate/infrastructure/web/
git commit -m "feat: WeeklyTemplate REST controller + DTOs + web mapper"
```

---

## PARTE B — Frontend WeeklyTemplate + Home Rediseño

### Task 5: Types + Schemas + API + Tests

**Archivos:**
- Crear: `OssFlow-frontend/src/features/planning/weeklytemplate/types.ts`
- Crear: `OssFlow-frontend/src/features/planning/weeklytemplate/schemas.ts`
- Crear: `OssFlow-frontend/src/features/planning/weeklytemplate/api.ts`
- Crear: `OssFlow-frontend/src/features/planning/weeklytemplate/hooks.ts`
- Crear: `OssFlow-frontend/src/features/planning/weeklytemplate/weeklytemplate.test.ts`

- [ ] **Step 1: Crear types.ts**

```typescript
// src/features/planning/weeklytemplate/types.ts
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'

export interface DayEntry {
  dayOfWeek: DayOfWeek
  bjj: boolean
  strength: boolean
  cardio: boolean
}

export interface WeeklyTemplate {
  id: number | null
  days: DayEntry[]
  updatedAt: string | null
}

export const ALL_DAYS: DayOfWeek[] = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY',
]

export const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
}
```

- [ ] **Step 2: Crear schemas.ts**

```typescript
// src/features/planning/weeklytemplate/schemas.ts
import { z } from 'zod'

const DAY_OF_WEEK = z.enum([
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY',
])

export const dayEntrySchema = z.object({
  dayOfWeek: DAY_OF_WEEK,
  bjj: z.boolean(),
  strength: z.boolean(),
  cardio: z.boolean(),
})

export const saveWeeklyTemplateSchema = z.object({
  days: z.array(dayEntrySchema).max(7),
})

export type SaveWeeklyTemplateForm = z.infer<typeof saveWeeklyTemplateSchema>
```

- [ ] **Step 3: Crear api.ts**

```typescript
// src/features/planning/weeklytemplate/api.ts
import { apiClient } from '@/shared/api/client'
import type { WeeklyTemplate } from './types'
import type { SaveWeeklyTemplateForm } from './schemas'

export const weeklyTemplateApi = {
  get(): Promise<WeeklyTemplate> {
    return apiClient.get('planning/weekly-template').json<WeeklyTemplate>()
  },
  save(data: SaveWeeklyTemplateForm): Promise<WeeklyTemplate> {
    return apiClient.put('planning/weekly-template', { json: data }).json<WeeklyTemplate>()
  },
}
```

- [ ] **Step 4: Crear hooks.ts**

```typescript
// src/features/planning/weeklytemplate/hooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { weeklyTemplateApi } from './api'
import type { SaveWeeklyTemplateForm } from './schemas'

export const WEEKLY_TEMPLATE_KEY = ['weekly-template'] as const

export function useWeeklyTemplate() {
  return useQuery({
    queryKey: WEEKLY_TEMPLATE_KEY,
    queryFn: () => weeklyTemplateApi.get(),
  })
}

export function useSaveWeeklyTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: SaveWeeklyTemplateForm) => weeklyTemplateApi.save(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WEEKLY_TEMPLATE_KEY })
      toast.success('Plantilla guardada')
    },
    onError: () => toast.error('Error al guardar la plantilla'),
  })
}
```

- [ ] **Step 5: Escribir tests**

```typescript
// src/features/planning/weeklytemplate/weeklytemplate.test.ts
import { describe, it, expect } from 'vitest'
import { dayEntrySchema, saveWeeklyTemplateSchema } from './schemas'

describe('dayEntrySchema', () => {
  it('acepta entrada válida', () => {
    const result = dayEntrySchema.safeParse({
      dayOfWeek: 'MONDAY',
      bjj: true,
      strength: false,
      cardio: true,
    })
    expect(result.success).toBe(true)
  })

  it('falla si dayOfWeek no es válido', () => {
    const result = dayEntrySchema.safeParse({
      dayOfWeek: 'LUNES',
      bjj: true,
      strength: false,
      cardio: false,
    })
    expect(result.success).toBe(false)
  })
})

describe('saveWeeklyTemplateSchema', () => {
  it('acepta plantilla con días válidos', () => {
    const result = saveWeeklyTemplateSchema.safeParse({
      days: [
        { dayOfWeek: 'MONDAY', bjj: true, strength: true, cardio: true },
        { dayOfWeek: 'TUESDAY', bjj: false, strength: false, cardio: true },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('falla si tiene más de 7 días', () => {
    const days = Array.from({ length: 8 }, (_, i) => ({
      dayOfWeek: 'MONDAY',
      bjj: false,
      strength: false,
      cardio: false,
    }))
    const result = saveWeeklyTemplateSchema.safeParse({ days })
    expect(result.success).toBe(false)
  })

  it('acepta plantilla vacía (sin días)', () => {
    const result = saveWeeklyTemplateSchema.safeParse({ days: [] })
    expect(result.success).toBe(true)
  })
})
```

- [ ] **Step 6: Ejecutar tests**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
npm test -- --run 2>&1 | tail -10
```
Esperado: todos los tests pasando (incluyendo los 3 nuevos de weeklytemplate.test.ts)

- [ ] **Step 7: Commit**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
git add src/features/planning/weeklytemplate/
git commit -m "feat: WeeklyTemplate types, schemas, api, hooks y tests"
```

---

### Task 6: WeeklyTemplateForm + WeeklyTemplatePage

**Archivos:**
- Crear: `OssFlow-frontend/src/features/planning/weeklytemplate/components/WeeklyTemplateForm.tsx`
- Crear: `OssFlow-frontend/src/features/planning/weeklytemplate/pages/WeeklyTemplatePage.tsx`
- Modificar: `OssFlow-frontend/src/app/router.tsx`

- [ ] **Step 1: Crear WeeklyTemplateForm**

El formulario muestra una tabla de 7 filas (días) × 3 columnas (BJJ / Fuerza / Cardio) con checkboxes.

```tsx
// src/features/planning/weeklytemplate/components/WeeklyTemplateForm.tsx
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/button'
import { saveWeeklyTemplateSchema, type SaveWeeklyTemplateForm } from '../schemas'
import { ALL_DAYS, DAY_LABELS, type DayOfWeek } from '../types'
import type { WeeklyTemplate } from '../types'

type Props = {
  template: WeeklyTemplate
  onSave: (data: SaveWeeklyTemplateForm) => void
  isPending: boolean
}

function defaultDays() {
  return ALL_DAYS.map((day) => ({
    dayOfWeek: day,
    bjj: false,
    strength: false,
    cardio: false,
  }))
}

function templateToForm(template: WeeklyTemplate): SaveWeeklyTemplateForm {
  const map = new Map(template.days.map((d) => [d.dayOfWeek, d]))
  return {
    days: ALL_DAYS.map((day) => map.get(day) ?? { dayOfWeek: day, bjj: false, strength: false, cardio: false }),
  }
}

export function WeeklyTemplateForm({ template, onSave, isPending }: Props) {
  const { control, handleSubmit } = useForm<SaveWeeklyTemplateForm>({
    resolver: zodResolver(saveWeeklyTemplateSchema),
    defaultValues: template.days.length > 0 ? templateToForm(template) : { days: defaultDays() },
  })

  const COLS: { key: keyof Omit<SaveWeeklyTemplateForm['days'][0], 'dayOfWeek'>; label: string }[] = [
    { key: 'bjj', label: 'BJJ' },
    { key: 'strength', label: 'Fuerza' },
    { key: 'cardio', label: 'Cardio' },
  ]

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div className="border border-border">
        {/* Header */}
        <div className="grid grid-cols-4 border-b border-border">
          <div className="py-2 px-3" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted-foreground)' }}>
            Día
          </div>
          {COLS.map((col) => (
            <div key={col.key} className="py-2 px-3 text-center" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted-foreground)' }}>
              {col.label}
            </div>
          ))}
        </div>
        {/* Rows */}
        {ALL_DAYS.map((day, idx) => (
          <div key={day} className="grid grid-cols-4 border-b border-border last:border-b-0 hover:bg-accent/30 transition-colors">
            <div className="py-3 px-3 flex items-center" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-foreground)' }}>
              {DAY_LABELS[day]}
            </div>
            {COLS.map((col) => (
              <div key={col.key} className="py-3 px-3 flex items-center justify-center">
                <Controller
                  control={control}
                  name={`days.${idx}.${col.key}` as const}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={field.value as boolean}
                      onChange={field.onChange}
                      className="w-4 h-4 cursor-pointer"
                      style={{ accentColor: 'var(--color-foreground)' }}
                    />
                  )}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Guardando...' : 'Guardar plantilla'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 2: Crear WeeklyTemplatePage**

```tsx
// src/features/planning/weeklytemplate/pages/WeeklyTemplatePage.tsx
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { useWeeklyTemplate, useSaveWeeklyTemplate } from '../hooks'
import { WeeklyTemplateForm } from '../components/WeeklyTemplateForm'
import type { SaveWeeklyTemplateForm } from '../schemas'

export function WeeklyTemplatePage() {
  const { data: template, isLoading, error } = useWeeklyTemplate()
  const saveMutation = useSaveWeeklyTemplate()

  const handleSave = (data: SaveWeeklyTemplateForm) => {
    saveMutation.mutate(data)
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)' }}>
          Plantilla semanal
        </h1>
        <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Define qué tipo de sesión toca cada día. El home lo usará para mostrarte "Hoy toca".
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : error ? (
        <Alert variant="destructive"><AlertDescription>Error al cargar la plantilla</AlertDescription></Alert>
      ) : template ? (
        <WeeklyTemplateForm
          template={template}
          onSave={handleSave}
          isPending={saveMutation.isPending}
        />
      ) : null}
    </div>
  )
}
```

- [ ] **Step 3: Añadir ruta en router.tsx**

En `src/app/router.tsx`, añadir el import y la ruta:

```tsx
// Añadir import junto a los demás imports de páginas:
import { WeeklyTemplatePage } from '@/features/planning/weeklytemplate/pages/WeeklyTemplatePage'

// Añadir dentro de children de AppLayout, junto a las demás rutas:
{ path: 'planning/weekly-template', element: <WeeklyTemplatePage /> },
```

- [ ] **Step 4: Añadir enlace en TopNavBar secondary nav**

En `src/shared/components/layout/TopNavBar.tsx`, en el array `SECONDARY_NAV`, añadir:

```tsx
{ to: '/planning/weekly-template', label: 'Plantilla semanal' },
```
Añadirlo después de `{ to: '/journal/physical-sessions', label: 'Físico' }`.

- [ ] **Step 5: Verificar TypeScript**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
npx tsc --noEmit 2>&1 | head -20
```
Esperado: 0 errores

- [ ] **Step 6: Commit**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
git add src/features/planning/weeklytemplate/components/ \
        src/features/planning/weeklytemplate/pages/ \
        src/app/router.tsx \
        src/shared/components/layout/TopNavBar.tsx
git commit -m "feat: WeeklyTemplateForm, WeeklyTemplatePage y ruta /planning/weekly-template"
```

---

### Task 7: HomePage rediseño — layout opción C

**Archivos:**
- Modificar: `OssFlow-frontend/src/pages/HomePage.tsx` — reescritura completa

El nuevo layout elimina el week strip y los anillos SVG. Estructura:
- Fila 1: saludo full-width (`col-span-12`)
- Fila 2: "Hoy toca" (izquierda, 7/12 cols) + Panel derecho racha+stats+botón (5/12 cols)
- Layout desktop 12-col, mobile stack vertical

"Hoy toca" calcula qué tipos de sesión tiene el día actual según la plantilla, y marca cuáles ya se han registrado hoy comparando con `bjjSessions` y `physSessions`.

- [ ] **Step 1: Reescribir HomePage.tsx**

```tsx
// src/pages/HomePage.tsx
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { format, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus } from 'lucide-react'
import { fetchWeeklyStats } from '@/shared/api/dashboard'
import { useTrainingSessions } from '@/features/journal/trainingsession/hooks'
import { usePhysicalSessions } from '@/features/journal/physicalsession/hooks'
import { useWeeklyTemplate } from '@/features/planning/weeklytemplate/hooks'
import { cn } from '@/shared/lib/utils'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono)' }
const SERIF: React.CSSProperties = { fontFamily: 'var(--font-serif)' }
const LABEL_STYLE: React.CSSProperties = { ...MONO, fontSize: '9px', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }

// Returns the Java DayOfWeek string for a JS Date
function javaDayOfWeek(date: Date): string {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  return days[date.getDay()]
}

export function HomePage() {
  const navigate = useNavigate()
  const today = new Date()

  const { data: stats } = useQuery({
    queryKey: ['weekly-stats'],
    queryFn: fetchWeeklyStats,
  })
  const { data: bjjData } = useTrainingSessions()
  const { data: physData } = usePhysicalSessions({ page: 0, size: 10 })
  const { data: template } = useWeeklyTemplate()

  const bjjSessions = bjjData?.content?.filter(Boolean) ?? []
  const physSessions = physData?.content?.filter(Boolean) ?? []

  const todayKey = javaDayOfWeek(today)
  const todayEntry = template?.days?.find((d) => d.dayOfWeek === todayKey)

  const hasBjjToday = bjjSessions.some((s) => isSameDay(new Date(s.sessionDate), today))
  const hasStrengthToday = physSessions.some(
    (s) => isSameDay(new Date(s.sessionDate), today) && s.sessionType === 'STRENGTH',
  )
  const hasCardioToday = physSessions.some(
    (s) => isSameDay(new Date(s.sessionDate), today) && s.sessionType === 'CARDIO',
  )

  type TodayItem = { type: string; label: string; done: boolean; color: string }
  const todayItems: TodayItem[] = []
  if (todayEntry?.cardio) todayItems.push({ type: 'Cardio', label: '1h zona 2', done: hasCardioToday, color: '#10b981' })
  if (todayEntry?.strength) todayItems.push({ type: 'Fuerza', label: 'Sesión de fuerza', done: hasStrengthToday, color: '#f59e0b' })
  if (todayEntry?.bjj) todayItems.push({ type: 'BJJ', label: 'Sesión grappling', done: hasBjjToday, color: '#4a7cff' })

  const recentSessions = [
    ...bjjSessions.slice(0, 3).map((s) => ({
      type: 'BJJ',
      date: s.sessionDate,
      name: s.location ? `BJJ — ${s.location}` : 'Sesión BJJ',
      to: '/journal/training-sessions',
      id: `bjj-${s.id}`,
    })),
    ...physSessions.slice(0, 3).map((s) => ({
      type: s.sessionType === 'STRENGTH' ? 'Fuerza' : s.sessionType === 'CARDIO' ? 'Cardio' : s.sessionType,
      date: s.sessionDate,
      name: s.title,
      to: '/journal/physical-sessions',
      id: `phys-${s.id}`,
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4)

  return (
    <div className="w-full space-y-2">

      {/* Saludo — full width */}
      <div className="border border-border bg-card px-5 py-4">
        <div className="flex items-baseline justify-between">
          <h1 className="leading-none" style={{ ...SERIF, fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 900, letterSpacing: '-0.03em' }}>
            Buenas, Adrián.
          </h1>
          <span style={{ ...MONO, fontSize: '12px', color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {format(today, "EEEE, d 'de' MMMM", { locale: es })}
          </span>
        </div>
      </div>

      {/* Grid principal: hoy toca (izq) + racha/stats/botón (der) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">

        {/* HOY TOCA — 7/12 cols */}
        <div className="md:col-span-7 border border-foreground bg-card p-5">
          <div
            className="flex items-center gap-2 mb-4"
            style={{ ...LABEL_STYLE, color: 'var(--color-muted-foreground)' }}
          >
            <span style={{ color: 'var(--color-foreground)' }}>▶</span>
            Hoy toca
          </div>

          {todayItems.length === 0 ? (
            <div className="py-6 text-center" style={{ ...MONO, fontSize: '11px', color: 'var(--color-muted-foreground)' }}>
              {template ? 'Hoy es día de descanso según tu plantilla.' : (
                <span>
                  No tienes plantilla configurada.{' '}
                  <Link to="/planning/weekly-template" className="underline hover:text-foreground transition-colors">
                    Configúrala aquí →
                  </Link>
                </span>
              )}
            </div>
          ) : (
            <div className="space-y-0">
              {todayItems.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center gap-3 py-3 border-b border-border last:border-b-0"
                >
                  <div
                    className={cn(
                      'w-4 h-4 shrink-0 border flex items-center justify-center',
                      item.done ? 'bg-foreground border-foreground' : 'border-border',
                    )}
                  >
                    {item.done && (
                      <span style={{ fontSize: '10px', color: 'var(--color-background)', fontWeight: 700 }}>✓</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div style={{ ...LABEL_STYLE, color: item.color, marginBottom: '2px' }}>
                      {item.type}
                    </div>
                    <div
                      className={cn('font-semibold', item.done && 'line-through text-muted-foreground')}
                      style={{ ...SERIF, fontSize: '15px' }}
                    >
                      {item.label}
                    </div>
                  </div>
                  {item.done && (
                    <span style={{ ...MONO, fontSize: '9px', color: 'var(--color-muted-foreground)', textTransform: 'uppercase' }}>
                      Registrado
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RACHA + STATS + BOTÓN — 5/12 cols */}
        <div className="md:col-span-5 border border-border bg-card p-5 flex flex-col gap-4">

          {/* Racha */}
          <div>
            <div style={{ ...LABEL_STYLE, color: 'var(--color-muted-foreground)', marginBottom: '6px' }}>Racha activa</div>
            <div className="flex items-baseline gap-2">
              <span style={{ ...SERIF, fontSize: 'clamp(40px, 4vw, 56px)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.03em' }}>
                {stats?.streakDays ?? 0}
              </span>
              <span style={{ ...MONO, fontSize: '13px', color: 'var(--color-muted-foreground)' }}>días</span>
            </div>
            <div style={{ ...LABEL_STYLE, color: 'var(--color-muted-foreground)', opacity: 0.6 }}>
              consecutivos entrenando
            </div>
          </div>

          {/* Stats semana */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div style={{ ...LABEL_STYLE, color: 'var(--color-muted-foreground)', marginBottom: '4px' }}>BJJ semana</div>
              <div style={{ ...SERIF, fontSize: '24px', fontWeight: 900, lineHeight: 1 }}>
                {stats?.bjjSessions ?? 0}
                <span style={{ ...MONO, fontSize: '13px', fontWeight: 400, color: 'var(--color-muted-foreground)' }}>
                  {' '}/ {stats?.bjjGoal ?? 5}
                </span>
              </div>
              <div className="mt-1.5 h-px bg-border">
                <div
                  className="h-px bg-foreground transition-all"
                  style={{ width: `${stats ? Math.min((stats.bjjSessions / stats.bjjGoal) * 100, 100) : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div style={{ ...LABEL_STYLE, color: 'var(--color-muted-foreground)', marginBottom: '4px' }}>Físico semana</div>
              <div style={{ ...SERIF, fontSize: '24px', fontWeight: 900, lineHeight: 1 }}>
                {stats?.physicalSessions ?? 0}
                <span style={{ ...MONO, fontSize: '13px', fontWeight: 400, color: 'var(--color-muted-foreground)' }}>
                  {' '}/ {stats?.physicalGoal ?? 3}
                </span>
              </div>
              <div className="mt-1.5 h-px bg-border">
                <div
                  className="h-px bg-foreground transition-all"
                  style={{ width: `${stats ? Math.min((stats.physicalSessions / stats.physicalGoal) * 100, 100) : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Botón registrar */}
          <button
            onClick={() => navigate('/journal/training-sessions?new=bjj')}
            className="w-full flex items-center justify-center gap-2 py-3 bg-foreground text-background hover:opacity-85 transition-opacity mt-auto"
            style={{ ...MONO, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Registrar sesión
          </button>

          <Link
            to="/journal/training-sessions"
            className="text-center text-muted-foreground hover:text-foreground transition-colors"
            style={{ ...MONO, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
          >
            Ver todas las sesiones →
          </Link>
        </div>
      </div>

      {/* Sesiones recientes — lista compacta */}
      {recentSessions.length > 0 && (
        <div className="border border-border bg-card">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <span style={{ ...LABEL_STYLE, color: 'var(--color-muted-foreground)' }}>Últimas sesiones</span>
            <div className="flex gap-4">
              <Link to="/journal/training-sessions" style={{ ...LABEL_STYLE, color: 'var(--color-muted-foreground)' }} className="hover:text-foreground transition-colors">BJJ →</Link>
              <Link to="/journal/physical-sessions" style={{ ...LABEL_STYLE, color: 'var(--color-muted-foreground)' }} className="hover:text-foreground transition-colors">Físico →</Link>
            </div>
          </div>
          {recentSessions.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-b-0 hover:bg-accent transition-colors"
            >
              <span
                className="border px-1.5 py-0.5 shrink-0"
                style={{ ...MONO, fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.06em', borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}
              >
                {item.type}
              </span>
              <span className="flex-1 truncate text-foreground" style={{ ...SERIF, fontSize: '14px' }}>
                {item.name}
              </span>
              <span style={{ ...MONO, fontSize: '10px', color: 'var(--color-muted-foreground)' }}>
                {item.date}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
npx tsc --noEmit 2>&1 | head -20
```
Esperado: 0 errores

- [ ] **Step 3: Ejecutar todos los tests**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
npm test -- --run 2>&1 | tail -10
```
Esperado: todos pasando

- [ ] **Step 4: Verificar visualmente en el navegador**

Arrancar frontend: `npm run dev` → abrir http://localhost:5173
- El home debe mostrar el saludo + "Hoy toca" (con mensaje de plantilla no configurada si está vacía) + racha + stats + botón
- Sin week strip ni anillos SVG
- El layout debe ser de dos columnas en desktop, stack en móvil

- [ ] **Step 5: Commit**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
git add src/pages/HomePage.tsx
git commit -m "feat: HomePage rediseño opción C — hoy toca + racha + stats + botón"
```

---

## PARTE C — Tipografía nav

### Task 8: Aumentar tamaños de texto en navegación

El problema: los textos del nav y el botón "+ Registrar" se ven muy pequeños (8px). Los subimos a 11px (nav links) y 11px (botón), y el logo a 16px.

**Archivos:**
- Modificar: `OssFlow-frontend/src/shared/components/layout/TopNavBar.tsx`
- Modificar: `OssFlow-frontend/src/shared/components/layout/BottomTabBar.tsx`

- [ ] **Step 1: Actualizar TopNavBar.tsx**

En `TopNavBar.tsx`, cambiar los `style` inline de font-size de los nav links:

```tsx
// Línea del NavLink en PRIMARY_NAV (style dentro del className callback):
// ANTES: fontSize: '8px'
// DESPUÉS: fontSize: '12px'

// En cada NavLink del PRIMARY_NAV, cambiar:
style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}
// Por:
style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
```

El botón "···" (MoreHorizontal):
```tsx
// ANTES: fontSize: '8px'
// DESPUÉS: fontSize: '12px'
style={{ fontFamily: 'var(--font-mono)', fontSize: '8px' }}
// Por:
style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
```

Los enlaces del dropdown SECONDARY_NAV:
```tsx
// ANTES: fontSize: '8px'
// DESPUÉS: fontSize: '11px'
style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}
// Por:
style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
```

El botón "+ Registrar":
```tsx
// ANTES: fontSize: '7px'
// DESPUÉS: fontSize: '11px'
style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.08em' }}
// Por:
style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
```

El avatar/iniciales:
```tsx
// ANTES: fontSize: '9px'
// DESPUÉS: fontSize: '11px'
style={{ fontFamily: 'var(--font-mono)', fontSize: '9px' }}
// Por:
style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}
```

El logo OSSFLOW:
```tsx
// ANTES: fontSize: '15px'
// DESPUÉS: fontSize: '16px'
style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', fontWeight: 900, letterSpacing: '-0.03em' }}
// Por:
style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 900, letterSpacing: '-0.03em' }}
```

- [ ] **Step 2: Actualizar BottomTabBar.tsx — aumentar labels**

En `BottomTabBar.tsx` buscar el `style` del texto de las tabs (label). Cambiar de `fontSize: '8px'` o similar a `fontSize: '11px'`.

Leer el archivo primero para encontrar la línea exacta:
```bash
grep -n "fontSize" /Users/adrian/Programacion/repositorio/OssFlow-frontend/src/shared/components/layout/BottomTabBar.tsx
```
Luego editar los valores encontrados subiendo a `11px`.

- [ ] **Step 3: Verificar visualmente**

Con `npm run dev` abierto, navegar a http://localhost:5173 y verificar:
- Nav links visibles y legibles
- Botón "+ Registrar" con tamaño cómodo
- Logo OSSFLOW legible
- BottomTabBar (en móvil o con DevTools) con labels más grandes

- [ ] **Step 4: Commit**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
git add src/shared/components/layout/TopNavBar.tsx \
        src/shared/components/layout/BottomTabBar.tsx
git commit -m "style: aumentar font-size navegación (8px→12px nav links, 7px→11px botón registrar)"
```

---

## Verificación final

- [ ] **Ejecutar todos los tests frontend**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
npm test -- --run
```
Esperado: todos pasando

- [ ] **Ejecutar todos los tests backend**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow
export JAVA_HOME=$(/usr/libexec/java_home -v 25) && ./mvnw test -q 2>&1 | tail -10
```
Esperado: BUILD SUCCESS

- [ ] **Verificar TypeScript frontend**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
npx tsc --noEmit
```
Esperado: 0 errores

- [ ] **Push ambos repos**

```bash
cd /Users/adrian/Programacion/repositorio/OssFlow
git push origin main

cd /Users/adrian/Programacion/repositorio/OssFlow-frontend
git push origin main
```
