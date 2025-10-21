$(function() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get("id"));
    const container = $("#player-container");
    const vistas = JSON.parse(localStorage.getItem("peliculasVistas")) || {};
    // Retrasar la aparición del reproductor
    setTimeout(() => {
        container.addClass("visible");
    }, 4000);
    // Cargar la base de datos
    $.getJSON("bd.json", function(data) {
        const pelicula = data.peliculas.find(p => p.id === id);
        if (pelicula) {
            $("#video-title").text(pelicula.nombre);
            // Cambia la ruta por la ubicación real de tus videos
            $("#video-source").attr("src", `videos/${pelicula.id}.mp4`);
            $("#player")[0].load();
            // Estado "vista"
            if (vistas[id]) {
                $("#mark-viewed").addClass("vista").text("🎃 Vista");
            }
            // Marcar como vista
            $("#mark-viewed").on("click", function(e) {
                e.preventDefault();
                if (!$(this).hasClass("vista")) {
                    vistas[id] = true;
                    localStorage.setItem("peliculasVistas", JSON.stringify(vistas));
                    $(this).addClass("vista").text("🎃 Vista");
                }
            });
        } else {
            $("#video-title").text("Película no encontrada 😢");
            $("#mark-viewed").hide();
        }
    });
    $("body").addClass("show-animations");
    // 🎃 Sistema de votación doble (efecto hover + exactitud en cantidad votada)
    const ratingKey = "peliculasRatings";
    const ratings = JSON.parse(localStorage.getItem(ratingKey)) || {};
    if (!ratings[id]) ratings[id] = {
        voto1: 0,
        voto2: 0
    };
    // Restaurar votos previos
    highlightPumpkins("#rating1", ratings[id].voto1);
    highlightPumpkins("#rating2", ratings[id].voto2);
    // Si ya votó, deshabilitar clics
    if (ratings[id].voto1 > 0) disableVoting("#rating1");
    if (ratings[id].voto2 > 0) disableVoting("#rating2");
    // Voto 1
    $("#rating1 img").on("click", function() {
        if (ratings[id].voto1 > 0) return; // ya votó
        const value = $(this).data("value");
        ratings[id].voto1 = value;
        localStorage.setItem(ratingKey, JSON.stringify(ratings));
        highlightPumpkins("#rating1", value);
        disableVoting("#rating1");
    });
    // Voto 2
    $("#rating2 img").on("click", function() {
        if (ratings[id].voto2 > 0) return; // ya votó
        const value = $(this).data("value");
        ratings[id].voto2 = value;
        localStorage.setItem(ratingKey, JSON.stringify(ratings));
        highlightPumpkins("#rating2", value);
        disableVoting("#rating2");
    });
    // Función que ilumina SOLO la cantidad votada
    function highlightPumpkins(selector, value) {
        const imgs = $(selector + " img").get().reverse(); // invertir el orden
        imgs.forEach((img, i) => {
            if (i < value) {
                $(img).addClass("selected");
            } else {
                $(img).removeClass("selected");
            }
        });
    }
    // Desactiva clics después de votar
    function disableVoting(selector) {
        $(selector + " img").css("cursor", "default");
        $(selector + " img").off("click");
        $(selector).addClass("disabled");
    }
});