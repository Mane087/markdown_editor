---
trigger: always_on
---

# Guia para trabajar con Angular

Esta guia define como debes actuar al trabajar en proyectos Angular para asegurar calidad, mantenibilidad, pruebas, rendimiento y estandares actuales.

**Nota de contexto:** Angular v21 impulsa zoneless change detection (Zone.js ya no viene por defecto) y consolida el camino "moderno" (standalone, control flow, signals).

---

## 0. Fuentes de documentacion (URLs)

### Angular (oficial)

- Docs (home): <https://angular.dev>
- Style guide: <https://angular.dev/style-guide>
- Runtime performance: <https://angular.dev/best-practices/runtime-performance>
- Signals (overview): <https://angular.dev/guide/signals>
- Control flow (@if/@for/@switch): <https://angular.dev/guide/templates/control-flow>
- @defer (deferred loading): <https://angular.dev/guide/templates/defer>
- Zoneless: <https://angular.dev/guide/zoneless>
- provideZonelessChangeDetection: <https://angular.dev/api/core/provideZonelessChangeDetection>
- Testing overview: <https://angular.dev/guide/testing>
- E2E con Angular CLI: <https://angular.dev/tools/cli/end-to-end>
- Accessibility best practices: <https://angular.dev/best-practices/a11y>
- HTTP setup: <https://angular.dev/guide/http/setup>
- HTTP interceptors: <https://angular.dev/guide/http/interceptors>

### CDK (accesibilidad)

- CDK a11y: <https://material.angular.dev/cdk/a11y>

## 1. Flujo obligatorio antes de escribir codigo

### Entender el objetivo y el Definition of Done

- Plataforma (web/SSR/desktop via wrapper, etc.).
- Capa afectada (UI, routing, state, HTTP, persistencia, testing, performance).
- Restricciones del repo (estilo, arquitectura, librerias permitidas, SSR, i18n, etc.).

### Evaluar impacto y proponer el plan minimo

- Cambios incrementales (evitar re-arquitecturas por defecto).
- Minimizar acoplamiento y maximizar testabilidad.

### Construir en "vertical slice"

- UI + state + data (si aplica) con limites claros.
- Puntos de prueba desde el inicio (services, componentes criticos).

### Validacion antes de entregar

- Tipado estricto y sin hacks.
- Errores explicitos y testeables.
- Pruebas razonables segun criticidad (unit/component/e2e).

## 2. Reglas de diseno y arquitectura (no negociables)

### 2.1 Responsabilidad unica y composicion

- Componentes pequenos con una responsabilidad.
- Preferir composicion (componentes + directivas + pipes) sobre "mega componentes".
- Evitar abstracciones prematuras.

### 2.2 Separacion por capas (minimo recomendado)

- UI: components/templates (sin logica de negocio pesada).
- State/ViewModel: servicios "facade", signals/store local, coordinacion de UI.
- Data: services + repositories + clients (HTTP, storage).
- Domain (opcional): casos de uso si el producto lo requiere.

### 2.3 Estructura de carpetas (convencion)

Sigue el style guide: prioriza organizacion, con carpetas por "tipo" (components/services/etc.)

Ejemplo:

```text
e2e/
public/
src/
  app/
    components/
    layouts/
    utils/
    app.component.html
    app.component.css
    app.component.ts
    app.config.ts
    app.routes.ts
  shared/
  core/
  index.html
  main.ts
  styles.css
  test/
```

## 3. Estado y reactividad: reglas y restricciones

### 3.1 Signals como base moderna (si el proyecto lo permite)

- Preferir Signals para estado local y derivaciones (computed) cuando el caso sea UI-centric.
- Para reactividad asincrona, usa patrones consistentes (RxJS o recursos/senales segun el stack del repo).
- Si el repo usa RxJS intensivo, no "re-escribas todo a signals" sin requerimiento.

### 3.2 RxJS sigue siendo valido (no mezclar sin criterio)

- Regla: el proyecto debe definir su "columna vertebral" (Signals-first o RxJS-first) y mantener consistencia.
- Interop existe, pero se usa para integracion, no para crear hibridos caoticos.

### 3.3 Inmutabilidad como norma

- Estado (especialmente listas/colecciones) debe actualizarse de forma predecible.
- Evitar mutacion silenciosa que dificulte debugging.

### 3.4 Async con estados explicitos

