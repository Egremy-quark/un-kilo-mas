export function iniciarMovimiento(): void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) return;

  document.documentElement.classList.add('con-movimiento');

  const nodos = document.querySelectorAll<HTMLElement>(
    '.hero, .banda, .form-rutina, .sello, .filtro, .pagina > .bloque',
  );
  if (nodos.length === 0) return;

  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        entrada.target.classList.add('es-visible');
        observador.unobserve(entrada.target);
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  );

  for (const nodo of nodos) {
    nodo.classList.add('js-entra');
    observador.observe(nodo);
  }
}
