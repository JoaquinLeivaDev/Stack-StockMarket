// auth-validation.js — Validación de formularios de autenticación pública (login y registro).
// Rol: coordina la validación de campos y usa UserStore/localStorage para la sesión del cliente.
// Usa las utilidades de rut.js (marcarCampo, validarRut, formatearRutInput, COMUNAS).
// Rescatado y adaptado del Proyecto Almacén, con feedback en vivo por campo.
// Clave que escribe: "ss_public_session" (sesión del cliente, independiente de la sesión
// administrativa "ss_admin_session"). Los usuarios se leen vía UserStore (clave "ss_users").
// Páginas que lo cargan: login.html y registro.html (ambas cargan antes rut.js y user-store.js).

// Punto de entrada: al cargar el DOM inicializa el formulario de login y el de registro;
// cada inicializador comprueba si su formulario existe en la página y termina temprano si no.
document.addEventListener("DOMContentLoaded", () => {
    inicializarFormularioLogin();
    inicializarFormularioRegistro();
});

// QUÉ HACE: Prepara el formulario de login: validación en vivo de email y contraseña,
//           autenticación contra UserStore (solo acepta rol cliente) y el botón que
//           muestra/oculta la contraseña.
// CON QUÉ COMUNICA: DOM: #loginForm, #loginEmail, #loginPassword, #toggleLoginPassword,
//                   #loginSuccess y #loginMessage. Llama a marcarCampo y REGEX_EMAIL (rut.js)
//                   y a UserStore.authenticate (lectura de "ss_users"); si las credenciales
//                   son válidas, escribe la sesión del cliente en "ss_public_session".
// CUÁNDO SE EJECUTA: En DOMContentLoaded de login.html; no hace nada si no existe #loginForm.
function inicializarFormularioLogin() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    const email = form.querySelector("#loginEmail");
    const password = form.querySelector("#loginPassword");

    // Valida el email (formato) y la contraseña (4 a 10 caracteres), marcando cada campo con
    // marcarCampo (rut.js). Se ejecuta en cada evento input de ambos campos y antes de autenticar.
    function validar() {
        let ok = true;
        // El correo debe respetar el formato definido para las cuentas públicas.
        ok = marcarCampo(email, REGEX_EMAIL.test(email.value.trim()),
            "Ingresa un correo electrónico válido.") && ok;
        // El login mantiene la política de longitud de contraseña de las credenciales existentes.
        ok = marcarCampo(password, password.value.length >= 4 && password.value.length <= 10,
            "Tu contraseña debe tener entre 4 y 10 caracteres.") && ok;
        return ok;
    }

    [email, password].forEach((campo) => campo.addEventListener("input", validar));

    // QUÉ HACE: Al enviar, valida y autentica contra UserStore; rechaza credenciales inválidas
    //           y cuentas que no sean de rol cliente; si todo pasa, crea la sesión pública.
    // CON QUÉ COMUNICA: UserStore.authenticate (lee "ss_users"); escribe "ss_public_session";
    //                   muestra #loginSuccess y publica el resultado en #loginMessage.
    // CUÁNDO SE EJECUTA: Al enviar #loginForm (evento submit con preventDefault, sin redirección).
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!validar()) return;
        const user = await UserStore.authenticate(email.value, password.value);
        const success = document.getElementById("loginSuccess");
        const message = document.getElementById("loginMessage");
        // Una cuenta solo continúa si sus credenciales coinciden con UserStore.
        if (!user) { message.textContent = "Credenciales inválidas."; message.className = "alert alert-danger"; return; }
        // El login público acepta únicamente usuarios con rol cliente.
        if (user.role !== "client") { message.textContent = "Esta cuenta debe ingresar desde admin.html."; message.className = "alert alert-warning"; return; }
        // La sesión pública se separa de la administrativa mediante una clave propia de localStorage.
        localStorage.setItem("ss_public_session", JSON.stringify({ userId: user.id, name: user.name, role: user.role, createdAt: new Date().toISOString() }));
        success.classList.remove("d-none");
        message.className = "alert alert-success d-none";
    });

    // Alterna la visibilidad de la contraseña (#loginPassword) y el rótulo del botón
    // (#toggleLoginPassword: Mostrar/Ocultar). Se ejecuta al hacer clic en ese botón.
    const togglePwd = document.getElementById("toggleLoginPassword");
    if (togglePwd) {
        togglePwd.addEventListener("click", () => {
            const esPassword = password.type === "password";
            password.type = esPassword ? "text" : "password";
            togglePwd.textContent = esPassword ? "Ocultar" : "Mostrar";
        });
    }
}

