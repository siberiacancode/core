import type { Page } from '@playwright/test';
import type {
  GraphQLRequestConfig,
  MockServerComponent,
  RestRequestConfig
} from 'mock-config-server';

import { cookie } from '@siberiacancode/playwright';

export * from './caseids';

export interface CaseStep {
  action: string | string[];
  comments?: string | string[];
  expected?: string[];
  testData?: string | string[];
}

export interface Automation {
  path: string;
  test: string;
}

export type TestCasePriority = 'High' | 'Low' | 'Medium';
export type TestCaseState = 'NeedsWork' | 'NotReady' | 'Ready';

export interface TestCase {
  automation?: { references: Automation[] };
  description?: string | string[];
  id: string;
  name: string;
  parameters?: Array<Record<string, boolean | number | string | null>>;
  postconditions?: CaseStep[];
  preconditions?: CaseStep[];
  priority?: TestCasePriority;
  state?: TestCaseState;
  steps: CaseStep[];
}

export const createTestCases = <const T extends TestCase[]>(testCases: T): T => testCases;

export const createPreconditions = <const T extends Record<string, CaseStep>>(
  preconditions: T
): T => preconditions;

export interface CreateTestCaseMockParams extends Omit<MockServerComponent, 'configs'> {
  caseId: string;
  configs: Array<GraphQLRequestConfig | RestRequestConfig>;
  cookieName?: string;
}

export const TEST_CASE_COOKIE_NAME = 'test-case';

export const createTestCaseMock = ({
  caseId,
  cookieName = TEST_CASE_COOKIE_NAME,
  configs,
  baseUrl = '/api/tester',
  name = `case/${caseId}`,
  interceptors = []
}: CreateTestCaseMockParams): MockServerComponent => ({
  baseUrl,
  name,
  configs: configs.map((config) => ({
    ...config,
    routes: config.routes.map((route) => {
      const cookies = route.entities?.cookies;

      if (typeof cookies === 'function') {
        throw new TypeError('createTestCaseMock cannot extend a cookies comparator');
      }

      return {
        ...route,
        entities: {
          ...route.entities,
          cookies: {
            ...cookies,
            [cookieName]: caseId
          }
        }
      };
    })
  })) as Array<GraphQLRequestConfig | RestRequestConfig>,
  interceptors
});

export const setTestCase = async (page: Page, caseId: string, cookieName = TEST_CASE_COOKIE_NAME) =>
  cookie.setItem(page, cookieName, caseId, {
    domain: 'localhost',
    path: '/'
  });
