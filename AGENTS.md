# Overview

Este proyecto es una aplicación **Angular 20 standalone** orientada a la edición de Markdown con vista previa en vivo. La app se inicializa con `bootstrapApplication` y tiene a `AppComponent` como punto central de composición. El estado local se gestiona principalmente con **signals** y **computed**, evitando complejidad innecesaria cuando no hace falta un store global.

La aplicación ofrece un flujo de edición centrado en productividad: renderizado Markdown en tiempo real, sanitización del HTML generado, resaltado de bloques de código, extensiones personalizadas para alertas, modales de inserción de contenido, búsqueda dentro del editor, atajos de teclado globales y soporte de importación/exportación de archivos `.md`.

---

# Estructura del proyecto

Estructura relevante del código:

- `src/app/components`  
  Componentes reutilizables y piezas principales de UI, incluyendo editor, preview, modales y controles asociados.

- `src/app/layouts`  
  Layouts y composición estructural de pantallas o contenedores visuales.

- `src/app/services`  
  Servicios compartidos, por ejemplo para atajos de teclado u otra lógica transversal que no debe quedar dispersa en componentes.

- `src/app/config`  
  Configuración reutilizable de la app, integraciones y constantes de comportamiento.

- `src/app/utils/data`  
  Datos utilitarios y estructuras estáticas compartidas.

- `src/app/utils/types`  
  Tipos de TypeScript reutilizables para mantener contratos claros y evitar tipado implícito o duplicado.

- `public/`  
  Assets públicos estáticos.

- `tests/`  
  Pruebas unitarias/integración con **Jest**.

- `e2e/`  
  Pruebas end-to-end con **Playwright**.

---

# Dependencias clave

## Runtime y UI

- **Angular 20**: base del proyecto, arquitectura standalone y composición principal.
- **marked**: parser/renderizador de Markdown.
- **DOMPurify**: sanitización del HTML generado antes de mostrarlo en preview.
- **highlight.js**: resaltado sintáctico para bloques de código.
- **Tailwind CSS v4**: estilos utilitarios y soporte del tema visual.

## Calidad y testing

- **Jest**: pruebas unitarias.
- **Playwright**: pruebas end-to-end.
- **ESLint**: reglas de calidad y consistencia.
- **Prettier**: formato de código.
- **Husky**: automatización de hooks de git.
- **commitlint**: validación del formato de commits.

---

# Principales funcionalidades

- **Editor Markdown con preview en vivo**  
  La edición actualiza la representación renderizada de forma inmediata.

- **Render de Markdown con `marked`**  
  El contenido se transforma a HTML usando `marked`.

- **Sanitización con `DOMPurify`**  
  Todo HTML destinado al preview debe pasar por sanitización antes de insertarse en la UI.

- **Resaltado de código con `highlight.js`**  
  Los bloques de código renderizados se mejoran visualmente con highlight sintáctico.

- **Extensiones custom para alerts**  
  El parser/render del Markdown incorpora extensiones específicas para bloques tipo alerta.

- **Modales de inserción**  
  Existen modales dedicados para insertar o configurar:
  - Link
  - Image
  - Block Code
  - Table

- **Servicio global de atajos de teclado**  
  Los atajos no deben implementarse de forma aislada en cada componente si su comportamiento es transversal.

- **Búsqueda dentro del editor**  
  El editor incorpora capacidades de búsqueda sobre el contenido.

- **Importación y exportación de `.md`**  
  El usuario puede cargar y descargar contenido Markdown.

- **Tema oscuro en editor y preview**  
  La experiencia visual contempla modo oscuro como comportamiento relevante del producto.

---

# Ejecución

## Scripts principales

- `npm run start`  
  Levanta la aplicación en desarrollo.

- `npm run build`  
  Genera la build de producción.

- `npm run build:gh`  
  Genera la build adaptada al flujo de despliegue para GitHub Pages.

- `npm run watch`  
  Ejecuta compilación en modo observación.

## Calidad

- `npm run lint`  
  Ejecuta ESLint.
- `npm run lint:fix`  
  Intenta corregir automáticamente problemas de lint/formato.

## Testing unitario

- `npm run test`  
  Ejecuta la suite con Jest.
- `npm run test:watch`  
  Ejecuta Jest en modo watch.
- `npm run test:coverage`  
  Genera cobertura de pruebas.

## Testing end-to-end

- `npm run e2e`  
  Ejecuta Playwright.
- `npm run e2e:ui`  
  Abre Playwright en modo UI.
- `npm run e2e:debug`  
  Ejecuta pruebas e2e con depuración.
- `npm run e2e:report`  
  Muestra el reporte de Playwright.

---

# Reglas

## Arquitectura y organización

- Usar **standalone components** como enfoque por defecto.
- Mantener `AppComponent` como punto central de composición de la app.
- Evitar dispersar lógica reusable en componentes; mover comportamiento compartido a:
  - `services`
  - `config`
  - `utils/data`
  - `utils/types`

## Estado y reactividad

- **Preferir `signals` y `computed` para estado local**.
- Evitar introducir soluciones de estado más pesadas si el caso puede resolverse localmente y de forma clara.

## Estilo Angular/TypeScript

- Usar `inject()` de forma consistente en lugar de patrones más antiguos cuando aplique.
- Mantener **type imports** consistentes.
- **No usar `any`** salvo justificación excepcional y explícita.
- Priorizar tipado claro, pequeño y reutilizable.

## Seguridad y renderizado

- Todo HTML generado desde Markdown debe considerarse no confiable hasta pasar por **DOMPurify**.
- No saltarse la sanitización en flujos de preview o render intermedio.

## Calidad

- **ESLint y Prettier son obligatorios** antes de integrar cambios.
- Mantener el código alineado con las reglas ya establecidas por el repositorio.
- No introducir patrones incompatibles con la arquitectura standalone actual.

## Testing

- Las **pruebas unitarias** viven en `tests/`.
- Las **pruebas e2e** viven en `e2e/`.
- Los cambios relevantes en lógica, UI crítica o flujos principales deben venir acompañados por pruebas adecuadas.

## Alcance de cambios

- Favorecer cambios pequeños, coherentes y localizados.
- Si una lógica empieza a reutilizarse o crecer, extraerla tempranamente a una abstracción compartida en lugar de duplicarla.
