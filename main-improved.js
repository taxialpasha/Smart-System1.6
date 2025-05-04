/**
 * نظام الاستثمار المتكامل - ملف العملية الرئيسية المحسّن
 * يوفر معالجة متقدمة للتجمد ومراقبة الأداء في تطبيق Electron
 */

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// متغيرات حالة التطبيق
let mainWindow = null;
let appState = {
  lastActiveTime: Date.now(),
  freezeDetected: false,
  freezeCount: 0,
  lastFreezeTime: null,
  memoryWarnings: 0,
  isReloading: false
};

// إعدادات متقدمة للتطبيق
const APP_CONFIG = {
  // إعدادات اكتشاف التجمد
  FREEZE_DETECTION: {
    HEARTBEAT_TIMEOUT: 15000, // 15 ثانية بدون نبضة يعتبر تجمداً
    MAX_FREEZE_COUNT: 3, // عدد مرات التجمد قبل إعادة التشغيل
    FORCE_RELOAD_AFTER_FREEZES: true // إعادة تحميل بعد عدة تجمدات
  },
  
  // إعدادات مراقبة الذاكرة
  MEMORY_MONITORING: {
    CHECK_INTERVAL: 60000, // فحص كل دقيقة
    WARNING_THRESHOLD_MB: 200, // تحذير عند وصول 200 ميجابايت
    CRITICAL_THRESHOLD_MB: 500, // إعادة التحميل عند وصول 500 ميجابايت
    HEAP_DUMP_ENABLED: false // تعطيل حفظ ملفات مخطط الذاكرة (لتوفير المساحة)
  },

  // إعدادات التعافي التلقائي
  AUTO_RECOVERY: {
    ENABLED: true, // تفعيل التعافي التلقائي
    MAX_AUTO_RELOADS: 3, // عدد مرات إعادة التحميل التلقائي قبل عرض رسالة خطأ
    AUTO_RESTART_ON_CRASH: true // إعادة تشغيل التطبيق تلقائياً عند الانهيار
  }
};

/**
 * إنشاء النافذة الرئيسية للتطبيق
 */
function createWindow() {
  // إنشاء نافذة المتصفح
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    frame: false, // إزالة إطار النافذة الأصلي
    titleBarStyle: 'hidden', // للماك فقط، لا يؤثر على ويندوز
    webPreferences: {
      preload: path.join(__dirname, 'preload-improved.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // السماح بتنفيذ برنامج preload بشكل آمن
      enableRemoteModule: false,
      worldSafeExecuteJavaScript: true,
      // إعدادات إضافية لتحسين الأداء
      backgroundThrottling: false, // منع خنق أداء الخلفية
      autoplayPolicy: 'no-user-gesture-required'
    }
  });

  // تحميل الصفحة الرئيسية
  mainWindow.loadFile('index.html');

  // إعداد مراقبة الأداء والصحة
  setupPerformanceMonitoring();
  
  // إعداد معالجات الأحداث للنافذة
  setupWindowEventHandlers();
}

/**
 * إعداد معالجات الأحداث للنافذة
 */
function setupWindowEventHandlers() {
  // مراقبة إغلاق النافذة
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // معالجة تصغير النافذة
  mainWindow.on('minimize', () => {
    appState.isMinimized = true;
  });

  // معالجة استعادة النافذة
  mainWindow.on('restore', () => {
    appState.isMinimized = false;
  });

  // معالجة فقدان التركيز
  mainWindow.on('blur', () => {
    appState.hasFocus = false;
  });

  // معالجة استعادة التركيز
  mainWindow.on('focus', () => {
    appState.hasFocus = true;
    // تحديث النبضة عند استعادة التركيز
    appState.lastActiveTime = Date.now();
  });

  // معالجة الإغلاق غير الآمن
  mainWindow.on('unresponsive', () => {
    handleWindowUnresponsive();
  });

  // معالجة استعادة الاستجابة
  mainWindow.on('responsive', () => {
    console.log('استعادة استجابة النافذة');
    appState.freezeDetected = false;
  });
}

/**
 * إعداد مراقبة الأداء والصحة
 */
function setupPerformanceMonitoring() {
  // مراقبة نبضات القلب من عملية التقديم
  setupHeartbeatMonitoring();
  
  // مراقبة استخدام الذاكرة
  if (APP_CONFIG.MEMORY_MONITORING.CHECK_INTERVAL > 0) {
    setInterval(checkMemoryUsage, APP_CONFIG.MEMORY_MONITORING.CHECK_INTERVAL);
  }
  
  // تسجيل معالجات الرسائل من عملية التقديم
  setupIPCHandlers();
}

