import { NodePostgresAdapter } from '@lucia-auth/adapter-postgresql';

export class CustomPostgresAdapter extends NodePostgresAdapter {
    async getUserFromSessionId(sessionId) {
        console.log('Getting user from session ID:', sessionId);
        const result = await this.controller.get(
            `SELECT ${this.escapedUserTableName}.*, ${this.escapedUserTableName}.rut as id 
             FROM ${this.escapedSessionTableName} 
             INNER JOIN ${this.escapedUserTableName} 
             ON ${this.escapedUserTableName}.rut = ${this.escapedSessionTableName}.user_id 
             WHERE ${this.escapedSessionTableName}.id = $1`,
            [sessionId]
        );
        
        console.log('User query result:', result);
        if (!result) return null;
        const transformed = this.transformIntoDatabaseUser(result);
        console.log('Transformed user:', transformed);
        return transformed;
    }

    async getSession(sessionId) {
        console.log('Getting session:', sessionId);
        const result = await this.controller.get(
            `SELECT * FROM ${this.escapedSessionTableName} WHERE id = $1`,
            [sessionId]
        );
        console.log('Session query result:', result);
        if (!result) return null;
        return {
            id: result.id,
            userId: result.user_id,
            expiresAt: new Date(result.expires_at),
            attributes: {}
        };
    }

    transformIntoDatabaseUser(raw) {
        const { rut, ...attributes } = raw;
        return {
            id: rut.toString(), // Convert rut to string as Lucia expects string IDs
            attributes
        };
    }
} 