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