- Cargas y errores deben ser visibles y testeables (loading/error/data).
- No "tragar" errores: mapear a estados o propagar para manejo en UI/tests.

## 4. UI/Templates: reglas practicas para calidad y performance

### 4.1 Control flow moderno

- Preferir @if/@for/@switch (built-in control flow) en codigo nuevo si el repo esta en esa linea.
- Evitar patrones que el propio framework desaconseja (por ejemplo, condicionar ng-content con control flow).

### 4.2 Reducir trabajo de rendering

- Mantener templates baratos: evita trabajo pesado por binding.
- Optimiza con fundamento: Angular es rapido por defecto, pero change detection puede degradarse si se dispara demasiado.

### 4.3 Deferred loading

- Considera @defer para diferir dependencias UI cuando mejore LCP/TTI y el caso lo justifique.

### 4.4 Rendimiento: medir antes de optimizar

- No micro-optimizar si complica el codigo sin evidencia.
- Prioriza cambios que reduzcan recomputacion y re-render innecesario, respaldados por medicion/perfilado.

## 5. HTTP, DI y configuracion (estandar moderno)

### 5.1 HttpClient moderno

- Configurar HttpClient a nivel raiz con provideHttpClient(...).
- En SSR, Angular recomienda habilitar fetch (withFetch()) para rendimiento/compatibilidad.

### 5.2 Interceptors

- Preferir interceptores funcionales (withInterceptors) por orden y comportamiento mas predecible.
- Evitar introducir interceptores DI "legacy" salvo compatibilidad/migracion.

## 6. Zoneless: guardrails (si el proyecto esta en v21+)

- Angular v21 impulsa que Zone.js no venga por defecto, y ofrece configuracion zoneless.
- Regla: si el repo es zoneless, evita patrones de test que "fuerzan" change detection manualmente como habito (ajusta pruebas a la filosofia del repo).

## 7. Persistencia local (opcional)

Angular no impone DB. Si aplica (IndexedDB/localStorage/cache), reglas minimas:

- Encapsular persistencia detras de services/repositories (no en componentes).
- Definir explicitamente:
  - que se cachea,
  - TTL/invalidacion,
  - estrategia offline,
  - manejo de errores,
  - impacto en SSR (si aplica).

## 8. Testing: politica minima obligatoria

Angular Docs enfatiza pruebas para refactor seguro, con setup moderno (incluye Vitest como default en nuevos proyectos).

### 8.1 Piramide practica (minimo)

- Unit tests: logica pura en services, utilidades, pipes.
- Component tests: comportamiento del componente + template + inputs/outputs.
- E2E: flujos criticos (pocos, pero solidos) usando el enfoque del CLI.

### 8.2 Regla por cambio

- Cambias logica de service/util -> unit test.
- Cambias UI con interaccion -> component test.
- Cambias flujo critico o routing relevante -> E2E (limitado por costo).

### 8.3 HTTP testing (obligatorio para services HTTP)

- Mock del backend con utilidades oficiales para assertions y respuestas simuladas.

## 9. Accesibilidad (A11y): minimo no negociable

- Seguir practicas oficiales para que la app funcione bien con tecnologias asistivas.
- Para componentes complejos, usar utilidades del CDK a11y cuando aplique.

## 10. Robustez y guardrails (IA trabajando con Angular)

### Validacion y correccion

- No entregar cambios "dudosos" sin validacion (tests/lint/build).

### Errores y logging

- No ocultar excepciones.
- Errores deben ser observables y testeables.

### Restriccion: no introducir no-determinismo

- Tiempo/red/aleatoriedad deben inyectarse (DI) y ser mockeables.

## 11. Checklist de entrega (antes de responder)

- Respeta el style guide (naming, organizacion por feature cuando aplique).
- Componentes pequenos; sin "god components".
- Reactividad consistente (Signals/RxJS) sin mezclas arbitrarias.
- Templates con control flow moderno si el repo lo usa.
- Performance sin adivinanzas; optimizacion guiada por medicion.
- HTTP configurado de forma moderna; interceptores funcionales preferidos.
- Pruebas segun impacto (unit/component/e2e) y HTTP mocking donde aplique.
- Accesibilidad considerada (roles, labels, foco, teclado).
- No se agregaron dependencias innecesarias.
- Manejo de errores explicito y testeable.
