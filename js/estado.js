const CLAVE_ALMACENAMIENTO = "organizador-tareas:v2";

function datosVacios() {
  return { proyectos: [], siguienteId: 1 };
}

export function crearEstadoInicial() {
  let datos = null;
  try {
    datos = JSON.parse(localStorage.getItem(CLAVE_ALMACENAMIENTO));
  } catch (e) {
    datos = null;
  }
  if (!datos || !datos.proyectos) datos = datosVacios();

  return {
    proyectos: datos.proyectos,
    siguienteId: datos.siguienteId || 1,
    vista: "dashboard",
    proyectoActivoId: null,
    modoTarea: "lista",
    modalTarea: null,
    modalProyecto: null,
    ancho: typeof window !== "undefined" ? window.innerWidth : 1280,
    calAnio: new Date().getFullYear(),
    calMes: new Date().getMonth(),
  };
}

export function persistir(estadoApp) {
  try {
    localStorage.setItem(
      CLAVE_ALMACENAMIENTO,
      JSON.stringify({ proyectos: estadoApp.proyectos, siguienteId: estadoApp.siguienteId })
    );
  } catch (e) {
    /* localStorage puede fallar en modo privado o con la cuota llena; no es crítico */
  }
}

function buscarProyecto(estadoApp, id) {
  return estadoApp.proyectos.find((p) => p.id === id);
}

function buscarTarea(estadoApp, id) {
  for (const proyecto of estadoApp.proyectos) {
    const tarea = proyecto.tareas.find((t) => t.id === id);
    if (tarea) return { proyecto, tarea };
  }
  return null;
}

// ---------- navegación ----------

export function irADashboard(estadoApp) {
  estadoApp.vista = "dashboard";
}
export function irAProyectos(estadoApp) {
  estadoApp.vista = "proyectos";
}
export function irACalendario(estadoApp) {
  estadoApp.vista = "calendario";
}
export function abrirProyecto(estadoApp, id) {
  estadoApp.vista = "proyecto";
  estadoApp.proyectoActivoId = id;
  estadoApp.modoTarea = "lista";
}
export function setModoLista(estadoApp) {
  estadoApp.modoTarea = "lista";
}
export function setModoKanban(estadoApp) {
  estadoApp.modoTarea = "kanban";
}
export function actualizarAncho(estadoApp, ancho) {
  estadoApp.ancho = ancho;
}

// ---------- proyectos ----------

export function abrirNuevoProyecto(estadoApp) {
  estadoApp.modalProyecto = { nombre: "" };
}
export function cerrarModalProyecto(estadoApp) {
  estadoApp.modalProyecto = null;
}
export function cambiarNombreNuevoProyecto(estadoApp, nombre) {
  estadoApp.modalProyecto = { nombre };
}
export function guardarProyecto(estadoApp) {
  const nombre = (estadoApp.modalProyecto.nombre || "").trim();
  if (!nombre) return;
  const id = "p" + estadoApp.siguienteId;
  estadoApp.proyectos.push({ id, nombre, tareas: [] });
  estadoApp.siguienteId += 1;
  estadoApp.modalProyecto = null;
}
export function eliminarProyecto(estadoApp, id) {
  if (!window.confirm("¿Eliminar este proyecto y todas sus tareas?")) return;
  estadoApp.proyectos = estadoApp.proyectos.filter((p) => p.id !== id);
  if (estadoApp.proyectoActivoId === id) estadoApp.vista = "proyectos";
}

// ---------- tareas / modal ----------

export function abrirNuevaTarea(estadoApp) {
  const borrador = {
    id: null,
    nombre: "",
    proyectoId: estadoApp.proyectoActivoId || (estadoApp.proyectos[0] && estadoApp.proyectos[0].id) || "",
    fechaLimite: "",
    prioridad: "media",
    descripcion: "",
    estado: "pendiente",
  };
  estadoApp.modalTarea = { modo: "editar", borrador };
}
export function abrirDetalleTarea(estadoApp, id) {
  const encontrada = buscarTarea(estadoApp, id);
  if (!encontrada) return;
  estadoApp.modalTarea = {
    modo: "ver",
    borrador: Object.assign({}, encontrada.tarea, { proyectoId: encontrada.proyecto.id }),
  };
}
export function cerrarModalTarea(estadoApp) {
  estadoApp.modalTarea = null;
}
export function iniciarEdicionTarea(estadoApp) {
  estadoApp.modalTarea.modo = "editar";
}
export function cancelarEdicionTarea(estadoApp) {
  const borrador = estadoApp.modalTarea.borrador;
  if (borrador.id) estadoApp.modalTarea.modo = "ver";
  else estadoApp.modalTarea = null;
}
export function cambiarBorrador(estadoApp, cambios) {
  Object.assign(estadoApp.modalTarea.borrador, cambios);
}

export function guardarTarea(estadoApp) {
  const borrador = estadoApp.modalTarea.borrador;
  const nombre = (borrador.nombre || "").trim();
  if (!nombre || !borrador.proyectoId) return;

  if (borrador.id) {
    for (const proyecto of estadoApp.proyectos) {
      const indice = proyecto.tareas.findIndex((t) => t.id === borrador.id);
      if (indice > -1) {
        proyecto.tareas.splice(indice, 1);
        break;
      }
    }
    const destino = buscarProyecto(estadoApp, borrador.proyectoId);
    destino.tareas.push({
      id: borrador.id,
      nombre,
      fechaLimite: borrador.fechaLimite,
      prioridad: borrador.prioridad,
      descripcion: borrador.descripcion,
      estado: borrador.estado,
    });
  } else {
    const id = "t" + estadoApp.siguienteId;
    const destino = buscarProyecto(estadoApp, borrador.proyectoId);
    destino.tareas.push({
      id,
      nombre,
      fechaLimite: borrador.fechaLimite,
      prioridad: borrador.prioridad,
      descripcion: borrador.descripcion,
      estado: borrador.estado,
    });
    estadoApp.siguienteId += 1;
  }
  estadoApp.modalTarea = null;
}

export function eliminarTarea(estadoApp) {
  const borrador = estadoApp.modalTarea.borrador;
  if (!window.confirm("¿Eliminar esta tarea?")) return;
  for (const proyecto of estadoApp.proyectos) {
    proyecto.tareas = proyecto.tareas.filter((t) => t.id !== borrador.id);
  }
  estadoApp.modalTarea = null;
}

export function ciclarEstadoTarea(estadoApp, id) {
  const orden = ["pendiente", "progreso", "completada"];
  const encontrada = buscarTarea(estadoApp, id);
  if (!encontrada) return;
  const siguiente = orden[(orden.indexOf(encontrada.tarea.estado) + 1) % orden.length];
  encontrada.tarea.estado = siguiente;
}

// ---------- calendario ----------

export function calMesAnterior(estadoApp) {
  estadoApp.calMes -= 1;
  if (estadoApp.calMes < 0) {
    estadoApp.calMes = 11;
    estadoApp.calAnio -= 1;
  }
}
export function calMesSiguiente(estadoApp) {
  estadoApp.calMes += 1;
  if (estadoApp.calMes > 11) {
    estadoApp.calMes = 0;
    estadoApp.calAnio += 1;
  }
}
