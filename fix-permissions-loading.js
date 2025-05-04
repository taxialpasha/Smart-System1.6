/**
 * إصلاح تحميل الصلاحيات وتكاملها مع تطبيق نظام الاستثمار
 * يقوم هذا الملف بالتأكد من تحميل صلاحيات المستخدم من Firebase بالشكل الصحيح
 * وربطها مع نظام الصلاحيات الأساسي ونظام المصادقة
 */

/**
 * نظام إصلاح وتحسين الصلاحيات
 */
const PermissionsFix = (function() {
    // نسخة مخزنة من صلاحيات المستخدم الحالي
    let currentUserPermissions = {};
    
    // الصلاحيات الافتراضية حسب نوع المستخدم
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
            canCreateBackup: false,
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
    
    /**
     * تحميل صلاحيات المستخدم الحالي من Firebase
     * @returns {Promise<Object>} وعد يحتوي على صلاحيات المستخدم
     */
    function loadUserPermissions() {
        return new Promise((resolve, reject) => {
            if (!firebase || !firebase.auth) {
                console.error('Firebase غير متاح، لا يمكن تحميل الصلاحيات');
                resolve(getDefaultPermissions('user'));
                return;
            }
            
            const user = firebase.auth().currentUser;
            if (!user) {
                console.log('لا يوجد مستخدم مسجل الدخول، تحميل صلاحيات المستخدم العادي');
                resolve(getDefaultPermissions('user'));
                return;
            }
            
            // تحميل معلومات المستخدم أولاً للحصول على نوعه
            firebase.database().ref(`users/${user.uid}/profile`).once('value')
                .then(profileSnapshot => {
                    const profileData = profileSnapshot.val() || {};
                    const userType = profileData.type || 'user';
                    
                    // تحميل صلاحيات المستخدم
                    return firebase.database().ref(`users/${user.uid}/permissions`).once('value')
                        .then(permissionsSnapshot => {
                            let permissions = permissionsSnapshot.val();
                            
                            // إذا لم تكن هناك صلاحيات محددة، استخدم الصلاحيات الافتراضية حسب نوع المستخدم
                            if (!permissions) {
                                permissions = getDefaultPermissions(userType);
                                
                                // حفظ الصلاحيات الافتراضية في قاعدة البيانات للمستقبل
                                firebase.database().ref(`users/${user.uid}/permissions`).set(permissions)
                                    .then(() => {
                                        console.log(`تم إنشاء صلاحيات افتراضية للمستخدم من النوع: ${userType}`);
                                    })
                                    .catch(error => {
                                        console.error('خطأ في حفظ الصلاحيات الافتراضية:', error);
                                    });
                            }
                            
                            // تخزين الصلاحيات محليًا
                            currentUserPermissions = permissions;
                            console.log('تم تحميل صلاحيات المستخدم:', permissions);
                            
                            // تحديث الصلاحيات في النظام الرئيسي إذا كان موجودًا
                            if (window.PermissionsEnforcement) {
                                window.PermissionsEnforcement.refreshPermissions();
                            } else if (window.PermissionsIntegration) {
                                window.PermissionsIntegration.refreshPermissions();
                            }
                            
                            resolve(permissions);
                        });
                })
                .catch(error => {
                    console.error('خطأ في تحميل صلاحيات المستخدم:', error);
                    
                    // في حالة الخطأ، استخدم صلاحيات المستخدم العادي
                    const fallbackPermissions = getDefaultPermissions('user');
                    currentUserPermissions = fallbackPermissions;
                    resolve(fallbackPermissions);
                });
        });
    }
    
    /**
     * الحصول على الصلاحيات الافتراضية حسب نوع المستخدم
     * @param {string} userType - نوع المستخدم (admin, manager, user)
     * @returns {Object} - الصلاحيات الافتراضية
     */
    function getDefaultPermissions(userType) {
        return defaultPermissions[userType] || defaultPermissions.user;
    }
    
    /**
     * التأكد من وجود صلاحيات للمستخدم
     * @param {string} userId - معرف المستخدم
     * @param {string} userType - نوع المستخدم
     * @returns {Promise} - وعد يتم حله عند التأكد من وجود الصلاحيات
     */
    function ensureUserPermissions(userId, userType) {
        return new Promise((resolve, reject) => {
            if (!firebase || !firebase.database) {
                reject(new Error('Firebase غير متاح'));
                return;
            }
            
            // التحقق من وجود صلاحيات للمستخدم
            firebase.database().ref(`users/${userId}/permissions`).once('value')
                .then(snapshot => {
                    if (snapshot.exists()) {
                        // الصلاحيات موجودة بالفعل
                        resolve(snapshot.val());
                        return;
                    }
                    
                    // إنشاء صلاحيات افتراضية
                    const defaultPerms = getDefaultPermissions(userType);
                    
                    // حفظ الصلاحيات في قاعدة البيانات
                    return firebase.database().ref(`users/${userId}/permissions`).set(defaultPerms)
                        .then(() => {
                            console.log(`تم إنشاء صلاحيات افتراضية للمستخدم: ${userId}`);
                            resolve(defaultPerms);
                        });
                })
                .catch(error => {
                    console.error('خطأ في التأكد من صلاحيات المستخدم:', error);
                    reject(error);
                });
        });
    }
    
    /**
     * تحديث صلاحيات المستخدم
     * @param {string} userId - معرف المستخدم
     * @param {Object} permissions - الصلاحيات الجديدة
     * @returns {Promise} - وعد يتم حله عند تحديث الصلاحيات
     */
    function updateUserPermissions(userId, permissions) {
        return new Promise((resolve, reject) => {
            if (!firebase || !firebase.database) {
                reject(new Error('Firebase غير متاح'));
                return;
            }
            
            // تحديث الصلاحيات في قاعدة البيانات
            firebase.database().ref(`users/${userId}/permissions`).update(permissions)
                .then(() => {
                    console.log(`تم تحديث صلاحيات المستخدم: ${userId}`);
                    
                    // إذا كان هذا هو المستخدم الحالي، تحديث الصلاحيات المخزنة محليًا
                    if (firebase.auth().currentUser && firebase.auth().currentUser.uid === userId) {
                        currentUserPermissions = {...currentUserPermissions, ...permissions};
                        
                        // تحديث نظام الصلاحيات
                        if (window.PermissionsEnforcement) {
                            window.PermissionsEnforcement.refreshPermissions();
                        } else if (window.PermissionsIntegration) {
                            window.PermissionsIntegration.refreshPermissions();
                        }
                    }
                    
                    resolve(true);
                })
                .catch(error => {
                    console.error('خطأ في تحديث صلاحيات المستخدم:', error);
                    reject(error);
                });
        });
    }
    
    /**
     * مراقبة تغييرات صلاحيات المستخدم الحالي
     */
    function watchCurrentUserPermissions() {
        if (!firebase || !firebase.auth || !firebase.database) {
            console.warn('Firebase غير متاح، لا يمكن مراقبة تغييرات الصلاحيات');
            return;
        }
        
        // مراقبة تغيير المستخدم
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                // المستخدم مسجل الدخول، مراقبة تغييرات الصلاحيات
                const userId = user.uid;
                
                // مراقبة تغييرات الصلاحيات
                firebase.database().ref(`users/${userId}/permissions`).on('value', snapshot => {
                    const permissions = snapshot.val() || {};
                    
                    // تحديث الصلاحيات المخزنة محليًا
                    currentUserPermissions = permissions;
                    
                    // تحديث نظام الصلاحيات
                    if (window.PermissionsEnforcement) {
                        window.PermissionsEnforcement.refreshPermissions();
                    } else if (window.PermissionsIntegration) {
                        window.PermissionsIntegration.refreshPermissions();
                    }
                    
                    console.log('تم تحديث صلاحيات المستخدم الحالي:', permissions);
                });
            } else {
                // المستخدم غير مسجل الدخول، إعادة تعيين الصلاحيات
                currentUserPermissions = {};
                
                // إلغاء مراقبة التغييرات السابقة إذا كان هناك مستخدم سابق
                if (firebase.auth().currentUser) {
                    firebase.database().ref(`users/${firebase.auth().currentUser.uid}/permissions`).off();
                }
            }
        });
    }
    
    /**
     * تهيئة نظام إصلاح الصلاحيات
     */
    function init() {
        console.log('تهيئة نظام إصلاح الصلاحيات...');
        
        // تحميل صلاحيات المستخدم الحالي
        loadUserPermissions()
            .then(permissions => {
                console.log('تم تحميل صلاحيات المستخدم بنجاح:', permissions);
                
                // مراقبة تغييرات الصلاحيات
                watchCurrentUserPermissions();
                
                // تحديث وظائف نظام المصادقة إذا كان موجودًا
                enhanceAuthSystem();
            })
            .catch(error => {
                console.error('خطأ في تهيئة نظام إصلاح الصلاحيات:', error);
            });
    }
    
    /**
     * تحسين نظام المصادقة بإضافة وظائف الصلاحيات
     */
    function enhanceAuthSystem() {
        if (!window.AuthSystem) {
            console.warn('نظام المصادقة غير موجود، لا يمكن تحسينه');
            return;
        }
        
        console.log('تحسين نظام المصادقة بإضافة وظائف الصلاحيات...');
        
        // إضافة وظيفة للحصول على صلاحيات المستخدم الحالي
        window.AuthSystem.getUserPermissions = function() {
            return {...currentUserPermissions};
        };
        
        // إضافة وظيفة للتحقق من صلاحية معينة
        window.AuthSystem.hasPermission = function(permission) {
            // إذا كان نظام الصلاحيات الرئيسي موجودًا، استخدمه
            if (window.PermissionsEnforcement) {
                return window.PermissionsEnforcement.hasPermission(permission);
            }
            
            // إذا كان نظام تكامل الصلاحيات موجودًا، استخدمه
            if (window.PermissionsIntegration) {
                return window.PermissionsIntegration.hasPermission(permission);
            }
            
            // التحقق من الصلاحية مباشرة
            if (Array.isArray(permission)) {
                return permission.some(p => currentUserPermissions[p] === true);
            }
            
            return currentUserPermissions[permission] === true;
        };
        
        // تعديل دالة الحصول على معلومات المستخدم لإضافة الصلاحيات
        const originalGetUserInfo = window.AuthSystem.getUserInfo;
        window.AuthSystem.getUserInfo = function() {
            const userInfo = originalGetUserInfo.call(window.AuthSystem);
            
            if (userInfo) {
                userInfo.permissions = {...currentUserPermissions};
            }
            
            return userInfo;
        };
        
        console.log('تم تحسين نظام المصادقة بإضافة وظائف الصلاحيات');
    }
    
    // تصدير الواجهة العامة
    return {
        init,
        loadUserPermissions,
        ensureUserPermissions,
        updateUserPermissions,
        getCurrentPermissions: () => ({...currentUserPermissions})
    };
})();

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تأخير التهيئة قليلاً للتأكد من تحميل Firebase
    setTimeout(() => {
        PermissionsFix.init();
    }, 500);
});

