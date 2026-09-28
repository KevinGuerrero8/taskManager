import { el } from "../dom.js";
import { tarjetasProyecto } from "../logica.js";

export function barraLateral(estadoApp, acciones) {
  const vista = estadoApp.vista;

  const itemNav = (etiqueta, activo, onClick) =>
    el("button", {
      clase: "nav-item" + (activo ? " nav-item--activo" : ""),
      type: "button",
      onClick,
    }, etiqueta);

  return el("nav", { clase: "barra-nav" }, [
    el("div", { clase: "logo" }, [
      el("span", { clase: "logo__punto" }),
      el("span", { clase: "logo__texto" }, "Tareas"),
    ]),
    el("div", { clase: "nav-items" }, [
      itemNav("Dashboard", vista === "dashboard", acciones.irADashboard),
      itemNav("Proyectos", vista === "proyectos" || vista === "proyecto", acciones.irAProyectos),
      itemNav("Calendario", vista === "calendario", acciones.irACalendario),
    ]),
    accesosProyectos(estadoApp, acciones),
    el("button", {
      clase: "boton-nuevo-proyecto",
      type: "button",
      onClick: acciones.abrirNuevoProyecto,
    }, "+ Nuevo proyecto"),
  ]);
}

// Accesos directos a cada proyecto. Reutiliza tarjetasProyecto (la misma
// fuente que la vista Proyectos) para que el conteo de pendientes nunca
// difiera entre la barra y las tarjetas.
function accesosProyectos(estadoApp, acciones) {
  const proyectos = tarjetasProyecto(estadoApp.proyectos);
  if (!proyectos.length) return null;

  return el("div", { clase: "nav-proyectos" }, [
    el("div", { clase: "nav-proyectos__titulo" }, "Mis proyectos"),
    el("div", { clase: "nav-proyectos__lista" }, proyectos.map((p) => {
      const activo = estadoApp.vista === "proyecto" && estadoApp.proyectoActivoId === p.id;
      const pendientes = p.total - p.hechas;
      return el("button", {
        clase: "nav-proyecto" + (activo ? " nav-proyecto--activo" : ""),
        type: "button",
        title: p.nombre,
        onClick: () => acciones.abrirProyecto(p.id),
      }, [
        el("span", { clase: "nav-proyecto__punto" }),
        el("span", { clase: "nav-proyecto__nombre" }, p.nombre),
        pendientes > 0 ? el("span", { clase: "nav-proyecto__conteo" }, pendientes) : null,
      ]);
    })),
  ]);
}
