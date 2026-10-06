$(window).on("load", function() {
    const audio = $("#halloween-audio")[0];
    const overlay = $("#audio-start");
    audio.volume = 0.1;
    // === Función para ocultar overlay ===
    function hideOverlay() {
        overlay.fadeOut(2000, function() {
            $(this).empty();
            $("body").addClass("show-animations");
            // 🎃 REPRODUCIR AUDIO DESPUÉS DE LA FRASE
            audio.play().catch(() => {
                // Si el navegador bloquea el autoplay,
                // esperar a una interacción del usuario
                $(document).one("click", function() {
                    audio.play();
                });
            });
        });
    }
    // === Mostrar frase con fadeIn/fadeOut ===
    let frases_usadas = [];
    $.getJSON("bd.json", function(data) {
        const frases_terror = data.frases_terror;
        if (!frases_terror || frases_terror.length === 0) {
            overlay.html("No se pudieron cargar las frases 😢");
            hideOverlay();
            return;
        }
        // --- Selección aleatoria no repetitiva ---
        if (frases_usadas.length === frases_terror.length) {
            frases_usadas = [];
        }
        let fraseObj;
        do {
            const index = Math.floor(Math.random() * frases_terror.length);
            fraseObj = frases_terror[index];
        } while (frases_usadas.includes(fraseObj.id));
        frases_usadas.push(fraseObj.id);
        // --- Mostrar la frase ---
        overlay.html(`
            <div id="frase-contenido" style="display:none;">
                ${fraseObj.frase} ${fraseObj.emoji}
                <cite>${fraseObj.pelicula}</cite>
            </div>
        `);
        // --- Animaciones ---
        setTimeout(() => {
            $("#frase-contenido").fadeIn(1000, function() {
                setTimeout(() => {
                    $("#frase-contenido").fadeOut(1000, function() {
                        // Aquí comienza el fadeOut
                        // del overlay y DESPUÉS
                        // se reproduce el audio
                        hideOverlay();
                    });
                }, 2000);
            });
        }, 2000);
        // ❌ Se eliminó audio.play() de aquí
    });
    // === CARGAR PELÍCULAS Y LEER VISTAS DESDE localStorage ===
    $.getJSON("bd.json", function(data) {
        const peliculas = data.peliculas;
        let vistas = {};
        try {
            const stored = JSON.parse(localStorage.getItem("peliculasVistas"));
            if (stored && typeof stored === "object") {
                vistas = stored;
            }
        } catch (e) {
            vistas = {};
        }
        // Vaciar cartelera antes de volver a llenarla
        $("#cartelera").empty();
        peliculas.forEach((pelicula) => {
            const vista = vistas[pelicula.id] === true;
            const ticket = $(`
                <a href="${pelicula.enlace}?id=${pelicula.id}"
                   class="ticket ${vista ? "vista" : ""}"
                   style="--i:${pelicula.id}">
                    <span>${pelicula.nombre}</span>
                </a>
            `);
            $("#cartelera").append(ticket);
        });
        // 🎲 Aleatorizar inclinación
        $("#cartelera .ticket").each(function() {
            const randomDeg = (Math.random() * 6 - 3).toFixed(1);
            const currentStyle = $(this).attr("style") || "";
            $(this).attr("style", currentStyle + `; --rot:${randomDeg}deg !important`);
        });
    });
    // === EFECTO DESVANECER CUANDO SE CLICKEA UN ENLACE ===
    $(document).on("click", "a", function(e) {
        const url = $(this).attr("href");
        // Evitar roturas con enlaces especiales
        if (!url || url.startsWith("#") || $(this).attr("target") === "_blank") {
            return;
        }
        e.preventDefault();
        $("body").fadeOut(1000, function() {
            window.location.href = url;
        });
    });
});