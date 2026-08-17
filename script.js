// ELEMENTOS DEL DOM
const btnModo = document.getElementById('btn-modo');
const botonesNav = document.querySelectorAll('.btn-nav');
const noticias = document.querySelectorAll('.noticia');
const seccionNoticias = document.getElementById('seccion-noticias');
const seccionQuienesSomos = document.getElementById('seccion-quienes-somos');

// VARIABLE PARA SABER SI ESTAMOS EN MODO FILTRO O EN "INICIO / TODAS"
let categoriaSeleccionada = 'todos';

// 1. MODO OSCURO (CON MEMORIA)
if (localStorage.getItem('modoOscuro') === 'activo') {
  document.body.classList.add('modo-oscuro');
  if (btnModo) btnModo.textContent = '☀️ Modo Claro';
}

if (btnModo) {
  btnModo.addEventListener('click', () => {
    document.body.classList.toggle('modo-oscuro');
    if (document.body.classList.contains('modo-oscuro')) {
      btnModo.textContent = '☀️ Modo Claro';
      localStorage.setItem('modoOscuro', 'activo');
    } else {
      btnModo.textContent = '🌙 Modo Oscuro';
      localStorage.setItem('modoOscuro', 'inactivo');
    }
  });
}

// 2. FUNCIÓN DE NAVEGACIÓN Y FILTRADO
function navegarA(categoriaOId) {
  if (!categoriaOId) return;

  categoriaSeleccionada = categoriaOId;
  localStorage.setItem('seccionActiva', categoriaOId);

  // Actualizar clase activa en los botones
  marcarBotonActivo(categoriaOId);

  // SI PRESIONA "¿QUIÉNES SOMOS?"
  if (categoriaOId === 'btn-quienes-somos' || categoriaOId === 'quienes-somos') {
    if (seccionNoticias) seccionNoticias.classList.add('oculta');
    if (seccionQuienesSomos) seccionQuienesSomos.classList.remove('oculta');
  } 
  // SI PRESIONA CUALQUIER CATEGORÍA DE NOTICIAS O INICIO
  else {
    if (seccionQuienesSomos) seccionQuienesSomos.classList.add('oculta');
    if (seccionNoticias) seccionNoticias.classList.remove('oculta');

    noticias.forEach(noticia => {
      const catNoticia = noticia.getAttribute('data-categoria');
      if (categoriaOId === 'todos' || categoriaOId === 'todas' || catNoticia === categoriaOId) {
        noticia.style.display = '';
      } else {
        noticia.style.display = 'none';
      }
    });
  }
}

// FUNCIÓN AUXILIAR PARA ILUMINAR EL BOTÓN EXACTO
function marcarBotonActivo(categoria) {
  botonesNav.forEach(b => {
    const dataCat = b.getAttribute('data-categoria');
    if (
      b.id === categoria || 
      dataCat === categoria || 
      ((categoria === 'todos' || categoria === 'todas') && (dataCat === 'todos' || dataCat === 'todas' || b.id === 'btn-inicio'))
    ) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });
}

// 3. ASIGNAR CLIC A LOS BOTONES DEL MENÚ
botonesNav.forEach(boton => {
  boton.addEventListener('click', () => {
    const destino = boton.id === 'btn-quienes-somos' 
      ? 'btn-quienes-somos' 
      : boton.getAttribute('data-categoria');
    navegarA(destino);
  });
});

// 4. DETECTAR EL SCROLL AUTOMÁTICO (SCROLLSPY)
window.addEventListener('scroll', () => {
  // Solo se activa si estamos viendo todas las noticias (Inicio)
  if (categoriaSeleccionada !== 'todos' && categoriaSeleccionada !== 'todas') return;
  if (!seccionQuienesSomos.classList.contains('oculta')) return;

  // Si estamos muy arriba (cabecera), marcar "Inicio"
  if (window.scrollY < 200) {
    marcarBotonActivo('todos');
    return;
  }

  // Buscar cuál noticia está a la altura de la vista del usuario
  let categoriaVisible = 'todos';
  const margenDeteccion = window.innerHeight * 0.35; // Punto de corte en la pantalla

  noticias.forEach(noticia => {
    const rect = noticia.getBoundingClientRect();
    if (rect.top <= margenDeteccion && rect.bottom >= margenDeteccion) {
      categoriaVisible = noticia.getAttribute('data-categoria');
    }
  });

  if (categoriaVisible) {
    marcarBotonActivo(categoriaVisible);
  }
});

// 5. RESTAURAR ESTADO AL RECARGAR (F5)
document.addEventListener('DOMContentLoaded', () => {
  const seccionPrevia = localStorage.getItem('seccionActiva') || 'todos';
  navegarA(seccionPrevia);
});

// 6. CARRUSEL DEL EQUIPO EDITORIAL
const track = document.getElementById('track-periodistas');
const btnPrev = document.getElementById('btn-prev-equipo');
const btnNext = document.getElementById('btn-next-equipo');
const contenedorIndicadores = document.getElementById('indicadores-equipo');

if (track && btnPrev && btnNext) {
  const tarjetas = track.querySelectorAll('.tarjeta-periodista');
  const totalTarjetas = tarjetas.length;
  let indiceActual = 0;

  if (contenedorIndicadores) {
    contenedorIndicadores.innerHTML = '';
    tarjetas.forEach((_, i) => {
      const punto = document.createElement('button');
      punto.classList.add('indicador');
      if (i === 0) punto.classList.add('activo');
      punto.setAttribute('aria-label', `Ir a periodista ${i + 1}`);
      punto.addEventListener('click', () => {
        indiceActual = i;
        actualizarCarrusel();
      });
      contenedorIndicadores.appendChild(punto);
    });
  }

  function actualizarCarrusel() {
    track.style.transform = `translateX(-${indiceActual * 100}%)`;
    const puntos = document.querySelectorAll('.indicador');
    puntos.forEach((p, idx) => {
      if (idx === indiceActual) {
        p.classList.add('activo');
      } else {
        p.classList.remove('activo');
      }
    });
  }

  btnNext.addEventListener('click', () => {
    indiceActual = (indiceActual + 1) % totalTarjetas;
    actualizarCarrusel();
  });

  btnPrev.addEventListener('click', () => {
    indiceActual = (indiceActual - 1 + totalTarjetas) % totalTarjetas;
    actualizarCarrusel();
  });
}