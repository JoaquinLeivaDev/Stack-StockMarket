// Utilidades para RUT chileno, rescatadas del Proyecto Almacén.
// Se comparten entre registro.html y (si se agrega a futuro) otros formularios con RUT.

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,60}$/;
const REGEX_TELEFONO = /^(\+?56)?[\s-]?9[\s-]?\d{4}[\s-]?\d{4}$/;

const COMUNAS = [
    "Santiago", "Providencia", "Las Condes", "Ñuñoa", "Maipú", "La Florida",
    "San Bernardo", "Puente Alto", "Peñalolén", "Recoleta", "Independencia",
    "Viña del Mar", "Valparaíso", "Concepción", "Antofagasta", "Temuco"
];

/** Valida un RUT chileno (formato 12.345.678-9) con dígito verificador. */
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

/** Formatea un input de RUT mientras el usuario escribe (12.345.678-9). */
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

/** Marca un campo como válido/inválido y actualiza su mensaje de error. */
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
