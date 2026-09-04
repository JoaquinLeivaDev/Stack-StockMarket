// checkout.js — Flujo de finalización de compra: validación del despacho, métodos de pago,
// confirmación de la venta y renderizado de la confirmación.
// Páginas que lo cargan: checkout.html, pago.html y confirmacion.html.
// Todas cargan antes products.js y app.js: este archivo usa getCart, cartTotals y fmt de app.js.

// QUÉ HACE: Valida el formulario de despacho (nombre, email, dirección y comuna obligatorios,
//           más el formato del email) y, si todo es correcto, guarda los datos y avanza al pago.
// CON QUÉ COMUNICA: Escucha el submit de #checkoutForm; marca los campos inválidos con la clase
//                   is-invalid (estilos Bootstrap); guarda los datos validados en localStorage
//                   ("ss_checkout") y redirige a pago.html mediante location.href.
// CUÁNDO SE EJECUTA: En checkout.html, al enviar el formulario; el listener se registra
//                    durante DOMContentLoaded.
function validateCheckout() {
    const form = document.getElementById("checkoutForm");

    if (!form) {
        return;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(form);

        const data = Object.fromEntries(
            formData.entries()
        );

        let isValid = true;

        const requiredFields = [
            "nombre",
            "email",
            "direccion",
            "comuna"
        ];

        requiredFields.forEach((fieldName) => {
            const field = form.elements[fieldName];

            const isEmpty = !String(
                data[fieldName] || ""
            ).trim();

            field.classList.toggle(
                "is-invalid",
                isEmpty
            );

            if (isEmpty) {
                isValid = false;
            }
        });


        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(data.email || "")) {
            form.elements.email.classList.add(
                "is-invalid"
            );

            isValid = false;
        }


        if (isValid) {
            localStorage.setItem(
                "ss_checkout",
                JSON.stringify(data)
            );

            location.href = "pago.html";
        }
    });
}


// Muestra u oculta los campos de tarjeta según el método de pago elegido
// (rescatado del Proyecto Almacén: mismo patrón de radio + sección condicional).
// CON QUÉ COMUNICA: Escucha los radios input[name="metodo"] y alterna la clase d-none de
//                   #camposTarjeta según el estado de #metodo-tarjeta.
// CUÁNDO SE EJECUTA: En pago.html, durante DOMContentLoaded; luego reacciona a cada cambio
//                    de método de pago (evento change de los radios).
function inicializarCamposTarjeta() {
    const metodos = document.querySelectorAll('input[name="metodo"]');
    const camposTarjeta = document.getElementById("camposTarjeta");

    if (!metodos.length || !camposTarjeta) return;

    // Muestra u oculta #camposTarjeta según si el radio "metodo-tarjeta" está seleccionado.
    function actualizarVisibilidad() {
        const tarjetaSeleccionada = document.getElementById("metodo-tarjeta")?.checked;
        camposTarjeta.classList.toggle("d-none", !tarjetaSeleccionada);
    }

    metodos.forEach((r) => r.addEventListener("change", actualizarVisibilidad));
    actualizarVisibilidad();
}

// Valida los campos de tarjeta solo si el método "Tarjeta de crédito/débito" está seleccionado
// CON QUÉ COMUNICA: Comprueba #metodo-tarjeta; valida #pagoTarjeta (16 dígitos), #pagoVencimiento
//                   (formato MM/AA) y #pagoCvv (3 o 4 dígitos) con marcarCampo, utilidad de rut.js
//                   (pago.html carga rut.js precisamente para esto). Si el pago es por otro método,
//                   devuelve true sin validar nada.
// CUÁNDO SE EJECUTA: Llamada por completePayment antes de confirmar la venta (pago.html).
function validarCamposTarjeta() {
    const tarjetaSeleccionada = document.getElementById("metodo-tarjeta")?.checked;
    if (!tarjetaSeleccionada) return true;

    const numero = document.getElementById("pagoTarjeta");
    const venc = document.getElementById("pagoVencimiento");
    const cvv = document.getElementById("pagoCvv");

    let ok = true;
    ok = marcarCampo(numero, /^\d{16}$/.test(numero.value.replace(/\s/g, "")),
        "El número de tarjeta debe tener 16 dígitos.") && ok;
    ok = marcarCampo(venc, /^(0[1-9]|1[0-2])\/\d{2}$/.test(venc.value.trim()),
        "Usa el formato MM/AA, ej: 08/27.") && ok;
    ok = marcarCampo(cvv, /^\d{3,4}$/.test(cvv.value.trim()),
        "El CVV debe tener 3 o 4 dígitos.") && ok;

    return ok;
}


