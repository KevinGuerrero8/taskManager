# Organizador de Tareas

Organizador de tareas por proyectos: dashboard, vista de lista/tablero por
proyecto y calendario mensual. HTML/CSS/JS vanilla, sin build step, datos en
`localStorage` del navegador.

Publicado en [tareas.kevdevstores.site](https://tareas.kevdevstores.site).

## Desarrollo local

No hay dependencias ni paso de build. Cualquier servidor estático alcanza:

```bash
python3 -m http.server 8000
# o
npx serve .
```

Y abrir `http://localhost:8000`.

## Estructura

```
index.html
css/estilos.css       tokens de diseño + estilos de componentes
js/
  logica.js           reglas de negocio puras (fechas, prioridad, calendario)
  estado.js           modelo de datos, semilla, persistencia y mutadores
  render.js           orquesta el re-render completo según la vista activa
  vistas/             dashboard, proyectos, proyecto (lista/kanban), calendario
  componentes/        barra lateral, modal de tarea, modal de nuevo proyecto
  main.js             punto de entrada: conecta acciones, estado y render
```

Ver [CLAUDE.md](CLAUDE.md) para las decisiones de diseño y el estado del
proyecto.
