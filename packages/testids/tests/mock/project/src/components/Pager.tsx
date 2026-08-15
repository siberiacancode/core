import { TESTIDS } from '../constants/testids';

export const Pager = () => (
  <nav>
    <button data-testid={TESTIDS.clickable.button.next}>next</button>
    <button data-testid={TESTIDS.clickable.button.prev}>prev</button>
    <select data-testid={TESTIDS.changeable.select[name]} />
  </nav>
);
