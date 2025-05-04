/**
 * نظام المصادقة وإدارة المستخدمين
 * يوفر وظائف تسجيل الدخول وإنشاء الحسابات والتكامل مع Firebase Authentication
 */

// تهيئة نظام المصادقة
const AuthSystem = (function() {
    // المتغيرات الخاصة
    let isAuthenticated = false;
    let currentUser = null;
    let authObservers = [];
    
    // تهيئة المصادقة عند تحميل الصفحة
    function initialize() {
        console.log('تهيئة نظام المصادقة...');
        
        // التحقق من وجود Firebase
        if (typeof firebase === 'undefined' || !firebase.auth) {
            console.error('لم يتم تحميل Firebase أو مكتبة المصادقة');
            return Promise.reject(new Error('Firebase غير مُهيأ'));
        }
        
        // إضافة مستمع لتغيير حالة المصادقة
        return new Promise((resolve) => {
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    // المستخدم مسجل الدخول
                    currentUser = user;
                    isAuthenticated = true;
                    console.log(`تم تسجيل الدخول: ${user.email}`);
                    
                    // التحقق من إكمال الملف الشخصي
                    checkUserProfile(user.uid);
                    
                    // إخفاء شاشة تسجيل الدخول إذا كانت ظاهرة
                    hideAuthModal();
                    
                    // إظهار واجهة المستخدم الرئيسية
                    document.body.classList.add('authenticated');
                    
                    // إشعار المراقبين بتسجيل الدخول
                    notifyObservers({ type: 'login', user: getUserInfo() });
                } else {
                    // المستخدم غير مسجل الدخول
                    currentUser = null;
                    isAuthenticated = false;
                    console.log('لم يتم تسجيل الدخول');
                    
                    // إظهار شاشة تسجيل الدخول
                    showAuthModal();
                    
                    // إخفاء واجهة المستخدم الرئيسية
                    document.body.classList.remove('authenticated');
                    
                    // إشعار المراقبين بتسجيل الخروج
                    notifyObservers({ type: 'logout' });
                }
                
                resolve({ isAuthenticated, user: getUserInfo() });
            });
        });
    }
    
    /**
     * تسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور
     * @param {string} email البريد الإلكتروني
     * @param {string} password كلمة المرور
     * @returns {Promise} وعد بالاستجابة
     */
    function login(email, password) {
        // التحقق من البريد الإلكتروني وكلمة المرور
        if (!email || !password) {
            return Promise.reject(new Error('البريد الإلكتروني وكلمة المرور مطلوبان'));
        }
        
        // إظهار مؤشر التحميل
        showLoadingIndicator('login');
        
        return firebase.auth().signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                // تسجيل الدخول بنجاح
                const user = userCredential.user;
                console.log(`تم تسجيل الدخول بنجاح: ${user.email}`);
                
                // إخفاء مؤشر التحميل
                hideLoadingIndicator('login');
                
                // إخفاء شاشة تسجيل الدخول
                hideAuthModal();
                
                // إشعار المراقبين
                notifyObservers({ type: 'login', user: getUserInfo() });
                
                return { success: true, user: getUserInfo() };
            })
            .catch(error => {
                // حدث خطأ أثناء تسجيل الدخول
                console.error('خطأ في تسجيل الدخول:', error);
                
                // إخفاء مؤشر التحميل
                hideLoadingIndicator('login');
                
                // ترجمة رسالة الخطأ
                let errorMessage = translateFirebaseAuthError(error.code);
                
                // إظهار رسالة الخطأ
                showAuthError(errorMessage);
                
                return Promise.reject({ code: error.code, message: errorMessage });
            });
    }
    
    /**
     * إنشاء حساب جديد باستخدام البريد الإلكتروني وكلمة المرور
     * @param {string} email البريد الإلكتروني
     * @param {string} password كلمة المرور
     * @param {string} name الاسم الكامل (اختياري)
     * @returns {Promise} وعد بالاستجابة
     */
    function signup(email, password, name = '') {
        // التحقق من البريد الإلكتروني وكلمة المرور
        if (!email || !password) {
            return Promise.reject(new Error('البريد الإلكتروني وكلمة المرور مطلوبان'));
        }
        
        // التحقق من قوة كلمة المرور
        if (password.length < 6) {
            return Promise.reject(new Error('يجب أن تتكون كلمة المرور من 6 أحرف على الأقل'));
        }
        
        // إظهار مؤشر التحميل
        showLoadingIndicator('signup');
        
        return firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                const user = userCredential.user;
                console.log(`تم إنشاء حساب جديد: ${user.email}`);

                const defaultPermissions = {
                    canAddInvestors: true,
                    canEditInvestors: true,
                    canDeleteInvestors: false,
                    canProcessDeposits: true,
                    canProcessWithdrawals: true,
                    canPayProfits: false,
                    canManageSettings: false,
                    canExportData: true,
                    canImportData: false,
                    canCreateBackup: true,
                    canRestoreBackup: false,
                    canCreateUsers: false,
                    canDeleteUsers: false,
                    canViewReports: true
                };

                const profileData = {
                    email: user.email,
                    displayName: name || email.split('@')[0],
                    type: "user", // Default user type
                    createdAt: new Date().toISOString()
                };

                const updatePromises = [
                    user.updateProfile({ displayName: profileData.displayName }),
                    firebase.database().ref(`users/${user.uid}/profile`).set(profileData),
                    firebase.database().ref(`users/${user.uid}/permissions`).set(defaultPermissions)
                ];

                return Promise.all(updatePromises)
                    .then(() => {
                        // إخفاء مؤشر التحميل
                        hideLoadingIndicator('signup');
                        
                        // إخفاء شاشة تسجيل الدخول
                        hideAuthModal();
                        
                        // إشعار المراقبين
                        notifyObservers({ type: 'signup', user: getUserInfo() });
                        
                        return { success: true, user: getUserInfo() };
                    });
            })
            .catch(error => {
                // حدث خطأ أثناء إنشاء الحساب
                console.error('خطأ في إنشاء الحساب:', error);
                
                // إخفاء مؤشر التحميل
                hideLoadingIndicator('signup');
                
                // ترجمة رسالة الخطأ
                let errorMessage = translateFirebaseAuthError(error.code);
                
                // إظهار رسالة الخطأ
                showAuthError(errorMessage);
                
                return Promise.reject({ code: error.code, message: errorMessage });
            });
    }
    
    /**
     * تسجيل الخروج من الحساب الحالي
     * @returns {Promise} وعد بالاستجابة
     */
    function logout() {
        return firebase.auth().signOut()
            .then(() => {
                console.log('تم تسجيل الخروج بنجاح');
                
                // إظهار شاشة تسجيل الدخول
                showAuthModal();
                
                // إشعار المراقبين
                notifyObservers({ type: 'logout' });
                
                return { success: true };
            })
            .catch(error => {
                console.error('خطأ في تسجيل الخروج:', error);
                return Promise.reject(error);
            });
    }
    
    /**
     * إعادة تعيين كلمة المرور
     * @param {string} email البريد الإلكتروني
     * @returns {Promise} وعد بالاستجابة
     */
    function resetPassword(email) {
        if (!email) {
            return Promise.reject(new Error('البريد الإلكتروني مطلوب'));
        }
        
        // إظهار مؤشر التحميل
        showLoadingIndicator('reset');
        
        return firebase.auth().sendPasswordResetEmail(email)
            .then(() => {
                // إخفاء مؤشر التحميل
                hideLoadingIndicator('reset');
                
                console.log(`تم إرسال رابط إعادة تعيين كلمة المرور إلى: ${email}`);
                
                return { success: true, email };
            })
            .catch(error => {
                // حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور
                console.error('خطأ في إرسال رابط إعادة تعيين كلمة المرور:', error);
                
                // إخفاء مؤشر التحميل
                hideLoadingIndicator('reset');
                
                // ترجمة رسالة الخطأ
                let errorMessage = translateFirebaseAuthError(error.code);
                
                // إظهار رسالة الخطأ
                showAuthError(errorMessage);
                
                return Promise.reject({ code: error.code, message: errorMessage });
            });
    }
    
    /**
     * إنشاء ملف شخصي للمستخدم في قاعدة البيانات
     * @param {string} uid معرف المستخدم
     * @param {Object} profileData بيانات الملف الشخصي
     * @returns {Promise} وعد بالاستجابة
     */
    function createUserProfile(uid, profileData) {
        if (!firebase.database) {
            console.error('مكتبة قاعدة البيانات غير متوفرة');
            return Promise.resolve();
        }
        
        return firebase.database().ref(`users/${uid}/profile`).set({
            ...profileData,
            updatedAt: new Date().toISOString()
        });
    }
    
    /**
     * التحقق من وجود ملف شخصي للمستخدم
     * @param {string} uid معرف المستخدم
     */
    function checkUserProfile(uid) {
        if (!firebase.database) {
            console.error('مكتبة قاعدة البيانات غير متوفرة');
            return Promise.resolve();
        }
        
        return firebase.database().ref(`users/${uid}/profile`).once('value')
            .then(snapshot => {
                if (!snapshot.exists()) {
                    // إنشاء ملف شخصي إذا لم يكن موجوداً
                    const user = firebase.auth().currentUser;
                    return createUserProfile(uid, {
                        email: user.email,
                        displayName: user.displayName || user.email.split('@')[0],
                        createdAt: new Date().toISOString()
                    });
                }
            })
            .catch(error => {
                console.error('خطأ في التحقق من الملف الشخصي:', error);
            });
    }
    
    /**
     * الحصول على معلومات المستخدم الحالي
     * @returns {Object|null} معلومات المستخدم أو null إذا لم يكن مسجل الدخول
     */
    function getUserInfo() {
        if (!currentUser) {
            return null;
        }
        
        return {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            emailVerified: currentUser.emailVerified,
            isAnonymous: currentUser.isAnonymous,
            createdAt: currentUser.metadata ? currentUser.metadata.creationTime : null,
            lastSignInTime: currentUser.metadata ? currentUser.metadata.lastSignInTime : null
        };
    }
    
    /**
     * إضافة مراقب لأحداث المصادقة
     * @param {Function} observer دالة المراقبة
     */
    function addAuthObserver(observer) {
        if (typeof observer === 'function' && !authObservers.includes(observer)) {
            authObservers.push(observer);
        }
    }
    
    /**
     * إزالة مراقب من مراقبي المصادقة
     * @param {Function} observer دالة المراقبة
     */
    function removeAuthObserver(observer) {
        const index = authObservers.indexOf(observer);
        if (index !== -1) {
            authObservers.splice(index, 1);
        }
    }
    
    /**
     * إشعار جميع المراقبين بحدث
     * @param {Object} event حدث المصادقة
     */
    function notifyObservers(event) {
        authObservers.forEach(observer => {
            try {
                observer(event);
            } catch (error) {
                console.error('خطأ في مراقب المصادقة:', error);
            }
        });
    }
    
    /**
     * إظهار شاشة تسجيل الدخول
     */
    function showAuthModal() {
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
            authModal.classList.add('active');
        }
    }
    
    /**
     * إخفاء شاشة تسجيل الدخول
     */
    function hideAuthModal() {
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
            authModal.classList.remove('active');
        }
    }
    
    /**
     * إظهار مؤشر التحميل
     * @param {string} action نوع الإجراء (login, signup, reset)
     */
    function showLoadingIndicator(action) {
        const button = getActionButton(action);
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جارِ التحميل...';
        }
    }
    
    /**
     * إخفاء مؤشر التحميل
     * @param {string} action نوع الإجراء (login, signup, reset)
     */
    function hideLoadingIndicator(action) {
        const button = getActionButton(action);
        if (button) {
            button.disabled = false;
            
            // استعادة النص الأصلي للزر
            switch (action) {
                case 'login':
                    button.textContent = 'تسجيل الدخول';
                    break;
                case 'signup':
                    button.textContent = 'إنشاء حساب';
                    break;
                case 'reset':
                    button.textContent = 'إرسال رابط التعيين';
                    break;
                default:
                    button.textContent = 'تأكيد';
            }
        }
    }
    
    /**
     * الحصول على زر الإجراء المناسب
     * @param {string} action نوع الإجراء (login, signup, reset)
     * @returns {HTMLElement|null} عنصر الزر
     */
    function getActionButton(action) {
        switch (action) {
            case 'login':
                return document.getElementById('login-btn');
            case 'signup':
                return document.getElementById('signup-btn');
            case 'reset':
                return document.getElementById('reset-btn');
            default:
                return null;
        }
    }
    
    /**
     * إظهار رسالة خطأ في شاشة المصادقة
     * @param {string} message رسالة الخطأ
     */
    function showAuthError(message) {
        const errorElement = document.getElementById('auth-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            // إخفاء الرسالة بعد 5 ثوانٍ
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }
    }
    
    /**
     * ترجمة أكواد أخطاء Firebase Authentication إلى رسائل عربية
     * @param {string} errorCode كود الخطأ
     * @returns {string} رسالة الخطأ بالعربية
     */
    function translateFirebaseAuthError(errorCode) {
        switch (errorCode) {
            case 'auth/invalid-email':
                return 'البريد الإلكتروني غير صالح';
            case 'auth/user-disabled':
                return 'تم تعطيل هذا الحساب';
            case 'auth/user-not-found':
                return 'لم يتم العثور على حساب بهذا البريد الإلكتروني';
            case 'auth/wrong-password':
                return 'كلمة المرور غير صحيحة';
            case 'auth/email-already-in-use':
                return 'هذا البريد الإلكتروني مستخدم بالفعل';
            case 'auth/weak-password':
                return 'كلمة المرور ضعيفة جداً (يجب أن تكون 6 أحرف على الأقل)';
            case 'auth/operation-not-allowed':
                return 'تسجيل الدخول بهذه الطريقة غير مسموح به';
            case 'auth/too-many-requests':
                return 'تم حظر هذا الجهاز بسبب نشاط غير عادي. حاول مرة أخرى لاحقاً';
            case 'auth/network-request-failed':
                return 'حدث خطأ في الاتصال بالشبكة. تحقق من اتصالك بالإنترنت';
            default:
                return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى';
        }
    }
    
    // واجهة برمجة التطبيق العامة
    return {
        initialize,
        login,
        signup,
        logout,
        resetPassword,
        getUserInfo,
        isAuthenticated: () => isAuthenticated,
        currentUser: () => currentUser,
        addAuthObserver,
        removeAuthObserver,
        showAuthModal,
        hideAuthModal
    };
})();

