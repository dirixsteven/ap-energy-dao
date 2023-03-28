import { Server } from "./Server";

require('dotenv').config();

const port = process.env.PORT || '3001';

const server = new Server(Number(port));
server.start();