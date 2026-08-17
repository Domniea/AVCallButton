import { App } from "sst/constructs";
import { ApiStack } from "./stacks/ApiStack";
import { CronStack } from "./stacks/CronStack";
import { StorageStack } from "./stacks/StorageStack";

export default {
  config(input: { stage?: string }) {
    return {
      name: "avcallbutton-backend",
      region: "us-east-1",
      stage: input.stage || "local",
    };
  },
  stacks(app: App) {
    app.stack(StorageStack);
    app.stack(ApiStack);
    app.stack(CronStack);
  },
};
