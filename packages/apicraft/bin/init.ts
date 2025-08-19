import { createClient } from '@hey-api/openapi-ts';

import type { InitOptionsSchema } from './utils/types';

export const init = async (options: InitOptionsSchema) => {
  try {
    for (const option of options) {
      await createClient({
        input: option.input,
        output: option.output,
        ...(option.axios && { plugins: ['@hey-api/client-axios'] })
      });
    }

    console.info('\n🎉  Generation done! Thanks for using apicraft! 🎉');
  } catch (cancelled: any) {
    console.info(cancelled?.message);
    process.exit(1);
  }
};
