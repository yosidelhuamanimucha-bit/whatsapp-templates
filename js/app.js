const state = { plantillas: [], editandoId: null, filtro: "" };  

const lista = document.getElementById("listaPlantillas");
const form = document.getElementById("form-plantilla");
const selector = document.getElementById("selector");
const salida = document.getElementById("mensaje-final");
const btnCancelar = document.getElementById("btn-cancelar");
const buscador = document.getElementById("buscador");

function agregarPlantilla(titulo, mensaje, hashtag) {
  const nueva = new Template(titulo, mensaje, hashtag);
  state.plantillas.push(nueva);  
}

function eliminarPlantilla(id) {
  const confirmado = confirm("¿Seguro que quieres eliminar esta plantilla?");  
  if (!confirmado) return;
  state.plantillas = state.plantillas.filter(plantilla => plantilla.id !== id);  
  render();
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

function normalizarHashtag(texto) {
  const limpio = texto.trim().toLowerCase();          
  return limpio.startsWith("#") ? limpio : "#" + limpio; 
}

function generarMensajeFinal(plantilla, valorNombre, valorProducto) {
  return plantilla.mensaje
    .replaceAll("{nombre}", valorNombre)
    .replaceAll("{producto}", valorProducto);
}

function contarPorHashtag(plantillas) {
  const conteo = {};                             
  plantillas.forEach(function (plantilla) {
    const elHashtag = plantilla.hashtag;
    if (conteo[elHashtag]) {
      conteo[elHashtag] = conteo[elHashtag] + 1;  
    } else {
      conteo[elHashtag] = 1;                     
    }
  });
  return conteo;
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
      `<span class="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded-full">${hashtag} · ${cantidad}</span>`)
    .join("");

  const top = hashtagMasUsado(porTag);
  const topTexto = top
    ? `<p class="text-xs text-slate-500 mt-1">🏆 Más usado: <strong>${top[0]}</strong> (${top[1]})</p>`
    : "";

  document.getElementById("panel-stats").innerHTML = `
    <div class="flex items-center gap-2 flex-wrap">
      <span class="text-sm font-semibold text-slate-700">${total} plantilla(s)</span>
      ${etiquetas}
    </div>
    ${topTexto}
    <p class="text-xs text-slate-400 mt-1">📂 App abierta ${state.vecesAbierta} vez(veces)</p>`;
}

function plantillasVisibles() {
  const filtroTexto = (state.filtro ?? "").toLowerCase();
  if (filtroTexto === "") return state.plantillas;
  return state.plantillas.filter(plantilla => plantilla.hashtag.toLowerCase().includes(filtroTexto));
}

function render() {
  lista.innerHTML = "";                       
  plantillasVisibles().forEach(function (plantilla) {
    const fechaTexto = new Date(plantilla.fecha).toLocaleDateString("es-PE");  
    const totalCaracteres = plantilla.mensaje.length;
    const mensajeCorto = plantilla.mensaje.length > 60
      ? plantilla.mensaje.slice(0, 60) + "…"
      : plantilla.mensaje;
    const edicionTexto = plantilla.editadaEl                                    
      ? `<p class="text-[11px] text-slate-400 mt-1">✏️ editado ${new Date(plantilla.editadaEl).toLocaleDateString("es-PE")}</p>`
      : "";

    const li = document.createElement("li");
    li.className = "bg-white p-4 rounded-lg shadow";
    li.innerHTML = `
      <div class="flex items-start justify-between gap-2">
        <strong class="text-slate-800">${plantilla.titulo}</strong>
        <span class="text-xs text-slate-400 shrink-0">${fechaTexto}</span>
      </div>
      <p class="text-sm text-slate-600 mt-1">${mensajeCorto}</p>
      ${edicionTexto}
      <div class="flex items-center justify-between mt-2">
        <span class="inline-block text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">${plantilla.hashtag}</span>
        <span class="text-xs text-slate-400">${totalCaracteres} caracteres</span>
      </div>
      <div class="flex gap-2 mt-3 pt-2 border-t border-slate-100">
        <button class="btn-editar text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition" data-id="${plantilla.id}">Editar</button>
        <button class="btn-eliminar text-xs px-2.5 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition" data-id="${plantilla.id}">Eliminar</button>
      </div>`;
    lista.appendChild(li);                    
  });
  renderStats();
  renderSelector();
  guardar();          
}

function renderSelector() {
  selector.innerHTML = state.plantillas
    .map((plantilla, indice) => `<option value="${indice}">${plantilla.titulo}</option>`)
    .join("");
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
        ? {
            ...plantilla,
            titulo: tituloTexto,
            mensaje: mensajeTexto,
            hashtag: normalizarHashtag(hashtag.value),
            editadaEl: new Date()        
          }
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

document.getElementById("btn-vaciar").addEventListener("click", function () {
  state.plantillas = [];
  render();    
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

state.plantillas = cargar();                                  
state.filtro = localStorage.getItem(CLAVE_FILTRO) ?? "";        
buscador.value = state.filtro;                                 
state.vecesAbierta = incrementarContadorAperturas();           
render();