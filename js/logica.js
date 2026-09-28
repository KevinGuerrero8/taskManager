// Reglas de negocio puras, traducidas 1:1 desde el prototipo de diseño
// (Organizador de Tareas.dc.html). Nada de estado ni DOM acá.

export const DIA_MS = 86400000;

export const ETIQUETAS_PRIORIDAD = { baja: "Baja", media: "Media", alta: "Alta" };
export const COLORES_PRIORIDAD = {
  baja: "#9CA3AF",
  media: "#1E6DF0",
  alta: "oklch(0.58 0.19 25)",
};
export const ETIQUETAS_ESTADO = {
  pendiente: "Pendiente",
  progreso: "En progreso",
  completada: "Completada",
};
const PESO_PRIORIDAD = { alta: -2, media: -1, baja: 0 };
const COLOR_VENCIDO = "oklch(0.58 0.19 25)";
const COLOR_META = "#5B6371";

// Importante: fechas siempre por componentes Y/M/D locales, nunca
// Date.toISOString() (es UTC y corrompía el cálculo de "días hasta vencer"
// para usuarios al oeste de UTC — bug documentado en el diseño original).
export function fechaISO(fecha) {
  return (
    fecha.getFullYear() +
    "-" +
    String(fecha.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(fecha.getDate()).padStart(2, "0")
  );
}

export function hoyISO() {
  return fechaISO(new Date());
}

export function fechaLocal(iso) {
  const [anio, mes, dia] = iso.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

export function etiquetaPrioridad(prioridad) {
  return ETIQUETAS_PRIORIDAD[prioridad] || "Media";
}

export function colorPrioridad(prioridad) {
  return COLORES_PRIORIDAD[prioridad] || COLORES_PRIORIDAD.media;
}

export function etiquetaEstado(estado) {
  return ETIQUETAS_ESTADO[estado] || "Pendiente";
}

export function infoVencimiento(fechaLimite, estadoTarea) {
  if (!fechaLimite) {
    return { etiqueta: "Sin fecha", color: "#A6ADB8", completa: "Sin fecha límite", vencida: false };
  }
  const hoy = hoyISO();
  const diferenciaDias = Math.round((fechaLocal(fechaLimite) - fechaLocal(hoy)) / DIA_MS);
  const fecha = fechaLocal(fechaLimite);
  const completa = fecha.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
  const vencida = diferenciaDias < 0 && estadoTarea !== "completada";

  let etiqueta;
  if (diferenciaDias === 0) etiqueta = "Hoy";
  else if (diferenciaDias === 1) etiqueta = "Mañana";
  else if (diferenciaDias === -1) etiqueta = "Ayer";
  else if (diferenciaDias < 0) etiqueta = fecha.toLocaleDateString("es-CO", { day: "numeric", month: "short" }) + " (vencida)";
  else etiqueta = fecha.toLocaleDateString("es-CO", { day: "numeric", month: "short" });

  return { etiqueta, color: vencida ? COLOR_VENCIDO : COLOR_META, completa, vencida };
}

function tareasAplanadas(proyectos) {
  const resultado = [];
  for (const proyecto of proyectos) {
    for (const tarea of proyecto.tareas) resultado.push({ tarea, proyecto });
  }
  return resultado;
}

export function calcularEstadisticas(proyectos) {
  const hoy = hoyISO();
  const plano = tareasAplanadas(proyectos);
  const activas = plano.filter((x) => x.tarea.estado !== "completada").length;
  const vencidas = plano.filter(
    (x) => x.tarea.fechaLimite && x.tarea.fechaLimite < hoy && x.tarea.estado !== "completada"
  ).length;
  const enProgreso = plano.filter((x) => x.tarea.estado === "progreso").length;
  return { activas, vencidas, enProgreso };
}

// Ranking del dashboard: días hasta vencer + peso de prioridad (alta = -2,
// media = -1, baja = 0), así lo vencido + prioritario sube al tope.
export function tareasProximas(proyectos, limite = 8) {
  const hoy = hoyISO();
  const plano = tareasAplanadas(proyectos).filter((x) => x.tarea.estado !== "completada");

  return plano
    .map((x) => {
      const diasHasta = x.tarea.fechaLimite
        ? Math.round((fechaLocal(x.tarea.fechaLimite) - fechaLocal(hoy)) / DIA_MS)
        : 999;
      const peso = PESO_PRIORIDAD[x.tarea.prioridad] || 0;
      return { x, score: diasHasta + peso };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, limite)
    .map(({ x }) => {
      const info = infoVencimiento(x.tarea.fechaLimite, x.tarea.estado);
      return {
        id: x.tarea.id,
        nombre: x.tarea.nombre,
        nombreProyecto: x.proyecto.nombre,
        etiquetaVencimiento: info.etiqueta,
        colorVencimiento: info.color,
        etiquetaPrioridad: etiquetaPrioridad(x.tarea.prioridad),
        colorPrioridad: colorPrioridad(x.tarea.prioridad),
      };
    });
}

export function tarjetasProyecto(proyectos) {
  return proyectos.map((p) => {
    const total = p.tareas.length;
    const hechas = p.tareas.filter((t) => t.estado === "completada").length;
    const porcentaje = total ? Math.round((hechas / total) * 100) : 0;
    return { id: p.id, nombre: p.nombre, total, hechas, porcentajeBarra: porcentaje + "%" };
  });
}

export function mapearTareasProyecto(proyecto) {
  return proyecto.tareas.map((t) => {
    const info = infoVencimiento(t.fechaLimite, t.estado);
    return {
      id: t.id,
      nombre: t.nombre,
      estado: t.estado,
      etiquetaEstado: etiquetaEstado(t.estado),
      etiquetaVencimiento: info.etiqueta,
      colorVencimiento: info.color,
      etiquetaPrioridad: etiquetaPrioridad(t.prioridad),
      colorPrioridad: colorPrioridad(t.prioridad),
      colorPuntoEstado:
        t.estado === "completada" ? "#9CA3AF" : t.estado === "progreso" ? "#1E6DF0" : "#DCE0E7",
      rellenoPuntoEstado:
        t.estado === "completada" ? "#9CA3AF" : t.estado === "progreso" ? "#1E6DF0" : "transparent",
    };
  });
}

// Grilla de 6 semanas (42 celdas), semana empieza en lunes.
export function construirDiasCalendario(anio, mes, proyectos) {
  const primerDia = new Date(anio, mes, 1);
  const offsetInicio = (primerDia.getDay() + 6) % 7;
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const diasMesAnterior = new Date(anio, mes, 0).getDate();
  const hoy = hoyISO();

  const todasLasTareas = [];
  proyectos.forEach((p) => p.tareas.forEach((t) => todasLasTareas.push(t)));

  const celdas = [];
  for (let i = 0; i < 42; i++) {
    let dia;
    let anioCelda = anio;
    let mesCelda = mes;
    let enMes;
    const posicion = i - offsetInicio;

    if (posicion < 0) {
      dia = diasMesAnterior + posicion + 1;
      mesCelda = mes - 1;
      enMes = false;
      if (mesCelda < 0) {
        mesCelda = 11;
        anioCelda--;
      }
    } else if (posicion >= diasEnMes) {
      dia = posicion - diasEnMes + 1;
      mesCelda = mes + 1;
      enMes = false;
      if (mesCelda > 11) {
        mesCelda = 0;
        anioCelda++;
      }
    } else {
      dia = posicion + 1;
      enMes = true;
    }

    const iso = anioCelda + "-" + String(mesCelda + 1).padStart(2, "0") + "-" + String(dia).padStart(2, "0");
    const tareasDelDia = todasLasTareas.filter((t) => t.fechaLimite === iso);
    const visibles = tareasDelDia.slice(0, 2).map((t) => ({
      id: t.id,
      nombre: t.nombre,
      fondoChip: colorPrioridad(t.prioridad),
    }));

    celdas.push({
      numero: dia,
      enMes,
      iso,
      fondo: iso === hoy ? "#F1F6FF" : "#FFFFFF",
      opacidad: enMes ? 1 : 0.35,
      colorNumero: iso === hoy ? "#1E6DF0" : "#5B6371",
      tareas: visibles,
      hayMas: tareasDelDia.length > 2,
      cantidadMas: tareasDelDia.length - 2,
    });
  }
  return celdas;
}
