// Validación de formularios de autenticación (login y registro).
// Usa las utilidades de rut.js (marcarCampo, validarRut, formatearRutInput, COMUNAS).
// Rescatado y adaptado del Proyecto Almacén, con feedback en vivo por campo.

document.addEventListener("DOMContentLoaded", () => {
    inicializarFormularioLogin();
    inicializarFormularioRegistro();
});

function inicializarFormularioLogin() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    const email = form.querySelector("#loginEmail");
    const password = form.querySelector("#loginPassword");

    function validar() {
        let ok = true;
        ok = marcarCampo(email, REGEX_EMAIL.test(email.value.trim()),
            "Ingresa un correo electrónico válido.") && ok;
        ok = marcarCampo(password, password.value.length >= 8,
            "Tu contraseña debe tener al menos 8 caracteres.") && ok;
        return ok;
    }

    [email, password].forEach((campo) => campo.addEventListener("input", validar));

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!validar()) return;
        document.getElementById("loginSuccess").classList.remove("d-none");
    });

    const togglePwd = document.getElementById("toggleLoginPassword");
    if (togglePwd) {
        togglePwd.addEventListener("click", () => {
            const esPassword = password.type === "password";
            password.type = esPassword ? "text" : "password";
            togglePwd.textContent = esPassword ? "Ocultar" : "Mostrar";
        });
    }
}

function inicializarFormularioRegistro() {
    const form = document.getElementById("registroForm");
    if (!form) return;

    const nombre = form.querySelector("#registroNombre");
    const rut = form.querySelector("#registroRut");
    const email = form.querySelector("#registroEmail");
    const telefono = form.querySelector("#registroTelefono");
    const comuna = form.querySelector("#registroComuna");
    const password = form.querySelector("#registroPassword");
    const password2 = form.querySelector("#registroPassword2");

    formatearRutInput(rut);

    const datalist = document.getElementById("listaComunas");
    if (datalist) {
        datalist.innerHTML = COMUNAS.map((c) => `<option value="${c}">`).join("");
    }

    function validar() {
        let ok = true;

        ok = marcarCampo(nombre, REGEX_SOLO_LETRAS.test(nombre.value.trim()),
            "Ingresa tu nombre completo (solo letras).") && ok;

        ok = marcarCampo(rut, validarRut(rut.value),
            "El RUT ingresado no es válido. Formato esperado: 12.345.678-9.") && ok;

        ok = marcarCampo(email, REGEX_EMAIL.test(email.value.trim()),
            "Ingresa un correo electrónico válido.") && ok;

        ok = marcarCampo(telefono, REGEX_TELEFONO.test(telefono.value.trim()),
            "Ingresa un teléfono chileno válido, ej: +56 9 1234 5678.") && ok;

        ok = marcarCampo(comuna, COMUNAS.includes(comuna.value.trim()),
            "Selecciona una comuna válida de la lista de sugerencias.") && ok;

        ok = marcarCampo(password, password.value.length >= 8,
            "La contraseña debe tener al menos 8 caracteres.") && ok;

        ok = marcarCampo(password2, password2.value === password.value && password2.value !== "",
            "Las contraseñas no coinciden.") && ok;

        return ok;
    }

    [nombre, rut, email, telefono, comuna, password, password2].forEach((campo) => {
        campo.addEventListener("input", validar);
        campo.addEventListener("change", validar);
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!validar()) return;
        document.getElementById("registroSuccess").classList.remove("d-none");
        form.reset();
        form.querySelectorAll(".form-control").forEach((c) => c.classList.remove("is-valid", "is-invalid"));
    });
}
