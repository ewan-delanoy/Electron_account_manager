const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld(
    'ipcRenderer',
    {
        onceInitData: (cb) => {
            console.log("Main display 1 : Entering onceInitData in preload.js");
            ipcRenderer.once('init-data',cb);
        },
        onAccountTypeAdded: (cb) => {
            console.log("Main display 2 : Entering onAccountTypeAdded in preload.js");
            ipcRenderer.on('account-type-added',cb);
        },
        onAccountTypeEdited: (cb) => {
            console.log("Main display 2b : Entering onAccountTypeEdited in preload.js");
            ipcRenderer.on('account-type-edited',cb);
        },
        askOpenEditAccountTypeWindow: (type) => {
            console.log("Main display 5b : Entering askOpenEditAccountTypeWindow in preload.js");
            ipcRenderer.send('ask-open-edit-account-window', type);
        },
        askOpenNewAccountTypeWindow: (type) => {
            console.log("Main display 5 : Entering askOpenNewAccountTypeWindow in preload.js");
            ipcRenderer.send('ask-open-new-account-window', type);
        },
        invokeEditAccountType: (editedAccountType,cb) => {
            console.log("Insert modal 2b : Entering invokeEditAccountType in preload.js");
            ipcRenderer
              .invoke('edit-account-type',editedAccountType)
              .then(cb)
        },
        invokeNewAccountType: (newAccountType,cb) => {
            console.log("Insert modal 2 : Entering invokeNewAccountType in preload.js");
            ipcRenderer
              .invoke('add-account-type',newAccountType)
              .then(cb)
        },
        invokeDeleteAccountItem: (accountItemId,cb) => {
            console.log("Insert modal 7 : Entering invokeDeleteAccountType in preload.js");
            ipcRenderer
              .invoke('delete-account-item',accountItemId)
              .then(cb)
        }
    }
)