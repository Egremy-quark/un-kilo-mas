/** Carrusel de placeholders. El movimiento se detiene al tocarlo y no arranca si la persona prefiere menos movimiento. */
export function iniciarCarrusel(raiz: HTMLElement): void {
  const pista = raiz.querySelector<HTMLElement>('.carrusel-pista');
  if (!pista) return;

  const tarjetas = [...pista.querySelectorAll<HTMLElement>('.carrusel-tarjeta')];
  const anterior = raiz.querySelector<HTMLButtonElement>('[data-carrusel="anterior"]');
  const siguiente = raiz.querySelector<HTMLButtonElement>('[data-carrusel="siguiente"]');
  const puntos = [...raiz.querySelectorAll<HTMLButtonElement>('[data-indice]')];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const movil = window.matchMedia('(max-width: 959px)');
  let pausado = false;
  let timer = 0;

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

  function paso(delta: number): void {
    ir(indiceVisible() + delta);
  }

  function detener(): void {
    pausado = true;
    window.clearInterval(timer);
  }

  anterior?.addEventListener('click', () => {
    detener();
    paso(-1);
  });
  siguiente?.addEventListener('click', () => {
    detener();
    paso(1);
  });
  puntos.forEach((punto) => {
    punto.addEventListener('click', () => {
      detener();
      ir(Number(punto.dataset.indice));
    });
  });

  pista.addEventListener('scroll', () => marcar(), { passive: true });
  raiz.addEventListener('pointerdown', detener);
  raiz.addEventListener('focusin', detener);

  function arrancar(): void {
    window.clearInterval(timer);
    if (reduce.matches || pausado || !movil.matches || tarjetas.length < 2) return;
    timer = window.setInterval(() => {
      if (!pausado) paso(1);
    }, 7000);
  }

  movil.addEventListener('change', arrancar);
  reduce.addEventListener('change', arrancar);
  arrancar();
  marcar();
}
