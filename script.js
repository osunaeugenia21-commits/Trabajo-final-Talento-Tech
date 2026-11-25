// ========================================
// Configuración y variables globales
// ========================================

let carrito = JSON.parse(localStorage.getItem("carritoLavander")) || [];

document.addEventListener("DOMContentLoaded", function () {
    actualizarContador();

    if (document.querySelector(".productos-grid")) {
        cargarProductosAPI();
    }

    if (document.querySelector(".tabla-carrito")) {
        mostrarCarrito();
        activarBotonesCompra();
    }

    let formContacto = document.querySelector("form");
    if (formContacto) {
        validarFormulario(formContacto);
    }
});

// ======================================
// API y renderizado
// ======================================

function cargarProductosAPI() {
    let contenedorProductos = document.querySelector(".productos-grid");
    contenedorProductos.innerHTML = "<p style='grid-column: 1/-1; text-align: center;'>Cargando catálogo de productos...</p>";

    fetch("https://dummyjson.com/products/category/mobile-accessories?limit=8")
        .then(function (respuesta) {
            return respuesta.json();
        })
        .then(function (datos) {
            let listaProductos = datos.products;
            contenedorProductos.innerHTML = "";

            listaProductos.forEach(function (producto) {
                let precioPesos = Math.round(producto.price * 1000);

                let tarjeta = document.createElement("article");
                tarjeta.classList.add("producto-card");

                tarjeta.innerHTML = `
                    <img src="${producto.thumbnail}" alt="${producto.title}">
                    <div class="producto-info">
                        <h3>${producto.title}</h3>
                        <p class="precio">$${precioPesos.toLocaleString("es-AR")}</p>
                        <button class="btn-agregar">Agregar al carrito</button>
                    </div>
                `;

                let boton = tarjeta.querySelector(".btn-agregar");
                boton.addEventListener("click", function () {
                    agregarAlCarrito({
                        id: producto.id,
                        nombre: producto.title,
                        precio: precioPesos,
                        imagen: producto.thumbnail
                    });
                });

                contenedorProductos.appendChild(tarjeta);
            });
        })
        .catch(function (error) {
            console.error("Error al conectar con la API:", error);
            contenedorProductos.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: red;'>No se pudieron cargar los productos. Verificá tu conexión.</p>";
        });
}

// ============================================
// Carrito y Localstorage
// ============================================

function agregarAlCarrito(productoNuevo) {
    let productoExistente = carrito.find(function (item) {
        return item.id === productoNuevo.id;
    });

    if (productoExistente) {
        productoExistente.cantidad = productoExistente.cantidad + 1;
    } else {
        carrito.push({
            id: productoNuevo.id,
            nombre: productoNuevo.nombre,
            precio: productoNuevo.precio,
            imagen: productoNuevo.imagen,
            cantidad: 1
        });
    }

    guardarEnStorage();
    actualizarContador();
    mostrarAvisoAgregado(productoNuevo.nombre);
}

function guardarEnStorage() {
    localStorage.setItem("carritoLavander", JSON.stringify(carrito));
}

function actualizarContador() {
    let totalItems = 0;

    carrito.forEach(function (item) {
        totalItems = totalItems + item.cantidad;
    });

    let contadores = document.querySelectorAll(".contador-carrito");
    contadores.forEach(function (badge) {
        badge.textContent = totalItems;
    });
}

function mostrarAvisoAgregado(nombreProducto) {
    let aviso = document.createElement("div");
    aviso.textContent = "Agregaste: " + nombreProducto;
    aviso.style.position = "fixed";
    aviso.style.bottom = "20px";
    aviso.style.right = "20px";
    aviso.style.backgroundColor = "#6c5ce7";
    aviso.style.color = "white";
    aviso.style.padding = "12px 20px";
    aviso.style.borderRadius = "8px";
    aviso.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";
    aviso.style.zIndex = "1000";

    document.body.appendChild(aviso);

    setTimeout(function () {
        aviso.remove();
    }, 2000);
}

// ====================================
// Carrito
// ====================================

function mostrarCarrito() {
    let cuerpoTabla = document.querySelector(".tabla-carrito tbody");
    let subtotalTexto = document.getElementById("carrito-subtotal");
    let totalTexto = document.getElementById("carrito-total");

    cuerpoTabla.innerHTML = "";

    if (carrito.length === 0) {
        cuerpoTabla.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 30px;">
                    Tu carrito está vacío. <a href="tienda.html" style="color: #6c5ce7; font-weight: bold;">Ir a la tienda</a>
                </td>
            </tr>
        `;
        if (subtotalTexto) subtotalTexto.textContent = "$0";
        if (totalTexto) totalTexto.textContent = "$0";
        return;
    }

    let sumaTotal = 0;

    carrito.forEach(function (item, indice) {
        let subtotalProducto = item.precio * item.cantidad;
        sumaTotal = sumaTotal + subtotalProducto;

        let fila = document.createElement("tr");
        fila.innerHTML = `
            <td class="producto-celda">
                <img src="${item.imagen}" alt="${item.nombre}">
                <span>${item.nombre}</span>
            </td>
            <td>$${item.precio.toLocaleString("es-AR")}</td>
            <td>
                <button type="button" class="btn-restar" data-index="${indice}">-</button>
                <span class="cantidad-numero" style="margin: 0 10px; font-weight: bold;">${item.cantidad}</span>
                <button type="button" class="btn-sumar" data-index="${indice}">+</button>
            </td>
            <td>$${subtotalProducto.toLocaleString("es-AR")}</td>
            <td>
                <button type="button" class="btn-eliminar" data-index="${indice}" aria-label="Eliminar producto">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;

        cuerpoTabla.appendChild(fila);
    });

    if (subtotalTexto) subtotalTexto.textContent = "$" + sumaTotal.toLocaleString("es-AR");
    if (totalTexto) totalTexto.textContent = "$" + sumaTotal.toLocaleString("es-AR");

    activarEventosTabla();
}