/**
 * إعداد مراقبة نبضات القلب من عملية التقديم
 */
function setupHeartbeatMonitoring() {
  // مؤقت للتحقق من استجابة التطبيق
  const heartbeatCheckInterval = setInterval(() => {
    const now = Date.now();
    const timeSinceLastHeartbeat = now - appState.lastActiveTime;
    
    // إذا مر وقت طويل دون نبضة قلب، قد يكون التطبيق متجمداً
    if (timeSinceLastHeartbeat > APP_CONFIG.FREEZE_DETECTION.HEARTBEAT_TIMEOUT && !appState.isReloading) {
      console.warn(`اكتشاف تجمد محتمل، مر ${timeSinceLastHeartbeat}ms منذ آخر نبضة قلب`);
      handleFreeze();
    }
  }, 5000); // التحقق كل 5 ثوانٍ
}

/**
 * إعداد معالجات الرسائل من عملية التقديم
 */
function setupIPCHandlers() {
  // معالجة نبضات القلب من عملية التقديم
  ipcMain.on('app-heartbeat', (event, data) => {
    appState.lastActiveTime = data.timestamp || Date.now();
    // إعادة ضبط حالة التجمد عند استلام نبضة قلب
    appState.freezeDetected = false;
  });
  
  // معالجة إشعارات التجمد من عملية التقديم
  ipcMain.on('app-freeze-detected', () => {
    handleFreeze();
  });
  
  // معالجة طلبات إعادة تحميل الصفحة
  ipcMain.on('refresh-page', () => {
    if (mainWindow && !appState.isReloading) {
      safeReloadWindow();
    }
  });
  
  // معالجة طلبات إعادة تحميل إجبارية
  ipcMain.on('force-reload', () => {
    if (mainWindow) {
      forceReloadWindow();
    }
  });
  
  // معالجة تجمد المدخلات
  ipcMain.on('input-freeze-detected', (event, data) => {
    console.warn('تم اكتشاف تجمد في المدخلات:', data);
    // محاولة إصلاح المدخلات المتجمدة
    if (mainWindow) {
      mainWindow.webContents.executeJavaScript(`
        if (window.formFixer && window.formFixer.refresh) {
          window.formFixer.refresh();
          console.log('تم تنفيذ تحديث النماذج');
        }
      `).catch(err => console.error('فشل في تنفيذ script إصلاح النماذج:', err));
    }
  });
  
  // معالجة طلبات حفظ حالة التطبيق
  ipcMain.on('save-app-state', (event, state) => {
    // دمج الحالة الجديدة مع الحالة الحالية
    if (state && typeof state === 'object') {
      appState = { ...appState, ...state };
    }
  });
  
  // معالجة طلبات التحكم في النافذة
  ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });
  
  ipcMain.on('window-maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });
  
  ipcMain.on('window-close', () => {
    if (mainWindow) mainWindow.close();
  });
  
  // معالجة طلبات الاستعلام عن حالة النافذة
  ipcMain.handle('window-is-maximized', () => {
    return mainWindow ? mainWindow.isMaximized() : false;
  });
  
  // معالجة طلبات التشخيص
  ipcMain.handle('check-memory-usage', () => {
    return process.memoryUsage();
  });
  
  // معالجة طلبات جمع معلومات النظام
  ipcMain.handle('collect-system-info', () => {
    return {
      platform: process.platform,
      arch: process.arch,
      versions: process.versions,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      uptime: process.uptime(),
      appConfig: APP_CONFIG,
      appState: { ...appState, password: undefined } // إزالة أي معلومات حساسة
    };
  });
  
  // معالجة طلبات تحسين الذاكرة
  ipcMain.on('optimize-memory', () => {
    // طلب جمع القمامة إذا كان متاحاً
    if (global.gc) {
      global.gc();
    }
  });
  
  // معالجة تسجيل وصول DOM
  ipcMain.on('dom-ready', () => {
    console.log('DOM جاهز، التطبيق يعمل بشكل كامل');
    // تنفيذ عمليات تهيئة إضافية إذا لزم الأمر
    
    // تنفيذ script لإعداد كاشف التجمد من جانب العميل
    if (mainWindow) {
      mainWindow.webContents.executeJavaScript(`
        if (window.freezeDetector && window.freezeDetector.start) {
          window.freezeDetector.start();
          console.log('تم بدء نظام كشف التجمد');
        }
        
        if (window.formFixer && window.formFixer.init) {
          window.formFixer.init();
          console.log('تم بدء نظام إصلاح النماذج');
        }
      `).catch(err => console.error('فشل في تهيئة أنظمة مراقبة التجمد:', err));
    }
  });
  
  // معالجة الأخطاء غير المعالجة
  ipcMain.on('unhandled-error', (event, errorData) => {
    console.error('خطأ غير معالج في عملية التقديم:', errorData);
    
    // تسجيل الخطأ في ملف السجل
    logError('unhandled_error', errorData);
    
    // التحقق مما إذا كان خطأ يشير إلى تجمد
    if (isFreezingError(errorData)) {
      handleFreeze();
    }
  });
  
  // معالجة الوعود المرفوضة غير المعالجة
  ipcMain.on('unhandled-rejection', (event, rejectionData) => {
    console.error('وعد مرفوض غير معالج في عملية التقديم:', rejectionData);
    
    // تسجيل الخطأ في ملف السجل
    logError('unhandled_rejection', rejectionData);
  });
}

