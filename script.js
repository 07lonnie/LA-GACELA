// ELEMENTOS DEL DOM
const btnModo = document.getElementById('btn-modo');
const botonesNav = document.querySelectorAll('.btn-nav');
const noticias = document.querySelectorAll('.noticia');

const seccionNoticias = document.getElementById('seccion-noticias');
const seccionQuienesSomos = document.getElementById('seccion-quienes-somos');
const btnQuienesSomos = document.getElementById('btn-quienes-somos');

// 1. MODO OSCURO
btnModo.addEventListener('click', () => {
  document.body.classList.toggle('modo-oscuro');
  
  if (document.body.classList.contains('modo-oscuro')) {
    btnModo.textContent = '☀️ Modo Claro';
  } else {
    btnModo.textContent = '🌙 Modo Oscuro';
  }
});

// 2. SISTEMA DE FILTRADO Y NAVEGACIÓN DENTRO DE LA PÁGINA
botonesNav.forEach(boton => {
  boton.addEventListener('click', () => {
    // Cambiar estado activo en los botones
    botonesNav.forEach(b => b.classList.remove('active'));
    boton.classList.add('active');

    const categoria = boton.getAttribute('data-categoria');

    // SI PRESIONA "¿QUIÉNES SOMOS?"
    if (boton.id === 'btn-quienes-somos') {
      seccionNoticias.classList.add('oculta');
      seccionQuienesSomos.classList.remove('oculta');
    } 
    // SI PRESIONA CUALQUIER OTRA SECCIÓN / NOTICIAS
    else {
      seccionQuienesSomos.classList.add('oculta');
      seccionNoticias.classList.remove('oculta');

      // Filtrar las noticias en pantalla
      noticias.forEach(noticia => {
        const catNoticia = noticia.getAttribute('data-categoria');

        if (categoria === 'todos' || catNoticia === categoria) {
          noticia.style.display = 'block';
        } else {
          noticia.style.display = 'none';
        }
      });
    }
  });
});