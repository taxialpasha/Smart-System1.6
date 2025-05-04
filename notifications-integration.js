/**
 * نظام التنبيهات للمستثمرين المستحقين للربح
 * يوفر هذا الملف وظائف لإدارة التنبيهات وعرض المستثمرين المستحقين للربح
 */

// متغير عام للاحتفاظ بعدد التنبيهات
let notificationsCount = 0;

// متغير عام للاحتفاظ بقائمة التنبيهات
let notifications = [];

/**
 * تهيئة نظام التنبيهات
 */
function initNotificationsSystem() {
    console.log('تهيئة نظام التنبيهات...');
    
    // إعداد زر التنبيهات
    setupNotificationButton();
    
    // إعداد نافذة التنبيهات
    createNotificationsModal();
    
    // إضافة أنماط CSS للتنبيهات
    addNotificationsStyles();
    
    // تحديث التنبيهات عند تحميل الصفحة
    updateNotifications();
    
    // إضافة مستمعي الأحداث للتحديث الدوري
    setupNotificationsEvents();
}

/**
 * إعداد زر التنبيهات
 */
function setupNotificationButton() {
    // العثور على زر التنبيهات
    const notificationBtn = document.getElementById('notification-btn');
    
    if (!notificationBtn) {
        console.error('لم يتم العثور على زر التنبيهات');
        return;
    }
    
    // إنشاء عنصر لعرض عدد التنبيهات
    const badgeElement = document.createElement('span');
    badgeElement.className = 'notification-badge';
    badgeElement.id = 'notification-badge';
    badgeElement.style.display = 'none'; // إخفاء مبدئيًا حتى يتم تحديث العدد
    
    // إضافة العنصر إلى زر التنبيهات
    notificationBtn.appendChild(badgeElement);
    
    // إضافة مستمع لحدث النقر على زر التنبيهات
    notificationBtn.addEventListener('click', () => {
        // عرض نافذة التنبيهات
        showNotificationsModal();
    });
}

/**
 * إنشاء نافذة التنبيهات
 */
