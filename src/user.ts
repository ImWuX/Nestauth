import bcrypt from "bcryptjs";
import db from "./database";

class User {

    private id: number;
    private username: string;
    private rank: string;
    private hashedPassword: string;

    constructor(id: number, username: string, rank: string, hashedPassword: string) {
        this.id = id;
        this.username = username;
        this.rank = rank;
        this.hashedPassword = hashedPassword;
    }

    testPassword(password: string): Promise<boolean> {
        return new Promise((resolve) => {
            bcrypt.compare(password, this.hashedPassword, async (err, isMatch) => {
                if(err) throw err;
                return resolve(isMatch);
            });
        });
    }

    async update(username: string, rank: string): Promise<void> {
        if(username) this.username = username;
        if(rank) this.rank = rank;
        await db.updateUser(this.id, this.username, this.rank);
    }

    async delete(): Promise<void> {
        await db.deleteUser(this.id);
    }

    getId(): number {
        return this.id;
    }

    getUsername(): string {
        return this.username;
    }

    getRank(): string {
        return this.rank;
    }

    static async create(username: string, password: string): Promise<User> {
        let hashedPassword: string = await new Promise((resolve) => {
            bcrypt.genSalt(10, (err, salt) => {
                if(err) throw err;
                bcrypt.hash(password, salt, (err, hash) => {
                    if(err) throw err;
                    resolve(hash);
                }); 
            });
        });
        return await db.insertUser(username, hashedPassword);
    }

    static async getByUsername(username: string): Promise<User | null> {
        return await db.selectUserByUsername(username);
    }

    static async getById(id: number): Promise<User | null> {
        return await db.selectUserById(id);
    }

}

export default User;