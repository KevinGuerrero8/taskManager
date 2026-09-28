import { el } from "./dom.js";
import { barraLateral } from "./componentes/barraLateral.js";
import { modalTarea } from "./componentes/modalTarea.js";
import { modalProyecto } from "./componentes/modalProyecto.js";
import { vistaDashboard } from "./vistas/dashboard.js";
import { vistaProyectos } from "./vistas/proyectos.js";
import { vistaProyecto } from "./vistas/proyecto.js";
import { vistaCalendario } from "./vistas/calendario.js";

const VISTAS = {
  dashboard: vistaDashboard,
  proyectos: vistaProyectos,
  proyecto: vistaProyecto,
  calendario: vistaCalendario,
};

export function render(estadoApp, acciones, raiz) {
  const movil = estadoApp.ancho < 780;
  const construirVista = VISTAS[estadoApp.vista] || vistaDashboard;

  const arbol = el("div", { clase: "raiz" + (movil ? " raiz--movil" : "") }, [
    barraLateral(estadoApp, acciones),
    el("main", { clase: "contenido-principal" }, [construirVista(estadoApp, acciones)]),
    modalTarea(estadoApp, acciones),
    modalProyecto(estadoApp, acciones),
  ]);

  raiz.replaceChildren(arbol);
}
