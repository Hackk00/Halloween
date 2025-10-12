$(window).on("load", function() {
  const audio = $("#halloween-audio")[0];
  const overlay = $("#audio-start");

  audio.volume = 0.6;

  // Función para ocultar overlay y limpiar frase
  function hideOverlay() {
    overlay.fadeOut(3500, function() {
      $(this).empty();
      $(this).off("click");
    });
    $("body").addClass("show-animations");
  }

  // Cargar JSON y mostrar frase
  $.getJSON('bd.json', function(data) {
    const frases_terror = data.frases_terror;
    if (frases_terror.length === 0) {
      overlay.html('No se pudieron cargar las frases 😢');
      return;
    }
    const randomIndex = Math.floor(Math.random() * frases_terror.length);
    const fraseObj = frases_terror[randomIndex];

    overlay.html(`
      ${fraseObj.frase} ${fraseObj.emoji}
      <cite>${fraseObj.pelicula}</cite>
    `);

    // Intentar reproducir audio
    audio.play().then(() => {
      // Si autoplay funciona, ocultamos la frase
      hideOverlay();
    }).catch(() => {
      // Si se bloquea autoplay, esperar clic del usuario
      overlay.on("click", function() {
        audio.play();
        hideOverlay();
      });
    });
  });
});
