const {app, BrowserWindow} = require('electron');
const path = require('path');

const data = [
    {
        id: 1,
        title: 'Vidange voiture',
        price: 150,
        type: 'income'
    },
    {
        id: 2,
        title: 'Filtre à huile',
        price: 80,
        type: 'expense'
    }
]

function createWindow(viewName,viewData=null,width =1400,height = 1000) {
    const win = new BrowserWindow({
        width,
        height,
        webPreferences: {
            // on arrête d'exposer les node_modules côté front
            nodeIntegration: false,
            // on isole tout pour éviter les problèmes
            contextIsolation: true,
            // on arrête d'exposer le module remote d'Electron
            enableRemoteModule: false,
            // on donne à notre vue le fichier preload.js pour qu'elle expose
            // la clé et la méthode loadController
            preload: path.join(__dirname, 'app', 'preload.js')
        }
    });

    win.loadFile(path.join(__dirname, 'src', 'views', viewName, viewName + '.html'))
    .then(() => {
         win.send('init-data',viewData);
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    })
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})
