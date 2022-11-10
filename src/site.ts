import db from "./database";

class Site {

    private id: number;
    private subdomain: string;
    private ranks: string[];

    constructor(id: number, subdomain: string, ranks: string[]) {
        this.id = id;
        this.subdomain = subdomain;
        this.ranks = ranks;
    }

    async updateSubdomain(subdomain: string): Promise<void> {
        this.subdomain = subdomain;
        await db.updateSiteSubdomain(this.id, subdomain);
    }

    async delete(): Promise<void> {
        await db.deleteSite(this.id);
    }

    getId(): number {
        return this.id;
    }

    getSubDomain(): string {
        return this.subdomain;
    }

    getRanks(): string[] {
        return this.ranks;
    }

    static async create(subdomain: string): Promise<Site> {
        return await db.addSite(subdomain);
    }

    static async getById(id: number): Promise<Site | null> {
        return await db.selectSiteById(id);
    }

    static async getBySubdomain(subdomain: string): Promise<Site | null> {
        return await db.selectSiteBySubdomain(subdomain);
    }

}

export default Site;