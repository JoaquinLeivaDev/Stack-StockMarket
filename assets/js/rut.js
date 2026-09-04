// rut.js — Utilidades de validación compartidas: RUT chileno, expresiones regulares y comunas.
// Rol: además de las funciones de RUT, define las constantes globales REGEX_EMAIL,
// REGEX_SOLO_LETRAS, REGEX_TELEFONO y el listado COMUNAS, que consumen auth-validation.js
// (login/registro) y checkout.js (validación de tarjeta en pago.html, que usa marcarCampo).
// No usa localStorage: solo manipula inputs del DOM.
// Páginas que lo cargan: login.html, registro.html y pago.html.
// Rescatadas del Proyecto Almacén.

// Expresiones regulares compartidas por los formularios: correo, solo letras (nombres)
// y teléfono móvil chileno (+56 9 XXXX XXXX).
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,60}$/;
const REGEX_TELEFONO = /^(\+?56)?[\s-]?9[\s-]?\d{4}[\s-]?\d{4}$/;

// Listado fijo de comunas sugeridas en el datalist #listaComunas del registro (registro.html).
const COMUNAS = [
    "Santiago", "Providencia", "Las Condes", "Ñuñoa", "Maipú", "La Florida",
    "San Bernardo", "Puente Alto", "Peñalolén", "Recoleta", "Independencia",
    "Viña del Mar", "Valparaíso", "Concepción", "Antofagasta", "Temuco"
];

// QUÉ HACE: Valida un RUT chileno (formato 12.345.678-9) calculando el dígito verificador
//           con el algoritmo módulo 11; ignora puntos, guiones y mayúsculas de la entrada.
// CON QUÉ COMUNICA: No toca el DOM ni localStorage: recibe el RUT como texto y devuelve true/false.
// CUÁNDO SE EJECUTA: Llamada por la validación del registro (auth-validation.js) en cada
//                    evento input/change del campo #registroRut y al enviar el formulario.
function validarRut(rutCompleto) {
    const rut = String(rutCompleto || "").replace(/[^0-9kK]/g, "").toUpperCase();
    if (rut.length < 2) return false;

    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1);

    let suma = 0;
    let multiplo = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += Number(cuerpo[i]) * multiplo;
        multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }

    const resto = 11 - (suma % 11);
    const dvEsperado = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);
    return dv === dvEsperado;
}

// QUÉ HACE: Formatea en vivo un input de RUT con puntos y guión (12.345.678-9) mientras el
//           usuario escribe, eliminando cualquier carácter que no sea dígito o K.
// CON QUÉ COMUNICA: Engancha un listener "input" al elemento <input> recibido (en la práctica,
//                   #registroRut en registro.html) y reescribe su value en cada tecleo.
// CUÁNDO SE EJECUTA: Se invoca una sola vez al inicializar el formulario de registro
//                    (auth-validation.js); el formateo ocurre en cada evento input del campo.
function formatearRutInput(input) {
    if (!input) return;
    input.addEventListener("input", () => {
        let valor = input.value.replace(/[^0-9kK]/g, "").toUpperCase();
        if (valor.length > 1) {
            const cuerpo = valor.slice(0, -1);
            const dv = valor.slice(-1);
            valor = `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${dv}`;
        }
        input.value = valor;
    });
}

// QUÉ HACE: Marca un campo como válido o inválido (clases is-valid/is-invalid de Bootstrap)
//           y actualiza el mensaje de error de su .invalid-feedback contiguo.
// CON QUÉ COMUNICA: Manipula el input recibido y busca .invalid-feedback en su elemento padre;
//                   devuelve el mismo booleano esValido para encadenar validaciones con el
//                   patrón "ok = marcarCampo(...) && ok".
// CUÁNDO SE EJECUTA: Utilidad transversal: la usan auth-validation.js (login y registro) y
//                    checkout.js (validación de tarjeta en pago.html) en cada validación de campo.
function marcarCampo(input, esValido, mensajeError) {
    if (!input) return esValido;
    const feedback = input.parentElement.querySelector(".invalid-feedback");
    input.classList.toggle("is-invalid", !esValido);
    input.classList.toggle("is-valid", esValido);
    if (feedback && mensajeError !== undefined) {
        feedback.textContent = esValido ? "" : mensajeError;
    }
    return esValido;
}
