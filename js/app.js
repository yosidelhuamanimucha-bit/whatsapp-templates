import { state } from "./state.js";
import { cargar, CLAVE_FILTRO, CLAVE_ORDEN, incrementarContadorAperturas } from "./storage.js";
import { render } from "./ui.js";

state.plantillas = cargar();                                         
state.filtro = localStorage.getItem(CLAVE_FILTRO) ?? "";               
state.orden = localStorage.getItem(CLAVE_ORDEN) ?? "recientes";        

document.getElementById("buscador").value = state.filtro;              
document.getElementById("orden").value = state.orden;                 

state.vecesAbierta = incrementarContadorAperturas();                  

render();