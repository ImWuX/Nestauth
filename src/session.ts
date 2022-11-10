import crypto from "crypto";
import db from "./database";
import User from "./user";

class Session {

    private id: number;
    private user: User;
    private secret: string;
    private expires: number;
    private ip: string | null;
    private invalidated: boolean;

    constructor(id: number, user: User, secret: string, expires: number, ip: string | null, invalidated: boolean) {
        this.id = id;
        this.user = user;
        this.secret = secret;
        this.expires = expires;
        this.ip = ip;
        this.invalidated = invalidated;
    }

    isValid(): boolean {
        return !this.invalidated && !(this.expires <= Math.floor(new Date().getTime() / 1000));
    }

    async invalidate(): Promise<void> {
        this.invalidated = true;
        await db.invalidateSession(this);
    }

    getId(): number {
        return this.id;
    }

    getUser(): User {
        return this.user;
    }

    getSecret(): string {
        return this.secret;
    }

    getExpires(): number {
        return this.expires;
    }

    getIp(): string | null {
        return this.ip;
    }

    getInvalidated(): boolean {
        return this.invalidated;
    }

    static async create(user: User, ip: string | null): Promise<Session> {
        let secret;
        do {
            secret = crypto.randomBytes(16).toString("hex");
        } while(await db.selectSession(secret) != null);

        let expires = Math.floor(new Date().getTime() / 1000) + Number(process.env.SESSION_EXPIRY);
        return await db.insertSession(user, secret, expires, ip);
    }

    static async getBySecret(secret: string): Promise<Session | null> {
        return await db.selectSession(secret);
    }

}

export default Session;