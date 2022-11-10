import express, { NextFunction, Request, Response } from "express";
import { UserError } from "../index";
import Session from "../session";
import Totp from "../totp";
import User from "../user";

const router = express.Router();

// Auth Flow 😆
router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
    try {
        if(!req.body.username || !req.body.password) throw new UserError("Incomplete or invalid query");

        let user = await User.getByUsername(req.body.username);
        if(!user || !await user.testPassword(req.body.password)) throw new UserError("Invalid username/password");

        let totp = await Totp.getByUser(user);
        if(totp && totp.getEnabled()) {
            if(!req.body.totp) return res.send({ totp: true });
            if(!totp.useCode(req.body.totp)) throw new UserError("Invalid code. Try again");
        }

        let session = await Session.create(user, !req.headers["x-real-ip"] || typeof req.headers["x-real-ip"] != "string" ? null : req.headers["x-real-ip"]);
        return res.send({ sessionSecret: session.getSecret(), expires: session.getExpires() });
    } catch(err) {
        next(err);
    }
});

router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
    try {
        if(!req.body.username || !req.body.password) throw new UserError("Incomplete or invalid query");

        if(req.body.username.length >= 16) throw new UserError("Username is too long (max 16 characters)");
        if(req.body.username.length <= 3) throw new UserError("Username is too short (min 3 characters)");
        if(req.body.password.length <= 8 || req.body.password.length >= 32) throw new UserError("Password must be between 8 and 32 characters");
        if(await User.getByUsername(req.body.username)) throw new UserError("That username is taken");

        let user = await User.create(req.body.username, req.body.password);
        let session = await Session.create(user, !req.headers["x-real-ip"] || typeof req.headers["x-real-ip"] != "string" ? null : req.headers["x-real-ip"]);
        return res.send({ sessionSecret: session.getSecret(), expires: session.getExpires() });
    } catch(err) {
        next(err);
    }
});

router.get("/state", async (req: Request, res: Response, next: NextFunction) => {
    try {
        if(!req.session) return res.send({ auth: false });
        let totp = await Totp.getByUser(req.session.getUser());

        res.send({
            auth: true,
            isAdmin: req.session.getUser().getRank() == process.env.ADMINRANK,
            session: {
                ip: req.session.getIp(),
                expires: req.session.getExpires()
            },
            user: {
                username: req.session.getUser().getUsername(),
                rank: req.session.getUser().getRank()
            },
            totp: {
                enabled: totp != null && totp.getEnabled()
            }
        });
    } catch(err) {
        next(err);
    }
});

router.post("/logout", async (req: Request, res: Response, next: NextFunction) => {
    try {
        if(!req.session) throw new UserError("Not authenticated");
        await req.session.invalidate();
        res.send({});
    } catch(err) {
        next(err);
    }
});

export default router;
