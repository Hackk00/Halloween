$(function() {
  $.getJSON("bd.json", function(data) {
    const ratingKey = "peliculasRatings";
    const ratings = JSON.parse(localStorage.getItem(ratingKey)) || {};
    const peliculas = data.peliculas;
    const topLista = $("#lista-top");
    topLista.empty();
    const ranking = peliculas.filter(p => {
      const votos = ratings[p.id];
            // Solo incluir películas que tengan alguna calificación
      return votos && (votos.voto1 > 0 || votos.voto2 > 0 || votos.top1 === 1);
    }).map(p => {
      const votos = ratings[p.id];
            // El promedio SOLO tiene en cuenta voto1 y voto2
      const valores = [
        votos.voto1,
        votos.voto2
      ].filter(v => v > 0);
      const promedio = valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;
      return {
        nombre: p.nombre,
        promedio: promedio,
        top1: votos.top1 === 1
      };
    });
        // Si no hay películas calificadas, no mostrar nada
    if (ranking.length === 0) {
      return;
    }
        // 🏆 Primero TOP 1
        // Después, ordenar por promedio
    ranking.sort((a, b) => {
      if (a.top1 && !b.top1) return -1;
      if (!a.top1 && b.top1) return 1;
      return b.promedio - a.promedio;
    });
        // Mostrar solamente las primeras 5 calificadas
    ranking.slice(0, 5).forEach((p, index) => {
      const emoji = ["🥇", "🥈", "🥉", "🎖️", "🏅"][index];
      topLista.append(`
        <li>
          ${emoji} ${p.nombre}
          <span>${p.promedio.toFixed(1)}</span>
        </li>
      `);
    });
  });
});