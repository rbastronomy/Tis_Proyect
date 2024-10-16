import { Lucia } from "lucia";
import { NodePostgresAdapter } from "@lucia-auth/adapter-postgresql";
import { db } from "../db/database.js";
import dotenv from 'dotenv';
import process from 'process';
import pg from 'pg';

class Auth {
    
    //attributes
    provider;

    //methods
    constructor() {
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

        this.provider = new Lucia(adapter, {
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

    }

    static verifySession = async (sessionId) => {
        const { session, user } = await this.provider.validateSession(sessionId);
        return { session, user };

    }

    createSession = async (userId) => {
        return await this.provider.createSession(userId);
    }

    invalidateSession = async (sessionId) => {
        return await this.provider.invalidateSession(sessionId);
    }

    invalidateAllSessions = async (userId) => {
        return await this.provider.invalidateUserSessions(userId);
    }

}

const auth = new Auth();
Object.freeze(auth);

export default auth;