import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

/**
 * Document client = normal JS objects instead of DynamoDB types
 */
export const db = DynamoDBDocumentClient.from(client);

/**
 * SST injects this automatically when you attach permissions
 */
export const TABLE_NAME = process.env.APP_TABLE_NAME!;
