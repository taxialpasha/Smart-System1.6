const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'assets', 'icon.ico'), // أيقونة التطبيق
    frame: false, // إزالة إطار النافذة الأصلي
    titleBarStyle: 'hidden', // للماك فقط، لا يؤثر على ويندوز
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  win.loadFile('index.html');
}

// تحسين التوافق مع الأنظمة القديمة
app.commandLine.appendSwitch('no-sandbox');
app.disableHardwareAcceleration();

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// التحكم في النافذة من الواجهة الأمامية (Renderer)
ipcMain.on('window-minimize', () => {
  BrowserWindow.getFocusedWindow()?.minimize();
});

ipcMain.on('window-maximize', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win?.isMaximized()) win.unmaximize();
  else win?.maximize();
});

ipcMain.on('window-close', () => {
  BrowserWindow.getFocusedWindow()?.close();
});

// إضافة آلية لإعادة تحميل الصفحة عند اكتشاف تجمد
ipcMain.on('force-reload', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    win.reload();
  }
});


