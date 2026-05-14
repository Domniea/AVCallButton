import { Cron, StackContext } from "sst/constructs";

const CRON_FUNCTION_DEFAULTS = {
  environment: {
    DATABASE_URL: process.env.DATABASE_URL!,
  },
  timeout: 120,
  nodejs: {
    install: ["@prisma/client"],
    esbuild: {
      external: ["@prisma/client", ".prisma/client"],
    },
  },
};

/**
 * EventBridge-scheduled Lambdas. Add more `new Cron(...)` entries here as needed.
 */
export function CronStack({ stack }: StackContext) {
  new Cron(stack, "ExpireInvites", {
    schedule: "rate(1 day)",
    job: {
      function: {
        handler: "src/functions/jobs/expireInvites.handler",
        ...CRON_FUNCTION_DEFAULTS,
      },
    },
  });
}
