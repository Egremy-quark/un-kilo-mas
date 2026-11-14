import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const ANCHOS = [
  { nombre: '375', width: 375, height: 812 },
  { nombre: '1280', width: 1280, height: 900 },
] as const;

async function listo(page: import('@playwright/test').Page): Promise<void> {
  await page.evaluate(
    () =>
      Promise.race([
        document.fonts.ready,
        new Promise((resolver) => {
          window.setTimeout(resolver, 4000);
        }),
      ]),
  );
}

test.beforeAll(async () => {
  await mkdir('capturas', { recursive: true });
});

test('páginas y calculadoras con resultado', async ({ page }) => {
  test.setTimeout(180_000);
  for (const vista of ANCHOS) {
    await page.setViewportSize({ width: vista.width, height: vista.height });
    await page.goto('/');
    await listo(page);
    await expect(page).toHaveTitle(/Llega al gym/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('sabiendo qué hacer');
    await expect(page.getByText('La Rutina 01 se abre muy pronto.')).toBeVisible();
    await page.screenshot({ path: `capturas/inicio-${vista.nombre}.png`, fullPage: true });
  }

  for (const vista of ANCHOS) {
    await page.setViewportSize({ width: vista.width, height: vista.height });
    await page.goto('/#1rm');
    await listo(page);
    await page.locator('#peso-1rm').fill('100');
    await page.locator('#reps-1rm').fill('5');
    await page.locator('#form-1rm').getByRole('button', { name: 'Calcular' }).click();
    await expect(page.locator('#resultado-cifra')).toHaveAttribute('data-valor', '115');
    await expect(page.locator('#resultado-unidad')).toHaveText('kg');
    await expect(page.locator('#resultado-explicacion')).toContainText('Epley y Brzycki');
    await expect(page.locator('#resultado-vivo')).toContainText(
      'Promedio 114.6 kg, redondeado a 115 kg para poder cargarlo',
    );
    await page.screenshot({ path: `capturas/1rm-${vista.nombre}.png`, fullPage: true });
  }

  const descarga1rm = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Compartir resultado' }).click();
  await (await descarga1rm).saveAs('capturas/tarjeta-1rm.png');

  for (const vista of ANCHOS) {
    await page.setViewportSize({ width: vista.width, height: vista.height });
    await page.goto('/#proteina');
    await listo(page);
    await page.locator('#peso-proteina').fill('80');
    await page.locator('#form-proteina').getByRole('radio', { name: 'Mantener' }).check();
    await page.locator('#form-proteina').getByRole('button', { name: 'Calcular' }).click();
    await expect(page.locator('#resultado-cifra')).toHaveAttribute('data-valor', '130');
    await expect(page.locator('#resultado-vivo')).toContainText('Entre 130 y 175 g al día');
    await page.screenshot({ path: `capturas/proteina-${vista.nombre}.png`, fullPage: true });
  }

  const descargaProteina = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Compartir resultado' }).click();
  await (await descargaProteina).saveAs('capturas/tarjeta-proteina.png');

  for (const vista of ANCHOS) {
    await page.setViewportSize({ width: vista.width, height: vista.height });
    await page.goto('/#calorias');
    await listo(page);
    const form = page.locator('#form-calorias');
    await form.getByRole('radio', { name: 'Hombre' }).check();
    await page.locator('#edad').fill('30');
    await page.locator('#peso-calorias').fill('80');
    await page.locator('#estatura').fill('175');
    await page.locator('#actividad').selectOption('moderado');
    await form.getByRole('button', { name: 'Calcular' }).click();
    await expect(page.locator('#resultado-cifra')).toHaveAttribute('data-valor', '2710');
    await expect(page.locator('#resultado-unidad')).toHaveText('kcal');
    await page.screenshot({ path: `capturas/calorias-${vista.nombre}.png`, fullPage: true });
  }

  const descargaCalorias = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Compartir resultado' }).click();
  await (await descargaCalorias).saveAs('capturas/tarjeta-calorias.png');

  for (const vista of ANCHOS) {
    await page.setViewportSize({ width: vista.width, height: vista.height });
    await page.goto('/coaching');
    await listo(page);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Yohan');
    await page.screenshot({ path: `capturas/coaching-${vista.nombre}.png`, fullPage: true });
  }

  await page.setViewportSize({ width: 375, height: 812 });
  const filtro = page.locator('#filtro');
  await filtro.getByRole('radio', { name: '3', exact: true }).check();
  await filtro.getByRole('radio', { name: 'Llevo unos meses' }).check();
  await page.locator('#filtro-objetivo').fill('Entrenar con un plan claro');
  await page.locator('#filtro-lesiones').fill('Ninguna');
  await page.locator('#filtro-ciudad').fill('Guadalajara');
  await expect(page.getByRole('button', { name: 'Muy pronto' })).toBeDisabled();
  await page.screenshot({ path: 'capturas/coaching-filtro-375.png', fullPage: true });

  for (const vista of ANCHOS) {
    await page.setViewportSize({ width: vista.width, height: vista.height });
    await page.goto('/privacidad');
    await listo(page);
    await expect(page.getByRole('heading', { name: 'Responsable' })).toBeVisible();
    await page.screenshot({ path: `capturas/privacidad-${vista.nombre}.png`, fullPage: true });
  }
});
