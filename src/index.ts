import express from "express";
import dotenv from "dotenv";
import socket from "socket.io";
import {createServer} from "http";
import './core/db';
import createRoutes from './core/routes';
import createSocket from './core/socket';

const app = express();
const http = createServer(app);
const io = createSocket(http);
dotenv.config();

createRoutes(app, io);





http.listen(process.env.PORT, () => {
    console.log(`Server: http://localhost:${process.env.PORT}`)
})
