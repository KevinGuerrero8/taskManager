import { el } from "../dom.js";
import { construirDiasCalendario } from "../logica.js";

const DIAS_SEMANA = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

function celdaDia(d, acciones) {
  return el("div", { clase: "celda-dia", style: `background:${d.fondo}; opacity:${d.opacidad}` }, [
    el("div", { clase: "celda-dia__numero", style: `color:${d.colorNumero}` }, String(d.numero)),
    el("div", { clase: "celda-dia__tareas" }, [
      ...d.tareas.map((t) =>
        el("button", {
          clase: "chip-tarea",
          type: "button",
          style: `background:${t.fondoChip}`,
          onClick: () => acciones.abrirDetalleTarea(t.id),
        }, t.nombre)
      ),
      d.hayMas ? el("div", { clase: "celda-dia__mas" }, `+${d.cantidadMas} más`) : null,
    ]),
  ]);
}

export function vistaCalendario(estadoApp, acciones) {
  const etiquetaMes = new Date(estadoApp.calAnio, estadoApp.calMes, 1).toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
  });
  const dias = construirDiasCalendario(estadoApp.calAnio, estadoApp.calMes, estadoApp.proyectos);

  const encabezado = el("div", { clase: "encabezado-vista encabezado-vista--compacto" }, [
    el("h1", { clase: "titulo-vista titulo-vista--calendario" }, etiquetaMes),
    el("div", { style: "display:flex; gap:8px" }, [
      el("button", { clase: "boton-circular", type: "button", onClick: acciones.calMesAnterior }, "←"),
      el("button", { clase: "boton-circular", type: "button", onClick: acciones.calMesSiguiente }, "→"),
    ]),
  ]);

  const filaSemana = el("div", { clase: "fila-dias-semana" }, DIAS_SEMANA.map((d) => el("span", {}, d)));
  const grilla = el("div", { clase: "grid-calendario" }, dias.map((d) => celdaDia(d, acciones)));

  return el("div", {}, [encabezado, filaSemana, grilla]);
}
