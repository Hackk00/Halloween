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
                $("#mark-viewed").addClass("vista").text("☠️ Vista");
            }
            // Marcar como vista
            $("#mark-viewed").on("click", function(e) {
                e.preventDefault();
                if (!$(this).hasClass("vista")) {
                    vistas[id] = true;
                    localStorage.setItem("peliculasVistas", JSON.stringify(vistas));
                    $(this).addClass("vista").text("☠️ Vista");
                }
            });
        } else {
            $("#video-title").text("Película no encontrada 😢");
            $("#mark-viewed").hide();
        }
    });
    $("body").addClass("show-animations");
    // ☠️ Sistema de votación doble
    const ratingKey = "peliculasRatings";
    const ratings = JSON.parse(localStorage.getItem(ratingKey)) || {};
    if (!ratings[id]) {
        ratings[id] = {
            voto1: 0,
            voto2: 0,
            top1: 0
        };
    }
    // Para registros antiguos que todavía no tienen top1
    if (typeof ratings[id].top1 === "undefined") {
        ratings[id].top1 = 0;
    }
    // Restaurar votos previos
    highlightPumpkins("#rating1", ratings[id].voto1);
    highlightPumpkins("#rating2", ratings[id].voto2);
    // Si ya votó, deshabilitar clics
    if (ratings[id].voto1 > 0) disableVoting("#rating1");
    if (ratings[id].voto2 > 0) disableVoting("#rating2");
    // =====================================================
    // VOTO 1
    // =====================================================
    $("#rating1 img").on("click", function() {
        if (ratings[id].voto1 > 0) return;
        const value = $(this).data("value");
        ratings[id].voto1 = value;
        localStorage.setItem(ratingKey, JSON.stringify(ratings));
        highlightPumpkins("#rating1", value);
        disableVoting("#rating1");
    });
    // =====================================================
    // VOTO 2
    // =====================================================
    $("#rating2 img").on("click", function() {
        if (ratings[id].voto2 > 0) return;
        const value = $(this).data("value");
        ratings[id].voto2 = value;
        localStorage.setItem(ratingKey, JSON.stringify(ratings));
        highlightPumpkins("#rating2", value);
        disableVoting("#rating2");
    });
    // =====================================================
    // ⭐ TOP 1
    // =====================================================
    $("#top1Button").on("click", function(e) {
        e.preventDefault();
        // Si esta película ya tiene TOP 1
        if (ratings[id].top1 > 0) {
            return;
        }
        // Comprobar si YA existe otra película con TOP 1
        const yaTieneTop1 = Object.keys(ratings).some(function(peliculaId) {
            return (parseInt(peliculaId) !== id && ratings[peliculaId] && ratings[peliculaId].top1 === 1);
        });
        // Si ya existe un TOP 1, no permitir otro
        if (yaTieneTop1) {
            /*alert("Ya has seleccionado una película como TOP 1.");*/
            return;
        }
        // Asignar TOP 1
        ratings[id].top1 = 1;
        // Guardar
        localStorage.setItem(ratingKey, JSON.stringify(ratings));
        // Cambiar apariencia del botón
        $(this).addClass("selected").html("⭐");
    });
    // Restaurar TOP 1 si ya había votado
    if (ratings[id].top1 > 0) {
        $("#top1Button").addClass("selected").html("⭐");
    }
    // =====================================================
    // Función que ilumina SOLO la cantidad votada
    // =====================================================
    function highlightPumpkins(selector, value) {
        const imgs = $(selector + " img").get().reverse();
        imgs.forEach((img, i) => {
            if (i < value) {
                $(img).addClass("selected");
            } else {
                $(img).removeClass("selected");
            }
        });
    }
    // =====================================================
    // Desactiva clics después de votar
    // =====================================================
    function disableVoting(selector) {
        $(selector + " img").css("cursor", "default");
        $(selector + " img").off("click");
        $(selector).addClass("disabled");
    }
});