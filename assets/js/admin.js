// admin.js — Dashboard administrativo: consulta, representa y modifica productos y usuarios.
// Rol: lee y persiste el estado mediante AdminData/localStorage, respetando permisos por rol.
// Claves involucradas (vía AdminData/UserStore): "ss_admin_products", "ss_admin_session" y "ss_users".
// Página que lo carga: panelAdmin.html (después de user-store.js, admin-data.js y admin-auth.js).
// Si al cargar no hay sesión válida con permiso de dashboard, redirige a admin.html.
(function () {
    "use strict";
    // Atajo local para buscar elementos por id en el DOM del panel.
    const $ = (id) => document.getElementById(id);
    // Estado en memoria del panel: sesión activa, productos y usuarios cargados desde AdminData;
    // roleNames traduce el rol interno a un texto legible para las tablas.
    const state = { session: null, products: [], users: [] };
    const roleNames = { admin: "Administrador", seller: "Vendedor", client: "Cliente" };
    // Formatea un número como peso chileno para las tablas del panel (ej: $1.890).
    const money = (value) => `$${Number(value).toLocaleString("es-CL")}`;
    // Escapa los caracteres especiales de HTML (& < > ' ") para evitar inyección al pintar datos en las tablas.
    const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
    // El stock cero tiene prioridad; después se compara con el umbral de stock crítico.
    // Devuelve la etiqueta y la clase CSS del estado ("Sin stock"/"Crítico"/"Disponible");
    // la usa renderProducts para pintar el estado de cada fila de la tabla de productos.
    const statusOf = (product) => product.stock === 0 ? ["Sin stock", "empty"] : product.stock <= product.criticalStock ? ["Crítico", "critical"] : ["Disponible", "ok"];
    // Escribe un mensaje en el elemento indicado, en verde (éxito) o rojo (error); lo usan los submit.
    const setMessage = (id, text, good) => { $(id).textContent = text; $(id).style.color = good ? "#16733c" : "#b42318"; };
    // Referencia a #adminDashboardView: si no existe, no estamos en panelAdmin.html y el módulo termina aquí.
    const dashboard = $("adminDashboardView");
    if (!dashboard) return;
    // Construye la URL absoluta de admin.html, destino de los redireccionamientos de sesión.
    const adminUrl = () => new URL("admin.html", window.location.href).href;
    // Sin sesión o sin permiso de dashboard, se elimina cualquier sesión inválida y se vuelve al login.
    // CON QUÉ COMUNICA: AdminAuth.logout (elimina "ss_admin_session") y window.location.replace a admin.html.
    // CUÁNDO SE EJECUTA: Al cargar panelAdmin.html sin sesión válida o sin permiso de dashboard.
    function redirectToLogin() { AdminAuth.logout(); window.location.replace(adminUrl()); }
    // QUÉ HACE: Prepara la vista del panel para la sesión activa: muestra el usuario y rol en el
    //           encabezado, oculta la pestaña de usuarios y el botón de nuevo producto si el rol
    //           no es admin, carga productos y usuarios desde AdminData y renderiza todo.
    // CON QUÉ COMUNICA: Escribe en #adminCurrentUser; oculta #adminUsersTab y #adminNewProductButton;
    //                   llama a AdminData.getProducts ("ss_admin_products") y AdminData.getUsers
    //                   ("ss_users"), y finaliza con renderAll.
    // CUÁNDO SE EJECUTA: Una sola vez, al cargar el módulo tras pasar la comprobación de sesión.
    function showDashboard() { $("adminCurrentUser").textContent = `${state.session.name} · ${roleNames[state.session.role]}`; const admin = state.session.role === "admin"; $("adminUsersTab").hidden = !admin; $("adminNewProductButton").hidden = !admin; state.products = AdminData.getProducts(); state.users = AdminData.getUsers(); renderAll(); }
    // Repinta todo el panel: resumen (con sus gráficos) y tabla de productos; la tabla de
    // usuarios solo se repinta si el rol de la sesión es admin. Se llama tras cada cambio.
    function renderAll() { renderSummary(); renderProducts(); if (state.session.role === "admin") renderUsers(); }
    // QUÉ HACE: Calcula y pinta las tarjetas de resumen (total de productos, unidades, stock
    //           crítico y sin stock), la alerta de reposición cuando corresponde, y los dos
    //           gráficos de canvas.
    // CON QUÉ COMUNICA: Escribe el HTML de las tarjetas en #adminSummaryCards y el aviso en
    //                   #adminStockAlert; llama a drawPie y drawBars para los gráficos.
    // CUÁNDO SE EJECUTA: Vía renderAll: al cargar el panel y después de cada cambio de productos.
    function renderSummary() { const critical = state.products.filter((product) => product.stock <= product.criticalStock); $("adminSummaryCards").innerHTML = [["Productos", state.products.length], ["Unidades", state.products.reduce((sum, product) => sum + product.stock, 0)], ["Stock crítico", critical.length], ["Sin stock", state.products.filter((product) => product.stock === 0).length]].map(([label, value]) => `<article class="admin-summary-card"><span>${label}</span><strong>${value}</strong></article>`).join(""); $("adminStockAlert").hidden = !critical.length; $("adminStockAlert").textContent = critical.length ? `Alerta: ${critical.length} producto(s) requieren reposición.` : ""; drawPie(); drawBars(); }
    // QUÉ HACE: Pinta la tabla de productos con precio, stocks y estado (statusOf); si el rol
    //           es admin agrega botones de editar/eliminar por fila; si es seller muestra "Solo consulta".
    // CON QUÉ COMUNICA: Escribe en #adminProductsBody; los botones llevan los atributos
    //                   data-edit-product / data-delete-product, que captura el listener delegado
    //                   del mismo #adminProductsBody (más abajo).
    // CUÁNDO SE EJECUTA: Vía renderAll: al cargar el panel y tras cada cambio de productos.
    function renderProducts() { $("adminProductsBody").innerHTML = state.products.map((product) => { const [label, kind] = statusOf(product); const actions = state.session.role === "admin" ? `<button class="admin-button admin-button--ghost" data-edit-product="${product.id}" type="button">Editar</button><button class="admin-button admin-button--danger" data-delete-product="${product.id}" type="button">Eliminar</button>` : "Solo consulta"; return `<tr><td>${escapeHtml(product.emoji || "📦")} ${escapeHtml(product.name)}</td><td>${escapeHtml(product.category)}</td><td>${money(product.price)}</td><td>${product.stock}</td><td>${product.criticalStock}</td><td><span class="admin-status admin-status--${kind}">${label}</span></td><td><div class="admin-row-actions">${actions}</div></td></tr>`; }).join(""); }
    // QUÉ HACE: Pinta la tabla de usuarios con nombre, correo, rol y botones de editar/eliminar
    //           (solo el admin llega a verla: renderAll la omite para otros roles).
    // CON QUÉ COMUNICA: Escribe en #adminUsersBody; los botones llevan data-edit-user /
    //                   data-delete-user, capturados por delegación en el mismo elemento.
    // CUÁNDO SE EJECUTA: Vía renderAll y tras cada cambio de usuarios (alta, edición o eliminación).
    function renderUsers() { $("adminUsersBody").innerHTML = state.users.map((user) => `<tr><td>${escapeHtml(user.name)}</td><td>${escapeHtml(user.email)}</td><td>${roleNames[user.role]}</td><td><div class="admin-row-actions"><button class="admin-button admin-button--ghost" data-edit-user="${user.id}" type="button">Editar</button><button class="admin-button admin-button--danger" data-delete-user="${user.id}" type="button">Eliminar</button></div></td></tr>`).join(""); }
    // QUÉ HACE: Dibuja a mano (Canvas 2D) el gráfico de torta con la distribución de stock
    //           (disponible / crítico / sin stock) y genera su leyenda con los conteos.
    // CON QUÉ COMUNICA: Canvas #adminStockPie y leyenda #adminPieLegend; trabaja sobre
    //                   state.products, sin tocar localStorage.
    // CUÁNDO SE EJECUTA: Llamada por renderSummary en cada render del panel.
    function drawPie() { const canvas = $("adminStockPie"), context = canvas.getContext("2d"), counts = [state.products.filter((p) => p.stock > p.criticalStock).length, state.products.filter((p) => p.stock > 0 && p.stock <= p.criticalStock).length, state.products.filter((p) => p.stock === 0).length], colors = ["#27ae60", "#f0a202", "#d64545"], labels = ["Disponible", "Crítico", "Sin stock"]; context.clearRect(0, 0, canvas.width, canvas.height); const total = counts.reduce((sum, value) => sum + value, 0) || 1; let start = -Math.PI / 2; counts.forEach((count, index) => { const slice = count / total * Math.PI * 2; context.beginPath(); context.moveTo(180, 120); context.arc(180, 120, 88, start, start + slice); context.closePath(); context.fillStyle = colors[index]; context.fill(); start += slice; }); $("adminPieLegend").innerHTML = labels.map((label, index) => `<span><i style="background:${colors[index]};display:inline-block;width:10px;height:10px;border-radius:50%"></i> ${label}: ${counts[index]}</span>`).join(""); }
    // QUÉ HACE: Dibuja a mano (Canvas 2D) el gráfico de barras de stock por producto: barra
    //           naranja si el stock está en nivel crítico, azul en caso contrario, con el
    //           nombre rotado 45° y la cantidad sobre cada barra.
    // CON QUÉ COMUNICA: Canvas #adminStockBars; trabaja sobre state.products, sin tocar localStorage.
    // CUÁNDO SE EJECUTA: Llamada por renderSummary en cada render del panel.
    function drawBars() { const canvas = $("adminStockBars"), context = canvas.getContext("2d"), max = Math.max(...state.products.map((product) => product.stock), 1), width = canvas.width / Math.max(state.products.length, 1); context.clearRect(0, 0, canvas.width, canvas.height); state.products.forEach((product, index) => { const height = product.stock / max * 205, x = index * width + 8; context.fillStyle = product.stock <= product.criticalStock ? "#e87514" : "#24577f"; context.fillRect(x, 235 - height, Math.max(width - 14, 8), height); context.fillStyle = "#40556b"; context.font = "11px system-ui"; context.save(); context.translate(x + 7, 252); context.rotate(-Math.PI / 4); context.fillText(product.name.slice(0, 16), 0, 0); context.restore(); context.fillText(String(product.stock), x + 4, 228 - height); }); }
    // Limpia los mensajes de error de campo (.admin-field-error) del formulario indicado; se
    // llama al comenzar cada submit para partir sin errores previos.
    function clearErrors(form) { form.querySelectorAll(".admin-field-error").forEach((element) => { element.textContent = ""; }); }
    // QUÉ HACE: Muestra el formulario de producto en modo creación (sin argumento) o edición
    //           (con el producto a editar) y enfoca el campo nombre.
    // CON QUÉ COMUNICA: Muestra #adminProductFormWrap; escribe #adminProductFormTitle y completa
    //                   #adminProductId, #adminProductName, #adminProductCategory, #adminProductPrice,
    //                   #adminProductStock, #adminProductCriticalStock y #adminProductEmoji.
    // CUÁNDO SE EJECUTA: Al hacer clic en #adminNewProductButton o en "Editar" de una fila de productos.
    function productForm(product) { $("adminProductFormWrap").hidden = false; $("adminProductFormTitle").textContent = product ? "Editar producto" : "Nuevo producto"; $("adminProductId").value = product?.id || ""; $("adminProductName").value = product?.name || ""; $("adminProductCategory").value = product?.category || ""; $("adminProductPrice").value = product?.price ?? ""; $("adminProductStock").value = product?.stock ?? ""; $("adminProductCriticalStock").value = product?.criticalStock ?? ""; $("adminProductEmoji").value = product?.emoji || "📦"; $("adminProductName").focus(); }
    // QUÉ HACE: Muestra el formulario de usuario en modo creación o edición; la contraseña
    //           parte siempre vacía (en edición es opcional, para conservar el hash actual).
    // CON QUÉ COMUNICA: Muestra #adminUserFormWrap; escribe #adminUserFormTitle y completa
    //                   #adminUserId, #adminUserName, #adminUserEmail, #adminUserRole y #adminUserPassword.
    // CUÁNDO SE EJECUTA: Al hacer clic en #adminNewUserButton o en "Editar" de una fila de usuarios.
    function userForm(user) { $("adminUserFormWrap").hidden = false; $("adminUserFormTitle").textContent = user ? "Editar usuario" : "Nuevo usuario"; $("adminUserId").value = user?.id || ""; $("adminUserName").value = user?.name || ""; $("adminUserEmail").value = user?.email || ""; $("adminUserRole").value = user?.role || "seller"; $("adminUserPassword").value = ""; $("adminUserName").focus(); }
    // Cierre de sesión del panel: elimina "ss_admin_session" (AdminAuth.logout) y vuelve al login (admin.html).
    $("adminLogoutButton").addEventListener("click", () => { AdminAuth.logout(); window.location.replace(adminUrl()); });
    // Navegación por pestañas del panel: marca la pestaña activa (.is-active) y muestra solo
    // la sección correspondiente (la .admin-section cuyo id coincide con data-section).
    document.querySelectorAll(".admin-tab").forEach((tab) => tab.addEventListener("click", () => { document.querySelectorAll(".admin-tab").forEach((item) => item.classList.toggle("is-active", item === tab)); document.querySelectorAll(".admin-section").forEach((section) => { section.hidden = section.id !== `adminSection${tab.dataset.section[0].toUpperCase()}${tab.dataset.section.slice(1)}`; }); }));
    // Botones de apertura y cancelación de los formularios de producto y usuario (muestran u ocultan los contenedores).
    $("adminNewProductButton").addEventListener("click", () => productForm()); $("adminCancelProductButton").addEventListener("click", () => { $("adminProductFormWrap").hidden = true; }); $("adminNewUserButton").addEventListener("click", () => userForm()); $("adminCancelUserButton").addEventListener("click", () => { $("adminUserFormWrap").hidden = true; });
    // Delegación de eventos de la tabla de productos: "Editar" abre productForm con el producto;
    // "Eliminar" pide confirmación, quita el ítem, persiste con AdminData.saveProducts
    // ("ss_admin_products") y repinta el panel (renderAll).
    $("adminProductsBody").addEventListener("click", (event) => { const edit = event.target.closest("[data-edit-product]"), remove = event.target.closest("[data-delete-product]"); if (edit) productForm(state.products.find((item) => item.id === edit.dataset.editProduct)); if (remove && window.confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) { state.products = state.products.filter((item) => item.id !== remove.dataset.deleteProduct); AdminData.saveProducts(state.products); renderAll(); } });
    // Delegación de eventos de la tabla de usuarios: "Editar" abre userForm; "Eliminar" pide
    // confirmación, impide eliminar la propia sesión activa, persiste con AdminData.saveUsers
    // ("ss_users") y repinta la tabla de usuarios.
    $("adminUsersBody").addEventListener("click", (event) => { const edit = event.target.closest("[data-edit-user]"), remove = event.target.closest("[data-delete-user]"); if (edit) userForm(state.users.find((item) => item.id === edit.dataset.editUser)); if (remove && window.confirm("¿Eliminar este usuario? Esta acción no se puede deshacer.")) { if (remove.dataset.deleteUser === state.session.userId) { setMessage("adminUserMessage", "No puedes eliminar tu propia sesión."); return; } state.users = state.users.filter((item) => item.id !== remove.dataset.deleteUser); AdminData.saveUsers(state.users); renderUsers(); } });
    // Productos: nombre y categoría obligatorios; precio, stock y stock crítico deben ser enteros no negativos.
    // CON QUÉ COMUNICA: Lee #adminProductForm; persiste con AdminData.saveProducts ("ss_admin_products")
    //                   y repinta con renderAll. Un id vacío significa alta nueva (id generado con Date.now).
    // CUÁNDO SE EJECUTA: Al enviar el formulario de producto (submit con preventDefault).
    $("adminProductForm").addEventListener("submit", (event) => { event.preventDefault(); const name = $("adminProductName").value.trim(), category = $("adminProductCategory").value.trim(), price = Number($("adminProductPrice").value), stock = Number($("adminProductStock").value), criticalStock = Number($("adminProductCriticalStock").value), id = $("adminProductId").value; clearErrors(event.currentTarget); const errors = {}; if (!name) errors.productName = "El nombre es obligatorio."; if (!category) errors.productCategory = "La categoría es obligatoria."; if (!Number.isInteger(price) || price < 0) errors.productPrice = "Ingresa un precio válido."; if (!Number.isInteger(stock) || stock < 0) errors.productStock = "Ingresa un stock válido."; if (!Number.isInteger(criticalStock) || criticalStock < 0) errors.criticalStock = "Ingresa un stock crítico válido."; Object.entries(errors).forEach(([key, value]) => event.currentTarget.querySelector(`[data-error-for="${key}"]`).textContent = value); if (Object.keys(errors).length) return; const item = { id: id || `p-${Date.now()}`, name, category, price, stock, criticalStock, emoji: $("adminProductEmoji").value.trim() || "📦" }; state.products = id ? state.products.map((product) => product.id === id ? item : product) : [...state.products, item]; AdminData.saveProducts(state.products); $("adminProductFormWrap").hidden = true; renderAll(); });
    // Usuarios: valida identidad, dominio, contraseña obligatoria en altas y duplicados de correo.
    // CON QUÉ COMUNICA: Lee #adminUserForm; hashea la contraseña con AdminAuth.hashPassword;
    //                   persiste con AdminData.saveUsers ("ss_users" vía UserStore) y repinta usuarios.
    // CUÁNDO SE EJECUTA: Al enviar el formulario de usuario (submit con preventDefault).
    $("adminUserForm").addEventListener("submit", async (event) => { event.preventDefault(); const id = $("adminUserId").value, name = $("adminUserName").value.trim(), email = $("adminUserEmail").value.trim(), role = $("adminUserRole").value, password = $("adminUserPassword").value; clearErrors(event.currentTarget); const errors = {}; if (!name) errors.userName = "El nombre es obligatorio."; if (!AdminAuth.validEmail(email)) errors.userEmail = "Dominio no permitido."; if (!id && !AdminAuth.validPassword(password)) errors.userPassword = "La contraseña debe tener entre 4 y 10 caracteres."; if (id && password && !AdminAuth.validPassword(password)) errors.userPassword = "La contraseña debe tener entre 4 y 10 caracteres."; if (state.users.some((user) => user.email.toLowerCase() === email.toLowerCase() && user.id !== id)) errors.userEmail = "Ese correo ya existe."; Object.entries(errors).forEach(([key, value]) => event.currentTarget.querySelector(`[data-error-for="${key}"]`).textContent = value); if (Object.keys(errors).length) return; const current = state.users.find((user) => user.id === id); const item = { id: id || `u-${Date.now()}`, name, email, role, passwordHash: password ? await AdminAuth.hashPassword(password) : current.passwordHash }; state.users = id ? state.users.map((user) => user.id === id ? item : user) : [...state.users, item]; AdminData.saveUsers(state.users); $("adminUserFormWrap").hidden = true; renderUsers(); });
    // La sesión persistida y el permiso de dashboard son ambas condiciones de entrada.
    // Se ejecuta al cargar el módulo (sin esperar DOMContentLoaded): lee la sesión con
    // AdminAuth.getSession ("ss_admin_session"), la valida y muestra el panel o redirige.
    state.session = AdminAuth.getSession(); if (!state.session || !AdminAuth.can(state.session.role, "dashboard")) { redirectToLogin(); return; } showDashboard();
}());
