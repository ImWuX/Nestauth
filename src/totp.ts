import { authenticator } from 'otplib';
import crypto from "crypto";
import db from "./database";
import User from './user';

class Totp {

    private user: User;
    private secret: string;
    private backupCodes: string;
    private enabled: boolean;

    constructor(user: User, secret: string, backupCodes: string, enabled: boolean) {
        this.user = user;
        this.secret = secret;
        this.backupCodes = backupCodes;
        this.enabled = enabled;
    }

    async enable(): Promise<void>  {
        if(this.enabled) return;
        this.enabled = true;
        db.enableTotp(this.user);
    }

    async delete(): Promise<void> {
        db.deleteTotp(this.user);
    }

    useCode(code: string): boolean {
        let codes: string[] = JSON.parse(this.backupCodes);
        for(let i = 0; i < codes.length; i++) {
            if(codes[i] != code) continue;
            codes.splice(i, 1);
            db.updateBackupCodes(this.user, JSON.stringify(codes));
            return true;
        }
        return authenticator.check(code, this.secret);
    }

    getUser(): User {
        return this.user;
    }

    getBackupCodes(): string {
        return this.backupCodes;
    }

    getEnabled(): boolean {
        return this.enabled;
    }

    getUrl(): string {
        return authenticator.keyuri(this.user.getUsername(), "NestAuth", this.secret);
    }

    static async create(user: User): Promise<Totp> {
        let secret = authenticator.generateSecret();
        let codes = [];
        for(let i = 0; i < 6; i++)
            codes.push(crypto.randomBytes(8).toString("hex"));
        let codeString = JSON.stringify(codes);
        return await db.insertTotp(user, secret, codeString);
    }

    static async getByUser(user: User): Promise<Totp | null> {
        return await db.selectTotp(user);
    }

}

export default Totp;