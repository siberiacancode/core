# 🔮 vitest

A shared Vitest configuration for consistent testing across projects.

## Installation

```bash
npm install @siberiacancode/vitest
```

## Usage

```javascript
import { vitest } from '@siberiacancode/vitest';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    ...vitest
  }
});
```

V8 coverage is enabled by default. Disable it for a single run:

```bash
vitest --coverage.enabled=false
```

Or disable it in a project's configuration:

```javascript
export default defineConfig({
  test: {
    ...vitest,
    coverage: {
      ...vitest.coverage,
      enabled: false
    }
  }
});
```

## Files

```javascript
import { getCoverageInclude, getFiles, getTsFiles, vitest } from '@siberiacancode/vitest';
import { defineConfig } from 'vitest/config';

const files = getFiles('src', {
  ignore: ['generated', /\.stories\.tsx$/]
});

const tsFiles = getTsFiles('src', {
  ignore: [(file) => file.includes('/mock/')]
});

export default defineConfig({
  test: {
    ...vitest,
    coverage: {
      ...vitest.coverage,
      include: getCoverageInclude('src')
    }
  }
});
```
