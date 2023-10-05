const { app, BrowserWindow, ipcMain } = require('electron');
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
        price: 800,
        type: 'expense'
    }
]

let homeWindow;
let newAccountTypeWindow;
let editAccountTypeWindow

function createWindow(viewName, viewData = null, width = 1400, height = 1000) {
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
            win.send('init-data', viewData);
        });

    // only in dev mode 
    win.webContents.openDevTools();

    return win;
}


app.whenReady().then(() => {
    homeWindow = createWindow('home', data);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            homeWindow = createWindow('home', data);
        }
    })
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

ipcMain.on('ask-open-new-account-window', (e, type) => {
    console.log("Background 1 : Entering ask-open-new-account-window in main.js");
    newAccountTypeWindow = createWindow('addAccountType', type);
    ipcMain.handle('add-account-type', (e, newAccountType) => {
        console.log("Background 2 : Entering handle add-account-type in main.js");
        newAccountType.type = type;
        newAccountType.id = data.length > 0 ? data[data.length - 1].id + 1 || 1 : 1;
        console.log("newAccountType is : ");
        console.log(newAccountType);
        data.push(newAccountType);
        // Notifier home
        homeWindow.send('account-type-added', data);

        setTimeout(() => {
            newAccountTypeWindow.close();
        }, 3000);
        // Renvoie sur addAccountType
        return 'Le nouvel élément a été pris en compte';

    });
    newAccountTypeWindow.on('closed', () => {
        console.log("Background 3 : Entering newAccountTypeWindow_on_closed in main.js");
        ipcMain.removeHandler('add-account-type')
    });
});


ipcMain.on('ask-open-edit-account-window', (e, accountItemId) => {
    console.log("Background 1b : Entering ask-open-new-edit-window in main.js");
    const accountItem = data.find((aI) => aI.id === accountItemId);
    if (accountItem) {
        editAccountTypeWindow = createWindow('editAccountType', accountItem);
        ipcMain.handle('edit-account-type', (e, editedAccountType) => {
            const index = data.findIndex((aI) => aI.id === editedAccountType.id);
            if (index === (-1)) {
                return ("Une erreur s\'est produite");
            }
            data[index] = editedAccountType;
            homeWindow.send('account-type-edited', {editedAccountType,data});
            setTimeout(() => {
                editAccountTypeWindow.close();
            }, 3000);
            return ("L'item a été correctement mis à jour");
        });   

        editAccountTypeWindow.on('closed', () => {
            console.log("Background 3 : Entering editAccountTypeWindow_on_closed in main.js");
            ipcMain.removeHandler('edit-account-type')
          });
    }
});

ipcMain.handle('delete-account-item', (e, accountItemId) => {
    console.log("accountItemId : " + accountItemId);
    const index = data.findIndex((accountItem) => accountItem.id === accountItemId);
    console.log("index : " + index);
    if (index === (-1)) { return { isDeleted: false } };
    data.splice(index, 1);
    return { isDeleted: true, data };
});