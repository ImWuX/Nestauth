import express, { NextFunction, Request, Response } from "express";
import { UserError } from "../index";
import User from "../user";
import db from "../database";

const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        if(!req.session) throw new UserError("Not authenticated");
        if(req.session.getUser().getRank() != process.env.ADMINRANK) throw new UserError("Insufficient permissions");

        let users: { id: number, username: string, rank: string }[] = [];
        let rawUsers = await db.selectUsers();
        rawUsers.forEach((user: User) => {
            users.push({
                id: user.getId(),
                username: user.getUsername(),
                rank: user.getRank()
            });
        });
        res.send({ users });
    } catch(err) {
        next(err);
    }
});

router.post("/:type", async (req: Request, res: Response, next: NextFunction) => {
    try {
        if(!req.session) throw new UserError("Not authenticated");
        if(!req.body.id || (req.params.type != "edit" && req.params.type != "delete"))
            throw new UserError("Invalid query");
        if(req.session.getUser().getRank() != process.env.ADMINRANK) throw new UserError("Insufficient permissions");
        let user = await User.getById(req.body.id);
        if(!user) throw new UserError("User not found");

        if(req.params.type == "edit") {
            await user.update(req.body.newName ? req.body.newName : user.getUsername(), req.body.newRank ? req.body.newRank : user.getRank());
        } else if(req.params.type == "delete") {
            await user.delete();
        }
        res.send({});
    } catch(err) {
        next(err);
    }
});

export default router;
