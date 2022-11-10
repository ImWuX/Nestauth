import mariadb from "mariadb";
import Session from "./session";
import Totp from "./totp";
import User from "./user";
import Site from "./site";

const pool = mariadb.createPool({
    host: process.env.DATABASE_IP,
    port: Number(process.env.DATABASE_PORT),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DB,
    connectionLimit: 5
});

// Session
async function insertSession(user: User, secret: string, expires: number, ip: string | null): Promise<Session> {
    let conn = await pool.getConnection();
    let res = await conn.query("INSERT INTO sessions (user_id, session_secret, expires, ip) VALUES (?, ?, ?, ?)", [user.getId(), secret, expires, ip]);
    conn.release();
    return new Session(res.insertId, user, secret, expires, ip, false);
}

async function selectSession(secret: string): Promise<Session | null> {
    let conn = await pool.getConnection();
    let rows = await conn.query("SELECT sessions.*, users.username, users.password, users.rank FROM sessions INNER JOIN users ON sessions.user_id = users.id WHERE sessions.session_secret = ?", [secret]);
    conn.release();
    if(rows.length <= 0) return null;
    let user = new User(rows[0].user_id, rows[0].username, rows[0].rank, rows[0].password);
    return new Session(rows[0].id, user, rows[0].session_secret, rows[0].expires, rows[0].ip, rows[0].invalidated);
}

async function invalidateSession(session: Session): Promise<void> {
    let conn = await pool.getConnection();
    await conn.query("UPDATE sessions SET invalidated = 1 WHERE id = ?", [session.getId()]);
    conn.release();
}

async function invalidateUserIpSessions(user: User, ip: string): Promise<void> {
    let conn = await pool.getConnection();
    await conn.query("UPDATE sessions SET invalidated = 1 WHERE user_id = ? AND ip = ?", [user.getId(), ip]);
    conn.release();
}

// User
async function insertUser(username: string, hashedPassword: string): Promise<User> {
    let conn = await pool.getConnection();
    let res = await conn.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword]);
    conn.release();
    return new User(res.insertId, username, "user", hashedPassword);
}

async function updateUser(id: number, username: string, rank: string): Promise<void> {
    let conn = await pool.getConnection();
    await conn.query("UPDATE users SET username = ?, rank = ? WHERE id = ?", [username, rank, id]);
    conn.release();
}

async function deleteUser(id: number): Promise<void> {
    let conn = await pool.getConnection();
    await conn.query("DELETE FROM users WHERE id = ?", [id]);
    conn.release();
}

async function selectUserByUsername(username: string): Promise<User | null> {
    let conn = await pool.getConnection();
    let rows = await conn.query("SELECT * FROM users WHERE username = ?", [username]);
    conn.release();
    if(rows.length <= 0) return null;
    return new User(rows[0].id, rows[0].username, rows[0].rank, rows[0].password);
}

async function selectUserById(id: number): Promise<User | null> {
    let conn = await pool.getConnection();
    let rows = await conn.query("SELECT * FROM users WHERE id = ?", [id]);
    conn.release();
    if(rows.length <= 0) return null;
    return new User(rows[0].id, rows[0].username, rows[0].rank, rows[0].password);
}

async function selectUsers(): Promise<User[]> {
    let conn = await pool.getConnection();
    let rows = await conn.query("SELECT * FROM users");
    conn.release();
    let users: User[] = []
    rows.forEach((row: any) => {
        users.push(new User(row.id, row.username, row.rank, row.password));
    });
    return users;
}

// Totp
async function insertTotp(user: User, secret: string, backupCodes: string): Promise<Totp> {
    let conn = await pool.getConnection();
    await conn.query("INSERT INTO totp (user_id, secret, backup_codes) VALUES (?, ?, ?)", [user.getId(), secret, backupCodes]);
    conn.release();
    return new Totp(user, secret, backupCodes, false);
}

async function selectTotp(user: User): Promise<Totp | null> {
    let conn = await pool.getConnection();
    let rows = await conn.query("SELECT * FROM totp WHERE user_id = ?", [user.getId()]);
    conn.release();
    if(rows.length <= 0) return null;
    return new Totp(user, rows[0].secret, rows[0].backup_codes, rows[0].enabled);
}

