// Servicios de autenticación y autorización del área administrativa.
// Valida entradas, crea la sesión persistida en localStorage y centraliza permisos por rol.
(function () {
    "use strict";
    const EMAIL_RULE = /^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;
    const PASSWORD_RULE = /^.{4,10}$/;
    const hashPassword = UserStore.hashPassword;
    // El correo queda limitado a los dominios permitidos por el flujo administrativo.
    const validEmail = (email) => EMAIL_RULE.test(String(email).trim());
    // La política administrativa exige entre 4 y 10 caracteres, sin alterar la contraseña.
    const validPassword = (password) => PASSWORD_RULE.test(String(password));
    // Solo una coincidencia real de usuario y contraseña permite crear la sesión.
    const login = async (email, password) => { const user = await UserStore.authenticate(email, password); if (!user) return null; const session = { userId: user.id, name: user.name, role: user.role, createdAt: new Date().toISOString() }; AdminData.saveSession(session); return session; };
    // Cerrar sesión elimina la sesión administrativa de localStorage.
    const logout = () => AdminData.saveSession(null);
    // Cada rol tiene una lista explícita: el cliente no recibe permisos administrativos.
    const can = (role, permission) => ({ admin: ["dashboard", "products.read", "products.write", "users.read", "users.write"], seller: ["dashboard", "products.read"], client: [] }[role] || []).includes(permission);
    window.AdminAuth = Object.freeze({ validEmail, validPassword, hashPassword, login, logout, getSession: AdminData.getSession, can });
}());
