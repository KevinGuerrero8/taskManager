import { el } from "../dom.js";
import { mapearTareasProyecto } from "../logica.js";

function filaTarea(t, acciones) {
  return el("div", { clase: "fila-tarea" }, [
    el("button", {
      clase: "punto-estado",
      type: "button",
      title: "Cambiar estado",
      style: `border-color:${t.colorPuntoEstado}; background-color:${t.rellenoPuntoEstado}`,
      onClick: () => acciones.ciclarEstadoTarea(t.id),
    }),
    el("button", {
      clase: "fila-tarea__info",
      type: "button",
      onClick: () => acciones.abrirDetalleTarea(t.id),
    }, [
      el("div", {
        clase: "fila-tarea__nombre" + (t.estado === "completada" ? " fila-tarea__nombre--completada" : ""),
      }, t.nombre),
      el("div", { clase: "fila-tarea__estado-label" }, t.etiquetaEstado),
    ]),
    el("span", { clase: "fila-proxima__vencimiento", style: `color:${t.colorVencimiento}` }, t.etiquetaVencimiento),
    el("span", { clase: "badge-prioridad" }, t.etiquetaPrioridad),
  ]);
}

function tarjetaKanban(t, acciones, variante) {
  const clases = ["tarjeta-kanban"];
  if (variante === "progreso") clases.push("tarjeta-kanban--progreso");
  if (variante === "completada") clases.push("tarjeta-kanban--completada");

  return el("button", {
    clase: clases.join(" "),
    type: "button",
    onClick: () => acciones.abrirDetalleTarea(t.id),
  }, [
    el("div", {
      clase: "tarjeta-kanban__nombre" + (variante === "completada" ? " tarjeta-kanban__nombre--completada" : ""),
    }, t.nombre),
    el("div", { clase: "tarjeta-kanban__pie" }, [
      el("span", {
        clase: "tarjeta-kanban__vencimiento",
        style: `color:${variante === "completada" ? "#A6ADB8" : t.colorVencimiento}`,
      }, t.etiquetaVencimiento),
      el("span", { clase: "punto-prioridad", style: `background:${t.colorPrioridad}; width:7px; height:7px` }),
    ]),
  ]);
}

function columnaKanban(titulo, tareas, acciones, variante) {
  return el("div", {}, [
    el("div", { clase: "columna-kanban__titulo" }, `${titulo} · ${tareas.length}`),
    el("div", { clase: "columna-kanban__tarjetas" }, tareas.map((t) => tarjetaKanban(t, acciones, variante))),
  ]);
}

export function vistaProyecto(estadoApp, acciones) {
  const proyecto = estadoApp.proyectos.find((p) => p.id === estadoApp.proyectoActivoId);
  if (!proyecto) {
    return el("div", {}, [
      el("button", { clase: "enlace-volver", type: "button", onClick: acciones.irAProyectos }, "← Proyectos"),
      el("div", { clase: "estado-vacio" }, "Este proyecto ya no existe."),
    ]);
  }

  const tareas = mapearTareasProyecto(proyecto);
  const modoLista = estadoApp.modoTarea === "lista";

  const encabezado = el("div", { clase: "encabezado-vista encabezado-vista--compacto" }, [
    el("h1", { clase: "titulo-vista titulo-vista--proyecto" }, proyecto.nombre),
    el("button", {
      clase: "boton-pastilla boton-pastilla--acento",
      type: "button",
      onClick: acciones.abrirNuevaTarea,
    }, "+ Nueva tarea"),
  ]);

  const toggle = el("div", { clase: "segmentado" }, [
    el("button", {
      clase: "segmentado__opcion" + (modoLista ? " segmentado__opcion--activa" : ""),
      type: "button",
      onClick: acciones.setModoLista,
    }, "Lista"),
    el("button", {
      clase: "segmentado__opcion" + (!modoLista ? " segmentado__opcion--activa" : ""),
      type: "button",
      onClick: acciones.setModoKanban,
    }, "Tablero"),
  ]);

  const contenedor = el("div", {}, [
    el("button", { clase: "enlace-volver", type: "button", onClick: acciones.irAProyectos }, "← Proyectos"),
    encabezado,
    toggle,
  ]);

  if (modoLista) {
    if (tareas.length === 0) {
      contenedor.appendChild(el("div", { clase: "estado-vacio-simple" }, "Sin tareas todavía."));
    } else {
      contenedor.appendChild(el("div", { clase: "lista-tareas" }, tareas.map((t) => filaTarea(t, acciones))));
    }
  } else {
    const pendientes = tareas.filter((t) => t.estado === "pendiente");
    const enProgreso = tareas.filter((t) => t.estado === "progreso");
    const completadas = tareas.filter((t) => t.estado === "completada");
    contenedor.appendChild(
      el("div", { clase: "grid-kanban" }, [
        columnaKanban("Pendiente", pendientes, acciones, "pendiente"),
        columnaKanban("En progreso", enProgreso, acciones, "progreso"),
        columnaKanban("Completada", completadas, acciones, "completada"),
      ])
    );
  }

  return contenedor;
}
