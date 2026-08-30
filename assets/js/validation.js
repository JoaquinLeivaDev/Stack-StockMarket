document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("contactForm");

    if (!form) {
        return;
    }


    // Reglas de validación para cada campo del formulario
    const rules = {

        nombre: (value) => {
            return value.trim().length >= 3
                ? ""
                : "Ingresa tu nombre (mínimo 3 caracteres).";
        },

        email: (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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


    // Valida un campo individual del formulario
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


    // Agrega eventos de validación a cada campo
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


    // Evento al enviar el formulario
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