
/**
 * firebase-sync.js
 * تكامل بين نظام الاستثمار المتكامل و Firebase
 * يوفر مزامنة ثنائية الاتجاه بين التخزين المحلي وقاعدة بيانات Firebase
 * مع الحفاظ على وظائف التخزين المحلي الأصلية
 */

// كائن لإدارة المزامنة مع Firebase
const FirebaseSync = (function() {
    // المتغيرات الخاصة
    let firebaseInitialized = false;
    let currentUser = null;
    let syncEnabled = false;
    let syncInProgress = false;
    let lastSyncTimestamp = 0;
    let databaseRef = null;
    let autoSyncInterval = null;
    
    // زمن التأخير بين المزامنات التلقائية (5 دقائق)
    const AUTO_SYNC_DELAY = 1000 * 60 * 5;
    
    // المفاتيح المستخدمة في التخزين المحلي
    const STORAGE_KEYS = ['investors', 'transactions', 'settings'];
    
    // السجل الخاص بالتغييرات التي تحتاج إلى مزامنة
    const pendingChanges = {
        investors: false,
        transactions: false,
        settings: false
    };

    /**
     * تهيئة Firebase وإعداد المزامنة
     * @returns {Promise} وعد يشير إلى نجاح أو فشل التهيئة
     */
    function initialize() {
        return new Promise((resolve, reject) => {
            if (firebaseInitialized) {
                resolve(true);
                return;
            };

            try {
                // التحقق من تهيئة Firebase مسبقاً
                if (!firebase.apps.length) {
                    // التكوين يجب أن يكون موجوداً بالفعل في الصفحة
                    if (typeof firebaseConfig === 'undefined') {
                        reject(new Error('لم يتم العثور على تكوين Firebase'));
                        return;
                    }
                    
                    firebase.initializeApp(firebaseConfig);
                }
                
                // إنشاء الإشارة إلى قاعدة البيانات
                databaseRef = firebase.database();
                
                // التحقق من حالة المصادقة
                firebase.auth().onAuthStateChanged(user => {
                    if (user) {
                        currentUser = user;
                        console.log(`تم تسجيل الدخول كـ ${user.email || user.uid}`);
                        setupSyncListeners();
                        firebaseInitialized = true;
                        resolve(true);
                    } else {
                        console.log('لم يتم تسجيل الدخول');
                        currentUser = null;
                        syncEnabled = false;
                        clearInterval(autoSyncInterval);
                        resolve(false);
                    }
                });
            } catch (error) {
                console.error('خطأ في تهيئة Firebase:', error);
                reject(error);
            }
        });
    }

    /**
     * تسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور
     * @param {string} email - البريد الإلكتروني
     * @param {string} password - كلمة المرور
     * @returns {Promise} وعد يشير إلى نجاح أو فشل تسجيل الدخول
     */
    function login(email, password) {
        return firebase.auth().signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                currentUser = userCredential.user;
                syncEnabled = true;
                console.log(`تم تسجيل الدخول بنجاح: ${currentUser.email}`);
                setupAutoSync();
                return currentUser;
            });
    }

    /**
     * إنشاء حساب جديد باستخدام البريد الإلكتروني وكلمة المرور
     * @param {string} email - البريد الإلكتروني
     * @param {string} password - كلمة المرور
     * @returns {Promise} وعد يشير إلى نجاح أو فشل إنشاء الحساب
     */
    function signup(email, password) {
        return firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                currentUser = userCredential.user;
                syncEnabled = true;
                console.log(`تم إنشاء حساب جديد: ${currentUser.email}`);
                setupAutoSync();
                return currentUser;
            });
    }

    /**
     * تسجيل الخروج من الحساب الحالي
     * @returns {Promise} وعد يشير إلى نجاح أو فشل تسجيل الخروج
     */
    function logout() {
        return firebase.auth().signOut()
            .then(() => {
                currentUser = null;
                syncEnabled = false;
                clearInterval(autoSyncInterval);
                console.log('تم تسجيل الخروج بنجاح');
                return true;
            });
    }

    /**
     * إعداد المستمعين لمزامنة البيانات
     */
    function setupSyncListeners() {
        if (!currentUser || !databaseRef) return;

        // استبدال الدوال الأصلية للحفظ والتحميل بدوال تدعم المزامنة
        overrideLocalStorageFunctions();
        
        // إعداد المستمعين للتغييرات في Firebase
        setupFirebaseListeners();
        
        // إعداد المزامنة التلقائية
        setupAutoSync();
    }

    /**
     * استبدال دوال التخزين المحلي الأصلية بدوال تدعم المزامنة
     */
    function overrideLocalStorageFunctions() {
        // حفظ الدوال الأصلية
        if (!window._originalSaveData) {
            window._originalSaveData = window.saveData;
        }
        
        if (!window._originalLoadData) {
            window._originalLoadData = window.loadData;
        }
        
        // استبدال دالة حفظ البيانات
        window.saveData = function() {
            try {
                // استدعاء الدالة الأصلية أولاً
                const result = window._originalSaveData.apply(this, arguments);
                
                // تحديد التغييرات التي تحتاج إلى مزامنة
                STORAGE_KEYS.forEach(key => {
                    pendingChanges[key] = true;
                });
                
                // مزامنة البيانات مع Firebase إذا كانت المزامنة مفعلة
                if (syncEnabled && !syncInProgress) {
                    syncToFirebase();
                }
                
                return result;
            } catch (error) {
                console.error('خطأ في حفظ البيانات:', error);
                return false;
            }
        };
        
        // لا نحتاج لاستبدال دالة تحميل البيانات لأنها تحمل البيانات من التخزين المحلي فقط
        // ولكن سنقوم بإضافة مزامنة مع Firebase قبل التحميل
        window._enhancedLoadData = function() {
            return new Promise((resolve) => {
                if (syncEnabled && currentUser) {
                    // مزامنة البيانات من Firebase أولاً ثم تحميل البيانات
                    syncFromFirebase()
                        .then(() => {
                            const result = window._originalLoadData.apply(this, arguments);
                            resolve(result);
                        })
                        .catch(error => {
                            console.error('خطأ في مزامنة البيانات من Firebase:', error);
                            const result = window._originalLoadData.apply(this, arguments);
                            resolve(result);
                        });
                } else {
                    // تحميل البيانات مباشرة من التخزين المحلي
                    const result = window._originalLoadData.apply(this, arguments);
                    resolve(result);
                }
            });
        };
    }

    /**
     * إعداد المستمعين للتغييرات في Firebase
     */
    function setupFirebaseListeners() {
        if (!currentUser || !databaseRef) return;
        
        const userId = currentUser.uid;
        
        // مستمع للتغييرات في بيانات المستثمرين
        databaseRef.ref(`users/${userId}/investors`).on('value', snapshot => {
            if (syncInProgress) return;
            
            const firebaseData = snapshot.val();
            if (!firebaseData) return;
            
            // مقارنة وقت التعديل الأخير
            if (firebaseData._lastModified && firebaseData._lastModified > lastSyncTimestamp) {
                // تحديث البيانات المحلية
                try {
                    syncInProgress = true;
                    localStorage.setItem('investors', JSON.stringify(firebaseData.data));
                    console.log('تم مزامنة بيانات المستثمرين من Firebase');
                    
                    // تحديث الواجهة إذا كانت الصفحة مفتوحة
                    if (window.renderInvestorsTable) {
                        window.investors = firebaseData.data;
                        window.renderInvestorsTable();
                    }
                    
                    lastSyncTimestamp = firebaseData._lastModified;
                } finally {
                    syncInProgress = false;
                }
            }
        });
        
        // مستمع للتغييرات في بيانات العمليات
        databaseRef.ref(`users/${userId}/transactions`).on('value', snapshot => {
            if (syncInProgress) return;
            
            const firebaseData = snapshot.val();
            if (!firebaseData) return;
            
            // مقارنة وقت التعديل الأخير
            if (firebaseData._lastModified && firebaseData._lastModified > lastSyncTimestamp) {
                // تحديث البيانات المحلية
                try {
                    syncInProgress = true;
                    localStorage.setItem('transactions', JSON.stringify(firebaseData.data));
                    console.log('تم مزامنة بيانات العمليات من Firebase');
                    
                    // تحديث الواجهة إذا كانت الصفحة مفتوحة
                    if (window.renderTransactionsTable) {
                        window.transactions = firebaseData.data;
                        window.renderTransactionsTable();
                    }
                    
                    lastSyncTimestamp = firebaseData._lastModified;
                } finally {
                    syncInProgress = false;
                }
            }
        });
        
        // مستمع للتغييرات في بيانات الإعدادات
        databaseRef.ref(`users/${userId}/settings`).on('value', snapshot => {
            if (syncInProgress) return;
            
            const firebaseData = snapshot.val();
            if (!firebaseData) return;
            
            // مقارنة وقت التعديل الأخير
            if (firebaseData._lastModified && firebaseData._lastModified > lastSyncTimestamp) {
                // تحديث البيانات المحلية
                try {
                    syncInProgress = true;
                    localStorage.setItem('settings', JSON.stringify(firebaseData.data));
                    console.log('تم مزامنة بيانات الإعدادات من Firebase');
                    
                    // تحديث الإعدادات في الذاكرة إذا كانت موجودة
                    if (window.settings) {
                        window.settings = firebaseData.data;
                        // تحديث الواجهة إذا كان ممكناً
                        if (window.updateDashboard) {
                            window.updateDashboard();
                        }
                    }
                    
                    lastSyncTimestamp = firebaseData._lastModified;
                } finally {
                    syncInProgress = false;
                }
            }
        });
    }

    /**
     * إعداد المزامنة التلقائية
     */
    function setupAutoSync() {
        // إلغاء أي مؤقت سابق
        if (autoSyncInterval) {
            clearInterval(autoSyncInterval);
        }
        
        // إنشاء مؤقت جديد للمزامنة التلقائية
        autoSyncInterval = setInterval(() => {
            if (syncEnabled && !syncInProgress) {
                syncToFirebase();
            }
        }, AUTO_SYNC_DELAY);
    }

    /**
     * مزامنة البيانات من التخزين المحلي إلى Firebase
     * @returns {Promise} وعد يشير إلى نجاح أو فشل المزامنة
     */
    function syncToFirebase() {
        if (!currentUser || !databaseRef || !syncEnabled) {
            return Promise.reject(new Error('المزامنة غير مفعلة أو المستخدم غير مسجل الدخول'));
        }
        
        syncInProgress = true;
        const userId = currentUser.uid;
        const now = Date.now();
        const promises = [];
        
        try {
            // مزامنة المستثمرين إذا كان هناك تغييرات
            if (pendingChanges.investors) {
                const investors = JSON.parse(localStorage.getItem('investors') || '[]');
                const investorsRef = databaseRef.ref(`users/${userId}/investors`);
                promises.push(
                    investorsRef.set({
                        data: investors,
                        _lastModified: now
                    })
                    .then(() => {
                        pendingChanges.investors = false;
                        console.log('تم مزامنة بيانات المستثمرين إلى Firebase');
                    })
                    .catch(error => {
                        console.error('خطأ في مزامنة بيانات المستثمرين:', error);
                        throw error;
                    })
                );
            }
            
            // مزامنة العمليات إذا كان هناك تغييرات
            if (pendingChanges.transactions) {
                const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
                const transactionsRef = databaseRef.ref(`users/${userId}/transactions`);
                promises.push(
                    transactionsRef.set({
                        data: transactions,
                        _lastModified: now
                    })
                    .then(() => {
                        pendingChanges.transactions = false;
                        console.log('تم مزامنة بيانات العمليات إلى Firebase');
                    })
                    .catch(error => {
                        console.error('خطأ في مزامنة بيانات العمليات:', error);
                        throw error;
                    })
                );
            }
            
            // مزامنة الإعدادات إذا كان هناك تغييرات
            if (pendingChanges.settings) {
                const settings = JSON.parse(localStorage.getItem('settings') || '{}');
                const settingsRef = databaseRef.ref(`users/${userId}/settings`);
                promises.push(
                    settingsRef.set({
                        data: settings,
                        _lastModified: now
                    })
                    .then(() => {
                        pendingChanges.settings = false;
                        console.log('تم مزامنة بيانات الإعدادات إلى Firebase');
                    })
                    .catch(error => {
                        console.error('خطأ في مزامنة بيانات الإعدادات:', error);
                        throw error;
                    })
                );
            }
            
            return Promise.all(promises)
                .then(() => {
                    lastSyncTimestamp = now;
                    return true;
                })
                .finally(() => {
                    syncInProgress = false;
                });
        } catch (error) {
            syncInProgress = false;
            console.error('خطأ في مزامنة البيانات إلى Firebase:', error);
            return Promise.reject(error);
        }
    }

    /**
     * مزامنة البيانات من Firebase إلى التخزين المحلي
     * @returns {Promise} وعد يشير إلى نجاح أو فشل المزامنة
     */
    function syncFromFirebase() {
        if (!currentUser || !databaseRef || !syncEnabled) {
            return Promise.reject(new Error('المزامنة غير مفعلة أو المستخدم غير مسجل الدخول'));
        }
        
        syncInProgress = true;
        const userId = currentUser.uid;
        
        try {
            const promises = [];
            
            // مزامنة المستثمرين
            promises.push(
                databaseRef.ref(`users/${userId}/investors`).once('value')
                    .then(snapshot => {
                        const firebaseData = snapshot.val();
                        if (firebaseData && firebaseData.data) {
                            localStorage.setItem('investors', JSON.stringify(firebaseData.data));
                            if (window.investors) {
                                window.investors = firebaseData.data;
                            }
                            console.log('تم مزامنة بيانات المستثمرين من Firebase');
                            
                            if (firebaseData._lastModified > lastSyncTimestamp) {
                                lastSyncTimestamp = firebaseData._lastModified;
                            }
                        }
                    })
                    .catch(error => {
                        console.error('خطأ في مزامنة بيانات المستثمرين من Firebase:', error);
                    })
            );
            
            // مزامنة العمليات
            promises.push(
                databaseRef.ref(`users/${userId}/transactions`).once('value')
                    .then(snapshot => {
                        const firebaseData = snapshot.val();
                        if (firebaseData && firebaseData.data) {
                            localStorage.setItem('transactions', JSON.stringify(firebaseData.data));
                            if (window.transactions) {
                                window.transactions = firebaseData.data;
                            }
                            console.log('تم مزامنة بيانات العمليات من Firebase');
                            
                            if (firebaseData._lastModified > lastSyncTimestamp) {
                                lastSyncTimestamp = firebaseData._lastModified;
                            }
                        }
                    })
                    .catch(error => {
                        console.error('خطأ في مزامنة بيانات العمليات من Firebase:', error);
                    })
            );
            
            // مزامنة الإعدادات
            promises.push(
                databaseRef.ref(`users/${userId}/settings`).once('value')
                    .then(snapshot => {
                        const firebaseData = snapshot.val();
                        if (firebaseData && firebaseData.data) {
                            localStorage.setItem('settings', JSON.stringify(firebaseData.data));
                            if (window.settings) {
                                window.settings = firebaseData.data;
                            }
                            console.log('تم مزامنة بيانات الإعدادات من Firebase');
                            
                            if (firebaseData._lastModified > lastSyncTimestamp) {
                                lastSyncTimestamp = firebaseData._lastModified;
                            }
                        }
                    })
                    .catch(error => {
                        console.error('خطأ في مزامنة بيانات الإعدادات من Firebase:', error);
                    })
            );
            
            return Promise.all(promises)
                .then(() => {
                    // تحديث الواجهة بعد المزامنة
                    if (window.renderInvestorsTable) {
                        window.renderInvestorsTable();
                    }
                    if (window.renderTransactionsTable) {
                        window.renderTransactionsTable();
                    }
                    if (window.updateDashboard) {
                        window.updateDashboard();
                    }
                    return true;
                })
                .finally(() => {
                    syncInProgress = false;
                });
        } catch (error) {
            syncInProgress = false;
            console.error('خطأ في مزامنة البيانات من Firebase:', error);
            return Promise.reject(error);
        }
    }

    /**
     * إنشاء نسخة احتياطية كاملة في Firebase
     * @returns {Promise} وعد يشير إلى نجاح أو فشل إنشاء النسخة الاحتياطية
     */
    function createBackup() {
        if (!currentUser || !databaseRef) {
            return Promise.reject(new Error('المستخدم غير مسجل الدخول'));
        }
        
        try {
            const userId = currentUser.uid;
            const backupData = {
                investors: JSON.parse(localStorage.getItem('investors') || '[]'),
                transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
                settings: JSON.parse(localStorage.getItem('settings') || '{}'),
                timestamp: Date.now(),
                createdAt: new Date().toISOString()
            };
            
            const backupRef = databaseRef.ref(`users/${userId}/backups/${backupData.timestamp}`);
            return backupRef.set(backupData)
                .then(() => {
                    console.log('تم إنشاء نسخة احتياطية بنجاح');
                    // تحديث آخر نسخة احتياطية
                    return databaseRef.ref(`users/${userId}/latestBackup`).set({
                        timestamp: backupData.timestamp,
                        createdAt: backupData.createdAt
                    });
                })
                .then(() => {
                    return {
                        timestamp: backupData.timestamp,
                        createdAt: backupData.createdAt
                    };
                });
        } catch (error) {
            console.error('خطأ في إنشاء نسخة احتياطية:', error);
            return Promise.reject(error);
        }
    }

    /**
     * استعادة النسخة الاحتياطية من Firebase
     * @param {number} timestamp - الطابع الزمني للنسخة الاحتياطية
     * @returns {Promise} وعد يشير إلى نجاح أو فشل استعادة النسخة الاحتياطية
     */
    function restoreBackup(timestamp) {
        if (!currentUser || !databaseRef) {
            return Promise.reject(new Error('المستخدم غير مسجل الدخول'));
        }
        
        // إذا لم يتم توفير طابع زمني، استخدم آخر نسخة احتياطية
        const backupPromise = timestamp
            ? databaseRef.ref(`users/${currentUser.uid}/backups/${timestamp}`).once('value')
            : databaseRef.ref(`users/${currentUser.uid}/latestBackup`).once('value')
                .then(snapshot => {
                    const latestBackup = snapshot.val();
                    if (!latestBackup || !latestBackup.timestamp) {
                        throw new Error('لم يتم العثور على نسخة احتياطية');
                    }
                    return databaseRef.ref(`users/${currentUser.uid}/backups/${latestBackup.timestamp}`).once('value');
                });
        
        return backupPromise
            .then(snapshot => {
                const backupData = snapshot.val();
                if (!backupData) {
                    throw new Error('النسخة الاحتياطية غير موجودة أو فارغة');
                }
                
                // استعادة البيانات إلى التخزين المحلي
                localStorage.setItem('investors', JSON.stringify(backupData.investors));
                localStorage.setItem('transactions', JSON.stringify(backupData.transactions));
                localStorage.setItem('settings', JSON.stringify(backupData.settings));
                
                // تحديث المتغيرات العامة
                if (window.investors) {
                    window.investors = backupData.investors;
                }
                if (window.transactions) {
                    window.transactions = backupData.transactions;
                }
                if (window.settings) {
                    window.settings = backupData.settings;
                }
                
                console.log(`تم استعادة النسخة الاحتياطية من ${new Date(backupData.timestamp).toLocaleString()}`);
                
                // تحديث الواجهة
                if (window.renderInvestorsTable) {
                    window.renderInvestorsTable();
                }
                if (window.renderTransactionsTable) {
                    window.renderTransactionsTable();
                }
                if (window.updateDashboard) {
                    window.updateDashboard();
                }
                
                return backupData;
            });
    }

    /**
     * الحصول على قائمة النسخ الاحتياطية المتاحة
     * @returns {Promise} وعد يحتوي على قائمة النسخ الاحتياطية
     */
    function getBackupsList() {
        if (!currentUser || !databaseRef) {
            return Promise.reject(new Error('المستخدم غير مسجل الدخول'));
        }
        
        return databaseRef.ref(`users/${currentUser.uid}/backups`).once('value')
            .then(snapshot => {
                const backups = snapshot.val();
                if (!backups) {
                    return [];
                }
                
                // تحويل البيانات إلى مصفوفة
                return Object.keys(backups).map(key => ({
                    timestamp: parseInt(key),
                    createdAt: backups[key].createdAt,
                    date: new Date(parseInt(key)).toLocaleString(),
                    investors: Array.isArray(backups[key].investors) ? backups[key].investors.length : 0,
                    transactions: Array.isArray(backups[key].transactions) ? backups[key].transactions.length : 0
                }))
                .sort((a, b) => b.timestamp - a.timestamp); // ترتيب حسب الأحدث
            });
    }

    /**
     * حذف نسخة احتياطية
     * @param {number} timestamp - الطابع الزمني للنسخة الاحتياطية
     * @returns {Promise} وعد يشير إلى نجاح أو فشل الحذف
     */
    function deleteBackup(timestamp) {
        if (!currentUser || !databaseRef) {
            return Promise.reject(new Error('المستخدم غير مسجل الدخول'));
        }
        
        return databaseRef.ref(`users/${currentUser.uid}/backups/${timestamp}`).remove()
            .then(() => {
                console.log(`تم حذف النسخة الاحتياطية من ${new Date(timestamp).toLocaleString()}`);
                return true;
            });
    }

    /**
     * تغيير حالة المزامنة
     * @param {boolean} state - حالة المزامنة الجديدة
     */
    function setSyncEnabled(state) {
        syncEnabled = !!state;
        
        if (syncEnabled) {
            setupAutoSync();
        } else {
            clearInterval(autoSyncInterval);
        }
        
        return syncEnabled;
    }

    /**
     * الحصول على معلومات المستخدم الحالي
     * @returns {Object|null} معلومات المستخدم أو null إذا لم يكن هناك مستخدم
     */
    function getCurrentUser() {
        if (!currentUser) return null;
        
        return {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            isAnonymous: currentUser.isAnonymous
        };
    }

    /**
     * تحميل البيانات مع مزامنة Firebase
     * هذه الدالة تحل محل window.loadData الأصلية عند الاستدعاء
     */
    function loadDataWithSync() {
        return _enhancedLoadData()
            .then(() => {
                // تحديث الواجهة
                if (window.renderInvestorsTable) {
                    window.renderInvestorsTable();
                }
                if (window.renderTransactionsTable) {
                    window.renderTransactionsTable();
                }
                if (window.updateDashboard) {
                    window.updateDashboard();
                }
                
                console.log('تم تحميل البيانات مع المزامنة بنجاح');
                return true;
            });
    }

    // تصدير واجهة برمجة التطبيق العامة
    return {
        initialize: initialize,
        login: login,
        signup: signup,
        logout: logout,
        
        syncToFirebase: syncToFirebase,
        syncFromFirebase: syncFromFirebase,
        setSyncEnabled: setSyncEnabled,
        loadDataWithSync: loadDataWithSync,
        
        createBackup: createBackup,
        restoreBackup: restoreBackup,
        getBackupsList: getBackupsList,
        deleteBackup: deleteBackup,
        
        getCurrentUser: getCurrentUser,
        
        // للاستخدام الداخلي فقط
        _getPendingChanges: () => ({...pendingChanges}),
        _isSyncEnabled: () => syncEnabled,
        _getLastSyncTimestamp: () => lastSyncTimestamp
    };
})();

