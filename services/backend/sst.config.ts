// import type { SSTConfig } from "sst";
// import { ApiStack } from "./stacks/ApiStack";

// export default {
//   config(input) {
//     return {
//       name: "avcallbutton-backend",
//       region: "us-east-1",
//     };
//   },
//    stacks(app) {
//     app.stack(ApiStack);
//   },
// } satisfies SSTConfig;

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
