// app.js — Lógica compartida de la tienda pública: carrito, catálogo, destacados y resúmenes.
// Rol: centraliza la lectura/escritura del carrito en localStorage (clave "ss_cart"),
// el badge del navbar, el catálogo filtrable y los totales que se muestran en carrito,
// checkout y pago. Requiere que products.js se cargue primero (usa el global PRODUCTS).
// Páginas que lo cargan: index, catalogo, carrito, checkout, pago, confirmacion,
// login, registro, contacto y quienes-somos.

// Formatea un número como moneda chilena (CLP, sin decimales); lo usan todos los renderizados de precios.
const fmt = (n) =>
    new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    }).format(n);


// Lee el carrito desde localStorage ("ss_cart"); devuelve un arreglo vacío si la clave no existe.
const getCart = () => {
    return JSON.parse(localStorage.getItem("ss_cart") || "[]");
};


// Persiste el carrito en "ss_cart" y refresca el badge del navbar mediante updateCartBadge.
const saveCart = (cart) => {
    localStorage.setItem("ss_cart", JSON.stringify(cart));
    updateCartBadge();
};


// QUÉ HACE: Actualiza todos los badges del navbar con el total de unidades del carrito.
// CON QUÉ COMUNICA: Lee "ss_cart" (vía getCart) y escribe el total en cada elemento DOM
//                   con clase .cart-count (presente en el navbar de todas las páginas).
// CUÁNDO SE EJECUTA: En DOMContentLoaded y cada vez que saveCart persiste el carrito.
function updateCartBadge() {
    const badges = document.querySelectorAll(".cart-count");

    const totalProducts = getCart().reduce((total, item) => {
        return total + item.qty;
    }, 0);

    badges.forEach((badge) => {
        badge.textContent = totalProducts;
    });
}


// QUÉ HACE: Agrega un producto al carrito (o incrementa su cantidad si ya estaba) y muestra un toast.
// CON QUÉ COMUNICA: Busca el producto en el global PRODUCTS (products.js); lee y escribe "ss_cart"
//                   (vía getCart/saveCart); llama a showToast. La invocan los botones "Agregar"
//                   generados por catalogCardHTML y renderFeatured mediante onclick.
// CUÁNDO SE EJECUTA: Al hacer clic en "Agregar" en una tarjeta del catálogo o de destacados.
function addToCart(id, qty = 1) {
    const product = PRODUCTS.find((product) => {
        return product.id === id;
    });

    let cart = getCart();

    const item = cart.find((item) => {
        return item.id === id;
    });

    if (item) {
        item.qty += qty;
    } else {
        cart.push({
            ...product,
            qty: qty
        });
    }

    saveCart(cart);

    showToast(`${product.name} agregado al carrito`);
}


