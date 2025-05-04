/**
 * نظام إشعارات المستثمرين المستحقين - إصلاح شامل
 * هذا الملف يقوم بحل مشاكل نظام الإشعارات ودمجه بشكل صحيح مع تطبيق إدارة الاستثمار
 */

// تنفيذ الإصلاح عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('بدء تطبيق إصلاح نظام الإشعارات الشامل...');
    
    // 1. إضافة دالة getDueInvestors المفقودة
    addMissingFunctions();
    
    // 2. إصلاح تعارضات تنسيق العملة
    fixCurrencyFormatting();
    
    // 3. إصلاح مشكلة استدعاء دالة التعرف على الصوت
    fixSpeechRecognition();
    
    // 4. تهيئة نظام الإشعارات بعد إتمام الإصلاحات
    setTimeout(initNotificationsSystem, 500);
    
    console.log('تم تطبيق إصلاح نظام الإشعارات بنجاح');
});

/**
 * إضافة الدوال المفقودة في نظام الإشعارات
 */
function addMissingFunctions() {
    // التأكد من وجود كائن نظام الإشعارات
    if (!window.notificationsSystem) {
        window.notificationsSystem = {};
    }
    
    // إضافة دالة الحصول على المستثمرين المستحقين للربح
    window.notificationsSystem.getDueInvestors = function() {
        try {
            // استخدام نسخة آمنة للحصول على المستثمرين
            const investors = safeGetInvestors();
            
            const dueInvestors = [];
            const today = new Date();
            const settings = window.settings || { profitCycle: 30, interestRate: 17.5 };
            
            investors.forEach(investor => {
                if (investor.status !== 'نشط' || !investor.investments || investor.investments.length === 0) {
                    return;
                }
                
                const totalInvestment = investor.amount || 0;
                if (totalInvestment <= 0) {
                    return;
                }
                
                // اختيار أقدم تاريخ استثمار
                const oldestInvestment = investor.investments.reduce((oldest, current) => {
                    if (!oldest) return current;
                    
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
                if (daysElapsed >= settings.profitCycle) {
                    // حساب الربح المستحق
                    let profit = 0;
                    
                    // التأكد من وجود استثمارات
                    if (investor.investments && Array.isArray(investor.investments)) {
                        profit = investor.investments.reduce((total, inv) => {
                            // استخدام دالة حساب الفائدة إذا كانت موجودة
                            if (typeof window.calculateInterest === 'function') {
                                return total + window.calculateInterest(inv.amount, inv.date);
                            }
                            
                            // حساب بسيط للفائدة إذا لم تكن الدالة موجودة
                            const rate = settings.interestRate / 100;
                            return total + (inv.amount * rate);
                        }, 0);
                    }
                    
                    // إضافة المستثمر إلى القائمة مع الربح المستحق
                    dueInvestors.push({
                        investor: investor,
                        profit: profit,
                        daysElapsed: daysElapsed,
                        dueDate: new Date(investmentDate.getTime() + (settings.profitCycle * 24 * 60 * 60 * 1000))
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
    
    console.log('تم إضافة الدوال المفقودة بنجاح');
}

/**
 * الحصول على قائمة المستثمرين بطريقة آمنة
 * @returns {Array} - قائمة المستثمرين
 */
function safeGetInvestors() {
    // التحقق من وجود مصفوفة المستثمرين في window
    if (window.investors && Array.isArray(window.investors)) {
        return window.investors;
    }
    
    // محاولة استرجاع البيانات من التخزين المحلي
    try {
        const savedInvestors = localStorage.getItem('investors');
        if (savedInvestors) {
            const parsedInvestors = JSON.parse(savedInvestors);
            if (Array.isArray(parsedInvestors)) {
                // تعيين المصفوفة في window للاستخدام مستقبلاً
                window.investors = parsedInvestors;
                return parsedInvestors;
            }
        }
    } catch (error) {
        console.error("خطأ في استرجاع المستثمرين من التخزين المحلي:", error);
    }
    
    // إذا لم يتم العثور على المستثمرين، إرجاع مصفوفة فارغة
    return [];
}

/**
 * إصلاح تعارضات تنسيق العملة
 */
function fixCurrencyFormatting() {
    // إصلاح مشكلة تكرار استدعاء دالة تنسيق العملة
    const safeFormatCurrency = function(amount, addCurrency = true) {
        // التحقق من صحة المبلغ
        if (amount === undefined || amount === null || isNaN(amount)) {
            return addCurrency ? "0 " + (window.settings?.currency || 'دينار') : "0";
        }
        
        // تنسيق المبلغ
        const formattedAmount = amount.toLocaleString();
        
        // إضافة العملة حسب الطلب
        if (addCurrency) {
            return formattedAmount + " " + (window.settings?.currency || 'دينار');
        } else {
            return formattedAmount;
        }
    };
    
    // تعديل دالة تنسيق العملة لمنع التكرار اللانهائي
    if (typeof window.formatCurrency === 'function') {
        // حفظ الدالة الأصلية
        window._originalFormatCurrency = window.formatCurrency;
        
        // استبدال الدالة بنسخة آمنة
        window.formatCurrency = function(amount, addCurrency = true) {
            // استخدام متغير للتأكد من عدم حدوث استدعاء متكرر
            if (window._isFormattingCurrency) {
                return safeFormatCurrency(amount, addCurrency);
            }
            
            window._isFormattingCurrency = true;
            
            try {
                // استدعاء الدالة الأصلية
                const result = safeFormatCurrency(amount, addCurrency);
                window._isFormattingCurrency = false;
                return result;
            } catch (error) {
                console.error('خطأ في تنسيق العملة:', error);
                window._isFormattingCurrency = false;
                return safeFormatCurrency(amount, addCurrency);
            }
        };
    } else {
        // تعيين دالة جديدة إذا لم تكن موجودة
        window.formatCurrency = safeFormatCurrency;
    }
    
    console.log('تم إصلاح دالة تنسيق العملة');
}

/**
 * إصلاح دالة التعرف على الصوت
 */
function fixSpeechRecognition() {
    // إضافة دالة مساعدة للتعرف على الصوت
    if (typeof window.addSpeechRecognitionHelpButton !== 'function') {
        window.addSpeechRecognitionHelpButton = function() {
            // التحقق من وجود العنصر مسبقاً
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
                showSpeechHelpModal();
            });
            
            // إضافة الزر للصفحة
            document.body.appendChild(helpButton);
            
            console.log('تم إضافة زر مساعدة التعرف على الصوت');
        };
    }
    
    // إضافة دالة عرض نافذة المساعدة
    if (typeof window.showSpeechHelpModal !== 'function') {
        window.showSpeechHelpModal = function() {
            // التأكد من وجود دالة عرض النافذة المنبثقة
            if (typeof window.showModal !== 'function') {
                console.error('دالة عرض النافذة المنبثقة غير متوفرة');
                return;
            }
            
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
            window.showModal('مساعدة الإدخال الصوتي', content);
        };
    }
    
    // إصلاح دالة إعداد التعرف على الصوت
    if (typeof window.setupSpeechRecognition === 'function') {
        // حفظ نسخة من الدالة الأصلية
        const originalSetupSpeechRecognition = window.setupSpeechRecognition;
        
        // استبدال الدالة بنسخة آمنة
        window.setupSpeechRecognition = function() {
            try {
                // تنفيذ الدالة الأصلية
                originalSetupSpeechRecognition.apply(this, arguments);
                
                // إضافة زر المساعدة
                window.addSpeechRecognitionHelpButton();
            } catch (error) {
                console.error('خطأ في إعداد التعرف على الصوت:', error);
                
                // تنفيذ نسخة مبسطة من إعداد التعرف على الصوت
                simplifiedSpeechRecognitionSetup();
            }
        };
    } else {
        // تعيين دالة بسيطة إذا لم تكن موجودة
        window.setupSpeechRecognition = function() {
            simplifiedSpeechRecognitionSetup();
        };
    }
    
    console.log('تم إصلاح دوال التعرف على الصوت');
}

/**
 * إعداد مبسط للتعرف على الصوت في حالة فشل الطريقة الأصلية
 */
function simplifiedSpeechRecognitionSetup() {
    console.log('استخدام إعداد مبسط للتعرف على الصوت');
    
    // التحقق من دعم المتصفح للتعرف على الصوت
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn('المتصفح لا يدعم ميزة التعرف على الصوت');
        return;
    }
    
    // إضافة أنماط CSS للتعرف على الصوت
    addSpeechRecognitionStyles();
    
    // إضافة زر المساعدة
    window.addSpeechRecognitionHelpButton();
    
    // البحث عن جميع أزرار المايكروفون في الصفحة
    const micButtons = document.querySelectorAll('.mic-btn');
    
    // إضافة مستمع حدث لكل زر
    micButtons.forEach(button => {
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
            startSimpleSpeechRecognition(button, inputField);
        });
    });
}

/**
 * بدء عملية التعرف على الصوت بطريقة بسيطة
 */
function startSimpleSpeechRecognition(button, inputField) {
    // الحصول على كائن التعرف على الصوت
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
 * تهيئة نظام الإشعارات بعد إتمام الإصلاحات
 */
function initNotificationsSystem() {
    console.log('تهيئة نظام الإشعارات بعد الإصلاحات...');
    
    // التحقق من وجود كائن نظام الإشعارات
    if (!window.notificationsSystem) {
        console.error('كائن نظام الإشعارات غير موجود!');
        return;
    }
    
    // تهيئة نظام الإشعارات
    if (typeof window.notificationsSystem.init === 'function') {
        try {
            window.notificationsSystem.init();
            console.log('تم تهيئة نظام الإشعارات بنجاح');
        } catch (error) {
            console.error('خطأ في تهيئة نظام الإشعارات:', error);
        }
    } else {
        console.error('دالة تهيئة نظام الإشعارات غير موجودة!');
    }
}

