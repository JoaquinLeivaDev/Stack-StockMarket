// admin-auth.js — Servicios de autenticación y autorización del área administrativa.
// Rol: valida entradas, crea la sesión persistida en localStorage y centraliza permisos por rol.
// Expone el global window.AdminAuth; depende de UserStore (autenticación y hash) y de AdminData
// (persistencia de la sesión en "ss_admin_session"). No habla con el DOM directamente.
// Páginas que lo cargan: admin.html y panelAdmin.html (después de user-store.js y admin-data.js).
(function () {
    "use strict";
    const EMAIL_RULE = /^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;
    const PASSWORD_RULE = /^.{4,10}$/;
    const hashPassword = UserStore.hashPassword;
    // El correo queda limitado a los dominios permitidos por el flujo administrativo.
    // CUÁNDO SE EJECUTA: En el submit del login (admin-login.js) y al validar usuarios en admin.js.
    const validEmail = (email) => EMAIL_RULE.test(String(email).trim());
    // La política administrativa exige entre 4 y 10 caracteres, sin alterar la contraseña.
    // CUÁNDO SE EJECUTA: En el submit del login (admin-login.js) y al validar contraseñas en admin.js.
    const validPassword = (password) => PASSWORD_RULE.test(String(password));
    // Solo una coincidencia real de usuario y contraseña permite crear la sesión.
    // CON QUÉ COMUNICA: UserStore.authenticate (lee "ss_users"); guarda la sesión con
    //                   AdminData.saveSession (clave "ss_admin_session"); devuelve la sesión o null.
    // CUÁNDO SE EJECUTA: Al enviar el formulario de admin.html (desde admin-login.js).
    const login = async (email, password) => { const user = await UserStore.authenticate(email, password); if (!user) return null; const session = { userId: user.id, name: user.name, role: user.role, createdAt: new Date().toISOString() }; AdminData.saveSession(session); return session; };
    // Cerrar sesión elimina la sesión administrativa de localStorage.
    // CUÁNDO SE EJECUTA: Con el botón de cierre de sesión del panel y en los rechazos de
    //                    acceso de admin.js (redirectToLogin) y admin-login.js (rol sin permiso).
    const logout = () => AdminData.saveSession(null);
    // Cada rol tiene una lista explícita: el cliente no recibe permisos administrativos.
    // CON QUÉ COMUNICA: Tabla de permisos por rol (admin: todo; seller: dashboard y lectura de
    //                   productos; client: nada); la consultan admin-login.js y admin.js.
    // CUÁNDO SE EJECUTA: Tras el login (¿el rol puede entrar al panel?) y al cargar panelAdmin.html
    //                    (¿tiene permiso de dashboard la sesión persistida?).
    const can = (role, permission) => ({ admin: ["dashboard", "products.read", "products.write", "users.read", "users.write"], seller: ["dashboard", "products.read"], client: [] }[role] || []).includes(permission);
    window.AdminAuth = Object.freeze({ validEmail, validPassword, hashPassword, login, logout, getSession: AdminData.getSession, can });
}());
