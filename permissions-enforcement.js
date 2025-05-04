/**
 * نظام تطبيق الصلاحيات
 * يقوم هذا الملف بتطبيق نظام الصلاحيات على جميع وظائف التطبيق
 * بحيث يتم تقييد الوصول إلى الوظائف حسب صلاحيات المستخدم
 */

// كائن عام لإدارة الصلاحيات في التطبيق
const PermissionsEnforcement = (function() {
    // تخزين صلاحيات المستخدم الحالي
    let currentUserPermissions = {};
    
    // قائمة الصلاحيات المتاحة في النظام
    const availablePermissions = {
        canCreateUsers: 'إنشاء مستخدمين جدد',
        canDeleteUsers: 'حذف المستخدمين',
        canManageSettings: 'إدارة إعدادات النظام',
        canDeleteInvestors: 'حذف المستثمرين',
        canExportData: 'تصدير البيانات',
        canImportData: 'استيراد البيانات',
        canCreateBackup: 'إنشاء نسخ احتياطية',
        canRestoreBackup: 'استعادة النسخ الاحتياطية',
        canAddInvestors: 'إضافة مستثمرين جدد',
        canEditInvestors: 'تعديل بيانات المستثمرين',
        canProcessDeposits: 'إضافة إيداعات جديدة',
        canProcessWithdrawals: 'إجراء عمليات السحب',
        canPayProfits: 'دفع الأرباح للمستثمرين',
        canViewReports: 'عرض وإنشاء التقارير'
    };
    
    // ربط الصلاحيات بعناصر واجهة المستخدم وأزرار التطبيق
    const actionPermissionsMap = {
        // صفحة المستثمرين
        '#add-investor-btn': 'canAddInvestors',
        '.edit-investor': 'canEditInvestors',
        '.delete-investor': 'canDeleteInvestors',
        '#save-investor-btn': 'canAddInvestors',
        
        // صفحة العمليات
        '#add-deposit-btn': 'canProcessDeposits',
        '#add-withdraw-btn': 'canProcessWithdrawals',
        '#save-deposit-btn': 'canProcessDeposits',
        '#save-withdraw-btn': 'canProcessWithdrawals',
        '.edit-transaction': 'canEditInvestors',
        
        // صفحة الأرباح
        '#pay-profits-btn': 'canPayProfits',
        '.pay-profit-btn': 'canPayProfits',
        '#confirm-pay-profit': 'canPayProfits',
        
        // صفحة التقارير
        '#reports-page button': 'canViewReports',
        
        // الإعدادات
        '#settings-page form button[type="submit"]': 'canManageSettings',
        
        // النسخ الاحتياطي
        'button[title="تنزيل نسخة احتياطية"]': 'canCreateBackup',
        'button[title="استعادة من نسخة احتياطية"]': 'canRestoreBackup',
        '#create-backup-btn': 'canCreateBackup',
        '#restore-backup-btn': 'canRestoreBackup',
        
        // تصدير البيانات
        'button[title="تصدير"]': 'canExportData',
        '.export-data-btn': 'canExportData',
        
        // شريط الإضافة العائم
        '#add-new-fab': ['canAddInvestors', 'canProcessDeposits', 'canProcessWithdrawals', 'canPayProfits']
    };
    
    // ربط الصلاحيات بالصفحات
    const pagePermissionsMap = {
        'investors': {
            view: true, // الجميع يمكنه عرض صفحة المستثمرين
            add: 'canAddInvestors',
            edit: 'canEditInvestors',
            delete: 'canDeleteInvestors'
        },
        'transactions': {
            view: true,
            add: ['canProcessDeposits', 'canProcessWithdrawals'],
            edit: 'canEditInvestors'
        },
        'profits': {
            view: true,
            pay: 'canPayProfits'
        },
        'reports': {
            view: 'canViewReports'
        },
        'settings': {
            view: 'canManageSettings',
            save: 'canManageSettings'
        },
        'user-management': {
            view: 'canCreateUsers',
            add: 'canCreateUsers',
            delete: 'canDeleteUsers',
            edit: 'canCreateUsers'
        }
    };
    
    // وظائف التطبيق التي يجب تقييدها حسب الصلاحيات
    const functionsToEnforce = {
        'addNewInvestor': 'canAddInvestors',
        'editInvestor': 'canEditInvestors',
        'deleteInvestor': 'canDeleteInvestors',
        'addDeposit': 'canProcessDeposits',
        'withdrawAmount': 'canProcessWithdrawals',
        'payProfit': 'canPayProfits',
        'saveGeneralSettings': 'canManageSettings',
        'saveProfitsSettings': 'canManageSettings',
        'saveNotificationsSettings': 'canManageSettings',
        'exportData': 'canExportData',
        'createBackup': 'canCreateBackup',
        'restoreBackup': 'canRestoreBackup'
    };
    
    /**
     * تحميل صلاحيات المستخدم الحالي من Firebase
     * @returns {Promise<Object>} وعد يحتوي على صلاحيات المستخدم
     */
    function loadCurrentUserPermissions() {
        return new Promise((resolve, reject) => {
            if (!firebase || !firebase.auth) {
                console.error('Firebase غير متاح، لا يمكن تحميل الصلاحيات');
                resolve({});
                return;
            }
            
            // التحقق من وجود مستخدم حالي
            const currentUser = firebase.auth().currentUser;
            if (!currentUser) {
                console.log('لا يوجد مستخدم مسجل الدخول، تفعيل الوضع المقيد');
                resolve({});
                return;
            }
            
            // تحميل الصلاحيات من Firebase
            const userId = currentUser.uid;
            firebase.database().ref(`users/${userId}/permissions`).once('value')
                .then(snapshot => {
                    const permissions = snapshot.val() || {};
                    console.log('تم تحميل صلاحيات المستخدم:', permissions);
                    
                    // تخزين الصلاحيات
                    currentUserPermissions = permissions;
                    
                    resolve(permissions);
                })
                .catch(error => {
                    console.error('خطأ في تحميل صلاحيات المستخدم:', error);
                    reject(error);
                });
        });
    }
    
    /**
     * التحقق من صلاحية معينة للمستخدم الحالي
     * @param {string|Array} permission - الصلاحية أو مصفوفة من الصلاحيات المطلوبة (يكفي واحدة منها)
     * @returns {boolean} - ما إذا كان المستخدم يملك الصلاحية أم لا
     */
    function hasPermission(permission) {
        // إذا لم يتم تحديد صلاحية، يسمح بالوصول افتراضيًا
        if (!permission) return true;
        
        // التحقق من مصفوفة من الصلاحيات (إذا كان المستخدم يملك واحدة منها على الأقل)
        if (Array.isArray(permission)) {
            return permission.some(p => currentUserPermissions[p] === true);
        }
        
        // تحقق من صلاحية واحدة
        return currentUserPermissions[permission] === true;
    }
    
    /**
     * تطبيق الصلاحيات على عناصر واجهة المستخدم
     */
    function enforceUIPermissions() {
        console.log('تطبيق الصلاحيات على واجهة المستخدم...');
        
        // تطبيق الصلاحيات على الأزرار والعناصر
        for (const [selector, permission] of Object.entries(actionPermissionsMap)) {
            const elements = document.querySelectorAll(selector);
            
            elements.forEach(element => {
                if (!hasPermission(permission)) {
                    // إخفاء أو تعطيل العنصر إذا لم يكن المستخدم يملك الصلاحية
                    if (element.tagName === 'BUTTON' || element.tagName === 'A') {
                        element.disabled = true;
                        element.classList.add('disabled');
                        element.setAttribute('title', 'ليس لديك صلاحية لهذا الإجراء');
                        
                        // إضافة مستمع للنقر لعرض تنبيه
                        element.addEventListener('click', preventActionWithNoPermission);
                    } else {
                        element.style.display = 'none';
                    }
                } else {
                    // تمكين العنصر إذا كان المستخدم يملك الصلاحية
                    if (element.tagName === 'BUTTON' || element.tagName === 'A') {
                        element.disabled = false;
                        element.classList.remove('disabled');
                        element.removeAttribute('title');
                        
                        // إزالة مستمع حدث التنبيه إذا كان موجودًا
                        element.removeEventListener('click', preventActionWithNoPermission);
                    } else {
                        element.style.display = '';
                    }
                }
            });
        }
        
        // تطبيق الصلاحيات على عناصر الشريط الجانبي
        enforceNavigationPermissions();
    }
    
    /**
     * تطبيق الصلاحيات على عناصر التنقل في الشريط الجانبي
     */
    function enforceNavigationPermissions() {
        for (const [page, permissions] of Object.entries(pagePermissionsMap)) {
            // التحقق من صلاحية عرض الصفحة
            const canViewPage = permissions.view === true || hasPermission(permissions.view);
            
            // البحث عن رابط الصفحة في الشريط الجانبي
            const navLink = document.querySelector(`.nav-link[data-page="${page}"]`);
            if (navLink) {
                const navItem = navLink.closest('.nav-item');
                
                if (!canViewPage) {
                    // إخفاء عنصر القائمة إذا لم يكن المستخدم يملك صلاحية عرض الصفحة
                    if (navItem) {
                        navItem.style.display = 'none';
                    } else {
                        navLink.style.display = 'none';
                    }
                } else {
                    // إظهار عنصر القائمة إذا كان المستخدم يملك صلاحية عرض الصفحة
                    if (navItem) {
                        navItem.style.display = '';
                    } else {
                        navLink.style.display = '';
                    }
                    
                    // إضافة مستمع حدث للتحقق من الصلاحيات عند النقر على الرابط
                    navLink.addEventListener('click', function(e) {
                        if (!canViewPage) {
                            e.preventDefault();
                            e.stopPropagation();
                            showNoPermissionAlert('عرض هذه الصفحة');
                        }
                    });
                }
            }
        }
    }
    
    /**
     * منع الإجراء عند عدم وجود صلاحية
     * @param {Event} e - حدث النقر
     */
    function preventActionWithNoPermission(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // عرض رسالة تنبيه
        showNoPermissionAlert();
    }
    
    /**
     * عرض تنبيه عدم وجود صلاحية
     * @param {string} action - الإجراء الذي لا يملك المستخدم صلاحية له
     */
    function showNoPermissionAlert(action = 'هذا الإجراء') {
        // إذا كان هناك دالة عرض إشعارات في التطبيق
        if (typeof window.showNotification === 'function') {
            window.showNotification(`ليس لديك صلاحية لـ${action}، يرجى التواصل مع مسؤول النظام.`, 'error');
        } else {
            alert(`ليس لديك صلاحية لـ${action}، يرجى التواصل مع مسؤول النظام.`);
        }
    }
    
    /**
     * تفويف الوظائف الأصلية بدوال تتحقق من الصلاحيات
     */
    function enforceFunctionsPermissions() {
        console.log('تطبيق الصلاحيات على وظائف التطبيق...');
        
        for (const [functionName, permission] of Object.entries(functionsToEnforce)) {
            // التحقق من وجود الدالة في النافذة
            if (typeof window[functionName] === 'function') {
                // حفظ الدالة الأصلية
                const originalFunction = window[functionName];
                
                // استبدال الدالة بنسخة تتحقق من الصلاحيات
                window[functionName] = function(...args) {
                    // التحقق من امتلاك المستخدم للصلاحية
                    if (!hasPermission(permission)) {
                        console.log(`منع تنفيذ ${functionName} بسبب عدم وجود صلاحية ${permission}`);
                        showNoPermissionAlert();
                        return;
                    }
                    
                    // تنفيذ الدالة الأصلية إذا كان المستخدم يملك الصلاحية
                    return originalFunction.apply(this, args);
                };
                
                // تخزين مرجع للدالة الأصلية
                window[functionName]._original = originalFunction;
                
                console.log(`تم تفويف الدالة ${functionName} بالصلاحية ${permission}`);
            }
        }
    }
    
    /**
     * إعادة تعيين الدوال الأصلية (مفيد عند تسجيل الخروج)
     */
    function resetFunctions() {
        console.log('إعادة تعيين الدوال الأصلية...');
        
        for (const functionName of Object.keys(functionsToEnforce)) {
            if (typeof window[functionName] === 'function' && window[functionName]._original) {
                window[functionName] = window[functionName]._original;
                console.log(`تم إعادة تعيين الدالة ${functionName} إلى الأصلية`);
            }
        }
    }
    
    /**
     * تهيئة نظام تطبيق الصلاحيات
     * @returns {Promise} - وعد يتم حله عند اكتمال التهيئة
     */
    function init() {
        console.log('تهيئة نظام تطبيق الصلاحيات...');
        
        // إضافة أنماط CSS للعناصر المعطلة
        addDisabledStyles();
        
        // تحميل صلاحيات المستخدم الحالي
        return loadCurrentUserPermissions()
            .then(() => {
                // تطبيق الصلاحيات على واجهة المستخدم
                enforceUIPermissions();
                
                // تفويف الوظائف
                enforceFunctionsPermissions();
                
                // إضافة مستمع لتحديث التطبيق عند تغيير الصلاحيات
                setupChangeListener();
                
                // إضافة مستمع لأحداث تغيير الصفحة
                setupPageChangeListener();
                
                // إضافة مستمع لتحديث الصلاحيات عند تسجيل الدخول/الخروج
                setupAuthListener();
                
                return true;
            })
            .catch(error => {
                console.error('خطأ في تهيئة نظام تطبيق الصلاحيات:', error);
                return false;
            });
    }
    
    /**
     * تهيئة مستمع لتغيير الصلاحيات
     */
    function setupChangeListener() {
        if (!firebase || !firebase.auth || !firebase.auth().currentUser) return;
        
        const userId = firebase.auth().currentUser.uid;
        firebase.database().ref(`users/${userId}/permissions`).on('value', snapshot => {
            const newPermissions = snapshot.val() || {};
            
            // تحديث الصلاحيات المخزنة
            currentUserPermissions = newPermissions;
            console.log('تم تحديث صلاحيات المستخدم:', newPermissions);
            
            // إعادة تطبيق الصلاحيات على واجهة المستخدم
            enforceUIPermissions();
        });
    }
    
    /**
     * تهيئة مستمع لتغيير الصفحة
     */
    function setupPageChangeListener() {
        // مستمع لأحداث النقر على روابط التنقل
        document.addEventListener('click', function(e) {
            const navLink = e.target.closest('.nav-link[data-page]');
            if (!navLink) return;
            
            const page = navLink.getAttribute('data-page');
            const permissions = pagePermissionsMap[page];
            
            if (permissions && permissions.view !== true && !hasPermission(permissions.view)) {
                e.preventDefault();
                e.stopPropagation();
                showNoPermissionAlert(`الوصول إلى صفحة ${page}`);
            }
        });
        
        // مستمع للنوافذ المنبثقة
        document.addEventListener('click', function(e) {
            const modalTrigger = e.target.closest('[data-modal]');
            if (!modalTrigger) return;
            
            const modalId = modalTrigger.getAttribute('data-modal');
            
            // التحقق من صلاحيات النوافذ المنبثقة
            if (modalId === 'add-investor-modal' && !hasPermission('canAddInvestors')) {
                e.preventDefault();
                e.stopPropagation();
                showNoPermissionAlert('إضافة مستثمر جديد');
            } else if (modalId === 'add-deposit-modal' && !hasPermission('canProcessDeposits')) {
                e.preventDefault();
                e.stopPropagation();
                showNoPermissionAlert('إضافة إيداع جديد');
            } else if (modalId === 'add-withdraw-modal' && !hasPermission('canProcessWithdrawals')) {
                e.preventDefault();
                e.stopPropagation();
                showNoPermissionAlert('إجراء عملية سحب');
            } else if (modalId === 'pay-profit-modal' && !hasPermission('canPayProfits')) {
                e.preventDefault();
                e.stopPropagation();
                showNoPermissionAlert('دفع الأرباح');
            }
        });
    }
    
    /**
     * تهيئة مستمع لتغيير حالة المصادقة
     */
    function setupAuthListener() {
        if (!firebase || !firebase.auth) return;
        
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                // المستخدم مسجل الدخول، تحميل الصلاحيات
                loadCurrentUserPermissions()
                    .then(() => {
                        enforceUIPermissions();
                        enforceFunctionsPermissions();
                    });
            } else {
                // المستخدم غير مسجل الدخول، إعادة تعيين الصلاحيات
                currentUserPermissions = {};
                resetFunctions();
            }
        });
    }
    
    /**
     * إضافة أنماط CSS للعناصر المعطلة
     */
    function addDisabledStyles() {
        const styleElement = document.createElement('style');
        styleElement.id = 'permissions-disabled-styles';
        styleElement.textContent = `
            .disabled, button:disabled, a.disabled {
                opacity: 0.5;
                cursor: not-allowed !important;
                pointer-events: all !important;
            }
            
            button.disabled:hover, a.disabled:hover {
                background-color: inherit !important;
                color: inherit !important;
                box-shadow: none !important;
            }
            
            .permission-tooltip {
                position: absolute;
                background-color: rgba(15, 23, 42, 0.9);
                color: white;
                padding: 6px 10px;
                border-radius: 4px;
                font-size: 0.8rem;
                z-index: 1000;
                max-width: 200px;
                text-align: center;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s ease;
            }
            
            .permission-tooltip.visible {
                opacity: 1;
            }
        `;
        
        document.head.appendChild(styleElement);
    }
    
    /**
     * إضافة توبتيب للعناصر المعطلة
     */
    function addDisabledTooltips() {
        const disabledElements = document.querySelectorAll('.disabled, button:disabled');
        
        disabledElements.forEach(element => {
            element.addEventListener('mouseenter', function(e) {
                // إنشاء التوبتيب
                const tooltip = document.createElement('div');
                tooltip.className = 'permission-tooltip';
                tooltip.textContent = 'ليس لديك صلاحية لهذا الإجراء';
                
                // حساب موضع التوبتيب
                const rect = element.getBoundingClientRect();
                tooltip.style.top = `${rect.bottom + 5}px`;
                tooltip.style.left = `${rect.left + (rect.width / 2) - 100}px`;
                
                // إضافة التوبتيب للصفحة
                document.body.appendChild(tooltip);
                
                // إظهار التوبتيب
                setTimeout(() => {
                    tooltip.classList.add('visible');
                }, 10);
                
                // تخزين مرجع للتوبتيب في العنصر
                element._tooltip = tooltip;
            });
            
            element.addEventListener('mouseleave', function() {
                // إخفاء وإزالة التوبتيب
                if (element._tooltip) {
                    element._tooltip.classList.remove('visible');
                    
                    setTimeout(() => {
                        if (element._tooltip.parentNode) {
                            element._tooltip.parentNode.removeChild(element._tooltip);
                        }
                        element._tooltip = null;
                    }, 200);
                }
            });
        });
    }
    
    /**
     * تحديث الصلاحيات وإعادة تطبيقها
     */
    function refreshPermissions() {
        return loadCurrentUserPermissions()
            .then(() => {
                enforceUIPermissions();
                enforceFunctionsPermissions();
                addDisabledTooltips();
                return true;
            });
    }
    
    // تصدير الواجهة العامة
    return {
        init,
        hasPermission,
        refreshPermissions,
        getCurrentPermissions: () => ({...currentUserPermissions}),
        getAvailablePermissions: () => ({...availablePermissions})
    };
})();

