$(window).on("load", function() {
    const audio = $("#halloween-audio")[0];
    const overlay = $("#audio-start");
    audio.volume = 0.6;
    // === Función para ocultar overlay ===
    function hideOverlay() {
        overlay.fadeOut(2000, function() {
            $(this).empty();
            $("body").addClass("show-animations");
        });
    }
    // === Mostrar frase con fadeIn/fadeOut ===
    $.getJSON('bd.json', function(data) {
        const frases_terror = data.frases_terror;
        if (!frases_terror || frases_terror.length === 0) {
            overlay.html('No se pudieron cargar las frases 😢');
            hideOverlay();
            return;
        }
        const randomIndex = Math.floor(Math.random() * frases_terror.length);
        const fraseObj = frases_terror[randomIndex];
        overlay.html(`
            <div id="frase-contenido" style="display:none;">
                ${fraseObj.frase} ${fraseObj.emoji}
                <cite>${fraseObj.pelicula}</cite>
            </div>
        `);
        setTimeout(() => {
            $("#frase-contenido").fadeIn(1000, function() {
                setTimeout(() => {
                    $("#frase-contenido").fadeOut(1000, function() {
                        hideOverlay();
                    });
                }, 2000);
            });
        }, 2000);
        audio.play().catch(() => {
            overlay.on("click", function() {
                audio.play();
                //hideOverlay();
                // 🧟‍♂️ Solicitar pantalla completa tras el clic del usuario
                const docEl = document.documentElement;
                if (docEl.requestFullscreen) {
                    docEl.requestFullscreen();
                } else if (docEl.webkitRequestFullscreen) { // Safari
                    docEl.webkitRequestFullscreen();
                } else if (docEl.msRequestFullscreen) { // IE/Edge antiguo
                    docEl.msRequestFullscreen();
                }
            });
        });
    });
    // === CARGAR PELÍCULAS Y MARCAR VISTAS ===
    $.getJSON("bd.json", function(data) {
        const peliculas = data.peliculas;
        // 🧱 Asegurar que vistas sea siempre un array válido
        let vistas = [];
        try {
            const stored = JSON.parse(localStorage.getItem("peliculasVistas"));
            if (Array.isArray(stored)) {
                vistas = stored;
            }
        } catch (e) {
            vistas = [];
        }
        // Vaciar cartelera antes de volver a llenarla
        $("#cartelera").empty();
        peliculas.forEach(pelicula => {
            const vista = vistas.includes(pelicula.id);
            const ticket = $(`
            <a href="${pelicula.enlace}?id=${pelicula.id}" 
               class="ticket ${vista ? 'vista' : ''}" style="--i:${pelicula.id}">
              <span>${pelicula.nombre}</span>
            </a>
            `);
            // Evento de clic: marcar como vista
            /*ticket.on("click", function() {
                if (!vistas.includes(pelicula.id)) {
                    vistas.push(pelicula.id);
                    localStorage.setItem("peliculasVistas", JSON.stringify(vistas));
                }
            });*/
            $("#cartelera").append(ticket);
        });
        // 🎲 Aleatorizar inclinación con !important forzado
        $("#cartelera .ticket").each(function() {
            const randomDeg = (Math.random() * 6 - 3).toFixed(1); // Entre -3° y +3°
            // Inyectar estilo manteniendo el --i existente
            const currentStyle = $(this).attr("style") || "";
            $(this).attr("style", currentStyle + `; --rot:${randomDeg}deg !important`);
        });
    });
    // === EFECTO DESVANECER CUANDO SE CLICKEA UN ENLACE ===
    $(document).on("click", "a", function(e) {
        const url = $(this).attr("href");
        // Evita enlaces vacíos, anclas internas o # para no romper cosas
        if (!url || url.startsWith("#") || $(this).attr("target") === "_blank") return;
        e.preventDefault(); // Bloquea la navegación instantánea
        $("body").fadeOut(1000, function() { // 🔥 Cambia 1000 por lo que quieras en ms
            window.location.href = url; // Redirige después del fade
        });
    });
});