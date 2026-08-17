// ELEMENTOS DEL DOM
const btnModo = document.getElementById('btn-modo');
const botonesNav = document.querySelectorAll('.btn-nav');
const noticias = document.querySelectorAll('.noticia');
const seccionNoticias = document.getElementById('seccion-noticias');
const seccionQuienesSomos = document.getElementById('seccion-quienes-somos');

// 1. MODO OSCURO (CON MEMORIA AL RECARGAR)
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

// 2. FUNCIÓN DE FILTRADO Y NAVEGACIÓN
function navegarA(categoriaOId) {
  if (!categoriaOId) return;

  // Guardar en la memoria del navegador
  localStorage.setItem('seccionActiva', categoriaOId);

  // Actualizar estado activo en los botones
  botonesNav.forEach(b => {
    const dataCat = b.getAttribute('data-categoria');
    if (b.id === categoriaOId || dataCat === categoriaOId) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  // SI SE SELECCIONA "¿QUIÉNES SOMOS?"
  if (categoriaOId === 'btn-quienes-somos' || categoriaOId === 'quienes-somos') {
    if (seccionNoticias) seccionNoticias.classList.add('oculta');
    if (seccionQuienesSomos) seccionQuienesSomos.classList.remove('oculta');
  } 
  // SI SE SELECCIONA CUALQUIER OTRA SECCIÓN DE NOTICIAS
  else {
    if (seccionQuienesSomos) seccionQuienesSomos.classList.add('oculta');
    if (seccionNoticias) seccionNoticias.classList.remove('oculta');

    // Filtrar noticias
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

// 3. ASIGNAR EVENTOS CLICK A LOS BOTONES
botonesNav.forEach(boton => {
  boton.addEventListener('click', () => {
    const destino = boton.id === 'btn-quienes-somos' 
      ? 'btn-quienes-somos' 
      : boton.getAttribute('data-categoria');
    navegarA(destino);
  });
});

// 4. RESTAURAR LA ÚLTIMA SECCIÓN AL RECARGAR (F5)
document.addEventListener('DOMContentLoaded', () => {
  const seccionPrevia = localStorage.getItem('seccionActiva') || 'todos';
  navegarA(seccionPrevia);
});