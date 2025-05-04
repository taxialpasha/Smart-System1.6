/**
 * نظام ملف المستخدم المحسن
 * يوفر وظائف إدارة ملف المستخدم وتفضيلاته وإعداداته
 */

const UserProfileSystem = (function() {
    // المتغيرات الخاصة
    let currentTheme = 'light';
    let currentFontSize = 'medium';
    let currentDensity = 'normal';
    let userActivityLog = [];
    
    // الألوان المرتبطة بأنواع النشاطات
    const activityColors = {
        login: '#3b82f6',      // أزرق
        logout: '#ef4444',     // أحمر
        profile: '#10b981',    // أخضر
        security: '#f59e0b',   // برتقالي
        transaction: '#8b5cf6', // بنفسجي
        settings: '#6b7280'    // رمادي
    };
    
    /**
     * تهيئة نظام ملف المستخدم
     */
    function initialize() {
        console.log('تهيئة نظام ملف المستخدم...');
        
        // إضافة أنماط CSS لملف المستخدم
        injectProfileStyles();
        
        // تحديث واجهة المستخدم بناءً على معلومات المستخدم
        updateUserProfileUI();
        
        // إعداد مستمعي الأحداث
        setupEventListeners();
        
        // تحميل إعدادات المستخدم المحفوظة
        loadUserSettings();
        
        // تهيئة محتوى النوافذ
        initializeModalContent();
    }
    
    /**
     * إضافة أنماط CSS لنظام ملف المستخدم
     */
    function injectProfileStyles() {
        // التحقق من وجود العنصر قبل إضافته
        if (!document.getElementById('user-profile-styles')) {
            const userProfileStylesheet = document.createElement('link');
            userProfileStylesheet.id = 'user-profile-styles';
            userProfileStylesheet.rel = 'stylesheet';
            userProfileStylesheet.href = 'user-profile-styles.css'; // يمكن تغييره إلى الملف الفعلي
            document.head.appendChild(userProfileStylesheet);
        }
    }
    
    /**
     * تحديث واجهة المستخدم بناءً على معلومات المستخدم
     */
    function updateUserProfileUI() {
        // الحصول على معلومات المستخدم
        const user = getUserInfo();
        
        if (user) {
            // تحديث اسم المستخدم في الشريط العلوي
            const headerUserName = document.getElementById('header-user-name');
            if (headerUserName) {
                headerUserName.textContent = user.displayName || user.email.split('@')[0];
            }
            
            // تحديث دور المستخدم
            const headerUserRole = document.getElementById('header-user-role');
            if (headerUserRole) {
                headerUserRole.textContent = user.role || 'مستخدم';
            }
            
            // تحديث الأحرف الأولى للمستخدم
            const userAvatarHeader = document.getElementById('user-avatar-header');
            if (userAvatarHeader) {
                userAvatarHeader.textContent = getInitials(user.displayName || user.email);
            }
            
            // تحديث معلومات المستخدم في القائمة المنسدلة
            const dropdownUserName = document.getElementById('dropdown-user-name');
            if (dropdownUserName) {
                dropdownUserName.textContent = user.displayName || user.email.split('@')[0];
            }
            
            const dropdownUserEmail = document.getElementById('dropdown-user-email');
            if (dropdownUserEmail) {
                dropdownUserEmail.textContent = user.email;
            }
            
            const dropdownUserAvatar = document.getElementById('dropdown-user-avatar');
            if (dropdownUserAvatar) {
                dropdownUserAvatar.textContent = getInitials(user.displayName || user.email);
            }
            
            // تحديث حالة حساب المستخدم
            const accountStatus = document.getElementById('account-status');
            if (accountStatus) {
                if (user.emailVerified) {
                    accountStatus.classList.remove('pending');
                    accountStatus.classList.add('verified');
                    accountStatus.innerHTML = '<i class="fas fa-check-circle"></i> <span>حساب موثق</span>';
                } else {
                    accountStatus.classList.remove('verified');
                    accountStatus.classList.add('pending');
                    accountStatus.innerHTML = '<i class="fas fa-exclamation-circle"></i> <span>يرجى تأكيد البريد الإلكتروني</span>';
                }
            }
            
            // تحديث حالة الإشعارات
            updateNotificationStatus();
        }
    }
    
    /**
     * إعداد مستمعي الأحداث
     */
    function setupEventListeners() {
        // مستمع لفتح/إغلاق قائمة المستخدم
        const userProfileContainer = document.getElementById('user-profile-container');
        if (userProfileContainer) {
            userProfileContainer.addEventListener('click', toggleUserMenu);
        }
        
        // مستمعو النقر للعناصر في القائمة المنسدلة
        setupDropdownItemsEvents();
        
        // مستمعو الأحداث لنافذة الملف الشخصي
        setupProfileModalEvents();
        
        // مستمعو الأحداث لنافذة سجل النشاطات
        setupActivityModalEvents();
        
        // مستمع لإغلاق القائمة عند النقر خارجها
        document.addEventListener('click', function(event) {
            const userMenu = document.getElementById('user-dropdown-menu');
            const profileContainer = document.getElementById('user-profile-container');
            
            if (userMenu && profileContainer) {
                if (userMenu.classList.contains('active') && 
                    !userMenu.contains(event.target) && 
                    !profileContainer.contains(event.target)) {
                    userMenu.classList.remove('active');
                    
                    // تغيير حالة أيقونة القائمة
                    const menuToggle = document.getElementById('user-menu-toggle');
                    if (menuToggle) {
                        menuToggle.classList.remove('active');
                    }
                }
            }
        });
        
        // مستمع تحديثات المستخدم
        if (window.AuthSystem) {
            window.AuthSystem.addAuthObserver(function(event) {
                if (event.type === 'login' || event.type === 'profile-update') {
                    updateUserProfileUI();
                }
            });
        }
    }
    
    /**
     * إعداد مستمعي أحداث لعناصر القائمة المنسدلة
     */
    function setupDropdownItemsEvents() {
        // فتح نافذة الملف الشخصي
        const profileMenuItem = document.getElementById('profile-menu-item');
        if (profileMenuItem) {
            profileMenuItem.addEventListener('click', function(e) {
                e.preventDefault();
                openProfileModal('profile'); // فتح على تبويب الملف الشخصي
                closeUserMenu();
            });
        }
        
        // فتح نافذة الأمان والخصوصية
        const securityMenuItem = document.getElementById('security-menu-item');
        if (securityMenuItem) {
            securityMenuItem.addEventListener('click', function(e) {
                e.preventDefault();
                openProfileModal('security'); // فتح على تبويب الأمان
                closeUserMenu();
            });
        }
        
        // فتح نافذة تفضيلات النظام
        const preferencesMenuItem = document.getElementById('preferences-menu-item');
        if (preferencesMenuItem) {
            preferencesMenuItem.addEventListener('click', function(e) {
                e.preventDefault();
                openProfileModal('appearance'); // فتح على تبويب المظهر
                closeUserMenu();
            });
        }
        
        // فتح سجل النشاطات
        const activityMenuItem = document.getElementById('activity-menu-item');
        if (activityMenuItem) {
            activityMenuItem.addEventListener('click', function(e) {
                e.preventDefault();
                openActivityLogModal();
                closeUserMenu();
            });
        }
        
        // فتح صفحة الإعدادات
        const settingsMenuItem = document.getElementById('settings-menu-item');
        if (settingsMenuItem) {
            settingsMenuItem.addEventListener('click', function(e) {
                e.preventDefault();
                openSettingsPage();
                closeUserMenu();
            });
        }
        
        // فتح صفحة المساعدة والدعم
        const helpMenuItem = document.getElementById('help-menu-item');
        if (helpMenuItem) {
            helpMenuItem.addEventListener('click', function(e) {
                e.preventDefault();
                // يمكن تنفيذ فتح صفحة المساعدة هنا
                alert('سيتم فتح صفحة المساعدة والدعم قريباً');
                closeUserMenu();
            });
        }
        
        // تسجيل الخروج
        const logoutMenuItem = document.getElementById('logout-menu-item');
        if (logoutMenuItem) {
            logoutMenuItem.addEventListener('click', function(e) {
                e.preventDefault();
                confirmLogout();
                closeUserMenu();
            });
        }
    }
    
    /**
     * إعداد مستمعي أحداث لنافذة الملف الشخصي
     */
    function setupProfileModalEvents() {
        // مستمعو أحداث للتبديل بين تبويبات نافذة الملف الشخصي
        const tabButtons = document.querySelectorAll('.user-profile-tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                switchProfileTab(tabName);
            });
        });
        
        // مستمع لإغلاق نافذة الملف الشخصي
        const closeButtons = document.querySelectorAll('#user-profile-modal .modal-close, #user-profile-modal .modal-close-btn');
        closeButtons.forEach(button => {
            button.addEventListener('click', closeProfileModal);
        });
        
        // مستمع لزر تغيير الصورة الشخصية
        const changePictureBtn = document.getElementById('change-picture-btn');
        if (changePictureBtn) {
            changePictureBtn.addEventListener('click', function() {
                // يمكن تنفيذ فتح مربع حوار اختيار الصورة
                alert('ستتمكن قريباً من تحميل صورة شخصية');
            });
        }
        
        // مستمع لزر إزالة الصورة الشخصية
        const removePictureBtn = document.getElementById('remove-picture-btn');
        if (removePictureBtn) {
            removePictureBtn.addEventListener('click', function() {
                // يمكن تنفيذ إزالة الصورة الشخصية
                alert('سيتم حذف الصورة الشخصية');
            });
        }
        
        // مستمع لزر تغيير كلمة المرور
        const changePasswordBtn = document.getElementById('change-password-btn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', changePassword);
        }
        
        // مستمع لقياس قوة كلمة المرور
        const newPasswordInput = document.getElementById('new-password');
        if (newPasswordInput) {
            newPasswordInput.addEventListener('input', checkPasswordStrength);
        }
        
        // مستمع لتبديل المصادقة الثنائية
        const twoFactorToggle = document.getElementById('two-factor-toggle');
        if (twoFactorToggle) {
            twoFactorToggle.addEventListener('change', toggleTwoFactorAuth);
        }
        
        // مستمعو أحداث لزر حفظ التغييرات
        const saveProfileBtn = document.getElementById('save-profile-settings');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', saveProfileChanges);
        }
        
        // مستمعو أحداث لخيارات الثيم
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.addEventListener('click', function() {
                const theme = this.getAttribute('data-theme');
                changeTheme(theme);
                
                // تحديث الواجهة
                themeOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
    
    /**
     * إعداد مستمعي أحداث لنافذة سجل النشاطات
     */
    function setupActivityModalEvents() {
        // مستمع لإغلاق نافذة سجل النشاطات
        const closeButtons = document.querySelectorAll('#activity-log-modal .modal-close');
        closeButtons.forEach(button => {
            button.addEventListener('click', closeActivityLogModal);
        });
        
        // مستمع لتصفية سجل النشاطات
        const activityTypeFilter = document.getElementById('activity-type-filter');
        if (activityTypeFilter) {
            activityTypeFilter.addEventListener('change', filterActivityLog);
        }
        
        // مستمع لمسح سجل النشاطات
        const clearActivityBtn = document.getElementById('clear-activity-log');
        if (clearActivityBtn) {
            clearActivityBtn.addEventListener('click', function() {
                if (confirm('هل أنت متأكد من رغبتك في مسح سجل النشاطات؟')) {
                    clearActivityLog();
                }
            });
        }
        
        // مستمع لتصدير سجل النشاطات
        const exportActivityBtn = document.getElementById('export-activity-log');
        if (exportActivityBtn) {
            exportActivityBtn.addEventListener('click', exportActivityLog);
        }
    }
    
    /**
     * فتح/إغلاق قائمة المستخدم
     * @param {Event} e حدث النقر
     */
    function toggleUserMenu(e) {
        if (e) e.preventDefault();
        
        const userDropdownMenu = document.getElementById('user-dropdown-menu');
        const menuToggle = document.getElementById('user-menu-toggle');
        
        if (userDropdownMenu) {
            userDropdownMenu.classList.toggle('active');
            
            // تحديث أيقونة القائمة
            if (menuToggle) {
                menuToggle.classList.toggle('active');
            }
        }
    }
    
    /**
     * إغلاق قائمة المستخدم
     */
    function closeUserMenu() {
        const userDropdownMenu = document.getElementById('user-dropdown-menu');
        const menuToggle = document.getElementById('user-menu-toggle');
        
        if (userDropdownMenu) {
            userDropdownMenu.classList.remove('active');
            
            // تحديث أيقونة القائمة
            if (menuToggle) {
                menuToggle.classList.remove('active');
            }
        }
    }
    
    /**
     * تهيئة محتوى النوافذ
     */
    function initializeModalContent() {
        // تهيئة نافذة الملف الشخصي بمعلومات المستخدم الحالي
        const user = getUserInfo();
        
        if (user) {
            // ملء حقول الملف الشخصي
            const profileName = document.getElementById('profile-name');
            if (profileName) {
                profileName.value = user.displayName || '';
            }
            
            const profileEmail = document.getElementById('profile-email');
            if (profileEmail) {
                profileEmail.value = user.email || '';
            }
            
            const profilePhone = document.getElementById('profile-phone');
            if (profilePhone) {
                profilePhone.value = user.phoneNumber || '';
            }
            
            const profileTitle = document.getElementById('profile-title');
            if (profileTitle) {
                profileTitle.value = user.title || '';
            }
            
            const profileJoinDate = document.getElementById('profile-join-date');
            if (profileJoinDate && user.createdAt) {
                profileJoinDate.value = formatDate(user.createdAt);
            }
            
            // تهيئة صورة الملف الشخصي
            const profilePicturePreview = document.getElementById('profile-picture-preview');
            if (profilePicturePreview) {
                if (user.photoURL) {
                    profilePicturePreview.style.backgroundImage = `url(${user.photoURL})`;
                } else {
                    profilePicturePreview.textContent = getInitials(user.displayName || user.email);
                }
            }
        }
        
        // تهيئة سجل النشاطات
        updateActivityLog();
    }
    
    /**
     * فتح نافذة الملف الشخصي
     * @param {string} tab تبويب البدء (اختياري)
     */
    function openProfileModal(tab = 'profile') {
        const profileModal = document.getElementById('user-profile-modal');
        if (profileModal) {
            profileModal.classList.add('active');
            
            // تحديث معلومات المستخدم في النافذة
            initializeModalContent();
            
            // التبديل إلى التبويب المطلوب
            switchProfileTab(tab);
        }
    }
    
    /**
     * إغلاق نافذة الملف الشخصي
     */
    function closeProfileModal() {
        const profileModal = document.getElementById('user-profile-modal');
        if (profileModal) {
            profileModal.classList.remove('active');
        }
    }
    
    /**
     * فتح نافذة سجل النشاطات
     */
    function openActivityLogModal() {
        const activityModal = document.getElementById('activity-log-modal');
        if (activityModal) {
            activityModal.classList.add('active');
            
            // تحديث سجل النشاطات
            updateActivityLog();
        }
    }
    
    /**
     * إغلاق نافذة سجل النشاطات
     */
    function closeActivityLogModal() {
        const activityModal = document.getElementById('activity-log-modal');
        if (activityModal) {
            activityModal.classList.remove('active');
        }
    }
    
    /**
     * التبديل بين تبويبات نافذة الملف الشخصي
     * @param {string} tabName اسم التبويب
     */
    function switchProfileTab(tabName) {
        // إلغاء تنشيط جميع الأزرار والتبويبات
        const tabButtons = document.querySelectorAll('.user-profile-tab-btn');
        const tabContents = document.querySelectorAll('.user-profile-tab-content');
        
        tabButtons.forEach(button => button.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // تنشيط التبويب المطلوب
        const activeButton = document.querySelector(`.user-profile-tab-btn[data-tab="${tabName}"]`);
        const activeContent = document.getElementById(`${tabName}-tab`);
        
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        if (activeContent) {
            activeContent.classList.add('active');
        }
    }
    
    /**
     * فتح صفحة الإعدادات
     */
    function openSettingsPage() {
        // انتقال إلى صفحة الإعدادات إذا كانت موجودة
        const settingsLink = document.querySelector('a[data-page="settings"]');
        if (settingsLink) {
            settingsLink.click();
        }
    }
    
    /**
     * تأكيد تسجيل الخروج
     */
    function confirmLogout() {
        if (confirm('هل أنت متأكد من رغبتك في تسجيل الخروج؟')) {
            logoutUser();
        }
    }
    
    /**
     * تسجيل خروج المستخدم
     */
    function logoutUser() {
        if (window.AuthSystem && typeof window.AuthSystem.logout === 'function') {
            window.AuthSystem.logout()
                .then(() => {
                    console.log('تم تسجيل الخروج بنجاح');
                    
                    // إضافة النشاط إلى السجل
                    addActivityLogEntry({
                        type: 'logout',
                        title: 'تسجيل الخروج',
                        details: 'تم تسجيل الخروج من النظام',
                        timestamp: new Date()
                    });
                })
                .catch(error => {
                    console.error('خطأ في تسجيل الخروج:', error);
                });
        } else {
            console.error('وظيفة تسجيل الخروج غير متوفرة');
        }
    }
    
    /**
     * الحصول على معلومات المستخدم الحالي
     * @returns {Object|null} معلومات المستخدم أو null إذا لم يكن مسجل الدخول
     */
    function getUserInfo() {
        // إذا كان نظام المصادقة متاحًا، نستخدمه للحصول على معلومات المستخدم
        if (window.AuthSystem && typeof window.AuthSystem.getUserInfo === 'function') {
            return window.AuthSystem.getUserInfo();
        }
        
        // إذا لم يكن نظام المصادقة متاحًا، نعيد معلومات مستخدم افتراضية للاختبار
        return {
            uid: 'test-user-id',
            email: 'user@example.com',
            displayName: 'مستخدم النظام',
            role: 'مدير النظام',
            phoneNumber: '',
            photoURL: null,
            emailVerified: true,
            title: 'مدير النظام',
            createdAt: new Date().toISOString(),
            lastSignInTime: new Date().toISOString()
        };
    }
    
    /**
     * الحصول على الأحرف الأولى من الاسم
     * @param {string} name الاسم
     * @returns {string} الأحرف الأولى
     */
    function getInitials(name) {
        if (!name) return '؟';
        
        // استخراج الأحرف الأولى من كل كلمة
        const words = name.split(/\s+/);
        if (words.length === 1) {
            // إذا كان هناك كلمة واحدة فقط، نستخدم الحرف الأول
            return name.charAt(0).toUpperCase();
        } else {
            // إذا كان هناك أكثر من كلمة، نستخدم الحرف الأول من أول كلمتين
            return (words[0].charAt(0) + (words[1] ? words[1].charAt(0) : '')).toUpperCase();
        }
    }
    
    /**
     * تنسيق التاريخ بشكل مقروء
     * @param {string|Date} date التاريخ
     * @returns {string} التاريخ المنسق
     */
    function formatDate(date) {
        if (!date) return '';
        
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        // التحقق من صحة الكائن
        if (isNaN(dateObj.getTime())) return '';
        
        return dateObj.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    /**
     * تحديث حالة الإشعارات
     */
    function updateNotificationStatus() {
        // على سبيل المثال، نفترض أن لدينا 5 إشعارات جديدة
        const notificationCount = 5;
        
        const userNotificationCount = document.getElementById('user-notification-count');
        if (userNotificationCount) {
            if (notificationCount > 0) {
                userNotificationCount.textContent = notificationCount;
                userNotificationCount.style.display = 'flex';
            } else {
                userNotificationCount.style.display = 'none';
            }
        }
        
        // إظهار شارة "جديد" في سجل النشاطات إذا كانت هناك نشاطات جديدة
        const activityBadge = document.getElementById('activity-badge');
        if (activityBadge) {
            if (hasNewActivities()) {
                activityBadge.style.display = 'inline';
            } else {
                activityBadge.style.display = 'none';
            }
        }
    }
    
    /**
     * التحقق من وجود نشاطات جديدة
     * @returns {boolean} هل هناك نشاطات جديدة
     */
    function hasNewActivities() {
        // يمكن تنفيذ منطق للتحقق من وجود نشاطات جديدة هنا
        // على سبيل المثال، نعيد true إذا كانت هناك نشاطات لم يراها المستخدم بعد
        return true;
    }
    
    /**
     * فحص قوة كلمة المرور
     * @param {Event} e حدث إدخال كلمة المرور
     */
    function checkPasswordStrength(e) {
        const passwordInput = e.target;
        const password = passwordInput.value;
        
        // عناصر مقياس قوة كلمة المرور
        const strengthMeter = document.getElementById('password-strength-meter');
        const strengthLabel = document.getElementById('password-strength-label');
        const strengthDescription = document.getElementById('password-strength-description');
        
        if (!password) {
            // إذا كانت كلمة المرور فارغة
            strengthMeter.className = 'strength-value';
            strengthDescription.textContent = 'لم يتم الإدخال';
            return;
        }
        
        // حساب قوة كلمة المرور
        let strength = 0;
        
        // الحد الأدنى للطول
        if (password.length >= 8) {
            strength += 1;
        }
        
        // التحقق من وجود أرقام
        if (/\d/.test(password)) {
            strength += 1;
        }
        
        // التحقق من وجود أحرف صغيرة وكبيرة
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
            strength += 1;
        }
        
        // التحقق من وجود رموز خاصة
        if (/[^a-zA-Z0-9]/.test(password)) {
            strength += 1;
        }
        
        // تحديث مقياس قوة كلمة المرور
        strengthMeter.className = 'strength-value';
        
        // تحديد مستوى القوة وتحديث الواجهة
        if (strength === 0) {
            strengthMeter.classList.add('weak');
            strengthDescription.textContent = 'ضعيفة جداً';
        } else if (strength === 1) {
            strengthMeter.classList.add('weak');
            strengthDescription.textContent = 'ضعيفة';
        } else if (strength === 2) {
            strengthMeter.classList.add('medium');
            strengthDescription.textContent = 'متوسطة';
        } else if (strength === 3) {
            strengthMeter.classList.add('good');
            strengthDescription.textContent = 'جيدة';
        } else {
            strengthMeter.classList.add('strong');
            strengthDescription.textContent = 'قوية';
        }
    }
    
    /**
     * تغيير كلمة المرور
     */
    function changePassword() {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // التحقق من إدخال جميع الحقول
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('يرجى ملء جميع حقول كلمة المرور');
            return;
        }
        
        // التحقق من تطابق كلمات المرور
        if (newPassword !== confirmPassword) {
            alert('كلمة المرور الجديدة وتأكيدها غير متطابقين');
            return;
        }
        
        // التحقق من قوة كلمة المرور
        if (newPassword.length < 8) {
            alert('يجب أن تكون كلمة المرور الجديدة 8 أحرف على الأقل');
            return;
        }
        
        // إذا كان نظام المصادقة متاحًا، استخدمه لتغيير كلمة المرور
        if (window.AuthSystem && typeof window.AuthSystem.changePassword === 'function') {
            window.AuthSystem.changePassword(currentPassword, newPassword)
                .then(() => {
                    alert('تم تغيير كلمة المرور بنجاح');
                    
                    // مسح الحقول
                    document.getElementById('current-password').value = '';
                    document.getElementById('new-password').value = '';
                    document.getElementById('confirm-password').value = '';
                    
                    // إضافة النشاط إلى السجل
                    addActivityLogEntry({
                        type: 'security',
                        title: 'تغيير كلمة المرور',
                        details: 'تم تغيير كلمة المرور بنجاح',
                        timestamp: new Date()
                    });
                })
                .catch(error => {
                    console.error('خطأ في تغيير كلمة المرور:', error);
                    alert(`فشل تغيير كلمة المرور: ${error.message || 'خطأ غير معروف'}`);
                });
        } else {
            // للعرض التوضيحي فقط
            alert('تم تغيير كلمة المرور بنجاح (عرض توضيحي)');
            
            // مسح الحقول
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
            
            // إضافة النشاط إلى السجل
            addActivityLogEntry({
                type: 'security',
                title: 'تغيير كلمة المرور',
                details: 'تم تغيير كلمة المرور بنجاح',
                timestamp: new Date()
            });
        }
    }
    
    /**
     * تبديل المصادقة الثنائية
     * @param {Event} e حدث تغيير حالة زر التبديل
     */
    function toggleTwoFactorAuth(e) {
        const isEnabled = e.target.checked;
        
        // للعرض التوضيحي فقط
        if (isEnabled) {
            alert('تم تفعيل المصادقة الثنائية (عرض توضيحي)');
            
            // إضافة النشاط إلى السجل
            addActivityLogEntry({
                type: 'security',
                title: 'تفعيل المصادقة الثنائية',
                details: 'تم تفعيل المصادقة الثنائية للحساب',
                timestamp: new Date()
            });
        } else {
            alert('تم تعطيل المصادقة الثنائية (عرض توضيحي)');
            
            // إضافة النشاط إلى السجل
            addActivityLogEntry({
                type: 'security',
                title: 'تعطيل المصادقة الثنائية',
                details: 'تم تعطيل المصادقة الثنائية للحساب',
                timestamp: new Date()
            });
        }
    }
    
    /**
     * حفظ تغييرات الملف الشخصي
     */
    function saveProfileChanges() {
        // الحصول على قيم الحقول
        const name = document.getElementById('profile-name').value;
        const phone = document.getElementById('profile-phone').value;
        const title = document.getElementById('profile-title').value;
        
        // التحقق من الحقول الإلزامية
        if (!name) {
            alert('يرجى إدخال الاسم الكامل');
            return;
        }
        
        // إذا كان نظام المصادقة متاحًا، استخدمه لتحديث الملف الشخصي
        if (window.AuthSystem && typeof window.AuthSystem.updateProfile === 'function') {
            window.AuthSystem.updateProfile({
                displayName: name,
                phoneNumber: phone,
                title: title
            })
                .then(() => {
                    alert('تم تحديث الملف الشخصي بنجاح');
                    
                    // تحديث واجهة المستخدم
                    updateUserProfileUI();
                    
                    // إضافة النشاط إلى السجل
                    addActivityLogEntry({
                        type: 'profile',
                        title: 'تحديث الملف الشخصي',
                        details: 'تم تحديث معلومات الملف الشخصي',
                        timestamp: new Date()
                    });
                })
                .catch(error => {
                    console.error('خطأ في تحديث الملف الشخصي:', error);
                    alert(`فشل تحديث الملف الشخصي: ${error.message || 'خطأ غير معروف'}`);
                });
        } else {
            // للعرض التوضيحي فقط
            alert('تم تحديث الملف الشخصي بنجاح (عرض توضيحي)');
            
            // تحديث واجهة المستخدم (محاكاة)
            const headerUserName = document.getElementById('header-user-name');
            if (headerUserName) {
                headerUserName.textContent = name;
            }
            
            const dropdownUserName = document.getElementById('dropdown-user-name');
            if (dropdownUserName) {
                dropdownUserName.textContent = name;
            }
            
            // إضافة النشاط إلى السجل
            addActivityLogEntry({
                type: 'profile',
                title: 'تحديث الملف الشخصي',
                details: 'تم تحديث معلومات الملف الشخصي',
                timestamp: new Date()
            });
        }
    }
    
    /**
     * تغيير ثيم النظام
     * @param {string} theme اسم الثيم
     */
    function changeTheme(theme) {
        // تخزين الثيم المحدد
        currentTheme = theme;
        
        // تخزين الإعداد في التخزين المحلي
        localStorage.setItem('userTheme', theme);
        
        // تغيير الثيم
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${theme}`);
        
        // إضافة النشاط إلى السجل
        addActivityLogEntry({
            type: 'settings',
            title: 'تغيير الثيم',
            details: `تم تغيير ثيم النظام إلى ${getThemeName(theme)}`,
            timestamp: new Date()
        });
    }
    
    /**
     * الحصول على اسم الثيم بالعربية
     * @param {string} theme رمز الثيم
     * @returns {string} اسم الثيم بالعربية
     */
    function getThemeName(theme) {
        switch (theme) {
            case 'light':
                return 'الوضع الفاتح';
            case 'dark':
                return 'الوضع الداكن';
            case 'blue':
                return 'الوضع الأزرق';
            default:
                return theme;
        }
    }
    
    /**
     * تحميل إعدادات المستخدم المحفوظة
     */
    function loadUserSettings() {
        // تحميل الثيم المحفوظ
        const savedTheme = localStorage.getItem('userTheme');
        if (savedTheme) {
            changeTheme(savedTheme);
            
            // تحديث واجهة إعدادات الثيم
            const themeOptions = document.querySelectorAll('.theme-option');
            themeOptions.forEach(option => {
                if (option.getAttribute('data-theme') === savedTheme) {
                    option.classList.add('active');
                } else {
                    option.classList.remove('active');
                }
            });
        }
        
        // تحميل حجم الخط المحفوظ
        const savedFontSize = localStorage.getItem('userFontSize');
        if (savedFontSize) {
            currentFontSize = savedFontSize;
            document.body.classList.add(`font-size-${savedFontSize}`);
            
            // تحديث قائمة الاختيار
            const fontSizeSelect = document.getElementById('font-size-select');
            if (fontSizeSelect) {
                fontSizeSelect.value = savedFontSize;
            }
        }
        
        // تحميل كثافة العرض المحفوظة
        const savedDensity = localStorage.getItem('userDensity');
        if (savedDensity) {
            currentDensity = savedDensity;
            document.body.classList.add(`density-${savedDensity}`);
            
            // تحديث قائمة الاختيار
            const densitySelect = document.getElementById('density-select');
            if (densitySelect) {
                densitySelect.value = savedDensity;
            }
        }
    }
    
    /**
     * إضافة نشاط إلى سجل النشاطات
     * @param {Object} activity بيانات النشاط
     */
    function addActivityLogEntry(activity) {
        // إضافة النشاط إلى بداية المصفوفة
        userActivityLog.unshift(activity);
        
        // تحديد الحد الأقصى لحجم سجل النشاطات (على سبيل المثال، 100 نشاط)
        if (userActivityLog.length > 100) {
            userActivityLog.pop();
        }
        
        // تخزين السجل في التخزين المحلي
        localStorage.setItem('userActivityLog', JSON.stringify(userActivityLog));
        
        // تحديث واجهة سجل النشاطات إذا كانت ظاهرة
        if (document.getElementById('activity-log-modal').classList.contains('active')) {
            updateActivityLog();
        }
        
        // تحديث مؤشر النشاطات الجديدة
        updateNotificationStatus();
    }
    
    /**
     * تحديث واجهة سجل النشاطات
     */
    function updateActivityLog() {
        const activityTimeline = document.getElementById('activity-timeline');
        if (!activityTimeline) return;
        
        // تحميل سجل النشاطات من التخزين المحلي إذا كان فارغًا
        if (userActivityLog.length === 0) {
            const savedLog = localStorage.getItem('userActivityLog');
            if (savedLog) {
                try {
                    userActivityLog = JSON.parse(savedLog);
                } catch (error) {
                    console.error('خطأ في تحليل سجل النشاطات:', error);
                    userActivityLog = [];
                }
            }
        }
        
        // إذا كان السجل فارغًا، نضيف بعض النشاطات للعرض التوضيحي
        if (userActivityLog.length === 0) {
            userActivityLog = [
                {
                    type: 'login',
                    title: 'تسجيل الدخول',
                    details: 'تم تسجيل الدخول من جهاز جديد (Windows, Chrome) - بغداد، العراق',
                    timestamp: new Date()
                },
                {
                    type: 'profile',
                    title: 'تعديل الملف الشخصي',
                    details: 'تم تحديث معلومات الملف الشخصي',
                    timestamp: new Date(Date.now() - 7200000) // منذ ساعتين
                },
                {
                    type: 'transaction',
                    title: 'إضافة معاملة جديدة',
                    details: 'تمت إضافة إيداع جديد للمستثمر "أحمد محمد" بقيمة 10,000 دينار',
                    timestamp: new Date(Date.now() - 18000000) // منذ 5 ساعات
                }
            ];
        }
        
        // تفريغ محتوى السجل
        activityTimeline.innerHTML = '';
        
        // تصفية النشاطات حسب النوع المحدد
        const activityTypeFilter = document.getElementById('activity-type-filter');
        const filterType = activityTypeFilter ? activityTypeFilter.value : 'all';
        
        const filteredActivities = filterType === 'all' 
            ? userActivityLog 
            : userActivityLog.filter(activity => activity.type === filterType);
        
        // إنشاء عناصر النشاطات
        filteredActivities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            const activityColor = activityColors[activity.type] || '#6b7280';
            
            activityItem.innerHTML = `
                <div class="activity-icon ${activity.type}" style="background-color: ${activityColor}">
                    <i class="fas ${getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-header">
                        <div class="activity-title">${activity.title}</div>
                        <div class="activity-time">${formatTimeAgo(activity.timestamp)}</div>
                    </div>
                    <div class="activity-details">${activity.details}</div>
                </div>
            `;
            
            activityTimeline.appendChild(activityItem);
        });
        
        // إذا لم تكن هناك نشاطات بعد التصفية
        if (filteredActivities.length === 0) {
            activityTimeline.innerHTML = '<div class="empty-state">لا توجد نشاطات للعرض</div>';
        }
    }
    
    /**
     * الحصول على أيقونة النشاط حسب نوعه
     * @param {string} activityType نوع النشاط
     * @returns {string} اسم الأيقونة
     */
    function getActivityIcon(activityType) {
        switch (activityType) {
            case 'login':
                return 'fa-sign-in-alt';
            case 'logout':
                return 'fa-sign-out-alt';
            case 'profile':
                return 'fa-user-edit';
            case 'security':
                return 'fa-shield-alt';
            case 'transaction':
                return 'fa-exchange-alt';
            case 'settings':
                return 'fa-cog';
            default:
                return 'fa-info-circle';
        }
    }
    
    /**
     * تنسيق الوقت كـ "منذ ..."
     * @param {string|Date} timestamp الطابع الزمني
     * @returns {string} الوقت المنسق
     */
    function formatTimeAgo(timestamp) {
        if (!timestamp) return 'غير معروف';
        
        const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
        
        // التحقق من صحة الكائن
        if (isNaN(date.getTime())) return 'غير معروف';
        
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return 'منذ لحظات';
        }
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `منذ ${diffInMinutes} دقيقة`;
        }
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `منذ ${diffInHours} ساعة`;
        }
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) {
            return `منذ ${diffInDays} يوم`;
        }
        
        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) {
            return `منذ ${diffInMonths} شهر`;
        }
        
        const diffInYears = Math.floor(diffInMonths / 12);
        return `منذ ${diffInYears} سنة`;
    }
    
    /**
     * تصفية سجل النشاطات
     */
    function filterActivityLog() {
        updateActivityLog();
    }
    
    /**
     * مسح سجل النشاطات
     */
    function clearActivityLog() {
        userActivityLog = [];
        localStorage.removeItem('userActivityLog');
        updateActivityLog();
    }
    
    /**
     * تصدير سجل النشاطات
     */
    function exportActivityLog() {
        // تحويل سجل النشاطات إلى نص CSV
        let csvContent = 'النوع,العنوان,التفاصيل,الوقت\n';
        
        userActivityLog.forEach(activity => {
            const type = activity.type || '';
            const title = activity.title || '';
            const details = (activity.details || '').replace(/,/g, ' ');
            const timestamp = activity.timestamp ? new Date(activity.timestamp).toLocaleString('ar-SA') : '';
            
            csvContent += `${type},${title},${details},${timestamp}\n`;
        });
        
        // إنشاء رابط للتنزيل
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `سجل_النشاطات_${new Date().toLocaleDateString('ar-SA')}.csv`);
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // واجهة برمجة التطبيق العامة
    return {
        initialize,
        updateUserProfileUI,
        openProfileModal,
        closeProfileModal,
        openActivityLogModal,
        closeActivityLogModal,
        addActivityLogEntry
    };
})();

// تهيئة نظام ملف المستخدم عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    UserProfileSystem.initialize();
    
    // إذا تم تسجيل الدخول تلقائيًا، نحدث واجهة المستخدم
    if (window.AuthSystem && window.AuthSystem.isAuthenticated()) {
        UserProfileSystem.updateUserProfileUI();
        
        // تسجيل نشاط تسجيل الدخول
        UserProfileSystem.addActivityLogEntry({
            type: 'login',
            title: 'تسجيل الدخول',
            details: 'تم تسجيل الدخول إلى النظام',
            timestamp: new Date()
        });
    }
});

// تصدير النظام إلى النافذة للاستخدام الخارجي
window.UserProfileSystem = UserProfileSystem;