async function updateBackupCodes(user: User, codes: string): Promise<void> {
    let conn = await pool.getConnection();
    await conn.query("UPDATE totp SET backup_codes = ? WHERE user_id = ?", [codes, user.getId()]);
    conn.release();
}

async function enableTotp(user: User): Promise<void> {
    let conn = await pool.getConnection();
    await conn.query("UPDATE totp SET enabled = 1 WHERE user_id = ?", [user.getId()]);
    conn.release();
}

async function deleteTotp(user: User): Promise<void> {
    let conn = await pool.getConnection();
    await conn.query("DELETE FROM totp WHERE user_id = ?", [user.getId()]);
    conn.release();
}

// Sites
async function selectSites(): Promise<Site[]> {
    let conn = await pool.getConnection();
    let rankRows = await conn.query("SELECT * FROM sites_auth");
    let siteRows = await conn.query("SELECT * FROM sites");
    conn.release();

    let ranks: {[key: number]: string[]} = {};
    rankRows.forEach((row: any) => {
        if(!ranks[row.site_id]) ranks[row.site_id] = [];
        ranks[row.site_id].push(row.rank);
    });

    let sites: Site[] = [];
    siteRows.forEach((row: any) => sites.push(new Site(row.id, row.subdomain, ranks[row.id] ? ranks[row.id] : [])));
    return sites;
}

async function addSite(subdomain: string): Promise<Site> {
    let conn = await pool.getConnection();
    let res = await conn.query("INSERT INTO sites (subdomain) VALUES (?)", [subdomain]);
    conn.release();
    return new Site(res.insertId, subdomain, []);
}

async function deleteSite(id: number): Promise<void> {
    let conn = await pool.getConnection();
    await conn.query("DELETE FROM sites_auth WHERE site_id = ?", [id]);
    await conn.query("DELETE FROM sites WHERE id = ?", [id]);
    conn.release();
}

async function selectSiteBySubdomain(subdomain: string): Promise<Site | null> {
    let conn = await pool.getConnection();
    let rankRows = await conn.query("SELECT * FROM sites_auth WHERE site_id = (SELECT id FROM sites WHERE subdomain = ?)", [subdomain]);
    let siteRows = await conn.query("SELECT * FROM sites WHERE subdomain = ?", [subdomain]);
    conn.release();
    if(siteRows.length <= 0) return null;
    let ranks: string[] = [];
    rankRows.forEach((rankRow: any) => ranks.push(rankRow.rank));
    return new Site(siteRows[0].id, siteRows[0].subdomain, ranks);
}

async function selectSiteById(id: number): Promise<Site | null> {
    let conn = await pool.getConnection();
    let rankRows = await conn.query("SELECT * FROM sites_auth WHERE site_id = ?", [id]);
    let siteRows = await conn.query("SELECT * FROM sites WHERE id = ?", [id]);
    conn.release();
    if(siteRows.length <= 0) return null;
    let ranks: string[] = [];
    rankRows.forEach((rankRow: any) => ranks.push(rankRow.rank));
    return new Site(siteRows[0].id, siteRows[0].subdomain, ranks);
}

async function updateSiteSubdomain(id: number, subdomain: string): Promise<void> {
    let conn = await pool.getConnection();
    await conn.query("UPDATE sites SET subdomain = ? WHERE id = ?", [subdomain, id]);
    conn.release();
}

async function insertSiteRank(siteId: number, rank: string) {
    let conn = await pool.getConnection();
    await conn.query("INSERT INTO sites_auth (site_id, rank) VALUES (?, ?)", [siteId, rank]);
    conn.release();
}

async function deleteSiteRank(siteId: number, rank: string) {
    let conn = await pool.getConnection();
    await conn.query("DELETE FROM sites_auth WHERE site_id = ? AND rank = ?", [siteId, rank]);
    conn.release();
}

export default {
    insertSession,
    selectSession,
    invalidateSession,
    invalidateUserIpSessions,

    insertUser,
    updateUser,
    deleteUser,
    selectUserByUsername,
    selectUserById,
    selectUsers,

    insertTotp,
    selectTotp,
    enableTotp,
    deleteTotp,
    updateBackupCodes,

    addSite,
    deleteSite,
    selectSites,
    selectSiteBySubdomain,
    selectSiteById,
    updateSiteSubdomain,
    insertSiteRank,
    deleteSiteRank
}