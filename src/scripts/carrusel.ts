/** Carrusel táctil. Sin autoplay: la persona avanza al deslizar o al tocar un punto. */
export function iniciarCarrusel(raiz: HTMLElement): void {
  const pista = raiz.querySelector<HTMLElement>('.carrusel-pista');
  if (!pista) return;

  const tarjetas = [...pista.querySelectorAll<HTMLElement>('.carrusel-tarjeta')];
  const puntos = [...raiz.querySelectorAll<HTMLButtonElement>('[data-indice]')];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const escritorio = window.matchMedia('(min-width: 960px)');

  function indiceVisible(): number {
    const vista = pista.scrollLeft + pista.clientWidth / 2;
    let mejor = 0;
    let distancia = Number.POSITIVE_INFINITY;
    tarjetas.forEach((tarjeta, indice) => {
      const centro = tarjeta.offsetLeft + tarjeta.clientWidth / 2;
      const diferencia = Math.abs(centro - vista);
      if (diferencia < distancia) {
        distancia = diferencia;
        mejor = indice;
      }
    });
    return mejor;
  }

  function marcar(): void {
    const activo = indiceVisible();
    tarjetas.forEach((tarjeta, indice) => {
      tarjeta.classList.toggle('es-activa', escritorio.matches || indice === activo);
    });
    puntos.forEach((punto, indice) => {
      if (indice === activo) punto.setAttribute('aria-current', 'true');
      else punto.removeAttribute('aria-current');
    });
  }

  function ir(indice: number): void {
    const total = tarjetas.length;
    if (total === 0) return;
    const normalizado = (indice + total) % total;
    const tarjeta = tarjetas[normalizado];
    if (!tarjeta) return;
    pista.scrollTo({
      left: tarjeta.offsetLeft,
      behavior: reduce.matches ? 'auto' : 'smooth',
    });
  }

  puntos.forEach((punto) => {
    punto.addEventListener('click', () => {
      ir(Number(punto.dataset.indice));
    });
  });

  pista.addEventListener('scroll', () => marcar(), { passive: true });
  escritorio.addEventListener('change', marcar);
  marcar();
}
