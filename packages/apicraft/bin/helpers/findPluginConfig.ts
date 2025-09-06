import type { ApicraftOption, InstancePluginNameSchema } from '../schemas';

export const findPluginConfig = (
  plugins: ApicraftOption['plugins'],
  target: InstancePluginNameSchema
) =>
  plugins?.find(
    (plugin) =>
      (typeof plugin === 'string' && plugin === target) ||
      (typeof plugin === 'object' && plugin.name === target)
  );
