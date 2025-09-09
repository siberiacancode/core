import * as z from 'zod';

const instanceNameSchema = z.enum(['fetches', 'axios']);
const instanceSchema = z.object({
  name: instanceNameSchema,
  runtimeInstancePath: z.string().optional()
});

const pathSchema = z.string().regex(/^[^/.].*[^/]$/, 'Path must be absolute');

export const apicraftOptionSchema = z
  .object({
    input: pathSchema.or(
      z.object({
        path: pathSchema.or(z.record(z.unknown())),
        fetch: z.record(z.any()).optional(),
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
    include: z.array(z.string()).optional(),
    exclude: z.array(z.string()).optional(),
    instance: z.union([instanceNameSchema, instanceSchema]).optional()
  })
  .strict();
export type ApicraftOption = z.infer<typeof apicraftOptionSchema>;

export const apicraftConfigSchema = z.array(apicraftOptionSchema);
export type ApicraftConfig = z.infer<typeof apicraftConfigSchema>;

export const generateApicraftOptionSchema = apicraftOptionSchema.partial();
export type GenerateApicraftOption = z.infer<typeof generateApicraftOptionSchema>;

export type InstanceName = z.infer<typeof instanceNameSchema>;
