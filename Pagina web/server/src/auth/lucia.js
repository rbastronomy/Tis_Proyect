
import { Lucia } from "lucia";
import { NodePostgresAdapter } from "@lucia-auth/adapter-postgresql";
import { db } from "../db/database.js";
import dotenv from 'dotenv';
import process from 'process';
import pg from 'pg';

// Load environment variables
dotenv.config();

// Create a new pg pool using the same connection details as Knex
const pgPool = new pg.Pool(db.client.config.connection);

// Create the adapter using the pg pool
const adapter = new NodePostgresAdapter(pgPool, {
  user: "auth_user",
  session: "user_session"
});

const isProduction = process.env.NODE_ENV === "production";

export const lucia = new Lucia(adapter, {
  env: isProduction ? "PROD" : "DEV",
  sessionCookie: {
    attributes: {
      secure: isProduction
    }
  },
  getUserAttributes: (data) => {
    return {
      username: data.username
    };
  }
});
