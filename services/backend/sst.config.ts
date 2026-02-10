import { App } from "sst/constructs";
import { ApiStack } from "./stacks/ApiStack";
import { DatabaseStack } from "./stacks/DatabaseStack";

export default {
  config() {
    return {
      name: "avcallbutton-backend",
      region: "us-east-1",
    };
  },
  stacks(app: App) {
    app.stack(DatabaseStack);
    app.stack(ApiStack);
  },
};