/**
 * معالجة تجمد التطبيق
 */
function handleFreeze() {
  // تجنب المعالجة المتكررة لنفس التجمد
  if (appState.freezeDetected || appState.isReloading) {
    return;
  }
  
  appState.freezeDetected = true;
  appState.freezeCount++;
  appState.lastFreezeTime = Date.now();
  
  console.warn(`تم اكتشاف تجمد #${appState.freezeCount}`);
  
  // تسجيل معلومات التجمد
  logError('app_freeze', {
    count: appState.freezeCount,
    timestamp: appState.lastFreezeTime,
    memory: process.memoryUsage()
  });
  
  // محاولة إصلاح التجمد أولاً
  if (mainWindow && mainWindow.webContents) {
    // محاولة تنشيط نظام إصلاح التجمد من جانب العميل
    mainWindow.webContents.executeJavaScript(`
      console.warn('محاولة إصلاح التجمد...');
      
      // تحديث نبضة القلب
      if (window.freezeDetector && window.freezeDetector.refresh) {
        window.freezeDetector.refresh();
      }
      
      // تحديث النماذج
      if (window.formFixer && window.formFixer.refresh) {
        window.formFixer.refresh();
      }
      
      // إعادة تهيئة معالجات الأحداث
      if (window.initEventListeners && typeof window.initEventListeners === 'function') {
        window.initEventListeners();
      }
      
      true; // إرجاع قيمة لمنع خطأ الوعد
    `).then(() => {
      console.log('تم تنفيذ إجراءات إصلاح التجمد');
      
      // التحقق من نجاح الإصلاح بعد فترة
      setTimeout(() => {
        // إذا كان التجمد مستمراً، قم بإعادة تحميل النافذة
        if (appState.freezeDetected && APP_CONFIG.FREEZE_DETECTION.FORCE_RELOAD_AFTER_FREEZES) {
          console.warn('فشل إصلاح التجمد، جاري إعادة تحميل النافذة...');
          safeReloadWindow();
        }
      }, 5000);
    }).catch(err => {
      console.error('فشل في تنفيذ إجراءات إصلاح التجمد:', err);
      
      // في حالة الفشل، قم بإعادة تحميل النافذة
      safeReloadWindow();
    });
  } else {
    // لا يمكن إصلاح التجمد، قم بإعادة تحميل النافذة
    safeReloadWindow();
  }
  
  // إذا تجاوز عدد مرات التجمد الحد الأقصى، عرض تحذير للمستخدم
  if (appState.freezeCount >= APP_CONFIG.FREEZE_DETECTION.MAX_FREEZE_COUNT) {
    showFreezeWarningDialog();
  }
}

/**
 * معالجة حالة عدم استجابة النافذة
 */
function handleWindowUnresponsive() {
  console.error('النافذة غير مستجيبة');
  
  // عرض مربع حوار للمستخدم لاختيار الإجراء المناسب
  dialog.showMessageBox(mainWindow, {
    type: 'warning',
    title: 'التطبيق غير مستجيب',
    message: 'يبدو أن التطبيق لا يستجيب. ماذا ترغب في أن تفعل؟',
    buttons: ['انتظار', 'إعادة تحميل', 'إغلاق'],
    defaultId: 1,
    cancelId: 0
  }).then(result => {
    if (result.response === 1) {
      // إعادة تحميل
      forceReloadWindow();
    } else if (result.response === 2) {
      // إغلاق
      if (mainWindow) {
        mainWindow.destroy(); // الإغلاق القسري بدون معالجات الإغلاق
      }
    }
  }).catch(err => {
    console.error('خطأ في عرض مربع حوار عدم الاستجابة:', err);
    // محاولة الإغلاق الآمن
    try {
      if (mainWindow) {
        mainWindow.destroy();
      }
    } catch (closeErr) {
      console.error('فشل في إغلاق النافذة:', closeErr);
    }
  });
}

