/**
 * نظام مراقبة الصلاحيات للتطبيق
 * يقوم هذا الملف بمراقبة صلاحيات المستخدمين وتطبيقها في الوقت الفعلي
 * يوفر واجهة لعرض حالة الصلاحيات الحالية وتشخيص مشاكل الصلاحيات
 */

// كائن مراقبة الصلاحيات
const PermissionsMonitor = (function() {
    // حالة المراقبة
    let isMonitoring = false;
    
    // حالة الصلاحيات الحالية
    let permissionsStatus = {
        user: null,
        permissions: {},
        lastUpdate: null,
        restrictedActions: [],
        history: []
    };
    
    // مراقب التغييرات
    let permissionsObserver = null;
    
    /**
     * بدء مراقبة صلاحيات المستخدم الحالي
     */
    function startMonitoring() {
        if (isMonitoring) return;
        
        console.log('بدء مراقبة صلاحيات المستخدم...');
        
        // التحقق من تسجيل دخول المستخدم
        if (!firebase || !firebase.auth || !firebase.auth().currentUser) {
            console.warn('لا يوجد مستخدم مسجل الدخول، لا يمكن بدء المراقبة');
            return;
        }
        
        const userId = firebase.auth().currentUser.uid;
        
        // تحديث معلومات المستخدم
        updateUserInfo();
        
        // مراقبة تغييرات الصلاحيات
        permissionsObserver = firebase.database().ref(`users/${userId}/permissions`).on('value', snapshot => {
            const permissions = snapshot.val() || {};
            
            // تحديث حالة الصلاحيات
            permissionsStatus.permissions = permissions;
            permissionsStatus.lastUpdate = new Date();
            
            // إضافة إلى التاريخ
            permissionsStatus.history.push({
                timestamp: Date.now(),
                event: 'تحديث الصلاحيات',
                permissions: {...permissions}
            });
            
            // تحديد الإجراءات المقيدة
            updateRestrictedActions();
            
            // تحديث واجهة المستخدم
            updateUIVisibility();
            
            console.log('تم تحديث صلاحيات المستخدم:', permissions);
        });
        
        isMonitoring = true;
    }
    
    /**
     * إيقاف مراقبة الصلاحيات
     */
    function stopMonitoring() {
        if (!isMonitoring) return;
        
        console.log('إيقاف مراقبة صلاحيات المستخدم...');
        
        // إلغاء مراقب التغييرات
        if (firebase && firebase.database && permissionsObserver) {
            const userId = firebase.auth().currentUser?.uid;
            if (userId) {
                firebase.database().ref(`users/${userId}/permissions`).off('value', permissionsObserver);
            }
        }
        
        permissionsObserver = null;
        isMonitoring = false;
    }
    
    /**
     * تحديث معلومات المستخدم الحالي
     */
    function updateUserInfo() {
        if (!firebase || !firebase.auth || !firebase.auth().currentUser) {
            permissionsStatus.user = null;
            return;
        }
        
        const user = firebase.auth().currentUser;
        
        // تحميل معلومات المستخدم من قاعدة البيانات
        firebase.database().ref(`users/${user.uid}/profile`).once('value')
            .then(snapshot => {
                const profile = snapshot.val() || {};
                
                permissionsStatus.user = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || profile.displayName || user.email,
                    type: profile.type || 'user',
                    emailVerified: user.emailVerified,
                    createdAt: profile.createdAt || null
                };
                
                // إضافة إلى التاريخ
                permissionsStatus.history.push({
                    timestamp: Date.now(),
                    event: 'تحديث معلومات المستخدم',
                    user: {...permissionsStatus.user}
                });
            })
            .catch(error => {
                console.error('خطأ في تحديث معلومات المستخدم:', error);
            });
    }
    
    /**
     * تحديث قائمة الإجراءات المقيدة بناءً على الصلاحيات الحالية
     */
    function updateRestrictedActions() {
        const restrictedActions = [];
        const allPermissions = {
            canAddInvestors: 'إضافة مستثمرين جدد',
            canEditInvestors: 'تعديل بيانات المستثمرين',
            canDeleteInvestors: 'حذف المستثمرين',
            canProcessDeposits: 'إضافة إيداعات',
            canProcessWithdrawals: 'إجراء عمليات سحب',
            canPayProfits: 'دفع الأرباح',
            canManageSettings: 'إدارة إعدادات النظام',
            canExportData: 'تصدير البيانات',
            canImportData: 'استيراد البيانات',
            canCreateBackup: 'إنشاء نسخ احتياطية',
            canRestoreBackup: 'استعادة النسخ الاحتياطية',
            canCreateUsers: 'إنشاء مستخدمين جدد',
            canDeleteUsers: 'حذف المستخدمين',
            canViewReports: 'عرض التقارير'
        };
        
        // البحث عن الصلاحيات غير الممنوحة
        for (const [permission, description] of Object.entries(allPermissions)) {
            if (!permissionsStatus.permissions[permission]) {
                restrictedActions.push({
                    permission,
                    description
                });
            }
        }
        
        permissionsStatus.restrictedActions = restrictedActions;
    }
    
    /**
     * تحديث ظهور عناصر واجهة المستخدم بناءً على الصلاحيات
     */
    function updateUIVisibility() {
        // إذا كان نظام الصلاحيات الرئيسي موجودًا، دعه يقوم بالتحديث
        if (window.PermissionsEnforcement && typeof window.PermissionsEnforcement.refreshPermissions === 'function') {
            window.PermissionsEnforcement.refreshPermissions();
            return;
        }
        
        // إذا كان نظام تكامل الصلاحيات موجودًا، دعه يقوم بالتحديث
        if (window.PermissionsIntegration && typeof window.PermissionsIntegration.refreshPermissions === 'function') {
            window.PermissionsIntegration.refreshPermissions();
            return;
        }
        
        // تحديث يدوي لعناصر واجهة المستخدم
        updateUIElementsVisibility();
    }
    
    /**
     * تحديث ظهور عناصر واجهة المستخدم يدويًا
     */
    function updateUIElementsVisibility() {
        const permissionsMap = {
            // أزرار صفحة المستثمرين
            '#add-investor-btn': 'canAddInvestors',
            '.edit-investor': 'canEditInvestors',
            '.delete-investor': 'canDeleteInvestors',
            
            // أزرار صفحة العمليات
            '#add-deposit-btn': 'canProcessDeposits',
            '#add-withdraw-btn': 'canProcessWithdrawals',
            
            // أزرار صفحة الأرباح
            '#pay-profits-btn': 'canPayProfits',
            '.pay-profit-btn': 'canPayProfits',
            
            // أزرار الإعدادات
            '#general-settings-form button[type="submit"]': 'canManageSettings',
            '#profits-settings-form button[type="submit"]': 'canManageSettings',
            '#notifications-settings-form button[type="submit"]': 'canManageSettings',
            
            // أزرار النسخ الاحتياطي
            'button[title="تنزيل نسخة احتياطية"]': 'canCreateBackup',
            'button[title="استعادة من نسخة احتياطية"]': 'canRestoreBackup',
            
            // أزرار التصدير
            'button[title="تصدير"]': 'canExportData'
        };
        
        // تطبيق الصلاحيات على العناصر
        for (const [selector, permission] of Object.entries(permissionsMap)) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (!permissionsStatus.permissions[permission]) {
                    // تعطيل العنصر
                    element.disabled = true;
                    element.classList.add('permission-disabled');
                    element.setAttribute('title', `ليس لديك صلاحية: ${permission}`);
                } else {
                    // تمكين العنصر
                    element.disabled = false;
                    element.classList.remove('permission-disabled');
                    element.removeAttribute('title');
                }
            });
        }
        
        // تطبيق الصلاحيات على الروابط في الشريط الجانبي
        const navMap = {
            'user-management': 'canCreateUsers',
            'settings': 'canManageSettings'
        };
        
        for (const [page, permission] of Object.entries(navMap)) {
            const navLink = document.querySelector(`.nav-link[data-page="${page}"]`);
            if (navLink) {
                const navItem = navLink.closest('.nav-item');
                if (!permissionsStatus.permissions[permission]) {
                    // إخفاء الرابط
                    if (navItem) {
                        navItem.style.display = 'none';
                    } else {
                        navLink.style.display = 'none';
                    }
                } else {
                    // إظهار الرابط
                    if (navItem) {
                        navItem.style.display = '';
                    } else {
                        navLink.style.display = '';
                    }
                }
            }
        }
    }
    
    /**
     * عرض حالة الصلاحيات الحالية في وحدة التحكم
     */
    function displayStatus() {
        console.group('حالة صلاحيات المستخدم الحالي');
        
        // معلومات المستخدم
        console.log('معلومات المستخدم:', permissionsStatus.user);
        
        // الصلاحيات الحالية
        console.log('الصلاحيات الحالية:', permissionsStatus.permissions);
        
        // الإجراءات المقيدة
        console.log('الإجراءات المقيدة:', permissionsStatus.restrictedActions);
        
        // تاريخ التحديث
        console.log('آخر تحديث:', permissionsStatus.lastUpdate);
        
        console.groupEnd();
        
        return permissionsStatus;
    }
    
    /**
     * عرض تاريخ تغييرات الصلاحيات
     */
    function displayHistory() {
        console.group('تاريخ تغييرات الصلاحيات');
        
        if (permissionsStatus.history.length === 0) {
            console.log('لا يوجد تاريخ تغييرات');
        } else {
            // عرض التاريخ مرتبًا من الأحدث للأقدم
            permissionsStatus.history
                .slice()
                .reverse()
                .forEach((entry, index) => {
                    console.log(`[${new Date(entry.timestamp).toLocaleString()}] ${entry.event}`, entry);
                });
        }
        
        console.groupEnd();
        
        return permissionsStatus.history;
    }
    
    /**
     * إنشاء لوحة معلومات الصلاحيات
     */
    function createDashboard() {
        // التحقق من وجود اللوحة مسبقًا
        if (document.getElementById('permissions-dashboard')) {
            return;
        }
        
        // إنشاء عنصر اللوحة
        const dashboard = document.createElement('div');
        dashboard.id = 'permissions-dashboard';
        dashboard.className = 'permissions-dashboard';
        
        // إضافة محتوى اللوحة
        dashboard.innerHTML = `
            <div class="dashboard-header">
                <h3>لوحة معلومات الصلاحيات</h3>
                <button class="dashboard-close">&times;</button>
            </div>
            <div class="dashboard-content">
                <div class="user-info-section">
                    <h4>معلومات المستخدم</h4>
                    <div id="user-info-content">
                        <p>جارٍ التحميل...</p>
                    </div>
                </div>
                <div class="permissions-section">
                    <h4>الصلاحيات الحالية</h4>
                    <div id="permissions-content">
                        <p>جارٍ التحميل...</p>
                    </div>
                </div>
                <div class="restricted-actions-section">
                    <h4>الإجراءات المقيدة</h4>
                    <div id="restricted-actions-content">
                        <p>جارٍ التحميل...</p>
                    </div>
                </div>
            </div>
            <div class="dashboard-footer">
                <button id="refresh-permissions-btn" class="btn btn-primary">
                    <i class="fas fa-sync-alt"></i>
                    <span>تحديث الصلاحيات</span>
                </button>
                <button id="reset-permissions-btn" class="btn btn-danger">
                    <i class="fas fa-undo"></i>
                    <span>إعادة تعيين للافتراضي</span>
                </button>
            </div>
        `;
        
        // إضافة أنماط CSS للوحة
        addDashboardStyles();
        
        // إضافة اللوحة للصفحة
        document.body.appendChild(dashboard);
        
        // إضافة مستمعي الأحداث
        setupDashboardListeners(dashboard);
        
        // تحديث محتوى اللوحة
        updateDashboardContent();
    }
    
    /**
     * تحديث محتوى لوحة المعلومات
     */
    function updateDashboardContent() {
        // تحديث معلومات المستخدم
        const userInfoContent = document.getElementById('user-info-content');
        if (userInfoContent) {
            if (permissionsStatus.user) {
                userInfoContent.innerHTML = `
                    <div class="user-info-card">
                        <div class="user-avatar">${permissionsStatus.user.displayName ? permissionsStatus.user.displayName.charAt(0).toUpperCase() : 'U'}</div>
                        <div class="user-details">
                            <div class="user-name">${permissionsStatus.user.displayName || 'غير محدد'}</div>
                            <div class="user-email">${permissionsStatus.user.email}</div>
                            <div class="user-type">
                                <span class="badge ${permissionsStatus.user.type}">${getUserTypeLabel(permissionsStatus.user.type)}</span>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                userInfoContent.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-user-slash"></i>
                        <p>لا يوجد مستخدم مسجل الدخول</p>
                    </div>
                `;
            }
        }
        
        // تحديث الصلاحيات الحالية
        const permissionsContent = document.getElementById('permissions-content');
        if (permissionsContent) {
            const permissionsCount = Object.entries(permissionsStatus.permissions).filter(([_, value]) => value === true).length;
            
            if (permissionsCount > 0) {
                let permissionsHTML = '<div class="permissions-grid">';
                
                // ترتيب الصلاحيات في مجموعات
                const permissionGroups = {
                    'المستثمرين': ['canAddInvestors', 'canEditInvestors', 'canDeleteInvestors'],
                    'العمليات': ['canProcessDeposits', 'canProcessWithdrawals', 'canPayProfits'],
                    'النظام': ['canManageSettings', 'canExportData', 'canImportData', 'canCreateBackup', 'canRestoreBackup'],
                    'المستخدمين': ['canCreateUsers', 'canDeleteUsers', 'canViewReports']
                };
                
                for (const [groupName, groupPermissions] of Object.entries(permissionGroups)) {
                    permissionsHTML += `<div class="permission-group"><h5>${groupName}</h5>`;
                    
                    groupPermissions.forEach(permission => {
                        const isGranted = permissionsStatus.permissions[permission] === true;
                        permissionsHTML += `
                            <div class="permission-item ${isGranted ? 'granted' : 'denied'}">
                                <span class="permission-icon">
                                    <i class="fas ${isGranted ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                                </span>
                                <span class="permission-label">${getPermissionLabel(permission)}</span>
                            </div>
                        `;
                    });
                    
                    permissionsHTML += '</div>';
                }
                
                permissionsHTML += '</div>';
                permissionsContent.innerHTML = permissionsHTML;
            } else {
                permissionsContent.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-lock"></i>
                        <p>لا توجد صلاحيات ممنوحة</p>
                    </div>
                `;
            }
        }
        
        // تحديث الإجراءات المقيدة
        const restrictedActionsContent = document.getElementById('restricted-actions-content');
        if (restrictedActionsContent) {
            if (permissionsStatus.restrictedActions.length > 0) {
                restrictedActionsContent.innerHTML = `
                    <ul class="restricted-actions-list">
                        ${permissionsStatus.restrictedActions.map(action => `
                            <li>
                                <i class="fas fa-ban"></i>
                                <span>${action.description}</span>
                            </li>
                        `).join('')}
                    </ul>
                `;
            } else {
                restrictedActionsContent.innerHTML = `
                    <div class="empty-state success">
                        <i class="fas fa-check-circle"></i>
                        <p>لديك جميع الصلاحيات</p>
                    </div>
                `;
            }
        }
    }
    
    /**
     * إضافة مستمعي الأحداث للوحة المعلومات
     * @param {HTMLElement} dashboard - عنصر لوحة المعلومات
     */
    function setupDashboardListeners(dashboard) {
        // زر إغلاق اللوحة
        const closeButton = dashboard.querySelector('.dashboard-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                dashboard.classList.add('hidden');
                setTimeout(() => {
                    dashboard.remove();
                }, 300);
            });
        }
        
        // زر تحديث الصلاحيات
        const refreshButton = dashboard.querySelector('#refresh-permissions-btn');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                // تحديث الصلاحيات
                if (window.PermissionsFix && typeof window.PermissionsFix.loadUserPermissions === 'function') {
                    window.PermissionsFix.loadUserPermissions()
                        .then(() => {
                            updateDashboardContent();
                            showNotification('تم تحديث الصلاحيات بنجاح', 'success');
                        })
                        .catch(error => {
                            console.error('خطأ في تحديث الصلاحيات:', error);
                            showNotification('حدث خطأ أثناء تحديث الصلاحيات', 'error');
                        });
                } else {
                    // إعادة تحميل الصلاحيات
                    updateUserInfo();
                    updateRestrictedActions();
                    updateDashboardContent();
                    showNotification('تم تحديث الصلاحيات بنجاح', 'success');
                }
            });
        }
        
        // زر إعادة تعيين الصلاحيات
        const resetButton = dashboard.querySelector('#reset-permissions-btn');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                // التأكد من رغبة المستخدم
                if (!confirm('هل أنت متأكد من إعادة تعيين الصلاحيات للإعدادات الافتراضية؟')) {
                    return;
                }
                
                // إعادة تعيين الصلاحيات
                resetPermissionsToDefault()
                    .then(() => {
                        updateDashboardContent();
                        showNotification('تم إعادة تعيين الصلاحيات بنجاح', 'success');
                    })
                    .catch(error => {
                        console.error('خطأ في إعادة تعيين الصلاحيات:', error);
                        showNotification('حدث خطأ أثناء إعادة تعيين الصلاحيات', 'error');
                    });
            });
        }
    }
    
    /**
     * إعادة تعيين الصلاحيات للإعدادات الافتراضية
     * @returns {Promise} وعد يتم حله عند اكتمال العملية
     */
    function resetPermissionsToDefault() {
        return new Promise((resolve, reject) => {
            if (!firebase || !firebase.auth || !firebase.auth().currentUser) {
                reject(new Error('لا يوجد مستخدم مسجل الدخول'));
                return;
            }
            
            const user = firebase.auth().currentUser;
            
            // تحميل معلومات المستخدم للحصول على نوعه
            firebase.database().ref(`users/${user.uid}/profile`).once('value')
                .then(snapshot => {
                    const profile = snapshot.val() || {};
                    const userType = profile.type || 'user';
                    
                    // الحصول على الصلاحيات الافتراضية
                    const defaultPermissions = getDefaultPermissions(userType);
                    
                    // تحديث الصلاحيات في قاعدة البيانات
                    return firebase.database().ref(`users/${user.uid}/permissions`).set(defaultPermissions)
                        .then(() => {
                            // تحديث الصلاحيات المحلية
                            permissionsStatus.permissions = defaultPermissions;
                            updateRestrictedActions();
                            
                            // إضافة إلى التاريخ
                            permissionsStatus.history.push({
                                timestamp: Date.now(),
                                event: 'إعادة تعيين الصلاحيات',
                                permissions: {...defaultPermissions}
                            });
                            
                            resolve(defaultPermissions);
                        });
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
    
    /**
     * الحصول على الصلاحيات الافتراضية حسب نوع المستخدم
     * @param {string} userType - نوع المستخدم
     * @returns {Object} الصلاحيات الافتراضية
     */
    function getDefaultPermissions(userType) {
        const defaultPermissions = {
            admin: {
                canCreateUsers: true,
                canDeleteUsers: true,
                canManageSettings: true,
                canDeleteInvestors: true,
                canExportData: true,
                canImportData: true,
                canCreateBackup: true,
                canRestoreBackup: true,
                canAddInvestors: true,
                canEditInvestors: true,
                canProcessDeposits: true,
                canProcessWithdrawals: true,
                canPayProfits: true,
                canViewReports: true
            },
            manager: {
                canCreateUsers: false,
                canDeleteUsers: false,
                canManageSettings: true,
                canDeleteInvestors: false,
                canExportData: true,
                canImportData: true,
                canCreateBackup: true,
                canRestoreBackup: false,
                canAddInvestors: true,
                canEditInvestors: true,
                canProcessDeposits: true,
                canProcessWithdrawals: true,
                canPayProfits: true,
                canViewReports: true
            },
            user: {
                canCreateUsers: false,
                canDeleteUsers: false,
                canManageSettings: false,
                canDeleteInvestors: false,
                canExportData: true,
                canImportData: false,
                canCreateBackup: false,
                canRestoreBackup: false,
                canAddInvestors: false,
                canEditInvestors: false,
                canProcessDeposits: false,
                canProcessWithdrawals: false,
                canPayProfits: false,
                canViewReports: true
            }
        };
        
        return defaultPermissions[userType] || defaultPermissions.user;
    }
    
    /**
     * الحصول على وصف نوع المستخدم
     * @param {string} type - نوع المستخدم
     * @returns {string} وصف نوع المستخدم
     */
    function getUserTypeLabel(type) {
        const types = {
            admin: 'مسؤول النظام',
            manager: 'مدير',
            user: 'مستخدم'
        };
        
        return types[type] || 'غير معروف';
    }
    
    /**
     * الحصول على وصف الصلاحية
     * @param {string} permission - اسم الصلاحية
     * @returns {string} وصف الصلاحية
     */
    function getPermissionLabel(permission) {
        const permissions = {
            canAddInvestors: 'إضافة مستثمرين',
            canEditInvestors: 'تعديل المستثمرين',
            canDeleteInvestors: 'حذف المستثمرين',
            canProcessDeposits: 'إضافة إيداعات',
            canProcessWithdrawals: 'إجراء عمليات سحب',
            canPayProfits: 'دفع الأرباح',
            canManageSettings: 'إدارة الإعدادات',
            canExportData: 'تصدير البيانات',
            canImportData: 'استيراد البيانات',
            canCreateBackup: 'إنشاء نسخة احتياطية',
            canRestoreBackup: 'استعادة نسخة احتياطية',
            canCreateUsers: 'إنشاء مستخدمين',
            canDeleteUsers: 'حذف المستخدمين',
            canViewReports: 'عرض التقارير'
        };
        
        return permissions[permission] || permission;
    }
    
    /**
     * عرض رسالة إشعار للمستخدم
     * @param {string} message - نص الرسالة
     * @param {string} type - نوع الرسالة (success, error, info, warning)
     */
    function showNotification(message, type = 'info') {
        // استخدام دالة الإشعارات إذا كانت موجودة
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
            return;
        }
        
        // إنشاء إشعار مخصص إذا لم تكن دالة الإشعارات موجودة
        const notification = document.createElement('div');
        notification.className = `custom-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${getNotificationIcon(type)}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        // إضافة الإشعار للصفحة
        document.body.appendChild(notification);
        
        // إظهار الإشعار
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // إضافة مستمع حدث للزر إغلاق
        const closeButton = notification.querySelector('.notification-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                notification.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            });
        }
        
        // إخفاء الإشعار تلقائيًا بعد 5 ثواني
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }
    
    /**
     * الحصول على أيقونة الإشعار المناسبة
     * @param {string} type - نوع الإشعار
     * @returns {string} اسم أيقونة Font Awesome
     */
    function getNotificationIcon(type) {
        switch (type) {
            case 'success':
                return 'fa-check-circle';
            case 'error':
                return 'fa-times-circle';
            case 'warning':
                return 'fa-exclamation-triangle';
            default:
                return 'fa-info-circle';
        }
    }
    
    /**
     * إضافة أنماط CSS للوحة المعلومات
     */
    function addDashboardStyles() {
        // التحقق من وجود الأنماط مسبقًا
        if (document.getElementById('permissions-dashboard-styles')) {
            return;
        }
        
        // إنشاء عنصر نمط جديد
        const style = document.createElement('style');
        style.id = 'permissions-dashboard-styles';
        style.textContent = `
            .permissions-dashboard {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 80%;
                max-width: 800px;
                max-height: 80vh;
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                z-index: 9999;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                animation: dashboard-fade-in 0.3s ease;
            }
            
            .permissions-dashboard.hidden {
                animation: dashboard-fade-out 0.3s ease;
            }
            
            .dashboard-header {
                padding: 16px 20px;
                background-color: #f8f9fa;
                border-bottom: 1px solid #e9ecef;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .dashboard-header h3 {
                margin: 0;
                font-size: 1.2rem;
                color: #343a40;
            }
            
            .dashboard-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #6c757d;
                padding: 0;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.2s;
            }
            
            .dashboard-close:hover {
                background-color: #e9ecef;
            }
            
            .dashboard-content {
                padding: 20px;
                overflow-y: auto;
                max-height: calc(80vh - 130px);
            }
            
            .dashboard-content h4 {
                margin: 0 0 10px 0;
                font-size: 1.1rem;
                color: #343a40;
                border-bottom: 1px solid #e9ecef;
                padding-bottom: 8px;
            }
            
            .user-info-section,
            .permissions-section,
            .restricted-actions-section {
                margin-bottom: 24px;
            }
            
            .user-info-card {
                display: flex;
                align-items: center;
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 16px;
            }
            
            .user-avatar {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background-color: #3b82f6;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                font-weight: 600;
                margin-left: 16px;
            }
            
            .user-details {
                flex: 1;
            }
            
            .user-name {
                font-weight: 600;
                margin-bottom: 4px;
            }
            
            .user-email {
                color: #6c757d;
                margin-bottom: 8px;
                font-size: 0.9rem;
            }
            
            .user-type .badge {
                display: inline-block;
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 0.8rem;
                font-weight: 600;
            }
            
            .badge.admin {
                background-color: #fef2f2;
                color: #dc2626;
            }
            
            .badge.manager {
                background-color: #fffbeb;
                color: #d97706;
            }
            
            .badge.user {
                background-color: #eff6ff;
                color: #2563eb;
            }
            
            .permissions-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                gap: 16px;
            }
            
            .permission-group {
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 12px;
            }
            
            .permission-group h5 {
                margin: 0 0 10px 0;
                font-size: 0.95rem;
                color: #4b5563;
                border-bottom: 1px solid #e9ecef;
                padding-bottom: 6px;
            }
            
            .permission-item {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
                padding: 6px 8px;
                border-radius: 4px;
                background-color: #fff;
            }
            
            .permission-item.granted {
                background-color: #f0fdf4;
            }
            
            .permission-item.denied {
                background-color: #fef2f2;
            }
            
            .permission-icon {
                margin-left: 8px;
            }
            
            .permission-item.granted .permission-icon i {
                color: #16a34a;
            }
            
            .permission-item.denied .permission-icon i {
                color: #dc2626;
            }
            
            .permission-label {
                font-size: 0.9rem;
            }
            
            .restricted-actions-list {
                list-style: none;
                padding: 0;
                margin: 0;
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 12px;
            }
            
            .restricted-actions-list li {
                display: flex;
                align-items: center;
                padding: 8px;
                margin-bottom: 8px;
                background-color: #fef2f2;
                border-radius: 4px;
            }
            
            .restricted-actions-list li i {
                color: #dc2626;
                margin-left: 8px;
            }
            
            .empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 24px;
                text-align: center;
            }
            
            .empty-state i {
                font-size: 2rem;
                color: #6c757d;
                margin-bottom: 16px;
            }
            
            .empty-state p {
                margin: 0;
                color: #4b5563;
            }
            
            .empty-state.success i {
                color: #16a34a;
            }
            
            .dashboard-footer {
                padding: 16px 20px;
                background-color: #f8f9fa;
                border-top: 1px solid #e9ecef;
                display: flex;
                justify-content: flex-end;
                gap: 8px;
            }
            
            /* Custom notification styles */
            .custom-notification {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%) translateY(-100px);
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                display: flex;
                padding: 12px 16px;
                min-width: 300px;
                max-width: 500px;
                z-index: 10000;
                transition: transform 0.3s ease, opacity 0.3s ease;
                opacity: 0;
            }
            
            .custom-notification.show {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
            
            .custom-notification .notification-icon {
                margin-left: 12px;
                font-size: 1.2rem;
            }
            
            .custom-notification .notification-content {
                flex: 1;
            }
            
            .custom-notification .notification-message {
                font-size: 0.95rem;
            }
            
            .custom-notification .notification-close {
                background: none;
                border: none;
                font-size: 1.2rem;
                cursor: pointer;
                color: #6c757d;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .custom-notification.success .notification-icon {
                color: #16a34a;
            }
            
            .custom-notification.error .notification-icon {
                color: #dc2626;
            }
            
            .custom-notification.warning .notification-icon {
                color: #d97706;
            }
            
            .custom-notification.info .notification-icon {
                color: #2563eb;
            }
            
            @keyframes dashboard-fade-in {
                from {
                    opacity: 0;
                    transform: translate(-50%, -55%);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%);
                }
            }
            
            @keyframes dashboard-fade-out {
                from {
                    opacity: 1;
                    transform: translate(-50%, -50%);
                }
                to {
                    opacity: 0;
                    transform: translate(-50%, -55%);
                }
            }
            
            @media (max-width: 768px) {
                .permissions-dashboard {
                    width: 95%;
                    max-width: none;
                    max-height: 90vh;
                }
                
                .permissions-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * تهيئة نظام مراقبة الصلاحيات
     */
    function init() {
        console.log('تهيئة نظام مراقبة الصلاحيات...');
        
        // تحديث معلومات المستخدم والصلاحيات
        updateUserInfo();
        
        // بدء مراقبة الصلاحيات
        startMonitoring();
        
        // إضافة مستمع لتغييرات المصادقة
        if (firebase && firebase.auth) {
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    // المستخدم مسجل الدخول، بدء المراقبة
                    updateUserInfo();
                    startMonitoring();
                } else {
                    // المستخدم غير مسجل الدخول، إيقاف المراقبة
                    stopMonitoring();
                    permissionsStatus.user = null;
                    permissionsStatus.permissions = {};
                    permissionsStatus.restrictedActions = [];
                }
            });
        }
        
        // إضافة اختصار لوحة المفاتيح لفتح لوحة المعلومات
        document.addEventListener('keydown', function(e) {
            // Ctrl + Alt + P (أو Cmd + Alt + P في ماك)
            if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === 'p') {
                e.preventDefault();
                createDashboard();
            }
        });
        
        console.log('تم تهيئة نظام مراقبة الصلاحيات بنجاح');
    }
    
    // تصدير الواجهة العامة
    return {
        init,
        startMonitoring,
        stopMonitoring,
        displayStatus,
        displayHistory,
        createDashboard,
        getCurrentStatus: () => ({...permissionsStatus})
    };
})();

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تأخير التهيئة قليلاً للتأكد من تحميل Firebase
    setTimeout(() => {
        PermissionsMonitor.init();
    }, 1000);
});

// تصدير نظام مراقبة الصلاحيات للاستخدام العام
window.PermissionsMonitor = PermissionsMonitor;