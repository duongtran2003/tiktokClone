import { Request, Response } from 'express';
import { Friend } from '../models/Friend';

class FriendController {
    query(req: Request, res: Response) {
        const friends: any[] = [];
        const username = res.locals.claims.username;
        Friend.find({ $or: [{ source: username }, { target: username }], status: "active" }, "target source -_id")
            .then((friends) => {
                res.statusCode = 200;
                return res.json({
                    friends: friends,
                })
            })
            .catch((err) => {
                res.statusCode = 500;
                return res.json({
                    message: "Server's error",
                })
            })
    }

    checkStatus(req: Request, res: Response) {
        const username = res.locals.claims.username;
        const target = req.body.target;
        Friend.findOne({ $or: [{ source: username, target: target }, { source: target, username: username }] })
        .then((friend) => {
            if (friend) {
                res.statusCode = 200;
                return res.json({
                    friend, 
                });
            }
            else {
                res.statusCode = 200;
                return res.json({
                    source: username,
                    target: target,
                    status: "none",
                })
            }
        })
        .catch((err) => {
            res.statusCode = 500;
            return res.json({
                message: "Server's error",
            })
        })
    }

    async sendRequest(req: Request, res: Response) {
        const username = res.locals.claims.username;
        const target = req.body.target;
        const request = await Friend.find({ $or: [{ source: username, target: target }, { source: target, target: username }] });
        if (!request.length) {
            Friend.create({
                source: username,
                target: target,
                status: "pending",
            })
                .then((request) => {
                    res.statusCode = 200;
                    return res.json({
                        message: "success",
                    });
                })
                .catch((err) => {
                    res.statusCode = 500;
                    return res.json({
                        message: "Server's error",
                    });
                });
        }
        else {
            res.statusCode = 400;
            return res.json({
                message: "Bad request",
            })
        }
    }

    cancelRequest(req: Request, res: Response) {
        const username = res.locals.claims.username; //the one who made the request
        const target = req.body.target;
        Friend.deleteOne({ source: username, target: target, status: "pending" })
            .then((request) => {
                res.statusCode = 200;
                return res.json({
                    message: "success",
                })
            })
            .catch((err) => {
                res.statusCode = 500;
                return res.json({
                    message: "Server's error",
                })
            });
    }

    confirmRequest(req: Request, res: Response) {
        const username = res.locals.claims.username; // the one who made the request
        const target = req.body.target;
        const conf = req.body.conf;
        if (conf) {
            Friend.findOneAndUpdate({ username: target, target: username }, { status: "active" })
            .then((request) => {
                if (!request) {
                    res.statusCode = 404;
                    return res.json({
                        message: "not found",
                    })
                }
                res.statusCode = 200;
                return res.json({
                    message: "success",
                })
            })
            .catch((err) => {
                res.statusCode = 500;
                return res.json({
                    message: "Server's error",
                })
            })
        }
        else {
            Friend.deleteOne({ username: target, target: username })
            .then((request) => {
                res.statusCode = 200;
                return res.json({
                    message: "success",
                });
            })
            .catch((err) => {
                res.statusCode = 500;
                return res.json({
                    message: "Server's error",
                })
            });
        }
    }
}

export {
    FriendController
}