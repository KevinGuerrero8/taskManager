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

// Como cada acción reconstruye todo el árbol de #app (sin virtual DOM), el
// input/textarea enfocado se destruye y se reemplaza por uno nuevo en cada
// tecla — sin esto, escribir en cualquier campo de texto pierde el foco a la
// primera letra. Los campos que se pueden escribir marcan data-foco con una
// clave estable (ver modalProyecto.js / modalTarea.js) para poder ubicar su
// reemplazo después del rebuild y devolverles el foco y el cursor.
function capturarFoco(raiz) {
  const activo = document.activeElement;
  if (!activo || !raiz.contains(activo)) return null;
  const clave = activo.dataset && activo.dataset.foco;
  if (!clave) return null;
  return { clave, inicio: activo.selectionStart, fin: activo.selectionEnd };
}

function restaurarFoco(raiz, foco) {
  if (!foco) return;
  const elemento = raiz.querySelector(`[data-foco="${foco.clave}"]`);
  if (!elemento) return;
  elemento.focus();
  if (typeof foco.inicio === "number" && elemento.setSelectionRange) {
    try {
      elemento.setSelectionRange(foco.inicio, foco.fin);
    } catch (e) {
      /* algunos tipos de input (date, etc.) no soportan selectionRange */
    }
  }
}

export function render(estadoApp, acciones, raiz) {
  const foco = capturarFoco(raiz);
  const movil = estadoApp.ancho < 780;
  const construirVista = VISTAS[estadoApp.vista] || vistaDashboard;

  const arbol = el("div", { clase: "raiz" + (movil ? " raiz--movil" : "") }, [
    barraLateral(estadoApp, acciones),
    el("main", { clase: "contenido-principal" }, [construirVista(estadoApp, acciones)]),
    modalTarea(estadoApp, acciones),
    modalProyecto(estadoApp, acciones),
  ]);

  raiz.replaceChildren(arbol);
  restaurarFoco(raiz, foco);
}
