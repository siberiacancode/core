import * as z from 'zod';

const instanceNameSchema = z.enum(['fetches', 'axios']);
const instanceSchema = z.object({
  name: instanceNameSchema,
  runtimeInstancePath: z.string().optional()
});

const pathSchema = z.string().regex(/^[^/.].*[^/]$/, 'Path must be absolute');

const includeExcludeSchema = z.object({
  exclude: z.array(z.string()).readonly().optional(),
  include: z.array(z.string()).readonly().optional()
});

const filtersSchema = z.object({
  deprecated: z.boolean().default(true).optional(),
  operations: includeExcludeSchema.optional(),
  orphans: z.boolean().default(false).optional(),
  parameters: includeExcludeSchema.optional(),
  preserveOrder: z.boolean().default(false).optional(),
  requestBodies: includeExcludeSchema.optional(),
  responses: includeExcludeSchema.optional(),
  schemas: includeExcludeSchema.optional(),
  tags: includeExcludeSchema.optional()
});

const enumsModeSchema = z.enum(['root', 'inline']);
const stringCaseSchema = z.enum(['camelCase', 'PascalCase', 'preserve', 'snake_case']);
const stringNameSchema = z.union([z.string(), z.function()]);

const parserTransformsSchema = z
  .object({
    enums: z
      .union([
        z.boolean(),
        enumsModeSchema,
        z.object({
          case: stringCaseSchema.optional(),
          enabled: z.boolean().optional(),
          mode: enumsModeSchema.optional(),
          name: stringNameSchema.optional()
        })
      ])
      .optional(),
    readWrite: z
      .union([
        z.boolean(),
        z.object({
          enabled: z.boolean().optional(),
          requests: z
            .union([
              stringNameSchema,
              z.object({ case: stringCaseSchema.optional(), name: stringNameSchema.optional() })
            ])
            .optional(),
          responses: z
            .union([
              stringNameSchema,
              z.object({ case: stringCaseSchema.optional(), name: stringNameSchema.optional() })
            ])
            .optional()
        })
      ])
      .optional()
  })
  .optional();

const parserSchema = z
  .object({
    filters: filtersSchema.optional(),
    hooks: z.record(z.string(), z.any()).optional(),
    pagination: z
      .object({
        keywords: z.array(z.string()).readonly().optional()
      })
      .optional(),
    patch: z.record(z.string(), z.any()).optional(),
    transforms: parserTransformsSchema,
    validate_EXPERIMENTAL: z.union([z.boolean(), z.enum(['strict', 'warn'])]).optional()
  })
  .strict()
  .optional();

const pluginNameSchema = z.enum([
  '@hey-api/client-angular',
  '@hey-api/client-axios',
  '@hey-api/client-fetch',
  '@hey-api/client-next',
  '@hey-api/client-nuxt',
  'legacy/angular',
  'legacy/axios',
  'legacy/fetch',
  'legacy/node',
  'legacy/xhr',
  '@angular/common',
  '@hey-api/schemas',
  '@hey-api/sdk',
  '@hey-api/transformers',
  '@hey-api/typescript',
  '@pinia/colada',
  '@tanstack/angular-query-experimental',
  '@tanstack/react-query',
  '@tanstack/solid-query',
  '@tanstack/svelte-query',
  '@tanstack/vue-query',
  'fastify',
  'valibot',
  'tanstack',
  'zod'
]);

export const apicraftOptionSchema = z
  .object({
    input: z
      .function()
      .output(z.any())
      .or(
        pathSchema.or(
          z.object({
            path: pathSchema.or(z.record(z.string(), z.unknown())),
            fetch: z.record(z.string(), z.any()).optional(),
            watch: z
              .boolean()
              .or(z.number())
              .or(
                z.object({
                  enabled: z.boolean().optional(),
                  interval: z.number().optional(),
                  timeout: z.number().optional()
                })
              )
              .optional()
          })
        )
      ),
    output: pathSchema.or(
      z.object({
        path: pathSchema,
        case: z
          .union([
            z.literal('camelCase'),
            z.literal('PascalCase'),
            z.literal('preserve'),
            z.literal('snake_case')
          ])
          .optional(),
        clean: z.boolean().optional(),
        format: z.union([z.literal('biome'), z.literal('prettier'), z.literal(false)]).optional(),
        indexFile: z.boolean().optional(),
        lint: z
          .union([z.literal('biome'), z.literal('eslint'), z.literal('oxlint'), z.literal(false)])
          .optional(),
        tsConfigPath: z
          .literal('off')
          .or(z.string().and(z.object({})))
          .optional()
      })
    ),
    parser: parserSchema,
    instance: z.union([instanceNameSchema, instanceSchema]).optional(),
    nameBy: z.enum(['path', 'operationId']).default('operationId').optional(),
    groupBy: z.enum(['path', 'tag']).default('tag').optional(),
    plugins: z
      .array(pluginNameSchema.or(z.object({ name: pluginNameSchema }).passthrough()))
      .optional()
  })
  .strict();

export type ApicraftOption = z.infer<typeof apicraftOptionSchema>;

export const apicraftConfigSchema = z.array(apicraftOptionSchema);
export type ApicraftConfig = z.infer<typeof apicraftConfigSchema>;

export const generateApicraftOptionSchema = apicraftOptionSchema.partial();
export type GenerateApicraftOption = z.infer<typeof generateApicraftOptionSchema>;

export type InstanceName = z.infer<typeof instanceNameSchema>;