/**
 * إضافة واجهة مستخدم لإدارة المزامنة مع Firebase
 */
(function() {
    // تنفيذ الإضافة عند تحميل الصفحة
    document.addEventListener('DOMContentLoaded', function() {
        console.log('تهيئة واجهة مستخدم المزامنة مع Firebase...');
        
        // إضافة نموذج المستخدم إلى التطبيق
        addFirebaseAuthUI();
        
        // إضافة زر المزامنة
        addSyncButton();
        
        // إضافة تبويب النسخ الاحتياطي في الإعدادات
        enhanceBackupTab();
        
        // إضافة نمط CSS
        addFirebaseSyncStyles();
        
        // إضافة مستمعي الأحداث
        setupEventListeners();
        
        // تهيئة Firebase
        FirebaseSync.initialize()
            .then(initialized => {
                console.log('تهيئة Firebase:', initialized ? 'تمت بنجاح' : 'لم تكتمل');
                
                // تحديث واجهة المستخدم
                updateAuthUIState();
                
                // استدعاء loadDataWithSync بدلاً من loadData
                if (initialized && FirebaseSync._isSyncEnabled()) {
                    FirebaseSync.loadDataWithSync();
                }
            })
            .catch(error => {
                console.error('خطأ في تهيئة Firebase:', error);
            });
    });

    /**
     * إضافة نموذج تسجيل الدخول/إنشاء حساب
     */
    function addFirebaseAuthUI() {
        // التحقق من وجود النموذج مسبقاً
        if (document.getElementById('firebase-auth-modal')) {
            return;
        }
        
        // إنشاء النموذج
        const authModal = document.createElement('div');
        authModal.className = 'modal-overlay';
        authModal.id = 'firebase-auth-modal';
        
        authModal.innerHTML = `
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">المزامنة والنسخ الاحتياطي</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <div class="tabs">
                        <div class="tab-buttons">
                            <button class="tab-btn active" data-tab="login">تسجيل الدخول</button>
                            <button class="tab-btn" data-tab="signup">إنشاء حساب</button>
                        </div>
                        <div class="tab-content active" id="login-tab">
                            <form id="login-form">
                                <div class="form-group">
                                    <label class="form-label">البريد الإلكتروني</label>
                                    <input class="form-input" type="email" id="login-email" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">كلمة المرور</label>
                                    <input class="form-input" type="password" id="login-password" required>
                                </div>
                                <div class="form-group">
                                    <button class="btn btn-primary" type="submit" id="login-submit">تسجيل الدخول</button>
                                </div>
                            </form>
                        </div>
                        <div class="tab-content" id="signup-tab">
                            <form id="signup-form">
                                <div class="form-group">
                                    <label class="form-label">البريد الإلكتروني</label>
                                    <input class="form-input" type="email" id="signup-email" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">كلمة المرور</label>
                                    <input class="form-input" type="password" id="signup-password" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">تأكيد كلمة المرور</label>
                                    <input class="form-input" type="password" id="signup-confirm-password" required>
                                </div>
                                <div class="form-group">
                                    <button class="btn btn-primary" type="submit" id="signup-submit">إنشاء حساب</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إلغاء</button>
                </div>
            </div>
        `;
        
        // إضافة النموذج إلى الصفحة
        document.body.appendChild(authModal);
        
        // إضافة مستمعي الأحداث للنموذج
        setupAuthFormListeners(authModal);
    }

    /**
     * إضافة زر المزامنة إلى شريط العنوان
     */
    function addSyncButton() {
        // التحقق من وجود الزر مسبقاً
        if (document.getElementById('sync-button')) {
            return;
        }
        
        // البحث عن شريط العنوان
        const headerActions = document.querySelector('.header .header-actions');
        if (!headerActions) {
            console.error('لم يتم العثور على شريط العنوان');
            return;
        }
        
        // إنشاء زر المزامنة
        const syncButton = document.createElement('button');
        syncButton.className = 'btn btn-outline';
        syncButton.id = 'sync-button';
        syncButton.title = 'المزامنة والنسخ الاحتياطي';
        syncButton.innerHTML = '<i class="fas fa-cloud-upload-alt"></i>';
        syncButton.style.marginRight = '10px';
        
        // إضافة الزر قبل العنصر الأول في شريط العنوان
        headerActions.insertBefore(syncButton, headerActions.firstChild);
        
        // إضافة مستمع حدث النقر
        syncButton.addEventListener('click', function() {
            const user = FirebaseSync.getCurrentUser();
            
            if (user) {
                // عرض قائمة خيارات المزامنة إذا كان المستخدم مسجل الدخول
                showSyncOptionsMenu(this);
            } else {
                // عرض نموذج تسجيل الدخول إذا لم يكن المستخدم مسجل الدخول
                openModal('firebase-auth-modal');
            }
        });
    }

    /**
     * عرض قائمة خيارات المزامنة
     * @param {HTMLElement} buttonElement - عنصر الزر
     */
    function showSyncOptionsMenu(buttonElement) {
        // التحقق من وجود القائمة مسبقاً
        const existingMenu = document.getElementById('sync-options-menu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }
        
        // الحصول على موقع الزر
        const buttonRect = buttonElement.getBoundingClientRect();
        
        // إنشاء القائمة
        const menu = document.createElement('div');
        menu.id = 'sync-options-menu';
        menu.className = 'sync-menu';
        
        // إضافة خيارات القائمة
        const user = FirebaseSync.getCurrentUser();
        const syncEnabled = FirebaseSync._isSyncEnabled();
        
        menu.innerHTML = `
            <div class="sync-menu-header">
                <div class="sync-user">
                    <i class="fas fa-user-circle"></i>
                    <span>${user.email}</span>
                </div>
                <div class="sync-status">
                    <span class="sync-indicator ${syncEnabled ? 'active' : ''}"></span>
                    <span>${syncEnabled ? 'المزامنة نشطة' : 'المزامنة غير نشطة'}</span>
                </div>
            </div>
            <div class="sync-menu-items">
                <div class="sync-menu-item" id="sync-now-btn">
                    <i class="fas fa-sync-alt"></i>
                    <span>مزامنة الآن</span>
                </div>
                <div class="sync-menu-item" id="toggle-sync-btn">
                    <i class="fas ${syncEnabled ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
                    <span>${syncEnabled ? 'إيقاف المزامنة التلقائية' : 'تفعيل المزامنة التلقائية'}</span>
                </div>
                <div class="sync-menu-item" id="create-backup-btn">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span>إنشاء نسخة احتياطية</span>
                </div>
                <div class="sync-menu-item" id="manage-backups-btn">
                    <i class="fas fa-history"></i>
                    <span>إدارة النسخ الاحتياطية</span>
                </div>
                <div class="sync-menu-item danger" id="logout-btn">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>تسجيل الخروج</span>
                </div>
            </div>
        `;
        
        // تحديد موقع القائمة
        menu.style.position = 'absolute';
        menu.style.top = `${buttonRect.bottom + 5}px`;
        menu.style.left = `${buttonRect.left}px`;
        menu.style.zIndex = '1000';
        
        // إضافة القائمة إلى الصفحة
        document.body.appendChild(menu);
        
        // إضافة مستمعي الأحداث للقائمة
        setupSyncMenuListeners(menu);
        
        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target) && e.target !== buttonElement) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }

    /**
     * تعزيز تبويب النسخ الاحتياطي في الإعدادات
     */
    function enhanceBackupTab() {
        // البحث عن تبويب النسخ الاحتياطي
        const backupTab = document.getElementById('backup-tab');
        if (!backupTab) {
            console.error('لم يتم العثور على تبويب النسخ الاحتياطي');
            return;
        }
        
        // إضافة قسم المزامنة مع Firebase
        const firebaseSyncSection = document.createElement('div');
        firebaseSyncSection.className = 'firebase-sync-section';
        firebaseSyncSection.innerHTML = `
            <div class="section-header" style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
                <h3 class="section-title">مزامنة وتخزين سحابي مع Firebase</h3>
            </div>
            <div class="firebase-sync-content">
                <div id="auth-status-container">
                    <div class="auth-status not-logged-in" id="firebase-auth-status">
                        <div class="status-icon">
                            <i class="fas fa-cloud"></i>
                        </div>
                        <div class="status-text">
                            <h4>غير متصل</h4>
                            <p>قم بتسجيل الدخول للاستفادة من المزامنة والنسخ الاحتياطي السحابي</p>
                        </div>
                        <button class="btn btn-primary" id="auth-login-btn">تسجيل الدخول</button>
                    </div>
                </div>
                
                <div id="firebase-backup-options" style="display: none;">
                    <div class="form-group">
                        <div class="form-check sync-toggle-container">
                            <input type="checkbox" id="enable-firebase-sync">
                            <label for="enable-firebase-sync">تفعيل المزامنة التلقائية مع Firebase</label>
                        </div>
                    </div>
                    
                    <div class="firebase-actions">
                        <button class="btn btn-primary" id="sync-now-action">
                            <i class="fas fa-sync-alt"></i>
                            <span>مزامنة الآن</span>
                        </button>
                        <button class="btn btn-success" id="create-backup-action">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <span>إنشاء نسخة احتياطية</span>
                        </button>
                        <button class="btn btn-info" id="restore-backup-action">
                            <i class="fas fa-cloud-download-alt"></i>
                            <span>استعادة من نسخة احتياطية</span>
                        </button>
                    </div>
                    
                    <div class="backup-history-container" id="backup-history-container">
                        <h4>النسخ الاحتياطية المتوفرة</h4>
                        <div class="backup-list-container">
                            <table class="backup-list" id="backup-list">
                                <thead>
                                    <tr>
                                        <th>التاريخ</th>
                                        <th>المستثمرين</th>
                                        <th>العمليات</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colspan="4" class="text-center">جاري تحميل النسخ الاحتياطية...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // إضافة القسم إلى تبويب النسخ الاحتياطي
        backupTab.appendChild(firebaseSyncSection);
        
        // إضافة مستمعي الأحداث
        setupBackupTabListeners();
    }

    /**
     * إضافة أنماط CSS للمزامنة
     */
    function addFirebaseSyncStyles() {
        // التحقق من وجود الأنماط مسبقاً
        if (document.getElementById('firebase-sync-styles')) {
            return;
        }
        
        // إنشاء عنصر النمط
        const styleElement = document.createElement('style');
        styleElement.id = 'firebase-sync-styles';
        
        // إضافة أنماط CSS
        styleElement.textContent = `
            /* قائمة المزامنة */
            .sync-menu {
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
                width: 250px;
                overflow: hidden;
                font-family: 'Tajawal', sans-serif;
                direction: rtl;
            }
            
            .sync-menu-header {
                padding: 12px 16px;
                background-color: #f8f9fa;
                border-bottom: 1px solid #e9ecef;
            }
            
            .sync-user {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .sync-user i {
                margin-left: 8px;
                color: #3b82f6;
            }
            
            .sync-status {
                display: flex;
                align-items: center;
                font-size: 0.85rem;
                color: #6c757d;
            }
            
            .sync-indicator {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: #dc3545;
                margin-left: 8px;
            }
            
            .sync-indicator.active {
                background-color: #10b981;
            }
            
            .sync-menu-items {
                padding: 8px 0;
            }
            
            .sync-menu-item {
                padding: 10px 16px;
                display: flex;
                align-items: center;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .sync-menu-item:hover {
                background-color: #f8f9fa;
            }
            
            .sync-menu-item i {
                width: 20px;
                margin-left: 12px;
                text-align: center;
                color: #3b82f6;
            }
            
            .sync-menu-item.danger i {
                color: #dc3545;
            }
            
            /* قسم Firebase في تبويب النسخ الاحتياطي */
            .firebase-sync-section {
                margin-top: 24px;
            }
            
            .auth-status {
                display: flex;
                align-items: center;
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 16px;
            }
            
            .auth-status .status-icon {
                font-size: 2rem;
                margin-left: 16px;
                color: #6c757d;
            }
            
            .auth-status.logged-in .status-icon {
                color: #10b981;
            }
            
            .auth-status .status-text {
                flex: 1;
            }
            
            .auth-status .status-text h4 {
                margin: 0 0 4px 0;
            }
            
            .auth-status .status-text p {
                margin: 0;
                color: #6c757d;
                font-size: 0.9rem;
            }
            
            .firebase-actions {
                display: flex;
                gap: 8px;
                margin-bottom: 16px;
            }
            
            .sync-toggle-container {
                margin-bottom: 16px;
            }
            
            .backup-history-container {
                margin-top: 24px;
            }
            
            .backup-list {
                width: 100%;
                border-collapse: collapse;
            }
            
            .backup-list th,
            .backup-list td {
                padding: 8px 12px;
                border-bottom: 1px solid #e9ecef;
                text-align: right;
            }
            
            .backup-list th {
                background-color: #f8f9fa;
                font-weight: 600;
            }
            
            .backup-actions {
                display: flex;
                gap: 4px;
            }
            
            .backup-actions button {
                padding: 4px 8px;
                font-size: 0.85rem;
            }
            
            /* إشارة المزامنة */
            #sync-button {
                position: relative;
            }
            
            .sync-active-indicator {
                position: absolute;
                top: -2px;
                right: -2px;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: #10b981;
                box-shadow: 0 0 0 2px white;
            }
            
            /* قائمة النسخ الاحتياطية */
            .backup-list-container {
                max-height: 300px;
                overflow-y: auto;
                border: 1px solid #e9ecef;
                border-radius: 4px;
            }
            
            /* تحسينات عامة */
            .text-center {
                text-align: center;
            }
            
            .loader {
                border: 3px solid #f3f3f3;
                border-top: 3px solid #3b82f6;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                animation: spin 1s linear infinite;
                margin: 0 auto;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        
        // إضافة عنصر النمط إلى الصفحة
        document.head.appendChild(styleElement);
        console.log('تم إضافة أنماط CSS للمزامنة');
    }

    /**
     * إضافة مستمعي الأحداث لنموذج تسجيل الدخول/إنشاء حساب
     * @param {HTMLElement} authModal - عنصر النموذج
     */
    function setupAuthFormListeners(authModal) {
        // مستمعي الأحداث للتبديل بين علامات التبويب
        const tabButtons = authModal.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                // إزالة الفئة النشطة من جميع الأزرار
                tabButtons.forEach(btn => btn.classList.remove('active'));
                
                // إضافة الفئة النشطة للزر الحالي
                this.classList.add('active');
                
                // إخفاء جميع محتويات علامات التبويب
                const tabContents = authModal.querySelectorAll('.tab-content');
                tabContents.forEach(content => content.classList.remove('active'));
                
                // إظهار محتوى علامة التبويب المحددة
                const tabId = this.getAttribute('data-tab');
                const selectedTab = authModal.querySelector(`#${tabId}-tab`);
                if (selectedTab) {
                    selectedTab.classList.add('active');
                }
            });
        });
        
        // مستمع حدث تسجيل الدخول
        const loginForm = authModal.querySelector('#login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                
                if (!email || !password) {
                    showNotification('يرجى إدخال البريد الإلكتروني وكلمة المرور', 'error');
                    return;
                }
                
                // تغيير نص زر التسجيل
                const submitButton = this.querySelector('button[type="submit"]');
                const originalText = submitButton.innerHTML;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تسجيل الدخول...';
                submitButton.disabled = true;
                
                // تسجيل الدخول
                FirebaseSync.login(email, password)
                    .then(user => {
                        showNotification(`تم تسجيل الدخول بنجاح: ${user.email}`, 'success');
                        
                        // تحديث واجهة المستخدم
                        updateAuthUIState();
                        
                        // إغلاق النموذج
                        closeModal('firebase-auth-modal');
                        
                        // تفعيل المزامنة
                        FirebaseSync.setSyncEnabled(true);
                        
                        // مزامنة البيانات
                        FirebaseSync.syncFromFirebase()
                            .then(() => {
                                showNotification('تم مزامنة البيانات بنجاح', 'success');
                            })
                            .catch(error => {
                                console.error('خطأ في مزامنة البيانات:', error);
                            });
                    })
                    .catch(error => {
                        console.error('خطأ في تسجيل الدخول:', error);
                        let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';
                        
                        if (error.code === 'auth/wrong-password') {
                            errorMessage = 'كلمة المرور غير صحيحة';
                        } else if (error.code === 'auth/user-not-found') {
                            errorMessage = 'البريد الإلكتروني غير مسجل';
                        } else if (error.code === 'auth/invalid-email') {
                            errorMessage = 'البريد الإلكتروني غير صالح';
                        } else if (error.code === 'auth/too-many-requests') {
                            errorMessage = 'تم تجاوز عدد المحاولات، يرجى المحاولة لاحقاً';
                        }
                        
                        showNotification(errorMessage, 'error');
                    })
                    .finally(() => {
                        // إعادة زر التسجيل إلى حالته الأصلية
                        submitButton.innerHTML = originalText;
                        submitButton.disabled = false;
                    });
            });
        }
        
        // مستمع حدث إنشاء حساب
        const signupForm = authModal.querySelector('#signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const email = document.getElementById('signup-email').value;
                const password = document.getElementById('signup-password').value;
                const confirmPassword = document.getElementById('signup-confirm-password').value;
                
                if (!email || !password || !confirmPassword) {
                    showNotification('يرجى إدخال جميع البيانات المطلوبة', 'error');
                    return;
                }
                
                if (password !== confirmPassword) {
                    showNotification('كلمة المرور وتأكيدها غير متطابقين', 'error');
                    return;
                }
                
                if (password.length < 6) {
                    showNotification('يجب أن تكون كلمة المرور 6 أحرف على الأقل', 'error');
                    return;
                }
                
                // تغيير نص زر التسجيل
                const submitButton = this.querySelector('button[type="submit"]');
                const originalText = submitButton.innerHTML;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري إنشاء الحساب...';
                submitButton.disabled = true;
                
                // إنشاء حساب جديد
                FirebaseSync.signup(email, password)
                    .then(user => {
                        showNotification(`تم إنشاء حساب جديد بنجاح: ${user.email}`, 'success');
                        
                        // تحديث واجهة المستخدم
                        updateAuthUIState();
                        
                        // إغلاق النموذج
                        closeModal('firebase-auth-modal');
                        
                        // تفعيل المزامنة
                        FirebaseSync.setSyncEnabled(true);
                        
                        // مزامنة البيانات
                        FirebaseSync.syncToFirebase()
                            .then(() => {
                                showNotification('تم مزامنة البيانات بنجاح', 'success');
                            })
                            .catch(error => {
                                console.error('خطأ في مزامنة البيانات:', error);
                            });
                    })
                  
.catch(error => {
    console.error('خطأ في إنشاء الحساب:', error);
    let errorMessage = 'حدث خطأ أثناء إنشاء الحساب';
    
    if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'البريد الإلكتروني مستخدم بالفعل';
    } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'البريد الإلكتروني غير صالح';
    } else if (error.code === 'auth/weak-password') {
        errorMessage = 'كلمة المرور ضعيفة جداً';
    }
    
    showNotification(errorMessage, 'error');
})
.finally(() => {
    // إعادة زر التسجيل إلى حالته الأصلية
    submitButton.innerHTML = originalText;
    submitButton.disabled = false;
});
});
}

