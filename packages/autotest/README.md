# 🧪 autotest

Typed test-case helpers and automation utilities.

## Installation

```bash
npm install @siberiacancode/autotest
```

## Test cases

```ts
import { createTestCases } from '@siberiacancode/autotest';

export const cases = createTestCases([
  {
    id: '1',
    name: 'Авторизация пользователя',
    priority: 'High',
    state: 'Ready',
    steps: [{ action: 'Открыть страницу входа', expected: ['Страница открыта'] }]
  }
]);
```

`createTestCases` and `createPreconditions` validate the shape without widening keys and literal values.

## Test case runtime

Create a mock-server component whose REST and GraphQL routes are selected by the test case cookie:

```ts
import { createTestCaseMock } from '@siberiacancode/autotest';

export default createTestCaseMock({
  caseId: '42',
  cookieName: 'project-test-case',
  configs: [usersRestConfig, usersGraphQLConfig]
});
```

Set the same cookie in Playwright before opening the tested page:

```ts
import { testCase } from '@siberiacancode/autotest';

await testCase(page, '42', 'project-test-case');
```

The cookie name is optional. Both helpers use the exported `TEST_CASE_COOKIE_NAME` string
(`test-case`) by default.

## CLI

```bash
autotest caseids
```

The command finds cases declared through `createTestCases`, assigns stable numeric string IDs and writes `CASE_IDS`.

| flag                      | default               | description                                      |
| ------------------------- | --------------------- | ------------------------------------------------ |
| `-i, --input`             | `tests/testcases`     | directory containing test cases                  |
| `-o, --output`            | `tests/case-ids.ts`   | generated case ID constants file                 |
| `-r, --references`        | `tests`               | directory where renamed references are updated   |
| `-x, --exclude`           | `regress`             | directories excluded relative to `input`         |
| `--function-name`         | `createTestCases`     | test-case factory function name                  |
| `-n, --name`              | `CASE_IDS`            | generated case IDs constant name                 |
| `--last-id-name`          | `LAST_CASE_ID`        | last assigned ID constant name                   |
| `--no-update-references`  | —                     | do not update renamed `CASE_IDS.*` references    |

Existing IDs and `LAST_CASE_ID` are preserved, so deleted IDs are not reused.
