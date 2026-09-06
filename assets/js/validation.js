// validation.js — Validación en vivo del formulario de contacto.
// Rol: valida campo a campo (nombre, email, teléfono, asunto y mensaje) con reglas propias,
// marca los inputs con is-valid/is-invalid (estilos Bootstrap), muestra el mensaje de error
// junto a cada campo y un aviso de éxito al enviar. No usa localStorage: es validación de
// interfaz solamente (no hay backend que reciba el formulario).
// Página que lo carga: contacto.html (después de products.js y app.js).

// Punto de entrada del archivo: al cargar el DOM busca #contactForm y, si existe, define las
// reglas, engancha los eventos por campo y maneja el envío. Si el formulario no está (otra
// página), no hace nada.
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("contactForm");

    if (!form) {
        return;
    }


    // Reglas de validación para cada campo del formulario.
    // Cada regla recibe el valor del campo y devuelve "" si es válido o el mensaje de error
    // que se mostrará en el .invalid-feedback correspondiente.
    const rules = {

        nombre: (value) => {
            return value.trim().length >= 3
                ? ""
                : "Ingresa tu nombre (mínimo 3 caracteres).";
        },

        email: (value) => {
            const emailRegex = /^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;

            return emailRegex.test(value)
                ? ""
                : "Ingresa un correo válido.";
        },

        telefono: (value) => {
            const phoneRegex = /^(\+?56)?[\s-]?9[\s-]?\d{4}[\s-]?\d{4}$/;

            return phoneRegex.test(value.trim())
                ? ""
                : "Ejemplo válido: +56 9 1234 5678.";
        },

        asunto: (value) => {
            return value
                ? ""
                : "Selecciona un asunto.";
        },

        mensaje: (value) => {
            return value.trim().length >= 10
                ? ""
                : "Cuéntanos un poco más (mínimo 10 caracteres).";
        }
    };


    // Valida un campo individual del formulario.
    // CON QUÉ COMUNICA: consulta la regla según field.name, alterna las clases is-invalid /
    //                   is-valid del input y escribe el mensaje en el .invalid-feedback que
    //                   vive en su elemento padre. Devuelve true si el campo es válido.
    // CUÁNDO SE EJECUTA: En el evento blur de cada campo, mientras se escribe si el campo
    //                    ya tenía error, y para todos los campos al enviar el formulario.
    const validate = (field) => {

        const message =
            rules[field.name](field.value);

        const feedback =
            field.parentElement.querySelector(
                ".invalid-feedback"
            );


        // Agrega o elimina la clase de error
        field.classList.toggle(
            "is-invalid",
            Boolean(message)
        );


        // Agrega o elimina la clase de campo válido
        field.classList.toggle(
            "is-valid",
            !message
        );


        // Muestra el mensaje correspondiente
        if (feedback) {
            feedback.textContent = message;
        }


        return !message;
    };


    // Agrega eventos de validación a cada campo (una sola vez, durante el DOMContentLoaded):
    // valida al salir del campo (blur) y vuelve a validar mientras escribe solo si había error.
    Object.keys(rules).forEach((fieldName) => {

        const field =
            form.elements[fieldName];


        // Valida cuando el usuario sale del campo
        field.addEventListener(
            "blur",
            () => {
                validate(field);
            }
        );


        // Si existe un error, vuelve a validar mientras escribe
        field.addEventListener(
            "input",
            () => {

                if (
                    field.classList.contains(
                        "is-invalid"
                    )
                ) {
                    validate(field);
                }

            }
        );

    });


    // Evento al enviar el formulario.
    // QUÉ HACE: valida todos los campos; si todos pasan, muestra el aviso de éxito,
    //           limpia el formulario y quita los estilos de validación restantes.
    // CON QUÉ COMUNICA: evento submit de #contactForm con preventDefault (sin envío real);
    //                   muestra #contactSuccess (quitándole la clase d-none) y llama a form.reset().
    // CUÁNDO SE EJECUTA: Al hacer clic en el botón de envío del formulario de contacto.
    form.addEventListener(
        "submit",
        (event) => {

            // Evita el envío tradicional del formulario
            event.preventDefault();


            // Valida todos los campos
            const validations =
                Object.keys(rules).map(
                    (fieldName) => {
                        return validate(
                            form.elements[fieldName]
                        );
                    }
                );


            // Comprueba que todos sean válidos
            const formIsValid =
                validations.every(Boolean);


            if (formIsValid) {

                // Muestra mensaje de éxito
                document
                    .getElementById(
                        "contactSuccess"
                    )
                    .classList.remove(
                        "d-none"
                    );


                // Limpia los campos
                form.reset();


                // Elimina los estilos de validación
                form
                    .querySelectorAll(
                        ".is-valid"
                    )
                    .forEach((field) => {

                        field.classList.remove(
                            "is-valid"
                        );

                    });

            }

        }
    );

});