/**
 * إعادة تحميل النافذة بشكل آمن
 */
function safeReloadWindow() {
  if (!mainWindow || appState.isReloading) {
    return;
  }
  
  appState.isReloading = true;
  console.log('جاري إعادة تحميل النافذة بشكل آمن...');
  
  try {
    // محاولة حفظ الحالة قبل إعادة التحميل
    mainWindow.webContents.executeJavaScript(`
      // محاولة حفظ حالة التطبيق قبل إعادة التحميل
      if (window.electronIntegration && window.electronIntegration.saveState) {
        window.electronIntegration.saveState();
      }
      
      // المساعدة في تنظيف الذاكرة
      if (window.memoryManager && window.memoryManager.optimizeMemory) {
        window.memoryManager.optimizeMemory();
      }
      
      true; // إرجاع قيمة لمنع خطأ الوعد
    `).finally(() => {
      // إعادة تحميل بعد محاولة الحفظ
      setTimeout(() => {
        if (mainWindow) {
          mainWindow.reload();
          
          // إعادة تعيين حالة التحميل بعد فترة
          setTimeout(() => {
            appState.isReloading = false;
          }, 5000);
        }
      }, 500);
    });
  } catch (error) {
    console.error('فشل في إعادة التحميل الآمن:', error);
    // محاولة إعادة تحميل مباشرة في حالة الفشل
    forceReloadWindow();
  }
}

/**
 * إجبار إعادة تحميل النافذة
 */
function forceReloadWindow() {
  if (!mainWindow) {
    return;
  }
  
  appState.isReloading = true;
  console.log('جاري إجبار إعادة تحميل النافذة...');
  
  try {
    // إعادة تحميل قسرية
    mainWindow.webContents.reloadIgnoringCache();
    
    // إعادة تعيين حالة التحميل بعد فترة
    setTimeout(() => {
      appState.isReloading = false;
    }, 5000);
  } catch (error) {
    console.error('فشل في إجبار إعادة التحميل:', error);
    
    // في حالة الفشل، محاولة إعادة إنشاء النافذة
    try {
      mainWindow.destroy();
      createWindow();
    } catch (recreateError) {
      console.error('فشل في إعادة إنشاء النافذة:', recreateError);
      
      // إذا فشل كل شيء، محاولة إعادة تشغيل التطبيق
      if (APP_CONFIG.AUTO_RECOVERY.AUTO_RESTART_ON_CRASH) {
        app.relaunch();
        app.exit(0);
      }
    }
  }
}

/**
 * فحص استخدام الذاكرة
 */
function checkMemoryUsage() {
  const memoryInfo = process.memoryUsage();
  const heapUsedMB = Math.round(memoryInfo.heapUsed / 1024 / 1024);
  const rssUsedMB = Math.round(memoryInfo.rss / 1024 / 1024);
  
  console.log(`استخدام الذاكرة: ${heapUsedMB} MB (heap), ${rssUsedMB} MB (rss)`);
  
  // التحقق من تجاوز حد التحذير
  if (heapUsedMB > APP_CONFIG.MEMORY_MONITORING.WARNING_THRESHOLD_MB) {
    console.warn(`تحذير: استخدام ذاكرة مرتفع (${heapUsedMB} MB)`);
    appState.memoryWarnings++;
    
    // محاولة تحسين استخدام الذاكرة
    if (global.gc) {
      console.log('جاري تنفيذ جمع القمامة...');
      global.gc();
    }
    
    // إذا كان هناك نافذة، محاولة تنظيف الذاكرة من جانب العميل
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.executeJavaScript(`
        console.warn('تحذير: استخدام ذاكرة مرتفع، جاري التنظيف...');
        
        // تنظيف أي ذاكرة غير مستخدمة
        if (window.memoryManager && window.memoryManager.optimizeMemory) {
          window.memoryManager.optimizeMemory();
        }
        
        true; // إرجاع قيمة لمنع خطأ الوعد
      `).catch(err => console.error('فشل في تنفيذ script تنظيف الذاكرة:', err));
    }
  }
  
  // التحقق من تجاوز الحد الحرج
  if (heapUsedMB > APP_CONFIG.MEMORY_MONITORING.CRITICAL_THRESHOLD_MB) {
    console.error(`استخدام الذاكرة وصل للحد الحرج (${heapUsedMB} MB)، جاري إعادة تحميل التطبيق...`);
    
    // حفظ مخطط الذاكرة إذا كان التمكين مفعلاً
    if (APP_CONFIG.MEMORY_MONITORING.HEAP_DUMP_ENABLED) {
      saveHeapSnapshot();
    }
    
    // إعادة تحميل التطبيق لتحرير الذاكرة
    safeReloadWindow();
  }
}

