const { app, BrowserWindow, ipcMain, Menu, Notification } = require('electron');
const Store = require('electron-store');
const path = require('path');

// créé le fichier s'il n'existe pas encore
// recupère le fichier s'il existe déjà.
const store = new Store();

const ACCOUNT_ITEMS_STORE_KEY='accountItems'



if(!store.has(ACCOUNT_ITEMS_STORE_KEY)) {
    store.set(ACCOUNT_ITEMS_STORE_KEY,
        [
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
        )
}

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
    const data = store.get(ACCOUNT_ITEMS_STORE_KEY)
    homeWindow = createWindow('home', data);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            homeWindow = createWindow('home', store.get(ACCOUNT_ITEMS_STORE_KEY));
        }
    })
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

const askOpenNewAccountWindowCallback = (type) => {
    console.log("Background 1 : Entering ask-open-new-account-window in main.js");
    newAccountTypeWindow = createWindow('addAccountType', type);
    ipcMain.handle('add-account-type', (e, newAccountType) => {
        const data = store.get(ACCOUNT_ITEMS_STORE_KEY)
        console.log("Background 2 : Entering handle add-account-type in main.js");
        newAccountType.type = type;
        newAccountType.id = data.length > 0 ? data[data.length - 1].id + 1 || 1 : 1;
        console.log("newAccountType is : ");
        console.log(newAccountType);
        data.push(newAccountType);
        store.set(ACCOUNT_ITEMS_STORE_KEY,data)
        // Notifier home
        homeWindow.send('account-type-added', data);

        // Afficher une notification

        const notif = new Notification({
            title:'Ajout réussi',
            body: 'Item ajouté avec succès!',
             icon: path.join(__dirname, 'assets', 'images', 'success.png')
        });

        notif.show();

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
}

ipcMain.on('ask-open-new-account-window', (e,type) => askOpenNewAccountWindowCallback(type));


ipcMain.on('ask-open-edit-account-window', (e, accountItemId) => {
    console.log("Background 1b : Entering ask-open-new-edit-window in main.js");
    const data = store.get(ACCOUNT_ITEMS_STORE_KEY)
    const accountItem = data.find((aI) => aI.id === accountItemId);
    if (accountItem) {
        editAccountTypeWindow = createWindow('editAccountType', accountItem);
        ipcMain.handle('edit-account-type', (e, editedAccountType) => {
            const index = data.findIndex((aI) => aI.id === editedAccountType.id);
            if (index === (-1)) {
                return ("Une erreur s\'est produite");
            }
            data[index] = editedAccountType;
            store.set(ACCOUNT_ITEMS_STORE_KEY,data)
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
    const  data = store.get(ACCOUNT_ITEMS_STORE_KEY)
    const index = data.findIndex((accountItem) => accountItem.id === accountItemId);
    console.log("index : " + index);
    if (index === (-1)) { return { isDeleted: false } };
    data.splice(index, 1);
    store.set(ACCOUNT_ITEMS_STORE_KEY,data)
    return { isDeleted: true, data };
});

///// MENU SETTINGS


const fileEntry = {
    label: 'Fichier',
    submenu: [
        {role: 'reload'},
        {role: 'toggledevtools'},
        {type: 'separator'},
        {role: 'togglefullscreen'},
        {role: 'minimize'},
        {type: 'separator'},
        {role: 'close'},
    ]
}

const actionEntry = {
    label: 'Action',
    submenu: [
        {
            label: 'Ajouter une dépense',
            accelerator: 'CmdOrCtrl+D',
            click() {
                askOpenNewAccountWindowCallback("expense")
            }  
        },
        {
            label: 'Ajouter une recette',
            click() {
                askOpenNewAccountWindowCallback("income")
            }  
        }
        
    ]
}

const template=[fileEntry,actionEntry]
const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu);



