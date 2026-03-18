# 🔮 yandex-metrika

Helpers for integrating Yandex Metrika into your app.

## Installation

```bash
pnpm add @siberiacancode/yandex-metrika
```

## Script setup

Inject the Metrika tag with `getYandexMetrikaScript`.

```typescript
import { getYandexMetrikaScript } from '@siberiacancode/yandex-metrika';

const counterId = 'your-counter-id';

<script dangerouslySetInnerHTML={{ __html: getYandexMetrikaScript(counterId) }} />;
```

## NoScript image

If JavaScript is disabled, you can render the tracking pixel:

```typescript
import { YandexMetrikaNoScript } from '@siberiacancode/yandex-metrika';

const counterId = 'your-counter-id';

<YandexMetrikaNoScript counterId={counterId} />;
```

## Create typed metrika instance

Use `createYandexMetrika` to create a typed tracker function for your counter.

```typescript
import { createYandexMetrika } from '@siberiacancode/yandex-metrika';

const counterId = 'your-counter-id';

interface YandexMetrikaEventCalculatorOpen {
  eventName: 'reachGoal';
  target: 'calculator-open';
}

interface YandexMetrikaEventCalculatorSum {
  eventName: 'reachGoal';
  target: 'calculator-sum';
  params: { sum: number };
}

interface YandexMetrikaEventCalculatorCurrency {
  eventName: 'reachGoal';
  target: 'calculator-currency';
  params: { currency: string };
}

const yandexMetrika = createYandexMetrika<
  | YandexMetrikaEventCalculatorOpen
  | YandexMetrikaEventCalculatorSum
  | YandexMetrikaEventCalculatorCurrency
>(counterId);
```

## Send events

```typescript
yandexMetrika({
  eventName: 'reachGoal',
  target: 'calculator-currency',
  params: { currency: 'RUB' }
});
```
