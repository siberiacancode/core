import type { DefinePlugin, IR } from '@hey-api/openapi-ts';

interface WalkEvent {
  method: keyof IR.PathItemObject;
  operation: IR.OperationObject;
  path: string;
  type: 'operation';
}

export const removeRequestsBaseUrl = (plugin: DefinePlugin['Instance'], baseUrl: string) => {
  const originalForEach = plugin.forEach.bind(plugin);

  plugin.forEach = ((...args: Parameters<typeof plugin.forEach>) => {
    const callback = args[args.length - 1];
    if (typeof callback !== 'function') return originalForEach(...args);

    const events = args.slice(0, -1);

    return originalForEach(
      ...([
        ...events,
        (event: WalkEvent) => {
           
          if (event.type === 'operation') {
            const newPath = event.operation.path.replace(new RegExp(`^${baseUrl}`), '');
            event.operation.path = newPath.startsWith('/')
              ? (newPath as `/${string}`)
              : `/${newPath}`;
          }

          callback(event);
        }
      ] as Parameters<typeof plugin.forEach>)
    );
  }) as typeof plugin.forEach;
};