function activarEventosTabla() {
    document.querySelectorAll(".btn-sumar").forEach(function (boton) {
        boton.addEventListener("click", function () {
            let i = boton.getAttribute("data-index");
            carrito[i].cantidad++;
            guardarEnStorage();
            mostrarCarrito();
            actualizarContador();
        });
    });

    document.querySelectorAll(".btn-restar").forEach(function (boton) {
        boton.addEventListener("click", function () {
            let i = boton.getAttribute("data-index");
            if (carrito[i].cantidad > 1) {
                carrito[i].cantidad--;
            } else {
                carrito.splice(i, 1);
            }
            guardarEnStorage();
            mostrarCarrito();
            actualizarContador();
        });
    });

    document.querySelectorAll(".btn-eliminar").forEach(function (boton) {
        boton.addEventListener("click", function () {
            let i = boton.getAttribute("data-index");
            carrito.splice(i, 1);
            guardarEnStorage();
            mostrarCarrito();
            actualizarContador();
        });
    });
}

function activarBotonesCompra() {
    let btnFinalizar = document.querySelector(".btn-finalizar");
    let btnVaciar = document.getElementById("btn-vaciar-carrito");
    let cajaMensaje = document.getElementById("mensaje-compra");

    if (!cajaMensaje && btnFinalizar) {
        cajaMensaje = document.createElement("div");
        cajaMensaje.id = "mensaje-compra";
        btnFinalizar.insertAdjacentElement("afterend", cajaMensaje);
    }

    if (btnVaciar) {
        btnVaciar.addEventListener("click", function () {
            carrito = [];
            guardarEnStorage();
            mostrarCarrito();
            actualizarContador();
        });
    }

    if (btnFinalizar) {
        btnFinalizar.addEventListener("click", function () {
            if (carrito.length === 0) {
                cajaMensaje.style.color = "#e84118";
                cajaMensaje.style.marginTop = "15px";
                cajaMensaje.style.fontWeight = "bold";
                cajaMensaje.textContent = "El carrito está vacío. Agregá productos para comprar.";
                return;
            }

            carrito = [];
            guardarEnStorage();
            mostrarCarrito();
            actualizarContador();

            cajaMensaje.style.color = "#27ae60";
            cajaMensaje.style.backgroundColor = "#f0fff4";
            cajaMensaje.style.border = "1px solid #27ae60";
            cajaMensaje.style.padding = "12px";
            cajaMensaje.style.borderRadius = "8px";
            cajaMensaje.style.marginTop = "15px";
            cajaMensaje.style.fontWeight = "bold";
            cajaMensaje.textContent = "¡Compra realizada con éxito! Gracias por elegir Lavander Studio.";
        });
    }
}

// ======================================
// Validación formulario de contacto
// ======================================

function validarFormulario(form) {
    let mensajeEstado = document.getElementById("mensaje-validacion");

    if (!mensajeEstado) {
        mensajeEstado = document.createElement("p");
        mensajeEstado.id = "mensaje-validacion";
        mensajeEstado.style.marginTop = "15px";
        mensajeEstado.style.padding = "12px";
        mensajeEstado.style.borderRadius = "8px";
        mensajeEstado.style.fontWeight = "bold";
        mensajeEstado.style.textAlign = "center";
        form.appendChild(mensajeEstado);
    }

    form.addEventListener("submit", function (evento) {
        evento.preventDefault();

        let campos = form.querySelectorAll("input, textarea");

        for (let i = 0; i < campos.length; i++) {
            let campo = campos[i];
            if (campo.type === "submit" || campo.type === "button" || campo.type === "hidden") {
                continue;
            }

            if (campo.value.trim() === "") {
                mensajeEstado.style.color = "#e84118";
                mensajeEstado.style.backgroundColor = "#fff0f0";
                mensajeEstado.textContent = "Por favor, completá todos los campos antes de enviar.";
                return;
            }

            if (campo.type === "email" && !campo.value.includes("@")) {
                mensajeEstado.style.color = "#e84118";
                mensajeEstado.style.backgroundColor = "#fff0f0";
                mensajeEstado.textContent = "Por favor, ingresá un correo electrónico válido.";
                return;
            }
        }

        mensajeEstado.style.color = "#27ae60";
        mensajeEstado.style.backgroundColor = "#f0fff4";
        mensajeEstado.textContent = "¡Mensaje enviado con éxito! Te responderemos a la brevedad.";
        form.reset();
    });
}