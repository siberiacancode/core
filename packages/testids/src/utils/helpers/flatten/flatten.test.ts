import { describe, expect, it } from 'vitest';

import { DEFAULT_NAME, DEFAULT_SEPARATOR } from '../../constants';
import { flatten } from './flatten';

const tree = {
  clickable: {
    button: ['next', 'prev'],
    modal: {
      close: null
    }
  },
  changeable: {
    input: ['email']
  },
  static: {
    label: ['title']
  }
};

const flattenTree = (options?: Partial<Parameters<typeof flatten>[1]>) =>
  flatten(tree, {
    name: DEFAULT_NAME,
    separator: DEFAULT_SEPARATOR,
    ...options
  });

describe('flatten: nodes', () => {
  it('Should join the path with a separator', () => {
    expect(flattenTree().map((node) => node.id)).toStrictEqual([
      'clickable-button-next',
      'clickable-button-prev',
      'clickable-modal-close',
      'changeable-input-email',
      'static-label-title'
    ]);
  });

  it('Should treat both array items and null values as leaves', () => {
    const nodes = flattenTree();

    expect(nodes.find((node) => node.id === 'clickable-button-next')?.path).toStrictEqual([
      'clickable',
      'button',
      'next'
    ]);
    expect(nodes.find((node) => node.id === 'clickable-modal-close')?.path).toStrictEqual([
      'clickable',
      'modal',
      'close'
    ]);
  });

  it('Should build the accessor from the constant name', () => {
    expect(flattenTree({ name: 'DTI' })[0].accessor).toBe('DTI.clickable.button.next');
  });

  it('Should honour a custom separator', () => {
    expect(flattenTree({ separator: '_' })[0].id).toBe('clickable_button_next');
  });

  it('Should normalize node id to lower case and keep keys as declared', () => {
    const nodes = flatten(
      {
        Clickable: {
          Button: ['Next']
        }
      },
      {
        name: DEFAULT_NAME,
        separator: DEFAULT_SEPARATOR
      }
    );

    expect(nodes[0]).toMatchObject({
      accessor: 'TESTIDS.Clickable.Button.Next',
      group: 'Clickable',
      id: 'clickable-button-next',
      path: ['Clickable', 'Button', 'Next']
    });
  });
});