// تهيئة نظام تطبيق الصلاحيات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة نظام تطبيق الصلاحيات
    PermissionsEnforcement.init()
        .then(initialized => {
            console.log('تم تهيئة نظام تطبيق الصلاحيات:', initialized ? 'بنجاح' : 'فشل');
            
            if (initialized) {
                // إضافة توبتيب للعناصر المعطلة بعد تطبيق الصلاحيات
                setTimeout(() => {
                    addDisabledTooltips();
                }, 500);
                
                // إضافة معلومات الصلاحيات للمطورين في وحدة التحكم
                logPermissionsInfo();
            }
        });
});

/**
 * إضافة توبتيب للعناصر المعطلة
 */
function addDisabledTooltips() {
    const disabledElements = document.querySelectorAll('.disabled, button:disabled');
    
    disabledElements.forEach(element => {
        // إزالة مستمعي الأحداث السابقة
        element.removeEventListener('mouseenter', showTooltip);
        element.removeEventListener('mouseleave', hideTooltip);
        
        // إضافة مستمعي الأحداث الجديدة
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

/**
 * عرض التوبتيب
 * @param {Event} e - حدث الماوس
 */
function showTooltip(e) {
    // إنشاء التوبتيب
    const tooltip = document.createElement('div');
    tooltip.className = 'permission-tooltip';
    tooltip.textContent = 'ليس لديك صلاحية لهذا الإجراء';
    
    // حساب موضع التوبتيب
    const rect = this.getBoundingClientRect();
    tooltip.style.top = `${rect.bottom + 5}px`;
    tooltip.style.left = `${rect.left + (rect.width / 2) - 100}px`;
    
    // إضافة التوبتيب للصفحة
    document.body.appendChild(tooltip);
    
    // إظهار التوبتيب
    setTimeout(() => {
        tooltip.classList.add('visible');
    }, 10);
    
    // تخزين مرجع للتوبتيب في العنصر
    this._tooltip = tooltip;
}

/**
 * إخفاء التوبتيب
 */
function hideTooltip() {
    // إخفاء وإزالة التوبتيب
    if (this._tooltip) {
        this._tooltip.classList.remove('visible');
        
        setTimeout(() => {
            if (this._tooltip && this._tooltip.parentNode) {
                this._tooltip.parentNode.removeChild(this._tooltip);
            }
            this._tooltip = null;
        }, 200);
    }
}

/**
 * عرض معلومات الصلاحيات في وحدة التحكم للمطورين
 */
function logPermissionsInfo() {
    const currentPermissions = PermissionsEnforcement.getCurrentPermissions();
    const availablePermissions = PermissionsEnforcement.getAvailablePermissions();
    
    console.group('معلومات صلاحيات المستخدم الحالي:');
    console.log('الصلاحيات المتاحة:', availablePermissions);
    console.log('صلاحيات المستخدم الحالي:', currentPermissions);
    
    // عرض ملخص للصلاحيات
    const summaryTable = {};
    for (const [key, description] of Object.entries(availablePermissions)) {
        summaryTable[description] = currentPermissions[key] ? '✅ مسموح' : '❌ غير مسموح';
    }
    console.table(summaryTable);
    console.groupEnd();
}

// تحديث صلاحيات واجهة المستخدم عند تغيير الصفحة
document.addEventListener('page:change', function(e) {
    if (!e.detail || !e.detail.page) return;
    
    console.log(`تحديث صلاحيات صفحة: ${e.detail.page}`);
    setTimeout(() => {
        PermissionsEnforcement.refreshPermissions();
    }, 100);
});

// مراقبة النوافذ المنبثقة
const originalShowModal = window.showModal;
if (typeof originalShowModal === 'function') {
    window.showModal = function(title, content) {
        const result = originalShowModal(title, content);
        
        // تطبيق الصلاحيات على العناصر في النافذة المنبثقة
        setTimeout(() => {
            PermissionsEnforcement.refreshPermissions();
        }, 100);
        
        return result;
    };
}

// مراقبة فتح النوافذ المنبثقة
const originalOpenModal = window.openModal;
if (typeof originalOpenModal === 'function') {
    window.openModal = function(modalId) {
        const result = originalOpenModal(modalId);
        
        // تطبيق الصلاحيات على العناصر في النافذة المنبثقة
        setTimeout(() => {
            PermissionsEnforcement.refreshPermissions();
        }, 100);
        
        return result;
    };
}

// تصدير نظام الصلاحيات للاستخدام العام
window.PermissionsEnforcement = PermissionsEnforcement;