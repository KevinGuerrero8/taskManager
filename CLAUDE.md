# CLAUDE.md — Organizador de Tareas

Organizador de tareas (proyectos → tareas, dashboard, lista/kanban, calendario).
HTML/CSS/JS vanilla, **sin build step**, datos en `localStorage` del navegador.
Publicado en `tareas.kevdevstores.site` vía GitHub Pages.

## De dónde viene

Implementado a partir de un diseño de alta fidelidad hecho en claude.ai/design,
exportado a `~/Dev/Sandbox/Diseño de portafolio.zip` (handoff:
`Organizador de Tareas.dc.html` + `README.md`). El `.dc.html` es un prototipo
en un formato interno (`DCLogic`), no código de producción — se usó como spec
ejecutable: la paleta, tipografía y sobre todo la lógica de negocio (cálculo
de vencimientos, scoring del dashboard, grilla del calendario) se tradujeron
1:1 a JS vanilla en `js/logica.js` y `js/estado.js`.

## Por qué vanilla JS, sin framework

La app es un CRUD de estado en memoria + `localStorage`, sin necesidad real de
reactividad de un framework. Sin build step, el deploy a GitHub Pages es
"servir los archivos tal cual" — no hay que mantener un workflow de
compilación. Si en algún momento se agrega sync entre dispositivos con backend
real, ahí sí conviene reevaluar el stack.

## Arquitectura

```
index.html               shell: fuentes (Archivo + Inter Tight), CSS, <div id="app">
css/estilos.css           tokens (custom properties) + estilos de componentes
js/
  dom.js                  helper mínimo tipo hyperscript para construir DOM sin plantillas
  logica.js                reglas de negocio puras: fechas locales (nunca toISOString,
                           ver nota abajo), prioridad, scoring del dashboard, calendario
  estado.js                modelo (Project/Task), semilla inicial, persistencia,
                           todos los mutadores de estado (uno por acción de usuario)
  render.js                orquesta el re-render completo de #app en cada acción
  vistas/                  dashboard.js, proyectos.js, proyecto.js (lista+kanban), calendario.js
  componentes/             barraLateral.js, modalTarea.js (ver/editar/crear), modalProyecto.js
  main.js                  entry point: conecta acciones (estado + persistir + render)
```

Patrón: `main.js` mantiene el único objeto de estado mutable (`estadoApp`) y
envuelve cada mutador de `estado.js` en una función que persiste y vuelve a
renderizar. Las vistas y componentes son funciones puras `(estadoApp, acciones) => nodoDOM`,
no conocen `estado.js` directamente — así no hay imports circulares.

Sin virtual DOM: en cada acción se reconstruye el árbol completo de `#app`
(`raiz.replaceChildren(...)`). El tamaño de la app no justifica un diff más
fino.

**Sin URL routing a propósito** — la vista activa (`dashboard | proyectos |
proyecto | calendario`) vive solo en memoria, igual que especificaba el
diseño original. Si en el futuro se quiere que el botón "atrás" del navegador
funcione o que se pueda compartir un link a una vista puntual, ahí se agrega
hash routing — hoy no hace falta.

## Decisión de diseño que conviene no deshacer

**Fechas siempre por componentes Y/M/D locales, nunca `Date.toISOString()`**
(`js/logica.js`). El prototipo original tenía un bug donde mezclaba
`toISOString()` (UTC) con comparaciones de medianoche local, lo que corrompía
el cálculo de "días hasta vencer" para usuarios al oeste de UTC. Toda la
matemática de fechas (ranking del dashboard, celdas del calendario) depende de
esto — si se toca `fechaISO`/`fechaLocal`, hay que mantener esa disciplina.

## Estado y pendientes

- **Persistencia**: solo `localStorage`, un dispositivo a la vez. Decisión
  explícita de Kevin — la sincronización entre dispositivos (backend + DB)
  queda para más adelante, no está planeada todavía.
- **Dominio**: `kevdevstores.site` (GoDaddy). Registro DNS: `CNAME` en el host
  `tareas` apuntando a `kevinguerrero8.github.io.`. Archivo `CNAME` en la raíz
  del repo con el mismo valor — es lo que le dice a GitHub Pages qué dominio
  servir.
- **GitHub Pages**: deploy from branch (`main`/root), sin Actions workflow —
  no hace falta al no haber build step.
- Sin probar todavía: acceso desde un segundo dispositivo real (móvil) y
  navegadores fuera de los usados durante el desarrollo.
