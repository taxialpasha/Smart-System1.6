/**
 * نظام الاستثمار المتكامل - ملف preload لتطبيق Electron
 * يوفر واجهة آمنة بين عمليات تشغيل Electron وواجهة المستخدم
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  refreshPage: () => ipcRenderer.send('refresh-page')
});

// تعريف واجهة للتخزين المحلي آمن
contextBridge.exposeInMainWorld('secureStorage', {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from localStorage:', error);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Error setting item to localStorage:', error);
      return false;
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing item from localStorage:', error);
      return false;
    }
  }
});

// تعريف واجهة للتحكم في نافذة التطبيق
contextBridge.exposeInMainWorld('windowControls', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
});

// إضافة مستمع للأخطاء غير المعالجة
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  alert('حدث خطأ غير متوقع. يرجى إعادة تشغيل التطبيق.');
});

// لوغ عند تحميل الملف
console.log('تم تحميل ملف preload.js بنجاح');
window.addEventListener('DOMContentLoaded', () => {
  const refreshButton = document.getElementById('refresh-button');
  if (refreshButton) {
    refreshButton.addEventListener('click', () => {
      window.electronAPI.refreshPage();
    });
  }
});