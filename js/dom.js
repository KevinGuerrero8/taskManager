// Helper mínimo para construir elementos sin plantillas ni bundler.
export function el(etiqueta, props = {}, hijos = []) {
  const nodo = document.createElement(etiqueta);
  for (const [clave, valor] of Object.entries(props)) {
    if (valor == null) continue;
    if (clave === "clase") nodo.className = valor;
    else if (clave.startsWith("on")) nodo.addEventListener(clave.slice(2).toLowerCase(), valor);
    else if (clave in nodo && typeof nodo[clave] !== "function") nodo[clave] = valor;
    else nodo.setAttribute(clave, valor);
  }
  for (const hijo of [].concat(hijos)) {
    if (hijo == null || hijo === false) continue;
    nodo.appendChild(typeof hijo === "string" || typeof hijo === "number" ? document.createTextNode(hijo) : hijo);
  }
  return nodo;
}