function createNotificationsModal() {
    // التحقق من وجود نافذة التنبيهات مسبقًا
    if (document.getElementById('notifications-modal')) {
        return;
    }
    
    // إنشاء عنصر النافذة المنبثقة
    const modalElement = document.createElement('div');
    modalElement.className = 'modal-overlay';
    modalElement.id = 'notifications-modal';
    
    // إضافة محتوى النافذة المنبثقة
    modalElement.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title">التنبيهات</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <div class="tabs">
                    <div class="tab-buttons">
                        <button class="tab-btn active" data-tab="due-profits">أرباح مستحقة <span id="due-profits-count" class="tab-badge">0</span></button>
                        <button class="tab-btn" data-tab="all-notifications">كافة التنبيهات <span id="all-notifications-count" class="tab-badge">0</span></button>
                    </div>
                    <div class="tab-content active" id="due-profits-tab">
                        <div id="due-profits-list" class="notifications-list">
                            <!-- سيتم ملؤه ديناميكياً -->
                        </div>
                    </div>
                    <div class="tab-content" id="all-notifications-tab">
                        <div id="all-notifications-list" class="notifications-list">
                            <!-- سيتم ملؤه ديناميكياً -->
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إغلاق</button>
                <button class="btn btn-primary" id="mark-all-read-btn">
                    <i class="fas fa-check-double"></i>
                    <span>تعيين الكل كمقروء</span>
                </button>
            </div>
        </div>
    `;
    
    // إضافة النافذة المنبثقة إلى الصفحة
    document.body.appendChild(modalElement);
    
    // إضافة مستمعي الأحداث
    setupNotificationsModalEvents(modalElement);
}

/**
 * إعداد مستمعي الأحداث لنافذة التنبيهات
 * @param {HTMLElement} modalElement - عنصر النافذة المنبثقة
 */
function setupNotificationsModalEvents(modalElement) {
    // مستمع لإغلاق النافذة المنبثقة
    const closeButtons = modalElement.querySelectorAll('.modal-close, .modal-close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            closeModal('notifications-modal');
        });
    });
    
    // مستمع للتبديل بين علامات التبويب
    const tabButtons = modalElement.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // إزالة الفئة النشطة من جميع الأزرار
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // إضافة الفئة النشطة للزر الحالي
            this.classList.add('active');
            
            // إخفاء جميع محتويات علامات التبويب
            const tabContents = modalElement.querySelectorAll('.tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            
            // إظهار محتوى علامة التبويب المحددة
            const tabId = this.getAttribute('data-tab');
            const selectedTab = document.getElementById(`${tabId}-tab`);
            if (selectedTab) {
                selectedTab.classList.add('active');
            }
        });
    });
    
    // مستمع لتعيين جميع التنبيهات كمقروءة
    const markAllReadBtn = modalElement.querySelector('#mark-all-read-btn');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', () => {
            markAllNotificationsAsRead();
        });
    }
}

/**
 * تحديث عدد وقائمة التنبيهات
 */
function updateNotifications() {
    try {
        const dueInvestors = window.notificationsSystem.getDueInvestors();
        // حساب عدد المستثمرين المستحقين للربح
        
        // تجهيز قائمة التنبيهات
        updateNotificationsList(dueInvestors);
        
        // تحديث عدد التنبيهات في الزر
        updateNotificationBadge(dueInvestors.length);
    } catch (error) {
        console.error("خطأ في تحديث التنبيهات:", error);
    }
}

/**
 * الحصول على قائمة المستثمرين المستحقين للربح
 * @returns {Array} - قائمة المستثمرين المستحقين للربح
 */

/**
 * تحديث قائمة التنبيهات
 * @param {Array} dueInvestors - قائمة المستثمرين المستحقين للربح
 */
function updateNotificationsList(dueInvestors) {
    // إنشاء تنبيهات للمستثمرين المستحقين
    const newNotifications = [];
    
    dueInvestors.forEach(item => {
        // التحقق من وجود التنبيه في القائمة الحالية
        const existingNotification = notifications.find(
            n => n.type === 'due-profit' && n.investorId === item.investor.id
        );
        
        if (existingNotification) {
            // تحديث التنبيه الموجود
            existingNotification.profit = item.profit;
            existingNotification.daysElapsed = item.daysElapsed;
            existingNotification.dueDate = item.dueDate;
            
            newNotifications.push(existingNotification);
        } else {
            // إنشاء تنبيه جديد
            const notification = {
                id: Date.now() + '-' + item.investor.id,
                type: 'due-profit',
                investorId: item.investor.id,
                investorName: item.investor.name,
                profit: item.profit,
                daysElapsed: item.daysElapsed,
                dueDate: item.dueDate,
                createdAt: new Date(),
                read: false
            };
            
            newNotifications.push(notification);
        }
    });
    
    // الاحتفاظ بالتنبيهات القديمة التي لا تتعلق بالأرباح المستحقة
    const otherNotifications = notifications.filter(n => n.type !== 'due-profit');
    
    // دمج التنبيهات الجديدة مع التنبيهات الأخرى
    notifications = [...newNotifications, ...otherNotifications];
    
    // تحديث عرض التنبيهات في النافذة المنبثقة
    renderNotificationsList();
}

/**
 * تحديث علامة عدد التنبيهات
 * @param {Number} count - عدد التنبيهات
 */
function updateNotificationBadge(count) {
    // تحديث المتغير العام
    notificationsCount = count;
    
    // تحديث علامة عدد التنبيهات في زر التنبيهات
    const badge = document.getElementById('notification-badge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
    
    // تحديث عدد التنبيهات في علامات التبويب
    const dueProfitsCount = document.getElementById('due-profits-count');
    if (dueProfitsCount) {
        dueProfitsCount.textContent = count;
    }
    
    const allNotificationsCount = document.getElementById('all-notifications-count');
    if (allNotificationsCount) {
        allNotificationsCount.textContent = notifications.length;
    }
}

/**
 * عرض قائمة التنبيهات في النافذة المنبثقة
 */
function renderNotificationsList() {
    // الحصول على عناصر قوائم التنبيهات
    const dueProfitsList = document.getElementById('due-profits-list');
    const allNotificationsList = document.getElementById('all-notifications-list');
    
    if (!dueProfitsList || !allNotificationsList) {
        return;
    }
    
    // تنقية التنبيهات المتعلقة بالأرباح المستحقة
    const dueProfitsNotifications = notifications.filter(n => n.type === 'due-profit');
    
    // عرض التنبيهات المتعلقة بالأرباح المستحقة
    if (dueProfitsNotifications.length > 0) {
        dueProfitsList.innerHTML = dueProfitsNotifications.map(notification => {
            // تنسيق التاريخ
            const dueDate = new Date(notification.dueDate).toLocaleDateString('ar-SA');
            
            // تنسيق المبلغ
            const formattedProfit = formatCurrency(notification.profit);
            
            return `
                <div class="notification-item ${notification.read ? 'read' : ''}" data-id="${notification.id}">
                    <div class="notification-icon ${getNotificationIconClass(notification.type)}">
                        <i class="${getNotificationIcon(notification.type)}"></i>
                    </div>
                    <div class="notification-details">
                        <div class="notification-title">
                            <span>ربح مستحق - ${notification.investorName}</span>
                            ${notification.read ? '' : '<span class="notification-unread-badge"></span>'}
                        </div>
                        <div class="notification-message">
                            يوجد ربح مستحق بقيمة <strong>${formattedProfit}</strong> للمستثمر ${notification.investorName}.
                            <br>
                            <small>تاريخ الاستحقاق: ${dueDate} (منذ ${notification.daysElapsed} يوم)</small>
                        </div>
                        <div class="notification-actions">
                            <button class="btn btn-sm btn-success pay-profit-btn" data-investor-id="${notification.investorId}">
                                <i class="fas fa-coins"></i>
                                <span>دفع الربح</span>
                            </button>
                            <button class="btn btn-sm btn-outline view-investor-btn" data-investor-id="${notification.investorId}">
                                <i class="fas fa-eye"></i>
                                <span>عرض التفاصيل</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // إضافة مستمعي الأحداث لأزرار دفع الربح وعرض التفاصيل
        setupNotificationActionButtons(dueProfitsList);
    } else {
        dueProfitsList.innerHTML = '<div class="notification-empty">لا توجد أرباح مستحقة حالياً</div>';
    }
    
    // عرض جميع التنبيهات
    if (notifications.length > 0) {
        allNotificationsList.innerHTML = notifications.map(notification => {
            // استخدام قالب مختلف حسب نوع التنبيه
            if (notification.type === 'due-profit') {
                // تنسيق التاريخ
                const dueDate = new Date(notification.dueDate).toLocaleDateString('ar-SA');
                
                // تنسيق المبلغ
                const formattedProfit = formatCurrency(notification.profit);
                
                return `
                    <div class="notification-item ${notification.read ? 'read' : ''}" data-id="${notification.id}">
                        <div class="notification-icon ${getNotificationIconClass(notification.type)}">
                            <i class="${getNotificationIcon(notification.type)}"></i>
                        </div>
                        <div class="notification-details">
                            <div class="notification-title">
                                <span>ربح مستحق - ${notification.investorName}</span>
                                ${notification.read ? '' : '<span class="notification-unread-badge"></span>'}
                            </div>
                            <div class="notification-message">
                                يوجد ربح مستحق بقيمة <strong>${formattedProfit}</strong> للمستثمر ${notification.investorName}.
                                <br>
                                <small>تاريخ الاستحقاق: ${dueDate} (منذ ${notification.daysElapsed} يوم)</small>
                            </div>
                            <div class="notification-actions">
                                <button class="btn btn-sm btn-success pay-profit-btn" data-investor-id="${notification.investorId}">
                                    <i class="fas fa-coins"></i>
                                    <span>دفع الربح</span>
                                </button>
                                <button class="btn btn-sm btn-outline view-investor-btn" data-investor-id="${notification.investorId}">
                                    <i class="fas fa-eye"></i>
                                    <span>عرض التفاصيل</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                // قالب للتنبيهات الأخرى
                return `
                    <div class="notification-item ${notification.read ? 'read' : ''}" data-id="${notification.id}">
                        <div class="notification-icon ${getNotificationIconClass(notification.type)}">
                            <i class="${getNotificationIcon(notification.type)}"></i>
                        </div>
                        <div class="notification-details">
                            <div class="notification-title">
                                <span>${notification.title || 'تنبيه'}</span>
                                ${notification.read ? '' : '<span class="notification-unread-badge"></span>'}
                            </div>
                            <div class="notification-message">
                                ${notification.message || ''}
                            </div>
                        </div>
                    </div>
                `;
            }
        }).join('');
        
        // إضافة مستمعي الأحداث لأزرار دفع الربح وعرض التفاصيل
        setupNotificationActionButtons(allNotificationsList);
    } else {
        allNotificationsList.innerHTML = '<div class="notification-empty">لا توجد تنبيهات</div>';
    }
}

/**
 * إعداد مستمعي الأحداث لأزرار التنبيهات
 * @param {HTMLElement} container - حاوية التنبيهات
 */
function setupNotificationActionButtons(container) {
    // أزرار دفع الربح
    const payProfitButtons = container.querySelectorAll('.pay-profit-btn');
    payProfitButtons.forEach(button => {
        button.addEventListener('click', function() {
            const investorId = this.getAttribute('data-investor-id');
            
            // تعيين التنبيه كمقروء
            markNotificationAsRead(this.closest('.notification-item').getAttribute('data-id'));
            
            // إغلاق نافذة التنبيهات
            closeModal('notifications-modal');
            
            // فتح نافذة دفع الربح
            openProfitPaymentModal(investorId);
        });
    });
    
    // أزرار عرض التفاصيل
    const viewInvestorButtons = container.querySelectorAll('.view-investor-btn');
    viewInvestorButtons.forEach(button => {
        button.addEventListener('click', function() {
            const investorId = this.getAttribute('data-investor-id');
            
            // تعيين التنبيه كمقروء
            markNotificationAsRead(this.closest('.notification-item').getAttribute('data-id'));
            
            // إغلاق نافذة التنبيهات
            closeModal('notifications-modal');
            
            // فتح نافذة تفاصيل المستثمر
            showInvestorDetails(investorId);
        });
    });
    
    // تعيين التنبيه كمقروء عند النقر عليه
    const notificationItems = container.querySelectorAll('.notification-item');
    notificationItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // تجنب تنفيذ النقر إذا تم النقر على زر بالفعل
            if (e.target.closest('button')) {
                return;
            }
            
            const notificationId = this.getAttribute('data-id');
            markNotificationAsRead(notificationId);
        });
    });
}

/**
 * تعيين تنبيه معين كمقروء
 * @param {String} notificationId - معرف التنبيه
 */
function markNotificationAsRead(notificationId) {
    // العثور على التنبيه
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification && !notification.read) {
        // تعيين التنبيه كمقروء
        notification.read = true;
        
        // تحديث عرض التنبيهات
        renderNotificationsList();
        
        // تحديث عدد التنبيهات غير المقروءة
        const unreadCount = notifications.filter(n => !n.read).length;
        updateNotificationBadge(unreadCount);
    }
}

/**
 * تعيين جميع التنبيهات كمقروءة
 */
function markAllNotificationsAsRead() {
    // تعيين جميع التنبيهات كمقروءة
    notifications.forEach(notification => {
        notification.read = true;
    });
    
    // تحديث عرض التنبيهات
    renderNotificationsList();
    
    // تحديث عدد التنبيهات غير المقروءة
    updateNotificationBadge(0);
    
    // عرض إشعار بنجاح العملية
    showNotification('تم تعيين جميع التنبيهات كمقروءة', 'success');
}

/**
 * فتح نافذة دفع الربح للمستثمر
 * @param {String} investorId - معرف المستثمر
 */
function openProfitPaymentModal(investorId) {
    const profitInvestorSelect = document.getElementById('profit-investor');
    
    if (!profitInvestorSelect) {
        console.error('لم يتم العثور على نموذج دفع الربح');
        return;
    }
    
    // تعيين المستثمر المحدد
    profitInvestorSelect.value = investorId;
    
    // حساب الربح للمستثمر (إذا كانت الدالة موجودة)
    if (typeof window.calculateProfitForInvestor === 'function') {
        window.calculateProfitForInvestor();
    }
    
    // فتح نافذة دفع الربح
    openModal('pay-profit-modal');
}

/**
 * عرض نافذة التنبيهات
 */
function showNotificationsModal() {
    openModal('notifications-modal');
}

/**
 * إضافة أنماط CSS للتنبيهات
 */
function addNotificationsStyles() {
    // التحقق من وجود أنماط مسبقة
    if (document.getElementById('notifications-styles')) {
        return;
    }
    
    // إنشاء عنصر النمط
    const styleElement = document.createElement('style');
    styleElement.id = 'notifications-styles';
    
    // إضافة أنماط CSS
    styleElement.textContent = `
        /* علامة عدد التنبيهات */
        .notification-badge {
            position: absolute;
            top: -8px;
            right: -8px;
            background-color: #f44336;
            color: white;
            border-radius: 50%;
            min-width: 18px;
            height: 18px;
            padding: 0 5px;
            font-size: 11px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }
        
        /* علامة التبويب */
        .tab-badge {
            background-color: #f44336;
            color: white;
            border-radius: 50%;
            min-width: 18px;
            height: 18px;
            padding: 0 5px;
            font-size: 11px;
            font-weight: bold;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-right: 6px;
        }
        
        /* علامات التبويب */
        .tabs {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        
        .tab-buttons {
            display: flex;
            border-bottom: 1px solid #e0e0e0;
            margin-bottom: 16px;
        }
        
        .tab-btn {
            padding: 10px 16px;
            margin-left: 8px;
            border: none;
            background: transparent;
            cursor: pointer;
            font-weight: 600;
            color: #666;
            position: relative;
            border-bottom: 2px solid transparent;
            transition: all 0.3s ease;
        }
        
        .tab-btn.active {
            color: #3b82f6;
            border-bottom-color: #3b82f6;
        }
        
        .tab-content {
            display: none;
            flex: 1;
            overflow-y: auto;
            padding-bottom: 16px;
        }
        
        .tab-content.active {
            display: block;
        }
        
        /* قائمة التنبيهات */
        .notifications-list {
            max-height: 400px;
            overflow-y: auto;
        }
        
        .notification-item {
            display: flex;
            padding: 16px;
            border-bottom: 1px solid #e0e0e0;
            transition: background-color 0.3s ease;
            position: relative;
            cursor: pointer;
        }
        
        .notification-item:hover {
            background-color: #f5f9ff;
        }
        
        .notification-item.read {
            background-color: #f8f9fa;
            opacity: 0.8;
        }
        
        .notification-icon {
            min-width: 40px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #e0f2fe;
            color: #0284c7;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: 16px;
        }
        
        .notification-icon.success {
            background-color: #dcfce7;
            color: #16a34a;
        }
        
        .notification-icon.warning {
            background-color: #fff7ed;
            color: #ea580c;
        }
        
        .notification-icon.danger {
            background-color: #fee2e2;
            color: #dc2626;
        }
        
        .notification-details {
            flex: 1;
        }
        
        .notification-title {
            font-weight: 600;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .notification-unread-badge {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #3b82f6;
            display: inline-block;
            margin-right: 8px;
        }
        
        .notification-message {
            color: #4b5563;
            font-size: 0.9rem;
            margin-bottom: 10px;
        }
        
        .notification-message small {
            color: #6b7280;
            display: block;
            margin-top: 4px;
        }
        
        .notification-actions {
            display: flex;
            gap: 8px;
        }
        
        .notification-empty {
            padding: 32px 16px;
            text-align: center;
            color: #6b7280;
            font-style: italic;
        }
        
        /* تعديلات لزر التنبيهات الرئيسي */
        #notification-btn {
            position: relative;
        }
        
        #notification-btn.has-notifications {
            color: #3b82f6;
        }
        
        /* تنسيق لنافذة التنبيهات */
        #notifications-modal .modal {
            max-width: 600px;
            max-height: 80vh;
        }
        
        #notifications-modal .modal-body {
            padding: 0;
        }
        
        #notifications-modal .tabs {
            padding: 0;
        }
        
        #notifications-modal .tab-buttons {
            padding: 0 16px;
        }
        
        #notifications-modal .tab-content {
            padding: 0;
        }
        
        /* تحسين لأزرار التنبيهات */
        .btn-sm {
            padding: 6px 10px;
            font-size: 0.8rem;
        }
    `;
    
    // إضافة عنصر النمط إلى الصفحة
    document.head.appendChild(styleElement);
    console.log('تم إضافة أنماط CSS للتنبيهات بنجاح');
}

/**
 * إعداد مستمعي الأحداث للتحديث الدوري
 */
function setupNotificationsEvents() {
    // تحديث التنبيهات كل دقيقة
    setInterval(updateNotifications, 60000);
    
    // تحديث التنبيهات عند إضافة مستثمر جديد
    document.addEventListener('investor:update', updateNotifications);
    
    // تحديث التنبيهات عند إضافة عملية جديدة
    document.addEventListener('transaction:update', updateNotifications);
    
    // تحديث التنبيهات عند حفظ الإعدادات
    document.addEventListener('settings:saved', updateNotifications);
}

/**
 * الحصول على نوع أيقونة التنبيه
 * @param {String} type - نوع التنبيه
 * @returns {String} - اسم أيقونة Font Awesome
 */
function getNotificationIcon(type) {
    switch(type) {
        case 'due-profit':
            return 'fas fa-coins';
        case 'new-investor':
            return 'fas fa-user-plus';
        case 'withdrawal':
            return 'fas fa-arrow-down';
        case 'deposit':
            return 'fas fa-arrow-up';
        case 'alert':
            return 'fas fa-exclamation-triangle';
        default:
            return 'fas fa-bell';
    }
}

/**
 * الحصول على فئة أيقونة التنبيه
 * @param {String} type - نوع التنبيه
 * @returns {String} - اسم الفئة CSS
 */
function getNotificationIconClass(type) {
    switch(type) {
        case 'due-profit':
            return 'success';
        case 'new-investor':
            return 'info';
        case 'withdrawal':
            return 'warning';
        case 'deposit':
            return 'info';
        case 'alert':
            return 'danger';
        default:
            return 'info';
    }
}

/**
 * تنسيق المبلغ المالي بشكل مناسب
 * @param {Number} amount - المبلغ المالي
 * @returns {String} - المبلغ المنسق
 */
function formatCurrency(amount) {
    // استخدام دالة التنسيق الموجودة في النظام إذا كانت متوفرة
    if (typeof window.formatCurrency === 'function') {
        return window.formatCurrency(amount);
    }
    
    // تنسيق بسيط للمبلغ
    const currency = window.settings?.currency || 'دينار';
    return `${amount.toLocaleString()} ${currency}`;
}

/**
 * إضافة تنبيه جديد إلى النظام
 * @param {Object} notification - كائن التنبيه
 */
function addNotification(notification) {
    // التأكد من وجود الحقول الإلزامية
    if (!notification.type || !notification.message) {
        console.error('حقول التنبيه غير مكتملة');
        return;
    }
    
    // إضافة معرف وتاريخ إنشاء للتنبيه
    notification.id = notification.id || Date.now().toString();
    notification.createdAt = notification.createdAt || new Date();
    notification.read = notification.read || false;
    
    // إضافة التنبيه إلى القائمة
    notifications.push(notification);
    
    // تحديث عرض التنبيهات
    renderNotificationsList();
    
    // تحديث عدد التنبيهات غير المقروءة
    const unreadCount = notifications.filter(n => !n.read).length;
    updateNotificationBadge(unreadCount);
}

/**
 * إعادة تعيين نظام التنبيهات
 */
function resetNotificationsSystem() {
    // إفراغ قائمة التنبيهات
    notifications = [];
    
    // إعادة تعيين عدد التنبيهات
    notificationsCount = 0;
    
    // تحديث عرض التنبيهات
    renderNotificationsList();
    
    // تحديث علامة عدد التنبيهات
    updateNotificationBadge(0);
}

/**
 * إضافة التنبيهات عند حدوث عمليات مختلفة
 * @param {String} eventType - نوع الحدث
 * @param {Object} data - بيانات الحدث
 */
function addSystemNotification(eventType, data) {
    switch(eventType) {
        case 'new-investor':
            // تنبيه عند إضافة مستثمر جديد
            addNotification({
                type: 'new-investor',
                title: 'مستثمر جديد',
                message: `تم إضافة مستثمر جديد: ${data.investorName}`,
                investorId: data.investorId,
                read: false
            });
            break;
            
        case 'withdrawal':
            // تنبيه عند عملية سحب
            addNotification({
                type: 'withdrawal',
                title: 'عملية سحب',
                message: `تم إجراء عملية سحب بقيمة ${formatCurrency(data.amount)} للمستثمر ${data.investorName}`,
                investorId: data.investorId,
                read: false
            });
            break;
            
        case 'deposit':
            // تنبيه عند عملية إيداع
            addNotification({
                type: 'deposit',
                title: 'عملية إيداع',
                message: `تم إجراء عملية إيداع بقيمة ${formatCurrency(data.amount)} للمستثمر ${data.investorName}`,
                investorId: data.investorId,
                read: false
            });
            break;
            
        case 'profit-payment':
            // تنبيه عند دفع ربح
            addNotification({
                type: 'profit-payment',
                title: 'دفع ربح',
                message: `تم دفع ربح بقيمة ${formatCurrency(data.amount)} للمستثمر ${data.investorName}`,
                investorId: data.investorId,
                read: false
            });
            break;
    }
}

// تصدير الدوال لاستخدامها في أماكن أخرى
window.notificationsSystem = {
    init: initNotificationsSystem,
    update: updateNotifications,
    add: addNotification,
    addSystemNotification: addSystemNotification,
    reset: resetNotificationsSystem
};

// تهيئة نظام التنبيهات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initNotificationsSystem);