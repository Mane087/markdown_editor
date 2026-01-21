---
description: Guia para documentar codigo
---

## Objetivo

Estandarizar la documentacion de funciones, metodos, clases, components y modulos usando una estructura fija:

- Params (solo si existen)
- Descripcion
- Return (solo si aplica y no es void / no retorna)
- Dependencias (solo si aplica)

## Alcance

### Se documenta (REQUIRED)

- Funciones publicas (API del modulo).
- Metodos publicos de clases.
- Widgets reutilizables (componentes compartidos).
- Clases de servicios, repositorios, controllers/notifiers, providers.
- Cualquier unidad que encapsule logica de negocio o reglas relevantes.

### Se documenta si aporta valor (OPTIONAL)

- Funciones privadas con logica no obvia (algoritmos, parsing, validaciones complejas, transformaciones).
- Helpers internos usados por varios puntos del codigo.

### No se documenta (SKIP)

- Getters/setters triviales.
- Wrappers obvios (delegan 1:1 sin logica).
- Codigo auto-generado.
- Metodos de UI que solo construyen layout sin logica relevante.

## Reglas de contenido

### Regla 1: Documenta el "que" y el "por que"

- Que hace la unidad y por que existe (cuando no sea obvio por el nombre).
- Evita narrar el "como" paso a paso salvo que haya una decision tecnica importante.

### Regla 2: Manten la documentacion alineada a la firma

- Si cambias parametros, tipos o retorno, actualiza la doc en el mismo commit.

### Regla 3: Side-effects deben quedar explicitos

- Si la unidad hace algo fuera de su propio scope (I/O, DB, red, navegacion, logs, cache, estado global), debe mencionarse en Descripcion o Dependencias.

### Regla 4: No inventes

- Si no estas seguro de un detalle (por ejemplo, si una funcion lanza excepcion en todos los casos o solo algunos), revisa el codigo antes de afirmar.

## Flujo de trabajo (paso a paso)

### Paso 1: Clasifica la unidad

Identifica si es:

- Funcion / metodo
- Clase / servicio
- Component
- Provider / controller / notifier
- Modulo

Esto define que tan explicito debe ser el "Return" y que dependencias son relevantes.

### Paso 2: Extrae informacion minima

Recolecta:

- Responsabilidad en 1 frase.
- Entradas: parametros reales + restricciones (nullability, rangos, formato, defaults).
- Salida: retorno o efecto (si no retorna).
- Errores: casos tipicos (errores esperables).
- Dependencias: funciones/servicios/providers externos usados.

### Paso 3: Escribe la doc con estructura fija

Usa las secciones en orden:

- `## Params` (si existen)
- `## Descripcion`
- `## Return` (si aplica)
- `## Dependencias` (si aplica)

Regla: si una seccion no aplica, no se incluye.

### Paso 4: Revision rapida

Verifica:

- Los Params coinciden con la firma real.
- La descripcion agrega valor mas alla del nombre.
- Return es correcto y util (no redundante).
- Dependencias menciona lo importante (sin ruido).

## Plantillas oficiales

### Plantilla A: Funcion / metodo

```markdown
## Params

- `<param>`: `<tipo/forma>`. `<restricciones>`. `<ejemplo si ayuda>`.

## Descripcion

- `<Que hace>`. `<Cuando se usa>`. `<Side-effects si aplica>`.

## Return

- `<Que retorna>` y bajo que condiciones. `<errores/excepciones si aplica>`.

## Dependencias

- `<funcion/servicio/provider>`: `<para que se usa>`.
```

### Plantilla B: Clase / servicio

```markdown
## Descripcion

- Encapsula `<responsabilidad>`. Orquesta `<casos de uso>`. Garantiza `<invariantes>`.

## Params

- `<dependency>`: `<por que se inyecta>`. _(si aplica; constructor)_

## Dependencias

- `<repo/client>`: `<uso>`.
- `<helper>`: `<uso>`.
```

### Ejemplo completo (generico)

```markdown
## Params

- `userId`: `String`. Must be a non-empty UUID.

## Descripcion

- Fetches the user profile from the local cache; if missing, loads it from the remote API and updates the cache.

## Return

- `UserProfile` loaded from cache or remote source.

## Dependencias

- `userRepository`: reads/writes profile data.
- `apiClient`: fetches profile when not cached.
```

## Checklist de calidad (antes de commit)

- La documentacion esta en el orden Params -> Descripcion -> Return -> Dependencias.
- Se omitieron secciones que no aplican.
- Los Params coinciden con nombre, tipo y comportamiento real.
- La Descripcion explica proposito y side-effects si existen.
- El Return es correcto y no redundante.
- Las Dependencias listan solo lo relevante.
- La doc sigue siendo cierta despues de los cambios del commit.