// تصدير النظام للاستخدام الخارجي
window.AuthSystem = AuthSystem;

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تهيئة نظام المصادقة...');
    
    // تهيئة النظام
    AuthSystem.initialize()
        .then(auth => {
            console.log('حالة المصادقة:', auth.isAuthenticated ? 'مسجل الدخول' : 'غير مسجل الدخول');
            
            // إضافة مستمعي الأحداث لأزرار تسجيل الدخول وإنشاء الحساب
            setupAuthButtons();
        })
        .catch(error => {
            console.error('خطأ في تهيئة نظام المصادقة:', error);
        });
});

/**
 * إعداد مستمعي الأحداث لأزرار المصادقة
 */
function setupAuthButtons() {
    // زر تسجيل الدخول
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    // زر إنشاء حساب
    const signupBtn = document.getElementById('signup-btn');
    if (signupBtn) {
        signupBtn.addEventListener('click', handleSignup);
    }
    
    // زر إعادة تعيين كلمة المرور
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', handleResetPassword);
    }
    
    // زر تسجيل الخروج
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // روابط التبديل بين تسجيل الدخول وإنشاء الحساب
    const switchToSignupLink = document.getElementById('switch-to-signup');
    if (switchToSignupLink) {
        switchToSignupLink.addEventListener('click', function(e) {
            e.preventDefault();
            switchAuthTab('signup');
        });
    }
    
    const switchToLoginLink = document.getElementById('switch-to-login');
    if (switchToLoginLink) {
        switchToLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            switchAuthTab('login');
        });
    }
    
    // رابط استعادة كلمة المرور
    const forgotPasswordLink = document.getElementById('forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            switchAuthTab('reset');
        });
    }
    
    // رابط العودة إلى تسجيل الدخول من شاشة استعادة كلمة المرور
    const backToLoginLink = document.getElementById('back-to-login');
    if (backToLoginLink) {
        backToLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            switchAuthTab('login');
        });
    }
}

