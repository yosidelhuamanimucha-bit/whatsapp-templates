export const state = { plantillas: [], editandoId: null, filtro: "", orden: "recientes" };

export function normalizarHashtag(texto) {
  const limpio = texto.trim().toLowerCase();           
  return limpio.startsWith("#") ? limpio : "#" + limpio; 
}

export function contarPorHashtag(plantillas) {
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

function ordenar(plantillas) {
  const copia = [...plantillas];  
  if (state.orden === "antiguas") {
    return copia.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));      
  }
  if (state.orden === "alfabetico") {
    return copia.sort((a, b) => a.titulo.localeCompare(b.titulo));           
  }
  return copia.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));        
}

export function plantillasVisibles() {
  const filtroTexto = (state.filtro ?? "").toLowerCase();
  const filtradas = filtroTexto === ""
    ? state.plantillas
    : state.plantillas.filter(plantilla => plantilla.hashtag.toLowerCase().includes(filtroTexto));
  return ordenar(filtradas);       
}