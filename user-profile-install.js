/**
 * ملف تنفيذ تكامل نظام ملف المستخدم
 * يقوم بإضافة الأنماط والعناصر اللازمة لنظام ملف المستخدم المحسن
 */

// تنفيذ التكامل
document.addEventListener('DOMContentLoaded', function() {
    console.log('بدء تنفيذ تكامل نظام ملف المستخدم المحسن...');
    
    // إضافة أنماط CSS
    addStyles();
    
    // إضافة النوافذ المنبثقة
    addModals();
    
    // إضافة قائمة المستخدم
    addUserMenu();
    
    // تعديل مصادقة النظام لتجنب تكرار المعرفات
    fixAuthSystem();
    
    console.log('تم تنفيذ تكامل نظام ملف المستخدم المحسن بنجاح');
});

/**
 * إضافة أنماط CSS اللازمة
 */
function addStyles() {
    // إضافة أنماط نظام ملف المستخدم
    const styleElement = document.createElement('style');
    styleElement.id = 'user-profile-styles-inline';
    styleElement.textContent = `
    /* أنماط قائمة ملف المستخدم */
    .user-profile-container {
        position: relative;
        display: flex;
        align-items: center;
        padding: 8px 12px;
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.3s ease;
    }
    
    .user-profile-container:hover {
        background-color: rgba(59, 130, 246, 0.1);
    }
    
    .user-avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background-color: #3b82f6;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 1.1rem;
        margin-left: 10px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        position: relative;
    }
    
    .user-status {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid white;
        background-color: #10b981;
    }
    
    .user-info {
        display: flex;
        flex-direction: column;
    }
    
    .user-name {
        font-weight: 600;
        font-size: 0.95rem;
        color: #1f2937;
    }
    
    .user-role {
        font-size: 0.8rem;
        color: #6b7280;
    }
    
    .user-menu-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 5px;
        color: #6b7280;
        transition: transform 0.3s ease;
    }
    
    .user-menu-toggle.active {
        transform: rotate(180deg);
    }
    
    .user-dropdown-menu {
        position: absolute;
        top: calc(100% + 5px);
        left: 0;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        width: 260px;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transform: translateY(10px);
        transition: all 0.3s ease;
    }
    
    .user-dropdown-menu.active {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }
    
    .dropdown-menu {
        padding: 8px 0;
    }
    
    .dropdown-header {
        padding: 12px 16px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid #f3f4f6;
        margin-bottom: 5px;
    }
    
    .dropdown-header .user-avatar.large {
        width: 50px;
        height: 50px;
        font-size: 1.4rem;
    }
    
    .dropdown-user-info {
        margin-right: 12px;
    }
    
    .dropdown-user-name {
        font-weight: 600;
        font-size: 1rem;
        color: #1f2937;
        margin-bottom: 4px;
    }
    
    .dropdown-user-email {
        font-size: 0.85rem;
        color: #6b7280;
    }
    
    .dropdown-menu-items {
        padding: 0 5px;
    }
    
    .dropdown-item {
        display: flex;
        align-items: center;
        padding: 10px 12px;
        color: #4b5563;
        text-decoration: none;
        border-radius: 6px;
        transition: all 0.2s ease;
    }
    
    .dropdown-item:hover {
        background-color: #f9fafb;
    }
    
    .dropdown-item i {
        margin-left: 10px;
        width: 20px;
        text-align: center;
        color: #6b7280;
    }
    
    .dropdown-divider {
        height: 1px;
        background-color: #f3f4f6;
        margin: 8px 0;
    }
    
    .user-notification-badge {
        position: absolute;
        top: 0;
        left: 0;
        background-color: #ef4444;
        color: white;
        font-size: 0.7rem;
        font-weight: 600;
        min-width: 18px;
        height: 18px;
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        padding: 0 4px;
    }
    
    .dropdown-item.danger {
        color: #ef4444;
    }
    
    .dropdown-item.danger i {
        color: #ef4444;
    }
    
    /* النوافذ المنبثقة والتبويبات */
    .user-profile-tabs {
        display: flex;
        border-bottom: 1px solid #e5e7eb;
        overflow-x: auto;
        margin-bottom: 20px;
    }
    
    .user-profile-tab-btn {
        padding: 12px 16px;
        font-weight: 500;
        color: #6b7280;
        border-bottom: 2px solid transparent;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s ease;
    }
    
    .user-profile-tab-btn.active {
        color: #3b82f6;
        border-bottom-color: #3b82f6;
    }
    
    .user-profile-tab-content {
        display: none;
        padding: 20px 0;
    }
    
    .user-profile-tab-content.active {
        display: block;
    }
    
    /* مؤشر الحالة */
    .profile-status {
        display: inline-flex;
        align-items: center;
        padding: 3px 8px;
        border-radius: 15px;
        font-size: 0.75rem;
        margin-top: 5px;
    }
    
    .profile-status.verified {
        background-color: rgba(16, 185, 129, 0.1);
        color: #10b981;
    }
    
    .profile-status.pending {
        background-color: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
    }
    
    .profile-status i {
        margin-left: 5px;
    }
    `;
    
    document.head.appendChild(styleElement);
    console.log('تمت إضافة أنماط CSS لنظام ملف المستخدم');
}

