import bodyParser from "body-parser";
import socket from "socket.io";
import {checkAuth, updateLastSeen} from "../middleware";
import {DialogCtrl, MessageCtrl, UserCtrl} from "../controllers";
import {loginValidation, registrationValidation} from "../utils/validations";
import express from "express";

const createRoutes = (app: express.Express, io: socket.Server) => {
    const UserController = new UserCtrl(io);
    const DialogController = new DialogCtrl(io);
    const MessageController = new MessageCtrl(io);

    app.use(bodyParser.json());
    app.use(checkAuth);
    app.use(updateLastSeen);




    app.get("/user/me", UserController.getMe);
    app.get("/user/verify", UserController.verify);
    app.post("/user/registration", registrationValidation, UserController.create);
    app.post("/user/login", loginValidation, UserController.login);
    app.get("/user/find", UserController.findUsers);
    app.get("/user/:id", UserController.show);
    app.delete("/user/:id", UserController.delete);

    app.get("/dialogs", DialogController.index);
    app.post("/dialogs", DialogController.create);
    app.delete("/dialog/:id", DialogController.delete);

    app.get("/messages", MessageController.index);
    app.post("/messages", MessageController.create);
    app.delete("/messages/:id", MessageController.delete);
}

export default createRoutes;