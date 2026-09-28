import { el } from "../dom.js";

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
    el("button", {
      clase: "boton-nuevo-proyecto",
      type: "button",
      onClick: acciones.abrirNuevoProyecto,
    }, "+ Nuevo proyecto"),
  ]);
}
