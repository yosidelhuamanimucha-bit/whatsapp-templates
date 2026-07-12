const CLAVE = "whatsapp-templates"; 
const CLAVE_FILTRO = "whatsapp-templates-filtro";
const CLAVE_CONTADOR = "whatsapp-templates-contador";

function guardar() {
  state.plantillas.length === 0
    ? localStorage.removeItem(CLAVE)
    : localStorage.setItem(CLAVE, JSON.stringify(state.plantillas));   

  localStorage.setItem(CLAVE_FILTRO, state.filtro ?? "");   

  document.getElementById("estado").textContent =
    state.plantillas.length > 0 ? "Guardado ✓" : "Vacío";
}

function cargar() {
  const guardado = localStorage.getItem(CLAVE);  
  if (!guardado) return [];
  try {
    return JSON.parse(guardado);         
  } catch (error) {
    console.warn("Datos corruptos, empiezo de cero:", error);
    return [];                          
  }
}

function incrementarContadorAperturas() {
  const actual = Number(localStorage.getItem(CLAVE_CONTADOR) ?? 0);
  const nuevo = actual + 1;
  localStorage.setItem(CLAVE_CONTADOR, String(nuevo));
  return nuevo;
}

function exportarAConsola() {
  console.log(JSON.stringify(state.plantillas, null, 2));   
}