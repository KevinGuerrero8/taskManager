import { el } from "../dom.js";
import { tarjetasProyecto } from "../logica.js";

function tarjetaProyecto(p, acciones) {
  return el("div", { clase: "tarjeta-proyecto tarjeta-proyecto--grande" }, [
    el("button", {
      clase: "tarjeta-clic",
      type: "button",
      onClick: () => acciones.abrirProyecto(p.id),
    }, [
      el("div", { clase: "tarjeta-proyecto__nombre" }, p.nombre),
      el("div", { clase: "tarjeta-proyecto__meta", style: "margin-bottom:10px" }, `${p.hechas}/${p.total} tareas completadas`),
      el("div", { clase: "barra-progreso" }, [
        el("i", { clase: "barra-progreso__relleno", style: `width:${p.porcentajeBarra}` }),
      ]),
    ]),
    el("div", { clase: "tarjeta-proyecto__pie" }, [
      el("button", {
        clase: "enlace-ver-tareas",
        type: "button",
        onClick: () => acciones.abrirProyecto(p.id),
      }, "Ver tareas →"),
      el("button", {
        clase: "enlace-eliminar",
        type: "button",
        onClick: () => acciones.eliminarProyecto(p.id),
      }, "Eliminar"),
    ]),
  ]);
}

export function vistaProyectos(estadoApp, acciones) {
  const tarjetas = tarjetasProyecto(estadoApp.proyectos);

  const encabezado = el("div", { clase: "encabezado-vista" }, [
    el("h1", { clase: "titulo-vista" }, "Proyectos"),
    el("button", {
      clase: "boton-pastilla boton-pastilla--acento",
      type: "button",
      onClick: acciones.abrirNuevoProyecto,
    }, "+ Nuevo proyecto"),
  ]);

  if (tarjetas.length === 0) {
    return el("div", {}, [encabezado, el("div", { clase: "estado-vacio" }, "Aún no tienes proyectos.")]);
  }

  return el("div", {}, [
    encabezado,
    el("div", { clase: "grid-proyectos grid-proyectos--lista" }, tarjetas.map((p) => tarjetaProyecto(p, acciones))),
  ]);
}
