const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let mainWindow;
let reactProcess;

function startReact() {
  reactProcess = spawn('npm', ['run', 'react-start'], {
    shell: true,
    env: { ...process.env, BROWSER: 'none' }
  });

  reactProcess.stdout.on('data', (data) => {
    console.log(`React: ${data}`);
    if (data.toString().includes('webpack compiled')) {
      setTimeout(createWindow, 2000);
    }
  });
}

function createWindow() {
  if (mainWindow) return;

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'public', 'icon.png'),
    title: 'Jinja College CMS'
  });

  mainWindow.loadURL('http://localhost:3000');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startReact();
});

app.on('window-all-closed', () => {
  if (reactProcess) {
    reactProcess.kill();
  }
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
