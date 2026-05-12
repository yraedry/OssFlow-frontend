# OssFlow Frontend — Instrucciones para Claude Code

## Agentes especializados

Estos agentes viven en `../.claude/agents/` y se invocan con la herramienta `Agent` (`subagent_type: "<nombre>"`). Úsalos **antes** de escribir código significativo cuando encaje la situación.

| Cuándo | Agente | subagent_type |
|--------|--------|---------------|
| Diseñar arquitectura de una nueva feature, refactorizar un sistema, planificar implementación no trivial que debe encajar con los patrones del codebase | `code-architect` | `code-architect` |
| Planificar features complejas, diseñar arquitectura de sistema, evaluar trade-offs técnicos, decisiones que afectan escalabilidad o mantenibilidad | `software-architect` | `software-architect` |

**Regla**: si una tarea implica escribir código en múltiples capas o tomar decisiones de diseño que afectan al sistema, lanza el agente correspondiente **antes** de implementar.

## Skills del proyecto

Las skills están en `../.agents/skills/`. Lee el `SKILL.md` correspondiente con `Read` **antes** de abordar cualquier tarea que encaje con la descripción.

| Cuándo | Skill | SKILL.md |
|--------|-------|----------|
| Cualquier tarea creativa: nueva feature, componente, funcionalidad o cambio de comportamiento | `brainstorming` | `../.agents/skills/brainstorming/SKILL.md` |
| Construir o estilizar componentes web, páginas, dashboards, layouts HTML/CSS/React | `frontend-design` | `../.agents/skills/frontend-design/SKILL.md` |
| Revisar, mejorar o auditar UI: accesibilidad, paletas, tipografía, UX, dark mode, animaciones | `ui-ux-pro-max` | `../.agents/skills/ui-ux-pro-max/SKILL.md` |
| Auditar UI contra guidelines y buenas prácticas web | `web-design-guidelines` | `../.agents/skills/web-design-guidelines/SKILL.md` |
| Escribir, revisar o refactorizar React/Next.js: performance, bundle, data fetching | `vercel-react-best-practices` | `../.agents/skills/vercel-react-best-practices/SKILL.md` |
| Bug difícil, regresión de rendimiento, algo roto o que falla | `diagnose` | `../.agents/skills/diagnose/SKILL.md` |
| Construir features o arreglar bugs con TDD (red-green-refactor) | `tdd` | `../.agents/skills/tdd/SKILL.md` |
| Mejorar arquitectura, refactorizar, consolidar módulos acoplados | `improve-codebase-architecture` | `../.agents/skills/improve-codebase-architecture/SKILL.md` |
| Prototipar antes de comprometerse: mockup de UI, sanity-check de modelo de datos | `prototype` | `../.agents/skills/prototype/SKILL.md` |
| Stress-test de un plan o diseño ("grílame sobre esto") | `grill-me` | `../.agents/skills/grill-me/SKILL.md` |
| Stress-test de un plan contra el modelo de dominio y ADRs del proyecto | `grill-with-docs` | `../.agents/skills/grill-with-docs/SKILL.md` |
| Convertir un plan/spec/PRD en issues independientes en el tracker | `to-issues` | `../.agents/skills/to-issues/SKILL.md` |
| Crear un PRD desde el contexto de la conversación | `to-prd` | `../.agents/skills/to-prd/SKILL.md` |
| Triaje de issues, preparar bugs o features para el tracker | `triage` | `../.agents/skills/triage/SKILL.md` |
| Entender código desconocido o cómo encaja en el contexto más amplio | `zoom-out` | `../.agents/skills/zoom-out/SKILL.md` |
| Interactuar con un navegador: navegar, rellenar forms, screenshots, scraping, QA | `agent-browser` | `../.agents/skills/agent-browser/SKILL.md` |
| Queries, schema o configuración de Postgres/Supabase | `supabase-postgres-best-practices` | `../.agents/skills/supabase-postgres-best-practices/SKILL.md` |
| Escribir, explicar o depurar workflows de GitHub Actions | `github-actions-docs` | `../.agents/skills/github-actions-docs/SKILL.md` |
| Reducir tokens ~75% en comunicación técnica comprimida | `caveman` | `../.agents/skills/caveman/SKILL.md` |
| Crear una nueva skill para este proyecto | `write-a-skill` | `../.agents/skills/write-a-skill/SKILL.md` |
| Buscar o instalar skills para nuevas capacidades | `find-skills` | `../.agents/skills/find-skills/SKILL.md` |

### Script de ui-ux-pro-max

```bash
python3 ../.agents/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system
python3 ../.agents/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain <ux|style|color|typography|chart>
```
