const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const url = require('url');

let mainWindow;
let reactProcess;

function getStartUrl() {
  return process.env.ELECTRON_START_URL || 'http://localhost:3000';
}

function isDevMode() {
  return !app.isPackaged;
}

function startReact() {
  if (!isDevMode() || reactProcess) {
    return;
  }

  reactProcess = spawn('npm', ['run', 'react-start'], {
    shell: true,
    env: { ...process.env, BROWSER: 'none' }
  });

  reactProcess.stdout.on('data', (data) => {
    const output = data.toString();

    console.log(`React: ${output}`);
    if (
      output.includes('webpack compiled') ||
      output.includes('Something is already running on port 3000')
    ) {
      setTimeout(createWindow, 2000);
    }
  });

  reactProcess.stderr.on('data', (data) => {
    const output = data.toString();

    console.error(`React error: ${output}`);
    if (output.includes('Something is already running on port 3000')) {
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

  if (isDevMode()) {
    mainWindow.loadURL(getStartUrl());
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, 'build', 'index.html'),
        protocol: 'file:',
        slashes: true
      })
    );
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  if (isDevMode()) {
    startReact();
  } else {
    createWindow();
  }
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
