// Controla el formulario de acceso administrativo y el redireccionamiento al panel.
// Usa AdminAuth para validar credenciales y AdminData/localStorage para conservar la sesión.
(function () {
    "use strict";

    const form = document.getElementById("adminLoginForm");
    if (!form) return;

    const $ = (id) => document.getElementById(id);
    const clearErrors = () => form.querySelectorAll(".admin-field-error").forEach((element) => { element.textContent = ""; });
    const setMessage = (text, good) => { $("adminLoginMessage").textContent = text; $("adminLoginMessage").style.color = good ? "#16733c" : "#b42318"; };
    const panelUrl = () => new URL("panelAdmin.html", window.location.href).href;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const email = $("adminEmail").value.trim();
        const password = $("adminPassword").value;
        clearErrors();
        // Se valida el formato y dominio antes de consultar las credenciales guardadas.
        if (!AdminAuth.validEmail(email)) form.querySelector('[data-error-for="email"]').textContent = "Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.";
        // La longitud evita enviar contraseñas fuera de la política del sistema.
        if (!AdminAuth.validPassword(password)) form.querySelector('[data-error-for="password"]').textContent = "La contraseña debe tener entre 4 y 10 caracteres.";
        if (!AdminAuth.validEmail(email) || !AdminAuth.validPassword(password)) return;
        const session = await AdminAuth.login(email, password);
        // Una respuesta nula significa que el correo o la contraseña no coinciden.
        if (!session) { setMessage("Credenciales inválidas.", false); return; }
        // Aunque las credenciales sean válidas, el rol debe tener permiso de dashboard.
        if (!AdminAuth.can(session.role, "dashboard")) { AdminAuth.logout(); setMessage("El rol Cliente no tiene acceso al panel administrativo.", false); return; }
        window.location.replace(panelUrl());
    });
}());