/**
 * التبديل بين علامات تبويب المصادقة
 * @param {string} tab علامة التبويب (login, signup, reset)
 */
function switchAuthTab(tab) {
    // إخفاء جميع علامات التبويب
    const tabs = document.querySelectorAll('.auth-tab');
    tabs.forEach(t => t.classList.remove('active'));
    
    // إظهار علامة التبويب المطلوبة
    const selectedTab = document.getElementById(`${tab}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // تحديث العنوان
    const modalTitle = document.querySelector('.auth-modal-title');
    if (modalTitle) {
        switch (tab) {
            case 'login':
                modalTitle.textContent = 'تسجيل الدخول';
                break;
            case 'signup':
                modalTitle.textContent = 'إنشاء حساب جديد';
                break;
            case 'reset':
                modalTitle.textContent = 'استعادة كلمة المرور';
                break;
        }
    }
    
    // إخفاء أي رسائل خطأ سابقة
    const errorElement = document.getElementById('auth-error');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

/**
 * معالجة تسجيل الدخول
 * @param {Event} e حدث النقر
 */
function handleLogin(e) {
    if (e) e.preventDefault();
    
    // الحصول على البريد الإلكتروني وكلمة المرور
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // التحقق من تعبئة الحقول المطلوبة
    if (!email || !password) {
        showAuthError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
        return;
    }
    
    // تسجيل الدخول
    AuthSystem.login(email, password)
        .catch(error => {
            console.error('فشل تسجيل الدخول:', error);
        });
}

/**
 * معالجة إنشاء حساب جديد
 * @param {Event} e حدث النقر
 */
function handleSignup(e) {
    if (e) e.preventDefault();
    
    // الحصول على بيانات الحساب الجديد
    let emailElement = document.getElementById('signup-email');
    let passwordElement = document.getElementById('signup-password');
    let confirmPasswordElement = document.getElementById('signup-confirm-password');
    let nameElement = document.getElementById('signup-name');
    
    // التحقق من وجود العناصر
    if (!emailElement || !passwordElement || !confirmPasswordElement) {
        // محاولة البحث عن عناصر بديلة (قد تكون تم تعديل المعرفات)
        const alternativeEmailElement = document.querySelector('input[type="email"][id^="signup-email"]');
        const alternativePasswordElement = document.querySelector('input[type="password"][id^="signup-password"]:not([id$="confirm-password"])');
        const alternativeConfirmPasswordElement = document.querySelector('input[type="password"][id^="signup-confirm-password"], input[type="password"][id*="confirm-password"]');
        
        if (alternativeEmailElement) emailElement = alternativeEmailElement;
        if (alternativePasswordElement) passwordElement = alternativePasswordElement;
        if (alternativeConfirmPasswordElement) confirmPasswordElement = alternativeConfirmPasswordElement;
        
        // إذا لم نجد البدائل، نظهر رسالة خطأ
        if (!emailElement || !passwordElement || !confirmPasswordElement) {
            console.error('تعذر العثور على حقول نموذج إنشاء الحساب');
            showAuthError('حدث خطأ في النظام. يرجى تحديث الصفحة والمحاولة مرة أخرى.');
            return;
        }
    }
    
    // الحصول على القيم
    const email = emailElement.value;
    const password = passwordElement.value;
    const confirmPassword = confirmPasswordElement.value;
    const name = nameElement ? nameElement.value : '';
    
    // التحقق من تعبئة الحقول المطلوبة
    if (!email || !password) {
        showAuthError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
        return;
    }
    
    // التحقق من تطابق كلمتي المرور
    if (password !== confirmPassword) {
        showAuthError('كلمتا المرور غير متطابقتين');
        return;
    }
    
    // إنشاء الحساب
    AuthSystem.signup(email, password, name)
        .catch(error => {
            console.error('فشل إنشاء الحساب:', error);
        });
}
/**
 * معالجة إعادة تعيين كلمة المرور
 * @param {Event} e حدث النقر
 */
function handleResetPassword(e) {
    if (e) e.preventDefault();
    
    // الحصول على البريد الإلكتروني
    const email = document.getElementById('reset-email').value;
    
    // التحقق من تعبئة البريد الإلكتروني
    if (!email) {
        showAuthError('يرجى إدخال البريد الإلكتروني');
        return;
    }
    
    // إرسال رابط إعادة تعيين كلمة المرور
    AuthSystem.resetPassword(email)
        .then(() => {
            // إظهار رسالة نجاح
            const successElement = document.getElementById('reset-success');
            if (successElement) {
                successElement.textContent = `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}`;
                successElement.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('فشل إرسال رابط إعادة تعيين كلمة المرور:', error);
        });
}

/**
 * معالجة تسجيل الخروج
 * @param {Event} e حدث النقر
 */
function handleLogout(e) {
    if (e) e.preventDefault();
    
    // تأكيد تسجيل الخروج
    if (confirm('هل أنت متأكد من رغبتك في تسجيل الخروج؟')) {
        AuthSystem.logout()
            .catch(error => {
                console.error('فشل تسجيل الخروج:', error);
            });
    }
}

/**
 * إظهار رسالة خطأ في شاشة المصادقة
 * @param {string} message رسالة الخطأ
 */
function showAuthError(message) {
    const errorElement = document.getElementById('auth-error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // إخفاء رسالة الخطأ بعد 5 ثوانٍ
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    } else {
        // عرض الرسالة في وحدة تحكم المتصفح إذا لم يكن هناك عنصر لعرض الخطأ
        console.error('رسالة خطأ المصادقة:', message);
    }
}



