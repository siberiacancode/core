import type { Arguments } from 'yargs';

import * as z from 'zod';

const apiSchema = z
  .object({
    input: z.string(),
    output: z.string(),
    types: z.boolean().optional(),
    axios: z.boolean().optional()
  })
  .strict();

// TODO: why add 'schema' for types?
export const configSchema = z.array(apiSchema);
export type ConfigSchema = z.infer<typeof configSchema>;

// TODO: what argv we need?
export const argvSchema = z
  .object({
    // config: z.string().optional()
  })
  .strict();
export type ArgvSchema = Arguments<z.infer<typeof argvSchema>>;

// TODO: init command take every config property for now
export const initOptionsSchema = configSchema;
export type InitOptionsSchema = z.infer<typeof initOptionsSchema>;
