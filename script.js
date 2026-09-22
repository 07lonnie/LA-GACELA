/* ==========================================================
   LA GACELA - NAVEGACIÓN, FILTRADO, CARRUSEL Y PARSER YAML
   ========================================================== */

let noticiasGlobales = [];
let seccionActual = 'inicio';

const equipoEditorial = [
  {
    nombre: "Lidia Yamilet Chapilliquen Charca",
    cargo: "Directora & Editora de Espectáculos",
    correo: "espectáculos@lagacela.pe",
    bio: "Dirección general del medio e investigaciones de la agenda cultural, artística y de entretenimiento.",
    foto: "fotos/Yamilet.jpg"
  },
  {
    nombre: "Belen Lucero Yaranga Rojas",
    cargo: "Editora de Política",
    correo: "política@lagacela.pe",
    bio: "Cobertura de asuntos institucionales, política nacional, comisiones parlamentarias e investigaciones coyunturales.",
    foto: "fotos/Belen.jpg"
  },
  {
    nombre: "Adriana Judith Peña Cotos",
    cargo: "Editora de Internacionales",
    correo: "internacionales@lagacela.pe",
    bio: "Análisis geopolítico global, seguimiento de conflictos internacionales y acuerdos diplomáticos multilaterales.",
    foto: "fotos/Adriana.jpg"
  },
  {
    nombre: "Jhordan David Valverde Soto",
    cargo: "Editor de Deportes",
    correo: "deportes@lagacela.pe",
    bio: "Seguimiento y cobertura del deporte universitario, disciplinas locales, competencias nacionales e internacionales.",
    foto: "fotos/Jhordan.jpg"
  },
  {
    nombre: "Gianella Alondra Orellana Perez",
    cargo: "Editora de Diseño Web",
    correo: "diseñoweb@lagacela.pe",
    bio: "Responsable de la maquetación digital, arquitectura web, experiencia de usuario e innovación gráfica del diario.",
    foto: "fotos/yo.jpg"
  }
];

let indiceEquipo = 0;

document.addEventListener('DOMContentLoaded', () => {
  inicializarModoOscuro();
  inicializarNavegacion();
  precargarImagenesEquipo(); // Elimina el delay al cambiar de miembro
  inicializarCarruselEquipo();
  cargarNoticiasDesdeGitHub();
});

/* PRECARGA DE IMÁGENES EN CACHÉ PARA EVITAR RETARDOS */
function precargarImagenesEquipo() {
  equipoEditorial.forEach(miembro => {
    if (miembro.foto) {
      const img = new Image();
      img.src = miembro.foto;
    }
  });
}

/* PARSER FRONTMATTER */
function parseFrontmatter(texto) {
  const partes = texto.split(/^---$/m);
  if (partes.length < 3) return { metadatos: {}, cuerpo: texto };

  const yamlRaw = partes[1];
  const cuerpo = partes.slice(2).join('---').trim();
  const metadatos = {};

  const lineas = yamlRaw.split('\n');
  let claveActual = null;
  let acumulador = [];

  for (let linea of lineas) {
    const matchClave = linea.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (matchClave) {
      if (claveActual) {
        metadatos[claveActual] = limpiarValorYaml(acumulador.join(' '));
      }
      claveActual = matchClave[1];
      acumulador = [matchClave[2]];
    } else if (claveActual) {
      acumulador.push(linea.trim());
    }
  }
  if (claveActual) {
    metadatos[claveActual] = limpiarValorYaml(acumulador.join(' '));
  }

  return { metadatos, cuerpo };
}

function limpiarValorYaml(val) {
  if (!val) return '';
  let str = val.trim();
  str = str.replace(/^[|>-]+\s*/, '');
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.substring(1, str.length - 1);
  }
  return str.trim();
}

