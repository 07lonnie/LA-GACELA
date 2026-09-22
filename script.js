/* ==========================================================
   LA GACELA - NAVEGACIÓN, FILTRADO, CARRUSEL Y PARSER YAML
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
    nombre: "Adriana Judith Peña Cotos",
    cargo: "Editor(a) de Política",
    correo: "politica@lagacela.unfv.edu.pe",
    bio: "Cobertura de asuntos institucionales, política nacional, comisiones parlamentarias e investigaciones coyunturales.",
    foto: "fotos/LAGACELAICONODORADO.jpg"
  },
  {
    nombre: "Lidia Yamilet Chapilliquen Charca",
    cargo: "Editor(a) de Internacionales",
    correo: "internacionales@lagacela.unfv.edu.pe",
    bio: "Análisis geopolítico global, seguimiento de conflictos internacionales y acuerdos diplomáticos multilaterales.",
    foto: "fotos/LAGACELAICONODORADO.jpg"
  },
  {
    nombre: "Jhordan David Valverde Soto",
    cargo: "Editor(a) de Deportes",
    correo: "deportes@lagacela.unfv.edu.pe",
    bio: "Seguimiento y cobertura del deporte universitario, disciplinas locales, competencias nacionales e internacionales.",
    foto: "fotos/LAGACELAICONODORADO.jpg"
  },
  {
    nombre: "Gianella Alondra Orellana Perez",
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

/* NAVEGACIÓN Y TÍTULOS EN FORMATO ORACIÓN */
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

  // Títulos corregidos: solo primera letra con mayúscula
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

/* CARGAR NOTICIAS DESDE GITHUB */
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

      const { metadatos, cuerpo } = parseFrontmatter(texto);

      noticiasGlobales.push({
        id: file.name,
        title: metadatos.title || 'Sin título',
        categoria: (metadatos.categoria || 'politica').toLowerCase(),
        date: metadatos.date || '2026',
        bajada: (metadatos.bajada || '').replace(/[*_#]/g, ''),
        thumbnail: metadatos.thumbnail || 'fotos/LAGACELAICONODORADO.jpg'
      });
    }

    renderizarNoticiasProcesadas();

  } catch (err) {
    grid.innerHTML = '<p class="mensaje-vacio">Aún no se han cargado publicaciones en esta sección.</p>';
  }
}

/* RENDERIZADO CON MAQUETACIÓN ASIMÉTRICA TIPO NEW YORK TIMES / EL COMERCIO */
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
    // 1. Noticia Hero: Política prioritariamente
    let indiceHero = noticiasFiltradas.findIndex(n => n.categoria === 'politica');
    if (indiceHero === -1) indiceHero = 0;

    const destacada = noticiasFiltradas[indiceHero];
    const restantes = noticiasFiltradas.filter((_, idx) => idx !== indiceHero);

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
              <span>${destacada.date}</span>
            </div>
          </div>
        </a>
      </article>
    `;

    // 2. Construcción del layout dinámico asimétrico
    let htmlDinamico = '<div class="layout-noticias-dinamico">';

    // Fila 1: Dos noticias medianas destacadas
    if (restantes.length > 0) {
      const fila2 = restantes.slice(0, 2);
      htmlDinamico += '<div class="fila-secundaria-editorial">';
      fila2.forEach(n => {
        const bajadaCorta = n.bajada.length > 120 ? n.bajada.substring(0, 120) + '...' : n.bajada;
        htmlDinamico += `
          <article class="tarjeta-mediana">
            <a href="noticia.html?id=${n.id}">
              <div class="img-wrap">
                <img src="${n.thumbnail}" alt="${n.title}" loading="lazy" onerror="this.src='fotos/LAGACELAICONODORADO.jpg'">
                <span class="badge-categoria-portada">${mapaCatTexto[n.categoria] || n.categoria.toUpperCase()}</span>
              </div>
              <div class="info-wrap">
                <h3>${n.title}</h3>
                <p>${bajadaCorta}</p>
                <span class="meta-fecha-mini">${n.date}</span>
              </div>
            </a>
          </article>
        `;
      });
      htmlDinamico += '</div>';
    }

    // Fila 2: Mosaico mixto (1 Horizontal + Columna de compactas)
    if (restantes.length > 2) {
      const horizontal = restantes[2];
      const compactas = restantes.slice(3);

      htmlDinamico += '<div class="fila-mosaico-editorial">';
      
      // Lado A: Horizontal grande
      const bajadaH = horizontal.bajada.length > 140 ? horizontal.bajada.substring(0, 140) + '...' : horizontal.bajada;
      htmlDinamico += `
        <article class="tarjeta-horizontal">
          <div class="img-wrap">
            <img src="${horizontal.thumbnail}" alt="${horizontal.title}" loading="lazy" onerror="this.src='fotos/LAGACELAICONODORADO.jpg'">
          </div>
          <div class="info-wrap">
            <span class="badge-cat-tag">${mapaCatTexto[horizontal.categoria] || horizontal.categoria.toUpperCase()}</span>
            <a href="noticia.html?id=${horizontal.id}"><h3>${horizontal.title}</h3></a>
            <p>${bajadaH}</p>
            <span class="meta-fecha-mini">${horizontal.date}</span>
          </div>
        </article>
      `;

      // Lado B: Columna de compactas
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
    // Vista de sección individual: 2 columnas limpias
    let htmlSeccion = '<div class="fila-secundaria-editorial">';
    noticiasFiltradas.forEach(n => {
      const bajadaCorta = n.bajada.length > 130 ? n.bajada.substring(0, 130) + '...' : n.bajada;
      htmlSeccion += `
        <article class="tarjeta-mediana">
          <a href="noticia.html?id=${n.id}">
            <div class="img-wrap">
              <img src="${n.thumbnail}" alt="${n.title}" loading="lazy" onerror="this.src='fotos/LAGACELAICONODORADO.jpg'">
              <span class="badge-categoria-portada">${mapaCatTexto[n.categoria] || n.categoria.toUpperCase()}</span>
            </div>
            <div class="info-wrap">
              <h3>${n.title}</h3>
              <p>${bajadaCorta}</p>
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

/* CARRUSEL EDITORIAL INMEDIATO Y FLUIDO */
function inicializarCarruselEquipo() {
  const btnPrev = document.getElementById('btn-carrusel-prev');
  const btnNext = document.getElementById('btn-carrusel-next');

  if (btnPrev && btnNext) {
    btnPrev.onclick = () => {
      indiceEquipo = (indiceEquipo - 1 + equipoEditorial.length) % equipoEditorial.length;
      actualizarTarjetaEquipo();
    };

    btnNext.onclick = () => {
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

  // Actualización inmediata del DOM
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