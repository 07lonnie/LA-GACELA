/* ==========================================================
   LA GACELA - NAVEGACIÓN, FILTRADO, CARRUSEL Y PARSER YAML
   ========================================================== */

let noticiasGlobales = [];
let seccionActual = 'inicio';

const equipoEditorial = [
  {
    nombre: "Yamilet Chapilliquen",
    cargo: "Director(a) & Editor(a) de Espectáculos",
    correo: "espectaculos@lagacela.unfv.edu.pe",
    bio: "Dirección general del medio e investigaciones de la agenda cultural, artística y de entretenimiento.",
    foto: "fotos/Yamilet.jpg"
  },
  {
    nombre: "Belen Yaranga",
    cargo: "Editor(a) de Política",
    correo: "politica@lagacela.unfv.edu.pe",
    bio: "Cobertura de asuntos institucionales, política nacional, comisiones parlamentarias e investigaciones coyunturales.",
    foto: "fotos/Belen.jpg"
  },
  {
    nombre: "Adriana Peña",
    cargo: "Editor(a) de Internacionales",
    correo: "internacionales@lagacela.unfv.edu.pe",
    bio: "Análisis geopolítico global, seguimiento de conflictos internacionales y acuerdos diplomáticos multilaterales.",
    foto: "fotos/Adriana.jpg"
  },
  {
    nombre: "Jhordan Valverde",
    cargo: "Editor(a) de Deportes",
    correo: "deportes@lagacela.unfv.edu.pe",
    bio: "Seguimiento y cobertura del deporte universitario, disciplinas locales, competencias nacionales e internacionales.",
    foto: "fotos/Jhordan.jpg"
  },
  {
    nombre: "Gianella Orellana",
    cargo: "Editor(a) de Diseño Web",
    correo: "webmaster@lagacela.unfv.edu.pe",
    bio: "Responsable de la maquetación digital, arquitectura web, experiencia de usuario e innovación gráfica del diario.",
    foto: "fotos/yo.jpg"
  }
];

let indiceEquipo = 0;

document.addEventListener('DOMContentLoaded', () => {
  inicializarModoOscuro();
  inicializarNavegacion();
  inicializarCarruselEquipo();
  cargarNoticiasDesdeGitHub();
});

/* PARSER MULTILÍNEA DE FRONTMATTER */
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

/* NAVEGACIÓN ENTRE PESTAÑAS */
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
        autor: metadatos.autor || 'Redacción',
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

/* RENDERIZADO FILTRADO Y HERO NOTICIA */
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

    const restantes = noticiasFiltradas.slice(1);
    grid.innerHTML = restantes.map(n => generarTarjetaHTML(n, mapaCatTexto)).join('');
  } else {
    grid.innerHTML = noticiasFiltradas.map(n => generarTarjetaHTML(n, mapaCatTexto)).join('');
  }
}

function generarTarjetaHTML(n, mapaCatTexto) {
  const bajadaCorta = n.bajada.length > 150 ? n.bajada.substring(0, 150) + '...' : n.bajada;

  return `
    <article class="tarjeta-noticia-portada">
      <a href="noticia.html?id=${n.id}" class="enlace-noticia">
        <div class="imagen-portada-wrapper">
          <img src="${n.thumbnail}" alt="${n.title}" loading="lazy" onerror="this.src='fotos/LAGACELAICONODORADO.jpg'">
          <span class="badge-categoria-portada">${mapaCatTexto[n.categoria] || n.categoria.toUpperCase()}</span>
        </div>
        <div class="contenido-tarjeta-portada">
          <h3 class="titulo-tarjeta">${n.title}</h3>
          <p class="bajada-tarjeta">${bajadaCorta}</p>
          <div class="meta-tarjeta">
            <span>Por <strong>${n.autor}</strong></span>
            <span>• ${n.date}</span>
          </div>
        </div>
      </a>
    </article>
  `;
}

/* CARRUSEL EDITORIAL */
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