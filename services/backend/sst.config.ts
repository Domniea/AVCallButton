import type { SSTConfig } from "sst";
import { ApiStack } from "./stacks/ApiStack";

export default {
  config(input) {
    return {
      name: "avcallbutton-backend",
      region: "us-east-1",
    };
  },
   stacks(app) {
    app.stack(ApiStack);
  },
} satisfies SSTConfig;