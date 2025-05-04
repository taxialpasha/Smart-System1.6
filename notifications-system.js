/**
 * نظام الاستثمار المتكامل - سكربت التثبيت للإصلاحات
 * يقوم هذا السكربت بتثبيت جميع الإصلاحات وتهيئة النظام بشكل صحيح
 */

// تخزين الوظائف الأصلية للنظام قبل التعديل
const originalFunctions = {};

// تنفيذ الإصلاحات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تثبيت الإصلاحات الشاملة لنظام الاستثمار المتكامل...');
    
    // 1. تخزين النسخ الأصلية من الوظائف
    backupOriginalFunctions();
    
    // 2. إصلاح نظام الإشعارات
    fixNotificationsSystem();
    
    // 3. إصلاح نظام التعرف على الصوت
    fixSpeechRecognition();
    
    // 4. إصلاح دالة تنسيق العملة
    fixCurrencyFormatter();
    
    // 5. تهيئة البيانات الافتراضية إذا كانت غير موجودة
    initializeDefaultData();
    
    // 6. تحديث واجهة المستخدم بعد الإصلاحات
    setTimeout(updateUI, 500);
    
    console.log('تم تثبيت الإصلاحات بنجاح!');
});

/**
 * نسخ احتياطي للوظائف الأصلية قبل التعديل
 */
function backupOriginalFunctions() {
    // نسخ وظائف نظام الإشعارات
    if (window.notificationsSystem) {
        originalFunctions.notificationsSystem = { ...window.notificationsSystem };
    }
    
    // نسخ وظائف التعرف على الصوت
    if (typeof window.setupSpeechRecognition === 'function') {
        originalFunctions.setupSpeechRecognition = window.setupSpeechRecognition;
    }
    
    // نسخ دالة تنسيق العملة
    if (typeof window.formatCurrency === 'function') {
        originalFunctions.formatCurrency = window.formatCurrency;
    }
    
    // نسخ دوال عرض جداول البيانات
    if (typeof window.renderInvestorsTable === 'function') {
        originalFunctions.renderInvestorsTable = window.renderInvestorsTable;
    }
    
    if (typeof window.renderTransactionsTable === 'function') {
        originalFunctions.renderTransactionsTable = window.renderTransactionsTable;
    }
    
    if (typeof window.renderProfitsTable === 'function') {
        originalFunctions.renderProfitsTable = window.renderProfitsTable;
    }
    
    if (typeof window.renderRecentTransactions === 'function') {
        originalFunctions.renderRecentTransactions = window.renderRecentTransactions;
    }
    
    console.log('تم نسخ الوظائف الأصلية بنجاح');
}

/**
 * إصلاح نظام الإشعارات
 */
