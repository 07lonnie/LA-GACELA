/* ==========================================================
   LA GACELA - NAVEGACIÓN, FILTRADO Y CARRUSEL EDITORIAL
   ========================================================== */

let noticiasGlobales = [];
let seccionActual = 'inicio';

// DATOS DEL EQUIPO EDITORIAL PARA EL CARRUSEL
const equipoEditorial = [
  {
    nombre: "Belen Lucero Yaranga Rojas",
    cargo: "Directora Editorial & Redactora de Política",
    bio: "Estudiante de Ciencias de la Comunicación de la UNFV. Especializada en la cobertura de asuntos institucionales, política nacional e investigaciones periodísticas.",
    foto: "fotos/LAGACELAICONODORADO.jpg"
  },
  {
    nombre: "Redacción de Internacionales",
    cargo: "Coordinación de Política Exterior",
    bio: "Equipo encargado de analizar los conflictos internacionales, eventos geopolíticos globales y acuerdos multilaterales con rigor y diplomacia.",
    foto: "fotos/LAGACELAICONODORADO.jpg"
  },
  {
    nombre: "Mesa de Deportes y Cultura",
    cargo: "Edición de Deportes y Espectáculos",
    bio: "Periodistas comprometidos con la difusión del talento deportivo universitario, la cobertura cultural, artística y de entretenimiento.",
    foto: "fotos/LAGACELAICONODORADO.jpg"
  }
];

let indiceEquipo = 0;

document.addEventListener('DOMContentLoaded', () => {
  inicializarModoOscuro();
  inicializarNavegacion();
  inicializarCarruselEquipo();
  cargarNoticiasDesdeGitHub();
});

/* 1. NAVEGACIÓN Y FILTRADO DE CONTENIDOS */
function inicializarNavegacion() {
  const botonesNav = document.querySelectorAll('.nav-btn');

  botonesNav.forEach(btn => {
    btn.addEventListener('click', () => {
      const seccion = btn.getAttribute('data-seccion');

      // Actualizar estado activo en los botones
      botonesNav.forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');

      cambiarVistaSeccion(seccion);
    });
  });
}