/**
 * إضافة النوافذ المنبثقة
 */
function addModals() {
    // إضافة نوافذ ملف المستخدم إلى نهاية body
    const modalContainer = document.createElement('div');
    modalContainer.id = 'user-profile-modals';
    document.body.appendChild(modalContainer);
    
    // إنشاء محتوى نافذة الملف الشخصي البسيطة (الحد الأدنى)
    modalContainer.innerHTML = `
        <!-- نافذة الملف الشخصي -->
        <div class="modal-overlay" id="user-profile-modal">
            <div class="modal animate__animated animate__fadeInUp user-settings-modal">
                <div class="modal-header">
                    <h3 class="modal-title">الملف الشخصي</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <div class="user-profile-tabs">
                        <div class="user-profile-tab-btn active" data-tab="profile">معلومات الحساب</div>
                        <div class="user-profile-tab-btn" data-tab="security">الأمان</div>
                        <div class="user-profile-tab-btn" data-tab="notifications">الإشعارات</div>
                        <div class="user-profile-tab-btn" data-tab="appearance">المظهر</div>
                    </div>
                    
                    <!-- تبويب معلومات الحساب -->
                    <div class="user-profile-tab-content active" id="profile-tab">
                        <div class="form-group">
                            <label class="form-label">الاسم الكامل</label>
                            <input type="text" class="form-input" id="profile-name" placeholder="الاسم الكامل">
                        </div>
                        <div class="form-group">
                            <label class="form-label">البريد الإلكتروني</label>
                            <input type="email" class="form-input" id="profile-email" placeholder="البريد الإلكتروني" readonly>
                        </div>
                        <div class="form-group">
                            <label class="form-label">رقم الهاتف</label>
                            <input type="tel" class="form-input" id="profile-phone" placeholder="رقم الهاتف">
                        </div>
                    </div>
                    
                    <!-- تبويب الأمان -->
                    <div class="user-profile-tab-content" id="security-tab">
                        <div class="form-group">
                            <label class="form-label">كلمة المرور الحالية</label>
                            <input type="password" class="form-input" id="current-password" placeholder="أدخل كلمة المرور الحالية">
                        </div>
                        <div class="form-group">
                            <label class="form-label">كلمة المرور الجديدة</label>
                            <input type="password" class="form-input" id="new-password" placeholder="أدخل كلمة المرور الجديدة">
                        </div>
                        <div class="form-group">
                            <label class="form-label">تأكيد كلمة المرور الجديدة</label>
                            <input type="password" class="form-input" id="confirm-password" placeholder="أعد إدخال كلمة المرور الجديدة">
                        </div>
                        <div class="form-group">
                            <button class="btn btn-primary" id="change-password-btn">تغيير كلمة المرور</button>
                        </div>
                    </div>
                    
                    <!-- تبويب الإشعارات -->
                    <div class="user-profile-tab-content" id="notifications-tab">
                        <div class="notification-option">
                            <div>
                                <div class="notification-title">الأرباح المستحقة</div>
                                <div class="notification-description">إعلامك عندما تكون هناك أرباح جديدة مستحقة للدفع</div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" checked id="profits-notification-toggle">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <div class="notification-option">
                            <div>
                                <div class="notification-title">إيداعات جديدة</div>
                                <div class="notification-description">إعلامك عند إضافة إيداع جديد في النظام</div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" checked id="deposits-notification-toggle">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- تبويب المظهر -->
                    <div class="user-profile-tab-content" id="appearance-tab">
                        <div class="form-group">
                            <label class="form-label">ثيم النظام</label>
                            <select class="form-select" id="theme-select">
                                <option value="light">فاتح</option>
                                <option value="dark">داكن</option>
                                <option value="blue">أزرق</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إلغاء</button>
                    <button class="btn btn-primary" id="save-profile-settings">حفظ التغييرات</button>
                </div>
            </div>
        </div>

        <!-- نافذة سجل النشاطات -->
        <div class="modal-overlay" id="activity-log-modal">
            <div class="modal animate__animated animate__fadeInUp">
                <div class="modal-header">
                    <h3 class="modal-title">سجل النشاطات</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">تصفية حسب النوع</label>
                        <select class="form-select" id="activity-type-filter">
                            <option value="all">جميع النشاطات</option>
                            <option value="login">تسجيل الدخول</option>
                            <option value="profile">تعديل الملف الشخصي</option>
                            <option value="transaction">العمليات المالية</option>
                        </select>
                    </div>
                    
                    <div class="activity-timeline" id="activity-timeline">
                        <!-- سيتم ملؤها ديناميكيًا -->
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-close-btn">إغلاق</button>
                </div>
            </div>
        </div>
    `;
    
    console.log('تمت إضافة نوافذ نظام ملف المستخدم');
}

