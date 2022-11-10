import express, { NextFunction, Request, Response } from "express";
import { UserError } from "../index";
import Site from "../site";
import db from "../database";

const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        if(!req.session) throw new UserError("Not authenticated");
        if(req.session.getUser().getRank() != process.env.ADMINRANK) throw new UserError("Insufficient permissions");
        let sites: { id: number, subdomain: string, ranks: string[] }[] = [];
        let rawSites = await db.selectSites();
        rawSites.forEach((site: Site) => {
            sites.push({
                id: site.getId(),
                subdomain: site.getSubDomain(),
                ranks: site.getRanks()
            });
        });
        res.send({ sites });
    } catch(err) {
        next(err);
    }
});

router.post("/edit", async (req: Request, res: Response, next: NextFunction) => {
    try {
        if(!req.session) throw new UserError("Not authenticated");
        if(!req.body.id) throw new UserError("Invalid query");
        if(req.session.getUser().getRank() != process.env.ADMINRANK) throw new UserError("Insufficient permissions");
        let site = await Site.getById(req.body.id);
        if(!site) throw new UserError("Site not found");
        if(req.body.newSubdomain) site.updateSubdomain(req.body.newSubdomain);
        res.send({})
    } catch(err) {
        next(err);
    }
});

router.post("/add", async (req: Request, res: Response, next: NextFunction) => {
    try {
        if(!req.session) throw new UserError("Not authenticated");
        if(!req.body.subdomain) throw new UserError("Invalid query");
        if(req.session.getUser().getRank() != process.env.ADMINRANK) throw new UserError("Insufficient permissions");
        if(await Site.getBySubdomain(req.body.subdomain)) throw new UserError("Site exists");
        await Site.create(req.body.subdomain);
        res.send({});
    } catch(err) {
        next(err);
    }
});

router.post("/remove", async (req: Request, res: Response, next: NextFunction) => {
    try {
        if(!req.session) throw new UserError("Not authenticated");
        if(!req.body.id) throw new UserError("Invalid query");
        if(req.session.getUser().getRank() != process.env.ADMINRANK) throw new UserError("Insufficient permissions");
        let site = await Site.getById(req.body.id);
        if(!site) throw new UserError("Site not found");
        await site.delete();
        res.send({});
    } catch(err) {
        next(err);
    }
});

router.post("/ranks/add", async (req: Request, res: Response, next: NextFunction) => {
    try {
        if(!req.session) throw new UserError("Not authenticated");
        if(!req.body.siteId || !req.body.rank) throw new UserError("Invalid query");
        if(req.session.getUser().getRank() != process.env.ADMINRANK) throw new UserError("Insufficient permissions");
        await db.insertSiteRank(req.body.siteId, req.body.rank);
        res.send({});
    } catch(err) {
        next(err);
    }
});

router.post("/ranks/remove", async (req: Request, res: Response, next: NextFunction) => {
    try {
        if(!req.session) throw new UserError("Not authenticated");
        if(!req.body.siteId || !req.body.rank) throw new UserError("Invalid query");
        if(req.session.getUser().getRank() != process.env.ADMINRANK) throw new UserError("Insufficient permissions");
        await db.deleteSiteRank(req.body.siteId, req.body.rank);
        res.send({});
    } catch(err) {
        next(err);
    }
});

export default router;
