declare module '@siberiacancode/eslint' {
  declare type Eslint = (
    options?: import('@antfu/eslint-config').OptionsConfig & {
      jsxA11y?: boolean;
      next?: boolean;
    } & import('@antfu/eslint-config').TypedFlatConfigItem,
    ...userConfigs: import('@antfu/eslint-config').Awaitable<
      | import('@antfu/eslint-config').FlatConfigComposer<any, any>
      | import('@antfu/eslint-config').TypedFlatConfigItem
      | import('@antfu/eslint-config').TypedFlatConfigItem[]
      | Linter.Config[]
    >[]
  ) => import('@antfu/eslint-config').FlatConfigComposer<
    import('@antfu/eslint-config').TypedFlatConfigItem,
    import('@antfu/eslint-config').ConfigNames
  >;

  export const eslint: Eslint;
}