// مستمعي أحداث الإغلاق
const closeButtons = authModal.querySelectorAll('.modal-close, .modal-close-btn');
closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        closeModal('firebase-auth-modal');
    });
});
}

/**
 * إضافة مستمعي الأحداث لقائمة المزامنة
 * @param {HTMLElement} menu - عنصر القائمة
 */
function setupSyncMenuListeners(menu) {
    // مستمع حدث المزامنة الآن
    const syncNowBtn = menu.querySelector('#sync-now-btn');
    if (syncNowBtn) {
        syncNowBtn.addEventListener('click', function() {
            // تغيير حالة الزر
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>جاري المزامنة...</span>';
            this.classList.add('disabled');
            
            // إجراء المزامنة
            Promise.all([
                FirebaseSync.syncToFirebase(),
                FirebaseSync.syncFromFirebase()
            ])
            .then(() => {
                showNotification('تم مزامنة البيانات بنجاح', 'success');
                
                // إغلاق القائمة
                menu.remove();
            })
            .catch(error => {
                console.error('خطأ في المزامنة:', error);
                showNotification('حدث خطأ أثناء المزامنة', 'error');
            })
            .finally(() => {
                // إعادة الزر إلى حالته الأصلية
                this.innerHTML = '<i class="fas fa-sync-alt"></i> <span>مزامنة الآن</span>';
                this.classList.remove('disabled');
            });
        });
    }
    
    // مستمع حدث تفعيل/إيقاف المزامنة التلقائية
    const toggleSyncBtn = menu.querySelector('#toggle-sync-btn');
    if (toggleSyncBtn) {
        toggleSyncBtn.addEventListener('click', function() {
            const syncEnabled = FirebaseSync._isSyncEnabled();
            
            // تغيير حالة المزامنة
            FirebaseSync.setSyncEnabled(!syncEnabled);
            
            // تحديث واجهة المستخدم
            if (FirebaseSync._isSyncEnabled()) {
                this.innerHTML = '<i class="fas fa-toggle-on"></i> <span>إيقاف المزامنة التلقائية</span>';
                showNotification('تم تفعيل المزامنة التلقائية', 'success');
            } else {
                this.innerHTML = '<i class="fas fa-toggle-off"></i> <span>تفعيل المزامنة التلقائية</span>';
                showNotification('تم إيقاف المزامنة التلقائية', 'success');
            }
            
            // تحديث مؤشر المزامنة
            const syncIndicator = menu.querySelector('.sync-indicator');
            if (syncIndicator) {
                if (FirebaseSync._isSyncEnabled()) {
                    syncIndicator.classList.add('active');
                    menu.querySelector('.sync-status span:last-child').textContent = 'المزامنة نشطة';
                } else {
                    syncIndicator.classList.remove('active');
                    menu.querySelector('.sync-status span:last-child').textContent = 'المزامنة غير نشطة';
                }
            }
            
            // تحديث مؤشر المزامنة في زر المزامنة
            updateSyncButtonIndicator();
        });
    }
    
    // مستمع حدث إنشاء نسخة احتياطية
    const createBackupBtn = menu.querySelector('#create-backup-btn');
    if (createBackupBtn) {
        createBackupBtn.addEventListener('click', function() {
            // تغيير حالة الزر
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>جاري إنشاء نسخة احتياطية...</span>';
            this.classList.add('disabled');
            
            // إنشاء نسخة احتياطية
            FirebaseSync.createBackup()
                .then(backupInfo => {
                    const date = new Date(backupInfo.timestamp).toLocaleString();
                    showNotification(`تم إنشاء نسخة احتياطية بنجاح (${date})`, 'success');
                    
                    // إغلاق القائمة
                    menu.remove();
                    
                    // تحديث قائمة النسخ الاحتياطية إذا كانت معروضة
                    refreshBackupsList();
                })
                .catch(error => {
                    console.error('خطأ في إنشاء نسخة احتياطية:', error);
                    showNotification('حدث خطأ أثناء إنشاء نسخة احتياطية', 'error');
                })
                .finally(() => {
                    // إعادة الزر إلى حالته الأصلية
                    this.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> <span>إنشاء نسخة احتياطية</span>';
                    this.classList.remove('disabled');
                });
        });
    }
    
    // مستمع حدث إدارة النسخ الاحتياطية
    const manageBackupsBtn = menu.querySelector('#manage-backups-btn');
    if (manageBackupsBtn) {
        manageBackupsBtn.addEventListener('click', function() {
            // إغلاق القائمة
            menu.remove();
            
            // تبديل إلى تبويب الإعدادات وتبويب النسخ الاحتياطي
            const settingsLink = document.querySelector('a[data-page="settings"]');
            if (settingsLink) {
                settingsLink.click();
                
                // التبديل إلى تبويب النسخ الاحتياطي
                setTimeout(() => {
                    const backupTab = document.querySelector('button[data-tab="backup"]');
                    if (backupTab) {
                        backupTab.click();
                        
                        // تحديث قائمة النسخ الاحتياطية
                        refreshBackupsList();
                    }
                }, 100);
            }
        });
    }
    
    // مستمع حدث تسجيل الخروج
    const logoutBtn = menu.querySelector('#logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // تغيير حالة الزر
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>جاري تسجيل الخروج...</span>';
            this.classList.add('disabled');
            
            // تسجيل الخروج
            FirebaseSync.logout()
                .then(() => {
                    showNotification('تم تسجيل الخروج بنجاح', 'success');
                    
                    // تحديث واجهة المستخدم
                    updateAuthUIState();
                    
                    // إغلاق القائمة
                    menu.remove();
                })
                .catch(error => {
                    console.error('خطأ في تسجيل الخروج:', error);
                    showNotification('حدث خطأ أثناء تسجيل الخروج', 'error');
                })
                .finally(() => {
                    // إعادة الزر إلى حالته الأصلية
                    this.innerHTML = '<i class="fas fa-sign-out-alt"></i> <span>تسجيل الخروج</span>';
                    this.classList.remove('disabled');
                });
        });
    }
}

