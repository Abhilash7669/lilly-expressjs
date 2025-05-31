import { connect } from "mongoose";
import { DB_URI, NODE_ENV } from "../config/env";

export default async function connectToDatabase(): Promise<void> {
  if (!DB_URI) throw new Error("No DB_URI detected");

  try {
    await connect(DB_URI);
    console.log(`Connected to DB_URI: ${DB_URI} in: ${NODE_ENV}`);
  } catch (error) {
    console.error(`Could not connect: ${error}`);
    process.exit(1);
  }
}
