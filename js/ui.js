import { state, contarPorHashtag, plantillasVisibles, normalizarHashtag } from "./state.js";
import { guardar, CLAVE_TEMA, exportarAConsola } from "./storage.js";
import { Template } from "./models/Template.js";

const lista = document.getElementById("listaPlantillas");
const form = document.getElementById("form-plantilla");
const selector = document.getElementById("selector");
const salida = document.getElementById("mensaje-final");
const btnCancelar = document.getElementById("btn-cancelar");
const buscador = document.getElementById("buscador");
const ordenSelect = document.getElementById("orden");
const modal = document.getElementById("modal");
const modalTexto = document.getElementById("modal-texto");
const btnTema = document.getElementById("btn-tema");

let accionPendiente = null;   

function pedirConfirmacion(mensaje, accion) {
  modalTexto.textContent = mensaje;
  accionPendiente = accion;
  modal.classList.remove("hidden");     
}

document.getElementById("modal-cancelar").addEventListener("click", function () {
  modal.classList.add("hidden");       
  accionPendiente = null;
});

document.getElementById("modal-confirmar").addEventListener("click", function () {
  if (accionPendiente) accionPendiente();   
  modal.classList.add("hidden");
  accionPendiente = null;
});

modal.addEventListener("click", function (evento) {   
  if (evento.target === modal) {
    modal.classList.add("hidden");
    accionPendiente = null;
  }
});

function agregarPlantilla(titulo, mensaje, hashtag) {
  const nueva = new Template(titulo, mensaje, hashtag);
  state.plantillas.push(nueva);
}

function eliminarPlantilla(id) {
  pedirConfirmacion("¿Eliminar esta plantilla?", function () {
    state.plantillas = state.plantillas.filter(plantilla => plantilla.id !== id);
    render();
  });
}

function cargarEnFormulario(id) {
  const plantilla = state.plantillas.find(plantilla => plantilla.id === id);
  titulo.value = plantilla.titulo;
  mensaje.value = plantilla.mensaje;
  hashtag.value = plantilla.hashtag;
  state.editandoId = id;            
  btnCancelar.classList.remove("hidden");
}

function cancelarEdicion() {
  form.reset();
  state.editandoId = null;
  btnCancelar.classList.add("hidden");
}

function generarMensajeFinal(plantilla, valorNombre, valorProducto) {
  return plantilla.mensaje
    .replaceAll("{nombre}", valorNombre)
    .replaceAll("{producto}", valorProducto);
}

function hashtagMasUsado(porTag) {
  const entradas = Object.entries(porTag);
  if (entradas.length === 0) return null;
  return entradas.reduce((max, actual) => (actual[1] > max[1] ? actual : max));
}

function renderStats() {
  const total = state.plantillas.length;
  const porTag = contarPorHashtag(state.plantillas);
  const etiquetas = Object.entries(porTag)
    .map(([hashtag, cantidad]) =>
      `<span class="text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-0.5 rounded-full">${hashtag} · ${cantidad}</span>`)
    .join("");

  const top = hashtagMasUsado(porTag);
  const topTexto = top
    ? `<p class="text-xs text-slate-500 dark:text-slate-400 mt-1">🏆 Más usado: <strong>${top[0]}</strong> (${top[1]})</p>`
    : "";

  document.getElementById("panel-stats").innerHTML = `
    <div class="flex items-center gap-2 flex-wrap">
      <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">${total} plantilla(s)</span>
      ${etiquetas}
    </div>
    ${topTexto}
    <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">📂 App abierta ${state.vecesAbierta ?? 1} vez(veces)</p>`;
}

function renderSelector() {
  selector.innerHTML = state.plantillas
    .map((plantilla, indice) => `<option value="${indice}">${plantilla.titulo}</option>`)
    .join("");
}

