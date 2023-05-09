import express from "express";
import {MessageModel, DialogModel} from '../models'
import socket from "socket.io";

class MessageController {

    io: socket.Server;
    constructor(io: socket.Server) {
        this.io = io;
    }
    async index(req: express.Request, res: express.Response) {
        const dialogId: string = req.query.dialog as string;
        if (!dialogId) {
            return res.status(400).json({
                message: 'Dialog ID is required'
            });
        }
        try {
            const messages = await MessageModel.find({dialog: dialogId})
                .populate('dialog')
                .populate({
                    path: 'user',
                    model: 'User'
                })

            res.json(messages);
        } catch (err) {
            res.status(404).json({
                message: 'Messages not found'
            });
        }
    }

    create = (req: express.Request, res: express.Response) => {
        const userId = req.user._id;
        const postData = {
            text: req.body.text,
            user: userId,
            dialog: req.body.dialog_id,
        };
        const message = new MessageModel(postData);

        message.save()
            .then((obj: any) => {
                return MessageModel.populate(obj, [{ path: "dialog" }, { path: "user", model: 'User' }]);
            })
            .then((message: any) => {
                return DialogModel.findOneAndUpdate(
                    { _id: postData.dialog },
                    { lastMessage: message._id },
                    { upsert: true, new: true }
                );
            })
            .then((updatedDialog: any) => {
                res.json(message);
                this.io.emit('SERVER:NEW_MESSAGE', message);
            })
            .catch((reason) => {
                res.json(reason);
            });
    };



    async delete(req: express.Request, res: express.Response) {
        const id: string = req.params.id;
        MessageModel.findOneAndRemove({_id:id})
            .then(message => {
                if (message) {
                    res.json({
                        message: `Message deleted`
                    });
                }
            })
            .catch(err => {
                res.json({
                    message: "Message not found"
                });
            })
    }
}

export default MessageController;