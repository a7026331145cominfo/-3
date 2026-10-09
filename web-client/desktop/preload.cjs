'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('alsaqarDesktop', Object.freeze({
  isDesktop: true,
  platform: process.platform,
  getAppVersion: () => ipcRenderer.invoke('alsaqar:app-version')
}));
