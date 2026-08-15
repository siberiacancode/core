import { describe, expect, it } from 'vitest';

import { DEFAULT_NAME, DEFAULT_SEPARATOR } from '../../constants';
import { flatten } from '../flatten/flatten';
import { validate } from './validate';

const issues = (tree: Parameters<typeof flatten>[0], separator = DEFAULT_SEPARATOR) =>
  validate(flatten(tree, { name: DEFAULT_NAME, separator }), { separator });

const messages = (tree: Parameters<typeof flatten>[0], separator = DEFAULT_SEPARATOR) =>
  issues(tree, separator).map((issue) => issue.message);

describe('validate', () => {
  it('Should pass a well formed schema', () => {
    expect(
      issues({
        clickable: {
          button: ['next']
        },
        changeable: {
          input: ['email']
        },
        static: {
          label: ['title']
        }
      })
    ).toStrictEqual([]);
  });

  it('Should accept any root group', () => {
    expect(
      issues({
        anything: {
          card: ['root']
        },
        whatever: {
          x: ['y']
        }
      })
    ).toStrictEqual([]);
  });

  it('Should reject a segment containing the separator', () => {
    expect(
      messages({
        clickable: {
          button: ['next-step']
        }
      })
    ).toContainEqual(expect.stringContaining('contains the separator "-"'));
  });

  it('Should reject a non alphanumeric segment', () => {
    expect(
      messages({
        clickable: {
          button: ['next step']
        }
      })
    ).toContainEqual(expect.stringContaining('must be alphanumeric'));
  });

  it('Should reject a bare group', () => {
    expect(
      messages({
        clickable: null
      })
    ).toContainEqual(expect.stringContaining('is a bare group'));
  });

  it('Should reject duplicate ids', () => {
    expect(
      messages({
        clickable: {
          button: ['next', 'next']
        }
      })
    ).toContainEqual(expect.stringContaining('duplicate id "clickable-button-next"'));
  });
});
