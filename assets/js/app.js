const fmt = (n) =>
    new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    }).format(n);


const getCart = () => {
    return JSON.parse(localStorage.getItem("ss_cart") || "[]");
};


const saveCart = (cart) => {
    localStorage.setItem("ss_cart", JSON.stringify(cart));
    updateCartBadge();
};


function updateCartBadge() {
    const badges = document.querySelectorAll(".cart-count");

    const totalProducts = getCart().reduce((total, item) => {
        return total + item.qty;
    }, 0);

    badges.forEach((badge) => {
        badge.textContent = totalProducts;
    });
}


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


function removeItem(id) {
    const cart = getCart();

    const updatedCart = cart.filter((item) => {
        return item.id !== id;
    });

    saveCart(updatedCart);

    renderCart();
}


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


document.addEventListener("DOMContentLoaded", () => {
    updateCartBadge();

    renderFeatured();

    renderCart();

    renderSummary();
});