export function render() {
  const visibles = plantillasVisibles();
  lista.innerHTML = "";

  if (visibles.length === 0) {
    const vacio = state.plantillas.length === 0
      ? "Aún no tienes plantillas. ¡Crea la primera!"
      : "No se encontraron plantillas con ese filtro.";
    lista.innerHTML = `
      <li class="sm:col-span-2 text-center text-slate-400 dark:text-slate-500 py-10">
        <div class="text-4xl mb-2">📭</div>
        ${vacio}
      </li>`;
  } else {
    visibles.forEach(function (plantilla) {
      const fechaTexto = new Date(plantilla.fecha).toLocaleDateString("es-PE");
      const totalCaracteres = plantilla.mensaje.length;
      const mensajeCorto = plantilla.mensaje.length > 60
        ? plantilla.mensaje.slice(0, 60) + "…"
        : plantilla.mensaje;
      const edicionTexto = plantilla.editadaEl
        ? `<p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">✏️ editado ${new Date(plantilla.editadaEl).toLocaleDateString("es-PE")}</p>`
        : "";

      const li = document.createElement("li");
      li.className = "bg-white dark:bg-slate-800 p-4 rounded-lg shadow";
      li.innerHTML = `
        <div class="flex items-start justify-between gap-2">
          <strong class="text-slate-800 dark:text-slate-100">${plantilla.titulo}</strong>
          <span class="text-xs text-slate-400 dark:text-slate-500 shrink-0">${fechaTexto}</span>
        </div>
        <p class="text-sm text-slate-600 dark:text-slate-300 mt-1">${mensajeCorto}</p>
        ${edicionTexto}
        <div class="flex items-center justify-between mt-2">
          <span class="inline-block text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full">${plantilla.hashtag}</span>
          <span class="text-xs text-slate-400 dark:text-slate-500">${totalCaracteres} caracteres</span>
        </div>
        <div class="flex gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-700">
          <button class="btn-editar text-xs px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 transition" data-id="${plantilla.id}">Editar</button>
          <button class="btn-eliminar text-xs px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 transition" data-id="${plantilla.id}">Eliminar</button>
        </div>`;
      lista.appendChild(li);
    });
  }

  renderStats();
  renderSelector();
  document.getElementById("estado").textContent = state.plantillas.length > 0 ? "Guardado ✓" : "Vacío";
  guardar();        
}

form.addEventListener("submit", function (evento) {
  evento.preventDefault();
  const tituloTexto = titulo.value.trim();
  const mensajeTexto = mensaje.value.trim();

  if (tituloTexto.length === 0 || mensajeTexto.length === 0) {              
    alert("Título y mensaje son obligatorios");
    return;
  }

  if (state.editandoId) {
    state.plantillas = state.plantillas.map(plantilla =>     
      plantilla.id === state.editandoId
        ? { ...plantilla, titulo: tituloTexto, mensaje: mensajeTexto, hashtag: normalizarHashtag(hashtag.value), editadaEl: new Date() }
        : plantilla
    );
    state.editandoId = null;
    btnCancelar.classList.add("hidden");
  } else {
    agregarPlantilla(tituloTexto, mensajeTexto, normalizarHashtag(hashtag.value));
  }

  render();
  form.reset();
});

btnCancelar.addEventListener("click", cancelarEdicion);

lista.addEventListener("click", function (evento) {
  const id = evento.target.dataset.id;
  if (evento.target.classList.contains("btn-eliminar")) eliminarPlantilla(id);
  if (evento.target.classList.contains("btn-editar"))   cargarEnFormulario(id);
});

buscador.addEventListener("input", function (evento) {
  state.filtro = evento.target.value;   
  render();                             
});

document.getElementById("btn-limpiar-filtro").addEventListener("click", function () {
  state.filtro = "";
  buscador.value = "";
  render();
});

ordenSelect.addEventListener("change", function (evento) {
  state.orden = evento.target.value;   
  render();
});

document.getElementById("btn-vaciar").addEventListener("click", function () {
  pedirConfirmacion("Esto borrará TODAS tus plantillas. ¿Continuar?", function () {
    state.plantillas = [];
    render();     
  });
});

document.getElementById("btn-exportar").addEventListener("click", exportarAConsola);

document.getElementById("btn-generar").addEventListener("click", function () {
  if (state.plantillas.length === 0) {
    alert("Primero agrega al menos una plantilla");
    return;
  }
  const plantilla = state.plantillas[Number(selector.value)];
  const nombre = document.getElementById("valorNombre").value.trim();
  const producto = document.getElementById("valorProducto").value.trim();
  salida.textContent = generarMensajeFinal(plantilla, nombre, producto);
});

document.getElementById("btn-copiar").addEventListener("click", function () {
  navigator.clipboard.writeText(salida.textContent);
});

function aplicarTema(tema) {
  document.documentElement.classList.toggle("dark", tema === "oscuro");
  btnTema.textContent = tema === "oscuro" ? "☀️" : "🌙";
  localStorage.setItem(CLAVE_TEMA, tema);
}

const temaGuardado = localStorage.getItem(CLAVE_TEMA)
  ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "oscuro" : "claro");
aplicarTema(temaGuardado);

btnTema.addEventListener("click", function () {
  const actual = document.documentElement.classList.contains("dark") ? "oscuro" : "claro";
  aplicarTema(actual === "oscuro" ? "claro" : "oscuro");
});