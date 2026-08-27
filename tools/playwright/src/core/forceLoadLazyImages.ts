import type { Page } from '@playwright/test';

interface ForceLoadLazyImagesOptions {
  /** Wait for images to finish decoding before resolving. Default: true */
  wait?: boolean;
}

export const forceLoadLazyImages = (
  page: Page,
  { wait = true }: ForceLoadLazyImagesOptions = {}
) =>
  page.evaluate(async (wait) => {
    const images = document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]');
    images.forEach((image) => image.setAttribute('loading', 'eager'));

    if (!wait) return;

    await Promise.all(
      [...images].map((image) =>
        image.complete ? Promise.resolve() : image.decode().catch(() => undefined)
      )
    );
  }, wait);
