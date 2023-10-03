const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld(
    'ipcRenderer',
    {
        onceInitData: (cb) => {
            ipcRenderer.once('init-data',cb);
        }
    }
)