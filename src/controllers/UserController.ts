import express from "express";
import {UserModel} from '../models';
import {UserDoc} from '../models/User';
import { createJWTToken } from '../utils';
import { validationResult} from 'express-validator';
import bcrypt from "bcrypt";
import socket from "socket.io";
import mailer from "../middleware/mailer";


class UserController {

    io: socket.Server;
    constructor(io: socket.Server) {
        this.io = io;
    }

    async show(req: express.Request, res: express.Response) {
        const id: string = req.params.id;
        try {
            const user = await UserModel.findById(id);
            res.json(user);
        } catch (err) {
            res.status(404).json({
                message: 'Not found'
            });
        }
    }

    async getMe(req: express.Request, res: express.Response) {
        const id: string = req.user && req.user._id;
        try {
            const user = await UserModel.findById(id);
            if (!user) {
                return res.status(404).json({
                    message: 'User not found',
                });
            }
            res.json(user);
        } catch (err) {
            res.status(500).json({
                message: 'Internal server error',
            });
        }
    }

    findUsers = (req: express.Request, res: express.Response) => {
        const query: string = (req.query as any)?.query;
        UserModel.find()
            .or([
                { fullname: new RegExp(query, "i") },
                { email: new RegExp(query, "i") },
            ])
            .then((users: any) => res.json(users))
            .catch((err: any) => {
                return res.status(404).json({
                    status: "error",
                    message: err,
                });
            });
    };



    async delete(req: express.Request, res: express.Response) {
        const id: string = req.params.id;
        UserModel.findOneAndRemove({_id:id})
            .then(user => {
                if (user) {
                    res.json({
                        message: `User ${user.fullname} deleted`
                    });
                }
            })
            .catch(err => {
                res.json({
                    message: "User not found"
                });
            })
    }

    create = (req: express.Request, res: express.Response) => {
        const postData = {
            email: req.body.email,
            fullname: req.body.fullname,
            password: req.body.password
        };
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            res.status(422).json({errors: errors.array()})
        } else {
            const user = new UserModel(postData);
            user.save().then((obj: UserDoc) => {
                res.json(obj);
                mailer.sendMail(
                    {
                        from: "admin@test.com",
                        to: postData.email,
                        subject: "Подтверждение почты ToSpeak",
                        html: `Для того, чтобы подтвердить почту, перейдите <a href="http://localhost:3000/registeration/verify?hash=${obj.confirmed_hash}">по этой ссылке</a>`,
                    },
                    function (err: Error | null, info: any) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(info);
                        }
                    }
                );
            }).catch((reason: any) => {
                return res.status(500).json({
                    status: "error",
                    message: reason
                });
            });
        }
    }


    verify = (req: express.Request, res: express.Response) => {
    const hash = req.query.hash;

    if(!hash){
        return res.status(422).json({errors: 'Invalid hash'})
    }
        try {
            UserModel.findOne({confirmed_hash: hash}).then((user: any) => {
                if (!user) {
                    return res.status(404).json({
                        status: "error",
                        message: "Hash not found",
                    });
                }

                user.confirmed = true;
                user.save()
                    .then(() => {
                        res.json({
                            status: "success",
                            message: "Аккаунт успешно подтвержден!",
                        });
                    })
            })
        } catch (err) {
            res.status(500).json({
                message: 'Internal server error',
            });
        }
    }

    login = (req: express.Request, res: express.Response) => {
        const postData = {
            email: req.body.email,
            password: req.body.password,
        };

        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()})
        }

        UserModel.findOne({email: postData.email})
            .then((user: UserDoc | null) => {
                if (!user) {
                    return res.status(404).json({
                        message: "User not found"
                    });
                }

                if(bcrypt.compareSync(postData.password, user.password)) {
                    const token = createJWTToken(user);
                    res.json({
                        status: 'success',
                        token
                    });
                } else {
                    res.json({
                        status: 'error',
                        message: "incorrect password or email"
                    });
                }
                })
                    .catch(err => {
                        res.status(404).json({
                            message: err
                        });
                    });
            }

}

export default UserController;