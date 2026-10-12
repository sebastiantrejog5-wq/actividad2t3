
/* GENERADOR DE CODIGOS QR - TECNL */

let tipoActual = "url";
let textoResultado = "";

const contenido = document.getElementById("contenido");
const contenedorQR = document.getElementById("codigoQR");
const mensaje = document.getElementById("mensaje");
const botonDescargar = document.getElementById("botonDescargar");

/* CONFIGURACION DE LOS TIPOS DE QR */
const configuracionTipos = {
    url: {
        etiqueta: "Enlace o URL",
        placeholder: "https://ejemplo.com"
    },

    texto: {
        etiqueta: "Texto para el codigo QR",
        placeholder: "Escribe el texto que deseas compartir..."
    },

    wifi: {
        etiqueta: "Informacion de la red Wi-Fi",
        placeholder: "Completa los datos de tu red Wi-Fi."
    },

    correo: {
        etiqueta: "Mensaje opcional",
        placeholder: "Escribe un mensaje para el correo..."
    }
};

/* CAMBIAR TIPO DE QR */
document.querySelectorAll(".tipo").forEach(function(boton) {
    boton.addEventListener("click", function() {
        seleccionarTipo(boton.dataset.tipo);
    });
});

function seleccionarTipo(tipo) {
    tipoActual = tipo;

    document.querySelectorAll(".tipo").forEach(function(boton) {
        boton.classList.toggle(
            "activo",
            boton.dataset.tipo === tipo
        );
    });

    document.getElementById("camposWifi")
        .classList.toggle("oculto", tipo !== "wifi");

    document.getElementById("camposCorreo")
        .classList.toggle("oculto", tipo !== "correo");

    document.getElementById("etiquetaContenido").textContent =
        configuracionTipos[tipo].etiqueta;

    contenido.placeholder =
        configuracionTipos[tipo].placeholder;

    contenido.value = "";
    mensaje.textContent = "";
}