function limpiarBajadaCompleta(texto) {
  if (!texto) return '';
  return texto.replace(/[*_#`\[\]]/g, '').trim();
}

/* NAVEGACIÓN */
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
    'inicio': 'Últimas publicaciones',
    'politica': 'Noticias de política',
    'internacionales': 'Noticias internacionales',
    'espectaculos': 'Espectáculos y cultura',
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

/* CARGAR NOTICIAS CON SKELETON LOADERS */
async function cargarNoticiasDesdeGitHub() {
  const contenedorDestacada = document.getElementById('contenedor-destacada');
  const grid = document.getElementById('grid-noticias');
  if (!grid || !contenedorDestacada) return;

  // 1. Mostrar siluetas desde el milisegundo cero (elimina pantalla vacía)
  contenedorDestacada.innerHTML = `
    <div class="skeleton-hero">
      <div class="skeleton-box skeleton-hero-img"></div>
      <div class="skeleton-hero-body">
        <div class="skeleton-box skeleton-line corta"></div>
        <div class="skeleton-box skeleton-line titular"></div>
        <div class="skeleton-box skeleton-line media"></div>
        <div class="skeleton-box skeleton-line corta"></div>
      </div>
    </div>
  `;

  grid.innerHTML = `
    <div class="skeleton-grid-fila">
      <div class="skeleton-card">
        <div class="skeleton-box skeleton-card-img"></div>
        <div class="skeleton-card-body">
          <div class="skeleton-box skeleton-line titular"></div>
          <div class="skeleton-box skeleton-line"></div>
          <div class="skeleton-box skeleton-line corta"></div>
        </div>
      </div>
      <div class="skeleton-card">
        <div class="skeleton-box skeleton-card-img"></div>
        <div class="skeleton-card-body">
          <div class="skeleton-box skeleton-line titular"></div>
          <div class="skeleton-box skeleton-line"></div>
          <div class="skeleton-box skeleton-line corta"></div>
        </div>
      </div>
    </div>
  `;

  try {
    const repo = "07lonnie/LA-GACELA";
    const res = await fetch(`https://api.github.com/repos/${repo}/contents/contenido/noticias`);

    if (!res.ok) throw new Error('Sin noticias');

    const archivos = await res.json();
    const archivosMarkdown = archivos.filter(f => f.name.endsWith('.md'));

    if (archivosMarkdown.length === 0) {
      contenedorDestacada.innerHTML = '';
      grid.innerHTML = '<p class="mensaje-vacio">No hay publicaciones disponibles en este momento.</p>';
      return;
    }

    noticiasGlobales = [];

    for (const file of archivosMarkdown) {
      const resContenido = await fetch(file.download_url);
      const texto = await resContenido.text();

      const { metadatos, cuerpo } = parseFrontmatter(texto);

      noticiasGlobales.push({
        id: file.name,
        title: metadatos.title || 'Sin título',
        categoria: (metadatos.categoria || 'politica').toLowerCase(),
        date: metadatos.date || '2026',
        bajada: metadatos.bajada || '',
        thumbnail: metadatos.thumbnail || 'fotos/LAGACELAICONODORADO.jpg'
      });
    }

    // 2. Reemplazar las siluetas por el contenido real
    renderizarNoticiasProcesadas();

  } catch (err) {
    contenedorDestacada.innerHTML = '';
    grid.innerHTML = '<div class="bloque-vacio-seccion"><p>No se pudieron cargar las noticias.</p></div>';
  }
}

/* RENDERIZADO EDITORIAL */
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
      <p>No hay noticias publicadas en esta sección todavía.</p>
    </div>`;
    return;
  }

  const mapaCatTexto = {
    'politica': 'POLÍTICA',
    'internacionales': 'INTERNACIONALES',
    'espectaculos': 'ESPECTÁCULOS',
    'deportes': 'DEPORTES'
  };

  if (seccionActual === 'inicio') {
    let indiceHero = noticiasFiltradas.findIndex(n => n.categoria === 'politica');
    if (indiceHero === -1) indiceHero = 0;

    const destacada = noticiasFiltradas[indiceHero];
    const restantes = noticiasFiltradas.filter((_, idx) => idx !== indiceHero);
    const bajadaHero = limpiarBajadaCompleta(destacada.bajada);

    contenedorDestacada.innerHTML = `
      <article class="tarjeta-destacada-hero">
        <a href="noticia.html?id=${destacada.id}" class="enlace-destacada">
          <div class="imagen-destacada-wrapper">
            <img src="${destacada.thumbnail}" alt="${destacada.title}" onerror="this.src='fotos/LAGACELAICONODORADO.jpg'">
            <span class="badge-categoria-editorial">${mapaCatTexto[destacada.categoria] || destacada.categoria.toUpperCase()}</span>
          </div>
          <div class="contenido-destacada">
            <span class="etiqueta-destacada-alerta">★ NOTICIA PRINCIPAL</span>
            <h2 class="titulo-destacada">${destacada.title}</h2>
            ${bajadaHero ? `<p class="bajada-destacada">${bajadaHero}</p>` : ''}
            <div class="meta-destacada">
              <span>${destacada.date}</span>
            </div>
          </div>
        </a>
      </article>
    `;

    let htmlDinamico = '<div class="layout-noticias-dinamico">';

    // Fila 1: Dos medianas con toda la bajada
    if (restantes.length > 0) {
      const fila2 = restantes.slice(0, 2);
      htmlDinamico += '<div class="fila-secundaria-editorial">';
      fila2.forEach(n => {
        const bajadaMedia = limpiarBajadaCompleta(n.bajada);
        htmlDinamico += `
          <article class="tarjeta-mediana">
            <a href="noticia.html?id=${n.id}">
              <div class="img-wrap">
                <img src="${n.thumbnail}" alt="${n.title}" loading="lazy" onerror="this.src='fotos/LAGACELAICONODORADO.jpg'">
                <span class="badge-categoria-editorial">${mapaCatTexto[n.categoria] || n.categoria.toUpperCase()}</span>
              </div>
              <div class="info-wrap">
                <h3>${n.title}</h3>
                ${bajadaMedia ? `<p>${bajadaMedia}</p>` : ''}
                <span class="meta-fecha-mini">${n.date}</span>
              </div>
            </a>
          </article>
        `;
      });
      htmlDinamico += '</div>';
    }

    // Fila 2: Mosaico mixto con toda la bajada
    if (restantes.length > 2) {
      const horizontal = restantes[2];
      const compactas = restantes.slice(3);
      const bajadaH = limpiarBajadaCompleta(horizontal.bajada);

      htmlDinamico += '<div class="fila-mosaico-editorial">';
      
      htmlDinamico += `
        <article class="tarjeta-horizontal">
          <a href="noticia.html?id=${horizontal.id}" class="enlace-horizontal">
            <div class="img-wrap">
              <img src="${horizontal.thumbnail}" alt="${horizontal.title}" loading="lazy" onerror="this.src='fotos/LAGACELAICONODORADO.jpg'">
              <span class="badge-categoria-editorial">${mapaCatTexto[horizontal.categoria] || horizontal.categoria.toUpperCase()}</span>
            </div>
            <div class="info-wrap">
              <h3>${horizontal.title}</h3>
              ${bajadaH ? `<p>${bajadaH}</p>` : ''}
              <span class="meta-fecha-mini">${horizontal.date}</span>
            </div>
          </a>
        </article>
      `;

      if (compactas.length > 0) {
        htmlDinamico += '<div class="columna-compactas">';
        compactas.slice(0, 3).forEach(c => {
          htmlDinamico += `
            <article class="tarjeta-compacta-editorial">
              <span class="badge-cat-tag">${mapaCatTexto[c.categoria] || c.categoria.toUpperCase()}</span>
              <a href="noticia.html?id=${c.id}"><h4>${c.title}</h4></a>
              <span class="meta-fecha-mini">${c.date}</span>
            </article>
          `;
        });
        htmlDinamico += '</div>';
      }

      htmlDinamico += '</div>';
    }

    htmlDinamico += '</div>';
    grid.innerHTML = htmlDinamico;

  } else {
    let htmlSeccion = '<div class="fila-secundaria-editorial">';
    noticiasFiltradas.forEach(n => {
      const bajadaSec = limpiarBajadaCompleta(n.bajada);
      htmlSeccion += `
        <article class="tarjeta-mediana">
          <a href="noticia.html?id=${n.id}">
            <div class="img-wrap">
              <img src="${n.thumbnail}" alt="${n.title}" loading="lazy" onerror="this.src='fotos/LAGACELAICONODORADO.jpg'">
              <span class="badge-categoria-editorial">${mapaCatTexto[n.categoria] || n.categoria.toUpperCase()}</span>
            </div>
            <div class="info-wrap">
              <h3>${n.title}</h3>
              ${bajadaSec ? `<p>${bajadaSec}</p>` : ''}
              <span class="meta-fecha-mini">${n.date}</span>
            </div>
          </a>
        </article>
      `;
    });
    htmlSeccion += '</div>';
    grid.innerHTML = htmlSeccion;
  }
}

/* CARRUSEL INSTANTÁNEO Y SIN DEMORAS */
function inicializarCarruselEquipo() {
  const btnPrev = document.getElementById('btn-carrusel-prev');
  const btnNext = document.getElementById('btn-carrusel-next');

  if (btnPrev && btnNext) {
    btnPrev.onclick = (e) => {
      e.preventDefault();
      indiceEquipo = (indiceEquipo - 1 + equipoEditorial.length) % equipoEditorial.length;
      actualizarTarjetaEquipo();
    };

    btnNext.onclick = (e) => {
      e.preventDefault();
      indiceEquipo = (indiceEquipo + 1) % equipoEditorial.length;
      actualizarTarjetaEquipo();
    };

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

  // Actualización inmediata sin animaciones pesadas
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

/* MODO OSCURO */
function inicializarModoOscuro() {
  const btnModo = document.getElementById('btn-modo');
  if (btnModo) {
    btnModo.addEventListener('click', () => {
      document.body.classList.toggle('modo-oscuro');
      btnModo.textContent = document.body.classList.contains('modo-oscuro') ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
    });
  }
}