import { el } from "../dom.js";
import { etiquetaPrioridad, colorPrioridad, etiquetaEstado, infoVencimiento } from "../logica.js";

const PRIORIDADES = ["baja", "media", "alta"];
const ESTADOS = [
  ["pendiente", "Pendiente"],
  ["progreso", "En progreso"],
  ["completada", "Completada"],
];

function campoTexto(etiqueta, valor, onInput, extra = {}) {
  return el("div", { clase: "campo" }, [
    el("label", { clase: "campo__etiqueta" }, etiqueta),
    el("input", { clase: "campo__input", value: valor, onInput: (e) => onInput(e.target.value), ...extra }),
  ]);
}

function segmentoPrioridad(borrador, acciones) {
  return el("div", { clase: "opciones-segmentadas" }, PRIORIDADES.map((p) => {
    const activa = borrador.prioridad === p;
    const color = colorPrioridad(p);
    return el("button", {
      clase: "opcion-segmentada",
      type: "button",
      style: activa ? `color:#FFFFFF; background:${color}; border-color:${color}` : "",
      onClick: () => acciones.cambiarBorrador({ prioridad: p }),
    }, etiquetaPrioridad(p));
  }));
}

function segmentoEstado(borrador, acciones) {
  return el("div", { clase: "opciones-segmentadas" }, ESTADOS.map(([valor, etiqueta]) => {
    const activa = borrador.estado === valor;
    return el("button", {
      clase: "opcion-segmentada",
      type: "button",
      style: activa ? "color:#FFFFFF; background:#101318; border-color:#101318" : "",
      onClick: () => acciones.cambiarBorrador({ estado: valor }),
    }, etiqueta);
  }));
}

function formularioTarea(estadoApp, acciones) {
  const borrador = estadoApp.modalTarea.borrador;

  return el("div", { clase: "formulario" }, [
    campoTexto("Nombre", borrador.nombre, (v) => acciones.cambiarBorrador({ nombre: v }), {
      placeholder: "Nombre de la tarea",
      "data-foco": "tarea-nombre",
    }),
    el("div", { clase: "campo" }, [
      el("label", { clase: "campo__etiqueta" }, "Proyecto"),
      el("select", {
        clase: "campo__select",
        onChange: (e) => acciones.cambiarBorrador({ proyectoId: e.target.value }),
      }, estadoApp.proyectos.map((p) =>
        el("option", { value: p.id, selected: p.id === borrador.proyectoId ? "selected" : null }, p.nombre)
      )),
    ]),
    el("div", { clase: "campo" }, [
      el("label", { clase: "campo__etiqueta" }, "Fecha límite"),
      el("input", {
        clase: "campo__input",
        type: "date",
        value: borrador.fechaLimite || "",
        onChange: (e) => acciones.cambiarBorrador({ fechaLimite: e.target.value }),
      }),
    ]),
    el("div", { clase: "campo" }, [
      el("label", { clase: "campo__etiqueta" }, "Prioridad"),
      segmentoPrioridad(borrador, acciones),
    ]),
    el("div", { clase: "campo" }, [
      el("label", { clase: "campo__etiqueta" }, "Estado"),
      segmentoEstado(borrador, acciones),
    ]),
    el("div", { clase: "campo" }, [
      el("label", { clase: "campo__etiqueta" }, "Descripción"),
      el("textarea", {
        clase: "campo__textarea",
        rows: 4,
        placeholder: "Detalles de la tarea (opcional)",
        value: borrador.descripcion || "",
        onChange: (e) => acciones.cambiarBorrador({ descripcion: e.target.value }),
      }),
    ]),
    el("div", { clase: "formulario__pie" }, [
      el("button", { clase: "boton-pastilla boton-pastilla--acento", type: "button", onClick: acciones.guardarTarea }, "Guardar"),
      el("button", { clase: "boton-pastilla boton-pastilla--outline", type: "button", onClick: acciones.cancelarEdicionTarea }, "Cancelar"),
    ]),
  ]);
}

function detalleTarea(estadoApp, acciones) {
  const borrador = estadoApp.modalTarea.borrador;
  const proyecto = estadoApp.proyectos.find((p) => p.id === borrador.proyectoId);
  const info = infoVencimiento(borrador.fechaLimite, borrador.estado);

  return el("div", {}, [
    el("h3", { clase: "modal__titulo" }, borrador.nombre),
    el("div", { clase: "modal__badges" }, [
      el("span", { clase: "badge-outline" }, proyecto ? proyecto.nombre : ""),
      el("span", { clase: "badge-outline", style: `color:${info.color}` }, info.completa),
      el("span", { clase: "badge-solida", style: `background:${colorPrioridad(borrador.prioridad)}` }, etiquetaPrioridad(borrador.prioridad)),
      el("span", { clase: "badge-outline" }, etiquetaEstado(borrador.estado)),
    ]),
    borrador.descripcion ? el("p", { clase: "modal__descripcion" }, borrador.descripcion) : null,
    el("div", { clase: "modal__pie" }, [
      el("button", { clase: "boton-pastilla boton-pastilla--oscuro", type: "button", onClick: acciones.iniciarEdicionTarea }, "Editar"),
      el("button", { clase: "boton-pastilla boton-pastilla--outline", type: "button", onClick: acciones.eliminarTarea }, "Eliminar"),
    ]),
  ]);
}

export function modalTarea(estadoApp, acciones) {
  const tm = estadoApp.modalTarea;
  if (!tm) return null;
  const enEdicion = tm.modo === "editar";
  const etiquetaEncabezado = enEdicion ? (tm.borrador.id ? "Editar tarea" : "Nueva tarea") : "Detalle de tarea";

  return el("div", { clase: "modal-fondo" }, [
    el("button", { clase: "modal-scrim", type: "button", "aria-label": "Cerrar", onClick: acciones.cerrarModalTarea }),
    el("div", { clase: "modal" }, [
      el("div", { clase: "modal__encabezado" }, [
        el("span", { clase: "modal__etiqueta" }, etiquetaEncabezado),
        el("button", { clase: "modal__cerrar", type: "button", onClick: acciones.cerrarModalTarea }, "✕"),
      ]),
      enEdicion ? formularioTarea(estadoApp, acciones) : detalleTarea(estadoApp, acciones),
    ]),
  ]);
}
