import { App } from "sst/constructs";
import { ApiStack } from "./stacks/ApiStack";
import { CronStack } from "./stacks/CronStack";

export default {
  config(input: { stage?: string }) {
    return {
      name: "avcallbutton-backend",
      region: "us-east-1",
      stage: input.stage || "dev",
    };
  },
  stacks(app: App) {
    app.stack(ApiStack);
    app.stack(CronStack);
  },
};