/**
 * إضافة قائمة المستخدم
 */
function addUserMenu() {
    // البحث عن حاوية قائمة المستخدم أو إنشاؤها
    let userMenuContainer = document.getElementById('user-menu-container');
    
    if (!userMenuContainer) {
        // البحث عن عنصر header-actions
        const headerActions = document.querySelector('.header-actions');
        
        if (headerActions) {
            // إنشاء حاوية جديدة
            userMenuContainer = document.createElement('div');
            userMenuContainer.id = 'user-menu-container';
            userMenuContainer.className = 'user-menu-container';
            
            // إدراج الحاوية قبل عنصر .search-box إذا وجد
            const searchBox = headerActions.querySelector('.search-box');
            if (searchBox) {
                headerActions.insertBefore(userMenuContainer, searchBox);
            } else {
                headerActions.appendChild(userMenuContainer);
            }
        } else {
            console.warn('لم يتم العثور على .header-actions لإضافة قائمة المستخدم');
            return;
        }
    }
    
    // إنشاء محتوى قائمة المستخدم
    userMenuContainer.innerHTML = `
        <!-- قائمة المستخدم المحسنة للشريط العلوي -->
        <div class="user-profile-container" id="user-profile-container">
            <div class="user-avatar" id="user-avatar-header">
                <!-- سيتم ملؤها ديناميكيًا بالحرف الأول من اسم المستخدم -->
                <div class="user-status" id="user-status-indicator"></div>
                <div class="user-notification-badge" id="user-notification-count" style="display: none;">0</div>
            </div>
            <div class="user-info">
                <div class="user-name" id="header-user-name">مستخدم النظام</div>
                <div class="user-role" id="header-user-role">مدير النظام</div>
            </div>
            <div class="user-menu-toggle" id="user-menu-toggle">
                <i class="fas fa-chevron-down"></i>
            </div>
        </div>

        <!-- القائمة المنسدلة للمستخدم -->
        <div class="user-dropdown-menu" id="user-dropdown-menu">
            <div class="dropdown-menu">
                <div class="dropdown-header">
                    <div class="user-avatar large" id="dropdown-user-avatar">
                        <!-- سيتم ملؤها ديناميكيًا -->
                    </div>
                    <div class="dropdown-user-info">
                        <div class="dropdown-user-name" id="dropdown-user-name">مستخدم النظام</div>
                        <div class="dropdown-user-email" id="dropdown-user-email">user@example.com</div>
                    </div>
                </div>
                <div class="dropdown-menu-items">
                    <a href="#" class="dropdown-item" id="profile-menu-item">
                        <i class="fas fa-user"></i>
                        <span>الملف الشخصي</span>
                    </a>
                    <a href="#" class="dropdown-item" id="security-menu-item">
                        <i class="fas fa-shield-alt"></i>
                        <span>الأمان والخصوصية</span>
                    </a>
                    <a href="#" class="dropdown-item" id="settings-menu-item">
                        <i class="fas fa-cog"></i>
                        <span>الإعدادات</span>
                    </a>
                    <div class="dropdown-divider"></div>
                    <a href="#" class="dropdown-item danger" id="logout-menu-item">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>تسجيل الخروج</span>
                    </a>
                </div>
            </div>
        </div>
    `;
    
    console.log('تمت إضافة قائمة المستخدم');
    
    // إضافة مستمعي الأحداث للقائمة
    setupUserMenuEvents();
}

