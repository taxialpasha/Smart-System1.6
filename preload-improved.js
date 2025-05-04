/**
 * نظام الاستثمار المتكامل - تكامل مع Electron
 * هذا الملف يوفر تكاملاً أفضل مع بيئة Electron ويحسن تعامل التطبيق مع المنصة
 */

// متغيرات حالة التطبيق
let electronAvailable = false;
let pendingRefreshRequest = false;
let lastRefreshTime = 0;
let windowControls = {};

/**
 * التحقق من وجود Electron وتهيئة الوظائف المرتبطة به
 */
function checkElectronEnvironment() {
  // التحقق من وجود واجهة Electron
  electronAvailable = !!window.electronAPI || 
                     (typeof window.windowControls !== 'undefined') || 
                     (typeof window.secureStorage !== 'undefined');
  
  console.log(`تشغيل في بيئة Electron: ${electronAvailable ? 'نعم' : 'لا'}`);
  
  if (electronAvailable) {
    setupElectronIntegration();
  } else {
    setupFallbackIntegration();
  }
}

/**
 * إعداد التكامل مع Electron
 */
function setupElectronIntegration() {
  // تخزين مراجع لوظائف التحكم في النافذة
  windowControls = window.windowControls || {};
  
  // إعداد أزرار التحكم في النافذة
  setupWindowControls();
  
  // تهيئة معالجة الأخطاء وآلية التعافي
  setupErrorHandling();
  
  // إضافة مراقبة موارد النظام
  setupResourceMonitoring();
  
  console.log('تم تهيئة التكامل مع Electron');
}

/**
 * إعداد تكامل احتياطي في حالة عدم وجود Electron
 */
function setupFallbackIntegration() {
  // إعداد محاكاة لوظائف Electron في المتصفح
  windowControls = {
    minimize: function() { console.log('محاكاة: تصغير النافذة'); },
    maximize: function() { console.log('محاكاة: تكبير/استعادة النافذة'); },
    close: function() { 
      if (confirm('هل تريد إغلاق التطبيق؟')) {
        window.close(); 
      }
    }
  };
  
  // إعداد أزرار التحكم في النافذة
  setupWindowControls();
  
  console.log('تم تهيئة واجهة محاكاة Electron');
}

/**
 * إعداد أزرار التحكم في نافذة التطبيق
 */
function setupWindowControls() {
  // البحث عن أزرار التحكم في النافذة
  const minimizeBtn = document.getElementById('minimize-btn');
  const maximizeBtn = document.getElementById('maximize-btn');
  const closeBtn = document.getElementById('close-btn');
  
  // إعداد زر التصغير
  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', function() {
      if (windowControls.minimize) {
        windowControls.minimize();
      }
    });
  }
  
  // إعداد زر التكبير/الاستعادة
  if (maximizeBtn) {
    maximizeBtn.addEventListener('click', function() {
      if (windowControls.maximize) {
        windowControls.maximize();
      }
    });
  }
  
  // إعداد زر الإغلاق
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      // اقتراح حفظ البيانات قبل الإغلاق
      confirmAndSaveBeforeClose();
    });
  }
  
  // إعداد زر تحديث الصفحة
  const refreshToggleBtn = document.getElementById('refresh-toggle-btn');
  if (refreshToggleBtn) {
    refreshToggleBtn.addEventListener('click', function(event) {
      // منع السلوك الافتراضي لتجنب إعادة التحميل المباشرة
      event.preventDefault();
      
      if (confirm('هل تريد تحديث الصفحة بالكامل؟ سيتم حفظ البيانات الحالية.')) {
        // حفظ الحالة الحالية
        saveApplicationState();
        
        // طلب إعادة تحميل آمنة
        safeReloadPage();
      }
    });
  }
  
  // إعداد زر إعادة ضبط المصنع
  const factoryResetBtn = document.getElementById('factory-reset-btn');
  if (factoryResetBtn) {
    // استبدال السلوك الافتراضي بسلوك أكثر أماناً
    factoryResetBtn.addEventListener('click', function(event) {
      // منع السلوك الافتراضي
      event.preventDefault();
      
      // طلب تأكيد مزدوج
      if (confirm('تحذير: سيتم حذف جميع البيانات المحلية. هل أنت متأكد؟')) {
        if (confirm('هذا الإجراء لا يمكن التراجع عنه. هل تريد الاستمرار؟')) {
          performFactoryReset();
        }
      }
    });
  }
}