// تصدير نظام إصلاح الصلاحيات للاستخدام العام
window.PermissionsFix = PermissionsFix;


/**
 * نظام الاستثمار المتكامل - الشريط الجانبي والتنقل
 * يتحكم في وظائف الشريط الجانبي والتنقل بين الصفحات المختلفة
 */

class Navigation {
    constructor() {
        // عناصر واجهة المستخدم
        this.sidebar = document.querySelector('.sidebar');
        this.mainContent = document.querySelector('.main-content');
        this.toggleButtons = document.querySelectorAll('.toggle-sidebar');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.pages = document.querySelectorAll('.page');
        
        // تعيين الصفحة النشطة
        this.activePage = 'dashboard';
        
        // معدلات التغيير
        this.transitionDuration = 300; // مللي ثانية
        
        // تهيئة الأحداث
        this.initEvents();
        
        // تطبيق حالة الشريط الجانبي المحفوظة
        this.applySavedSidebarState();
    }
    
    // تهيئة الأحداث
    initEvents() {
        // أحداث أزرار طي/فتح الشريط الجانبي
        this.toggleButtons.forEach(button => {
            button.addEventListener('click', () => this.toggleSidebar());
        });
        
        // أحداث روابط التنقل
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                if (page) {
                    this.navigateTo(page);
                }
            });
        });
        
        // الاستجابة لتغير حجم النافذة
        window.addEventListener('resize', () => this.handleResize());
    }
    
    // طي/فتح الشريط الجانبي
    toggleSidebar() {
        const layout = document.querySelector('.layout');
        layout.classList.toggle('sidebar-collapsed');
        
        // حفظ حالة الشريط الجانبي
        this.saveSidebarState(layout.classList.contains('sidebar-collapsed'));
        
        // إرسال حدث تغيير حجم الشريط الجانبي
        this.dispatchSidebarEvent(layout.classList.contains('sidebar-collapsed'));
    }
    
    // التنقل إلى صفحة معينة
    navigateTo(page) {
        // لا نفعل شيئًا إذا كانت الصفحة هي نفسها النشطة حاليًا
        if (page === this.activePage) {
            return;
        }
        
        // تحديث الروابط النشطة
        this.navLinks.forEach(link => {
            if (link.getAttribute('data-page') === page) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // تحديث الصفحات النشطة مع تأثير التلاشي
        this.pages.forEach(pageEl => {
            const pageId = pageEl.id.replace('-page', '');
            
            if (pageId === page) {
                // نضيف تأثير الظهور للصفحة الجديدة
                pageEl.style.opacity = '0';
                pageEl.classList.add('active');
                
                // تأثير ظهور تدريجي
                setTimeout(() => {
                    pageEl.style.opacity = '1';
                    pageEl.style.transition = `opacity ${this.transitionDuration}ms ease`;
                }, 50);
            } else {
                if (pageEl.classList.contains('active')) {
                    // إخفاء الصفحة السابقة بتلاشي تدريجي
                    pageEl.style.opacity = '0';
                    pageEl.style.transition = `opacity ${this.transitionDuration}ms ease`;
                    
                    setTimeout(() => {
                        pageEl.classList.remove('active');
                    }, this.transitionDuration);
                } else {
                    pageEl.classList.remove('active');
                }
            }
        });
        
        // تحديث الصفحة النشطة
        this.activePage = page;
        
        // حفظ الصفحة النشطة في التخزين المحلي
        localStorage.setItem('activePage', page);
        
        // إرسال حدث تغيير الصفحة
        this.dispatchPageChangeEvent(page);
        
        // تمرير للأعلى
        window.scrollTo(0, 0);
    }
    
    // التعامل مع تغيير حجم النافذة
    handleResize() {
        // إغلاق الشريط الجانبي تلقائيًا في الشاشات الصغيرة
        if (window.innerWidth < 768) {
            document.querySelector('.layout').classList.add('sidebar-collapsed');
            this.saveSidebarState(true);
        }
    }
    
    // حفظ حالة الشريط الجانبي
    saveSidebarState(isCollapsed) {
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    }
    
    // تطبيق حالة الشريط الجانبي المحفوظة
    applySavedSidebarState() {
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        
        if (isCollapsed) {
            document.querySelector('.layout').classList.add('sidebar-collapsed');
        } else {
            document.querySelector('.layout').classList.remove('sidebar-collapsed');
        }
        
        // تطبيق الصفحة المحفوظة
        const savedPage = localStorage.getItem('activePage');
        if (savedPage) {
            this.navigateTo(savedPage);
        }
        
        // للشاشات الصغيرة، نغلق الشريط الجانبي تلقائيًا
        this.handleResize();
    }
    
    // إرسال حدث تغيير حجم الشريط الجانبي
    dispatchSidebarEvent(isCollapsed) {
        const event = new CustomEvent('sidebar:toggle', {
            detail: { isCollapsed }
        });
        document.dispatchEvent(event);
    }
    
    // إرسال حدث تغيير الصفحة
    dispatchPageChangeEvent(page) {
        const event = new CustomEvent('page:change', {
            detail: { page }
        });
        document.dispatchEvent(event);
    }
    
    // فتح الشريط الجانبي
    openSidebar() {
        document.querySelector('.layout').classList.remove('sidebar-collapsed');
        this.saveSidebarState(false);
        this.dispatchSidebarEvent(false);
    }
    
    // إغلاق الشريط الجانبي
    closeSidebar() {
        document.querySelector('.layout').classList.add('sidebar-collapsed');
        this.saveSidebarState(true);
        this.dispatchSidebarEvent(true);
    }
    
    // إضافة سلوك التمرير عند التنقل السريع
    enableSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href').substring(1);
                if (!targetId) return;
                
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// إنشاء كائن التنقل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.navigation = new Navigation();
});


