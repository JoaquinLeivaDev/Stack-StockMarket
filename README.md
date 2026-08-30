# Stack & Stock Market — Frontend E-commerce (versión unificada)

Proyecto académico de Desarrollo Fullstack II (DSY1104). Este proyecto une **lo mejor de dos
entregas de equipo** (Proyecto Almacén y Stack & Stock Market) en una sola base de código,
lista para editar en VS Code y para seguir desarrollando en el repositorio Git del equipo.

## Tecnologías
- HTML5 semántico
- CSS3 externo (`assets/css/styles.css`)
- JavaScript vanilla, modularizado por responsabilidad
- Bootstrap 5 por CDN
- localStorage para carrito, checkout y demo de venta

## Páginas
`index.html`, `quienes-somos.html`, `catalogo.html` (único, filtrable por categoría y búsqueda),
`contacto.html`, `login.html`, `registro.html`, `carrito.html`, `checkout.html`, `pago.html`,
`confirmacion.html`.

## Qué se rescató de cada proyecto

**De stack-stock-market** (estructura base de esta versión unificada):
- Organización del JS en módulos por responsabilidad: `products.js`, `app.js` (carrito/toast),
  `validation.js` (contacto), `checkout.js` (checkout + pasarela + venta).
- Flujo de compra completo: catálogo → carrito → checkout → pasarela de pago → confirmación
  de venta con número de operación.
- 3 páginas de catálogo, página "Quiénes somos", video institucional embebido (YouTube).
- README con justificación de decisiones técnicas ("cómo defenderlo").

**Del Proyecto Almacén** (incorporado en esta versión):
- `login.html` y `registro.html`, ausentes en stack-stock-market.
- Validación de **RUT chileno con dígito verificador y formateo automático en vivo**
  (`assets/js/rut.js`), usada en el registro.
- Validación en tiempo real (`input`/`change`) con mensajes de error específicos por campo,
  incluyendo teléfono con formato chileno.
- Campos de tarjeta condicionales en la pasarela de pago (solo aparecen si se elige "Tarjeta
  de crédito/débito"), con validación de número (16 dígitos), vencimiento (MM/AA) y CVV.
- Barra de anuncios animada ("info-strip") en la parte superior de todas las páginas.
- **Catálogo único con filtro** por categoría (`<select>` generado dinámicamente desde
  `PRODUCTS`) y búsqueda en vivo por nombre, reemplazando las 3 páginas de catálogo paginado
  de stack-stock-market. Soporta preseleccionar categoría desde la URL (`catalogo.html?categoria=Bebidas`).

## Cumplimiento de pauta (Evaluación Parcial N°1, DSY1104)
- HTML5 semántico: `header`, `nav`, `main`, `section`, `article` y `footer` en todas las páginas.
- Hipervínculos funcionales y navegación coherente entre las 12 páginas.
- Imágenes, logo, botones, video embebido y formularios interactivos.
- CSS externo aplicado de forma consistente en todas las páginas.
- Formularios validados con JavaScript: contacto, checkout, pago, login y registro.
- Diseño responsive con Bootstrap + media queries propias.

## Pendiente para completar la nota (no incluido en este .zip)
- **Repositorio Git colaborativo**: este .zip no trae historial `.git`. Para el indicador
  IE1.3.1 (12%) e IE1.3.2 (20%) deben subir este código a un repositorio GitHub del equipo,
  hacer commits descriptivos y distribuidos entre los integrantes.
- **Documento ERS** (Especificación de Requisitos del Software), versión 1 (propuesta previa).

## Cómo defenderlo
**¿Por qué localStorage?** La evaluación actual es frontend. Permite demostrar estado y flujo
sin crear un backend ficticio. Luego será reemplazado por una API.

**¿Qué conectará con el POS?** Productos, categorías, stock y cuentas de usuario vendrán del
backend. La confirmación de compra generará una venta real y descontará stock.

**¿La pasarela cobra?** No. Es un piloto visual. Una integración real necesita backend,
credenciales y proveedor de pago (Transbank, Mercado Pago, Flow, etc.).

**¿Por qué se validó el RUT?** Para un comercio chileno, validar el RUT en el registro evita
cuentas con datos inválidos y demuestra dominio de expresiones regulares y lógica de negocio
(cálculo del dígito verificador), más allá de lo mínimo pedido por la pauta.

**¿Por qué Bootstrap + CSS propio?** Bootstrap resuelve grid, navbar y responsive; el CSS
propio crea identidad visual, animaciones (info-strip) y ajustes específicos del negocio.

## Commits sugeridos (para el repositorio del equipo)
1. `feat: estructura inicial y navegacion multipagina`
2. `feat: catalogo paginado y carrito de compras`
3. `feat: login y registro con validacion de RUT chileno`
4. `feat: checkout, pasarela de pago con campos de tarjeta condicionales`
5. `style: barra de anuncios animada y ajustes responsive`
6. `docs: unificar README con justificacion de decisiones tecnicas`