/**
 * إعداد معالجة الأخطاء وآلية التعافي
 */
function setupErrorHandling() {
  // معالجة الأخطاء غير المتوقعة
  window.addEventListener('error', function(event) {
    console.error('خطأ غير متوقع:', event.error);
    
    // محاولة التعافي إذا كان الخطأ متعلقاً بالواجهة
    if (isUIError(event.error)) {
      console.log('محاولة التعافي من خطأ الواجهة...');
      
      // محاولة تنشيط النماذج أولاً
      if (window.formFixer && window.formFixer.refresh) {
        window.formFixer.refresh();
      }
      
      // إذا استمرت المشكلة، جدولة إعادة تحميل
      if (isFreezingError(event.error)) {
        schedulePageRefresh();
      }
    }
    
    // منع الانتشار الافتراضي للخطأ لمعالجته محلياً
    event.preventDefault();
  });
  
  // معالجة الوعود المرفوضة غير المعالجة
  window.addEventListener('unhandledrejection', function(event) {
    console.error('وعد مرفوض غير معالج:', event.reason);
    
    // التحقق من نوع الخطأ ومحاولة التعافي
    if (isNetworkError(event.reason)) {
      // إعلام المستخدم بمشكلة الاتصال
      showNotification('حدث خطأ في الاتصال. جاري المحاولة مرة أخرى...', 'warning');
      
      // جدولة إعادة محاولة للعمليات
      retryFailedOperations();
    }
    
    // منع الانتشار الافتراضي للخطأ لمعالجته محلياً
    event.preventDefault();
  });
}

/**
 * إعداد مراقبة موارد النظام
 */
function setupResourceMonitoring() {
  // مراقبة استخدام الذاكرة (إذا كان متاحاً)
  if (window.performance && window.performance.memory) {
    setInterval(function() {
      const memoryInfo = window.performance.memory;
      const memoryUsage = Math.round(memoryInfo.usedJSHeapSize / 1048576); // تحويل إلى ميجابايت
      
      console.log(`استخدام الذاكرة: ${memoryUsage} ميجابايت`);
      
      // إذا تجاوز الاستخدام الحد، جدولة إعادة تحميل
      if (memoryUsage > 200) { // أكثر من 200 ميجابايت
        console.warn('تحذير: استخدام ذاكرة مرتفع. جدولة إعادة تحميل الصفحة...');
        schedulePageRefresh();
      }
    }, 60000); // فحص كل دقيقة
  }
}

/**
 * جدولة إعادة تحميل الصفحة بطريقة آمنة
 */
function schedulePageRefresh() {
  // تجنب التحديثات المتكررة
  const now = Date.now();
  if (pendingRefreshRequest || (now - lastRefreshTime < 60000)) {
    return; // تم طلب التحديث بالفعل أو تم التحديث مؤخراً
  }
  
  pendingRefreshRequest = true;
  
  // إظهار إشعار للمستخدم
  showNotification('سيتم إعادة تحميل التطبيق قريباً للحفاظ على الأداء', 'info');
  
  // تأخير قصير قبل إعادة التحميل
  setTimeout(function() {
    saveApplicationState();
    safeReloadPage();
  }, 5000);
}

/**
 * حفظ حالة التطبيق قبل التحميل
 */
function saveApplicationState() {
  try {
    // حفظ الصفحة النشطة الحالية
    const activePage = document.querySelector('.page.active');
    if (activePage) {
      localStorage.setItem('lastActivePage', activePage.id);
    }
    
    // حفظ حالة النموذج المفتوح
    const activeModal = document.querySelector('.modal-overlay.active');
    if (activeModal) {
      localStorage.setItem('lastActiveModal', activeModal.id);
    }
    
    // إرسال حدث لإجبار أنظمة أخرى على حفظ الحالة
    document.dispatchEvent(new CustomEvent('app-save-state'));
    
    console.log('تم حفظ حالة التطبيق قبل إعادة التحميل');
  } catch (error) {
    console.error('فشل في حفظ حالة التطبيق:', error);
  }
}

/**
 * إعادة تحميل الصفحة بطريقة آمنة
 */
function safeReloadPage() {
  lastRefreshTime = Date.now();
  pendingRefreshRequest = false;
  
  try {
    // محاولة استخدام واجهة Electron إذا كانت متاحة
    if (window.electronAPI && window.electronAPI.refreshPage) {
      window.electronAPI.refreshPage();
    } else {
      // استخدام طريقة المتصفح العادية
      location.reload();
    }
  } catch (error) {
    console.error('فشل في إعادة تحميل الصفحة:', error);
    // محاولة أخيرة
    window.location.href = window.location.href;
  }
}

