export const LEFTHOOK_PACKAGE_NAME = '@siberiacancode/lefthook';

/**
 * @description path to the shared lefthook config, relative to the consumer repo root
 * @example
 * // lefthook.yml
 * // extends:
 * //   - node_modules/@siberiacancode/lefthook/dist/lefthook.yml
 */
export const LEFTHOOK_CONFIG_PATH = `node_modules/${LEFTHOOK_PACKAGE_NAME}/dist/lefthook.yml`;

/**
 * @description path to the shipped hook scripts, relative to the consumer repo root
 */
export const LEFTHOOK_HOOKS_DIR = `node_modules/${LEFTHOOK_PACKAGE_NAME}/dist/hooks`;

export type LefthookHookName = 'commit-msg';

/**
 * @description resolves a shipped hook script path by name
 * @example
 * hook('commit-msg') // node_modules/@siberiacancode/lefthook/dist/hooks/commit-msg.sh
 */
export const hook = (name: LefthookHookName) => `${LEFTHOOK_HOOKS_DIR}/${name}.sh`;