/**
 * إعداد مستمعي الأحداث لقائمة المستخدم
 */
function setupUserMenuEvents() {
    // مستمع لفتح/إغلاق القائمة المنسدلة
    const userProfileContainer = document.getElementById('user-profile-container');
    const userDropdownMenu = document.getElementById('user-dropdown-menu');
    const menuToggle = document.getElementById('user-menu-toggle');
    
    if (userProfileContainer && userDropdownMenu) {
        userProfileContainer.addEventListener('click', function(e) {
            e.preventDefault();
            userDropdownMenu.classList.toggle('active');
            
            if (menuToggle) {
                menuToggle.classList.toggle('active');
            }
        });
        
        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', function(e) {
            if (userDropdownMenu.classList.contains('active') && 
                !userProfileContainer.contains(e.target) && 
                !userDropdownMenu.contains(e.target)) {
                userDropdownMenu.classList.remove('active');
                
                if (menuToggle) {
                    menuToggle.classList.remove('active');
                }
            }
        });
    }
    
    // مستمعو أحداث لعناصر القائمة
    
    // الملف الشخصي
    const profileMenuItem = document.getElementById('profile-menu-item');
    if (profileMenuItem) {
        profileMenuItem.addEventListener('click', function(e) {
            e.preventDefault();
            openProfileModal('profile');
            closeUserMenu();
        });
    }
    
    // الأمان والخصوصية
    const securityMenuItem = document.getElementById('security-menu-item');
    if (securityMenuItem) {
        securityMenuItem.addEventListener('click', function(e) {
            e.preventDefault();
            openProfileModal('security');
            closeUserMenu();
        });
    }
    
    // الإعدادات
    const settingsMenuItem = document.getElementById('settings-menu-item');
    if (settingsMenuItem) {
        settingsMenuItem.addEventListener('click', function(e) {
            e.preventDefault();
            openSettingsPage();
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
    
    // مستمعو أحداث للنوافذ المنبثقة
    setupModalEvents();
}

/**
 * إغلاق القائمة المنسدلة للمستخدم
 */
function closeUserMenu() {
    const userDropdownMenu = document.getElementById('user-dropdown-menu');
    const menuToggle = document.getElementById('user-menu-toggle');
    
    if (userDropdownMenu) {
        userDropdownMenu.classList.remove('active');
    }
    
    if (menuToggle) {
        menuToggle.classList.remove('active');
    }
}

/**
 * إعداد مستمعي الأحداث للنوافذ المنبثقة
 */
function setupModalEvents() {
    // نافذة الملف الشخصي
    setupProfileModalEvents();
    
    // نافذة سجل النشاطات
    setupActivityModalEvents();
}

/**
 * إعداد مستمعي الأحداث لنافذة الملف الشخصي
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
    
    // مستمع لزر حفظ التغييرات
    const saveProfileBtn = document.getElementById('save-profile-settings');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfileChanges);
    }
    
    // مستمع لزر تغيير كلمة المرور
    const changePasswordBtn = document.getElementById('change-password-btn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', changePassword);
    }
}

/**
 * إعداد مستمعي الأحداث لنافذة سجل النشاطات
 */
function setupActivityModalEvents() {
    // مستمع لإغلاق نافذة سجل النشاطات
    const closeButtons = document.querySelectorAll('#activity-log-modal .modal-close, #activity-log-modal .modal-close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', closeActivityModal);
    });
    
    // مستمع لتصفية سجل النشاطات
    const activityTypeFilter = document.getElementById('activity-type-filter');
    if (activityTypeFilter) {
        activityTypeFilter.addEventListener('change', filterActivityLog);
    }
}