/**
 * تنفيذ إعادة ضبط المصنع
 */
function performFactoryReset() {
  try {
    // عرض مؤشر التحميل
    showLoading('جاري إعادة ضبط النظام...');
    
    // حذف جميع بيانات التخزين المحلي
    localStorage.clear();
    sessionStorage.clear();
    
    // إزالة ملفات تخزين IndexedDB إذا كانت مستخدمة
    const databases = indexedDB.databases ? indexedDB.databases() : [];
    if (databases.length) {
      databases.forEach(db => {
        indexedDB.deleteDatabase(db.name);
      });
    }
    
    // إزالة الكوكيز
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    
    // إظهار رسالة نجاح
    showNotification('تم إعادة ضبط النظام بنجاح. سيتم إعادة تشغيل التطبيق الآن.', 'success');
    
    // تأخير إعادة التحميل قليلاً لعرض الرسالة
    setTimeout(function() {
      window.location.href = window.location.href;
    }, 2000);
  } catch (error) {
    console.error('فشل في إعادة ضبط النظام:', error);
    hideLoading();
    showNotification('حدث خطأ أثناء إعادة ضبط النظام. يرجى المحاولة مرة أخرى.', 'error');
  }
}

/**
 * التأكيد وحفظ البيانات قبل إغلاق التطبيق
 */
function confirmAndSaveBeforeClose() {
  // التحقق من وجود تغييرات غير محفوظة
  const hasUnsavedChanges = checkForUnsavedChanges();
  
  if (hasUnsavedChanges) {
    // طلب تأكيد من المستخدم
    if (confirm('هناك تغييرات غير محفوظة. هل تريد حفظها قبل الإغلاق؟')) {
      // محاولة حفظ البيانات
      saveAllData(function() {
        // بعد الحفظ، إغلاق التطبيق
        executeClose();
      });
    } else if (confirm('سيتم فقدان التغييرات غير المحفوظة. هل تريد الإغلاق على أي حال؟')) {
      // الإغلاق بدون حفظ
      executeClose();
    }
  } else {
    // لا توجد تغييرات، الإغلاق مباشرة
    executeClose();
  }
}

/**
 * تنفيذ إغلاق التطبيق
 */
function executeClose() {
  if (windowControls.close) {
    windowControls.close();
  }
}

/**
 * التحقق من وجود تغييرات غير محفوظة
 */
function checkForUnsavedChanges() {
  // التحقق من النماذج النشطة
  const activeModals = document.querySelectorAll('.modal-overlay.active');
  if (activeModals.length > 0) {
    return true;
  }
  
  // التحقق من الحقول المعدلة
  const modifiedInputs = document.querySelectorAll('input.modified, textarea.modified, select.modified');
  if (modifiedInputs.length > 0) {
    return true;
  }
  
  // إرسال حدث للتحقق من وجود تغييرات غير محفوظة في المكونات الأخرى
  let hasUnsavedChanges = false;
  const event = new CustomEvent('check-unsaved-changes', {
    detail: { hasUnsavedChanges: false },
    bubbles: true,
    cancelable: true
  });
  
  document.dispatchEvent(event);
  
  if (event.detail.hasUnsavedChanges) {
    return true;
  }
  
  return false;
}

/**
 * حفظ جميع البيانات
 */
function saveAllData(callback) {
  // عرض مؤشر التحميل
  showLoading('جاري حفظ البيانات...');
  
  // إرسال حدث لحفظ البيانات في المكونات المختلفة
  const event = new CustomEvent('save-all-data', {
    detail: { callback: onSaveComplete },
    bubbles: true,
    cancelable: true
  });
  
  document.dispatchEvent(event);
  
  // وظيفة اكتمال الحفظ
  function onSaveComplete(success) {
    hideLoading();
    
    if (success) {
      showNotification('تم حفظ البيانات بنجاح', 'success');
    } else {
      showNotification('حدث خطأ أثناء حفظ البيانات', 'error');
    }
    
    if (typeof callback === 'function') {
      callback(success);
    }
  }
}

/**
 * التحقق من نوع الخطأ
 */
