// products.js — Catálogo público de la tienda (dato de solo lectura; no contiene funciones).
// Rol: define el arreglo global window.PRODUCTS con id, nombre, precio, categoría, emoji y
// descripción de cada producto. No usa localStorage ni el DOM: solo expone datos que app.js
// y checkout.js consumen para renderizar el catálogo, los destacados y el carrito.
// Páginas que lo cargan: todas las públicas (index, catalogo, carrito, checkout, pago,
// confirmacion, login, registro, contacto y quienes-somos), siempre antes que app.js.
// Nota: el panel administrativo usa su propio catálogo (seedProducts de admin-data.js,
// clave "ss_admin_products"), por lo que el CRUD del panel NO modifica este arreglo.
window.PRODUCTS = [
  {
    "id": 1,
    "name": "Arroz Grado 1 1kg",
    "price": 1890,
    "category": "Abarrotes",
    "emoji": "🍚",
    "desc": "Arroz seleccionado, ideal para acompañamientos y preparaciones diarias."
  },
  {
    "id": 2,
    "name": "Aceite Vegetal 1L",
    "price": 2490,
    "category": "Abarrotes",
    "emoji": "🫗",
    "desc": "Aceite vegetal de uso diario para cocinar, freír y aliñar."
  },
  {
    "id": 3,
    "name": "Azúcar Granulada 1kg",
    "price": 1390,
    "category": "Abarrotes",
    "emoji": "🧂",
    "desc": "Azúcar granulada para repostería, bebidas y consumo familiar."
  },
  {
    "id": 4,
    "name": "Café Tradicional 170g",
    "price": 4990,
    "category": "Bebidas",
    "emoji": "☕",
    "desc": "Café de sabor intenso para comenzar el día con energía."
  },
  {
    "id": 5,
    "name": "Leche Entera 1L",
    "price": 1290,
    "category": "Lácteos",
    "emoji": "🥛",
    "desc": "Leche entera UHT, fuente de calcio para toda la familia."
  },
  {
    "id": 6,
    "name": "Fideos Spaghetti 400g",
    "price": 1190,
    "category": "Abarrotes",
    "emoji": "🍝",
    "desc": "Pasta de trigo duro de rápida cocción."
  },
  {
    "id": 7,
    "name": "Atún Lomitos 160g",
    "price": 1690,
    "category": "Conservas",
    "emoji": "🐟",
    "desc": "Lomitos de atún en agua, prácticos y altos en proteína."
  },
  {
    "id": 8,
    "name": "Salsa de Tomate 200g",
    "price": 790,
    "category": "Abarrotes",
    "emoji": "🍅",
    "desc": "Salsa de tomate lista para pastas y preparaciones caseras."
  },
  {
    "id": 9,
    "name": "Harina sin Polvos 1kg",
    "price": 1290,
    "category": "Abarrotes",
    "emoji": "🌾",
    "desc": "Harina de trigo ideal para masas, panes y repostería."
  },
  {
    "id": 10,
    "name": "Galletas de Avena 180g",
    "price": 1590,
    "category": "Snacks",
    "emoji": "🍪",
    "desc": "Galletas crocantes con avena para colaciones."
  },
  {
    "id": 11,
    "name": "Jugo Néctar 1.5L",
    "price": 1790,
    "category": "Bebidas",
    "emoji": "🧃",
    "desc": "Néctar frutal familiar, ideal para compartir."
  },
  {
    "id": 12,
    "name": "Agua Mineral 1.5L",
    "price": 990,
    "category": "Bebidas",
    "emoji": "💧",
    "desc": "Agua mineral sin gas para hidratación diaria."
  },
  {
    "id": 13,
    "name": "Detergente Líquido 1L",
    "price": 3290,
    "category": "Limpieza",
    "emoji": "🧴",
    "desc": "Detergente líquido concentrado para lavado de ropa."
  },
  {
    "id": 14,
    "name": "Lavalozas 750ml",
    "price": 2190,
    "category": "Limpieza",
    "emoji": "🧽",
    "desc": "Lavalozas desengrasante para uso doméstico."
  },
  {
    "id": 15,
    "name": "Papel Higiénico 4 rollos",
    "price": 2990,
    "category": "Hogar",
    "emoji": "🧻",
    "desc": "Pack de papel higiénico suave y resistente."
  },
  {
    "id": 16,
    "name": "Jabón de Tocador x3",
    "price": 2490,
    "category": "Cuidado Personal",
    "emoji": "🧼",
    "desc": "Pack de jabón de tocador con aroma fresco."
  },
  {
    "id": 17,
    "name": "Cereal de Maíz 400g",
    "price": 2890,
    "category": "Desayuno",
    "emoji": "🥣",
    "desc": "Cereal crujiente para desayunos rápidos."
  },
  {
    "id": 18,
    "name": "Chocolate Barra 100g",
    "price": 1490,
    "category": "Snacks",
    "emoji": "🍫",
    "desc": "Chocolate clásico para un antojo dulce."
  }
];