$(function() {
  // Cargar la base de datos de películas
  $.getJSON("bd.json", function(data) {
    const ratingKey = "peliculasRatings";
    const ratings = JSON.parse(localStorage.getItem(ratingKey)) || {};
    const peliculas = data.peliculas;

    // Calcular promedio de cada película
    const ranking = peliculas.map(p => {
      const votos = ratings[p.id] || { voto1: 0, voto2: 0 };
      const cantidadVotos = [votos.voto1, votos.voto2].filter(v => v > 0).length;
      const promedio = cantidadVotos > 0 ? (votos.voto1 + votos.voto2) / cantidadVotos : 0;
      return { nombre: p.nombre, promedio };
    });

    // Ordenar de mayor a menor promedio
    ranking.sort((a, b) => b.promedio - a.promedio);

    // Mostrar top 5 en la lista flotante
    const topLista = $("#lista-top");
    topLista.empty();

    ranking.slice(0, 5).forEach((p, index) => {
      const emoji = ["🥇", "🥈", "🥉", "🎖️", "🏅"][index] || "🎃";
      topLista.append(
        `<li>${emoji} ${p.nombre} <span>${p.promedio.toFixed(1)}</span></li>`
      );
    });
  });
});