/**
 * فتح نافذة الملف الشخصي
 * @param {string} tab تبويب البدء (اختياري)
 */
function openProfileModal(tab = 'profile') {
    const profileModal = document.getElementById('user-profile-modal');
    if (profileModal) {
        profileModal.classList.add('active');
        
        // التبديل إلى التبويب المطلوب
        switchProfileTab(tab);
        
        // تحديث معلومات المستخدم في النافذة
        updateProfileModalContent();
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
function openActivityModal() {
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
function closeActivityModal() {
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
 * تحديث محتوى نافذة الملف الشخصي
 */
function updateProfileModalContent() {
    // الحصول على معلومات المستخدم
    const user = getCurrentUser();
    
    if (user) {
        // تحديث حقول النموذج
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
    }
}

/**
 * تحديث سجل النشاطات
 */
function updateActivityLog() {
    const activityTimeline = document.getElementById('activity-timeline');
    if (!activityTimeline) return;
    
    // للعرض التوضيحي، نضيف بعض الأنشطة الافتراضية
    activityTimeline.innerHTML = `
        <div class="activity-item">
            <div class="activity-content">
                <div class="activity-header">
                    <div class="activity-title">تسجيل الدخول</div>
                    <div class="activity-time">منذ 10 دقائق</div>
                </div>
                <div class="activity-details">تم تسجيل الدخول من جهاز جديد (Windows, Chrome)</div>
            </div>
        </div>
        
        <div class="activity-item">
            <div class="activity-content">
                <div class="activity-header">
                    <div class="activity-title">تعديل الملف الشخصي</div>
                    <div class="activity-time">منذ يومين</div>
                </div>
                <div class="activity-details">تم تحديث معلومات الملف الشخصي</div>
            </div>
        </div>
    `;
}

/**
 * تصفية سجل النشاطات
 */
function filterActivityLog() {
    // يمكن تنفيذ منطق التصفية هنا عند الحاجة
    updateActivityLog();
}

/**
 * الحصول على معلومات المستخدم الحالي
 */
function getCurrentUser() {
    // محاولة الحصول على معلومات المستخدم من نظام المصادقة
    if (window.AuthSystem && typeof window.AuthSystem.getUserInfo === 'function') {
        return window.AuthSystem.getUserInfo();
    }
    
    // معلومات افتراضية للمستخدم للعرض التوضيحي
    return {
        displayName: 'مستخدم النظام',
        email: 'user@example.com',
        role: 'مدير النظام',
        phoneNumber: ''
    };
}

/**
 * حفظ تغييرات الملف الشخصي
 */
function saveProfileChanges() {
    // الحصول على قيم الحقول
    const name = document.getElementById('profile-name').value;
    const phone = document.getElementById('profile-phone').value;
    
    // التحقق من الحقول الإلزامية
    if (!name) {
        alert('يرجى إدخال الاسم الكامل');
        return;
    }
    
    // إذا كان نظام المصادقة متاحًا، استخدمه لتحديث الملف الشخصي
    if (window.AuthSystem && typeof window.AuthSystem.updateProfile === 'function') {
        window.AuthSystem.updateProfile({
            displayName: name,
            phoneNumber: phone
        })
            .then(() => {
                alert('تم تحديث الملف الشخصي بنجاح');
                
                // تحديث واجهة المستخدم
                updateUserProfileUI();
                
                // إغلاق النافذة
                closeProfileModal();
            })
            .catch(error => {
                console.error('خطأ في تحديث الملف الشخصي:', error);
                alert(`فشل تحديث الملف الشخصي: ${error.message || 'خطأ غير معروف'}`);
            });
    } else {
        // للعرض التوضيحي فقط
        alert('تم تحديث الملف الشخصي بنجاح (عرض توضيحي)');
        closeProfileModal();
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
    
    // إذا كان نظام المصادقة متاحًا، استخدمه لتغيير كلمة المرور
    if (window.AuthSystem && typeof window.AuthSystem.changePassword === 'function') {
        window.AuthSystem.changePassword(currentPassword, newPassword)
            .then(() => {
                alert('تم تغيير كلمة المرور بنجاح');
                
                // مسح الحقول
                document.getElementById('current-password').value = '';
                document.getElementById('new-password').value = '';
                document.getElementById('confirm-password').value = '';
                
                // إغلاق النافذة
                closeProfileModal();
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
        
        // إغلاق النافذة
        closeProfileModal();
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
            })
            .catch(error => {
                console.error('خطأ في تسجيل الخروج:', error);
            });
    } else {
        console.error('وظيفة تسجيل الخروج غير متوفرة');
    }
}

/**
 * تحديث واجهة ملف المستخدم
 */
function updateUserProfileUI() {
    const user = getCurrentUser();
    
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
        
        // تحديث صورة المستخدم (أو الأحرف الأولى)
        const userAvatarHeader = document.getElementById('user-avatar-header');
        if (userAvatarHeader) {
            if (user.photoURL) {
                userAvatarHeader.innerHTML = `<img src="${user.photoURL}" alt="${user.displayName}" />`;
            } else {
                userAvatarHeader.textContent = getInitials(user.displayName || user.email);
            }
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
            if (user.photoURL) {
                dropdownUserAvatar.innerHTML = `<img src="${user.photoURL}" alt="${user.displayName}" />`;
            } else {
                dropdownUserAvatar.textContent = getInitials(user.displayName || user.email);
            }
        }
    }
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
 * إصلاح مشكلة تكرار المعرفات في نظام المصادقة
 */
function fixAuthSystem() {
    // البحث عن نماذج المصادقة المتكررة وإصلاحها
    const authForms = document.querySelectorAll('form[id="login-form"], form[id="signup-form"]');
    
    // تعديل معرفات النماذج لتجنب التكرار
    authForms.forEach((form, index) => {
        if (index > 0) {
            const oldId = form.id;
            const newId = `${oldId}-${index}`;
            form.id = newId;
            
            // تعديل معرفات الحقول داخل النموذج
            const inputs = form.querySelectorAll('input[id]');
            inputs.forEach(input => {
                const oldInputId = input.id;
                const newInputId = `${oldInputId}-${index}`;
                input.id = newInputId;
                
                // تحديث متعلقات العناصر الأخرى (مثل علامات التسمية)
                const labels = form.querySelectorAll(`label[for="${oldInputId}"]`);
                labels.forEach(label => {
                    label.setAttribute('for', newInputId);
                });
           

            });
        }
    });
    
    console.log('تم إصلاح مشكلة تكرار المعرفات في نظام المصادقة');
}

// تنفيذ برنامج نظام ملف المستخدم الأساسي
// يتم استدعاء هذه الوظيفة فقط إذا لم يتم العثور على ملف user-profile.js المتكامل
function createBasicUserProfileSystem() {
    // إنشاء كائن UserProfileSystem البسيط
    if (!window.UserProfileSystem) {
        window.UserProfileSystem = {
            // تحديث واجهة ملف المستخدم
            updateUserProfileUI: function() {
                updateUserProfileUI();
            },
            
            // فتح نافذة الملف الشخصي
            openProfileModal: function(tab) {
                openProfileModal(tab);
            },
            
            // إغلاق نافذة الملف الشخصي
            closeProfileModal: function() {
                closeProfileModal();
            },
            
            // فتح نافذة سجل النشاطات
            openActivityModal: function() {
                openActivityModal();
            },
            
            // إغلاق نافذة سجل النشاطات
            closeActivityModal: function() {
                closeActivityModal();
            },
            
            // إضافة نشاط إلى السجل
            addActivityLogEntry: function(activity) {
                console.log('تسجيل نشاط:', activity);
                // يمكن تنفيذ منطق تسجيل النشاطات هنا
                
                // تحديث واجهة سجل النشاطات إذا كانت مفتوحة
                const activityModal = document.getElementById('activity-log-modal');
                if (activityModal && activityModal.classList.contains('active')) {
                    updateActivityLog();
                }
            }
        };
        
        console.log('تم إنشاء نظام ملف المستخدم الأساسي');
    }
}

// البدء بتنفيذ النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // التحقق من وجود نظام ملف المستخدم المتكامل
    if (!window.UserProfileSystem) {
        createBasicUserProfileSystem();
    }
    
    // تحديث واجهة المستخدم بعد أن يكتمل تحميل الصفحة
    setTimeout(function() {
        if (window.UserProfileSystem) {
            window.UserProfileSystem.updateUserProfileUI();
        }
    }, 500);
});