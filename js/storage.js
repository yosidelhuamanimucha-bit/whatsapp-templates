import { state } from "./state.js";

export const CLAVE = "whatsapp-templates";                    
export const CLAVE_FILTRO = "whatsapp-templates-filtro";      
export const CLAVE_ORDEN = "whatsapp-templates-orden";         
export const CLAVE_CONTADOR = "whatsapp-templates-contador";   
export const CLAVE_TEMA = "whatsapp-templates-tema";           

export function guardar() {
 
  state.plantillas.length === 0
    ? localStorage.removeItem(CLAVE)
    : localStorage.setItem(CLAVE, JSON.stringify(state.plantillas));   

  localStorage.setItem(CLAVE_FILTRO, state.filtro ?? "");  
  localStorage.setItem(CLAVE_ORDEN, state.orden ?? "recientes");
}

export function cargar() {
  const guardado = localStorage.getItem(CLAVE);  
  if (!guardado) return [];
  try {
    return JSON.parse(guardado);         
  } catch (error) {
    console.warn("Datos corruptos, empiezo de cero:", error);
    return [];                         
  }
}

export function incrementarContadorAperturas() {
  const actual = Number(localStorage.getItem(CLAVE_CONTADOR) ?? 0);
  const nuevo = actual + 1;
  localStorage.setItem(CLAVE_CONTADOR, String(nuevo));
  return nuevo;
}

export function exportarAConsola() {
  console.log(JSON.stringify(state.plantillas, null, 2));   
}