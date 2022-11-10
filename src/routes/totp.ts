import express, { NextFunction, Request, Response } from "express";
import { UserError } from "../index";
import Totp from "../totp";

const router = express.Router();

router.get("/setup", async (req: Request, res: Response, next: NextFunction) => {
    try {
        if(!req.session) throw new UserError("Not authenticated");
        let totp = await Totp.getByUser(req.session.getUser());
        if(totp && totp.getEnabled()) throw new UserError("Totp is already enabled");
        if(!totp) totp = await Totp.create(req.session.getUser());
        res.send({ codes: totp.getBackupCodes(), url: totp.getUrl() });
    } catch(err) {
        next(err);
    }
});

router.post("/enable", async (req: Request, res: Response, next: NextFunction) => {
    try {
        if(!req.session) throw new UserError("Not authenticated");
        if(!req.body.code) throw new UserError("Invalid query");
        let totp = await Totp.getByUser(req.session.getUser());
        if(!totp) throw new UserError("Totp is not enabled");
        if(!totp.useCode(req.body.code)) throw new UserError("Invalid code. Try again");
        await totp.enable();
        res.send({});
    } catch(err) {
        next(err);
    }
});

router.post("/disable", async (req: Request, res: Response, next: NextFunction) => {
    try {
        if(!req.session) throw new UserError("Not authenticated");
        let totp = await Totp.getByUser(req.session.getUser());
        if(!totp) throw new UserError("Totp is not enabled");
        await totp.delete();
        res.send({});
    } catch(err) {
        next(err);
    }
});

export default router;