// QUÉ HACE: Confirma la venta: arma el objeto de venta (id "SSM-año-timestamp", fecha local,
//           método, ítems, cliente y totales), lo guarda como última venta, vacía el carrito
//           y redirige a la página de confirmación.
// CON QUÉ COMUNICA: Lee el método activo (input[name="metodo"]:checked), el carrito con getCart
//                   (clave "ss_cart", app.js), el cliente desde "ss_checkout" y los totales con
//                   cartTotals (app.js); escribe "ss_last_sale" y elimina "ss_cart"; redirige a
//                   confirmacion.html mediante location.href.
// CUÁNDO SE EJECUTA: Al hacer clic en "Confirmar pago piloto" en pago.html (onclick del botón).
function completePayment() {
    const selectedMethod =
        document.querySelector(
            'input[name="metodo"]:checked'
        );

    if (!selectedMethod) {
        alert(
            "Selecciona un método de pago."
        );

        return;
    }

    if (!validarCamposTarjeta()) {
        return;
    }


    const sale = {
        id:
            "SSM-" +
            new Date().getFullYear() +
            "-" +
            String(Date.now()).slice(-8),

        date:
            new Date().toLocaleString(
                "es-CL"
            ),

        method:
            selectedMethod.value,

        items:
            getCart(),

        customer:
            JSON.parse(
                localStorage.getItem(
                    "ss_checkout"
                ) || "{}"
            ),

        totals:
            cartTotals()
    };


    localStorage.setItem(
        "ss_last_sale",
        JSON.stringify(sale)
    );


    localStorage.removeItem(
        "ss_cart"
    );


    location.href =
        "confirmacion.html";
}


// QUÉ HACE: Cancela el pago en curso: registra la cancelación y devuelve al usuario al carrito.
// CON QUÉ COMUNICA: Escribe el flag "ss_payment_cancelled" (valor "1") en localStorage y redirige
//                   a carrito.html. Nota: ninguna página lee ese flag hoy; queda como registro
//                   del evento de cancelación.
// CUÁNDO SE EJECUTA: Al hacer clic en "Cancelar" en pago.html (onclick del botón).
function cancelPayment() {
    localStorage.setItem(
        "ss_payment_cancelled",
        "1"
    );

    location.href =
        "carrito.html";
}


// QUÉ HACE: Renderiza el detalle de la última venta confirmada (número, fecha, método, total y
//           desglose por producto) o un aviso de advertencia si no existe venta reciente.
// CON QUÉ COMUNICA: Lee "ss_last_sale" de localStorage; escribe en #saleNumber, #saleDate,
//                   #saleMethod, #saleTotal y el desglose en #saleData; usa fmt (app.js) para los
//                   montos. No hace nada si la página no contiene #saleData.
// CUÁNDO SE EJECUTA: En confirmacion.html, durante DOMContentLoaded.
function renderSale() {
    const saleData =
        document.getElementById(
            "saleData"
        );

    if (!saleData) {
        return;
    }


    const sale =
        JSON.parse(
            localStorage.getItem(
                "ss_last_sale"
            ) || "null"
        );


    if (!sale) {
        saleData.innerHTML = `
            <div class="alert alert-warning">
                No existe una venta reciente
                para mostrar.
            </div>
        `;

        return;
    }


    document.getElementById(
        "saleNumber"
    ).textContent = sale.id;


    document.getElementById(
        "saleDate"
    ).textContent = sale.date;


    document.getElementById(
        "saleMethod"
    ).textContent = sale.method;


    document.getElementById(
        "saleTotal"
    ).textContent =
        fmt(sale.totals.total);


    saleData.innerHTML =
        sale.items
            .map((item) => {
                return `
                    <div
                        class="
                            d-flex
                            justify-content-between
                            border-bottom
                            py-2
                        "
                    >

                        <span>
                            ${item.qty}
                            ×
                            ${item.name}
                        </span>

                        <strong>
                            ${fmt(
                                item.qty *
                                item.price
                            )}
                        </strong>

                    </div>
                `;
            })
            .join("");
}


// Punto de entrada de checkout.js: según la página, engancha la validación del despacho
// (checkout.html), los campos de tarjeta (pago.html) y el detalle de la venta (confirmacion.html).
document.addEventListener(
    "DOMContentLoaded",
    () => {
        validateCheckout();

        inicializarCamposTarjeta();

        renderSale();
    }
);