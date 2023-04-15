import { LensClient, development } from '@lens-protocol/client';

function newLensClient(): LensClient {
  return new LensClient({
    environment: development,
  });
}

export { newLensClient };
