import express from "express";
import {DialogModel, MessageModel} from '../models'
import socket from "socket.io";


class DialogController {

    io: socket.Server;
    constructor(io: socket.Server) {
        this.io = io;
    }


    async index(req: express.Request, res: express.Response) {
        const userId  = req.user._id;
        try {
            const dialogs = await DialogModel.find().or([{ author: userId }, { partner: userId }])
                .populate(['author', 'partner'])
                .populate({
                    path: 'lastMessage',
                    populate: {
                        path: 'user',
                        model: 'User'
                    },
                });
            res.json(dialogs);
        } catch (err) {
            res.status(404).json({
                message: 'Dialogs not found'
            });
        }
    }

  create = (req: express.Request, res: express.Response) => {
    const postData = {
        author: req.user._id,
        partner: req.body.partner,
    };

    const dialog = new DialogModel(postData);
    dialog.save().then((dialogOBJ: any) => {
        const message = new MessageModel({
            text: req.body.text,
            user: req.user._id,
            dialog: dialogOBJ._id,

        });

        message.save().then(() => {
            dialogOBJ.lastMessage = message._id;
            dialogOBJ.save().then(()=> {
                res.json(dialogOBJ);
                this.io.emit('SERVER:DIALOG_CREATED', {
                    ...postData,
                    dialog: dialogOBJ
                });
            });
        })
            .catch((reason: any) => {
                res.json(reason)
            });
}).catch((reason: any) => {
    res.json(reason)
});
}
    async delete(req: express.Request, res: express.Response) {
        const id: string = req.params.id;
        DialogModel.findOneAndRemove({_id:id})
            .then(dialog => {
                if (dialog) {
                    res.json({
                        message: `Dialog deleted`
                    });
                }
            })
            .catch(err => {
                res.json({
                    message: "Dialog not found"
                });
            })
    }
}

export default DialogController;