/**
 * إضافة مستمعي الأحداث لتبويب النسخ الاحتياطي
 */
function setupBackupTabListeners() {
    // مستمع حدث زر تسجيل الدخول
    const authLoginBtn = document.getElementById('auth-login-btn');
    if (authLoginBtn) {
        authLoginBtn.addEventListener('click', function() {
            openModal('firebase-auth-modal');
        });
    }
    
    // مستمع حدث تفعيل/إيقاف المزامنة
    const enableSyncCheckbox = document.getElementById('enable-firebase-sync');
    if (enableSyncCheckbox) {
        enableSyncCheckbox.addEventListener('change', function() {
            FirebaseSync.setSyncEnabled(this.checked);
            
            // تحديث واجهة المستخدم
            if (this.checked) {
                showNotification('تم تفعيل المزامنة التلقائية', 'success');
            } else {
                showNotification('تم إيقاف المزامنة التلقائية', 'success');
            }
            
            // تحديث مؤشر المزامنة في زر المزامنة
            updateSyncButtonIndicator();
        });
    }
    
    // مستمع حدث المزامنة الآن
    const syncNowAction = document.getElementById('sync-now-action');
    if (syncNowAction) {
        syncNowAction.addEventListener('click', function() {
            // تغيير حالة الزر
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>جاري المزامنة...</span>';
            this.disabled = true;
            
            // إجراء المزامنة
            Promise.all([
                FirebaseSync.syncToFirebase(),
                FirebaseSync.syncFromFirebase()
            ])
            .then(() => {
                showNotification('تم مزامنة البيانات بنجاح', 'success');
            })
            .catch(error => {
                console.error('خطأ في المزامنة:', error);
                showNotification('حدث خطأ أثناء المزامنة', 'error');
            })
            .finally(() => {
                // إعادة الزر إلى حالته الأصلية
                this.innerHTML = originalText;
                this.disabled = false;
            });
        });
    }
    
    // مستمع حدث إنشاء نسخة احتياطية
    const createBackupAction = document.getElementById('create-backup-action');
    if (createBackupAction) {
        createBackupAction.addEventListener('click', function() {
            // تغيير حالة الزر
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>جاري إنشاء نسخة احتياطية...</span>';
            this.disabled = true;
            
            // إنشاء نسخة احتياطية
            FirebaseSync.createBackup()
                .then(backupInfo => {
                    const date = new Date(backupInfo.timestamp).toLocaleString();
                    showNotification(`تم إنشاء نسخة احتياطية بنجاح (${date})`, 'success');
                    
                    // تحديث قائمة النسخ الاحتياطية
                    refreshBackupsList();
                })
                .catch(error => {
                    console.error('خطأ في إنشاء نسخة احتياطية:', error);
                    showNotification('حدث خطأ أثناء إنشاء نسخة احتياطية', 'error');
                })
                .finally(() => {
                    // إعادة الزر إلى حالته الأصلية
                    this.innerHTML = originalText;
                    this.disabled = false;
                });
        });
    }
    
    // مستمع حدث استعادة نسخة احتياطية
    const restoreBackupAction = document.getElementById('restore-backup-action');
    if (restoreBackupAction) {
        restoreBackupAction.addEventListener('click', function() {
            // الحصول على قائمة النسخ الاحتياطية المتاحة
            FirebaseSync.getBackupsList()
                .then(backups => {
                    if (backups.length === 0) {
                        showNotification('لا توجد نسخ احتياطية متاحة', 'error');
                        return;
                    }
                    
                    // عرض نافذة اختيار النسخة الاحتياطية
                    showRestoreBackupModal(backups);
                })
                .catch(error => {
                    console.error('خطأ في الحصول على قائمة النسخ الاحتياطية:', error);
                    showNotification('حدث خطأ أثناء تحميل النسخ الاحتياطية', 'error');
                });
        });
    }
}

