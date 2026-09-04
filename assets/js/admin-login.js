// admin-login.js — Controla el formulario de acceso administrativo y el redireccionamiento al panel.
// Rol: usa AdminAuth para validar credenciales y AdminData/localStorage para conservar la sesión.
// Claves involucradas (indirectas): "ss_users" (vía UserStore.authenticate) y "ss_admin_session"
// (sesión creada por AdminAuth.login). Si el rol no tiene permiso de dashboard, la sesión se
// descarta de inmediato.
// Página que lo carga: admin.html (después de user-store.js, admin-data.js y admin-auth.js).
(function () {
    "use strict";

    const form = document.getElementById("adminLoginForm");
    if (!form) return;

    // Atajo local para buscar elementos por id en el DOM de admin.html.
    const $ = (id) => document.getElementById(id);
    // Limpia los mensajes de error de campo (.admin-field-error) del formulario de login.
    const clearErrors = () => form.querySelectorAll(".admin-field-error").forEach((element) => { element.textContent = ""; });
    // Escribe el mensaje general de login en #adminLoginMessage, en verde (éxito) o rojo (error).
    const setMessage = (text, good) => { $("adminLoginMessage").textContent = text; $("adminLoginMessage").style.color = good ? "#16733c" : "#b42318"; };
    // Construye la URL absoluta de panelAdmin.html a partir de la ubicación de la página actual.
    const panelUrl = () => new URL("panelAdmin.html", window.location.href).href;

    // QUÉ HACE: Maneja el acceso administrativo: valida formato de correo (dominios permitidos)
    //           y longitud de contraseña, autentica con AdminAuth y, si el rol tiene permiso
    //           de dashboard, redirige al panel; si no, descarta la sesión y avisa.
    // CON QUÉ COMUNICA: Campos #adminEmail y #adminPassword; errores de campo en los elementos
    //                   [data-error-for="email"|"password"]; mensaje general en #adminLoginMessage;
    //                   llama a AdminAuth.validEmail, validPassword, login, logout y can (con lo
    //                   cual toca "ss_users" y "ss_admin_session" vía UserStore/AdminData);
    //                   redirige con window.location.replace a panelAdmin.html.
    // CUÁNDO SE EJECUTA: Al enviar #adminLoginForm en admin.html (submit con preventDefault).
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
