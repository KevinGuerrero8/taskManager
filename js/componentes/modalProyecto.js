import { el } from "../dom.js";

export function modalProyecto(estadoApp, acciones) {
  const pm = estadoApp.modalProyecto;
  if (!pm) return null;

  return el("div", { clase: "modal-fondo" }, [
    el("button", { clase: "modal-scrim", type: "button", "aria-label": "Cerrar", onClick: acciones.cerrarModalProyecto }),
    el("div", { clase: "modal modal--chico" }, [
      el("h3", { clase: "modal__titulo modal__titulo--chico" }, "Nuevo proyecto"),
      el("div", { clase: "campo", style: "margin-bottom:20px" }, [
        el("label", { clase: "campo__etiqueta" }, "Nombre"),
        el("input", {
          clase: "campo__input",
          "data-foco": "proyecto-nombre",
          value: pm.nombre,
          placeholder: "Ej. Rediseño web",
          onInput: (e) => acciones.cambiarNombreNuevoProyecto(e.target.value),
        }),
      ]),
      el("div", { style: "display:flex; gap:10px" }, [
        el("button", { clase: "boton-pastilla boton-pastilla--acento", type: "button", style: "flex:1; justify-content:center", onClick: acciones.guardarProyecto }, "Crear"),
        el("button", { clase: "boton-pastilla boton-pastilla--outline", type: "button", onClick: acciones.cerrarModalProyecto }, "Cancelar"),
      ]),
    ]),
  ]);
}
