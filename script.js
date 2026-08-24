/* ==========================================================
   CARGA DINÁMICA DE NOTICIAS DESDE DECAP CMS (GITHUB API)
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar modo oscuro
  const btnModo = document.getElementById('btn-modo');
  if (btnModo) {
    btnModo.addEventListener('click', () => {
      document.body.classList.toggle('modo-oscuro');
      btnModo.textContent = document.body.classList.contains('modo-oscuro') ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
    });
  }

  // Cargar noticias en la portada
  cargarNoticiasPortada();
});

async function cargarNoticiasPortada() {
  const contenedorNoticias = document.getElementById('contenedor-noticias-dinamicas') || document.querySelector('.grid-noticias') || document.querySelector('main');
  
  if (!contenedorNoticias) return;

  try {
    // Consulta a la API de GitHub para obtener los archivos de la carpeta contenido/noticias
    const repo = "07lonnie/LA-GACELA";
    const respuesta = await fetch(`https://api.github.com/repos/${repo}/contents/contenido/noticias`);
    
    if (!respuesta.ok) return;

    const archivos = await respuesta.json();
    const archivosMarkdown = archivos.filter(f => f.name.endsWith('.md'));

    if (archivosMarkdown.length === 0) return;

    let htmlCards = '';

    for (const archivo of archivosMarkdown) {
      const resFile = await fetch(archivo.download_url);
      const texto = await resFile.text();

      const partes = texto.split('---');
      if (partes.length < 3) continue;

      const metadatosRaw = partes[1];
      
      const obtenerValor = (clave) => {
        const regex = new RegExp(`^${clave}:\\s*["']?(.*?)["']?$`, 'm');
        const match = metadatosRaw.match(regex);
        return match ? match[1].trim() : '';
      };

      const titulo = obtenerValor('title');
      const categoria = obtenerValor('categoria');
      const autor = obtenerValor('autor');
      const fecha = obtenerValor('date');
      const bajada = obtenerValor('bajada').replace(/[*_#]/g, ''); // Limpiar markdown simple
      const thumbnail = obtenerValor('thumbnail') || 'fotos/default-news.jpg';

      const mapaCategorias = { 'politica': 'POLÍTICA', 'internacionales': 'INTERNACIONALES', 'espectaculos': 'ESPECTÁCULOS', 'deportes': 'DEPORTES' };
      const catFormateada = mapaCategorias[categoria.toLowerCase()] || categoria.toUpperCase();

      htmlCards += `
        <article class="tarjeta-noticia-portada">
          <a href="noticia.html?id=${archivo.name}" class="enlace-noticia">
            <div class="imagen-portada-wrapper">
              <img src="${thumbnail}" alt="${titulo}" loading="lazy">
              <span class="badge-categoria-portada">${catFormateada}</span>
            </div>
            <div class="contenido-tarjeta-portada">
              <h2 class="titulo-tarjeta">${titulo}</h2>
              <p class="bajada-tarjeta">${bajada.substring(0, 110)}...</p>
              <div class="meta-tarjeta">
                <span>Por <strong>${autor || 'Redacción'}</strong></span>
                <span>• ${fecha}</span>
              </div>
            </div>
          </a>
        </article>
      `;
    }

    // Insertar las noticias publicadas al inicio del contenedor
    const seccionDinamica = document.createElement('div');
    seccionDinamica.className = 'seccion-noticias-publicadas';
    seccionDinamica.innerHTML = `
      <h3 class="subtitulo-bloque-portada">Últimas Publicaciones</h3>
      <div class="grid-noticias-dinamicas">${htmlCards}</div>
    `;

    contenedorNoticias.prepend(seccionDinamica);

  } catch (e) {
    console.error('Error al cargar noticias dinámicas:', e);
  }
}