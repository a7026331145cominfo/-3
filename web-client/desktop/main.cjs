'use strict';

const path = require('node:path');
const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');

const DEV_SERVER_URL = 'http://127.0.0.1:3000';
let mainWindow = null;

function isExternalHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1080,
    minHeight: 680,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#f1f5f9',
    title: 'AlSaqar ERP — نظام الصقر المحاسبي المتكامل',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow = win;
  win.once('ready-to-show', () => win.show());

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isExternalHttpUrl(url)) {
      void shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, url) => {
    const isLocalNavigation = app.isPackaged
      ? url.startsWith('file://')
      : url.startsWith(DEV_SERVER_URL);

    if (!isLocalNavigation) {
      event.preventDefault();
      if (isExternalHttpUrl(url)) {
        void shell.openExternal(url);
      }
    }
  });

  win.on('closed', () => {
    if (mainWindow === win) mainWindow = null;
  });

  if (app.isPackaged) {
    await win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  } else {
    await win.loadURL(DEV_SERVER_URL);
  }
}

const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  });

  app.whenReady().then(async () => {
    app.setAppUserModelId('com.a7026331145cominfo.alsaqarerp');
    ipcMain.handle('alsaqar:app-version', () => app.getVersion());

    try {
      await createWindow();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      dialog.showErrorBox('تعذر تشغيل نظام الصقر', message);
      app.quit();
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        void createWindow();
      }
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