/* OBTENER LA INFORMACION PARA EL QR */
function obtenerTextoQR() {
    const texto = contenido.value.trim();

    if (tipoActual === "url" || tipoActual === "texto") {
        return texto;
    }

    /* QR PARA WIFI */
    if (tipoActual === "wifi") {
        const ssid = document.getElementById("nombreWifi")
            .value.trim();

        const clave = document.getElementById("claveWifi")
            .value;

        const seguridad = document.getElementById("seguridadWifi")
            .value;

        if (!ssid) {
            mensaje.textContent =
                "Escribe el nombre de la red Wi-Fi.";
            return "";
        }

        if (seguridad !== "nopass" && !clave) {
            mensaje.textContent =
                "Escribe la contrasena de la red Wi-Fi.";
            return "";
        }

        function escaparWifi(valor) {
            return valor.replace(/([\\;,:"])/g, "\\$1");
        }

        const nombre = escaparWifi(ssid);
        const password = seguridad === "nopass"
            ? ""
            : escaparWifi(clave);

        return "WIFI:T:" + seguridad +
            ";S:" + nombre +
            ";P:" + password + ";;";
    }

    /* QR PARA CORREO ELECTRONICO */
    if (tipoActual === "correo") {
        const destino = document.getElementById("correoDestino")
            .value.trim();

        const asunto = document.getElementById("asuntoCorreo")
            .value.trim();

        if (!destino ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destino)) {

            mensaje.textContent =
                "Escribe un correo destinatario valido.";
            return "";
        }

        return "mailto:" + destino +
            "?subject=" + encodeURIComponent(asunto) +
            "&body=" + encodeURIComponent(texto);
    }

    return texto;
}

/* GENERAR CODIGO QR */
function generarQR() {
    mensaje.textContent = "";

    const textoQR = obtenerTextoQR();

    if (!textoQR) {
        if (!mensaje.textContent) {
            mensaje.textContent =
                "Escribe la informacion que deseas convertir en QR.";
        }
        return;
    }

    if (typeof QRCode === "undefined") {
        mensaje.textContent =
            "No se pudo cargar la libreria QR. Revisa tu internet.";
        return;
    }

    contenedorQR.innerHTML = "";

    const tamano = Number(
        document.getElementById("tamanoQR").value
    );

    const colorQR = document.getElementById("colorQR").value;
    const colorFondo = document.getElementById("colorFondo").value;

    new QRCode(contenedorQR, {
        text: textoQR,
        width: tamano,
        height: tamano,
        colorDark: colorQR,
        colorLight: colorFondo,
        correctLevel: QRCode.CorrectLevel.H
    });

    document.querySelector(".texto-previa").textContent =
        textoQR;

    botonDescargar.disabled = false;

    mensaje.textContent =
        "Codigo QR generado correctamente.";
}

/* RESTABLECER FORMULARIO */
function limpiarQR() {
    contenido.value = "";

    document.getElementById("nombreWifi").value = "";
    document.getElementById("claveWifi").value = "";
    document.getElementById("correoDestino").value = "";
    document.getElementById("asuntoCorreo").value = "";

    document.getElementById("seguridadWifi").value = "WPA";
    document.getElementById("colorQR").value = "#7A1F3D";
    document.getElementById("colorFondo").value = "#FFFFFF";
    document.getElementById("tamanoQR").value = "240";

    contenedorQR.innerHTML =
        '<div class="marcador-qr">' +
        '<span>QR</span>' +
        '<small>Tu codigo aparecera aqui</small>' +
        '</div>';

    document.querySelector(".texto-previa").textContent =
        "Tu codigo QR aparecera en esta area.";

    botonDescargar.disabled = true;
    mensaje.textContent = "";

    seleccionarTipo("url");
}

/* DESCARGAR QR COMO PNG */
function descargarQR() {
    const canvas = contenedorQR.querySelector("canvas");
    const imagen = contenedorQR.querySelector("img");

    let url = "";

    if (canvas) {
        url = canvas.toDataURL("image/png");
    } else if (imagen && imagen.src) {
        url = imagen.src;
    } else {
        mensaje.textContent =
            "Primero genera un codigo QR.";
        return;
    }

    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = "codigo-QR-TecNL.png";

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
}

/* CONECTAR BOTONES */
document.getElementById("botonGenerar")
    .addEventListener("click", generarQR);

document.getElementById("botonLimpiar")
    .addEventListener("click", limpiarQR);

botonDescargar.addEventListener("click", descargarQR);

/* ACTUALIZAR EL QR AL CAMBIAR SU DISENO */
["colorQR", "colorFondo", "tamanoQR"].forEach(function(id) {
    document.getElementById(id).addEventListener("change", function() {
        if (contenedorQR.querySelector("canvas, img")) {
            generarQR();
        }
    });
});

/* MOSTRAR RESULTADO DEL ESCANEO */
function mostrarResultado(texto) {
    textoResultado = texto;

    document.getElementById("resultado").textContent = texto;

    document.getElementById("copiarResultado").disabled = false;
}

/* COPIAR INFORMACION ESCANEADA */
document.getElementById("copiarResultado")
    .addEventListener("click", async function() {

        if (!textoResultado) {
            return;
        }

        try {
            await navigator.clipboard.writeText(textoResultado);

            const boton = document.getElementById("copiarResultado");

            boton.textContent = "¡Copiado!";

            setTimeout(function() {
                boton.textContent = "Copiar resultado";
            }, 1600);

        } catch (error) {
            document.getElementById("resultado").textContent =
                textoResultado +
                "\n\nNo se pudo copiar automaticamente. " +
                "Selecciona el texto para copiarlo.";
        }
    });

/* INICIAR ESCANER QR */
if (typeof Html5QrcodeScanner !== "undefined") {

    const lector = new Html5QrcodeScanner(
        "lectorQR",
        {
            fps: 10,
            qrbox: {
                width: 220,
                height: 220
            },
            aspectRatio: 1.0
        },
        false
    );

    lector.render(
        function(decodedText) {
            mostrarResultado(decodedText);
        },
        function(error) {
            // No mostrar errores continuos mientras busca un QR.
        }
    );

} else {
    document.getElementById("lectorQR").textContent =
        "No se pudo cargar el lector QR. Revisa tu conexion a internet.";
}