function cambiarVistaSeccion(seccion) {
  seccionActual = seccion;
  const secNoticias = document.getElementById('sec-noticias');
  const secQuienesSomos = document.getElementById('sec-quienes-somos');
  const tituloSeccion = document.getElementById('titulo-seccion-actual');
  const bajadaSeccion = document.getElementById('bajada-seccion-actual');

  if (seccion === 'quienes-somos') {
    secNoticias.classList.remove('activo');
    secQuienesSomos.classList.add('activo');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // Mostrar la sección de noticias
  secQuienesSomos.classList.remove('activo');
  secNoticias.classList.add('activo');

  // Actualizar encabezados según la categoría elegida
  const nombresTitulos = {
    'inicio': 'Últimas Publicaciones',
    'politica': 'Noticias de Política',
    'internacionales': 'Noticias Internacionales',
    'espectaculos': 'Espectáculos y Cultura',
    'deportes': 'Deportes'
  };

  const descripcionesSeccion = {
    'inicio': 'Las noticias más relevantes de la jornada universitaria y nacional.',
    'politica': 'Cobertura informativa sobre el Congreso, Ejecutivo y análisis político.',
    'internacionales': 'Acontecimientos decisivos y coyuntura en el ámbito mundial.',
    'espectaculos': 'Novedades de la escena cultural, arte y entretenimiento.',
    'deportes': 'Toda la actualidad del deporte universitario, nacional e internacional.'
  };

  if (tituloSeccion) tituloSeccion.textContent = nombresTitulos[seccion] || 'Sección';
  if (bajadaSeccion) bajadaSeccion.textContent = descripcionesSeccion[seccion] || '';

  renderizarNoticiasProcesadas();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* 2. CARGA DINÁMICA DE NOTICIAS DESDE GITHUB API */
async function cargarNoticiasDesdeGitHub() {
  const grid = document.getElementById('grid-noticias');
  if (!grid) return;

  grid.innerHTML = '<p class="mensaje-cargando">Cargando la edición digital...</p>';

  try {
    const repo = "07lonnie/LA-GACELA";
    const res = await fetch(`https://api.github.com/repos/${repo}/contents/contenido/noticias`);

    if (!res.ok) throw new Error('No se encontraron noticias en el servidor');

    const archivos = await res.json();
    const archivosMarkdown = archivos.filter(f => f.name.endsWith('.md'));

    if (archivosMarkdown.length === 0) {
      grid.innerHTML = '<p class="mensaje-vacio">No hay publicaciones disponibles en este momento.</p>';
      return;
    }

    noticiasGlobales = [];

    for (const file of archivosMarkdown) {
      const resContenido = await fetch(file.download_url);
      const texto = await resContenido.text();

      const partes = texto.split('---');
      if (partes.length < 3) continue;

      const metaRaw = partes[1];
      const obtenerValor = (k) => {
        const regex = new RegExp(`^${k}:\\s*["']?(.*?)["']?$`, 'm');
        const m = metaRaw.match(regex);
        return m ? m[1].trim() : '';
      };

      noticiasGlobales.push({
        id: file.name,
        title: obtenerValor('title') || 'Sin título',
        categoria: (obtenerValor('categoria') || 'politica').toLowerCase(),
        autor: obtenerValor('autor') || 'Redacción',
        date: obtenerValor('date') || '2026',
        bajada: obtenerValor('bajada').replace(/[*_#]/g, ''),
        thumbnail: obtenerValor('thumbnail') || 'fotos/LAGACELAICONODORADO.jpg'
      });
    }

    renderizarNoticiasProcesadas();

  } catch (err) {
    console.warn('Cargando plantilla de contingencia:', err);
    grid.innerHTML = '<p class="mensaje-vacio">Aún no se han cargado publicaciones en esta sección.</p>';
  }
}

/* 3. RENDERIZADO FILTRADO */
function renderizarNoticiasProcesadas() {
  const grid = document.getElementById('grid-noticias');
  if (!grid) return;

  let noticiasFiltradas = noticiasGlobales;

  if (seccionActual !== 'inicio') {
    noticiasFiltradas = noticiasGlobales.filter(n => n.categoria === seccionActual);
  }

  if (noticiasFiltradas.length === 0) {
    grid.innerHTML = `<div class="bloque-vacio-seccion">
      <p>No hay noticias publicadas en la sección <strong>${seccionActual.toUpperCase()}</strong> todavía.</p>
    </div>`;
    return;
  }

  const mapaCatTexto = {
    'politica': 'POLÍTICA',
    'internacionales': 'INTERNACIONALES',
    'espectaculos': 'ESPECTÁCULOS',
    'deportes': 'DEPORTES'
  };

  grid.innerHTML = noticiasFiltradas.map(n => `
    <article class="tarjeta-noticia-portada">
      <a href="noticia.html?id=${n.id}" class="enlace-noticia">
        <div class="imagen-portada-wrapper">
          <img src="${n.thumbnail}" alt="${n.title}" loading="lazy" onerror="this.src='fotos/LAGACELAICONODORADO.jpg'">
          <span class="badge-categoria-portada">${mapaCatTexto[n.categoria] || n.categoria.toUpperCase()}</span>
        </div>
        <div class="contenido-tarjeta-portada">
          <h3 class="titulo-tarjeta">${n.title}</h3>
          <p class="bajada-tarjeta">${n.bajada.substring(0, 120)}...</p>
          <div class="meta-tarjeta">
            <span>Por <strong>${n.autor}</strong></span>
            <span>• ${n.date}</span>
          </div>
        </div>
      </a>
    </article>
  `).join('');
}

/* 4. CARRUSEL DEL EQUIPO EDITORIAL */
function inicializarCarruselEquipo() {
  const btnPrev = document.getElementById('btn-carrusel-prev');
  const btnNext = document.getElementById('btn-carrusel-next');

  if (btnPrev && btnNext) {
    btnPrev.addEventListener('click', () => {
      indiceEquipo = (indiceEquipo - 1 + equipoEditorial.length) % equipoEditorial.length;
      actualizarTarjetaEquipo();
    });

    btnNext.addEventListener('click', () => {
      indiceEquipo = (indiceEquipo + 1) % equipoEditorial.length;
      actualizarTarjetaEquipo();
    });

    actualizarTarjetaEquipo();
  }
}

function actualizarTarjetaEquipo() {
  const miembro = equipoEditorial[indiceEquipo];
  const elNombre = document.getElementById('miembro-nombre');
  const elCargo = document.getElementById('miembro-cargo');
  const elBio = document.getElementById('miembro-bio');
  const elFoto = document.getElementById('miembro-foto');
  const contenedorIndicadores = document.getElementById('carrusel-indicadores');

  if (!elNombre) return;

  elNombre.textContent = miembro.nombre;
  elCargo.textContent = miembro.cargo;
  elBio.textContent = miembro.bio;
  if (elFoto) elFoto.src = miembro.foto;

  if (contenedorIndicadores) {
    contenedorIndicadores.innerHTML = equipoEditorial.map((_, i) => `
      <span class="punto-indicador ${i === indiceEquipo ? 'activo' : ''}"></span>
    `).join('');
  }
}

/* 5. MODO OSCURO */
function inicializarModoOscuro() {
  const btnModo = document.getElementById('btn-modo');
  if (btnModo) {
    btnModo.addEventListener('click', () => {
      document.body.classList.toggle('modo-oscuro');
      btnModo.textContent = document.body.classList.contains('modo-oscuro') ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
    });
  }
}