function fixNotificationsSystem() {
    console.log('إصلاح نظام الإشعارات...');
    
    // إنشاء كائن نظام الإشعارات إذا لم يكن موجوداً
    if (!window.notificationsSystem) {
        window.notificationsSystem = {};
    }
    
    // إضافة وظيفة الحصول على المستثمرين المستحقين
    window.notificationsSystem.getDueInvestors = function() {
        try {
            // استخدام نسخة آمنة للحصول على المستثمرين
            const investors = safeGetInvestors();
            
            const dueInvestors = [];
            const today = new Date();
            const settings = window.settings || { profitCycle: 30, interestRate: 17.5 };
            
            investors.forEach(investor => {
                if (!investor || investor.status !== 'نشط' || !investor.investments || investor.investments.length === 0) {
                    return;
                }
                
                const totalInvestment = investor.amount || 0;
                if (totalInvestment <= 0) {
                    return;
                }
                
                // اختيار أقدم تاريخ استثمار
                const oldestInvestment = investor.investments.reduce((oldest, current) => {
                    if (!oldest) return current;
                    if (!current || !current.date) return oldest;
                    
                    const oldestDate = new Date(oldest.date);
                    const currentDate = new Date(current.date);
                    return currentDate < oldestDate ? current : oldest;
                }, null);
                
                if (!oldestInvestment) {
                    return;
                }
                
                const investmentDate = new Date(oldestInvestment.date);
                const daysElapsed = Math.floor((today - investmentDate) / (1000 * 60 * 60 * 24));
                
                // حساب ما إذا كان المستثمر مستحقًا للربح
                if (daysElapsed >= (settings.profitCycle || 30)) {
                    // حساب الربح المستحق
                    let profit = 0;
                    
                    // التأكد من وجود استثمارات
                    if (investor.investments && Array.isArray(investor.investments)) {
                        profit = investor.investments.reduce((total, inv) => {
                            if (!inv || !inv.amount) return total;
                            
                            // استخدام دالة حساب الفائدة إذا كانت موجودة
                            if (typeof window.calculateInterest === 'function') {
                                return total + window.calculateInterest(inv.amount, inv.date);
                            }
                            
                            // حساب بسيط للفائدة إذا لم تكن الدالة موجودة
                            const rate = (settings.interestRate || 17.5) / 100;
                            return total + (inv.amount * rate);
                        }, 0);
                    }
                    
                    // إضافة المستثمر إلى القائمة مع الربح المستحق
                    dueInvestors.push({
                        investor: investor,
                        profit: profit,
                        daysElapsed: daysElapsed,
                        dueDate: new Date(investmentDate.getTime() + ((settings.profitCycle || 30) * 24 * 60 * 60 * 1000))
                    });
                }
            });
            
            // ترتيب القائمة حسب أقدمية تاريخ الاستحقاق
            dueInvestors.sort((a, b) => a.dueDate - b.dueDate);
            
            return dueInvestors;
        } catch (error) {
            console.error("خطأ في الحصول على المستثمرين المستحقين للربح:", error);
            return [];
        }
    };
    
    // تعديل دالة update
    const originalUpdate = window.notificationsSystem.update;
    window.notificationsSystem.update = function() {
        try {
            // تنفيذ الدالة الأصلية إذا كانت موجودة
            if (typeof originalUpdate === 'function') {
                originalUpdate.apply(this, arguments);
            } else {
                console.log('تحديث التنبيهات باستخدام الدالة المُصلَحة');
                // استخدام الدالة البديلة
                updateNotifications();
            }
        } catch (error) {
            console.error('خطأ في تحديث التنبيهات:', error);
        }
    };
    
    // إضافة دالة بديلة لتحديث التنبيهات إذا فشلت الدالة الأصلية
    function updateNotifications() {
        try {
            const dueInvestors = window.notificationsSystem.getDueInvestors();
            
            // تحديث عدد التنبيهات
            const badge = document.getElementById('notification-badge');
            if (badge) {
                if (dueInvestors.length > 0) {
                    badge.textContent = dueInvestors.length;
                    badge.style.display = 'flex';
                } else {
                    badge.style.display = 'none';
                }
            }
            
            // تحديث قوائم التنبيهات
            updateNotificationsList(dueInvestors);
        } catch (error) {
            console.error('خطأ في تحديث التنبيهات:', error);
        }
    }
    
    // دالة تحديث قوائم التنبيهات
    function updateNotificationsList(dueInvestors) {
        // الحصول على عناصر قوائم التنبيهات
        const dueProfitsList = document.getElementById('due-profits-list');
        const allNotificationsList = document.getElementById('all-notifications-list');
        
        if (!dueProfitsList || !allNotificationsList) {
            return;
        }
        
        // تحديث قائمة الأرباح المستحقة
        if (dueInvestors.length > 0) {
            dueProfitsList.innerHTML = dueInvestors.map(item => {
                // تنسيق التاريخ
                const dueDate = new Date(item.dueDate).toLocaleDateString('ar-SA');
                
                // تنسيق المبلغ
                const formattedProfit = typeof window.formatCurrency === 'function' 
                    ? window.formatCurrency(item.profit) 
                    : `${item.profit} ${window.settings?.currency || 'دينار'}`;
                
                return `
                    <div class="notification-item">
                        <div class="notification-icon success">
                            <i class="fas fa-coins"></i>
                        </div>
                        <div class="notification-details">
                            <div class="notification-title">
                                <span>ربح مستحق - ${item.investor.name}</span>
                                <span class="notification-unread-badge"></span>
                            </div>
                            <div class="notification-message">
                                يوجد ربح مستحق بقيمة <strong>${formattedProfit}</strong> للمستثمر ${item.investor.name}.
                                <br>
                                <small>تاريخ الاستحقاق: ${dueDate} (منذ ${item.daysElapsed} يوم)</small>
                            </div>
                            <div class="notification-actions">
                                <button class="btn btn-sm btn-success pay-profit-btn" data-investor-id="${item.investor.id}">
                                    <i class="fas fa-coins"></i>
                                    <span>دفع الربح</span>
                                </button>
                                <button class="btn btn-sm btn-outline view-investor-btn" data-investor-id="${item.investor.id}">
                                    <i class="fas fa-eye"></i>
                                    <span>عرض التفاصيل</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
        } else {
            dueProfitsList.innerHTML = '<div class="notification-empty">لا توجد أرباح مستحقة حالياً</div>';
        }
        
        // تحديث عناصر العدد
        const dueProfitsCount = document.getElementById('due-profits-count');
        if (dueProfitsCount) {
            dueProfitsCount.textContent = dueInvestors.length;
        }
        
        const allNotificationsCount = document.getElementById('all-notifications-count');
        if (allNotificationsCount) {
            allNotificationsCount.textContent = dueInvestors.length;
        }
        
        // إضافة مستمعي الأحداث للأزرار
        setupNotificationButtons();
    }
    
    // إضافة مستمعي الأحداث لأزرار التنبيهات
    function setupNotificationButtons() {
        // أزرار دفع الربح
        document.querySelectorAll('.pay-profit-btn').forEach(button => {
            button.addEventListener('click', function() {
                const investorId = this.getAttribute('data-investor-id');
                if (!investorId) return;
                
                // إغلاق نافذة التنبيهات
                closeModal('notifications-modal');
                
                // فتح نافذة دفع الربح
                const profitInvestorSelect = document.getElementById('profit-investor');
                if (profitInvestorSelect) {
                    profitInvestorSelect.value = investorId;
                    
                    // حساب الربح للمستثمر
                    if (typeof window.calculateProfitForInvestor === 'function') {
                        window.calculateProfitForInvestor();
                    }
                    
                    // فتح النافذة
                    if (typeof window.openModal === 'function') {
                        window.openModal('pay-profit-modal');
                    }
                }
            });
        });
        
        // أزرار عرض التفاصيل
        document.querySelectorAll('.view-investor-btn').forEach(button => {
            button.addEventListener('click', function() {
                const investorId = this.getAttribute('data-investor-id');
                if (!investorId) return;
                
                // إغلاق نافذة التنبيهات
                closeModal('notifications-modal');
                
                // عرض تفاصيل المستثمر
                if (typeof window.showInvestorDetails === 'function') {
                    window.showInvestorDetails(investorId);
                }
            });
        });
    }
    
    console.log('تم إصلاح نظام الإشعارات بنجاح');
}

/**
 * الحصول على المستثمرين بطريقة آمنة
 * @returns {Array} قائمة المستثمرين
 */
function safeGetInvestors() {
    // التحقق من وجود مصفوفة المستثمرين
    if (window.investors && Array.isArray(window.investors)) {
        return window.investors;
    }
    
    // محاولة استرجاع البيانات من التخزين المحلي
    try {
        const savedInvestors = localStorage.getItem('investors');
        if (savedInvestors) {
            const parsedInvestors = JSON.parse(savedInvestors);
            if (Array.isArray(parsedInvestors)) {
                // تعيين المصفوفة للاستخدام مستقبلاً
                window.investors = parsedInvestors;
                return parsedInvestors;
            }
        }
    } catch (error) {
        console.error('خطأ في استرجاع المستثمرين من التخزين المحلي:', error);
    }
    
    // إرجاع مصفوفة فارغة إذا لم يتم العثور على المستثمرين
    return [];
}

/**
 * إصلاح نظام التعرف على الصوت
 */
function fixSpeechRecognition() {
    console.log('إصلاح نظام التعرف على الصوت...');
    
    // إضافة دالة إضافة زر المساعدة
    window.addSpeechRecognitionHelpButton = function() {
        // التحقق من وجود زر المساعدة مسبقاً
        if (document.querySelector('.speech-help-btn')) {
            return;
        }
        
        // إنشاء زر المساعدة
        const helpButton = document.createElement('button');
        helpButton.className = 'btn btn-info speech-help-btn';
        helpButton.innerHTML = '<i class="fas fa-question-circle"></i>';
        helpButton.title = 'مساعدة حول استخدام الإدخال الصوتي';
        
        // تعيين نمط الزر
        helpButton.style.position = 'fixed';
        helpButton.style.bottom = '20px';
        helpButton.style.left = '20px';
        helpButton.style.zIndex = '1000';
        helpButton.style.borderRadius = '50%';
        helpButton.style.width = '40px';
        helpButton.style.height = '40px';
        helpButton.style.padding = '0';
        helpButton.style.display = 'flex';
        helpButton.style.alignItems = 'center';
        helpButton.style.justifyContent = 'center';
        
        // إضافة مستمع حدث للزر
        helpButton.addEventListener('click', function() {
            // عرض نافذة المساعدة
            showSpeechHelpModal();
        });
        
        // إضافة الزر للصفحة
        document.body.appendChild(helpButton);
        
        console.log('تم إضافة زر مساعدة التعرف على الصوت');
    };
}
    
    // إضافة دالة عرض نافذة المساعدة
    window.showSpeechHelpModal = function() {
        // محتوى المساعدة
        const content = `
            <div class="speech-help-content">
                <h3><i class="fas fa-microphone"></i> كيفية استخدام الإدخال الصوتي</h3>
                
                <p>يمكنك استخدام ميزة الإدخال الصوتي لإدخال البيانات باستخدام الصوت بدلاً من الكتابة. اتبع الخطوات التالية:</p>
                
                <ol>
                    <li>انقر على زر المايكروفون <i class="fas fa-microphone"></i> بجانب حقل الإدخال.</li>
                    <li>اسمح للمتصفح بالوصول إلى المايكروفون إذا طُلب منك ذلك.</li>
                    <li>تحدث بوضوح باللغة العربية.</li>
                    <li>سيتم تحويل كلامك تلقائيًا إلى نص في حقل الإدخال.</li>
                    <li>يمكنك تعديل النص يدويًا بعد الانتهاء إذا لزم الأمر.</li>
                </ol>
                
                <div class="note">
                    <p><strong>ملاحظات:</strong></p>
                    <ul>
                        <li>تأكد من أن المايكروفون يعمل بشكل صحيح.</li>
                        <li>تحدث بوضوح وببطء للحصول على نتائج أفضل.</li>
                        <li>يعمل هذا بشكل أفضل في بيئة هادئة خالية من الضوضاء.</li>
                        <li>تأكد من استخدام متصفح حديث يدعم التعرف على الصوت.</li>
                    </ul>
                </div>
            </div>
        `;
        
        // عرض نافذة المساعدة
        if (typeof window.showModal === 'function') {
            window.showModal('مساعدة الإدخال الصوتي', content);
        }
    };
    
    // استبدال دالة إعداد التعرف على الصوت
    window.setupSpeechRecognition = function() {
        console.log('تهيئة نظام التعرف على الصوت (النسخة المُصلَحة)...');
        
        // إضافة أنماط CSS للتعرف على الصوت
        addSpeechRecognitionStyles();
        
        // إضافة زر المساعدة
        window.addSpeechRecognitionHelpButton();
        
        // البحث عن جميع أزرار المايكروفون
        const micButtons = document.querySelectorAll('.mic-btn');
        
        // التحقق من دعم المتصفح للتعرف على الصوت
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn('المتصفح لا يدعم ميزة التعرف على الصوت');
            
            // تغيير شكل أزرار المايكروفون لتعكس عدم الدعم
            micButtons.forEach(button => {
                button.classList.add('not-supported');
                button.title = 'التعرف على الصوت غير مدعوم في هذا المتصفح';
                
                const icon = button.querySelector('i.fa-microphone');
                if (icon) {
                    icon.classList.remove('fa-microphone');
                    icon.classList.add('fa-microphone-slash');
                }
                
                button.disabled = true;
            });
            
            return;
        }
        
        // إضافة مستمع حدث لكل زر
        micButtons.forEach(button => {
            // التأكد من عدم إضافة مستمع حدث مرتين
            if (button.classList.contains('setup-complete')) {
                return;
            }
            
            button.classList.add('setup-complete');
            button.classList.add('supported');
            button.title = 'انقر للتحدث';
            
            // إضافة مستمع حدث النقر
            button.addEventListener('click', function() {
                const inputId = this.getAttribute('data-input');
                const inputField = document.getElementById(inputId);
                
                if (!inputField) {
                    console.error(`لم يتم العثور على حقل الإدخال: ${inputId}`);
                    return;
                }
                
                // بدء التعرف على الصوت
                startSpeechRecognition(button, inputField);
            });
        });
        
        console.log(`تم تهيئة ${micButtons.length} زر للمايكروفون`);
    };
    
    /**
     * بدء عملية التعرف على الصوت
     * @param {HTMLElement} button - زر المايكروفون
     * @param {HTMLElement} inputField - حقل الإدخال
     */
    function startSpeechRecognition(button, inputField) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        try {
            // إنشاء كائن جديد للتعرف على الصوت
            const recognition = new SpeechRecognition();
            
            // إعداد خيارات التعرف على الصوت
            recognition.lang = 'ar-SA'; // تعيين اللغة العربية
            recognition.continuous = false; // التعرف على جملة واحدة فقط
            recognition.interimResults = true; // عرض النتائج المؤقتة
            
            // تغيير مظهر الزر ليعكس حالة الاستماع
            button.classList.add('listening');
            const icon = button.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-microphone');
                icon.classList.add('fa-spinner');
                icon.classList.add('fa-pulse');
            }
            
            // إضافة مؤشر التسجيل النشط
            const recordingIndicator = document.createElement('div');
            recordingIndicator.className = 'recording-indicator';
            recordingIndicator.textContent = 'جارٍ الاستماع... تحدث الآن';
            document.body.appendChild(recordingIndicator);
            
            // إظهار إشعار للمستخدم
            if (typeof window.showNotification === 'function') {
                window.showNotification('جارٍ الاستماع... تحدث الآن', 'info');
            }
            
            // مستمع حدث لنتائج التعرف
            recognition.onresult = function(event) {
                const speechResult = event.results[0][0].transcript;
                console.log(`نتيجة التعرف: "${speechResult}" (الثقة: ${event.results[0][0].confidence})`);
                
                // تحديث قيمة حقل الإدخال بالنص المتعرف عليه
                inputField.value = speechResult;
                
                // إطلاق أحداث تغيير وإدخال للحقل
                inputField.dispatchEvent(new Event('change', { bubbles: true }));
                inputField.dispatchEvent(new Event('input', { bubbles: true }));
            };
            
            // مستمع حدث لانتهاء التعرف
            recognition.onend = function() {
                // إعادة تعيين حالة الزر
                button.classList.remove('listening');
                if (icon) {
                    icon.classList.remove('fa-spinner');
                    icon.classList.remove('fa-pulse');
                    icon.classList.add('fa-microphone');
                }
                
                // إزالة مؤشر التسجيل
                if (recordingIndicator.parentNode) {
                    recordingIndicator.parentNode.removeChild(recordingIndicator);
                }
                
                // عرض إشعار نجاح
                if (inputField.value && typeof window.showNotification === 'function') {
                    window.showNotification('تم التعرف بنجاح!', 'success');
                }
            };
            
            // مستمع حدث للأخطاء
            recognition.onerror = function(event) {
                console.error(`خطأ في التعرف على الصوت: ${event.error}`);
                
                // إعادة تعيين حالة الزر
                button.classList.remove('listening');
                if (icon) {
                    icon.classList.remove('fa-spinner');
                    icon.classList.remove('fa-pulse');
                    icon.classList.add('fa-microphone');
                }
                
                // إزالة مؤشر التسجيل
                if (recordingIndicator.parentNode) {
                    recordingIndicator.parentNode.removeChild(recordingIndicator);
                }
                
                // عرض إشعار خطأ حسب نوع الخطأ
                if (typeof window.showNotification === 'function') {
                    let errorMessage = 'حدث خطأ في التعرف على الصوت';
                    
                    switch(event.error) {
                        case 'no-speech':
                            errorMessage = 'لم يتم اكتشاف أي كلام';
                            break;
                        case 'audio-capture':
                            errorMessage = 'تعذر الوصول إلى المايكروفون';
                            break;
                        case 'not-allowed':
                            errorMessage = 'تم رفض الوصول إلى المايكروفون';
                            break;
                        case 'network':
                            errorMessage = 'حدث خطأ في الشبكة';
                            break;
                    }
                    
                    window.showNotification(errorMessage, 'error');
                }
            };
            
            // بدء عملية التعرف على الصوت
            recognition.start();
            console.log('بدأ الاستماع للصوت...');
            
        } catch (error) {
            console.error('خطأ في بدء التعرف على الصوت:', error);
            
            if (typeof window.showNotification === 'function') {
                window.showNotification('تعذر بدء التعرف على الصوت', 'error');
            }
            
            // إعادة تعيين حالة الزر
            button.classList.remove('listening');
            const icon = button.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-spinner');
                icon.classList.remove('fa-pulse');
                icon.classList.add('fa-microphone');
            }
        }
    }
    
   /**
 * إضافة أنماط CSS للتعرف على الصوت
 */
function addSpeechRecognitionStyles() {
    // التحقق من وجود أنماط مسبقة
    if (document.getElementById('speech-recognition-styles')) {
        return;
    }
    
    // إنشاء عنصر النمط
    const styleElement = document.createElement('style');
    styleElement.id = 'speech-recognition-styles';
    
    // إضافة أنماط CSS
    styleElement.textContent = `
        /* نمط زر المايكروفون */
        .mic-btn {
            position: relative;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        /* زر المايكروفون عند حالة الاستماع */
        .mic-btn.listening {
            background-color: #f44336;
            color: white;
            border-color: #d32f2f;
            box-shadow: 0 0 0 4px rgba(244, 67, 54, 0.3);
        }
        
        /* زر المايكروفون في حالة عدم الدعم */
        .mic-btn.not-supported {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        /* مؤشر التسجيل النشط */
        .recording-indicator {
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #f44336;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            animation: pulse 1.5s infinite;
        }
        
        .recording-indicator::before {
            content: "●";
            margin-left: 8px;
            animation: blink 1s infinite;
        }
        
        /* تنشيط نبض للمؤشر */
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.6; }
            100% { opacity: 1; }
        }
        
        @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0.3; }
            100% { opacity: 1; }
        }
        
        /* زر المساعدة للتعرف على الصوت */
        .speech-help-btn {
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 1000;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #3498db;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .speech-help-btn:hover {
            transform: scale(1.1);
            background-color: #2980b9;
        }
        
        /* محتوى نافذة المساعدة */
        .speech-help-content {
            direction: rtl;
            text-align: right;
        }
        
        .speech-help-content h3 {
            color: #3498db;
            margin-bottom: 15px;
        }
        
        .speech-help-content ol {
            padding-right: 20px;
            margin-bottom: 15px;
        }
        
        .speech-help-content li {
            margin-bottom: 8px;
        }
        
        .speech-help-content .note {
            background-color: #f8f9fa;
            border-right: 3px solid #3498db;
            padding: 10px;
            border-radius: 4px;
        }
    `;
    
    // إضافة عنصر النمط إلى رأس الصفحة
    document.head.appendChild(styleElement);
    console.log('تم إضافة أنماط CSS للتعرف على الصوت');
}

/**
 * إصلاح دالة تنسيق العملة
 */
function fixCurrencyFormatter() {
    console.log('إصلاح دالة تنسيق العملة...');
    
    // دالة آمنة لتنسيق العملة
    const safeFormatCurrency = function(amount, addCurrency = true) {
        // التحقق من صحة المبلغ
        if (amount === undefined || amount === null || isNaN(amount)) {
            return addCurrency ? "0 " + (window.settings?.currency || 'دينار') : "0";
        }
        
        // تقريب المبلغ إلى رقمين عشريين إذا كان يحتوي على كسور
        amount = parseFloat(amount);
        if (amount % 1 !== 0) {
            amount = amount.toFixed(2);
        }
        
        // تحويل المبلغ إلى نص وإضافة النقاط بين كل ثلاثة أرقام
        const parts = amount.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        
        // إعادة المبلغ مع إضافة العملة إذا تم طلب ذلك
        const formattedAmount = parts.join(',');
        
        if (addCurrency) {
            return formattedAmount + " " + (window.settings?.currency || 'دينار');
        } else {
            return formattedAmount;
        }
    };
    
    // استبدال دالة تنسيق العملة
    window.formatCurrency = function(amount, addCurrency = true) {
        try {
            return safeFormatCurrency(amount, addCurrency);
        } catch (error) {
            console.error('خطأ في تنسيق العملة:', error);
            return safeFormatCurrency(amount, addCurrency);
        }
    };
    
    console.log('تم إصلاح دالة تنسيق العملة');
}

/**
 * تهيئة البيانات الافتراضية إذا كانت غير موجودة
 */
function initializeDefaultData() {
    console.log('تهيئة البيانات الافتراضية...');
    
    // التحقق من وجود المستثمرين
    const investors = safeGetInvestors();
    
    // إنشاء مستثمر افتراضي إذا لم يكن هناك مستثمرين
    if (investors.length === 0) {
        const defaultInvestor = {
            id: Date.now().toString(),
            name: 'محمد عبد الله',
            phone: '0501234567',
            address: 'الرياض، حي النخيل',
            cardNumber: 'ID12345678',
            joinDate: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            status: 'نشط',
            amount: 50000,
            investments: [
                {
                    amount: 50000,
                    date: new Date().toISOString().split('T')[0],
                    interest: 0
                }
            ],
            profits: [],
            withdrawals: []
        };
        
        // حساب الفائدة المتوقعة
        if (typeof window.calculateInterest === 'function') {
            defaultInvestor.investments[0].interest = window.calculateInterest(
                defaultInvestor.investments[0].amount,
                defaultInvestor.investments[0].date
            );
        } else {
            defaultInvestor.investments[0].interest = defaultInvestor.investments[0].amount * 0.175;
        }
        
        // إضافة المستثمر إلى المصفوفة
        window.investors = [defaultInvestor];
        
        // إضافة عملية إيداع افتراضية
        const defaultTransaction = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            type: 'إيداع',
            investorId: defaultInvestor.id,
            investorName: defaultInvestor.name,
            amount: defaultInvestor.amount,
            balanceAfter: defaultInvestor.amount
        };
        
        window.transactions = [defaultTransaction];
        
        // حفظ البيانات
        try {
            localStorage.setItem('investors', JSON.stringify(window.investors));
            localStorage.setItem('transactions', JSON.stringify(window.transactions));
            
            console.log('تم إنشاء وحفظ البيانات الافتراضية');
        } catch (error) {
            console.error('خطأ في حفظ البيانات الافتراضية:', error);
        }
    }
    
    // التحقق من وجود الإعدادات
    if (!window.settings) {
        window.settings = {
            interestRate: 17.5,
            reminderDays: 3,
            currency: 'دينار',
            language: 'ar',
            systemName: 'نظام الاستثمار المتكامل',
            profitCalculation: 'daily',
            profitCycle: 30,
            autoBackup: true,
            backupFrequency: 'weekly'
        };
        
        // حفظ الإعدادات
        try {
            localStorage.setItem('settings', JSON.stringify(window.settings));
            console.log('تم إنشاء وحفظ الإعدادات الافتراضية');
        } catch (error) {
            console.error('خطأ في حفظ الإعدادات الافتراضية:', error);
        }
    }
}

/**
 * تحديث واجهة المستخدم بعد الإصلاحات
 */
function updateUI() {
    console.log('تحديث واجهة المستخدم بعد الإصلاحات...');
    
    // تحديث لوحة التحكم
    if (typeof window.updateDashboard === 'function') {
        try {
            window.updateDashboard();
        } catch (error) {
            console.error('خطأ في تحديث لوحة التحكم:', error);
        }
    }
    
    // عرض جدول المستثمرين
    if (typeof window.renderInvestorsTable === 'function') {
        try {
            window.renderInvestorsTable();
        } catch (error) {
            console.error('خطأ في عرض جدول المستثمرين:', error);
        }
    }
    
    // عرض جدول العمليات
    if (typeof window.renderTransactionsTable === 'function') {
        try {
            window.renderTransactionsTable();
        } catch (error) {
            console.error('خطأ في عرض جدول العمليات:', error);
        }
    }
    
    // عرض جدول الأرباح
    if (typeof window.renderProfitsTable === 'function') {
        try {
            window.renderProfitsTable();
        } catch (error) {
            console.error('خطأ في عرض جدول الأرباح:', error);
        }
    }
    
    // عرض آخر العمليات
    if (typeof window.renderRecentTransactions === 'function') {
        try {
            window.renderRecentTransactions();
        } catch (error) {
            console.error('خطأ في عرض آخر العمليات:', error);
        }
    }
    
    // إظهار إشعار بنجاح الإصلاح
    if (typeof window.showNotification === 'function') {
        window.showNotification('تم تطبيق الإصلاحات بنجاح!', 'success');
    }
    
    console.log('تم تحديث واجهة المستخدم بنجاح');
}

/**
 * إغلاق النافذة المنبثقة
 * @param {string} modalId - معرف النافذة المنبثقة
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}