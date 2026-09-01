// Capa de datos del panel administrativo.
// Centraliza productos, usuarios y sesión en localStorage, incluyendo sus datos iniciales.
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
    const clone = (value) => JSON.parse(JSON.stringify(value));
    const KEYS = Object.freeze({ users: UserStore.keys.users, session: "ss_admin_session", products: "ss_admin_products" });
    // Los datos guardados deben ser arreglos; ante JSON inválido se usa el valor de respaldo.
    const read = (key, fallback) => { try { const value = JSON.parse(localStorage.getItem(key)); return Array.isArray(value) ? value : fallback; } catch (_) { return fallback; } };
    const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
    // No se sobrescriben productos existentes; los seeds solo completan una instalación nueva.
    const ensureSeeds = () => { UserStore.ensureUsers(); if (!localStorage.getItem(KEYS.products)) write(KEYS.products, seedProducts); };
    // La sesión se guarda o elimina explícitamente para controlar el acceso al panel.
    window.AdminData = Object.freeze({ keys: KEYS, ensureSeeds, getUsers: UserStore.getUsers, saveUsers: UserStore.saveUsers, getProducts: () => read(KEYS.products, clone(seedProducts)), saveProducts: (items) => write(KEYS.products, items), getSession: () => { try { return JSON.parse(localStorage.getItem(KEYS.session)); } catch (_) { return null; } }, saveSession: (session) => session ? write(KEYS.session, session) : localStorage.removeItem(KEYS.session) });
    ensureSeeds();
}());
