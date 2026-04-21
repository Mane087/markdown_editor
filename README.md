![logo](/public/imgs/M.svg)

![](https://img.shields.io/github/stars/mane087/markdown_editor.svg) ![](https://img.shields.io/github/forks/mane087/markdown_editor.svg) ![](https://img.shields.io/github/release/mane087/markdown_editor.svg) ![](https://img.shields.io/github/issues/mane087/markdown_editor.svg)

---

[ES](/README.md)/[US](/documentation/doc.md)

# Descripcion

[MD-Editor](https://mane087.github.io/markdown_editor/) es un proyecto open source diseñado para facilitar la creación y edición de archivos Markdown (.md).

El objetivo principal del proyecto es ofrecer una herramienta online, intuitiva y práctica que cubra la mayoría de las necesidades comunes al momento de documentar proyectos, escribir guías técnicas o crear contenido en Markdown.

La aplicación está pensada tanto para desarrolladores como para cualquier persona que necesite escribir documentación clara y estructurada sin preocuparse por recordar toda la sintaxis del lenguaje

![home_app](/public/imgs/home_app.png)

## Características principales

MD-Editor ofrece una experiencia de edición optimizada mediante herramientas visuales y atajos de teclado que agilizan el flujo de trabajo.
El editor cuenta con un conjunto de botones interactivos que permiten insertar automáticamente elementos Markdown comunes, tales como:

- Títulos
- Bloques de código
- Imágenes
- Enlaces
- Listas
- Citas, entre otros

Esto permite enfocarse en el contenido sin perder tiempo escribiendo sintaxis manualmente.

- Soporta pegar imágenes desde el portapapeles directamente en el textarea del editor y en el modal de imagen.
- Las imágenes pegadas se guardan localmente en `localStorage` y se insertan en el Markdown mediante referencias `local-image://...`.
- La vista previa resuelve esas referencias locales para mostrar la imagen renderizada sin subir archivos a un servidor.
- Estas referencias dependen del almacenamiento local del navegador, por lo que el Markdown resultante no es portable como imagen real fuera de ese entorno.

![menu_app](/public/imgs/menu_app.png)

Puedes consultar el detalle completo de las funcionalidades disponibles en la sección de: [opciones del editor](/documentation/options_es.md).

## Atajos de teclado (Shortcuts)

Además de la inserción mediante botones, MD-Editor incluye atajos de teclado que permiten ejecutar las mismas acciones de forma rápida y eficiente, mejorando notablemente la productividad.

La lista completa de shortcuts y su funcionamiento se encuentra documentada en: [shortcuts del editor](/documentation/options_es.md).

## Aprender a usar Markdown

Si aún no estás familiarizado con el lenguaje Markdown o deseas reforzar tus conocimientos, puedes consultar este repositorio: [Guía de Markdown](https://github.com/Mane087/Markdown).

Ahí encontrarás ejemplos prácticos y explicaciones claras sobre la sintaxis y sus usos más comunes.