function isUIError(error) {
  if (!error) return false;
  
  // أنواع أخطاء الواجهة المعروفة
  const uiErrorMessages = [
    'كائن غير معرف',
    'لا يمكن قراءة خاصية',
    'لا يمكن تعيين خاصية',
    'document.querySelector',
    'undefined is not an object',
    'null is not an object',
    'is not a function',
    'is not defined',
    'cannot read property'
  ];
  
  const errorStr = error.toString().toLowerCase();
  return uiErrorMessages.some(msg => errorStr.includes(msg.toLowerCase()));
}

/**
 * التحقق مما إذا كان الخطأ يشير إلى تجمد
 */
function isFreezingError(error) {
  if (!error) return false;
  
  // أنواع أخطاء التجمد المعروفة
  const freezeErrorMessages = [
    'script taking too long',
    'unresponsive script',
    'out of memory',
    'memory limit',
    'stack overflow',
    'Maximum call stack size exceeded'
  ];
  
  const errorStr = error.toString().toLowerCase();
  return freezeErrorMessages.some(msg => errorStr.includes(msg.toLowerCase()));
}

/**
 * التحقق مما إذا كان الخطأ متعلقاً بالشبكة
 */
function isNetworkError(error) {
  if (!error) return false;
  
  // أنواع أخطاء الشبكة المعروفة
  const networkErrorMessages = [
    'network error',
    'timeout',
    'abort',
    'connection refused',
    'connection failed',
    'offline',
    'failed to fetch'
  ];
  
  const errorStr = error.toString().toLowerCase();
  return networkErrorMessages.some(msg => errorStr.includes(msg.toLowerCase()));
}

/**
 * إعادة محاولة العمليات الفاشلة
 */
function retryFailedOperations() {
  // إرسال حدث لإعادة محاولة العمليات الفاشلة
  document.dispatchEvent(new CustomEvent('retry-operations'));
}

/**
 * إظهار مؤشر التحميل
 */
function showLoading(message) {
  // التحقق من وجود عنصر التحميل
  let loadingElement = document.getElementById('app-loading-indicator');
  
  if (!loadingElement) {
    // إنشاء عنصر التحميل
    loadingElement = document.createElement('div');
    loadingElement.id = 'app-loading-indicator';
    loadingElement.className = 'loading-overlay';
    
    // إنشاء المحتوى
    loadingElement.innerHTML = `
      <div class="loading-spinner"></div>
      <div class="loading-message">${message || 'جاري التحميل...'}</div>
    `;
    
    // إضافة العنصر إلى الصفحة
    document.body.appendChild(loadingElement);
  } else {
    // تحديث الرسالة
    const messageElement = loadingElement.querySelector('.loading-message');
    if (messageElement) {
      messageElement.textContent = message || 'جاري التحميل...';
    }
    
    // إظهار العنصر
    loadingElement.style.display = 'flex';
  }
}

/**
 * إخفاء مؤشر التحميل
 */
function hideLoading() {
  const loadingElement = document.getElementById('app-loading-indicator');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
}

/**
 * إظهار إشعار للمستخدم
 */
function showNotification(message, type) {
  // استخدام نظام الإشعارات الحالي إذا كان موجوداً
  if (window.showNotification && typeof window.showNotification === 'function') {
    window.showNotification(message, type);
    return;
  }
  
  // إنشاء إشعار مؤقت بسيط
  const notification = document.createElement('div');
  notification.className = `notification notification-${type || 'info'}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // إخفاء الإشعار بعد فترة
  setTimeout(() => {
    notification.classList.add('notification-hiding');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, 3000);
}

// تصدير الوظائف للاستخدام الخارجي
window.electronIntegration = {
  init: checkElectronEnvironment,
  reload: safeReloadPage,
  saveState: saveApplicationState,
  showLoading: showLoading,
  hideLoading: hideLoading,
  showNotification: showNotification
};

// إضافة الأنماط اللازمة
const styles = document.createElement('style');
styles.innerHTML = `
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-message {
  margin-top: 15px;
  color: white;
  font-size: 16px;
  text-align: center;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 4px;
  color: white;
  font-size: 14px;
  z-index: 9998;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  max-width: 80%;
}

.notification-success {
  background-color: #2ecc71;
}

.notification-error {
  background-color: #e74c3c;
}

.notification-warning {
  background-color: #f39c12;
}

.notification-info {
  background-color: #3498db;
}

.notification-hiding {
  opacity: 0;
  transform: translateY(20px);
}
`;

document.head.appendChild(styles);

// بدء فحص بيئة التشغيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', checkElectronEnvironment);