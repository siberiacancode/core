export type TestidCase = 'lower' | 'preserve' | 'upper';

export interface TestidNode {
  /** @description constant access path, eg 'TESTIDS.clickable.button.next' */
  accessor: string;
  /** @description root segment, eg 'clickable' */
  group: string;
  /** @description generated attribute value, eg 'clickable-button-next' */
  id: string;
  /** @description full segment path, eg ['clickable', 'button', 'next'] */
  path: string[];
}

export interface TestidTree {
  [key: string]: string[] | TestidTree | null;
}

export interface TestidIssue {
  level: 'error' | 'warning';
  message: string;
  path: string[];
}

export interface TestidsOptions {
  /** @description attribute stripped from JSX/object literals @default 'data-testid' */
  attribute?: string;
  /** @description casing applied to the generated id value @default 'preserve' */
  case?: TestidCase;
  /** @description path to the yaml schema @default 'testids.yaml' */
  input?: string;
  /** @description exported constant name @default 'TESTIDS' */
  name?: string;
  /** @description path to the generated constants file @default 'src/constants/testids.ts' */
  output?: string;
  /** @description separator between path segments @default '-' */
  separator?: string;
}

export interface TestidUsage extends TestidNode {
  files: string[];
  status: 'unused' | 'used';
}
