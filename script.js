/* ==========================================================
   LA GACELA - NOTICIA DESTACADA, FILTROS Y CARRUSEL
   ========================================================== */

let noticiasGlobales = [];
let seccionActual = 'inicio';

const equipoEditorial = [
  {
    nombre: "Belen Lucero Yaranga Rojas",
    cargo: "Director(a) & Editor(a) de Espectáculos",
    correo: "espectaculos@lagacela.unfv.edu.pe",
    bio: "Dirección general del medio e investigaciones de la agenda cultural, artística y de entretenimiento.",
    foto: "fotos/LAGACELAICONODORADO.jpg"
  },
  {
    nombre: "Redacción de Política",
    cargo: "Editor(a) de Política",
    correo: "politica@lagacela.unfv.edu.pe",
    bio: "Cobertura de asuntos institucionales, política nacional, comisiones parlamentarias e investigaciones coyunturales.",
    foto: "fotos/LAGACELAICONODORADO.jpg"
  },
  {
    nombre: "Redacción de Internacionales",
    cargo: "Editor(a) de Internacionales",
    correo: "internacionales@lagacela.unfv.edu.pe",
    bio: "Análisis geopolítico global, seguimiento de conflictos internacionales y acuerdos diplomáticos multilaterales.",
    foto: "fotos/LAGACELAICONODORADO.jpg"
  },
  {
    nombre: "Redacción de Deportes",
    cargo: "Editor(a) de Deportes",
    correo: "deportes@lagacela.unfv.edu.pe",
    bio: "Seguimiento y cobertura del deporte universitario, disciplinas locales, competencias nacionales e internacionales.",
    foto: "fotos/LAGACELAICONODORADO.jpg"
  },
  {
    nombre: "Mesa de Desarrollo Digital",
    cargo: "Editor(a) de Diseño Web",
    correo: "webmaster@lagacela.unfv.edu.pe",
    bio: "Responsable de la maquetación digital, arquitectura web, experiencia de usuario e innovación gráfica del diario.",
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

/* 1. NAVEGACIÓN ENTRE SECCIONES */
function inicializarNavegacion() {
  const botonesNav = document.querySelectorAll('.nav-btn');

  botonesNav.forEach(btn => {
    btn.addEventListener('click', () => {
      const seccion = btn.getAttribute('data-seccion');

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

  secQuienesSomos.classList.remove('activo');
  secNoticias.classList.add('activo');

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

/* 2. OBTENER NOTICIAS DE GITHUB */
async function cargarNoticiasDesdeGitHub() {
  const grid = document.getElementById('grid-noticias');
  if (!grid) return;

  grid.innerHTML = '<p class="mensaje-cargando">Cargando la edición digital...</p>';

  try {
    const repo = "07lonnie/LA-GACELA";
    const res = await fetch(`https://api.github.com/repos/${repo}/contents/contenido/noticias`);

    if (!res.ok) throw new Error('Sin noticias');

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
    grid.innerHTML = '<p class="mensaje-vacio">Aún no se han cargado publicaciones en esta sección.</p>';
  }
}

/* 3. RENDERIZADO: NOTICIA DESTACADA + TARJETAS NORMALES */
function renderizarNoticiasProcesadas() {
  const contenedorDestacada = document.getElementById('contenedor-destacada');
  const grid = document.getElementById('grid-noticias');
  if (!grid || !contenedorDestacada) return;

  contenedorDestacada.innerHTML = '';
  grid.innerHTML = '';

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

  // EN INICIO: La primera noticia toma formato destacado (Hero)
  if (seccionActual === 'inicio') {
    const destacada = noticiasFiltradas[0];
    contenedorDestacada.innerHTML = `
      <article class="tarjeta-destacada-hero">
        <a href="noticia.html?id=${destacada.id}" class="enlace-destacada">
          <div class="imagen-destacada-wrapper">
            <img src="${destacada.thumbnail}" alt="${destacada.title}" onerror="this.src='fotos/LAGACELAICONODORADO.jpg'">
            <span class="badge-categoria-destacada">${mapaCatTexto[destacada.categoria] || destacada.categoria.toUpperCase()}</span>
          </div>
          <div class="contenido-destacada">
            <span class="etiqueta-destacada-alerta">★ NOTICIA PRINCIPAL</span>
            <h2 class="titulo-destacada">${destacada.title}</h2>
            <p class="bajada-destacada">${destacada.bajada}</p>
            <div class="meta-destacada">
              <span>Por <strong>${destacada.autor}</strong></span>
              <span>• ${destacada.date}</span>
            </div>
          </div>
        </a>
      </article>
    `;

    // Las siguientes se muestran en formato estándar
    const restantes = noticiasFiltradas.slice(1);
    grid.innerHTML = restantes.map(n => generarTarjetaHTML(n, mapaCatTexto)).join('');
  } else {
    // En secciones específicas se muestran en formato estándar
    grid.innerHTML = noticiasFiltradas.map(n => generarTarjetaHTML(n, mapaCatTexto)).join('');
  }
}

function generarTarjetaHTML(n, mapaCatTexto) {
  return `
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
  `;
}

/* 4. CARRUSEL EDITORIAL */
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
  const elCorreo = document.getElementById('miembro-correo');
  const elBio = document.getElementById('miembro-bio');
  const elFoto = document.getElementById('miembro-foto');
  const contenedorIndicadores = document.getElementById('carrusel-indicadores');

  if (!elNombre) return;

  elNombre.textContent = miembro.nombre;
  elCargo.textContent = miembro.cargo;
  
  if (elCorreo) {
    elCorreo.textContent = miembro.correo;
    elCorreo.href = `mailto:${miembro.correo}`;
  }
  
  if (elBio) elBio.textContent = miembro.bio;
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