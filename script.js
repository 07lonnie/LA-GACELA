// --- 1. MODO OSCURO (INDEPENDIENTE Y SEGURO) ---
const aplicarModoOscuro = () => {
  const btnModo = document.getElementById('btn-modo');
  const esOscuro = localStorage.getItem('modoOscuro') === 'activo';

  if (esOscuro) {
    document.body.classList.add('modo-oscuro');
    if (btnModo) btnModo.textContent = '☀️ Modo Claro';
  } else {
    document.body.classList.remove('modo-oscuro');
    if (btnModo) btnModo.textContent = '🌙 Modo Oscuro';
  }

  if (btnModo) {
    btnModo.onclick = () => {
      document.body.classList.toggle('modo-oscuro');
      const activo = document.body.classList.contains('modo-oscuro');
      btnModo.textContent = activo ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
      localStorage.setItem('modoOscuro', activo ? 'activo' : 'inactivo');
    };
  }
};

// --- 2. RESTO DE NAVEGACIÓN Y CARRUSEL ---
document.addEventListener('DOMContentLoaded', () => {
  aplicarModoOscuro();

  const botonesNav = document.querySelectorAll('.btn-nav');
  const noticias = document.querySelectorAll('.noticia');
  const seccionNoticias = document.getElementById('seccion-noticias');
  const seccionQuienesSomos = document.getElementById('seccion-quienes-somos');

  let categoriaSeleccionada = 'todos';
  let categoriaActualEnPantalla = '';

  function marcarBotonActivo(categoria) {
    if (categoriaActualEnPantalla === categoria) return;
    categoriaActualEnPantalla = categoria;

    botonesNav.forEach((b) => {
      const dataCat = b.getAttribute('data-categoria');
      const esInicio =
        (categoria === 'todos' || categoria === 'todas') &&
        (dataCat === 'todos' || dataCat === 'todas' || b.id === 'btn-inicio');

      if (b.id === categoria || dataCat === categoria || esInicio) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
  }

  function navegarA(categoriaOId) {
    if (!categoriaOId) return;

    categoriaSeleccionada = categoriaOId;
    localStorage.setItem('seccionActiva', categoriaOId);
    marcarBotonActivo(categoriaOId);

    if (categoriaOId === 'btn-quienes-somos' || categoriaOId === 'quienes-somos') {
      if (seccionNoticias) seccionNoticias.classList.add('oculta');
      if (seccionQuienesSomos) seccionQuienesSomos.classList.remove('oculta');
    } else {
      if (seccionQuienesSomos) seccionQuienesSomos.classList.add('oculta');
      if (seccionNoticias) seccionNoticias.classList.remove('oculta');

      noticias.forEach((noticia) => {
        const catNoticia = noticia.getAttribute('data-categoria');
        if (categoriaOId === 'todos' || categoriaOId === 'todas' || catNoticia === categoriaOId) {
          noticia.style.display = '';
        } else {
          noticia.style.display = 'none';
        }
      });
    }
  }

  botonesNav.forEach((boton) => {
    boton.addEventListener('click', () => {
      const destino =
        boton.id === 'btn-quienes-somos'
          ? 'btn-quienes-somos'
          : boton.getAttribute('data-categoria');
      navegarA(destino);
    });
  });

  window.addEventListener('scroll', () => {
    if (categoriaSeleccionada !== 'todos' && categoriaSeleccionada !== 'todas') return;
    if (seccionQuienesSomos && !seccionQuienesSomos.classList.contains('oculta')) return;

    if (window.scrollY < 250) {
      marcarBotonActivo('todos');
      return;
    }

    let categoriaEncontrada = null;
    const lineaReferencia = window.innerHeight * 0.35;

    noticias.forEach((noticia) => {
      const rect = noticia.getBoundingClientRect();
      if (rect.top <= lineaReferencia && rect.bottom >= lineaReferencia) {
        categoriaEncontrada = noticia.getAttribute('data-categoria');
      }
    });

    if (categoriaEncontrada) {
      marcarBotonActivo(categoriaEncontrada);
    }
  });

  const seccionPrevia = localStorage.getItem('seccionActiva') || 'todos';
  navegarA(seccionPrevia);

  // CARRUSEL
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
});