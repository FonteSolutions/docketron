import {app, BrowserWindow} from 'electron';
import * as path from 'path';
import * as url from 'url';
import {Server} from './server';

export class Main {
    public win: Electron.BrowserWindow;
    public server: Server;

    constructor() {
        app.on('ready', this.createWindow);
        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });
        app.on('activate', () => {
            if (app == null) {
                this.createWindow();
            }
        });
        this.server = new Server();
        this.server.startServices();
    }

    createWindow() {
        this.win = new BrowserWindow({
            width: 800,
            height: 600
        });
        this.win.on('closed', () => {
            this.win = null;
        });
        // Debug
        this.win.webContents.openDevTools();
        // Load app
        this.win.loadURL(url.format({
            pathname: path.join(__dirname, 'app', 'index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
}

const main = new Main();
