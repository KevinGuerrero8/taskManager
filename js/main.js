import * as Estado from "./estado.js";
import { render } from "./render.js";

const raiz = document.getElementById("app");
const estadoApp = Estado.crearEstadoInicial();

function accion(fn) {
  return (...args) => {
    fn(estadoApp, ...args);
    Estado.persistir(estadoApp);
    rerender();
  };
}

const acciones = {
  irADashboard: accion(Estado.irADashboard),
  irAProyectos: accion(Estado.irAProyectos),
  irACalendario: accion(Estado.irACalendario),
  abrirProyecto: accion(Estado.abrirProyecto),
  setModoLista: accion(Estado.setModoLista),
  setModoKanban: accion(Estado.setModoKanban),

  abrirNuevoProyecto: accion(Estado.abrirNuevoProyecto),
  cerrarModalProyecto: accion(Estado.cerrarModalProyecto),
  cambiarNombreNuevoProyecto: accion(Estado.cambiarNombreNuevoProyecto),
  guardarProyecto: accion(Estado.guardarProyecto),
  eliminarProyecto: accion(Estado.eliminarProyecto),

  abrirNuevaTarea: accion(Estado.abrirNuevaTarea),
  abrirDetalleTarea: accion(Estado.abrirDetalleTarea),
  cerrarModalTarea: accion(Estado.cerrarModalTarea),
  iniciarEdicionTarea: accion(Estado.iniciarEdicionTarea),
  cancelarEdicionTarea: accion(Estado.cancelarEdicionTarea),
  cambiarBorrador: accion(Estado.cambiarBorrador),
  guardarTarea: accion(Estado.guardarTarea),
  eliminarTarea: accion(Estado.eliminarTarea),
  ciclarEstadoTarea: accion(Estado.ciclarEstadoTarea),

  calMesAnterior: accion(Estado.calMesAnterior),
  calMesSiguiente: accion(Estado.calMesSiguiente),
};

function rerender() {
  render(estadoApp, acciones, raiz);
}

window.addEventListener(
  "resize",
  () => {
    const ancho = window.innerWidth;
    if (Math.abs(ancho - estadoApp.ancho) > 8) {
      Estado.actualizarAncho(estadoApp, ancho);
      rerender();
    }
  },
  { passive: true }
);

rerender();