// QUÉ HACE: Prepara el formulario de registro: formateo del RUT en vivo, datalist de comunas,
//           validación de los siete campos con feedback en vivo y aviso de éxito al enviar.
// CON QUÉ COMUNICA: DOM: #registroForm, #registroNombre, #registroRut, #registroEmail,
//                   #registroTelefono, #registroComuna, #registroPassword, #registroPassword2,
//                   #listaComunas (datalist) y #registroSuccess. Usa las utilidades de rut.js:
//                   formatearRutInput, validarRut, marcarCampo, COMUNAS, REGEX_EMAIL,
//                   REGEX_SOLO_LETRAS y REGEX_TELEFONO.
//                   Nota: el registro es solo de interfaz; NO crea el usuario en "ss_users".
// CUÁNDO SE EJECUTA: En DOMContentLoaded de registro.html; no hace nada si no existe #registroForm.
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

    // Valida los siete campos del registro según las reglas comentadas a continuación;
    // se ejecuta en cada evento input/change de cualquier campo y antes de aceptar el envío.
    function validar() {
        let ok = true;

        // El nombre se limita a letras para evitar registros con formato inválido.
        ok = marcarCampo(nombre, REGEX_SOLO_LETRAS.test(nombre.value.trim()),
            "Ingresa tu nombre completo (solo letras).") && ok;

        // validarRut comprueba dígitos y dígito verificador del RUT chileno.
        ok = marcarCampo(rut, validarRut(rut.value),
            "El RUT ingresado no es válido. Formato esperado: 12.345.678-9.") && ok;

        // El correo registrado debe cumplir el formato establecido por REGEX_EMAIL.
        ok = marcarCampo(email, REGEX_EMAIL.test(email.value.trim()),
            "Ingresa un correo electrónico válido.") && ok;

        // El teléfono debe corresponder al formato chileno esperado por el formulario.
        ok = marcarCampo(telefono, REGEX_TELEFONO.test(telefono.value.trim()),
            "Ingresa un teléfono chileno válido, ej: +56 9 1234 5678.") && ok;

        // Solo se aceptan comunas presentes en el catálogo de sugerencias.
        ok = marcarCampo(comuna, COMUNAS.includes(comuna.value.trim()),
            "Selecciona una comuna válida de la lista de sugerencias.") && ok;

        // El registro exige una contraseña de al menos ocho caracteres.
        ok = marcarCampo(password, password.value.length >= 8,
            "La contraseña debe tener al menos 8 caracteres.") && ok;

        // La confirmación debe coincidir y no puede quedar vacía.
        ok = marcarCampo(password2, password2.value === password.value && password2.value !== "",
            "Las contraseñas no coinciden.") && ok;

        return ok;
    }

    [nombre, rut, email, telefono, comuna, password, password2].forEach((campo) => {
        campo.addEventListener("input", validar);
        campo.addEventListener("change", validar);
    });

    // QUÉ HACE: Maneja el envío del registro: si todos los campos pasan la validación, muestra
    //           el aviso de éxito (#registroSuccess), limpia el formulario y quita los estilos
    //           de validación. No persiste nada: no escribe en "ss_users" ni otra clave.
    // CUÁNDO SE EJECUTA: Al enviar #registroForm (evento submit con preventDefault).
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!validar()) return;
        document.getElementById("registroSuccess").classList.remove("d-none");
        form.reset();
        form.querySelectorAll(".form-control").forEach((c) => c.classList.remove("is-valid", "is-invalid"));
    });
}