/**
 * تحديث قائمة النسخ الاحتياطية
 */
function refreshBackupsList() {
    const backupList = document.getElementById('backup-list');
    if (!backupList) return;
    
    // تغيير محتوى الجدول إلى رسالة التحميل
    const tbody = backupList.querySelector('tbody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center"><div class="loader"></div></td></tr>';
    }
    
    // الحصول على قائمة النسخ الاحتياطية
    FirebaseSync.getBackupsList()
        .then(backups => {
            if (!tbody) return;
            
            if (backups.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center">لا توجد نسخ احتياطية متاحة</td></tr>';
                return;
            }
            
            // عرض النسخ الاحتياطية
            tbody.innerHTML = backups.map(backup => `
                <tr>
                    <td>${backup.date}</td>
                    <td>${backup.investors}</td>
                    <td>${backup.transactions}</td>
                    <td>
                        <div class="backup-actions">
                            <button class="btn btn-sm btn-primary restore-backup-btn" data-timestamp="${backup.timestamp}">
                                <i class="fas fa-cloud-download-alt"></i>
                                <span>استعادة</span>
                            </button>
                            <button class="btn btn-sm btn-danger delete-backup-btn" data-timestamp="${backup.timestamp}">
                                <i class="fas fa-trash"></i>
                                <span>حذف</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
            
            // إضافة مستمعي الأحداث لأزرار الاستعادة والحذف
            setupBackupItemListeners();
        })
        .catch(error => {
            console.error('خطأ في تحديث قائمة النسخ الاحتياطية:', error);
            
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center">حدث خطأ أثناء تحميل النسخ الاحتياطية</td></tr>';
            }
        });
}

/**
 * إضافة مستمعي الأحداث لعناصر النسخ الاحتياطية
 */
function setupBackupItemListeners() {
    // مستمعي أحداث أزرار الاستعادة
    const restoreButtons = document.querySelectorAll('.restore-backup-btn');
    restoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const timestamp = this.getAttribute('data-timestamp');
            
            // تأكيد الاستعادة
            if (confirm('هل أنت متأكد من استعادة هذه النسخة الاحتياطية؟ سيتم استبدال جميع البيانات الحالية.')) {
                // تغيير حالة الزر
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                this.disabled = true;
                
                // استعادة النسخة الاحتياطية
                FirebaseSync.restoreBackup(parseInt(timestamp))
                    .then(() => {
                        showNotification('تم استعادة النسخة الاحتياطية بنجاح', 'success');
                        
                        // تحديث الواجهة
                        if (window.updateDashboard) {
                            window.updateDashboard();
                        }
                    })
                    .catch(error => {
                        console.error('خطأ في استعادة النسخة الاحتياطية:', error);
                        showNotification('حدث خطأ أثناء استعادة النسخة الاحتياطية', 'error');
                    })
                    .finally(() => {
                        // إعادة الزر إلى حالته الأصلية
                        this.innerHTML = originalText;
                        this.disabled = false;
                    });
            }
        });
    });
    
    // مستمعي أحداث أزرار الحذف
    const deleteButtons = document.querySelectorAll('.delete-backup-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const timestamp = this.getAttribute('data-timestamp');
            
            // تأكيد الحذف
            if (confirm('هل أنت متأكد من حذف هذه النسخة الاحتياطية؟')) {
                // تغيير حالة الزر
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                this.disabled = true;
                
                // حذف النسخة الاحتياطية
                FirebaseSync.deleteBackup(parseInt(timestamp))
                    .then(() => {
                        showNotification('تم حذف النسخة الاحتياطية بنجاح', 'success');
                        
                        // تحديث قائمة النسخ الاحتياطية
                        refreshBackupsList();
                    })
                    .catch(error => {
                        console.error('خطأ في حذف النسخة الاحتياطية:', error);
                        showNotification('حدث خطأ أثناء حذف النسخة الاحتياطية', 'error');
                    })
                    .finally(() => {
                        // إعادة الزر إلى حالته الأصلية
                        this.innerHTML = originalText;
                        this.disabled = false;
                    });
            }
        });
    });
}

/**
 * عرض نافذة استعادة النسخة الاحتياطية
 * @param {Array} backups - قائمة النسخ الاحتياطية
 */
function showRestoreBackupModal(backups) {
    // التحقق من وجود النافذة مسبقاً
    if (document.getElementById('restore-backup-modal')) {
        document.getElementById('restore-backup-modal').remove();
    }
    
    // إنشاء النافذة
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'restore-backup-modal';
    
    modal.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title">استعادة نسخة احتياطية</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <p>يرجى اختيار النسخة الاحتياطية التي ترغب في استعادتها:</p>
                <div class="backup-select-container">
                    <table class="backup-list">
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>المستثمرين</th>
                                <th>العمليات</th>
                                <th>الإجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${backups.map(backup => `
                                <tr>
                                    <td>${backup.date}</td>
                                    <td>${backup.investors}</td>
                                    <td>${backup.transactions}</td>
                                    <td>
                                        <button class="btn btn-primary btn-sm select-backup-btn" data-timestamp="${backup.timestamp}">
                                            استعادة
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="warning-message" style="margin-top: 16px; color: #e74c3c;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>تحذير: سيتم استبدال جميع البيانات الحالية بالنسخة المختارة.</span>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إلغاء</button>
                <button class="btn btn-primary" id="restore-latest-backup-btn">
                    استعادة أحدث نسخة احتياطية
                </button>
            </div>
        </div>
    `;
    
    // إضافة النافذة إلى الصفحة
    document.body.appendChild(modal);
    
    // مستمعي أحداث أزرار الإغلاق
    modal.querySelectorAll('.modal-close, .modal-close-btn').forEach(button => {
        button.addEventListener('click', () => {
            modal.remove();
        });
    });
    
    // مستمعي أحداث أزرار الاستعادة
    modal.querySelectorAll('.select-backup-btn').forEach(button => {
        button.addEventListener('click', function() {
            const timestamp = parseInt(this.getAttribute('data-timestamp'));
            
            // تغيير حالة الزر
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            this.disabled = true;
            
            // استعادة النسخة الاحتياطية
            FirebaseSync.restoreBackup(timestamp)
                .then(() => {
                    showNotification('تم استعادة النسخة الاحتياطية بنجاح', 'success');
                    
                    // إغلاق النافذة
                    modal.remove();
                    
                    // تحديث الواجهة
                    if (window.updateDashboard) {
                        window.updateDashboard();
                    }
                })
                .catch(error => {
                    console.error('خطأ في استعادة النسخة الاحتياطية:', error);
                    showNotification('حدث خطأ أثناء استعادة النسخة الاحتياطية', 'error');
                })
                .finally(() => {
                    // إعادة الزر إلى حالته الأصلية
                    this.innerHTML = originalText;
                    this.disabled = false;
                });
        });
    });
    
    // مستمع حدث استعادة أحدث نسخة احتياطية
    const restoreLatestBtn = modal.querySelector('#restore-latest-backup-btn');
    if (restoreLatestBtn) {
        restoreLatestBtn.addEventListener('click', function() {
            // تغيير حالة الزر
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الاستعادة...';
            this.disabled = true;
            
            // استعادة أحدث نسخة احتياطية
            FirebaseSync.restoreBackup()
                .then(() => {
                    showNotification('تم استعادة أحدث نسخة احتياطية بنجاح', 'success');
                    
                    // إغلاق النافذة
                    modal.remove();
                    
                    // تحديث الواجهة
                    if (window.updateDashboard) {
                        window.updateDashboard();
                    }
                })
                .catch(error => {
                    console.error('خطأ في استعادة النسخة الاحتياطية:', error);
                    showNotification('حدث خطأ أثناء استعادة النسخة الاحتياطية', 'error');
                })
                .finally(() => {
                    // إعادة الزر إلى حالته الأصلية
                    this.innerHTML = originalText;
                    this.disabled = false;
                });
        });
    }
}

/**
 * تحديث حالة واجهة المستخدم بناءً على حالة المصادقة
 */
function updateAuthUIState() {
    // الحصول على معلومات المستخدم الحالي
    const user = FirebaseSync.getCurrentUser();
    
    // تحديث حالة المصادقة في تبويب النسخ الاحتياطي
    const authStatusContainer = document.getElementById('firebase-auth-status');
    const firebaseBackupOptions = document.getElementById('firebase-backup-options');
    
    if (authStatusContainer && firebaseBackupOptions) {
        if (user) {
            // المستخدم مسجل الدخول
            authStatusContainer.className = 'auth-status logged-in';
            authStatusContainer.innerHTML = `
                <div class="status-icon">
                    <i class="fas fa-cloud-upload-alt"></i>
                </div>
                <div class="status-text">
                    <h4>متصل</h4>
                    <p>${user.email}</p>
                </div>
                <button class="btn btn-danger" id="auth-logout-btn">تسجيل الخروج</button>
            `;
            
            // إظهار خيارات النسخ الاحتياطي
            firebaseBackupOptions.style.display = 'block';
            
            // تحديث حالة تفعيل المزامنة
            const enableSyncCheckbox = document.getElementById('enable-firebase-sync');
            if (enableSyncCheckbox) {
                enableSyncCheckbox.checked = FirebaseSync._isSyncEnabled();
            }
            
            // تحديث قائمة النسخ الاحتياطية
            refreshBackupsList();
            
            // إضافة مستمع حدث تسجيل الخروج
            const logoutBtn = document.getElementById('auth-logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function() {
                    // تغيير حالة الزر
                    const originalText = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تسجيل الخروج...';
                    this.disabled = true;
                    
                    // تسجيل الخروج
                    FirebaseSync.logout()
                        .then(() => {
                            showNotification('تم تسجيل الخروج بنجاح', 'success');
                            
                            // تحديث واجهة المستخدم
                            updateAuthUIState();
                        })
                        .catch(error => {
                            console.error('خطأ في تسجيل الخروج:', error);
                            showNotification('حدث خطأ أثناء تسجيل الخروج', 'error');
                        })
                        .finally(() => {
                            // إعادة الزر إلى حالته الأصلية
                            this.innerHTML = originalText;
                            this.disabled = false;
                        });
                });
            }
            
        } else {
            // المستخدم غير مسجل الدخول
            authStatusContainer.className = 'auth-status not-logged-in';
            authStatusContainer.innerHTML = `
                <div class="status-icon">
                    <i class="fas fa-cloud"></i>
                </div>
                <div class="status-text">
                    <h4>غير متصل</h4>
                    <p>قم بتسجيل الدخول للاستفادة من المزامنة والنسخ الاحتياطي السحابي</p>
                </div>
                <button class="btn btn-primary" id="auth-login-btn">تسجيل الدخول</button>
            `;
            
            // إخفاء خيارات النسخ الاحتياطي
            firebaseBackupOptions.style.display = 'none';
            
            // إضافة مستمع حدث تسجيل الدخول
            const loginBtn = document.getElementById('auth-login-btn');
            if (loginBtn) {
                loginBtn.addEventListener('click', function() {
                    openModal('firebase-auth-modal');
                });
            }
        }
    }
    
    // تحديث مؤشر المزامنة في زر المزامنة
    updateSyncButtonIndicator();
}

/**
 * تحديث مؤشر المزامنة في زر المزامنة
 */
function updateSyncButtonIndicator() {
    const syncButton = document.getElementById('sync-button');
    if (!syncButton) return;
    
    // إزالة أي مؤشر موجود
    const existingIndicator = syncButton.querySelector('.sync-active-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // إضافة مؤشر إذا كانت المزامنة مفعلة
    if (FirebaseSync.getCurrentUser() && FirebaseSync._isSyncEnabled()) {
        const indicator = document.createElement('div');
        indicator.className = 'sync-active-indicator';
        syncButton.appendChild(indicator);
    }
}

/**
 * فتح نافذة منبثقة
 * @param {string} modalId - معرف النافذة
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.add('active');
}

/**
 * إغلاق نافذة منبثقة
 * @param {string} modalId - معرف النافذة
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('active');
}

/**
 * عرض إشعار للمستخدم
 * @param {string} message - نص الإشعار
 * @param {string} type - نوع الإشعار (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    // استخدام دالة عرض الإشعارات الموجودة في التطبيق إذا كانت متاحة
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
        return;
    }
    
    // إنشاء إشعار جديد إذا لم تكن الدالة موجودة
    console.log(`[${type.toUpperCase()}] ${message}`);
    alert(message);
}

/**
 * إضافة أحداث عامة للتطبيق
 */
function setupEventListeners() {
    // مستمع حدث تغيير الصفحة
    document.addEventListener('page:change', function(e) {
        if (e.detail && e.detail.page === 'settings') {
            // إذا تم التبديل إلى صفحة الإعدادات، تحديث حالة المصادقة
            updateAuthUIState();
        }
    });
    
    // استبدال مستمع حدث النقر على تبويب النسخ الاحتياطي
    const backupTabButton = document.querySelector('button[data-tab="backup"]');
    if (backupTabButton) {
        // حفظ المستمع الأصلي
        const originalClickHandler = backupTabButton.onclick;
        
        // استبدال المستمع
        backupTabButton.onclick = function(e) {
            // استدعاء المستمع الأصلي إذا كان موجوداً
            if (originalClickHandler) {
                originalClickHandler.call(this, e);
            }
            
            // تحديث حالة المصادقة
            updateAuthUIState();
            
            // تحديث قائمة النسخ الاحتياطية إذا كان المستخدم مسجل الدخول
            if (FirebaseSync.getCurrentUser()) {
                refreshBackupsList();
            }
        };
    }
}

/**
 * التحقق من تحميل Firebase
 * @returns {boolean} - ما إذا كان Firebase متاحاً
 */
function isFirebaseAvailable() {
    return typeof firebase !== 'undefined' &&
           typeof firebase.auth !== 'undefined' &&
           typeof firebase.database !== 'undefined';
}

// بدء تنفيذ الكود عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFirebaseIntegration);
} else {
    initializeFirebaseIntegration();
}

/**
 * تهيئة التكامل مع Firebase
 */
function initializeFirebaseIntegration() {
    console.log('تهيئة التكامل مع Firebase...');
    
    // التحقق من توفر Firebase
    if (!isFirebaseAvailable()) {
        console.error('لم يتم العثور على Firebase. تأكد من تضمين مكتبة Firebase.');
        return;
    }
    
    try {
        // التحقق من وجود تكوين Firebase
        if (typeof firebaseConfig === 'undefined') {
            console.error('لم يتم العثور على تكوين Firebase.');
            return;
        }
        
        // تهيئة Firebase إذا لم يتم تهيئته مسبقاً
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        
        // إضافة واجهة المستخدم
        addFirebaseAuthUI();
        addSyncButton();
        enhanceBackupTab();
        addFirebaseSyncStyles();
        
        // إضافة مستمعي الأحداث
        setupEventListeners();
        
        // تهيئة التزامن مع Firebase
        FirebaseSync.initialize()
            .then(initialized => {
                console.log('تهيئة Firebase:', initialized ? 'تمت بنجاح' : 'لم تكتمل');
                
                // تحديث واجهة المستخدم
                updateAuthUIState();
                
                // استدعاء loadDataWithSync بدلاً من loadData
                if (initialized && FirebaseSync._isSyncEnabled()) {
                    FirebaseSync.loadDataWithSync();
                }
            })
            .catch(error => {
                console.error('خطأ في تهيئة Firebase:', error);
            });
    } catch (error) {
        console.error('خطأ في تهيئة التكامل مع Firebase:', error);
    }
}
})();

/**
 * تكامل نظام المصادقة مع Firebase
 * يوفر وظائف التحقق من المستخدمين وإدارة الحسابات عبر Firebase Authentication
 */

// تكامل نظام المصادقة مع Firebase
(function() {
    // تهيئة تكامل المصادقة مع Firebase
    document.addEventListener('DOMContentLoaded', function() {
        console.log('تهيئة تكامل المصادقة مع Firebase...');
        
        // التحقق من وجود Firebase
        if (typeof firebase === 'undefined') {
            console.error('لم يتم العثور على Firebase');
            return;
        }
        
        // التحقق من وجود مكتبة المصادقة
        if (!firebase.auth) {
            console.error('لم يتم العثور على مكتبة المصادقة Firebase');
            return;
        }
        
        // إعداد مستمع لحالة المصادقة
        setupAuthStateListener();
        
        // إعداد الجلسة المحلية للمستخدم
        setupLocalSession();
    });
    
    /**
     * إعداد مستمع لحالة المصادقة
     */
    function setupAuthStateListener() {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                // المستخدم مسجل الدخول
                console.log(`تم تسجيل الدخول: ${user.email}`);
                
                // حفظ معلومات المستخدم في الجلسة المحلية
                saveUserToLocalSession(user);
                
                // تحديث واجهة المستخدم
                document.body.classList.add('authenticated');
                document.body.classList.remove('guest');
                
                // تحديث معلومات المستخدم في الواجهة
                updateAuthUI(true);
                
                // مزامنة البيانات من Firebase إذا كان FirebaseSync متاحًا
                if (window.FirebaseSync && typeof window.FirebaseSync.syncFromFirebase === 'function') {
                    window.FirebaseSync.syncFromFirebase()
                        .then(() => {
                            console.log('تمت مزامنة البيانات من Firebase بنجاح');
                            // تحديث الواجهة بعد المزامنة
                            if (typeof window.updateDashboard === 'function') window.updateDashboard();
                        })
                        .catch(error => {
                            console.error('خطأ في مزامنة البيانات من Firebase:', error);
                        });
                }
            } else {
                // المستخدم غير مسجل الدخول
                console.log('المستخدم غير مسجل الدخول');
                
                // مسح معلومات المستخدم من الجلسة المحلية
                clearLocalSession();
                
                // تحديث واجهة المستخدم
                document.body.classList.remove('authenticated');
                document.body.classList.add('guest');
                
                // تحديث معلومات المستخدم في الواجهة
                updateAuthUI(false);
                
                // إظهار شاشة تسجيل الدخول
                showAuthModal();
            }
        });
    }
    
    /**
     * تحديث واجهة المستخدم استنادًا إلى حالة المصادقة
     * @param {boolean} isAuthenticated حالة المصادقة
     */
    function updateAuthUI(isAuthenticated) {
        // تحديث قائمة المستخدم في الشريط العلوي
        if (window.AuthUI && typeof window.AuthUI.updateUserMenuUI === 'function') {
            window.AuthUI.updateUserMenuUI();
        }
        
        // تحديث عناصر واجهة المستخدم الأخرى
        toggleAuthElements(isAuthenticated);
    }
    
    /**
     * تبديل ظهور العناصر استنادًا إلى حالة المصادقة
     * @param {boolean} isAuthenticated حالة المصادقة
     */
    function toggleAuthElements(isAuthenticated) {
        // العناصر التي تظهر فقط للمستخدمين المصادقين
        const authOnlyElements = document.querySelectorAll('.auth-only');
        authOnlyElements.forEach(element => {
            element.style.display = isAuthenticated ? 'block' : 'none';
        });
        
        // العناصر التي تظهر فقط للزوار
        const guestOnlyElements = document.querySelectorAll('.guest-only');
        guestOnlyElements.forEach(element => {
            element.style.display = isAuthenticated ? 'none' : 'block';
        });
        
        // إظهار/إخفاء زر تسجيل الخروج في القائمة الجانبية
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.style.display = isAuthenticated ? 'flex' : 'none';
        }
    }
    
    /**
     * حفظ معلومات المستخدم في الجلسة المحلية
     * @param {Object} user كائن مستخدم Firebase
     */
    function saveUserToLocalSession(user) {
        if (!user) return;
        
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            lastLogin: new Date().toISOString()
        };
        
        // حفظ في localStorage
        localStorage.setItem('auth_user', JSON.stringify(userData));
        
        // حفظ في sessionStorage
        sessionStorage.setItem('auth_user', JSON.stringify(userData));
    }
    
    /**
     * مسح معلومات المستخدم من الجلسة المحلية
     */
    function clearLocalSession() {
        // مسح من localStorage
        localStorage.removeItem('auth_user');
        
        // مسح من sessionStorage
        sessionStorage.removeItem('auth_user');
    }
    
    /**
     * إعداد وإدارة الجلسة المحلية للمستخدم
     */
    function setupLocalSession() {
        // التحقق من وجود جلسة محفوظة
        const savedSession = localStorage.getItem('auth_user');
        
        if (savedSession) {
            try {
                // محاولة تحليل الجلسة المحفوظة
                const userData = JSON.parse(savedSession);
                
                // التحقق من صلاحية الجلسة
                const lastLogin = new Date(userData.lastLogin);
                const now = new Date();
                const daysSinceLogin = (now - lastLogin) / (1000 * 60 * 60 * 24);
                
                // إذا كانت الجلسة أقل من 30 يومًا، نعتبرها صالحة
                if (daysSinceLogin < 30) {
                    console.log('تم العثور على جلسة مستخدم صالحة');
                    
                    // تحديث واجهة المستخدم
                    document.body.classList.add('authenticated');
                    updateAuthUI(true);
                } else {
                    // الجلسة قديمة، نقوم بمسحها
                    console.log('الجلسة المحفوظة منتهية الصلاحية');
                    clearLocalSession();
                }
            } catch (error) {
                console.error('خطأ في تحليل الجلسة المحفوظة:', error);
                clearLocalSession();
            }
        }
    }
    
    /**
     * إظهار نافذة المصادقة
     */
    function showAuthModal() {
        if (window.AuthUI && typeof window.AuthUI.showAuthModal === 'function') {
            window.AuthUI.showAuthModal();
        } else {
            const authModal = document.getElementById('auth-modal');
            if (authModal) {
                authModal.classList.add('active');
            }
        }
    }
    
    /**
     * إخفاء نافذة المصادقة
     */
    function hideAuthModal() {
        if (window.AuthUI && typeof window.AuthUI.hideAuthModal === 'function') {
            window.AuthUI.hideAuthModal();
        } else {
            const authModal = document.getElementById('auth-modal');
            if (authModal) {
                authModal.classList.remove('active');
            }
        }
    }
    
    // إضافة الوظائف إلى النافذة للاستخدام الخارجي
    window.FirebaseAuthIntegration = {
        updateAuthUI,
        showAuthModal,
        hideAuthModal
    };
})();

/**
 * تعديل نظام تنقل الصفحات ليتطلب المصادقة للصفحات المحمية
 */
(function() {
    // قائمة الصفحات المحمية التي تتطلب تسجيل الدخول
    const protectedPages = ['investors', 'transactions', 'profits', 'reports', 'settings'];
    
    // الاستماع لأحداث تغيير الصفحة
    document.addEventListener('click', function(e) {
        const navLink = e.target.closest('.nav-link');
        if (!navLink) return;
        
        const pageId = navLink.getAttribute('data-page');
        if (!pageId) return;
        
        // التحقق مما إذا كانت الصفحة محمية
        if (protectedPages.includes(pageId)) {
            // التحقق من حالة المصادقة
            const isAuthenticated = isUserAuthenticated();
            
            if (!isAuthenticated) {
                // منع الوصول إلى الصفحة المحمية
                e.preventDefault();
                
                // إظهار نافذة تسجيل الدخول
                if (window.FirebaseAuthIntegration) {
                    window.FirebaseAuthIntegration.showAuthModal();
                } else if (window.AuthUI) {
                    window.AuthUI.showAuthModal();
                }
                
                // إظهار إشعار للمستخدم
                if (window.showNotification) {
                    window.showNotification('يجب تسجيل الدخول للوصول إلى هذه الصفحة', 'warning');
                }
                
                return false;
            }
        }
    });
    
    /**
     * التحقق مما إذا كان المستخدم مصادق عليه
     * @returns {boolean} حالة المصادقة
     */
    function isUserAuthenticated() {
        // التحقق أولاً من Firebase Auth
        if (firebase && firebase.auth) {
            const user = firebase.auth().currentUser;
            if (user) return true;
        }
        
        // التحقق بعد ذلك من AuthSystem
        if (window.AuthSystem && typeof window.AuthSystem.isAuthenticated === 'function') {
            return window.AuthSystem.isAuthenticated();
        }
        
        // التحقق أخيرًا من الجلسة المحلية
        const savedSession = localStorage.getItem('auth_user');
        return !!savedSession;
    }
})();