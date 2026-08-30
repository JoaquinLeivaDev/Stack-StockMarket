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
function inicializarCamposTarjeta() {
    const metodos = document.querySelectorAll('input[name="metodo"]');
    const camposTarjeta = document.getElementById("camposTarjeta");

    if (!metodos.length || !camposTarjeta) return;

    function actualizarVisibilidad() {
        const tarjetaSeleccionada = document.getElementById("metodo-tarjeta")?.checked;
        camposTarjeta.classList.toggle("d-none", !tarjetaSeleccionada);
    }

    metodos.forEach((r) => r.addEventListener("change", actualizarVisibilidad));
    actualizarVisibilidad();
}

// Valida los campos de tarjeta solo si el método "Tarjeta de crédito/débito" está seleccionado
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


function cancelPayment() {
    localStorage.setItem(
        "ss_payment_cancelled",
        "1"
    );

    location.href =
        "carrito.html";
}


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


document.addEventListener(
    "DOMContentLoaded",
    () => {
        validateCheckout();

        inicializarCamposTarjeta();

        renderSale();
    }
);