/**
 * حفظ مخطط الذاكرة
 */
function saveHeapSnapshot() {
  if (!process.memoryUsage || !mainWindow) return;
  
  try {
    const snapshotPath = path.join(app.getPath('userData'), `heap-${Date.now()}.heapsnapshot`);
    console.log(`جاري حفظ مخطط الذاكرة إلى: ${snapshotPath}`);
    
    // طلب مخطط الذاكرة من عملية التقديم
    mainWindow.webContents.takeHeapSnapshot(snapshotPath)
      .then(() => console.log('تم حفظ مخطط الذاكرة بنجاح'))
      .catch(err => console.error('فشل في حفظ مخطط الذاكرة:', err));
  } catch (error) {
    console.error('خطأ أثناء محاولة حفظ مخطط الذاكرة:', error);
  }
}

/**
 * عرض تحذير التجمد للمستخدم
 */
function showFreezeWarningDialog() {
  if (!mainWindow) return;
  
  try {
    dialog.showMessageBox(mainWindow, {
      type: 'warning',
      title: 'مشكلة في أداء التطبيق',
      message: 'تم اكتشاف تجمد متكرر في التطبيق. هل ترغب في إعادة تشغيل التطبيق بالكامل؟',
      detail: 'قد يساعد إعادة التشغيل في حل المشكلات المتعلقة بالأداء وتسريب الذاكرة.',
      buttons: ['استمرار بدون إعادة تشغيل', 'إعادة تشغيل التطبيق'],
      defaultId: 1,
      cancelId: 0
    }).then(result => {
      if (result.response === 1) {
        // إعادة تشغيل التطبيق
        app.relaunch();
        app.exit(0);
      } else {
        // إعادة تعيين عداد التجمد وإعادة تحميل النافذة
        appState.freezeCount = 0;
        safeReloadWindow();
      }
    }).catch(err => {
      console.error('خطأ في عرض مربع الحوار:', err);
    });
  } catch (error) {
    console.error('فشل في عرض تحذير التجمد:', error);
  }
}

/**
 * تسجيل الأخطاء في ملف السجل
 */
function logError(type, data) {
  try {
    const logsDir = path.join(app.getPath('userData'), 'logs');
    
    // إنشاء مجلد السجلات إذا لم يكن موجوداً
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    const now = new Date();
    const logFile = path.join(logsDir, `error-${now.toISOString().slice(0, 10)}.log`);
    
    // تنسيق بيانات السجل
    const logData = {
      type,
      timestamp: now.toISOString(),
      ...data
    };
    
    // إضافة السجل إلى الملف
    fs.appendFileSync(logFile, JSON.stringify(logData) + '\n');
  } catch (error) {
    console.error('فشل في تسجيل الخطأ:', error);
  }
}

/**
 * التحقق مما إذا كان الخطأ يشير إلى تجمد
 */
function isFreezingError(error) {
  if (!error) return false;
  
  // قائمة بالعبارات التي تشير إلى تجمد
  const freezeErrorPatterns = [
    'تجمد',
    'freeze',
    'not responding',
    'script timeout',
    'unresponsive',
    'out of memory',
    'memory limit',
    'stack overflow',
    'maximum call stack',
    'render process gone'
  ];
  
  // تحويل الخطأ إلى نص للبحث
  const errorText = typeof error === 'string' 
    ? error.toLowerCase() 
    : JSON.stringify(error).toLowerCase();
  
  // البحث عن أنماط التجمد في نص الخطأ
  return freezeErrorPatterns.some(pattern => errorText.includes(pattern.toLowerCase()));
}

// تحسين التوافق مع الأنظمة القديمة
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu-rasterization');
app.commandLine.appendSwitch('disable-gpu');
app.disableHardwareAcceleration();

// إذا كان التطبيق يعمل بالفعل، الخروج
const gotTheLock = app.requestSingleLock('investment-system');
if (!gotTheLock) {
  app.quit();
}