// Libs
const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const server = require('./server');
require('electron-reload')(__dirname, {
    electron: require('electron')
});
let win;
server.startService();

function createElectronShell() {
    win = new BrowserWindow({
        width: 800,
        height: 600
    });
    win.on('closed', () => {
        win = null;
    });
    // Debug
    win.webContents.openDevTools();
    // Load app
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'app', 'index.html'),
        // pathname: 'dist/app/index.html',
        protocol: 'file:',
        slashes: true
    }));
}

app.on('ready', createElectronShell);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', () => {
    if (app == null) {
        createElectronShell();
    }
});