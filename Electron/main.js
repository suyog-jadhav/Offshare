const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const treeKill = require('tree-kill');

let mainWindow;
let backendProcess;

function createWindow() {
    // 1. Start Backend Server
    const backendPath = path.join(__dirname, '../Backend');
    console.log('🚀 Starting Backend from:', backendPath);

    backendProcess = spawn('node', ['index.js'], {
        cwd: backendPath,
        stdio: 'inherit', // Pipe logs to main console
        shell: true       // Improved Windows compatibility
    });

    backendProcess.on('error', (err) => {
        console.error('❌ Failed to start backend:', err);
    });

    // 2. Create Browser Window
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // 3. Load Frontend (Wait a moment for backend to ensure port is listened, though not strictly required for static load)
    // We load the static build, which makes API calls to localhost:8000
    const frontendPath = path.join(__dirname, '../Frontend/Frontend/dist/index.html');
    console.log('🌍 Loading Frontend from:', frontendPath);

    setTimeout(() => {
        mainWindow.loadFile(frontendPath);
        // Open DevTools for debugging
        mainWindow.webContents.openDevTools();
    }, 2000); // Small delay to let Backend initialize DB

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('quit', () => {
    // Kill backend process on exit
    if (backendProcess) {
        console.log('🛑 Killing Backend Process...');
        treeKill(backendProcess.pid);
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
