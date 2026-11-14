export function iniciarMovimiento(): void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const escritorio = window.matchMedia('(min-width: 960px)');
  if (reduce.matches || !escritorio.matches) return;

  document.documentElement.classList.add('con-movimiento');

  const nodos = [...document.querySelectorAll<HTMLElement>('.banda, .aviso-medico')].filter((nodo) => {
    if (nodo.classList.contains('hero')) return false;
    return nodo.getBoundingClientRect().top >= window.innerHeight;
  });
  if (nodos.length === 0) return;

  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        entrada.target.classList.add('es-visible');
        observador.unobserve(entrada.target);
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
  );

  for (const nodo of nodos) {
    nodo.classList.add('js-entra');
    observador.observe(nodo);
  }
}
