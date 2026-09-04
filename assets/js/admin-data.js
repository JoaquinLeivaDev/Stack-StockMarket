// admin-data.js — Capa de datos del panel administrativo.
// Rol: centraliza productos, usuarios y sesión en localStorage, incluyendo sus datos iniciales.
// Claves: "ss_admin_products" (catálogo del panel), "ss_admin_session" (sesión administrativa)
// y "ss_users" (usuarios, delegada en UserStore). Expone el global window.AdminData.
// Páginas que lo cargan: admin.html y panelAdmin.html (ambas cargan antes user-store.js,
// que es su dependencia obligatoria; admin-auth.js, admin-login.js y admin.js consumen AdminData).
(function () {
    "use strict";

    const seedProducts = [
        { id: "p-001", name: "Arroz Grado 1 1kg", category: "Abarrotes", price: 1890, stock: 42, criticalStock: 10, emoji: "🍚" },
        { id: "p-002", name: "Aceite Vegetal 1L", category: "Abarrotes", price: 2490, stock: 7, criticalStock: 10, emoji: "🫗" },
        { id: "p-003", name: "Café Tradicional 170g", category: "Bebidas", price: 4990, stock: 0, criticalStock: 5, emoji: "☕" },
        { id: "p-004", name: "Leche Entera 1L", category: "Lácteos", price: 1290, stock: 18, criticalStock: 8, emoji: "🥛" },
        { id: "p-005", name: "Detergente Líquido 1L", category: "Limpieza", price: 3290, stock: 25, criticalStock: 6, emoji: "🧴" },
        { id: "p-006", name: "Papel Higiénico 4 rollos", category: "Hogar", price: 2990, stock: 4, criticalStock: 6, emoji: "🧻" }
    ];
    // Copia profunda de un valor vía JSON (usada para devolver los productos semilla sin compartir referencias).
    const clone = (value) => JSON.parse(JSON.stringify(value));
    const KEYS = Object.freeze({ users: UserStore.keys.users, session: "ss_admin_session", products: "ss_admin_products" });
    // QUÉ HACE: Lee una clave de localStorage exigiendo que el valor sea un arreglo.
    //           Los datos guardados deben ser arreglos; ante JSON inválido se usa el valor de respaldo.
    // CON QUÉ COMUNICA: Recibe la clave y el fallback por parámetro; devuelve el fallback si el
    //                   contenido está corrupto o no es un arreglo.
    // CUÁNDO SE EJECUTA: En cada llamada a AdminData.getProducts (es decir, en cada render del panel).
    const read = (key, fallback) => { try { const value = JSON.parse(localStorage.getItem(key)); return Array.isArray(value) ? value : fallback; } catch (_) { return fallback; } };
    // Serializa y persiste un valor en la clave indicada de localStorage.
    const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
    // No se sobrescriben productos existentes; los seeds solo completan una instalación nueva.
    // CON QUÉ COMUNICA: Llama a UserStore.ensureUsers (garantiza "ss_users") y escribe
    //                   "ss_admin_products" con los productos semilla solo si la clave no existe.
    // CUÁNDO SE EJECUTA: Al evaluarse el módulo (carga de admin.html o panelAdmin.html).
    const ensureSeeds = () => { UserStore.ensureUsers(); if (!localStorage.getItem(KEYS.products)) write(KEYS.products, seedProducts); };
    // La sesión se guarda o elimina explícitamente para controlar el acceso al panel.
    // API pública expuesta como window.AdminData (congelada). Métodos y con qué comunican:
    // - getProducts/saveProducts: lee y reemplaza "ss_admin_products" (respaldo: semillas);
    //   los usa admin.js para renderizar y persistir el CRUD de productos del panel.
    // - getUsers/saveUsers: delegados en UserStore (clave "ss_users"); los usa admin.js
    //   para el CRUD de usuarios del panel.
    // - getSession: lee "ss_admin_session" y devuelve null si no existe o está corrupta;
    //   la consultan AdminAuth (admin.html) y admin.js (panelAdmin.html).
    // - saveSession(session): persiste la sesión administrativa en "ss_admin_session";
    //   con null elimina la clave (así cierra sesión AdminAuth.logout).
    window.AdminData = Object.freeze({ keys: KEYS, ensureSeeds, getUsers: UserStore.getUsers, saveUsers: UserStore.saveUsers, getProducts: () => read(KEYS.products, clone(seedProducts)), saveProducts: (items) => write(KEYS.products, items), getSession: () => { try { return JSON.parse(localStorage.getItem(KEYS.session)); } catch (_) { return null; } }, saveSession: (session) => session ? write(KEYS.session, session) : localStorage.removeItem(KEYS.session) });
    ensureSeeds();
}());
