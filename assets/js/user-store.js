// Registro compartido de usuarios para los flujos público y administrativo.
// Persiste usuarios en localStorage, migra el registro administrativo anterior
// y expone autenticación mediante contraseñas almacenadas como hash.
(function () {
    "use strict";

    const KEYS = Object.freeze({ users: "ss_users", legacyUsers: "ss_admin_users" });
    const MIGRATION_MARKER = "ss_users_migrated_v1";
    const seedUsers = [
        { id: "u-admin-001", name: "Administración Demo", email: "admin@duoc.cl", role: "admin", passwordHash: "3b612c75a7b5048a435fb6ec81e52ff92d6d795a8b5a9c17070f6a63c97a53b2" },
        { id: "u-seller-001", name: "Vendedor Demo", email: "vendedor@duoc.cl", role: "seller", passwordHash: "a0374b1711fe39f73ef8399ce3afaf565877c70120465c901bf3fed132c73bb1" },
        { id: "u-client-001", name: "Cliente Demo", email: "cliente@gmail.com", role: "client", passwordHash: "385cd569b4c3c64f2e02f9b49c61481e61e590ca6c268229d0d78ee250b4f7d2" }
    ];
    const clone = (value) => JSON.parse(JSON.stringify(value));
    // Solo se aceptan arreglos válidos; un valor corrupto no debe romper el flujo.
    const read = (key) => {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return Array.isArray(value) ? value : null;
        } catch (_) {
            return null;
        }
    };
    const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
    // Evita duplicar usuarios por ID o por correo, sin distinguir mayúsculas.
    const mergeUsers = (primary, legacy) => {
        const users = [...primary];
        legacy.forEach((candidate) => {
            const duplicate = users.some((user) => user.id === candidate.id || user.email.toLowerCase() === candidate.email.toLowerCase());
            if (!duplicate) users.push(candidate);
        });
        return users;
    };
    // Inicializa o migra ss_users una sola vez y conserva los datos en localStorage.
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
    const hashPassword = async (password) => {
        const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
        return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
    };
    ensureUsers();
    const userStore = {
        keys: KEYS,
        getUsers: () => read(KEYS.users) || clone(seedUsers),
        saveUsers: (users) => write(KEYS.users, users),
        ensureUsers,
        hashPassword,
        // La búsqueda del correo ignora espacios y mayúsculas antes de validar credenciales.
        authenticate: async (email, password) => {
            const user = userStore.getUsers().find((candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase());
            return user && user.passwordHash === await hashPassword(password) ? user : null;
        }
    };
    window.UserStore = Object.freeze(userStore);
}());
