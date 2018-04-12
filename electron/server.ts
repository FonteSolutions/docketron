import * as http from 'http';
import * as socketio from 'socket.io';
import {Database} from './database';

export class Server {
    database: Database;

    startServices() {
        this.createSocket();
        this.createDatabase();
    }

    createSocket() {
        const app = http.createServer((req, res) => {
            res.end('Please use the Docketron App');
        });
        const io = socketio.listen(app);
        app.listen(3000, () => {
            console.log('listen server on port 3000');
        });

        io.on('connection', (socket) => {
            socket.on('_message', (message) => {
                console.log('_message', message);
            });
            socket.on('disconnect', () => {
                console.log('disconnected');
            });
            console.log('connected');
            setTimeout(() => {
                socket.emit('message', 4441);
            }, 5000);
        });
    }

    createDatabase() {
        this.database = new Database();
    }
}
