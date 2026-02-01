import { StackContext, Table } from "sst/constructs";

export function DatabaseStack({ stack }: StackContext) {
  const table = new Table(stack, "AppTable", {
    fields: {
      pk: "string",
      sk: "string",
    },
    primaryIndex: {
      partitionKey: "pk",
      sortKey: "sk",
    },
  });

  return { table };
}
