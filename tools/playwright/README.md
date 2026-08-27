# 🔮 playwright

Playwright helpers and a test runner CLI in one package.

## Installation

```bash
npm install @siberiacancode/playwright
```

## Usage

```ts
import { mockResponse, snapshot, waitResponse } from '@siberiacancode/playwright';
import { test } from '@playwright/test';

test('home page', async ({ page }) => {
  await mockResponse(page, { path: '/api/user', body: { id: 1 } });

  await page.goto('/');
  await waitResponse(page, { path: '/home-page-data', status: 200 });

  await snapshot(page, 'home-page');
});
```
