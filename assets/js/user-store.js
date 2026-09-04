// user-store.js — Registro compartido de usuarios para los flujos público y administrativo.
// Rol: persiste usuarios en localStorage, migra el registro administrativo anterior y expone
// autenticación mediante contraseñas almacenadas como hash SHA-256 (nunca en texto plano).
// Claves: "ss_users" (registro actual), "ss_admin_users" (registro administrativo heredado)
// y "ss_users_migrated_v1" (marcador que evita repetir la migración).
// Páginas que lo cargan: login.html (login público), admin.html y panelAdmin.html
// (siempre antes que admin-data.js, admin-auth.js, admin-login.js y admin.js,
// que dependen del global window.UserStore).
(function () {
    "use strict";

    const KEYS = Object.freeze({ users: "ss_users", legacyUsers: "ss_admin_users" });
    const MIGRATION_MARKER = "ss_users_migrated_v1";
    const seedUsers = [
        { id: "u-admin-001", name: "Administración Demo", email: "admin@duoc.cl", role: "admin", passwordHash: "3b612c75a7b5048a435fb6ec81e52ff92d6d795a8b5a9c17070f6a63c97a53b2" },
        { id: "u-seller-001", name: "Vendedor Demo", email: "vendedor@duoc.cl", role: "seller", passwordHash: "a0374b1711fe39f73ef8399ce3afaf565877c70120465c901bf3fed132c73bb1" },
        { id: "u-client-001", name: "Cliente Demo", email: "cliente@gmail.com", role: "client", passwordHash: "385cd569b4c3c64f2e02f9b49c61481e61e590ca6c268229d0d78ee250b4f7d2" }
    ];
    // Copia profunda de un valor vía serialización JSON (usada para sembrar usuarios sin compartir referencias).
    const clone = (value) => JSON.parse(JSON.stringify(value));
    // QUÉ HACE: Lee y parsea una clave de localStorage exigiendo que el valor sea un arreglo.
    //           Solo se aceptan arreglos válidos; un valor corrupto no debe romper el flujo.
    // CON QUÉ COMUNICA: Recibe la clave por parámetro ("ss_users" o "ss_admin_users"); devuelve
    //                   null ante JSON inválido o si el valor no es un arreglo.
    // CUÁNDO SE EJECUTA: En cada lectura del módulo: ensureUsers, getUsers y authenticate.
    const read = (key) => {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return Array.isArray(value) ? value : null;
        } catch (_) {
            return null;
        }
    };
    // Serializa y persiste un valor en la clave indicada de localStorage.
    const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
    // QUÉ HACE: Combina el registro actual con el heredado, evitando duplicar usuarios por ID
    //           o por correo, sin distinguir mayúsculas.
    // CON QUÉ COMUNICA: Función pura (no toca localStorage ni DOM); la usa ensureUsers
    //                   durante la migración de "ss_admin_users" hacia "ss_users".
    // CUÁNDO SE EJECUTA: Solo durante la migración inicial, una vez por instalación.
    const mergeUsers = (primary, legacy) => {
        const users = [...primary];
        legacy.forEach((candidate) => {
            const duplicate = users.some((user) => user.id === candidate.id || user.email.toLowerCase() === candidate.email.toLowerCase());
            if (!duplicate) users.push(candidate);
        });
        return users;
    };
    // Inicializa o migra ss_users una sola vez y conserva los datos en localStorage.
    // CON QUÉ COMUNICA: Lee "ss_users" y "ss_admin_users"; escribe "ss_users"; consulta y fija
    //                   el marcador "ss_users_migrated_v1"; si no hay datos previos, siembra los
    //                   tres usuarios demo (administración, vendedor y cliente).
    // CUÁNDO SE EJECUTA: Al evaluarse el módulo (carga de la página) y desde AdminData.ensureSeeds
    //                    en admin.html y panelAdmin.html.
    const ensureUsers = () => {
        const current = read(KEYS.users);
        const legacy = read(KEYS.legacyUsers);
        if (!localStorage.getItem(MIGRATION_MARKER)) {
            const users = current ? (legacy ? mergeUsers(current, legacy) : current) : (legacy || clone(seedUsers));
            write(KEYS.users, users);
            localStorage.setItem(MIGRATION_MARKER, "1");
        } else if (!current) {
            write(KEYS.users, legacy || clone(seedUsers));
        }
    };
    // La contraseña nunca se persiste en texto plano: solo se compara su hash SHA-256.
    // CON QUÉ COMUNICA: Usa la Web Crypto API del navegador (crypto.subtle); no toca localStorage
    //                   ni DOM: recibe la contraseña y devuelve su hash hexadecimal.
    // CUÁNDO SE EJECUTA: En cada autenticación (authenticate) y al crear/editar usuarios con
    //                    contraseña desde el panel (vía AdminAuth.hashPassword).
    const hashPassword = async (password) => {
        const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
        return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
    };
    // Ejecuta la inicialización/migración inmediatamente al cargar el módulo (no espera DOMContentLoaded).
    ensureUsers();
    // API pública expuesta como window.UserStore (congelada): la consumen auth-validation.js
    // (login público) y, a través de AdminData/AdminAuth, todo el módulo administrativo.
    const userStore = {
        keys: KEYS,
        // Devuelve los usuarios persistidos; si la clave está vacía o corrupta, recurre a los semillas.
        getUsers: () => read(KEYS.users) || clone(seedUsers),
        // Reemplaza el registro completo de "ss_users" (lo usa el CRUD de usuarios del panel).
        saveUsers: (users) => write(KEYS.users, users),
        ensureUsers,
        hashPassword,
        // La búsqueda del correo ignora espacios y mayúsculas antes de validar credenciales.
        // QUÉ HACE: Busca el usuario por correo y compara el hash SHA-256 de la contraseña
        //           entregada con el almacenado; devuelve el usuario completo o null.
        // CON QUÉ COMUNICA: Lee "ss_users" (vía getUsers) y usa hashPassword; la llaman el login
        //                   público (auth-validation.js) y el administrativo (AdminAuth.login).
        // CUÁNDO SE EJECUTA: En cada envío de un formulario de login (login.html o admin.html).
        authenticate: async (email, password) => {
            const user = userStore.getUsers().find((candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase());
            return user && user.passwordHash === await hashPassword(password) ? user : null;
        }
    };
    window.UserStore = Object.freeze(userStore);
}());