// QUÉ HACE: Muestra un mensaje temporal (toast) en la esquina inferior derecha; reutiliza el
//           elemento si ya existe y lo oculta automáticamente tras 2,2 segundos.
// CON QUÉ COMUNICA: Crea o recupera el elemento DOM #appToast (lo agrega a <body> si no existe)
//                   y guarda el identificador del temporizador en window._toast para reemplazarlo.
// CUÁNDO SE EJECUTA: Llamada por addToCart; queda disponible para cualquier script de la página.
function showToast(message) {
    let toast = document.getElementById("appToast");

    if (!toast) {
        toast = document.createElement("div");

        toast.id = "appToast";

        toast.className =
            "position-fixed bottom-0 end-0 m-3 p-3 text-white bg-dark rounded-3 shadow";

        toast.style.zIndex = 2000;

        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.display = "block";

    clearTimeout(window._toast);

    window._toast = setTimeout(() => {
        toast.style.display = "none";
    }, 2200);
}


// Renderiza el catálogo aplicando los filtros de categoría y búsqueda activos.
// Reemplaza la paginación de 3 páginas fijas por un único catálogo filtrable
// (mismo patrón que el Proyecto Almacén: filtro por categoría + búsqueda en vivo).
// CON QUÉ COMUNICA: Renderiza las tarjetas en #productGrid a partir del global PRODUCTS;
//                   lee los filtros #filtroCategoria y #filtroBusqueda; actualiza
//                   #resultadosCount; cada tarjeta llama a addToCart mediante onclick.
// CUÁNDO SE EJECUTA: En catalogo.html, al terminar de inicializar los filtros y en cada
//                    evento "change" de categoría o "input" de búsqueda.
function renderCatalog() {
    const productGrid = document.getElementById("productGrid");

    if (!productGrid) {
        return;
    }

    const filtroCategoria = document.getElementById("filtroCategoria");
    const filtroBusqueda = document.getElementById("filtroBusqueda");

    const categoriaSeleccionada = filtroCategoria ? filtroCategoria.value : "todas";
    const busqueda = filtroBusqueda ? filtroBusqueda.value.trim().toLowerCase() : "";

    const productosFiltrados = PRODUCTS.filter((product) => {
        const coincideCategoria =
            categoriaSeleccionada === "todas" || product.category === categoriaSeleccionada;
        const coincideBusqueda = product.name.toLowerCase().includes(busqueda);
        return coincideCategoria && coincideBusqueda;
    });

    const contador = document.getElementById("resultadosCount");
    if (contador) {
        contador.textContent = `${productosFiltrados.length} producto${productosFiltrados.length === 1 ? "" : "s"}`;
    }

    productGrid.innerHTML = productosFiltrados.length
        ? productosFiltrados.map(catalogCardHTML).join("")
        : `<div class="col-12"><p class="text-center small-muted py-5">No encontramos productos que coincidan con tu búsqueda.</p></div>`;
}

// QUÉ HACE: Devuelve el HTML de una tarjeta de producto para la grilla del catálogo.
// CON QUÉ COMUNICA: Usa el objeto product (proveniente de PRODUCTS) y fmt para el precio;
//                   genera un botón cuyo onclick llama a addToCart. La imagen se resuelve por
//                   convención de nombre: assets/img/products/product-<id con 2 dígitos>.svg.
// CUÁNDO SE EJECUTA: Llamada por renderCatalog por cada producto que pasa los filtros (solo catalogo.html).
function catalogCardHTML(product) {
    return `
        <div class="col-sm-6 col-lg-4">
            <article class="product-card">

                <img
                    src="assets/img/products/product-${String(product.id).padStart(2, "0")}.svg"
                    class="w-100"
                    alt="${product.name}"
                >

                <div class="p-3">

                    <span class="badge text-bg-light border mb-2">
                        ${product.category}
                    </span>

                    <h3 class="h5 fw-bold">
                        ${product.name}
                    </h3>

                    <p class="small-muted small">
                        ${product.desc}
                    </p>

                    <div class="d-flex justify-content-between align-items-center">

                        <span class="price">
                            ${fmt(product.price)}
                        </span>

                        <button
                            class="btn btn-brand"
                            onclick="addToCart(${product.id})"
                        >
                            Agregar
                        </button>

                    </div>

                </div>

            </article>
        </div>
    `;
}

// Llena el <select> de categorías dinámicamente a partir de PRODUCTS
// y engancha los filtros para que reaccionen en vivo (input/change).
// CON QUÉ COMUNICA: Escribe las opciones de #filtroCategoria desde PRODUCTS; engancha
//                   #filtroBusqueda; consulta window.location.search para preseleccionar
//                   la categoría si la URL trae ?categoria=...; finaliza llamando a renderCatalog.
// CUÁNDO SE EJECUTA: No se llama desde este archivo: la invoca un script inline en
//                    catalogo.html dentro de su propio DOMContentLoaded.
function inicializarFiltrosCatalogo() {
    const filtroCategoria = document.getElementById("filtroCategoria");
    const filtroBusqueda = document.getElementById("filtroBusqueda");

    if (!filtroCategoria && !filtroBusqueda) {
        return;
    }

    if (filtroCategoria) {
        const categorias = [...new Set(PRODUCTS.map((p) => p.category))].sort();
        filtroCategoria.innerHTML =
            `<option value="todas">Todas las categorías</option>` +
            categorias.map((c) => `<option value="${c}">${c}</option>`).join("");

        // Preselecciona la categoría si viene desde un enlace externo (?categoria=Bebidas)
        const params = new URLSearchParams(window.location.search);
        const categoriaUrl = params.get("categoria");
        if (categoriaUrl && categorias.includes(categoriaUrl)) {
            filtroCategoria.value = categoriaUrl;
        }

        filtroCategoria.addEventListener("change", renderCatalog);
    }

    if (filtroBusqueda) {
        filtroBusqueda.addEventListener("input", renderCatalog);
    }

    renderCatalog();
}


// QUÉ HACE: Renderiza la sección de productos destacados del home (los primeros 4 de PRODUCTS).
// CON QUÉ COMUNICA: Escribe el HTML en #featuredProducts (solo existe en index.html); usa fmt
//                   para los precios y genera botones que llaman a addToCart mediante onclick.
// CUÁNDO SE EJECUTA: En DOMContentLoaded; si no existe #featuredProducts, termina de inmediato.
function renderFeatured() {
    const featuredProducts = document.getElementById("featuredProducts");

    if (!featuredProducts) {
        return;
    }

    const products = PRODUCTS.slice(0, 4);

    featuredProducts.innerHTML = products
        .map((product) => {
            return `
                <div class="col-sm-6 col-lg-3">

                    <article class="product-card">

                        <img
                            src="assets/img/products/product-${String(product.id).padStart(2, "0")}.svg"
                            class="w-100"
                            alt="${product.name}"
                        >

                        <div class="p-3">

                            <h3 class="h5">
                                ${product.name}
                            </h3>

                            <div class="d-flex justify-content-between align-items-center">

                                <span class="price">
                                    ${fmt(product.price)}
                                </span>

                                <button
                                    class="btn btn-brand btn-sm"
                                    onclick="addToCart(${product.id})"
                                >
                                    Agregar
                                </button>

                            </div>

                        </div>

                    </article>

                </div>
            `;
        })
        .join("");
}


// QUÉ HACE: Elimina un producto del carrito por su id y vuelve a renderizar la tabla.
// CON QUÉ COMUNICA: Lee y escribe "ss_cart" (vía getCart/saveCart) y llama a renderCart.
// CUÁNDO SE EJECUTA: Al hacer clic en el botón de eliminación (×) de una fila de carrito.html.
function removeItem(id) {
    const cart = getCart();

    const updatedCart = cart.filter((item) => {
        return item.id !== id;
    });

    saveCart(updatedCart);

    renderCart();
}


// QUÉ HACE: Ajusta en +/- 1 la cantidad de un producto del carrito (mínimo 1) y re-renderiza.
// CON QUÉ COMUNICA: Lee y escribe "ss_cart" (vía getCart/saveCart) y llama a renderCart.
// CUÁNDO SE EJECUTA: Al hacer clic en los botones +/− de cantidad en la tabla de carrito.html.
function changeQty(id, amount) {
    let cart = getCart();

    const item = cart.find((item) => {
        return item.id === id;
    });

    if (!item) {
        return;
    }

    item.qty = Math.max(1, item.qty + amount);

    saveCart(cart);

    renderCart();
}


// QUÉ HACE: Renderiza la tabla del carrito: filas con imagen, precio, controles de cantidad
//           y subtotal por producto, además del total general; alterna la vista de carrito vacío.
// CON QUÉ COMUNICA: Lee "ss_cart" (vía getCart); escribe en #cartBody y #cartTotal; muestra/oculta
//                   #cartEmpty y #cartContent (clases d-none); los botones de cada fila llaman a
//                   changeQty y removeItem mediante onclick; usa fmt para los precios.
// CUÁNDO SE EJECUTA: En DOMContentLoaded y tras cada removeItem/changeQty; solo actúa si existe
//                    #cartBody (es decir, en carrito.html).
function renderCart() {
    const cartBody = document.getElementById("cartBody");

    if (!cartBody) {
        return;
    }

    const cart = getCart();

    const emptyCart = document.getElementById("cartEmpty");
    const cartContent = document.getElementById("cartContent");

    if (!cart.length) {
        emptyCart.classList.remove("d-none");
        cartContent.classList.add("d-none");

        return;
    }

    emptyCart.classList.add("d-none");
    cartContent.classList.remove("d-none");

    cartBody.innerHTML = cart
        .map((item) => {
            return `
                <tr>

                    <td>
                        <div class="d-flex align-items-center gap-2">

                            <img
                                src="assets/img/products/product-${String(item.id).padStart(2, "0")}.svg"
                                alt="${item.name}"
                            >

                            <strong>
                                ${item.name}
                            </strong>

                        </div>
                    </td>

                    <td>
                        ${fmt(item.price)}
                    </td>

                    <td>

                        <div class="btn-group">

                            <button
                                class="btn btn-outline-secondary btn-sm"
                                onclick="changeQty(${item.id}, -1)"
                            >
                                −
                            </button>

                            <button
                                class="btn btn-light btn-sm"
                                disabled
                            >
                                ${item.qty}
                            </button>

                            <button
                                class="btn btn-outline-secondary btn-sm"
                                onclick="changeQty(${item.id}, 1)"
                            >
                                +
                            </button>

                        </div>

                    </td>

                    <td>
                        ${fmt(item.price * item.qty)}
                    </td>

                    <td>

                        <button
                            class="btn btn-outline-danger btn-sm"
                            onclick="removeItem(${item.id})"
                        >
                            ×
                        </button>

                    </td>

                </tr>
            `;
        })
        .join("");

    const total = cart.reduce((sum, item) => {
        return sum + item.price * item.qty;
    }, 0);

    document.getElementById("cartTotal").textContent = fmt(total);
}


// QUÉ HACE: Calcula los totales de la compra: subtotal, envío y total. El envío es gratis
//           cuando el subtotal es igual o superior a $25.000; de lo contrario cuesta $2.990.
// CON QUÉ COMUNICA: Solo lee "ss_cart" (vía getCart); no toca el DOM. Regla de negocio compartida:
//                   la usan renderSummary (app.js) y completePayment (checkout.js, en pago.html).
// CUÁNDO SE EJECUTA: Llamada por renderSummary y por checkout.js al confirmar el pago.
function cartTotals() {
    const cart = getCart();

    const subtotal = cart.reduce((sum, item) => {
        return sum + item.price * item.qty;
    }, 0);

    const shipping = subtotal >= 25000 ? 0 : 2990;

    const total = subtotal + shipping;

    return {
        subtotal: subtotal,
        shipping: shipping,
        total: total
    };
}


// QUÉ HACE: Actualiza los valores de subtotal, envío y total en los resúmenes de compra
//           de las páginas que los muestran (el envío se muestra como "Gratis" cuando corresponde).
// CON QUÉ COMUNICA: Lee "ss_cart" vía cartTotals; escribe en todos los elementos que tengan los
//                   atributos data-subtotal, data-shipping y data-total; usa fmt para el formato CLP.
// CUÁNDO SE EJECUTA: En DOMContentLoaded de cada página; es un no-op donde no existan esos atributos.
function renderSummary() {
    const totals = cartTotals();

    const subtotalElements =
        document.querySelectorAll("[data-subtotal]");

    const shippingElements =
        document.querySelectorAll("[data-shipping]");

    const totalElements =
        document.querySelectorAll("[data-total]");


    subtotalElements.forEach((element) => {
        element.textContent = fmt(totals.subtotal);
    });


    shippingElements.forEach((element) => {
        if (totals.shipping) {
            element.textContent = fmt(totals.shipping);
        } else {
            element.textContent = "Gratis";
        }
    });


    totalElements.forEach((element) => {
        element.textContent = fmt(totals.total);
    });
}


// Punto de entrada de app.js: al cargar el DOM actualiza el badge del carrito y renderiza,
// según la página en que se esté (los renderizados comprueban la existencia de sus contenedores).
document.addEventListener("DOMContentLoaded", () => {
    updateCartBadge();

    renderFeatured();

    renderCart();

    renderSummary();
});