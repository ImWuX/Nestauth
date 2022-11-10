import "dotenv/config";
import path from "path";
import express, { NextFunction, Request, Response } from "express";
import http from "http";
import cookieParser from "cookie-parser";
import Session from "./session";
import Site from "./site";

import AuthRoutes from "./routes/auth";
import TotpRoutes from "./routes/totp";
import UserRoutes from "./routes/users";
import SiteRoutes from "./routes/sites";

declare global {
    namespace Express {
        interface Request {
            session: Session,
        }
    }

    namespace NodeJS {
        interface ProcessEnv {
            DATABASE_IP: string;
            DATABASE_PORT: string;
            DATABASE_USER: string;
            DATABASE_PASSWORD: string;
            DATABASE_DB: string;
            SESSION_EXPIRY: string;
            ADMINRANK: string;
            PORT: string;
        }
    }
}

class UserError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export { UserError };

// Init ⭐
const app = express();
const server = http.createServer(app);

app.use(cookieParser());
app.use(express.json());

app.use(async (req: Request, res: Response, next: NextFunction) => {
    if(!req.cookies.nestauth_session) return next();
    try {
        let session = await Session.getBySecret(req.cookies.nestauth_session);
        if(!session || !session.isValid()) return next();
        req.session = session;
    } catch(err) {
        console.error(err);
    }
    next();
});

// Route for NGINX authentication
app.get("/nginxauth", async (req: Request, res: Response) => {
    if(!req.session) return res.sendStatus(401);
    if(!req.subdomains || req.subdomains.length <= 0) return res.sendStatus(400);
    try {
        let site = await Site.getBySubdomain(req.subdomains[0]);
        if(site == null) return res.sendStatus(404);
        if(!site.getRanks().includes(req.session.getUser().getRank())) return res.sendStatus(403);
        res.sendStatus(200);
    } catch(err) {
        console.error(err);
        res.sendStatus(500);
    }
});

// Main routes
app.use("/api/auth", AuthRoutes);
app.use("/api/totp", TotpRoutes);
app.use("/api/sites", SiteRoutes);
app.use("/api/users", UserRoutes);

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if(!(err instanceof UserError)) console.error(err);
    res.send({
        error: true,
        message: err instanceof UserError ? err.message : "Internal server error. Try again"
    });
});

// React app
app.use(express.static(path.join(__dirname, "frontend")));
app.get("*", async (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

server.listen(Number(process.env.PORT), () => {
    console.log("Serving Nestauth");
});
