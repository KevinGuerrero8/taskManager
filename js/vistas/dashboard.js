import { el } from "../dom.js";
import { calcularEstadisticas, tareasProximas, tarjetasProyecto } from "../logica.js";

function filaProxima(t, acciones) {
  return el("button", {
    clase: "fila-proxima",
    type: "button",
    onClick: () => acciones.abrirDetalleTarea(t.id),
  }, [
    el("span", { clase: "punto-prioridad", style: `background:${t.colorPrioridad}` }),
    el("div", {}, [
      el("div", { clase: "fila-proxima__nombre" }, t.nombre),
      el("div", { clase: "fila-proxima__proyecto" }, t.nombreProyecto),
    ]),
    el("span", { clase: "fila-proxima__vencimiento", style: `color:${t.colorVencimiento}` }, t.etiquetaVencimiento),
    el("span", { clase: "badge-prioridad" }, t.etiquetaPrioridad),
  ]);
}

function tarjetaProyectoMini(p, acciones) {
  return el("button", {
    clase: "tarjeta-proyecto",
    type: "button",
    onClick: () => acciones.abrirProyecto(p.id),
  }, [
    el("div", { clase: "tarjeta-proyecto__nombre" }, p.nombre),
    el("div", { clase: "tarjeta-proyecto__meta" }, `${p.hechas}/${p.total} completadas`),
    el("div", { clase: "barra-progreso" }, [
      el("i", { clase: "barra-progreso__relleno", style: `width:${p.porcentajeBarra}` }),
    ]),
  ]);
}

export function vistaDashboard(estadoApp, acciones) {
  const proyectos = estadoApp.proyectos;
  const hayProyectos = proyectos.length > 0;
  const stats = calcularEstadisticas(proyectos);
  const hoyLabel = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });

  const encabezado = el("div", { clase: "encabezado-vista" }, [
    el("h1", { clase: "titulo-vista" }, "Dashboard"),
    el("div", { clase: "encabezado-vista__acciones" }, [
      el("span", { clase: "encabezado-vista__fecha" }, hoyLabel),
      el("button", {
        clase: "boton-pastilla boton-pastilla--acento",
        type: "button",
        onClick: acciones.abrirNuevaTarea,
      }, "+ Nueva tarea"),
    ]),
  ]);

  const tarjetaStat = (etiqueta, valor, alerta) =>
    el("div", { clase: "tarjeta-stat" }, [
      el("div", { clase: "tarjeta-stat__etiqueta" }, etiqueta),
      el("div", { clase: "tarjeta-stat__valor" + (alerta ? " tarjeta-stat__valor--alerta" : "") }, String(valor)),
    ]);

  const filasStats = el("div", { clase: "grid-stats" }, [
    tarjetaStat("Tareas activas", stats.activas, false),
    tarjetaStat("Vencidas", stats.vencidas, stats.vencidas > 0),
    tarjetaStat("En progreso", stats.enProgreso, false),
  ]);

  const contenedor = el("div", {}, [encabezado, filasStats]);

  if (!hayProyectos) {
    contenedor.appendChild(
      el("div", { clase: "estado-vacio" }, [
        el("div", { clase: "estado-vacio__titulo" }, "Aún no tienes proyectos"),
        el("div", { clase: "estado-vacio__texto" }, "Crea el primero para empezar a organizar tareas."),
        el("button", {
          clase: "boton-pastilla boton-pastilla--acento",
          type: "button",
          onClick: acciones.abrirNuevoProyecto,
        }, "+ Nuevo proyecto"),
      ])
    );
    return contenedor;
  }

  const proximas = tareasProximas(proyectos);
  const listaProximas = el("div", { clase: "lista-proximas" }, [
    ...proximas.map((t) => filaProxima(t, acciones)),
    proximas.length === 0
      ? el("div", { clase: "estado-vacio-fila" }, "No hay tareas pendientes. Todo al día.")
      : null,
  ]);

  const tarjetas = tarjetasProyecto(proyectos);
  const gridProyectos = el("div", { clase: "grid-proyectos" }, tarjetas.map((p) => tarjetaProyectoMini(p, acciones)));

  contenedor.appendChild(
    el("div", {}, [
      el("div", { clase: "encabezado-seccion" }, [
        el("h2", { clase: "titulo-seccion" }, "En qué deberías trabajar"),
        el("span", { clase: "encabezado-seccion__nota" }, "próximas por fecha y prioridad"),
      ]),
      listaProximas,
      el("h2", { clase: "titulo-seccion", style: "margin-bottom:14px" }, "Tus proyectos"),
      gridProyectos,
    ])
  );

  return contenedor;
}
