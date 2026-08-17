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
// --- RECORDAR LA ÚLTIMA SECCIÓN AL RECARGAR ---
document.addEventListener("DOMContentLoaded", () => {
  // 1. Obtener todos los botones del menú y las noticias/secciones
  const botonesMenu = document.querySelectorAll("nav button, .menu-item");
  const noticias = document.querySelectorAll(".noticia");
  const seccionQuienesSomos = document.getElementById("quienes-somos");

  // 2. Función para mostrar la sección o categoría seleccionada
  function activarSeccion(categoria) {
    if (!categoria) return;

    // Guardar en la memoria del navegador
    localStorage.setItem("categoriaActiva", categoria);

    // Actualizar clase activa en los botones
    botonesMenu.forEach((btn) => {
      if (btn.getAttribute("data-categoria") === categoria) {
        btn.classList.add("activo");
      } else {
        btn.classList.remove("activo");
      }
    });

    // Controlar visibilidad de Quiénes Somos y Noticias
    if (categoria === "quienes-somos") {
      if (seccionQuienesSomos) seccionQuienesSomos.style.display = "block";
      noticias.forEach((noticia) => (noticia.style.display = "none"));
    } else {
      if (seccionQuienesSomos) seccionQuienesSomos.style.display = "none";
      noticias.forEach((noticia) => {
        const catNoticia = noticia.getAttribute("data-categoria");
        if (categoria === "todas" || catNoticia === categoria) {
          noticia.style.display = "";
        } else {
          noticia.style.display = "none";
        }
      });
    }
  }

  // 3. Escuchar clics en cada botón del menú
  botonesMenu.forEach((boton) => {
    boton.addEventListener("click", () => {
      const categoria = boton.getAttribute("data-categoria");
      activarSeccion(categoria);
    });
  });

  // 4. AL RECARGAR: Leer la última sección guardada (o 'todas' por defecto)
  const categoriaGuardada = localStorage.getItem("categoriaActiva") || "todas";
  activarSeccion(categoriaGuardada);
});