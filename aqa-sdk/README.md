# aqa-sdk

## How to use (local)

```ts
import AqaClient from "PATH_TO_CLIENT_PACKAGE";
import { Data } from "PATH_TO_CLIENT_PACKAGE";

const provider = new ethers.providers.Web3Provider(window.ethereum);

const aqaClient = new AqaClient(provider);
await aqaClient.authenticate();

const data: Data = {
  provider: "lenstube",
  category: "viewing history",
  contents: `{ title: "Cooking video", description: "How to cook special dishes"}`,
};

await aqaClient.saveData(data);
```
