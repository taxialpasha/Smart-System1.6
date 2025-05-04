/**
 * نظام الأقساط المتكامل - الإصدار المحدث 2.0
 * نظام متكامل لإدارة الأقساط للمستثمرين مع دعم تسديد الأقساط وتتبعها
 * والاستعلام عنها وتصديرها واستيرادها
 * 
 * تاريخ التحديث: أبريل 2025
 */

(function() {
    // الإصدار
    const VERSION = '2.0.0';
    
    // تهيئة متغيرات النظام
    let installments = []; // مصفوفة الأقساط النشطة
    let paidInstallments = []; // مصفوفة الأقساط المدفوعة
    let currentFilter = 'all'; // فلتر الأقساط الحالي
    let currentPage = 1; // رقم الصفحة الحالية
    let itemsPerPage = 10; // عدد العناصر في الصفحة الواحدة
    let searchQuery = ''; // نص البحث الحالي
    let isInitialized = false; // حالة تهيئة النظام
    
    // كائن لتخزين الإعدادات
    const settings = {
        enableNotifications: true,        // تفعيل الإشعارات
        enableWhatsAppNotifications: false, // تفعيل إشعارات الواتساب
        sendReminderDaysBefore: 3,        // إرسال تذكير قبل عدد الأيام المحدد
        defaultInterestRate: 4,           // نسبة الفائدة الافتراضية
        defaultMonthsCount: 12,           // عدد الأشهر الافتراضي
        autoSaveEnabled: true,            // حفظ تلقائي
        showCompletedInstallments: true,  // عرض الأقساط المكتملة
        showDeleteConfirmation: true,     // عرض تأكيد الحذف
        dateFormat: 'YYYY-MM-DD',         // تنسيق التاريخ
        currency: 'دينار',                // العملة
        enableDarkMode: false,            // تفعيل الوضع الداكن
        installmentColors: {              // ألوان الأقساط
            active: '#3b82f6',            // لون الأقساط النشطة
            completed: '#10b981',         // لون الأقساط المكتملة
            overdue: '#ef4444',           // لون الأقساط المتأخرة
            paid: '#10b981',              // لون الأقساط المدفوعة
        }
    };
    
    // ===========================
    // وظائف تحميل النظام وتهيئته
    // ===========================
    
    /**
 * تهيئة نظام الأقساط
 */
function initInstallmentSystem() {
    console.log(`تهيئة نظام الأقساط - الإصدار ${VERSION}`);
    
    if (isInitialized) {
        console.log('النظام مُهيأ بالفعل');
        return;
    }
    
    // تحميل بيانات النظام من التخزين المحلي
    loadInstallmentData();
    
    // تحميل إعدادات النظام
    loadSettings();
    
    // تطبيق الإعدادات
    applySettings();
    
    // إضافة العناصر إلى واجهة المستخدم
    createUIElements();
    
    // ضبط مستمعي الأحداث
    setupEventListeners();
    
    // التحقق من الأقساط المستحقة
    checkDueInstallments();
    
    // تحديث المؤشرات والإحصائيات
    updateDashboardStats();
    
    // تعيين فواصل زمنية للتحقق التلقائي
    setupAutomaticChecks();
    
    isInitialized = true;
    console.log('تم تهيئة نظام الأقساط بنجاح');
    
    // التحقق من بيانات الأقساط المدفوعة
    setTimeout(() => {
        checkAndMovePaidInstallments();
        renderPaidInstallmentsTable();
    }, 1000);
}
    
    /**
 * تحميل بيانات الأقساط من التخزين المحلي
 */
function loadInstallmentData() {
    try {
        // تحميل الأقساط النشطة
        const savedInstallments = localStorage.getItem('installments');
        if (savedInstallments) {
            installments = JSON.parse(savedInstallments);
            console.log(`تم تحميل ${installments.length} من سجلات الأقساط النشطة`);
        } else {
            installments = [];
            console.log('لم يتم العثور على بيانات الأقساط النشطة، تم إنشاء مصفوفة جديدة');
        }
        
        // تحميل الأقساط المدفوعة
        const savedPaidInstallments = localStorage.getItem('paidInstallments');
        if (savedPaidInstallments) {
            paidInstallments = JSON.parse(savedPaidInstallments);
            console.log(`تم تحميل ${paidInstallments.length} من سجلات الأقساط المدفوعة`);
        } else {
            paidInstallments = [];
            console.log('لم يتم العثور على بيانات الأقساط المدفوعة، تم إنشاء مصفوفة جديدة');
        }
        
        // فحص وتصحيح أي أقساط مكتملة موجودة في الأقساط النشطة
        checkAndMovePaidInstallments();
        
    } catch (error) {
        console.error('خطأ في تحميل بيانات الأقساط:', error);
        showSystemNotification('حدث خطأ أثناء تحميل بيانات الأقساط', 'error');
        
        installments = [];
        paidInstallments = [];
    }
}






/**
 * فحص ونقل الأقساط المكتملة
 */
function checkAndMovePaidInstallments() {
    // نسخة من مصفوفة الأقساط للتفادي مشاكل الحذف أثناء التكرار
    const installmentsToCheck = [...installments];
    
    // البحث عن الأقساط المكتملة في مصفوفة الأقساط النشطة
    const completedInstallments = installmentsToCheck.filter(
        inst => inst.status === 'completed' || 
               (inst.monthlyInstallments && inst.monthlyInstallments.every(monthly => monthly.isPaid))
    );
    
    if (completedInstallments.length > 0) {
        console.log(`تم العثور على ${completedInstallments.length} قسط مكتمل يجب نقله إلى الأقساط المدفوعة`);
        
        // نقل كل قسط مكتمل إلى مصفوفة الأقساط المدفوعة
        completedInstallments.forEach(installment => {
            // تحديث حالة القسط إذا لم تكن مكتملة
            if (installment.status !== 'completed') {
                installment.status = 'completed';
            }
            
            // إضافة تاريخ الاكتمال إذا لم يكن موجوداً
            if (!installment.completedDate) {
                // العثور على آخر تاريخ دفع كتاريخ اكتمال
                const lastPaidDate = findLastPaymentDate(installment);
                installment.completedDate = lastPaidDate;
            }
            
            // إزالة القسط من مصفوفة الأقساط النشطة
            const index = installments.findIndex(item => item.id === installment.id);
            if (index !== -1) {
                // نسخة عميقة من القسط
                const completedInstallmentCopy = JSON.parse(JSON.stringify(installment));
                
                // التحقق من عدم وجود القسط مسبقاً في مصفوفة الأقساط المدفوعة
                const existsInPaid = paidInstallments.some(paid => paid.id === completedInstallmentCopy.id);
                if (!existsInPaid) {
                    // إضافة القسط إلى مصفوفة الأقساط المدفوعة
                    paidInstallments.push(completedInstallmentCopy);
                    console.log(`تم نقل القسط المكتمل "${completedInstallmentCopy.title}" إلى مصفوفة الأقساط المدفوعة`);
                }
                
                // حذف القسط من مصفوفة الأقساط النشطة
                installments.splice(index, 1);
            }
        });
        
        // حفظ البيانات بعد النقل
        saveInstallmentData();
    }
}
    
    /**
     * إصلاح تواريخ الأقساط (تحويل النصوص إلى كائنات تاريخ)
     * @param {Array} installmentsArray - مصفوفة الأقساط للإصلاح
     * @return {Array} مصفوفة الأقساط بعد الإصلاح
     */
    function fixInstallmentDates(installmentsArray) {
        return installmentsArray.map(installment => {
            // نسخة جديدة من كائن القسط
            const fixedInstallment = { ...installment };
            
            // إصلاح تواريخ الأقساط الشهرية
            if (fixedInstallment.monthlyInstallments && Array.isArray(fixedInstallment.monthlyInstallments)) {
                fixedInstallment.monthlyInstallments = fixedInstallment.monthlyInstallments.map(monthly => {
                    return { ...monthly };
                });
            }
            
            return fixedInstallment;
        });
    }
    
    /**
     * تحميل إعدادات النظام من التخزين المحلي
     */
    function loadSettings() {
        try {
            const savedSettings = localStorage.getItem('installment_settings');
            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                
                // دمج الإعدادات المحفوظة مع الإعدادات الافتراضية
                Object.assign(settings, parsedSettings);
                
                console.log('تم تحميل إعدادات النظام بنجاح');
            } else {
                console.log('لم يتم العثور على إعدادات محفوظة، سيتم استخدام الإعدادات الافتراضية');
                
                // حفظ الإعدادات الافتراضية
                saveSettings();
            }
        } catch (error) {
            console.error('خطأ في تحميل إعدادات النظام:', error);
            showSystemNotification('حدث خطأ أثناء تحميل إعدادات النظام', 'error');
        }
    }
    
    /**
     * حفظ إعدادات النظام في التخزين المحلي
     */
    function saveSettings() {
        try {
            localStorage.setItem('installment_settings', JSON.stringify(settings));
            console.log('تم حفظ إعدادات النظام بنجاح');
            return true;
        } catch (error) {
            console.error('خطأ في حفظ إعدادات النظام:', error);
            showSystemNotification('حدث خطأ أثناء حفظ إعدادات النظام', 'error');
            return false;
        }
    }
    
    /**
     * تطبيق إعدادات النظام على واجهة المستخدم
     */
    function applySettings() {
        // تطبيق الوضع الداكن إذا كان مفعلاً
        if (settings.enableDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        // تحديث إعدادات النموذج
        const interestRateInput = document.getElementById('interest-rate');
        if (interestRateInput) {
            interestRateInput.value = settings.defaultInterestRate;
        }
        
        const monthsCountInput = document.getElementById('months-count');
        if (monthsCountInput) {
            monthsCountInput.value = settings.defaultMonthsCount;
        }
        
        console.log('تم تطبيق إعدادات النظام');
    }
    
    // ===========================
    // وظائف إدارة البيانات
    // ===========================
    
    /**
 * حفظ بيانات الأقساط في التخزين المحلي
 */
function saveInstallmentData() {
    try {
        // حفظ الأقساط النشطة
        localStorage.setItem('installments', JSON.stringify(installments));
        
        // حفظ الأقساط المدفوعة
        localStorage.setItem('paidInstallments', JSON.stringify(paidInstallments));
        
        console.log('تم حفظ بيانات الأقساط بنجاح');
        console.log(`- عدد الأقساط النشطة: ${installments.length}`);
        console.log(`- عدد الأقساط المدفوعة: ${paidInstallments.length}`);
        return true;
    } catch (error) {
        console.error('خطأ في حفظ بيانات الأقساط:', error);
        showSystemNotification('حدث خطأ أثناء حفظ بيانات الأقساط', 'error');
        return false;
    }
}
    
    /**
     * إضافة قسط جديد
     * @param {Object} newInstallment - كائن القسط الجديد
     * @return {boolean} نجاح العملية
     */
    function addInstallment(newInstallment) {
        // إضافة القسط إلى المصفوفة
        installments.push(newInstallment);
        
        // حفظ البيانات
        if (saveInstallmentData()) {
            // تحديث عرض الأقساط
            renderInstallmentsTable();
            
            // تحديث الإحصائيات
            updateDashboardStats();
            
            return true;
        }
        
        return false;
    }
    
    /**
     * تعديل قسط موجود
     * @param {string} installmentId - معرف القسط
     * @param {Object} updatedData - البيانات المحدثة
     * @return {boolean} نجاح العملية
     */
    function updateInstallment(installmentId, updatedData) {
        // البحث عن القسط
        const index = installments.findIndex(item => item.id === installmentId);
        
        if (index === -1) {
            console.error(`لم يتم العثور على القسط بالمعرف: ${installmentId}`);
            return false;
        }
        
        // تحديث بيانات القسط
        installments[index] = { ...installments[index], ...updatedData };
        
        // حفظ البيانات
        if (saveInstallmentData()) {
            // تحديث عرض الأقساط
            renderInstallmentsTable();
            
            // تحديث الإحصائيات
            updateDashboardStats();
            
            return true;
        }
        
        return false;
    }
    
    /**
     * حذف قسط
     * @param {string} installmentId - معرف القسط
     * @return {boolean} نجاح العملية
     */
    function deleteInstallment(installmentId) {
        // البحث عن القسط
        const index = installments.findIndex(item => item.id === installmentId);
        
        if (index === -1) {
            console.error(`لم يتم العثور على القسط بالمعرف: ${installmentId}`);
            return false;
        }
        
        // حذف القسط من المصفوفة
        installments.splice(index, 1);
        
        // حفظ البيانات
        if (saveInstallmentData()) {
            // تحديث عرض الأقساط
            renderInstallmentsTable();
            
            // تحديث الإحصائيات
            updateDashboardStats();
            
            return true;
        }
        
        return false;
    }
    
 /**
 * تسديد قسط شهري
 * @param {string} installmentId - معرف القسط
 * @param {number} monthlyIndex - فهرس القسط الشهري
 * @param {Object} paymentData - بيانات الدفع
 * @return {boolean} نجاح العملية
 */
function payInstallmentMonth(installmentId, monthlyIndex, paymentData) {
    // البحث عن القسط
    const installment = installments.find(item => item.id === installmentId);
    
    if (!installment) {
        console.error(`لم يتم العثور على القسط بالمعرف: ${installmentId}`);
        return false;
    }
    
    // التحقق من وجود القسط الشهري
    if (!installment.monthlyInstallments[monthlyIndex]) {
        console.error(`لم يتم العثور على القسط الشهري بالفهرس: ${monthlyIndex}`);
        return false;
    }
    
    // التحقق من أن القسط غير مدفوع
    if (installment.monthlyInstallments[monthlyIndex].isPaid) {
        console.error(`القسط الشهري مدفوع بالفعل`);
        return false;
    }
    
    // تحديث بيانات القسط الشهري
    installment.monthlyInstallments[monthlyIndex].isPaid = true;
    installment.monthlyInstallments[monthlyIndex].paidDate = paymentData.paidDate || new Date().toISOString().split('T')[0];
    installment.monthlyInstallments[monthlyIndex].paidAmount = installment.monthlyInstallments[monthlyIndex].amount;
    installment.monthlyInstallments[monthlyIndex].notes = paymentData.notes || '';
    installment.monthlyInstallments[monthlyIndex].paymentMethod = paymentData.paymentMethod || 'cash';
    
    // تحديث المبالغ المدفوعة والمتبقية في القسط
    installment.paidAmount += installment.monthlyInstallments[monthlyIndex].amount;
    installment.remainingAmount -= installment.monthlyInstallments[monthlyIndex].amount;
    
    // التحقق مما إذا تم دفع جميع الأقساط
    const allPaid = installment.monthlyInstallments.every(monthly => monthly.isPaid);
    
    // إذا كان نظام المعاملات موجوداً، إضافة معاملة جديدة
    addTransactionIfExists(installment, monthlyIndex);
    
    // إذا تم دفع جميع الأقساط، تغيير حالة القسط إلى مكتمل
    if (allPaid) {
        // تحديث حالة القسط
        installment.status = 'completed';
        installment.completedDate = new Date().toISOString().split('T')[0];
        
        // نقل القسط المكتمل إلى مصفوفة الأقساط المدفوعة
        moveCompletedInstallment(installment);
        
        // تحديث واجهة المستخدم
        showNotification('تم تسديد جميع أقساط "' + installment.title + '" بنجاح!', 'success');
    } else {
        // حفظ البيانات إذا لم يكتمل القسط بعد
        saveInstallmentData();
        
        // تحديث واجهة المستخدم
        renderInstallmentsTable();
        updateDashboardStats();
    }
    
    return true;
}
  /**
 * نقل قسط مكتمل إلى مصفوفة الأقساط المدفوعة
 * @param {Object} installment - كائن القسط المكتمل
 */
function moveCompletedInstallment(installment) {
    // تحديث حالة القسط
    installment.status = 'completed';
    
    // إضافة تاريخ الاكتمال إذا لم يكن موجوداً
    if (!installment.completedDate) {
        installment.completedDate = new Date().toISOString().split('T')[0];
    }
    
    // نسخة عميقة من القسط
    const completedInstallmentCopy = JSON.parse(JSON.stringify(installment));
    
    // إزالة القسط من مصفوفة الأقساط النشطة
    const index = installments.findIndex(item => item.id === installment.id);
    if (index !== -1) {
        installments.splice(index, 1);
    }
    
    // التحقق من عدم وجود القسط مسبقاً في مصفوفة الأقساط المدفوعة
    const existsInPaid = paidInstallments.some(paid => paid.id === completedInstallmentCopy.id);
    if (!existsInPaid) {
        // إضافة القسط إلى مصفوفة الأقساط المدفوعة
        paidInstallments.push(completedInstallmentCopy);
        console.log(`تم نقل القسط المكتمل "${completedInstallmentCopy.title}" إلى مصفوفة الأقساط المدفوعة`);
    } else {
        console.log(`القسط "${completedInstallmentCopy.title}" موجود بالفعل في مصفوفة الأقساط المدفوعة`);
    }
    
    // حفظ البيانات
    saveInstallmentData();
    
    // تحديث واجهة المستخدم
    renderInstallmentsTable();
    
    // تحديث صفحة الأقساط المدفوعة إن كانت معروضة
    const paidInstallmentsPage = document.getElementById('paid-installments-page');
    if (paidInstallmentsPage && paidInstallmentsPage.classList.contains('active')) {
        renderPaidInstallmentsTable();
    }
}

    
    /**
     * إضافة معاملة مالية إذا كان نظام المعاملات موجوداً
     * @param {Object} installment - كائن القسط
     * @param {number} monthlyIndex - فهرس القسط الشهري
     */
    function addTransactionIfExists(installment, monthlyIndex) {
        // التحقق من وجود دالة إضافة المعاملات
        if (typeof window.addTransaction === 'function') {
            const monthlyInstallment = installment.monthlyInstallments[monthlyIndex];
            const transactionTitle = `تسديد القسط رقم ${monthlyInstallment.installmentNumber} من ${installment.title}`;
            const transactionNotes = `تسديد القسط الشهري رقم ${monthlyInstallment.installmentNumber} من ${installment.title} بتاريخ ${monthlyInstallment.paidDate}`;
            
            // إضافة المعاملة
            window.addTransaction('دفع قسط', installment.investorId, monthlyInstallment.amount, transactionNotes);
            
            console.log(`تم إضافة معاملة مالية: ${transactionTitle}`);
        }
    }
    
    /**
     * استيراد بيانات أقساط من ملف
     * @param {Object} importData - البيانات المستوردة
     * @return {Object} نتيجة الاستيراد
     */
    function importInstallmentData(importData) {
        try {
            // التحقق من صحة البيانات
            if (!importData || !importData.active || !importData.paid ||
                !Array.isArray(importData.active) || !Array.isArray(importData.paid)) {
                return { success: false, message: 'صيغة البيانات غير صحيحة' };
            }
            
            // استيراد الأقساط النشطة
            const activeCount = importData.active.length;
            
            // استيراد الأقساط المدفوعة
            const paidCount = importData.paid.length;
            
            // تطبيق الاستيراد - يمكن تعديله حسب الحاجة (مثل الدمج مع البيانات الحالية)
            installments = fixInstallmentDates(importData.active);
            paidInstallments = fixInstallmentDates(importData.paid);
            
            // حفظ البيانات
            if (saveInstallmentData()) {
                // تحديث العرض
                renderInstallmentsTable();
                renderPaidInstallmentsTable();
                updateDashboardStats();
                
                console.log(`تم استيراد ${activeCount} قسط نشط و ${paidCount} قسط مدفوع`);
                
                return { 
                    success: true, 
                    message: `تم استيراد ${activeCount} قسط نشط و ${paidCount} قسط مدفوع بنجاح`,
                    activeCount,
                    paidCount
                };
            }
            
            return { success: false, message: 'حدث خطأ أثناء حفظ البيانات المستوردة' };
            
        } catch (error) {
            console.error('خطأ في استيراد بيانات الأقساط:', error);
            return { success: false, message: `حدث خطأ أثناء استيراد البيانات: ${error.message}` };
        }
    }
    
    /**
     * تصدير بيانات الأقساط
     * @return {Object} بيانات التصدير
     */
    function exportInstallmentData() {
        try {
            // إنشاء كائن البيانات للتصدير
            const exportData = {
                version: VERSION,
                exportDate: new Date().toISOString(),
                active: installments,
                paid: paidInstallments,
                settings: settings
            };
            
            console.log(`تم تجهيز بيانات التصدير: ${installments.length} قسط نشط و ${paidInstallments.length} قسط مدفوع`);
            
            return {
                success: true,
                data: exportData,
                fileName: `installments_export_${formatDate(new Date(), 'YYYY-MM-DD')}.json`
            };
        } catch (error) {
            console.error('خطأ في تصدير بيانات الأقساط:', error);
            return { success: false, message: `حدث خطأ أثناء تصدير البيانات: ${error.message}` };
        }
    }
    
    // ===========================
    // وظائف واجهة المستخدم
    // ===========================
    
    /**
     * إنشاء عناصر واجهة المستخدم
     */
    function createUIElements() {
        // إضافة شعار الأقساط للقائمة الجانبية
        createSidebarMenu();
        
        // إنشاء صفحة الأقساط الرئيسية
        createInstallmentPage();
        
        // إنشاء صفحة الأقساط المدفوعة
        createPaidInstallmentsPage();
        
        // إنشاء صفحة الإعدادات
        createSettingsPage();
        
        // إنشاء النوافذ المنبثقة
        createModals();
        
        // إضافة أنماط CSS
        addCustomStyles();
        
        console.log('تم إنشاء عناصر واجهة المستخدم بنجاح');
    }
    
    /**
     * إضافة قائمة الأقساط إلى الشريط الجانبي
     */
    function createSidebarMenu() {
        // حذف العناصر القديمة إن وجدت لمنع التكرار
        removeExistingMenuItems();
        
        const sidebar = document.querySelector('.sidebar .nav-list');
        if (!sidebar) {
            console.error('لم يتم العثور على القائمة الجانبية');
            return;
        }
        
        // إنشاء عنصر القائمة الرئيسي (الأقساط)
        const installmentsMenuItem = document.createElement('li');
        installmentsMenuItem.className = 'nav-item';
        installmentsMenuItem.innerHTML = `
            <a class="nav-link" data-page="installments" href="#">
                <div class="nav-icon">
                    <i class="fas fa-money-check-alt"></i>
                </div>
                <span>الأقساط النشطة</span>
            </a>
        `;
        
        // إنشاء عنصر قائمة الأقساط المدفوعة
        const paidInstallmentsMenuItem = document.createElement('li');
        paidInstallmentsMenuItem.className = 'nav-item';
        paidInstallmentsMenuItem.innerHTML = `
            <a class="nav-link" data-page="paid-installments" href="#">
                <div class="nav-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <span>الأقساط المدفوعة</span>
            </a>
        `;
        
        // إنشاء عنصر قائمة إعدادات الأقساط
        const settingsMenuItem = document.createElement('li');
        settingsMenuItem.className = 'nav-item';
        settingsMenuItem.innerHTML = `
            <a class="nav-link" data-page="installment-settings" href="#">
                <div class="nav-icon">
                    <i class="fas fa-cog"></i>
                </div>
                <span>إعدادات الأقساط</span>
            </a>
        `;
        
        // إضافة العناصر إلى القائمة
        // نضيفها قبل الإعدادات (قبل العنصر الأخير)
        const lastItem = sidebar.querySelector('.nav-item:nth-last-child(2)');
        if (lastItem) {
            sidebar.insertBefore(installmentsMenuItem, lastItem);
            sidebar.insertBefore(paidInstallmentsMenuItem, lastItem);
            sidebar.insertBefore(settingsMenuItem, lastItem);
        } else {
            sidebar.appendChild(installmentsMenuItem);
            sidebar.appendChild(paidInstallmentsMenuItem);
            sidebar.appendChild(settingsMenuItem);
        }
        
        // إضافة مستمعي الأحداث
        setupMenuEventListeners();
        
        console.log('تم إضافة عناصر قائمة الأقساط إلى الشريط الجانبي');
    }
    
    /**
     * حذف عناصر القائمة الموجودة مسبقاً لمنع التكرار
     */
    function removeExistingMenuItems() {
        // حذف عناصر قائمة الأقساط الموجودة
        const existingInstallmentLinks = document.querySelectorAll('.nav-link[data-page="installments"], .nav-link[data-page="paid-installments"], .nav-link[data-page="installment-settings"]');
        
        existingInstallmentLinks.forEach(link => {
            const menuItem = link.closest('.nav-item');
            if (menuItem) {
                menuItem.remove();
            }
        });
    }
    
    /**
     * إعداد مستمعي أحداث عناصر القائمة
     */
    function setupMenuEventListeners() {
        // مستمع حدث لصفحة الأقساط النشطة
        const installmentsLink = document.querySelector('.nav-link[data-page="installments"]');
        if (installmentsLink) {
            installmentsLink.addEventListener('click', function(e) {
                e.preventDefault();
                setActivePage('installments');
            });
        }
        
        // مستمع حدث لصفحة الأقساط المدفوعة
        const paidInstallmentsLink = document.querySelector('.nav-link[data-page="paid-installments"]');
        if (paidInstallmentsLink) {
            paidInstallmentsLink.addEventListener('click', function(e) {
                e.preventDefault();
                setActivePage('paid-installments');
            });
        }
        
        // مستمع حدث لصفحة الإعدادات
        const settingsLink = document.querySelector('.nav-link[data-page="installment-settings"]');
        if (settingsLink) {
            settingsLink.addEventListener('click', function(e) {
                e.preventDefault();
                setActivePage('installment-settings');
            });
        }
    }
    
    /**
     * تعيين الصفحة النشطة
     * @param {string} pageId - معرف الصفحة
     */
    function setActivePage(pageId) {
        console.log(`تعيين الصفحة النشطة: ${pageId}`);
        
        // إزالة الكلاس النشط من جميع الروابط
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // إضافة الكلاس النشط للرابط المحدد
        const selectedLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
        if (selectedLink) {
            selectedLink.classList.add('active');
        }
        
        // إخفاء جميع الصفحات
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // إظهار الصفحة المحددة
        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            
            // إجراءات خاصة لكل صفحة
            if (pageId === 'installments') {
                refreshInstallmentsPage();
            } else if (pageId === 'paid-installments') {
                refreshPaidInstallmentsPage();
            } else if (pageId === 'installment-settings') {
                refreshSettingsPage();
            }
        } else {
            console.error(`لم يتم العثور على الصفحة: ${pageId}`);
        }
    }
    
    /**
     * تحديث محتوى صفحة الأقساط النشطة
     */
    function refreshInstallmentsPage() {
        // تحديث جدول الأقساط
        renderInstallmentsTable();
        
        // تحديث الإحصائيات
        updateDashboardStats();
    }
    
  /**
 * تحديث محتوى صفحة الأقساط المدفوعة
 */
function refreshPaidInstallmentsPage() {
    console.log('تحديث صفحة الأقساط المدفوعة');
    
    // تحديث جدول الأقساط المدفوعة
    renderPaidInstallmentsTable();
    
    // تحديث إحصائيات الأقساط المدفوعة
    const paidDateFilter = document.getElementById('paid-date-filter')?.value || 'all';
    const searchQuery = document.getElementById('paid-installments-search')?.value || '';
    const filteredPaidInstallments = filterPaidInstallments(paidInstallments, paidDateFilter, searchQuery);
    updatePaidInstallmentsStats(filteredPaidInstallments);
    
    // عرض عدد الأقساط المدفوعة
    console.log(`عدد الأقساط المدفوعة: ${paidInstallments.length}`);
}

/**
 * فحص صحة بيانات الأقساط
 */
function validateInstallmentData() {
    console.log('فحص صحة بيانات الأقساط...');
    
    // فحص الأقساط المكتملة في مصفوفة الأقساط النشطة
    const completedInActive = installments.filter(inst => inst.status === 'completed');
    if (completedInActive.length > 0) {
        console.log(`وجدت ${completedInActive.length} قسط مكتمل في مصفوفة الأقساط النشطة، سيتم نقلها إلى الأقساط المدفوعة`);
        
        // نقل الأقساط المكتملة إلى مصفوفة الأقساط المدفوعة
        completedInActive.forEach(inst => {
            moveCompletedInstallment(inst);
        });
    }
    
    // فحص الأقساط المدفوعة
    console.log(`عدد الأقساط النشطة: ${installments.length}`);
    console.log(`عدد الأقساط المدفوعة: ${paidInstallments.length}`);
}




    /**
     * تحديث محتوى صفحة الإعدادات
     */
    function refreshSettingsPage() {
        // تحديث نموذج الإعدادات بالقيم الحالية
        updateSettingsForm();
    }

    /**
     * إنشاء صفحة الأقساط الرئيسية
     */
    function createInstallmentPage() {
        // التحقق من وجود الصفحة
        if (document.getElementById('installments-page')) {
            console.log('صفحة الأقساط موجودة بالفعل');
            return;
        }
        
        // إنشاء صفحة الأقساط
        const installmentsPage = document.createElement('div');
        installmentsPage.className = 'page';
        installmentsPage.id = 'installments-page';
        
        installmentsPage.innerHTML = `
            <div class="header">
                <button class="toggle-sidebar">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 class="page-title">الأقساط النشطة</h1>
                <div class="header-actions">
                    <div class="search-box">
                        <input class="search-input" id="installments-search" placeholder="بحث عن أقساط..." type="text" />
                        <i class="fas fa-search search-icon"></i>
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-primary" id="add-installment-btn">
                            <i class="fas fa-plus"></i>
                            <span>إضافة قسط جديد</span>
                        </button>
                        <button class="btn btn-success" id="pay-installment-btn">
                            <i class="fas fa-hand-holding-usd"></i>
                            <span>تسديد قسط</span>
                        </button>
                        <div class="dropdown">
                            <button class="btn btn-outline dropdown-toggle">
                                <i class="fas fa-cog"></i>
                                <span>الخيارات</span>
                            </button>
                            <div class="dropdown-menu">
                                <a href="#" class="dropdown-item" id="export-installments-btn">
                                    <i class="fas fa-file-export"></i>
                                    <span>تصدير الأقساط</span>
                                </a>
                                <a href="#" class="dropdown-item" id="import-installments-btn">
                                    <i class="fas fa-file-import"></i>
                                    <span>استيراد الأقساط</span>
                                </a>
                                <a href="#" class="dropdown-item" id="print-installments-btn">
                                    <i class="fas fa-print"></i>
                                    <span>طباعة</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-section">
                <div class="dashboard-cards">
                    <div class="card">
                        <div class="card-pattern">
                            <i class="fas fa-money-check-alt"></i>
                        </div>
                        <div class="card-header">
                            <div>
                                <div class="card-title">إجمالي الأقساط</div>
                                <div class="card-value" id="total-installments">0 دينار</div>
                            </div>
                            <div class="card-icon primary">
                                <i class="fas fa-money-check-alt"></i>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-pattern">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="card-header">
                            <div>
                                <div class="card-title">الأقساط المسددة</div>
                                <div class="card-value" id="paid-installments">0 دينار</div>
                            </div>
                            <div class="card-icon success">
                                <i class="fas fa-calendar-check"></i>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-pattern">
                            <i class="fas fa-money-bill-wave"></i>
                        </div>
                        <div class="card-header">
                            <div>
                                <div class="card-title">الأقساط المستحقة</div>
                                <div class="card-value" id="due-installments">0 دينار</div>
                            </div>
                            <div class="card-icon warning">
                                <i class="fas fa-money-bill-wave"></i>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-pattern">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="card-header">
                            <div>
                                <div class="card-title">الأقساط المتأخرة</div>
                                <div class="card-value" id="overdue-installments">0 دينار</div>
                            </div>
                            <div class="card-icon danger">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">قائمة الأقساط النشطة</h2>
                    <div class="section-actions">
                        <div class="btn-group filter-buttons">
                            <button class="btn btn-outline btn-sm active" data-filter="all">الكل</button>
                            <button class="btn btn-outline btn-sm" data-filter="due">مستحقة</button>
                            <button class="btn btn-outline btn-sm" data-filter="overdue">متأخرة</button>
                        </div>
                        <button class="btn btn-outline btn-sm" id="refresh-installments-btn" title="تحديث">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="table-responsive">
                    <table id="installments-table" class="data-table">
                        <thead>
                            <tr>
                                <th width="60">المعرف</th>
                                <th width="180">المستثمر</th>
                                <th>عنوان الأقساط</th>
                                <th width="120">المبلغ الكلي</th>
                                <th width="120">القسط الشهري</th>
                                <th width="100">المتبقية</th>
                                <th width="120">القسط القادم</th>
                                <th width="80">الحالة</th>
                                <th width="120">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- سيتم ملؤها ديناميكيًا -->
                        </tbody>
                    </table>
                </div>
                <div class="table-empty-placeholder" id="installments-empty">
                    <i class="fas fa-money-check-alt"></i>
                    <p>لا توجد أقساط نشطة</p>
                    <button class="btn btn-primary" id="add-first-installment-btn">
                        <i class="fas fa-plus"></i>
                        <span>إضافة قسط جديد</span>
                    </button>
                </div>
                <div class="pagination" id="installments-pagination">
                    <!-- سيتم ملؤها ديناميكيًا -->
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">الأقساط المستحقة قريبًا</h2>
                </div>
                <div class="upcoming-installments" id="upcoming-installments">
                    <!-- سيتم ملؤها ديناميكيًا -->
                </div>
            </div>
        `;
        
        // إضافة الصفحة إلى المحتوى الرئيسي
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(installmentsPage);
            console.log('تم إنشاء صفحة الأقساط النشطة بنجاح');
        } else {
            console.error('لم يتم العثور على المحتوى الرئيسي');
        }
    }
    
    /**
     * إنشاء صفحة الأقساط المدفوعة
     */
    function createPaidInstallmentsPage() {
        // التحقق من وجود الصفحة
        if (document.getElementById('paid-installments-page')) {
            console.log('صفحة الأقساط المدفوعة موجودة بالفعل');
            return;
        }
        
        // إنشاء صفحة الأقساط المدفوعة
        const paidInstallmentsPage = document.createElement('div');
        paidInstallmentsPage.className = 'page';
        paidInstallmentsPage.id = 'paid-installments-page';
        
        paidInstallmentsPage.innerHTML = `
            <div class="header">
                <button class="toggle-sidebar">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 class="page-title">الأقساط المدفوعة</h1>
                <div class="header-actions">
                    <div class="search-box">
                        <input class="search-input" id="paid-installments-search" placeholder="بحث في الأقساط المدفوعة..." type="text" />
                        <i class="fas fa-search search-icon"></i>
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-outline" id="export-paid-installments-btn">
                            <i class="fas fa-file-export"></i>
                            <span>تصدير</span>
                        </button>
                        <button class="btn btn-outline" id="print-paid-installments-btn">
                            <i class="fas fa-print"></i>
                            <span>طباعة</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">سجل الأقساط المدفوعة</h2>
                    <div class="section-actions">
                        <div class="date-filter">
                            <label>تصفية حسب التاريخ:</label>
                            <select id="paid-date-filter" class="form-select form-select-sm">
                                <option value="all">الكل</option>
                                <option value="this-month">هذا الشهر</option>
                                <option value="last-month">الشهر الماضي</option>
                                <option value="this-year">هذه السنة</option>
                                <option value="custom">مخصص</option>
                            </select>
                        </div>
                        <button class="btn btn-outline btn-sm" id="refresh-paid-installments-btn" title="تحديث">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="table-responsive">
                    <table id="paid-installments-table" class="data-table">
                        <thead>
                            <tr>
                                <th width="60">المعرف</th>
                                <th width="180">المستثمر</th>
                                <th>عنوان الأقساط</th>
                                <th width="120">المبلغ الكلي</th>
                                <th width="120">تاريخ البدء</th>
                                <th width="120">تاريخ الانتهاء</th>
                                <th width="80">المدة</th>
                                <th width="120">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- سيتم ملؤها ديناميكيًا -->
                        </tbody>
                    </table>
                </div>
                <div class="table-empty-placeholder" id="paid-installments-empty">
                    <i class="fas fa-check-circle"></i>
                    <p>لا توجد أقساط مدفوعة</p>
                </div>
                <div class="pagination" id="paid-installments-pagination">
                    <!-- سيتم ملؤها ديناميكيًا -->
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">إحصائيات الأقساط المدفوعة</h2>
                </div>
                <div class="cards-container">
                    <div class="card">
                        <div class="card-header">
                            <div>
                                <div class="card-title">إجمالي المبالغ المدفوعة</div>
                                <div class="card-value" id="total-paid-amount">0 دينار</div>
                            </div>
                            <div class="card-icon success">
                                <i class="fas fa-dollar-sign"></i>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <div>
                                <div class="card-title">عدد الأقساط المدفوعة</div>
                                <div class="card-value" id="paid-installments-count">0</div>
                            </div>
                            <div class="card-icon info">
                                <i class="fas fa-list-ol"></i>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <div>
                                <div class="card-title">متوسط مدة الأقساط</div>
                                <div class="card-value" id="average-installment-duration">0 شهر</div>
                            </div>
                            <div class="card-icon primary">
                                <i class="fas fa-calendar-alt"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // إضافة الصفحة إلى المحتوى الرئيسي
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(paidInstallmentsPage);
            console.log('تم إنشاء صفحة الأقساط المدفوعة بنجاح');
        } else {
            console.error('لم يتم العثور على المحتوى الرئيسي');
        }
    }
    
    /**
     * إنشاء صفحة إعدادات الأقساط
     */
    function createSettingsPage() {
        // التحقق من وجود الصفحة
        if (document.getElementById('installment-settings-page')) {
            console.log('صفحة إعدادات الأقساط موجودة بالفعل');
            return;
        }
        
        // إنشاء صفحة الإعدادات
        const settingsPage = document.createElement('div');
        settingsPage.className = 'page';
        settingsPage.id = 'installment-settings-page';
        
        settingsPage.innerHTML = `
            <div class="header">
                <button class="toggle-sidebar">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 class="page-title">إعدادات نظام الأقساط</h1>
                <div class="header-actions">
                    <div class="btn-group">
                        <button class="btn btn-primary" id="save-settings-btn">
                            <i class="fas fa-save"></i>
                            <span>حفظ الإعدادات</span>
                        </button>
                        <button class="btn btn-outline" id="reset-settings-btn">
                            <i class="fas fa-undo"></i>
                            <span>استعادة الافتراضي</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">الإعدادات العامة</h2>
                </div>
                <div class="settings-form">
                    <form id="installment-settings-form">
                        <div class="form-row">
                            <div class="form-group col-md-6">
                                <label class="form-label">العملة</label>
                                <input type="text" class="form-input" id="settings-currency" name="currency" placeholder="مثال: دينار">
                            </div>
                            <div class="form-group col-md-6">
                                <label class="form-label">تنسيق التاريخ</label>
                                <select class="form-select" id="settings-date-format" name="dateFormat">
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group col-md-6">
                                <label class="form-label">نسبة الفائدة الافتراضية (%)</label>
                                <input type="number" class="form-input" id="settings-interest-rate" name="defaultInterestRate" min="0" max="100" step="0.1">
                            </div>
                            <div class="form-group col-md-6">
                                <label class="form-label">عدد الأشهر الافتراضي</label>
                                <input type="number" class="form-input" id="settings-months-count" name="defaultMonthsCount" min="1" max="60">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group col-md-6">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="settings-enable-notifications" name="enableNotifications">
                                    <label class="form-check-label" for="settings-enable-notifications">تفعيل الإشعارات</label>
                                </div>
                            </div>
                            <div class="form-group col-md-6">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="settings-enable-whatsapp" name="enableWhatsAppNotifications">
                                    <label class="form-check-label" for="settings-enable-whatsapp">تفعيل إشعارات الواتساب</label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group col-md-6">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="settings-auto-save" name="autoSaveEnabled">
                                    <label class="form-check-label" for="settings-auto-save">حفظ تلقائي</label>
                                </div>
                            </div>
                            <div class="form-group col-md-6">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="settings-show-completed" name="showCompletedInstallments">
                                    <label class="form-check-label" for="settings-show-completed">عرض الأقساط المكتملة</label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group col-md-6">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="settings-show-delete-confirmation" name="showDeleteConfirmation">
                                    <label class="form-check-label" for="settings-show-delete-confirmation">عرض تأكيد الحذف</label>
                                </div>
                            </div>
                            <div class="form-group col-md-6">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="settings-enable-dark-mode" name="enableDarkMode">
                                    <label class="form-check-label" for="settings-enable-dark-mode">تفعيل الوضع الداكن</label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">إرسال تذكير قبل (أيام)</label>
                            <input type="number" class="form-input" id="settings-reminder-days" name="sendReminderDaysBefore" min="1" max="30">
                        </div>
                    </form>
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">الألوان والمظهر</h2>
                </div>
                <div class="settings-form">
                    <div class="form-row">
                        <div class="form-group col-md-3">
                            <label class="form-label">لون الأقساط النشطة</label>
                            <input type="color" class="form-color" id="settings-active-color" name="installmentColors.active">
                        </div>
                        <div class="form-group col-md-3">
                            <label class="form-label">لون الأقساط المكتملة</label>
                            <input type="color" class="form-color" id="settings-completed-color" name="installmentColors.completed">
                        </div>
                        <div class="form-group col-md-3">
                            <label class="form-label">لون الأقساط المتأخرة</label>
                            <input type="color" class="form-color" id="settings-overdue-color" name="installmentColors.overdue">
                        </div>
                        <div class="form-group col-md-3">
                            <label class="form-label">لون الأقساط المدفوعة</label>
                            <input type="color" class="form-color" id="settings-paid-color" name="installmentColors.paid">
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">النسخ الاحتياطي واستعادة البيانات</h2>
                </div>
                <div class="backup-section">
                    <div class="card">
                        <div class="card-body">
                            <h3>تصدير البيانات</h3>
                            <p>قم بتصدير جميع بيانات الأقساط والإعدادات لإنشاء نسخة احتياطية</p>
                            <button class="btn btn-primary" id="backup-data-btn">
                                <i class="fas fa-download"></i>
                                <span>تصدير جميع البيانات</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-body">
                            <h3>استيراد البيانات</h3>
                            <p>قم باستيراد نسخة احتياطية سابقة من بيانات الأقساط والإعدادات</p>
                            <div class="file-upload">
                                <input type="file" id="restore-data-file" accept=".json" class="form-file">
                                <button class="btn btn-warning" id="restore-data-btn">
                                    <i class="fas fa-upload"></i>
                                    <span>استيراد البيانات</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">معلومات النظام</h2>
                </div>
                <div class="system-info">
                    <div class="info-row">
                        <div class="info-label">إصدار النظام:</div>
                        <div class="info-value">${VERSION}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">عدد الأقساط النشطة:</div>
                        <div class="info-value" id="info-active-count">0</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">عدد الأقساط المدفوعة:</div>
                        <div class="info-value" id="info-paid-count">0</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">آخر تحديث للبيانات:</div>
                        <div class="info-value" id="info-last-update">-</div>
                    </div>
                </div>
            </div>
        `;
        
        // إضافة الصفحة إلى المحتوى الرئيسي
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(settingsPage);
            console.log('تم إنشاء صفحة إعدادات الأقساط بنجاح');
        } else {
            console.error('لم يتم العثور على المحتوى الرئيسي');
        }
    }
    
   /**
     * إنشاء النوافذ المنبثقة
     */
   function createModals() {
    // إنشاء نافذة إضافة قسط جديد
    createAddInstallmentModal();
    
    // إنشاء نافذة تسديد قسط
    createPayInstallmentModal();
    
    // إنشاء نافذة تفاصيل القسط
    createInstallmentDetailsModal();
    
    // إنشاء نافذة تفاصيل القسط المدفوع
    createPaidInstallmentDetailsModal();
    
    // إنشاء نافذة استيراد البيانات
    createImportDataModal();
    
    // إنشاء نافذة التأكيد العامة
    createConfirmationModal();
    
    console.log('تم إنشاء النوافذ المنبثقة بنجاح');
}

/**
 * إنشاء نافذة إضافة قسط جديد
 */
function createAddInstallmentModal() {
    // التحقق من وجود النافذة
    if (document.getElementById('add-installment-modal')) {
        console.log('نافذة إضافة قسط جديد موجودة بالفعل');
        return;
    }
    
    // إنشاء نافذة إضافة قسط جديد
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'add-installment-modal';
    
    modalOverlay.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title">إضافة قسط جديد</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <form id="add-installment-form" class="installment-form">
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label class="form-label">المستثمر</label>
                            <select class="form-select" id="installment-investor" required="">
                                <option value="">اختر المستثمر</option>
                                <!-- سيتم ملؤها ديناميكيًا -->
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label class="form-label">عنوان الأقساط</label>
                            <div class="input-group">
                                <input class="form-input" id="installment-title" required="" type="text" placeholder="مثال: سيارة هونداي 2023" />
                                <button class="btn btn-icon-sm mic-btn" data-input="installment-title" type="button">
                                    <i class="fas fa-microphone"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label class="form-label">المبلغ الأصلي</label>
                            <div class="input-group">
                                <input class="form-input" id="original-amount" required="" type="number" min="1" step="1000" />
                                <span class="input-addon currency-addon"></span>
                            </div>
                        </div>
                        
                        <div class="form-group col-md-6">
                            <label class="form-label">نسبة الفائدة (%)</label>
                            <div class="input-group">
                                <input class="form-input" id="interest-rate" required="" type="number" min="0" max="100" step="0.1" value="4" />
                                <span class="input-addon">%</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label class="form-label">عدد الأشهر</label>
                            <div class="input-group">
                                <input class="form-input" id="months-count" required="" type="number" min="1" max="60" value="12" />
                                <span class="input-addon">شهر</span>
                            </div>
                        </div>
                        
                        <div class="form-group col-md-6">
                            <label class="form-label">تاريخ بدء الأقساط</label>
                            <input class="form-input" id="start-date" required="" type="date" />
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <div class="card bg-light p-3">
                            <h4 class="summary-title">ملخص الأقساط</h4>
                            <div id="installment-summary" class="summary-content">
                                <div class="summary-row">
                                    <span class="summary-label">المبلغ الأصلي:</span>
                                    <span class="summary-value" id="summary-original">0</span>
                                </div>
                                <div class="summary-row">
                                    <span class="summary-label">قيمة الفوائد:</span>
                                    <span class="summary-value" id="summary-interest">0</span>
                                </div>
                                <div class="summary-row total-row">
                                    <span class="summary-label">إجمالي المبلغ:</span>
                                    <span class="summary-value" id="summary-total">0</span>
                                </div>
                                <div class="summary-row monthly-row">
                                    <span class="summary-label">القسط الشهري:</span>
                                    <span class="summary-value" id="summary-monthly">0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">ملاحظات</label>
                        <textarea class="form-input" id="installment-notes" rows="3"></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إلغاء</button>
                <button class="btn btn-primary" id="save-installment-btn">إضافة</button>
            </div>
        </div>
    `;
    
    // إضافة النافذة إلى الصفحة
    document.body.appendChild(modalOverlay);
    console.log('تم إنشاء نافذة إضافة قسط جديد بنجاح');
}

/**
 * إنشاء نافذة تسديد قسط
 */
function createPayInstallmentModal() {
    // التحقق من وجود النافذة
    if (document.getElementById('pay-installment-modal')) {
        console.log('نافذة تسديد قسط موجودة بالفعل');
        return;
    }
    
    // إنشاء نافذة تسديد قسط
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'pay-installment-modal';
    
    modalOverlay.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title">تسديد قسط</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <form id="pay-installment-form" class="installment-form">
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label class="form-label">المستثمر</label>
                            <select class="form-select" id="pay-investor" required="">
                                <option value="">اختر المستثمر</option>
                                <!-- سيتم ملؤها ديناميكيًا -->
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label class="form-label">الأقساط المتاحة</label>
                            <select class="form-select" id="available-installments" required="">
                                <option value="">اختر القسط</option>
                                <!-- سيتم ملؤها ديناميكيًا -->
                            </select>
                        </div>
                    </div>
                    
                    <div id="installment-payment-details" class="payment-details card bg-light p-3">
                        <!-- سيتم ملؤها ديناميكيًا -->
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label class="form-label">تاريخ التسديد</label>
                            <input class="form-input" id="payment-date" required="" type="date" />
                        </div>
                        
                        <div class="form-group col-md-6">
                            <label class="form-label">طريقة الدفع</label>
                            <select class="form-select" id="payment-method">
                                <option value="cash">نقدي</option>
                                <option value="bank">تحويل بنكي</option>
                                <option value="cheque">شيك</option>
                                <option value="other">أخرى</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">ملاحظات</label>
                        <textarea class="form-input" id="payment-notes" rows="3"></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إلغاء</button>
                <button class="btn btn-success" id="confirm-payment-btn">تسديد القسط</button>
            </div>
        </div>
    `;
    
    // إضافة النافذة إلى الصفحة
    document.body.appendChild(modalOverlay);
    console.log('تم إنشاء نافذة تسديد قسط بنجاح');
}

/**
 * إنشاء نافذة تفاصيل القسط
 */
function createInstallmentDetailsModal() {
    // التحقق من وجود النافذة
    if (document.getElementById('installment-details-modal')) {
        console.log('نافذة تفاصيل الأقساط موجودة بالفعل');
        return;
    }
    
    // إنشاء نافذة تفاصيل الأقساط
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'installment-details-modal';
    
    modalOverlay.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp modal-lg">
            <div class="modal-header">
                <h3 class="modal-title">تفاصيل الأقساط</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <div id="installment-details-content">
                    <!-- سيتم ملؤها ديناميكيًا -->
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إغلاق</button>
                <div class="btn-group">
                    <button class="btn btn-primary" id="edit-installment-btn">
                        <i class="fas fa-edit"></i>
                        <span>تعديل</span>
                    </button>
                    <button class="btn btn-success" id="pay-selected-installment-btn">
                        <i class="fas fa-hand-holding-usd"></i>
                        <span>تسديد قسط</span>
                    </button>
                    <button class="btn btn-warning" id="print-installment-details-btn">
                        <i class="fas fa-print"></i>
                        <span>طباعة</span>
                    </button>
                    <button class="btn btn-danger" id="delete-installment-btn">
                        <i class="fas fa-trash"></i>
                        <span>حذف</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // إضافة النافذة إلى الصفحة
    document.body.appendChild(modalOverlay);
    console.log('تم إنشاء نافذة تفاصيل الأقساط بنجاح');
}

/**
 * إنشاء نافذة تفاصيل القسط المدفوع
 */
function createPaidInstallmentDetailsModal() {
    // التحقق من وجود النافذة
    if (document.getElementById('paid-installment-details-modal')) {
        console.log('نافذة تفاصيل القسط المدفوع موجودة بالفعل');
        return;
    }
    
    // إنشاء نافذة تفاصيل القسط المدفوع
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'paid-installment-details-modal';
    
    modalOverlay.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp modal-lg">
            <div class="modal-header">
                <h3 class="modal-title">تفاصيل القسط المدفوع</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <div id="paid-installment-details-content">
                    <!-- سيتم ملؤها ديناميكيًا -->
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إغلاق</button>
                <div class="btn-group">
                    <button class="btn btn-warning" id="print-paid-installment-details-btn">
                        <i class="fas fa-print"></i>
                        <span>طباعة</span>
                    </button>
                    <button class="btn btn-info" id="export-paid-installment-details-btn">
                        <i class="fas fa-file-export"></i>
                        <span>تصدير</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // إضافة النافذة إلى الصفحة
    document.body.appendChild(modalOverlay);
    console.log('تم إنشاء نافذة تفاصيل القسط المدفوع بنجاح');
}

/**
 * إنشاء نافذة استيراد البيانات
 */
function createImportDataModal() {
    // التحقق من وجود النافذة
    if (document.getElementById('import-data-modal')) {
        console.log('نافذة استيراد البيانات موجودة بالفعل');
        return;
    }
    
    // إنشاء نافذة استيراد البيانات
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'import-data-modal';
    
    modalOverlay.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title">استيراد بيانات الأقساط</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <div class="import-instructions mb-3">
                    <h4 class="mb-2">تعليمات الاستيراد</h4>
                    <ul class="instructions-list">
                        <li>قم بتحديد ملف JSON يحتوي على بيانات الأقساط</li>
                        <li>يجب أن يكون الملف بتنسيق متوافق مع نظام الأقساط</li>
                        <li>سيتم استبدال البيانات الحالية بالبيانات المستوردة</li>
                        <li>يُنصح بإنشاء نسخة احتياطية قبل الاستيراد</li>
                    </ul>
                </div>
                
                <div class="file-upload">
                    <label for="import-file" class="file-label">
                        <i class="fas fa-file-upload"></i>
                        <span>اختر ملف البيانات</span>
                    </label>
                    <input type="file" id="import-file" class="file-input" accept=".json">
                    <div id="selected-file-name" class="selected-file"></div>
                </div>
                
                <div id="import-preview" class="import-preview mt-3 d-none">
                    <h4>معاينة البيانات</h4>
                    <div id="import-preview-content" class="mt-2">
                        <!-- سيتم ملؤها ديناميكيًا -->
                    </div>
                </div>
                
                <div id="import-error" class="alert alert-danger mt-3 d-none">
                    <!-- سيتم ملؤها ديناميكيًا -->
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إلغاء</button>
                <button class="btn btn-primary" id="confirm-import-btn" disabled>استيراد البيانات</button>
            </div>
        </div>
    `;
    
    // إضافة النافذة إلى الصفحة
    document.body.appendChild(modalOverlay);
    console.log('تم إنشاء نافذة استيراد البيانات بنجاح');
}

/**
 * إنشاء نافذة التأكيد العامة
 */
function createConfirmationModal() {
    // التحقق من وجود النافذة
    if (document.getElementById('confirmation-modal')) {
        console.log('نافذة التأكيد موجودة بالفعل');
        return;
    }
    
    // إنشاء نافذة التأكيد
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'confirmation-modal';
    
    modalOverlay.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp modal-sm">
            <div class="modal-header">
                <h3 class="modal-title" id="confirmation-title">تأكيد العملية</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <p id="confirmation-message">هل أنت متأكد من رغبتك في إتمام هذه العملية؟</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn" id="confirmation-cancel">إلغاء</button>
                <button class="btn btn-danger" id="confirmation-confirm">تأكيد</button>
            </div>
        </div>
    `;
    
    // إضافة النافذة إلى الصفحة
    document.body.appendChild(modalOverlay);
    console.log('تم إنشاء نافذة التأكيد بنجاح');
}

/**
 * إضافة أنماط CSS مخصصة
 */
function addCustomStyles() {
    // التحقق من وجود عنصر الأنماط
    if (document.getElementById('installment-system-styles')) {
        console.log('أنماط CSS موجودة بالفعل');
        return;
    }
    
    // إنشاء عنصر style جديد
    const styleElement = document.createElement('style');
    styleElement.id = 'installment-system-styles';
    
    // أنماط CSS المخصصة للنظام
    styleElement.textContent = `
        /* أنماط عامة لنظام الأقساط */
        .page {
            display: none;
            padding: 20px;
            min-height: calc(100vh - 60px);
            background-color: #f9fafb;
        }
        
        .page.active {
            display: block;
        }
        
        /* أنماط البطاقات */
        .dashboard-cards {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .card {
            flex: 1;
            min-width: 220px;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
            overflow: hidden;
            position: relative;
            transition: all 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .card-pattern {
            position: absolute;
            top: 0;
            right: 0;
            font-size: 60px;
            opacity: 0.05;
            transform: translate(10px, -20px);
        }
        
        .card-header {
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .card-title {
            font-size: 0.9rem;
            font-weight: 500;
            color: #6b7280;
            margin-bottom: 8px;
        }
        
        .card-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
        }
        
        .card-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            color: white;
        }
        
        .card-icon.primary {
            background-color: #3b82f6;
        }
        
        .card-icon.success {
            background-color: #10b981;
        }
        
        .card-icon.warning {
            background-color: #f59e0b;
        }
        
        .card-icon.danger {
            background-color: #ef4444;
        }
        
        .card-icon.info {
            background-color: #3b82f6;
        }
        
        /* أنماط الجدول */
        .table-responsive {
            overflow-x: auto;
            border-radius: 10px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
            background-color: white;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .data-table th,
        .data-table td {
            padding: 12px 15px;
            text-align: right;
            border-bottom: 1px solid #f1f5f9;
        }
        
        .data-table th {
            background-color: #f8fafc;
            font-weight: 600;
            color: #334155;
            white-space: nowrap;
        }
        
        .data-table tr:last-child td {
            border-bottom: none;
        }
        
        .data-table tr:hover td {
            background-color: #f8fafc;
        }
        
        .table-empty-placeholder {
            padding: 50px 20px;
            text-align: center;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
            display: none;
        }
        
        .table-empty-placeholder i {
            font-size: 3rem;
            color: #cbd5e1;
            margin-bottom: 15px;
        }
        
        .table-empty-placeholder p {
            color: #64748b;
            font-size: 1.1rem;
            margin-bottom: 20px;
        }
        
        /* أنماط عناصر القائمة */
        .section {
            margin-bottom: 30px;
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }
        
        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #f1f5f9;
        }
        
        .section-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #334155;
            margin: 0;
        }
        
        .section-actions {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        
        /* أنماط النوافذ المنبثقة */
        .modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .modal-overlay.active {
            display: flex;
        }
        
        .modal {
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            width: 100%;
            max-width: 600px;
            max-height: calc(100vh - 40px);
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        
        .modal-lg {
            max-width: 800px;
        }
        
        .modal-sm {
            max-width: 400px;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid #f1f5f9;
        }
        
        .modal-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #1f2937;
            margin: 0;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #64748b;
            cursor: pointer;
            line-height: 1;
        }
        
        .modal-body {
            padding: 20px;
            overflow-y: auto;
        }
        
        .modal-footer {
            padding: 15px 20px;
            border-top: 1px solid #f1f5f9;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        
        /* أنماط نموذج الإضافة */
        .installment-form .form-row {
            display: flex;
            flex-wrap: wrap;
            margin-left: -10px;
            margin-right: -10px;
            margin-bottom: 15px;
        }
        
        .installment-form .form-group {
            padding-left: 10px;
            padding-right: 10px;
            margin-bottom: 15px;
        }
        
        .installment-form .col-md-12 {
            width: 100%;
        }
        
        .installment-form .col-md-6 {
            width: 50%;
        }
        
        @media (max-width: 768px) {
            .installment-form .col-md-6 {
                width: 100%;
            }
        }
        
        .installment-form .form-label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: #4b5563;
        }
        
        .installment-form .form-input,
        .installment-form .form-select {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }
        
        .installment-form .form-input:focus,
            .installment-form .form-select:focus {
                border-color: #3b82f6;
                outline: none;
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
            }
            
            .input-group {
                display: flex;
                position: relative;
            }
            
            .input-addon {
                padding: 10px 12px;
                background-color: #f3f4f6;
                border: 1px solid #d1d5db;
                border-right: none;
                border-radius: 0 6px 6px 0;
                color: #6b7280;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
            }
            
            .currency-addon::after {
                content: attr(data-currency);
            }
            
            /* أنماط ملخص الأقساط */
            .summary-content {
                padding: 15px 0 5px;
            }
            
            .summary-title {
                font-size: 1.1rem;
                font-weight: 600;
                color: #334155;
                margin: 0 0 10px;
            }
            
            .summary-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px dashed #e2e8f0;
            }
            
            .summary-label {
                font-weight: 500;
                color: #4b5563;
            }
            
            .summary-value {
                font-weight: 600;
                color: #1f2937;
            }
            
            .total-row {
                border-bottom: 2px solid #e2e8f0;
                font-weight: bold;
            }
            
            .monthly-row {
                background-color: #f8fafc;
                padding: 10px;
                margin-top: 10px;
                border-radius: 6px;
                font-size: 1.1rem;
            }
            
            .monthly-row .summary-value {
                color: #3b82f6;
            }
            
            /* أنماط أزرار العمليات */
            .installment-actions {
                display: flex;
                justify-content: center;
                gap: 5px;
            }
            
            .installment-action-btn {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border: none;
                cursor: pointer;
                transition: all 0.3s ease;
                background-color: #f9fafb;
                color: #1f2937;
            }
            
            .installment-action-btn.view-installment {
                color: #3b82f6;
            }
            
            .installment-action-btn.edit-installment {
                color: #10b981;
            }
            
            .installment-action-btn.pay {
                color: #f59e0b;
            }
            
            .installment-action-btn.delete {
                color: #ef4444;
            }
            
            .installment-action-btn:hover {
                background-color: #f3f4f6;
                transform: scale(1.1);
            }
            
            /* أنماط صفحة الإعدادات */
            .settings-form {
                padding: 10px 0;
            }
            
            .form-check {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .form-check-input {
                margin-left: 10px;
                width: 16px;
                height: 16px;
            }
            
            .form-check-label {
                font-size: 0.95rem;
                color: #4b5563;
            }
            
            .form-color {
                width: 100%;
                height: 38px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                padding: 2px;
            }
            
            .backup-section {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
            }
            
            .card-body {
                padding: 20px;
            }
            
            .card-body h3 {
                font-size: 1.1rem;
                margin: 0 0 10px;
                color: #1f2937;
            }
            
            .card-body p {
                color: #6b7280;
                margin-bottom: 15px;
                font-size: 0.95rem;
            }
            
            .file-upload {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .file-label {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 20px;
                background-color: #f9fafb;
                border: 2px dashed #d1d5db;
                border-radius: 8px;
                cursor: pointer;
                width: 100%;
                transition: all 0.3s ease;
            }
            
            .file-label:hover {
                background-color: #f3f4f6;
                border-color: #9ca3af;
            }
            
            .file-label i {
                font-size: 2rem;
                color: #9ca3af;
                margin-bottom: 10px;
            }
            
            .file-input {
                display: none;
            }
            
            .selected-file {
                margin-top: 10px;
                font-size: 0.9rem;
                color: #4b5563;
            }
            
            /* أنماط معلومات النظام */
            .system-info {
                background-color: #f9fafb;
                border-radius: 8px;
                padding: 15px;
                margin-top: 10px;
            }
            
            .info-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .info-row:last-child {
                border-bottom: none;
            }
            
            .info-label {
                font-weight: 500;
                color: #4b5563;
            }
            
            .info-value {
                font-weight: 500;
                color: #1f2937;
            }
            
            /* أنماط شارة المستثمر */
            .investor-info {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .investor-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background-color: #3b82f6;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 1rem;
                text-transform: uppercase;
            }
            
            .investor-name {
                font-weight: 500;
                color: #1f2937;
            }
            
            /* أنماط الترقيم والأزرار */
            .badge {
                display: inline-block;
                padding: 0.25em 0.6em;
                font-size: 0.75rem;
                font-weight: 500;
                border-radius: 9999px;
                text-align: center;
                white-space: nowrap;
                vertical-align: middle;
            }
            
            .badge-primary {
                background-color: #3b82f6;
                color: white;
            }
            
            .badge-success {
                background-color: #10b981;
                color: white;
            }
            
            .badge-warning {
                background-color: #f59e0b;
                color: white;
            }
            
            .badge-danger {
                background-color: #ef4444;
                color: white;
            }
            
            .badge-info {
                background-color: #3b82f6;
                color: white;
            }
            
            /* أنماط صفحات التفاصيل */
            .installment-profile {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin-bottom: 20px;
                padding: 20px;
                background-color: #f9fafb;
                border-radius: 10px;
            }
            
            .investor-avatar.large {
                width: 60px;
                height: 60px;
                font-size: 1.5rem;
                margin-bottom: 15px;
            }
            
            .investor-fullname {
                font-size: 1.3rem;
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 10px;
                text-align: center;
            }
            
            .installment-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
            }
            
            .stat-item {
                text-align: center;
                background-color: #f9fafb;
                padding: 15px 10px;
                border-radius: 8px;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            }
            
            .stat-value {
                font-size: 1.2rem;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 5px;
            }
            
            .stat-label {
                font-size: 0.85rem;
                color: #6b7280;
            }
            
            .detail-group {
                margin-bottom: 25px;
            }
            
            .detail-group-title {
                font-size: 1.1rem;
                font-weight: 600;
                color: #334155;
                margin: 0 0 15px;
                padding-bottom: 8px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .detail-item {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px dashed #e5e7eb;
            }
            
            .detail-label {
                font-weight: 500;
                color: #4b5563;
            }
            
            .detail-value {
                font-weight: 500;
                color: #1f2937;
            }
            
            /* أنماط شريط التقدم */
            .progress {
                height: 12px;
                background-color: #e5e7eb;
                border-radius: 6px;
                overflow: hidden;
                margin: 10px 0;
            }
            
            .progress-bar {
                height: 100%;
                background-color: #10b981;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 0.7rem;
                transition: width 0.3s ease;
            }
            
            /* أنماط الأقساط القادمة */
            .upcoming-installments {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 15px;
                padding: 10px 0;
            }
            
            .upcoming-card {
                background-color: #f9fafb;
                border-radius: 8px;
                padding: 15px;
                border-left: 4px solid #3b82f6;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            }
            
            .upcoming-card.overdue {
                border-left-color: #ef4444;
            }
            
            .upcoming-card.today {
                border-left-color: #f59e0b;
            }
            
            .upcoming-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .upcoming-title {
                font-weight: 600;
                color: #1f2937;
                font-size: 1rem;
                margin: 0;
            }
            
            .upcoming-date {
                font-size: 0.85rem;
                color: #6b7280;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .upcoming-investor {
                font-size: 0.9rem;
                color: #4b5563;
                margin-bottom: 10px;
            }
            
            .upcoming-amount {
                font-weight: 600;
                color: #1f2937;
                font-size: 1.1rem;
                margin-bottom: 10px;
            }
            
            .upcoming-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .upcoming-status {
                font-size: 0.85rem;
            }
            
            /* أنماط التصفية والبحث */
            .filter-buttons .btn {
                min-width: 80px;
            }
            
            .date-filter {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .date-filter label {
                font-size: 0.9rem;
                color: #4b5563;
            }
            
            .form-select-sm {
                padding: 6px 10px;
                font-size: 0.9rem;
            }
            
            /* أنماط الصفحة الرقمية */
            .pagination {
                display: flex;
                justify-content: center;
                gap: 5px;
                margin-top: 20px;
            }
            
            .page-item {
                min-width: 36px;
                height: 36px;
                background-color: #fff;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 0.9rem;
                color: #4b5563;
                user-select: none;
            }
            
            .page-item:hover {
                background-color: #f3f4f6;
            }
            
            .page-item.active {
                background-color: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }
            
            .page-item.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            /* أنماط تفاصيل الأقساط الشهرية */
            .monthly-installments {
                margin-top: 15px;
            }
            
            .mini-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            
            .mini-table th,
            .mini-table td {
                padding: 8px 12px;
                border-bottom: 1px solid #e5e7eb;
                text-align: right;
                font-size: 0.9rem;
            }
            
            .mini-table th {
                background-color: #f3f4f6;
                font-weight: 600;
                color: #4b5563;
            }
            
            .mini-table tr:last-child td {
                border-bottom: none;
            }
            
            .mini-table tr:hover td {
                background-color: #f9fafb;
            }
            
            .bg-light-danger {
                background-color: rgba(239, 68, 68, 0.08);
            }
            
            .bg-light-success {
                background-color: rgba(16, 185, 129, 0.08);
            }
            
            .bg-light-warning {
                background-color: rgba(245, 158, 11, 0.08);
            }
            
            /* أنماط الوضع الداكن */
            body.dark-mode {
                background-color: #1f2937;
                color: #e5e7eb;
            }
            
            body.dark-mode .page {
                background-color: #111827;
            }
            
            body.dark-mode .section {
                background-color: #1f2937;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
            }
            
            body.dark-mode .section-header {
                border-bottom-color: #374151;
            }
            
            body.dark-mode .section-title {
                color: #e5e7eb;
            }
            
            body.dark-mode .card,
            body.dark-mode .table-responsive,
            body.dark-mode .table-empty-placeholder {
                background-color: #1f2937;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
            }
            
            body.dark-mode .card-title {
                color: #d1d5db;
            }
            
            body.dark-mode .card-value {
                color: #f3f4f6;
            }
            
            body.dark-mode .data-table th {
                background-color: #111827;
                color: #e5e7eb;
            }
            
            body.dark-mode .data-table td {
                border-bottom-color: #374151;
            }
            
            body.dark-mode .data-table tr:hover td {
                background-color: #282e38;
            }
            
            body.dark-mode .modal {
                background-color: #1f2937;
            }
            
            body.dark-mode .modal-header {
                border-bottom-color: #374151;
            }
            
            body.dark-mode .modal-footer {
                border-top-color: #374151;
            }
            
            body.dark-mode .modal-title {
                color: #f3f4f6;
            }
            
            body.dark-mode .form-label {
                color: #d1d5db;
            }
            
            body.dark-mode .form-input,
            body.dark-mode .form-select {
                background-color: #374151;
                border-color: #4b5563;
                color: #f3f4f6;
            }
            
            body.dark-mode .input-addon {
                background-color: #4b5563;
                border-color: #6b7280;
                color: #d1d5db;
            }
            
            body.dark-mode .summary-title {
                color: #f3f4f6;
            }
            
            body.dark-mode .summary-row {
                border-bottom-color: #374151;
            }
            
            body.dark-mode .summary-label {
                color: #d1d5db;
            }
            
            body.dark-mode .summary-value {
                color: #f3f4f6;
            }
            
            body.dark-mode .card.bg-light,
            body.dark-mode .installment-profile,
            body.dark-mode .stat-item,
            body.dark-mode .system-info,
            body.dark-mode .upcoming-card {
                background-color: #283241;
            }
            
            body.dark-mode .detail-group-title {
                border-bottom-color: #374151;
                color: #f3f4f6;
            }
            
            body.dark-mode .detail-item {
                border-bottom-color: #374151;
            }
            
            body.dark-mode .detail-label {
                color: #d1d5db;
            }
            
            body.dark-mode .detail-value {
                color: #f3f4f6;
            }
            
            body.dark-mode .progress {
                background-color: #374151;
            }
            
            body.dark-mode .form-check-label {
                color: #d1d5db;
            }
            
            body.dark-mode .file-label {
                background-color: #283241;
                border-color: #4b5563;
            }
            
            body.dark-mode .file-label:hover {
                background-color: #374151;
                border-color: #6b7280;
            }
            
            body.dark-mode .page-item {
                background-color: #283241;
                border-color: #4b5563;
                color: #d1d5db;
            }
            
            body.dark-mode .page-item:hover {
                background-color: #374151;
            }
            
            body.dark-mode .mini-table th {
                background-color: #111827;
                color: #e5e7eb;
            }
            
            body.dark-mode .mini-table td {
                border-bottom-color: #374151;
            }
            
            body.dark-mode .bg-light-danger {
                background-color: rgba(239, 68, 68, 0.15);
            }
            
            body.dark-mode .bg-light-success {
                background-color: rgba(16, 185, 129, 0.15);
            }
            
            body.dark-mode .bg-light-warning {
                background-color: rgba(245, 158, 11, 0.15);
            }
        `;
        
        // إضافة أنماط CSS إلى رأس الصفحة
        document.head.appendChild(styleElement);
        console.log('تم إضافة أنماط CSS المخصصة بنجاح');
    }
    
    // ===========================
    // وظائف عرض البيانات
    // ===========================
    
    /**
     * عرض جدول الأقساط النشطة
     */
    function renderInstallmentsTable() {
        console.log('عرض جدول الأقساط النشطة');
        
        const tableBody = document.querySelector('#installments-table tbody');
        const emptyPlaceholder = document.getElementById('installments-empty');
        
        if (!tableBody || !emptyPlaceholder) {
            console.error('لم يتم العثور على عناصر جدول الأقساط');
            return;
        }
        
        // تفريغ الجدول
        tableBody.innerHTML = '';
        
        // تطبيق البحث والتصفية
        const filteredInstallments = filterInstallments(installments, currentFilter, searchQuery);
        
        // إذا لم تكن هناك أقساط، إظهار رسالة فارغة
        if (filteredInstallments.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="9" class="text-center">لا توجد أقساط ${getFilterName(currentFilter)}</td></tr>`;
            
            // إظهار الشاشة الفارغة إذا لم تكن هناك أقساط على الإطلاق
            if (installments.length === 0) {
                emptyPlaceholder.style.display = 'flex';
            } else {
                emptyPlaceholder.style.display = 'none';
            }
            
            // تحديث الترقيم
            updatePagination('installments-pagination', [], currentPage, itemsPerPage);
            
            return;
        }
        
        // إخفاء الشاشة الفارغة
        emptyPlaceholder.style.display = 'none';
        
        // ترتيب الأقساط حسب التاريخ (الأحدث أولاً)
        const sortedInstallments = [...filteredInstallments].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        // حساب تقسيم الصفحات
        const paginatedInstallments = paginateItems(sortedInstallments, currentPage, itemsPerPage);
        
        // عرض الأقساط في الجدول
        paginatedInstallments.forEach(installment => {
            // تحديد عدد الأقساط المتبقية
            const remainingInstallments = installment.monthlyInstallments.filter(inst => !inst.isPaid).length;
            
            // تحديد تاريخ القسط القادم
            const nextInstallment = installment.monthlyInstallments.find(inst => !inst.isPaid);
            const nextDueDate = nextInstallment ? formatDate(nextInstallment.dueDate) : '-';
            
            // تحديد حالة القسط
            const { statusClass, statusText } = getInstallmentStatus(installment);
            
            // إنشاء صف في الجدول
            const row = document.createElement('tr');
            row.setAttribute('data-id', installment.id);
            
            row.innerHTML = `
                <td><span class="id-code">${installment.id.slice(-6)}</span></td>
                <td>
                    <div class="investor-info">
                        <div class="investor-avatar">${installment.investorName.charAt(0)}</div>
                        <div>
                            <div class="investor-name">${installment.investorName}</div>
                        </div>
                    </div>
                </td>
                <td>${installment.title}</td>
                <td>${formatCurrency(installment.totalAmount)}</td>
                <td>${formatCurrency(installment.monthlyInstallment)}</td>
                <td>${remainingInstallments} / ${installment.monthsCount}</td>
                <td>${nextDueDate !== '-' ? nextDueDate : '<span class="badge badge-success">مكتمل</span>'}</td>
                <td><span class="badge badge-${statusClass}">${statusText}</span></td>
                <td>
                    <div class="installment-actions">
                        <button class="installment-action-btn view-installment" data-id="${installment.id}" title="عرض التفاصيل">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${installment.status !== 'completed' ? `
                        <button class="installment-action-btn pay pay-installment" data-id="${installment.id}" title="تسديد قسط">
                            <i class="fas fa-hand-holding-usd"></i>
                        </button>
                        ` : ''}
                        <button class="installment-action-btn delete delete-installment" data-id="${installment.id}" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // إضافة مستمعي الأحداث للأزرار
        setupTableActionButtons();
        
        // تحديث الترقيم
        updatePagination('installments-pagination', sortedInstallments, currentPage, itemsPerPage);
        
        // تحديث الأقساط القادمة
        renderUpcomingInstallments();
    }
    
 /**
 * عرض جدول الأقساط المدفوعة
 */
function renderPaidInstallmentsTable() {
    console.log('عرض جدول الأقساط المدفوعة');
    console.log(`عدد الأقساط المدفوعة: ${paidInstallments.length}`);
    
    const tableBody = document.querySelector('#paid-installments-table tbody');
    const emptyPlaceholder = document.getElementById('paid-installments-empty');
    
    if (!tableBody || !emptyPlaceholder) {
        console.error('لم يتم العثور على عناصر جدول الأقساط المدفوعة');
        return;
    }
    
    // تفريغ الجدول
    tableBody.innerHTML = '';
    
    // التأكد من وجود أقساط مدفوعة بعد التحميل
    if (paidInstallments.length === 0) {
        checkAndMovePaidInstallments();
    }
    
    // تطبيق البحث
    const paidDateFilter = document.getElementById('paid-date-filter')?.value || 'all';
    const searchQuery = document.getElementById('paid-installments-search')?.value || '';
    const filteredInstallments = filterPaidInstallments(paidInstallments, paidDateFilter, searchQuery);
    
    console.log(`عدد الأقساط المدفوعة بعد التصفية: ${filteredInstallments.length}`);
    
    // إذا لم تكن هناك أقساط مدفوعة، إظهار رسالة فارغة
    if (filteredInstallments.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center">لا توجد أقساط مدفوعة</td></tr>`;
        
        // إظهار الشاشة الفارغة إذا لم تكن هناك أقساط على الإطلاق
        if (paidInstallments.length === 0) {
            emptyPlaceholder.style.display = 'flex';
        } else {
            emptyPlaceholder.style.display = 'none';
        }
        
        // تحديث الترقيم
        updatePagination('paid-installments-pagination', [], 1, itemsPerPage);
        
        // تحديث إحصائيات الأقساط المدفوعة
        updatePaidInstallmentsStats(filteredInstallments);
        
        return;
    }
    
    // إخفاء الشاشة الفارغة
    emptyPlaceholder.style.display = 'none';
    
    // ترتيب الأقساط حسب تاريخ الإنتهاء (الأحدث أولاً)
    const sortedInstallments = [...filteredInstallments].sort((a, b) => {
        return new Date(b.completedDate || b.createdAt) - new Date(a.completedDate || a.createdAt);
    });
    
    // حساب تقسيم الصفحات للأقساط المدفوعة
    const paginatedInstallments = paginateItems(sortedInstallments, 1, itemsPerPage);
    
    // عرض الأقساط المدفوعة في الجدول
    paginatedInstallments.forEach(installment => {
        // حساب مدة القسط (عدد الأشهر)
        const duration = installment.monthsCount;
        
        // تنسيق التواريخ
        const startDate = formatDate(installment.startDate);
        const completedDate = formatDate(installment.completedDate || findLastPaymentDate(installment));
        
        // إنشاء صف في الجدول
        const row = document.createElement('tr');
        row.setAttribute('data-id', installment.id);
        
        row.innerHTML = `
            <td><span class="id-code">${installment.id.slice(-6)}</span></td>
            <td>
                <div class="investor-info">
                    <div class="investor-avatar">${installment.investorName.charAt(0)}</div>
                    <div>
                        <div class="investor-name">${installment.investorName}</div>
                    </div>
                </div>
            </td>
            <td>${installment.title}</td>
            <td>${formatCurrency(installment.totalAmount)}</td>
            <td>${startDate}</td>
            <td>${completedDate}</td>
            <td>${duration} شهر</td>
            <td>
                <div class="installment-actions">
                    <button class="installment-action-btn view-paid-installment" data-id="${installment.id}" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="installment-action-btn print-installment" data-id="${installment.id}" title="طباعة">
                        <i class="fas fa-print"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // إضافة مستمعي الأحداث للأزرار
    setupPaidTableActionButtons();
    
    // تحديث الترقيم
    updatePagination('paid-installments-pagination', sortedInstallments, 1, itemsPerPage);
    
    // تحديث إحصائيات الأقساط المدفوعة
    updatePaidInstallmentsStats(filteredInstallments);
}
   
   /**
    * تحديث إحصائيات الأقساط المدفوعة
    * @param {Array} filteredInstallments - الأقساط المدفوعة المصفاة
    */
   function updatePaidInstallmentsStats(filteredInstallments) {
       // حساب إجمالي المبالغ المدفوعة
       const totalPaidAmount = filteredInstallments.reduce((sum, inst) => sum + inst.totalAmount, 0);
       
       // حساب عدد الأقساط المدفوعة
       const paidInstallmentsCount = filteredInstallments.length;
       
       // حساب متوسط مدة الأقساط
       const totalMonths = filteredInstallments.reduce((sum, inst) => sum + inst.monthsCount, 0);
       const averageDuration = paidInstallmentsCount > 0 ? (totalMonths / paidInstallmentsCount).toFixed(1) : 0;
       
       // تحديث العناصر
       document.getElementById('total-paid-amount').textContent = formatCurrency(totalPaidAmount);
       document.getElementById('paid-installments-count').textContent = paidInstallmentsCount;
       document.getElementById('average-installment-duration').textContent = `${averageDuration} شهر`;
   }
   
   /**
    * عرض الأقساط القادمة
    */
   function renderUpcomingInstallments() {
       const upcomingContainer = document.getElementById('upcoming-installments');
       
       if (!upcomingContainer) {
           console.error('لم يتم العثور على حاوية الأقساط القادمة');
           return;
       }
       
       // تفريغ الحاوية
       upcomingContainer.innerHTML = '';
       
       // الحصول على الأقساط القادمة
       const upcomingInstallments = getUpcomingInstallments();
       
       // إذا لم تكن هناك أقساط قادمة
       if (upcomingInstallments.length === 0) {
           upcomingContainer.innerHTML = `
               <div class="empty-state">
                   <p>لا توجد أقساط قادمة خلال الأيام القادمة</p>
               </div>
           `;
           return;
       }
       
       // عرض الأقساط القادمة (الحد الأقصى 6)
       upcomingInstallments.slice(0, 6).forEach(installment => {
           const cardClass = installment.isOverdue ? 'overdue' : (installment.isToday ? 'today' : '');
           const statusText = installment.isOverdue ? 'متأخر' : (installment.isToday ? 'اليوم' : `بعد ${installment.daysRemaining} يوم`);
           const statusClass = installment.isOverdue ? 'danger' : (installment.isToday ? 'warning' : 'primary');
           
           const upcomingCard = document.createElement('div');
           upcomingCard.className = `upcoming-card ${cardClass}`;
           upcomingCard.setAttribute('data-id', `${installment.installmentId}-${installment.monthlyIndex}`);
           
           upcomingCard.innerHTML = `
               <div class="upcoming-header">
                   <h4 class="upcoming-title">${installment.title}</h4>
                   <div class="upcoming-date">
                       <i class="fas fa-calendar-alt"></i>
                       <span>${formatDate(installment.dueDate)}</span>
                   </div>
               </div>
               <div class="upcoming-investor">
                   <i class="fas fa-user"></i>
                   <span>${installment.investorName}</span>
               </div>
               <div class="upcoming-amount">
                   ${formatCurrency(installment.amount)}
               </div>
               <div class="upcoming-footer">
                   <div class="upcoming-status">
                       <span class="badge badge-${statusClass}">${statusText}</span>
                   </div>
                   <button class="btn btn-sm btn-success pay-upcoming-btn" data-installment-id="${installment.installmentId}" data-monthly-index="${installment.monthlyIndex}">
                       <i class="fas fa-hand-holding-usd"></i>
                       <span>تسديد</span>
                   </button>
               </div>
           `;
           
           upcomingContainer.appendChild(upcomingCard);
       });
       
       // إضافة مستمعي الأحداث لأزرار الدفع
       document.querySelectorAll('.pay-upcoming-btn').forEach(button => {
           button.addEventListener('click', function() {
               const installmentId = this.getAttribute('data-installment-id');
               const monthlyIndex = parseInt(this.getAttribute('data-monthly-index'));
               
               openPayInstallmentModal(installmentId, monthlyIndex);
           });
       });
   }
   
   /**
    * تحديث إحصائيات لوحة المعلومات
    */
   function updateDashboardStats() {
       console.log('تحديث إحصائيات لوحة المعلومات');
       
       // حساب إجمالي الأقساط
       let totalInstallmentsAmount = 0;
       let paidInstallmentsAmount = 0;
       let dueInstallmentsAmount = 0;
       let overdueInstallmentsAmount = 0;
       
       const today = new Date();
       
       installments.forEach(installment => {
           totalInstallmentsAmount += installment.totalAmount;
           paidInstallmentsAmount += installment.paidAmount;
           
           // حساب الأقساط المستحقة والمتأخرة
           installment.monthlyInstallments.forEach(monthlyInst => {
               if (!monthlyInst.isPaid) {
                   const dueDate = new Date(monthlyInst.dueDate);
                   
                   if (dueDate < today) {
                       // قسط متأخر
                       overdueInstallmentsAmount += monthlyInst.amount;
                   } else {
                       // قسط مستحق
                       dueInstallmentsAmount += monthlyInst.amount;
                   }
               }
           });
       });
       
       // تحديث قيم الإحصائيات
       document.getElementById('total-installments').textContent = formatCurrency(totalInstallmentsAmount);
       document.getElementById('paid-installments').textContent = formatCurrency(paidInstallmentsAmount);
       document.getElementById('due-installments').textContent = formatCurrency(dueInstallmentsAmount);
       document.getElementById('overdue-installments').textContent = formatCurrency(overdueInstallmentsAmount);
       
       // تحديث معلومات النظام في صفحة الإعدادات
       updateSystemInfo();
   }
   
   /**
    * تحديث معلومات النظام في صفحة الإعدادات
    */
   function updateSystemInfo() {
       document.getElementById('info-active-count').textContent = installments.length;
       document.getElementById('info-paid-count').textContent = paidInstallments.length;
       document.getElementById('info-last-update').textContent = formatDate(new Date(), settings.dateFormat);
   }
   
   /**
    * تحديث ترقيم الصفحات
    * @param {string} containerId - معرف حاوية الترقيم
    * @param {Array} items - العناصر للتقسيم
    * @param {number} currentPage - الصفحة الحالية
    * @param {number} itemsPerPage - عدد العناصر في الصفحة
    */
   function updatePagination(containerId, items, currentPage, itemsPerPage) {
       const paginationContainer = document.getElementById(containerId);
       if (!paginationContainer) return;
       
       // حساب عدد الصفحات
       const totalPages = Math.ceil(items.length / itemsPerPage);
       
       // لا داعي للترقيم إذا كانت صفحة واحدة أو أقل
       if (totalPages <= 1) {
           paginationContainer.innerHTML = '';
           return;
       }
       
       // إنشاء عناصر الترقيم
       let paginationHTML = '';
       
       // زر الصفحة السابقة
       paginationHTML += `
           <div class="page-item ${currentPage === 1 ? 'disabled' : ''}" data-page="${currentPage - 1}">
               <i class="fas fa-chevron-right"></i>
           </div>
       `;
       
       // أرقام الصفحات
       const maxVisiblePages = 5; // عدد الصفحات المرئية في الترقيم
       let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
       let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
       
       // ضبط startPage إذا كان endPage قريبًا من الحد الأقصى
       if (endPage === totalPages) {
           startPage = Math.max(1, endPage - maxVisiblePages + 1);
       }
       
       // إضافة الصفحة الأولى
       if (startPage > 1) {
           paginationHTML += `<div class="page-item" data-page="1">1</div>`;
           if (startPage > 2) {
               paginationHTML += `<div class="page-item disabled">...</div>`;
           }
       }
       
       // إضافة أرقام الصفحات
       for (let i = startPage; i <= endPage; i++) {
           paginationHTML += `<div class="page-item ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</div>`;
       }
       
       // إضافة الصفحة الأخيرة
       if (endPage < totalPages) {
           if (endPage < totalPages - 1) {
               paginationHTML += `<div class="page-item disabled">...</div>`;
           }
           paginationHTML += `<div class="page-item" data-page="${totalPages}">${totalPages}</div>`;
       }
       
       // زر الصفحة التالية
       paginationHTML += `
           <div class="page-item ${currentPage === totalPages ? 'disabled' : ''}" data-page="${currentPage + 1}">
               <i class="fas fa-chevron-left"></i>
           </div>
       `;
       
       // تعيين HTML الترقيم
       paginationContainer.innerHTML = paginationHTML;
       
       // إضافة مستمعي الأحداث لأزرار الترقيم
       paginationContainer.querySelectorAll('.page-item:not(.disabled)').forEach(item => {
           item.addEventListener('click', function() {
               const page = parseInt(this.getAttribute('data-page'));
               currentPage = page;
               
               // تحديد جدول الأقساط المناسب للتحديث
               if (containerId === 'installments-pagination') {
                   renderInstallmentsTable();
               } else if (containerId === 'paid-installments-pagination') {
                   renderPaidInstallmentsTable();
               }
           });
       });
   }
   
   /**
    * تقسيم العناصر إلى صفحات
    * @param {Array} items - العناصر للتقسيم
    * @param {number} page - رقم الصفحة
    * @param {number} itemsPerPage - عدد العناصر في الصفحة
    * @returns {Array} - العناصر في الصفحة المحددة
    */
   function paginateItems(items, page, itemsPerPage) {
       const startIndex = (page - 1) * itemsPerPage;
       const endIndex = startIndex + itemsPerPage;
       return items.slice(startIndex, endIndex);
   }
   
   /**
    * عرض تفاصيل القسط
    * @param {string} installmentId - معرف القسط
    */
   function showInstallmentDetails(installmentId) {
       console.log(`عرض تفاصيل القسط: ${installmentId}`);
       
       // العثور على القسط
       const installment = installments.find(inst => inst.id === installmentId);
       if (!installment) {
           showNotification('لم يتم العثور على القسط', 'error');
           return;
       }
       
       // العثور على المستثمر
       const investor = findInvestor(installment.investorId);
       
       // تحديث محتوى النافذة
       const detailsContent = document.getElementById('installment-details-content');
       if (!detailsContent) return;
       
       // تحديد حالة القسط وأيقونته
       const { statusClass, statusText } = getInstallmentStatus(installment);
       
       detailsContent.innerHTML = `
           <div class="installment-profile">
               <div class="investor-avatar large">${investor ? investor.name.charAt(0) : 'غ'}</div>
               <h2 class="investor-fullname">${installment.title}</h2>
               <span class="badge badge-${statusClass}">${statusText}</span>
           </div>
           
           <div class="installment-stats">
               <div class="stat-item">
                   <div class="stat-value">${formatCurrency(installment.originalAmount)}</div>
                   <div class="stat-label">المبلغ الأصلي</div>
               </div>
               <div class="stat-item">
                   <div class="stat-value">${formatCurrency(installment.interestValue)}</div>
                   <div class="stat-label">قيمة الفائدة</div>
               </div>
               <div class="stat-item">
                   <div class="stat-value">${formatCurrency(installment.totalAmount)}</div>
                   <div class="stat-label">إجمالي المبلغ</div>
               </div>
               <div class="stat-item">
                   <div class="stat-value">${formatCurrency(installment.monthlyInstallment)}</div>
                   <div class="stat-label">القسط الشهري</div>
               </div>
           </div>
           
           <div class="detail-group">
               <h3 class="detail-group-title">معلومات القسط</h3>
               <div class="detail-item">
                   <div class="detail-label">المستثمر</div>
                   <div class="detail-value">${investor ? investor.name : 'غير معروف'}</div>
               </div>
               <div class="detail-item">
                   <div class="detail-label">تاريخ البدء</div>
                   <div class="detail-value">${formatDate(installment.startDate)}</div>
               </div>
               <div class="detail-item">
                   <div class="detail-label">عدد الأشهر</div>
                   <div class="detail-value">${installment.monthsCount} شهر</div>
               </div>
               <div class="detail-item">
                   <div class="detail-label">نسبة الفائدة</div>
                   <div class="detail-value">${installment.interestRate}%</div>
               </div>
               ${installment.notes ? `
               <div class="detail-item">
                   <div class="detail-label">ملاحظات</div>
                   <div class="detail-value">${installment.notes}</div>
               </div>
               ` : ''}
           </div>
           
           <div class="detail-group">
               <h3 class="detail-group-title">الأقساط الشهرية</h3>
               <div class="progress mb-3">
                   <div class="progress-bar" style="width: ${Math.round((installment.paidAmount / installment.totalAmount) * 100)}%">
                       ${Math.round((installment.paidAmount / installment.totalAmount) * 100)}%
                   </div>
               </div>
               <div class="table-responsive">
                   <table class="mini-table">
                       <thead>
                           <tr>
                               <th>رقم القسط</th>
                               <th>تاريخ الاستحقاق</th>
                               <th>المبلغ</th>
                               <th>الحالة</th>
                               <th>تاريخ التسديد</th>
                               <th>الإجراءات</th>
                           </tr>
                       </thead>
                       <tbody>
                           ${installment.monthlyInstallments.map((inst, index) => {
                               const isPaid = inst.isPaid;
                               const dueDate = new Date(inst.dueDate);
                               const today = new Date();
                               today.setHours(0, 0, 0, 0); // تعيين الوقت إلى بداية اليوم
                               const isOverdue = !isPaid && dueDate < today;
                               const isToday = !isPaid && dueDate.toDateString() === today.toDateString();
                               
                               let statusClass = isPaid ? 'success' : 'primary';
                               let statusText = isPaid ? 'مدفوع' : 'مستحق';
                               
                               if (isOverdue) {
                                   statusClass = 'danger';
                                   statusText = 'متأخر';
                               } else if (isToday) {
                                   statusClass = 'warning';
                                   statusText = 'اليوم';
                               }
                               
                               const rowClass = isOverdue ? 'bg-light-danger' : (isPaid ? 'bg-light-success' : (isToday ? 'bg-light-warning' : ''));
                               
                               return `
                                   <tr class="${rowClass}">
                                       <td>${inst.installmentNumber}</td>
                                       <td>${formatDate(inst.dueDate)}</td>
                                       <td>${formatCurrency(inst.amount)}</td>
                                       <td><span class="badge badge-${statusClass}">${statusText}</span></td>
                                       <td>${isPaid ? formatDate(inst.paidDate) : '-'}</td>
                                       <td>
                                           ${!isPaid ? `
                                           <button class="btn btn-sm btn-success pay-monthly-installment-btn" data-id="${installment.id}" data-index="${index}">
                                               <i class="fas fa-hand-holding-usd"></i>
                                           </button>
                                           ` : ''}
                                       </td>
                                   </tr>
                               `;
                           }).join('')}
                       </tbody>
                   </table>
               </div>
           </div>
           
           <div class="installment-summary mt-3">
               <div class="summary-item">
                   <div class="summary-label">المبلغ المدفوع:</div>
                   <div class="summary-value">${formatCurrency(installment.paidAmount)}</div>
               </div>
               <div class="summary-item">
                   <div class="summary-label">المبلغ المتبقي:</div>
                   <div class="summary-value">${formatCurrency(installment.remainingAmount)}</div>
               </div>
           </div>
       `;
       
       // إضافة مستمعي الأحداث لأزرار دفع الأقساط الشهرية
       setupMonthlyPaymentButtons();
       
       // إعداد أزرار التحكم في نافذة التفاصيل
       setupDetailsActionButtons(installment);
       
       // فتح نافذة التفاصيل
       openModal('installment-details-modal');
   }
   
   /**
    * إعداد أزرار دفع الأقساط الشهرية
    */
   function setupMonthlyPaymentButtons() {
       const payButtons = document.querySelectorAll('.pay-monthly-installment-btn');
       payButtons.forEach(button => {
           button.addEventListener('click', function() {
               const instId = this.getAttribute('data-id');
               const instIndex = parseInt(this.getAttribute('data-index'));
               
               openPayInstallmentModal(instId, instIndex);
           });
       });
   }
   
   /**
    * إعداد أزرار التحكم في نافذة التفاصيل
    * @param {Object} installment - كائن القسط
    */
   function setupDetailsActionButtons(installment) {
       // زر التعديل
       const editBtn = document.getElementById('edit-installment-btn');
       if (editBtn) {
           editBtn.setAttribute('data-id', installment.id);
           editBtn.addEventListener('click', function() {
               const instId = this.getAttribute('data-id');
               editInstallment(instId);
           });
       }
       
       // زر تسديد قسط
       const payBtn = document.getElementById('pay-selected-installment-btn');
       if (payBtn) {
           payBtn.setAttribute('data-id', installment.id);
           payBtn.addEventListener('click', function() {
               const instId = this.getAttribute('data-id');
               openPayInstallmentModalForNext(instId);
           });
           
           // تعطيل زر التسديد إذا كانت جميع الأقساط مدفوعة
           const allPaid = installment.monthlyInstallments.every(inst => inst.isPaid);
           payBtn.disabled = allPaid;
       }
       
       // زر الطباعة
       const printBtn = document.getElementById('print-installment-details-btn');
       if (printBtn) {
           printBtn.setAttribute('data-id', installment.id);
           printBtn.addEventListener('click', function() {
               const instId = this.getAttribute('data-id');
               printInstallmentDetails(instId);
           });
       }
       
       // زر الحذف
       const deleteBtn = document.getElementById('delete-installment-btn');
       if (deleteBtn) {
           deleteBtn.setAttribute('data-id', installment.id);
           deleteBtn.addEventListener('click', function() {
               const instId = this.getAttribute('data-id');
               confirmDeleteInstallment(instId);
           });
       }
   }
   
   /**
    * عرض تفاصيل القسط المدفوع
    * @param {string} installmentId - معرف القسط
    */
   function showPaidInstallmentDetails(installmentId) {
       console.log(`عرض تفاصيل القسط المدفوع: ${installmentId}`);
       
       // العثور على القسط المدفوع
       const installment = paidInstallments.find(inst => inst.id === installmentId);
       if (!installment) {
           showNotification('لم يتم العثور على القسط المدفوع', 'error');
           return;
       }
       
       // العثور على المستثمر
       const investor = findInvestor(installment.investorId);
       
       // تحديث محتوى النافذة
       const detailsContent = document.getElementById('paid-installment-details-content');
       if (!detailsContent) return;
       
       const startDate = formatDate(installment.startDate);
       const completedDate = formatDate(installment.completedDate || findLastPaymentDate(installment));
       
       detailsContent.innerHTML = `
           <div class="installment-profile">
               <div class="investor-avatar large">${investor ? investor.name.charAt(0) : 'غ'}</div>
               <h2 class="investor-fullname">${installment.title}</h2>
               <span class="badge badge-success">مكتمل</span>
           </div>
           
           <div class="installment-stats">
               <div class="stat-item">
                   <div class="stat-value">${formatCurrency(installment.originalAmount)}</div>
                   <div class="stat-label">المبلغ الأصلي</div>
               </div>
               <div class="stat-item">
                   <div class="stat-value">${formatCurrency(installment.interestValue)}</div>
                   <div class="stat-label">قيمة الفائدة</div>
               </div>
               <div class="stat-item">
                   <div class="stat-value">${formatCurrency(installment.totalAmount)}</div>
                   <div class="stat-label">إجمالي المبلغ</div>
               </div>
               <div class="stat-item">
                   <div class="stat-value">${formatCurrency(installment.monthlyInstallment)}</div>
                   <div class="stat-label">القسط الشهري</div>
               </div>
           </div>
           
           <div class="detail-group">
               <h3 class="detail-group-title">معلومات القسط</h3>
               <div class="detail-item">
                   <div class="detail-label">المستثمر</div>
                   <div class="detail-value">${investor ? investor.name : 'غير معروف'}</div>
               </div>
               <div class="detail-item">
                   <div class="detail-label">تاريخ البدء</div>
                   <div class="detail-value">${startDate}</div>
               </div>
               <div class="detail-item">
                   <div class="detail-label">تاريخ الانتهاء</div>
                   <div class="detail-value">${completedDate}</div>
               </div>
               <div class="detail-item">
                   <div class="detail-label">عدد الأشهر</div>
                   <div class="detail-value">${installment.monthsCount} شهر</div>
               </div>
               <div class="detail-item">
                   <div class="detail-label">نسبة الفائدة</div>
                   <div class="detail-value">${installment.interestRate}%</div>
               </div>
               ${installment.notes ? `
               <div class="detail-item">
                   <div class="detail-label">ملاحظات</div>
                   <div class="detail-value">${installment.notes}</div>
               </div>
               ` : ''}
           </div>
           
           <div class="detail-group">
               <h3 class="detail-group-title">الأقساط المدفوعة</h3>
               <div class="progress mb-3">
                   <div class="progress-bar" style="width: 100%">
                       100%
                   </div>
               </div>
               <div class="table-responsive">
                   <table class="mini-table">
                       <thead>
                           <tr>
                               <th>رقم القسط</th>
                               <th>تاريخ الاستحقاق</th>
                               <th>المبلغ</th>
                               <th>تاريخ التسديد</th>
                               <th>ملاحظات</th>
                           </tr>
                       </thead>
                       <tbody>
                           ${installment.monthlyInstallments.map(inst => `
                               <tr class="bg-light-success">
                                   <td>${inst.installmentNumber}</td>
                                   <td>${formatDate(inst.dueDate)}</td>
                                   <td>${formatCurrency(inst.amount)}</td>
                                   <td>${formatDate(inst.paidDate)}</td>
                                   <td>${inst.notes || '-'}</td>
                               </tr>
                           `).join('')}
                       </tbody>
                   </table>
               </div>
           </div>
           
           <div class="installment-summary mt-3">
               <div class="summary-item">
                   <div class="summary-label">إجمالي المبلغ المدفوع:</div>
                   <div class="summary-value">${formatCurrency(installment.totalAmount)}</div>
               </div>
           <div class="summary-item">
                    <div class="summary-label">إجمالي المبلغ المدفوع:</div>
                    <div class="summary-value">${formatCurrency(installment.totalAmount)}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">مدة التسديد:</div>
                    <div class="summary-value">${calculatePaymentDuration(installment)} يوم</div>
                </div>
            </div>
        `;
        
        // إعداد أزرار التحكم في نافذة التفاصيل
        setupPaidDetailsActionButtons(installment);
        
        // فتح نافذة التفاصيل
        openModal('paid-installment-details-modal');
    }
    
    /**
     * إعداد أزرار التحكم في نافذة تفاصيل القسط المدفوع
     * @param {Object} installment - كائن القسط المدفوع
     */
    function setupPaidDetailsActionButtons(installment) {
        // زر الطباعة
        const printBtn = document.getElementById('print-paid-installment-details-btn');
        if (printBtn) {
            printBtn.setAttribute('data-id', installment.id);
            printBtn.addEventListener('click', function() {
                const instId = this.getAttribute('data-id');
                printPaidInstallmentDetails(instId);
            });
        }
        
        // زر التصدير
        const exportBtn = document.getElementById('export-paid-installment-details-btn');
        if (exportBtn) {
            exportBtn.setAttribute('data-id', installment.id);
            exportBtn.addEventListener('click', function() {
                const instId = this.getAttribute('data-id');
                exportPaidInstallmentDetails(instId);
            });
        }
    }
    
    /**
     * حساب مدة تسديد القسط بالأيام
     * @param {Object} installment - كائن القسط المدفوع
     * @returns {number} - مدة التسديد بالأيام
     */
    function calculatePaymentDuration(installment) {
        const startDate = new Date(installment.startDate);
        const completedDate = new Date(installment.completedDate || findLastPaymentDate(installment));
        
        // حساب الفرق بالمللي ثانية ثم تحويله إلى أيام
        const diffTime = Math.abs(completedDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }
    
    /**
     * العثور على تاريخ آخر دفعة في القسط
     * @param {Object} installment - كائن القسط
     * @returns {string} - تاريخ آخر دفعة
     */
    function findLastPaymentDate(installment) {
        if (!installment.monthlyInstallments || installment.monthlyInstallments.length === 0) {
            return installment.createdAt;
        }
        
        // ترتيب الأقساط الشهرية حسب تاريخ الدفع (تنازليًا)
        const sortedInstallments = [...installment.monthlyInstallments]
            .filter(inst => inst.isPaid && inst.paidDate)
            .sort((a, b) => new Date(b.paidDate) - new Date(a.paidDate));
        
        return sortedInstallments.length > 0 ? sortedInstallments[0].paidDate : installment.createdAt;
    }
    
    /**
     * تعديل قسط
     * @param {string} installmentId - معرف القسط
     */
    function editInstallment(installmentId) {
        // هذه الوظيفة يمكن تنفيذها في تحديث لاحق
        showNotification('وظيفة تعديل القسط ستكون متاحة في تحديث قادم', 'info');
    }
    
    /**
     * طباعة تفاصيل القسط
     * @param {string} installmentId - معرف القسط
     */
    function printInstallmentDetails(installmentId) {
        const installment = installments.find(inst => inst.id === installmentId);
        if (!installment) {
            showNotification('لم يتم العثور على القسط', 'error');
            return;
        }
        
        // إنشاء نافذة طباعة جديدة
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            showNotification('لم يتم السماح بفتح نافذة الطباعة', 'error');
            return;
        }
        
        // إعداد محتوى نافذة الطباعة
        preparePrintContent(printWindow, installment, false);
    }
    
    /**
     * طباعة تفاصيل القسط المدفوع
     * @param {string} installmentId - معرف القسط المدفوع
     */
    function printPaidInstallmentDetails(installmentId) {
        const installment = paidInstallments.find(inst => inst.id === installmentId);
        if (!installment) {
            showNotification('لم يتم العثور على القسط المدفوع', 'error');
            return;
        }
        
        // إنشاء نافذة طباعة جديدة
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            showNotification('لم يتم السماح بفتح نافذة الطباعة', 'error');
            return;
        }
        
        // إعداد محتوى نافذة الطباعة
        preparePrintContent(printWindow, installment, true);
    }
    
    /**
     * إعداد محتوى نافذة الطباعة
     * @param {Window} printWindow - نافذة الطباعة
     * @param {Object} installment - كائن القسط
     * @param {boolean} isPaid - هل القسط مدفوع
     */
    function preparePrintContent(printWindow, installment, isPaid) {
        // العثور على المستثمر
        const investor = findInvestor(installment.investorId);
        
        // إعداد نمط الطباعة
        const printStyles = `
            @media print {
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    direction: rtl;
                }
                .print-header {
                    text-align: center;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #ddd;
                    margin-bottom: 20px;
                }
                .print-title {
                    font-size: 24px;
                    margin-bottom: 10px;
                }
                .print-subtitle {
                    color: #666;
                    font-size: 16px;
                }
                .installment-info {
                    margin-bottom: 20px;
                }
                .info-group {
                    margin-bottom: 20px;
                }
                .info-title {
                    font-size: 18px;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 5px;
                    margin-bottom: 10px;
                }
                .info-row {
                    display: flex;
                    margin-bottom: 8px;
                }
                .info-label {
                    font-weight: bold;
                    width: 150px;
                }
                .info-value {
                    flex: 1;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: right;
                }
                th {
                    background-color: #f5f5f5;
                    font-weight: bold;
                }
                .print-footer {
                    text-align: center;
                    margin-top: 30px;
                    font-size: 12px;
                    color: #666;
                }
                .total-row {
                    font-weight: bold;
                }
                .page-break {
                    page-break-after: always;
                }
                .badge {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    color: white;
                }
                .badge-success {
                    background-color: #10b981;
                }
                .badge-primary {
                    background-color: #3b82f6;
                }
                .badge-danger {
                    background-color: #ef4444;
                }
                .badge-warning {
                    background-color: #f59e0b;
                }
            }
        `;
        
        // تحديد حالة القسط
        const { statusClass, statusText } = getInstallmentStatus(installment);
        
        // حساب التواريخ
        const startDate = formatDate(installment.startDate);
        const completedDate = isPaid ? formatDate(installment.completedDate || findLastPaymentDate(installment)) : '-';
        
        // إعداد HTML للطباعة
        const printContent = `
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>تفاصيل القسط - ${installment.title}</title>
                <style>${printStyles}</style>
            </head>
            <body>
                <div class="print-header">
                    <h1 class="print-title">تفاصيل القسط</h1>
                    <div class="print-subtitle">${isPaid ? 'قسط مكتمل' : 'قسط نشط'} - ${new Date().toLocaleDateString('ar-SA')}</div>
                </div>
                
                <div class="installment-info">
                    <h2>${installment.title}</h2>
                    <p>رقم القسط: ${installment.id}</p>
                </div>
                
                <div class="info-group">
                    <h3 class="info-title">معلومات المستثمر</h3>
                    <div class="info-row">
                        <div class="info-label">اسم المستثمر:</div>
                        <div class="info-value">${investor ? investor.name : installment.investorName}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">رقم الهاتف:</div>
                        <div class="info-value">${investor ? investor.phone || '-' : '-'}</div>
                    </div>
                </div>
                
                <div class="info-group">
                    <h3 class="info-title">معلومات القسط</h3>
                    <div class="info-row">
                        <div class="info-label">المبلغ الأصلي:</div>
                        <div class="info-value">${formatCurrency(installment.originalAmount)}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">نسبة الفائدة:</div>
                        <div class="info-value">${installment.interestRate}%</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">قيمة الفائدة:</div>
                        <div class="info-value">${formatCurrency(installment.interestValue)}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">إجمالي المبلغ:</div>
                        <div class="info-value">${formatCurrency(installment.totalAmount)}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">القسط الشهري:</div>
                        <div class="info-value">${formatCurrency(installment.monthlyInstallment)}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">عدد الأشهر:</div>
                        <div class="info-value">${installment.monthsCount} شهر</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">تاريخ البدء:</div>
                        <div class="info-value">${startDate}</div>
                    </div>
                    ${isPaid ? `
                    <div class="info-row">
                        <div class="info-label">تاريخ الانتهاء:</div>
                        <div class="info-value">${completedDate}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">مدة التسديد:</div>
                        <div class="info-value">${calculatePaymentDuration(installment)} يوم</div>
                    </div>
                    ` : `
                    <div class="info-row">
                        <div class="info-label">حالة القسط:</div>
                        <div class="info-value"><span class="badge badge-${statusClass}">${statusText}</span></div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">المبلغ المدفوع:</div>
                        <div class="info-value">${formatCurrency(installment.paidAmount)}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">المبلغ المتبقي:</div>
                        <div class="info-value">${formatCurrency(installment.remainingAmount)}</div>
                    </div>
                    `}
                </div>
                
                <div class="info-group">
                    <h3 class="info-title">تفاصيل الأقساط الشهرية</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>رقم القسط</th>
                                <th>تاريخ الاستحقاق</th>
                                <th>المبلغ</th>
                                <th>الحالة</th>
                                <th>تاريخ التسديد</th>
                                ${!isPaid ? '<th>ملاحظات</th>' : ''}
                            </tr>
                        </thead>
                        <tbody>
                            ${installment.monthlyInstallments.map(inst => {
                                const installmentStatus = getMonthlyInstallmentStatus(inst);
                                return `
                                <tr>
                                    <td>${inst.installmentNumber}</td>
                                    <td>${formatDate(inst.dueDate)}</td>
                                    <td>${formatCurrency(inst.amount)}</td>
                                    <td><span class="badge badge-${installmentStatus.statusClass}">${installmentStatus.statusText}</span></td>
                                    <td>${inst.isPaid ? formatDate(inst.paidDate) : '-'}</td>
                                    ${!isPaid ? `<td>${inst.notes || '-'}</td>` : ''}
                                </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="print-footer">
                    <p>تم إنشاء هذا التقرير بواسطة نظام الأقساط المتكامل - الإصدار ${VERSION}</p>
                    <p>تاريخ الطباعة: ${new Date().toLocaleString('ar-SA')}</p>
                </div>
            </body>
            </html>
        `;
        
        // كتابة المحتوى في نافذة الطباعة
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // انتظار تحميل المحتوى ثم طباعته
        printWindow.onload = function() {
            setTimeout(function() {
                printWindow.print();
            }, 500);
        };
    }
    
    /**
     * تصدير تفاصيل القسط المدفوع
     * @param {string} installmentId - معرف القسط المدفوع
     */
    function exportPaidInstallmentDetails(installmentId) {
        const installment = paidInstallments.find(inst => inst.id === installmentId);
        if (!installment) {
            showNotification('لم يتم العثور على القسط المدفوع', 'error');
            return;
        }
        
        // إنشاء كائن التصدير
        const exportData = {
            id: installment.id,
            title: installment.title,
            investorId: installment.investorId,
            investorName: installment.investorName,
            originalAmount: installment.originalAmount,
            interestRate: installment.interestRate,
            interestValue: installment.interestValue,
            totalAmount: installment.totalAmount,
            monthlyInstallment: installment.monthlyInstallment,
            monthsCount: installment.monthsCount,
            startDate: installment.startDate,
            completedDate: installment.completedDate || findLastPaymentDate(installment),
            status: 'completed',
            monthlyInstallments: installment.monthlyInstallments,
            paymentDuration: calculatePaymentDuration(installment),
            exportDate: new Date().toISOString()
        };
        
        // تحويل البيانات إلى نص JSON
        const jsonData = JSON.stringify(exportData, null, 2);
        
        // إنشاء Blob
        const blob = new Blob([jsonData], { type: 'application/json' });
        
        // إنشاء URL للتنزيل
        const url = URL.createObjectURL(blob);
        
        // إنشاء رابط التنزيل
        const a = document.createElement('a');
        a.href = url;
        a.download = `installment_${installment.id}_export_${formatDate(new Date(), 'YYYY-MM-DD')}.json`;
        
        // إضافة الرابط وتنفيذ النقر
        document.body.appendChild(a);
        a.click();
        
        // تنظيف
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        showNotification(`تم تصدير تفاصيل القسط "${installment.title}" بنجاح`, 'success');
    }
    
    /**
     * تأكيد حذف قسط
     * @param {string} installmentId - معرف القسط
     */
    function confirmDeleteInstallment(installmentId) {
        const installment = installments.find(inst => inst.id === installmentId);
        if (!installment) {
            showNotification('لم يتم العثور على القسط', 'error');
            return;
        }
        
        // إذا كان تأكيد الحذف غير مفعل، حذف القسط مباشرة
        if (!settings.showDeleteConfirmation) {
            deleteInstallment(installmentId);
            showNotification(`تم حذف القسط "${installment.title}" بنجاح`, 'success');
            closeModal('installment-details-modal');
            return;
        }
        
        // إعداد نافذة التأكيد
        const confirmationTitle = document.getElementById('confirmation-title');
        const confirmationMessage = document.getElementById('confirmation-message');
        const confirmButton = document.getElementById('confirmation-confirm');
        
        if (!confirmationTitle || !confirmationMessage || !confirmButton) {
            console.error('لم يتم العثور على عناصر نافذة التأكيد');
            return;
        }
        
        // تعيين محتوى نافذة التأكيد
        confirmationTitle.textContent = 'تأكيد حذف القسط';
        confirmationMessage.innerHTML = `
            هل أنت متأكد من رغبتك في حذف القسط "<strong>${installment.title}</strong>"؟<br>
            سيتم حذف جميع البيانات المتعلقة به نهائيًا.
        `;
        
        // إعداد زر التأكيد
        confirmButton.setAttribute('data-action', 'delete-installment');
        confirmButton.setAttribute('data-id', installmentId);
        
        // إزالة مستمعي الأحداث السابقة
        const newConfirmButton = confirmButton.cloneNode(true);
        confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);
        
        // إضافة مستمع الحدث الجديد
        newConfirmButton.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            const id = this.getAttribute('data-id');
            
            if (action === 'delete-installment' && id) {
                deleteInstallment(id);
                showNotification(`تم حذف القسط "${installment.title}" بنجاح`, 'success');
                closeModal('confirmation-modal');
                closeModal('installment-details-modal');
            }
        });
        
        // فتح نافذة التأكيد
        openModal('confirmation-modal');
    }
    
    /**
     * الحصول على حالة القسط
     * @param {Object} installment - كائن القسط
     * @returns {Object} - فئة الحالة ونص الحالة
     */
    function getInstallmentStatus(installment) {
        let statusClass = 'success';
        let statusText = 'مكتمل';
        
        if (installment.status === 'active') {
            // التحقق من وجود أقساط متأخرة
            const today = new Date();
            today.setHours(0, 0, 0, 0); // تعيين الوقت إلى بداية اليوم
            
            const overdueInstallments = installment.monthlyInstallments.filter(inst => 
                !inst.isPaid && new Date(inst.dueDate) < today
            );
            
            if (overdueInstallments.length > 0) {
                statusClass = 'danger';
                statusText = 'متأخر';
            } else {
                statusClass = 'primary';
                statusText = 'نشط';
            }
        }
        
        return { statusClass, statusText };
    }
    
    /**
     * الحصول على حالة القسط الشهري
     * @param {Object} monthlyInstallment - كائن القسط الشهري
     * @returns {Object} - فئة الحالة ونص الحالة
     */
    function getMonthlyInstallmentStatus(monthlyInstallment) {
        if (monthlyInstallment.isPaid) {
            return { statusClass: 'success', statusText: 'مدفوع' };
        }
        
        const dueDate = new Date(monthlyInstallment.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // تعيين الوقت إلى بداية اليوم
        
        if (dueDate < today) {
            return { statusClass: 'danger', statusText: 'متأخر' };
        } else if (dueDate.toDateString() === today.toDateString()) {
            return { statusClass: 'warning', statusText: 'اليوم' };
        } else {
            return { statusClass: 'primary', statusText: 'مستحق' };
        }
    }
    
    /**
     * الحصول على الأقساط القادمة
     * @param {number} days - عدد الأيام للبحث (افتراضي 14 يوم)
     * @returns {Array} - مصفوفة الأقساط القادمة
     */
    function getUpcomingInstallments(days = 14) {
        const upcomingInstallments = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0); // تعيين الوقت إلى بداية اليوم
        
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + days);
        
        // البحث عن جميع الأقساط الشهرية المستحقة
        installments.forEach(installment => {
            installment.monthlyInstallments.forEach((monthlyInst, index) => {
                if (!monthlyInst.isPaid) {
                    const dueDate = new Date(monthlyInst.dueDate);
                    const isOverdue = dueDate < today;
                    const isToday = dueDate.toDateString() === today.toDateString();
                    const isUpcoming = dueDate <= endDate;
                    
                    // إضافة الأقساط المتأخرة والمستحقة اليوم والقادمة
                    if (isOverdue || isToday || isUpcoming) {
                        const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                        
                        upcomingInstallments.push({
                            installmentId: installment.id,
                            monthlyIndex: index,
                            title: installment.title,
                            investorName: installment.investorName,
                            investorId: installment.investorId,
                            amount: monthlyInst.amount,
                            dueDate: monthlyInst.dueDate,
                            installmentNumber: monthlyInst.installmentNumber,
                            isOverdue,
                            isToday,
                            daysRemaining: Math.max(0, daysRemaining)
                        });
                    }
                }
            });
        });
        
        // ترتيب الأقساط حسب التاريخ (الأقرب أولاً)
        return upcomingInstallments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }
    
    // ===========================
    // وظائف النوافذ المنبثقة
    // ===========================
    
    /**
     * فتح نافذة منبثقة
     * @param {string} modalId - معرف النافذة
     */
    function openModal(modalId) {
        console.log(`فتح النافذة: ${modalId}`);
        
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`لم يتم العثور على النافذة: ${modalId}`);
            return;
        }
        
        // إضافة الصنف النشط للنافذة
        modal.classList.add('active');
        
        // إعادة تعيين النموذج إذا كان موجودًا
        const form = modal.querySelector('form');
        if (form) form.reset();
        
        // تنفيذ إجراءات خاصة بناءً على نوع النافذة
        switch (modalId) {
            case 'add-installment-modal':
                prepareAddInstallmentModal();
                break;
            case 'pay-installment-modal':
                preparePayInstallmentModal();
                break;
            case 'import-data-modal':
                prepareImportDataModal();
                break;
        }
    }
    
    /**
     * إغلاق نافذة منبثقة
     * @param {string} modalId - معرف النافذة
     */
    function closeModal(modalId) {
        console.log(`إغلاق النافذة: ${modalId}`);
        
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    /**
     * إعداد نافذة إضافة قسط جديد
     */
    function prepareAddInstallmentModal() {
        // تحديث قائمة المستثمرين
        populateInvestorSelect('installment-investor');
        
        // تعيين تاريخ البدء إلى تاريخ اليوم
        const startDateInput = document.getElementById('start-date');
        if (startDateInput) {
            startDateInput.value = new Date().toISOString().split('T')[0];
        }
        
        // تعيين القيم الافتراضية من الإعدادات
        const interestRateInput = document.getElementById('interest-rate');
        if (interestRateInput) {
            interestRateInput.value = settings.defaultInterestRate;
        }
        
        const monthsCountInput = document.getElementById('months-count');
        if (monthsCountInput) {
            monthsCountInput.value = settings.defaultMonthsCount;
        }
        
        // تحديث العملة في الحقول
        updateCurrencyDisplay();
        
        // تحديث ملخص الأقساط (سيتم تحديثه عند إدخال القيم)
        calculateInstallmentSummary();
    }
    
    /**
     * إعداد نافذة تسديد قسط
     */
    function preparePayInstallmentModal() {
        // تحديث قائمة المستثمرين
        populateInvestorSelect('pay-investor');
        
        // تعيين تاريخ التسديد إلى تاريخ اليوم
        const paymentDateInput = document.getElementById('payment-date');
        if (paymentDateInput) {
            paymentDateInput.value = new Date().toISOString().split('T')[0];
        }
    }
    
    /**
     * فتح نافذة تسديد قسط محدد
     * @param {string} installmentId - معرف القسط
     * @param {number} monthlyIndex - فهرس القسط الشهري
     */
    function openPayInstallmentModal(installmentId, monthlyIndex) {
        console.log(`فتح نافذة تسديد قسط محدد: ${installmentId} - ${monthlyIndex}`);
        
        // العثور على القسط
        const installment = installments.find(inst => inst.id === installmentId);
        if (!installment) {
            showNotification('لم يتم العثور على القسط', 'error');
            return;
        }
        
        // التحقق من أن القسط الشهري غير مدفوع
        const monthlyInstallment = installment.monthlyInstallments[monthlyIndex];
        if (!monthlyInstallment || monthlyInstallment.isPaid) {
            showNotification('القسط الشهري مدفوع بالفعل أو غير موجود', 'error');
            return;
        }
        
        // فتح نافذة التسديد
        openModal('pay-installment-modal');
        
        // تعيين المستثمر المحدد
        const payInvestorSelect = document.getElementById('pay-investor');
        if (payInvestorSelect) {
            payInvestorSelect.value = installment.investorId;
            
            // تحديث قائمة الأقساط المتاحة
            loadInvestorInstallments(installment.investorId);
            
            // تحديد القسط المحدد
            const availableInstallmentsSelect = document.getElementById('available-installments');
            if (availableInstallmentsSelect) {
                availableInstallmentsSelect.value = installment.id;
                
                // تحديث تفاصيل القسط المحدد
                loadInstallmentPaymentDetails(installment.id, monthlyIndex);
            }
        }
    }
    
    /**
     * فتح نافذة تسديد القسط التالي المستحق
     * @param {string} installmentId - معرف القسط
     */
    function openPayInstallmentModalForNext(installmentId) {
        // العثور على القسط
        const installment = installments.find(inst => inst.id === installmentId);
        if (!installment) {
            showNotification('لم يتم العثور على القسط', 'error');
            return;
        }
        
        // البحث عن أول قسط شهري غير مدفوع
        const unpaidIndex = installment.monthlyInstallments.findIndex(monthly => !monthly.isPaid);
        
        if (unpaidIndex === -1) {
            showNotification('جميع الأقساط مدفوعة بالفعل', 'info');
            return;
        }
        
        // فتح نافذة تسديد القسط المحدد
        openPayInstallmentModal(installmentId, unpaidIndex);
    }
    
    /**
     * إعداد نافذة استيراد البيانات
     */
    function prepareImportDataModal() {
        // إعادة تعيين محتوى الشاشة
        const previewContainer = document.getElementById('import-preview');
        const errorContainer = document.getElementById('import-error');
        const selectedFileName = document.getElementById('selected-file-name');
        const confirmButton = document.getElementById('confirm-import-btn');
        
        if (previewContainer) previewContainer.classList.add('d-none');
        if (errorContainer) errorContainer.classList.add('d-none');
        if (selectedFileName) selectedFileName.textContent = '';
        if (confirmButton) confirmButton.disabled = true;
        
        // إضافة مستمع حدث لحقل الملف
        const importFileInput = document.getElementById('import-file');
        if (importFileInput) {
            // إزالة مستمعي الأحداث السابقة
            const newImportFileInput = importFileInput.cloneNode(true);
            importFileInput.parentNode.replaceChild(newImportFileInput, importFileInput);
            
            // إضافة مستمع الحدث الجديد
            newImportFileInput.addEventListener('change', handleImportFileChange);
        }
        
        // إضافة مستمع حدث لزر التأكيد
        const confirmImportBtn = document.getElementById('confirm-import-btn');
        if (confirmImportBtn) {
            // إزالة مستمعي الأحداث السابقة
            const newConfirmImportBtn = confirmImportBtn.cloneNode(true);
            confirmImportBtn.parentNode.replaceChild(newConfirmImportBtn, confirmImportBtn);
            
            // إضافة مستمع الحدث الجديد
            newConfirmImportBtn.addEventListener('click', confirmImportData);
        }
    }
    
    /**
     * معالجة تغيير ملف الاستيراد
     * @param {Event} event - حدث تغيير الملف
     */
    function handleImportFileChange(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // عرض اسم الملف
        const selectedFileName = document.getElementById('selected-file-name');
        if (selectedFileName) {
            selectedFileName.textContent = file.name;
        }
        
        // قراءة الملف
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                // تحليل محتوى الملف
                const jsonData = JSON.parse(e.target.result);
                
                // التحقق من صحة البيانات
                validateImportData(jsonData);
            } catch (error) {
                // عرض خطأ التحليل
                showImportError(`خطأ في تحليل الملف: ${error.message}`);
            }
        };
        
        reader.onerror = function() {
            showImportError('حدث خطأ أثناء قراءة الملف');
        };
        
        reader.readAsText(file);
    }
    
    /**
     * التحقق من صحة بيانات الاستيراد
     * @param {Object} data - بيانات الاستيراد
     */
    function validateImportData(data) {
        // إخفاء خطأ سابق
        const errorContainer = document.getElementById('import-error');
        if (errorContainer) {
            errorContainer.classList.add('d-none');
        }
        
        // التحقق من وجود البيانات الأساسية
        if (!data || typeof data !== 'object') {
            showImportError('بيانات الملف غير صالحة');
            return;
        }
        
        // التحقق من بيانات الإصدار
        if (data.version && !isVersionCompatible(data.version)) {
            showImportError(`إصدار البيانات (${data.version}) غير متوافق مع النظام الحالي (${VERSION})`);
            return;
        }
        
        // التحقق من وجود بيانات الأقساط
        let activeInstallments = [];
        let paidInstallments = [];
        
        if (data.active && Array.isArray(data.active)) {
            activeInstallments = data.active;
        } else if (Array.isArray(data)) {
            // دعم تنسيق قديم قد يحتوي على مصفوفة مباشرة
            activeInstallments = data;
        } else if (data.installments && Array.isArray(data.installments)) {
            // دعم تنسيق بديل
            activeInstallments = data.installments;
        }
        
        if (data.paid && Array.isArray(data.paid)) {
            paidInstallments = data.paid;
        } else if (data.paidInstallments && Array.isArray(data.paidInstallments)) {
            paidInstallments = data.paidInstallments;
        }
        
        // التحقق من وجود بيانات صالحة
        if (activeInstallments.length === 0 && paidInstallments.length === 0) {
            showImportError('لا توجد بيانات أقساط في الملف');
            return;
        }
        
        // عرض معاينة البيانات
        showImportPreview({
            active: activeInstallments,
            paid: paidInstallments,
            settings: data.settings
        });
    }
    
    /**
     * عرض خطأ الاستيراد
     * @param {string} message - رسالة الخطأ
     */
    function showImportError(message) {
        const errorContainer = document.getElementById('import-error');
        const previewContainer = document.getElementById('import-preview');
        const confirmButton = document.getElementById('confirm-import-btn');
        
        if (errorContainer) {
            errorContainer.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
            errorContainer.classList.remove('d-none');
        }
        
        if (previewContainer) {
            previewContainer.classList.add('d-none');
        }
        
        if (confirmButton) {
            confirmButton.disabled = true;
        }
    }
    
    /**
     * عرض معاينة بيانات الاستيراد
     * @param {Object} data - بيانات الاستيراد
     */
    function showImportPreview(data) {
        const previewContainer = document.getElementById('import-preview');
        const confirmButton = document.getElementById('confirm-import-btn');
        
        if (!previewContainer || !confirmButton) return;
        
        // تفعيل زر التأكيد
        confirmButton.disabled = false;
        
        // إعداد محتوى المعاينة
        const previewContent = document.getElementById('import-preview-content');
        if (previewContent) {
            previewContent.innerHTML = `
                <div class="import-summary">
                    <div class="summary-item">
                        <div class="summary-label">عدد الأقساط النشطة:</div>
                        <div class="summary-value">${data.active.length}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">عدد الأقساط المدفوعة:</div>
                        <div class="summary-value">${data.paid.length}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">إجمالي عدد الأقساط:</div>
                        <div class="summary-value">${data.active.length + data.paid.length}</div>
                    </div>
                    ${data.settings ? `
                    <div class="summary-item">
                        <div class="summary-label">إعدادات النظام:</div>
                        <div class="summary-value">متضمنة</div>
                    </div>
                    ` : ''}
                </div>
                
                <div class="alert alert-warning mt-3">
                    <i class="fas fa-exclamation-triangle"></i>
                    ملاحظة: سيتم استبدال البيانات الحالية بالبيانات المستوردة. تأكد من إنشاء نسخة احتياطية قبل المتابعة.
                </div>
            `;
        }
        
        // إظهار المعاينة
        previewContainer.classList.remove('d-none');
    }
    
    /**
     * تأكيد استيراد البيانات
     */
    function confirmImportData() {
        // الحصول على الملف
        const importFileInput = document.getElementById('import-file');
        if (!importFileInput || !importFileInput.files || importFileInput.files.length === 0) {
            showImportError('الرجاء تحديد ملف');
            return;
        }
        
        const file = importFileInput.files[0];
        
        // قراءة الملف
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                // تحليل محتوى الملف
                const jsonData = JSON.parse(e.target.result);
                
                // استيراد البيانات
                const result = importInstallmentData(jsonData);
                
                if (result.success) {
                    // إغلاق نافذة الاستيراد
                    closeModal('import-data-modal');
                    
                    // عرض رسالة نجاح الاستيراد
                    showNotification(result.message, 'success');
                    
                    // تحديث الإعدادات إذا كانت متضمنة
                    if (jsonData.settings) {
                        Object.assign(settings, jsonData.settings);
                        saveSettings();
                        applySettings();
                    }
                } else {
                    // عرض رسالة خطأ الاستيراد
                    showImportError(result.message);
                }
            } catch (error) {
                showImportError(`خطأ في معالجة الملف: ${error.message}`);
            }
        };
        
        reader.onerror = function() {
            showImportError('حدث خطأ أثناء قراءة الملف');
        };
        
        reader.readAsText(file);
    }
    
    /**
     * التحقق من توافق الإصدار
     * @param {string} importVersion - إصدار البيانات المستوردة
     * @returns {boolean} - هل الإصدار متوافق
     */
    function isVersionCompatible(importVersion) {
        // هذه مجرد دالة بسيطة للتحقق من التوافق
        // يمكن تحسينها لدعم مقارنة الإصدارات
        return true;
    }
    
    /**
     * تحميل قائمة الأقساط المتاحة للمستثمر
     * @param {string} investorId - معرف المستثمر
     */
    function loadInvestorInstallments(investorId) {
        const installmentsSelect = document.getElementById('available-installments');
        
        if (!investorId || !installmentsSelect) return;
        
        // تفريغ القائمة
        installmentsSelect.innerHTML = '<option value="">اختر القسط</option>';
        
        // العثور على أقساط المستثمر
        const investorInstallments = installments.filter(inst => 
            inst.investorId === investorId && 
            inst.status !== 'completed'
        );
        
        if (investorInstallments.length === 0) {
            installmentsSelect.innerHTML += '<option disabled>لا توجد أقساط متاحة</option>';
            document.getElementById('installment-payment-details').innerHTML = '';
            return;
        }
        
        // إضافة الأقساط إلى القائمة
        investorInstallments.forEach(inst => {
            const option = document.createElement('option');
            option.value = inst.id;
            option.textContent = `${inst.title} - القسط الشهري: ${formatCurrency(inst.monthlyInstallment)}`;
            installmentsSelect.appendChild(option);
        });
        
        // تعيين مستمع حدث للقائمة
        installmentsSelect.addEventListener('change', function() {
            const selectedInstallmentId = this.value;
            if (selectedInstallmentId) {
                loadInstallmentPaymentDetails(selectedInstallmentId);
            } else {
                document.getElementById('installment-payment-details').innerHTML = '';
            }
        });
    }
    
    /**
     * تحميل تفاصيل دفع القسط
     * @param {string} installmentId - معرف القسط
     * @param {number} monthlyIndex - فهرس القسط الشهري (اختياري)
     */
    function loadInstallmentPaymentDetails(installmentId, monthlyIndex) {
        const detailsContainer = document.getElementById('installment-payment-details');
        
        if (!installmentId || !detailsContainer) {
            detailsContainer.innerHTML = '';
            return;
        }
        
        // العثور على القسط
        const installment = installments.find(inst => inst.id === installmentId);
        if (!installment) {
            detailsContainer.innerHTML = '<p>لم يتم العثور على تفاصيل القسط</p>';
            return;
        }
        
        // البحث عن القسط الشهري المناسب
        let monthlyInstallment;
        
        if (monthlyIndex !== undefined) {
            // استخدام القسط الشهري المحدد
            monthlyInstallment = installment.monthlyInstallments[monthlyIndex];
        } else {
            // البحث عن أول قسط شهري غير مدفوع
            monthlyInstallment = installment.monthlyInstallments.find(inst => !inst.isPaid);
        }
        
        if (!monthlyInstallment) {
            detailsContainer.innerHTML = '<div class="alert alert-success">جميع الأقساط مدفوعة بالفعل</div>';
            return;
        }
        
        // تحديد إذا كان القسط متأخرًا
        const dueDate = new Date(monthlyInstallment.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // تعيين الوقت إلى بداية اليوم
        const isOverdue = dueDate < today;
        const isToday = dueDate.toDateString() === today.toDateString();
        
        let statusClass = isOverdue ? 'danger' : (isToday ? 'warning' : 'primary');
        let statusText = isOverdue ? 'متأخر' : (isToday ? 'مستحق اليوم' : 'مستحق');
        
        // حساب عدد أيام التأخير
        let daysText = '';
        if (isOverdue) {
            const diffTime = Math.abs(today - dueDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            daysText = `(متأخر ${diffDays} يوم)`;
        }
        
        // إنشاء عرض تفاصيل القسط
        detailsContainer.innerHTML = `
            <h4 class="payment-title">تفاصيل القسط</h4>
            <div class="payment-details-content">
                <div class="payment-row">
                    <span class="payment-label">عنوان القسط:</span>
                    <span class="payment-value">${installment.title}</span>
                </div>
                <div class="payment-row">
                    <span class="payment-label">إجمالي المبلغ:</span>
                    <span class="payment-value">${formatCurrency(installment.totalAmount)}</span>
                </div>
                <div class="payment-row">
                    <span class="payment-label">المبلغ المدفوع:</span>
                    <span class="payment-value">${formatCurrency(installment.paidAmount)}</span>
                </div>
                <div class="payment-row">
                    <span class="payment-label">المبلغ المتبقي:</span>
                    <span class="payment-value">${formatCurrency(installment.remainingAmount)}</span>
                </div>
                <div class="payment-divider"></div>
                <h5 class="payment-subtitle">تفاصيل القسط القادم:</h5>
                <div class="payment-row">
                    <span class="payment-label">رقم القسط:</span>
                    <span class="payment-value">${monthlyInstallment.installmentNumber} من ${installment.monthsCount}</span>
                </div>
                <div class="payment-row">
                    <span class="payment-label">تاريخ الاستحقاق:</span>
                    <span class="payment-value ${isOverdue ? 'text-danger' : ''}">${formatDate(monthlyInstallment.dueDate)} ${daysText}</span>
                </div>
                <div class="payment-row">
                    <span class="payment-label">المبلغ المستحق:</span>
                    <span class="payment-value payment-amount">${formatCurrency(monthlyInstallment.amount)}</span>
                </div>
                <div class="payment-row">
                    <span class="payment-label">الحالة:</span>
                    <span class="payment-value"><span class="badge badge-${statusClass}">${statusText}</span></span>
                </div>
            </div>
            
            <input type="hidden" id="payment-installment-id" value="${installment.id}">
            <input type="hidden" id="payment-monthly-index" value="${monthlyInstallment.installmentNumber - 1}">
        `;
    }
    
  
/**
 * حساب ملخص الأقساط
 */
function calculateInstallmentSummary() {
    const originalAmount = parseFloat(document.getElementById('original-amount').value) || 0;
    const interestRate = parseFloat(document.getElementById('interest-rate').value) || 0;
    const monthsCount = parseInt(document.getElementById('months-count').value) || 1;
    
    // حساب قيمة الفائدة (المبلغ الأصلي × نسبة الفائدة)
    const interestValue = (originalAmount * interestRate / 100);
    
    // حساب إجمالي الفائدة لكامل المدة (الفائدة × عدد الأشهر)
    const totalInterest = interestValue * monthsCount;
    
    // حساب إجمالي المبلغ (المبلغ الأصلي + إجمالي الفائدة)
    const totalAmount = originalAmount + totalInterest;
    
    // حساب القسط الشهري (إجمالي المبلغ ÷ عدد الأشهر)
    const monthlyInstallment = totalAmount / monthsCount;
    
    // عرض الملخص
    document.getElementById('summary-original').textContent = formatCurrency(originalAmount, false);
    document.getElementById('summary-interest').textContent = formatCurrency(totalInterest, false);
    document.getElementById('summary-total').textContent = formatCurrency(totalAmount, false);
    document.getElementById('summary-monthly').textContent = formatCurrency(monthlyInstallment, false);
}

/**
 * إضافة قسط جديد
 */
function addNewInstallment() {
    console.log('إضافة قسط جديد...');
    
    // الحصول على قيم النموذج
    const investorId = document.getElementById('installment-investor').value;
    const title = document.getElementById('installment-title').value;
    const originalAmount = parseFloat(document.getElementById('original-amount').value) || 0;
    const interestRate = parseFloat(document.getElementById('interest-rate').value) || 0;
    const monthsCount = parseInt(document.getElementById('months-count').value) || 1;
    const startDate = document.getElementById('start-date').value;
    const notes = document.getElementById('installment-notes').value || '';
    
    // التحقق من صحة القيم
    if (!investorId || !title || originalAmount <= 0 || monthsCount <= 0 || !startDate) {
        showNotification('يرجى إدخال جميع البيانات المطلوبة بشكل صحيح', 'error');
        return;
    }
    
    // العثور على المستثمر
    const investor = findInvestor(investorId);
    if (!investor) {
        showNotification('لم يتم العثور على المستثمر', 'error');
        return;
    }
    
    // حساب قيمة الفائدة الشهرية (المبلغ الأصلي × نسبة الفائدة)
    const monthlyInterest = (originalAmount * interestRate / 100);
    
    // حساب إجمالي الفائدة لكامل المدة (الفائدة الشهرية × عدد الأشهر)
    const totalInterest = monthlyInterest * monthsCount;
    
    // حساب إجمالي المبلغ (المبلغ الأصلي + إجمالي الفائدة)
    const totalAmount = originalAmount + totalInterest;
    
    // حساب القسط الشهري (إجمالي المبلغ ÷ عدد الأشهر)
    const monthlyInstallment = totalAmount / monthsCount;
    
    // إنشاء مصفوفة الأقساط الشهرية
    const monthlyInstallments = [];
    const startDateObj = new Date(startDate);
    
    for (let i = 0; i < monthsCount; i++) {
        const dueDate = new Date(startDateObj);
        dueDate.setMonth(dueDate.getMonth() + i);
        
        monthlyInstallments.push({
            installmentNumber: i + 1,
            amount: monthlyInstallment,
            dueDate: dueDate.toISOString().split('T')[0],
            isPaid: false,
            paidDate: null,
            paidAmount: 0,
            notes: ''
        });
    }
    
    // إنشاء كائن القسط الجديد
    const newInstallment = {
        id: generateUniqueId(),
        investorId,
        investorName: investor.name,
        title,
        originalAmount,
        interestRate,
        interestValue: monthlyInterest, // قيمة الفائدة الشهرية
        totalInterest,    // إجمالي الفائدة
        totalAmount,
        monthsCount,
        monthlyInstallment,
        startDate,
        createdAt: new Date().toISOString(),
        notes,
        status: 'active',
        monthlyInstallments,
        paidAmount: 0,
        remainingAmount: totalAmount
    };
    
    // إضافة القسط الجديد
    addInstallment(newInstallment);
    
    // إغلاق النافذة المنبثقة
    closeModal('add-installment-modal');
    
    // عرض إشعار النجاح
    showNotification(`تم إضافة قسط ${title} للمستثمر ${investor.name} بنجاح!`, 'success');
}
    /**
     * تسديد قسط من نافذة التسديد
     */
    function payModalInstallment() {
        // الحصول على قيم النموذج
        const installmentId = document.getElementById('payment-installment-id').value;
        const monthlyIndex = parseInt(document.getElementById('payment-monthly-index').value);
        const paymentDate = document.getElementById('payment-date').value;
        const paymentMethod = document.getElementById('payment-method').value;
        const notes = document.getElementById('payment-notes').value || '';
        
        // التحقق من صحة القيم
        if (!installmentId || isNaN(monthlyIndex) || !paymentDate) {
            showNotification('يرجى إدخال جميع البيانات المطلوبة بشكل صحيح', 'error');
            return;
        }
        
        // إعداد بيانات الدفع
        const paymentData = {
            paidDate: paymentDate,
            paymentMethod,
            notes: notes + (paymentMethod !== 'cash' ? ` (${getPaymentMethodName(paymentMethod)})` : '')
        };
        
        // تسديد القسط
        const success = payInstallmentMonth(installmentId, monthlyIndex, paymentData);
        
        if (success) {
            // إغلاق نافذة التسديد
            closeModal('pay-installment-modal');
            
            // عرض إشعار النجاح
            showNotification('تم تسديد القسط بنجاح!', 'success');
        }
    }
    
    /**
     * الحصول على اسم طريقة الدفع
     * @param {string} method - رمز طريقة الدفع
     * @returns {string} - اسم طريقة الدفع
     */
    function getPaymentMethodName(method) {
        switch (method) {
            case 'cash': return 'نقدي';
            case 'bank': return 'تحويل بنكي';
            case 'cheque': return 'شيك';
            case 'other': return 'أخرى';
            default: return method;
        }
    }
    
    // ===========================
    // وظائف تصفية وترتيب البيانات
    // ===========================
    /**
     * تصفية الأقساط حسب المعايير
     * @param {Array} installmentsArray - مصفوفة الأقساط
     * @param {string} filter - نوع التصفية
     * @param {string} query - نص البحث
     * @returns {Array} - الأقساط المصفاة
     */
    function filterInstallments(installmentsArray, filter, query) {
        // تطبيق البحث أولاً
        let filtered = installmentsArray;
        
        if (query && query.trim() !== '') {
            const searchTerm = query.trim().toLowerCase();
            filtered = filtered.filter(installment => {
                return installment.title.toLowerCase().includes(searchTerm) ||
                       installment.investorName.toLowerCase().includes(searchTerm) ||
                       installment.id.toLowerCase().includes(searchTerm);
            });
        }
        
        // تطبيق التصفية حسب الحالة
        if (filter !== 'all') {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // تعيين الوقت إلى بداية اليوم
            
            filtered = filtered.filter(installment => {
                // حالة الأقساط المكتملة
                if (filter === 'completed' && installment.status === 'completed') {
                    return true;
                }
                
                // حالة الأقساط النشطة
                if (filter === 'active' && installment.status === 'active') {
                    return true;
                }
                
                // حالة الأقساط المستحقة (نشطة وليست متأخرة)
                if (filter === 'due' && installment.status === 'active') {
                    // التحقق مما إذا كان هناك أقساط شهرية متأخرة
                    const hasOverdue = installment.monthlyInstallments.some(monthly => 
                        !monthly.isPaid && new Date(monthly.dueDate) < today
                    );
                    
                    return !hasOverdue;
                }
                
                // حالة الأقساط المتأخرة
                if (filter === 'overdue' && installment.status === 'active') {
                    // التحقق مما إذا كان هناك أقساط شهرية متأخرة
                    const hasOverdue = installment.monthlyInstallments.some(monthly => 
                        !monthly.isPaid && new Date(monthly.dueDate) < today
                    );
                    
                    return hasOverdue;
                }
                
                return false;
            });
        }
        
        return filtered;
    }
    
    /**
     * تصفية الأقساط المدفوعة
     * @param {Array} paidInstallmentsArray - مصفوفة الأقساط المدفوعة
     * @param {string} dateFilter - تصفية التاريخ
     * @param {string} query - نص البحث
     * @returns {Array} - الأقساط المصفاة
     */
    function filterPaidInstallments(paidInstallmentsArray, dateFilter, query) {
        // تطبيق البحث أولاً
        let filtered = paidInstallmentsArray;
        
        if (query && query.trim() !== '') {
            const searchTerm = query.trim().toLowerCase();
            filtered = filtered.filter(installment => {
                return installment.title.toLowerCase().includes(searchTerm) ||
                       installment.investorName.toLowerCase().includes(searchTerm) ||
                       installment.id.toLowerCase().includes(searchTerm);
            });
        }
        
        // تطبيق تصفية التاريخ
        if (dateFilter !== 'all') {
            const today = new Date();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            
            filtered = filtered.filter(installment => {
                const completedDate = new Date(installment.completedDate || findLastPaymentDate(installment));
                
                switch (dateFilter) {
                    case 'this-month':
                        return completedDate.getMonth() === currentMonth && 
                               completedDate.getFullYear() === currentYear;
                    case 'last-month':
                        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
                        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
                        return completedDate.getMonth() === lastMonth && 
                               completedDate.getFullYear() === lastMonthYear;
                    case 'this-year':
                        return completedDate.getFullYear() === currentYear;
                    case 'custom':
                        // يمكن تنفيذ تصفية مخصصة في تحديث لاحق
                        return true;
                    default:
                        return true;
                }
            });
        }
        
        return filtered;
    }
    
    /**
     * الحصول على اسم الفلتر
     * @param {string} filter - نوع الفلتر
     * @returns {string} - اسم الفلتر
     */
    function getFilterName(filter) {
        switch (filter) {
            case 'active': return 'نشطة';
            case 'due': return 'مستحقة';
            case 'overdue': return 'متأخرة';
            case 'completed': return 'مكتملة';
            default: return '';
        }
    }
    
    // ===========================
    // وظائف مساعدة
    // ===========================
    
    /**
     * البحث عن المستثمر حسب المعرف
     * @param {string} investorId - معرف المستثمر
     * @returns {Object|null} - كائن المستثمر أو null
     */
    function findInvestor(investorId) {
        if (!window.investors || !Array.isArray(window.investors)) {
            console.warn('مصفوفة المستثمرين غير موجودة');
            return null;
        }
        
        return window.investors.find(investor => investor.id === investorId);
    }
    
    /**
     * تعبئة قائمة المستثمرين
     * @param {string} selectId - معرف عنصر القائمة
     */
    function populateInvestorSelect(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        // تفريغ القائمة
        select.innerHTML = '<option value="">اختر المستثمر</option>';
        
        // التحقق من وجود مصفوفة المستثمرين
        if (!window.investors || !Array.isArray(window.investors) || window.investors.length === 0) {
            select.innerHTML += '<option disabled>لا يوجد مستثمرين</option>';
            return;
        }
        
        // ترتيب المستثمرين أبجديًا
        const sortedInvestors = [...window.investors].sort((a, b) => 
            a.name.localeString ? a.name.localeCompare(b.name) : a.name.localeCompare(b.name)
        );
        
        // إضافة المستثمرين إلى القائمة
        sortedInvestors.forEach(investor => {
            const option = document.createElement('option');
            option.value = investor.id;
            option.textContent = `${investor.name}${investor.phone ? ` (${investor.phone})` : ''}`;
            select.appendChild(option);
        });
    }
    
    /**
     * إضافة مستمعي الأحداث لأزرار الجدول
     */
    function setupTableActionButtons() {
        // أزرار عرض التفاصيل
        document.querySelectorAll('.view-installment').forEach(button => {
            button.addEventListener('click', function() {
                const installmentId = this.getAttribute('data-id');
                showInstallmentDetails(installmentId);
            });
        });
        
        // أزرار تسديد الأقساط
        document.querySelectorAll('.pay-installment').forEach(button => {
            button.addEventListener('click', function() {
                const installmentId = this.getAttribute('data-id');
                openPayInstallmentModalForNext(installmentId);
            });
        });
        
        // أزرار حذف الأقساط
        document.querySelectorAll('.delete-installment').forEach(button => {
            button.addEventListener('click', function() {
                const installmentId = this.getAttribute('data-id');
                confirmDeleteInstallment(installmentId);
            });
        });
    }
    
    /**
     * إضافة مستمعي الأحداث لأزرار جدول الأقساط المدفوعة
     */
    function setupPaidTableActionButtons() {
        // أزرار عرض التفاصيل
        document.querySelectorAll('.view-paid-installment').forEach(button => {
            button.addEventListener('click', function() {
                const installmentId = this.getAttribute('data-id');
                showPaidInstallmentDetails(installmentId);
            });
        });
        
        // أزرار طباعة الأقساط المدفوعة
        document.querySelectorAll('.print-installment').forEach(button => {
            button.addEventListener('click', function() {
                const installmentId = this.getAttribute('data-id');
                printPaidInstallmentDetails(installmentId);
            });
        });
    }
    
    /**
     * إضافة مستمعي الأحداث
     */
    function setupEventListeners() {
        // مستمعي أحداث عامة
        setupGeneralEventListeners();
        
        // مستمعي أحداث النوافذ المنبثقة
        setupModalEventListeners();
        
        // مستمعي أحداث الإعدادات
        setupSettingsEventListeners();
        
        // مستمعي أحداث البحث والتصفية
        setupSearchFilterEventListeners();
    }
    
    /**
     * إضافة مستمعي الأحداث العامة
     */
    function setupGeneralEventListeners() {
        // زر تحديث الأقساط
        const refreshBtn = document.getElementById('refresh-installments-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                renderInstallmentsTable();
                showNotification('تم تحديث بيانات الأقساط', 'success');
            });
        }
        
        // زر تحديث الأقساط المدفوعة
        const refreshPaidBtn = document.getElementById('refresh-paid-installments-btn');
        if (refreshPaidBtn) {
            refreshPaidBtn.addEventListener('click', function() {
                renderPaidInstallmentsTable();
                showNotification('تم تحديث بيانات الأقساط المدفوعة', 'success');
            });
        }
        
        // زر إضافة أول قسط
        const addFirstInstallmentBtn = document.getElementById('add-first-installment-btn');
        if (addFirstInstallmentBtn) {
            addFirstInstallmentBtn.addEventListener('click', function() {
                openModal('add-installment-modal');
            });
        }
        
        // أزرار تصدير واستيراد الأقساط
        const exportBtn = document.getElementById('export-installments-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportAllInstallments);
        }
        
        const importBtn = document.getElementById('import-installments-btn');
        if (importBtn) {
            importBtn.addEventListener('click', function() {
                openModal('import-data-modal');
            });
        }
        
        // زر النسخ الاحتياطي في الإعدادات
        const backupBtn = document.getElementById('backup-data-btn');
        if (backupBtn) {
            backupBtn.addEventListener('click', exportAllInstallments);
        }
        
        // زر استعادة البيانات في الإعدادات
        const restoreBtn = document.getElementById('restore-data-btn');
        if (restoreBtn) {
            restoreBtn.addEventListener('click', function() {
                openModal('import-data-modal');
            });
        }
        
        // زر طباعة الأقساط
        const printBtn = document.getElementById('print-installments-btn');
        if (printBtn) {
            printBtn.addEventListener('click', printAllInstallments);
        }
        
        // زر طباعة الأقساط المدفوعة
        const printPaidBtn = document.getElementById('print-paid-installments-btn');
        if (printPaidBtn) {
            printPaidBtn.addEventListener('click', printAllPaidInstallments);
        }
    }
    
    /**
     * إضافة مستمعي أحداث النوافذ المنبثقة
     */
    function setupModalEventListeners() {
        // أزرار فتح النوافذ المنبثقة
        const addInstallmentBtn = document.getElementById('add-installment-btn');
        if (addInstallmentBtn) {
            addInstallmentBtn.addEventListener('click', function() {
                openModal('add-installment-modal');
            });
        }
        
        const payInstallmentBtn = document.getElementById('pay-installment-btn');
        if (payInstallmentBtn) {
            payInstallmentBtn.addEventListener('click', function() {
                openModal('pay-installment-modal');
            });
        }
        
        // أزرار إغلاق النوافذ المنبثقة
        document.querySelectorAll('.modal-close, .modal-close-btn').forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal-overlay');
                if (modal) {
                    closeModal(modal.id);
                }
            });
        });
        
        // زر حفظ القسط الجديد
        const saveInstallmentBtn = document.getElementById('save-installment-btn');
        if (saveInstallmentBtn) {
            saveInstallmentBtn.addEventListener('click', addNewInstallment);
        }
        
        // زر تأكيد تسديد القسط
        const confirmPaymentBtn = document.getElementById('confirm-payment-btn');
        if (confirmPaymentBtn) {
            confirmPaymentBtn.addEventListener('click', payModalInstallment);
        }
        
        // مستمعي أحداث لحقول حساب القسط
        const originalAmountInput = document.getElementById('original-amount');
        const interestRateInput = document.getElementById('interest-rate');
        const monthsCountInput = document.getElementById('months-count');
        
        if (originalAmountInput && interestRateInput && monthsCountInput) {
            originalAmountInput.addEventListener('input', calculateInstallmentSummary);
            interestRateInput.addEventListener('input', calculateInstallmentSummary);
            monthsCountInput.addEventListener('input', calculateInstallmentSummary);
        }
        
        // مستمع حدث تغيير المستثمر في نافذة تسديد القسط
        const payInvestorSelect = document.getElementById('pay-investor');
        if (payInvestorSelect) {
            payInvestorSelect.addEventListener('change', function() {
                loadInvestorInstallments(this.value);
            });
        }
    }
    
    /**
     * إضافة مستمعي أحداث الإعدادات
     */
    function setupSettingsEventListeners() {
        // زر حفظ الإعدادات
        const saveSettingsBtn = document.getElementById('save-settings-btn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', saveSettingsFromForm);
        }
        
        // زر استعادة الإعدادات الافتراضية
        const resetSettingsBtn = document.getElementById('reset-settings-btn');
        if (resetSettingsBtn) {
            resetSettingsBtn.addEventListener('click', resetSettingsToDefault);
        }
    }
    
    /**
     * إضافة مستمعي أحداث البحث والتصفية
     */
    function setupSearchFilterEventListeners() {
        // حقل البحث في الأقساط النشطة
        const searchInput = document.getElementById('installments-search');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                searchQuery = this.value;
                renderInstallmentsTable();
            });
        }
        
        // حقل البحث في الأقساط المدفوعة
        const paidSearchInput = document.getElementById('paid-installments-search');
        if (paidSearchInput) {
            paidSearchInput.addEventListener('input', function() {
                renderPaidInstallmentsTable();
            });
        }
        
        // أزرار تصفية الأقساط
        document.querySelectorAll('.filter-buttons .btn').forEach(button => {
            button.addEventListener('click', function() {
                // تحديث الزر النشط
                document.querySelectorAll('.filter-buttons .btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                this.classList.add('active');
                
                // تحديث تصفية الأقساط
                currentFilter = this.getAttribute('data-filter');
                renderInstallmentsTable();
            });
        });
        
        // قائمة تصفية تاريخ الأقساط المدفوعة
        const paidDateFilter = document.getElementById('paid-date-filter');
        if (paidDateFilter) {
            paidDateFilter.addEventListener('change', function() {
                renderPaidInstallmentsTable();
            });
        }
    }
    
    /**
     * حفظ الإعدادات من النموذج
     */
    function saveSettingsFromForm() {
        // الحصول على قيم النموذج
        settings.currency = document.getElementById('settings-currency').value;
        settings.dateFormat = document.getElementById('settings-date-format').value;
        settings.defaultInterestRate = parseFloat(document.getElementById('settings-interest-rate').value) || 4;
        settings.defaultMonthsCount = parseInt(document.getElementById('settings-months-count').value) || 12;
        settings.enableNotifications = document.getElementById('settings-enable-notifications').checked;
        settings.enableWhatsAppNotifications = document.getElementById('settings-enable-whatsapp').checked;
        settings.autoSaveEnabled = document.getElementById('settings-auto-save').checked;
        settings.showCompletedInstallments = document.getElementById('settings-show-completed').checked;
        settings.showDeleteConfirmation = document.getElementById('settings-show-delete-confirmation').checked;
        settings.enableDarkMode = document.getElementById('settings-enable-dark-mode').checked;
        settings.sendReminderDaysBefore = parseInt(document.getElementById('settings-reminder-days').value) || 3;
        
        // قيم الألوان
        settings.installmentColors.active = document.getElementById('settings-active-color').value;
        settings.installmentColors.completed = document.getElementById('settings-completed-color').value;
        settings.installmentColors.overdue = document.getElementById('settings-overdue-color').value;
        settings.installmentColors.paid = document.getElementById('settings-paid-color').value;
        
        // حفظ الإعدادات
        if (saveSettings()) {
            // تطبيق الإعدادات
            applySettings();
            
            // تحديث عرض الأقساط
            renderInstallmentsTable();
            renderPaidInstallmentsTable();
            
            // عرض إشعار النجاح
            showNotification('تم حفظ الإعدادات بنجاح', 'success');
        }
    }
    
    /**
     * إعادة تعيين الإعدادات إلى القيم الافتراضية
     */
    function resetSettingsToDefault() {
        // تأكيد إعادة التعيين
        if (confirm('هل أنت متأكد من رغبتك في استعادة الإعدادات الافتراضية؟')) {
            // إعادة تعيين الإعدادات
            settings.currency = 'دينار';
            settings.dateFormat = 'YYYY-MM-DD';
            settings.defaultInterestRate = 4;
            settings.defaultMonthsCount = 12;
            settings.enableNotifications = true;
            settings.enableWhatsAppNotifications = false;
            settings.autoSaveEnabled = true;
            settings.showCompletedInstallments = true;
            settings.showDeleteConfirmation = true;
            settings.enableDarkMode = false;
            settings.sendReminderDaysBefore = 3;
            settings.installmentColors = {
                active: '#3b82f6',
                completed: '#10b981',
                overdue: '#ef4444',
                paid: '#10b981'
            };
            
            // حفظ الإعدادات
            if (saveSettings()) {
                // تحديث نموذج الإعدادات
                updateSettingsForm();
                
                // تطبيق الإعدادات
                applySettings();
                
                // عرض إشعار النجاح
                showNotification('تم استعادة الإعدادات الافتراضية بنجاح', 'success');
            }
        }
    }
    
    /**
     * تصدير جميع بيانات الأقساط
     */
    function exportAllInstallments() {
        const result = exportInstallmentData();
        
        if (result.success) {
            // تحويل البيانات إلى نص JSON
            const jsonData = JSON.stringify(result.data, null, 2);
            
            // إنشاء Blob
            const blob = new Blob([jsonData], { type: 'application/json' });
            
            // إنشاء URL للتنزيل
            const url = URL.createObjectURL(blob);
            
            // إنشاء رابط التنزيل
            const a = document.createElement('a');
            a.href = url;
            a.download = result.fileName;
            
            // إضافة الرابط وتنفيذ النقر
            document.body.appendChild(a);
            a.click();
            
            // تنظيف
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            showNotification('تم تصدير بيانات الأقساط بنجاح', 'success');
        } else {
            showNotification(`فشل تصدير البيانات: ${result.message}`, 'error');
        }
    }
    
    /**
     * طباعة جميع الأقساط النشطة
     */
    function printAllInstallments() {
        // فتح نافذة طباعة جديدة
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            showNotification('لم يتم السماح بفتح نافذة الطباعة', 'error');
            return;
        }
        
        // تحضير نمط الطباعة
        const printStyles = `
            @media print {
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    direction: rtl;
                }
                .print-header {
                    text-align: center;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #ddd;
                    margin-bottom: 20px;
                }
                .print-title {
                    font-size: 24px;
                    margin-bottom: 10px;
                }
                .print-subtitle {
                    color: #666;
                    font-size: 16px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: right;
                }
                th {
                    background-color: #f5f5f5;
                    font-weight: bold;
                }
                .status {
                    font-weight: bold;
                }
                .status-active {
                    color: #3b82f6;
                }
                .status-overdue {
                    color: #ef4444;
                }
                .status-completed {
                    color: #10b981;
                }
                .print-footer {
                    text-align: center;
                    margin-top: 30px;
                    font-size: 12px;
                    color: #666;
                }
                .summary {
                    margin-bottom: 20px;
                    padding: 10px;
                    background-color: #f9f9f9;
                    border-radius: 5px;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                }
                .summary-label {
                    font-weight: bold;
                }
                .page-break {
                    page-break-after: always;
                }
            }
        `;
        
        // تصفية الأقساط حسب الفلتر الحالي
        const filteredInstallments = filterInstallments(installments, currentFilter, searchQuery);
        
        // إعداد محتوى النافذة
        const printContent = `
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>تقرير الأقساط النشطة</title>
                <style>${printStyles}</style>
            </head>
            <body>
                <div class="print-header">
                    <h1 class="print-title">تقرير الأقساط النشطة</h1>
                    <div class="print-subtitle">تاريخ الطباعة: ${formatDate(new Date())}</div>
                </div>
                
                <div class="summary">
                    <div class="summary-row">
                        <span class="summary-label">إجمالي عدد الأقساط:</span>
                        <span>${filteredInstallments.length}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">إجمالي المبالغ:</span>
                        <span>${formatCurrency(filteredInstallments.reduce((sum, inst) => sum + inst.totalAmount, 0))}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">المبالغ المدفوعة:</span>
                        <span>${formatCurrency(filteredInstallments.reduce((sum, inst) => sum + inst.paidAmount, 0))}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">المبالغ المتبقية:</span>
                        <span>${formatCurrency(filteredInstallments.reduce((sum, inst) => sum + inst.remainingAmount, 0))}</span>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>المستثمر</th>
                            <th>عنوان القسط</th>
                            <th>المبلغ الكلي</th>
                            <th>القسط الشهري</th>
                            <th>الأقساط المتبقية</th>
                            <th>تاريخ القسط القادم</th>
                            <th>الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredInstallments.map((installment, index) => {
                            // تحديد عدد الأقساط المتبقية
                            const remainingInstallments = installment.monthlyInstallments.filter(inst => !inst.isPaid).length;
                            
                            // تحديد تاريخ القسط القادم
                            const nextInstallment = installment.monthlyInstallments.find(inst => !inst.isPaid);
                            const nextDueDate = nextInstallment ? formatDate(nextInstallment.dueDate) : '-';
                            
                            // تحديد حالة القسط
                            const { statusClass, statusText } = getInstallmentStatus(installment);
                            
                            return `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${installment.investorName}</td>
                                    <td>${installment.title}</td>
                                    <td>${formatCurrency(installment.totalAmount)}</td>
                                    <td>${formatCurrency(installment.monthlyInstallment)}</td>
                                    <td>${remainingInstallments} / ${installment.monthsCount}</td>
                                    <td>${nextDueDate}</td>
                                    <td class="status status-${statusClass}">${statusText}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                
                <div class="print-footer">
                    <p>تم إنشاء هذا التقرير بواسطة نظام الأقساط المتكامل - الإصدار ${VERSION}</p>
                </div>
            </body>
            </html>
        `;
        
        // كتابة المحتوى في نافذة الطباعة
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // انتظار تحميل المحتوى ثم طباعته
        printWindow.onload = function() {
            setTimeout(function() {
                printWindow.print();
            }, 500);
        };
    }
    
  /**
     * طباعة جميع الأقساط المدفوعة
     */
  function printAllPaidInstallments() {
    // فتح نافذة طباعة جديدة
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        showNotification('لم يتم السماح بفتح نافذة الطباعة', 'error');
        return;
    }
    
    // تحضير نمط الطباعة
    const printStyles = `
        @media print {
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                direction: rtl;
            }
            .print-header {
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 1px solid #ddd;
                margin-bottom: 20px;
            }
            .print-title {
                font-size: 24px;
                margin-bottom: 10px;
            }
            .print-subtitle {
                color: #666;
                font-size: 16px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: right;
            }
            th {
                background-color: #f5f5f5;
                font-weight: bold;
            }
            .print-footer {
                text-align: center;
                margin-top: 30px;
                font-size: 12px;
                color: #666;
            }
            .summary {
                margin-bottom: 20px;
                padding: 10px;
                background-color: #f9f9f9;
                border-radius: 5px;
            }
            .summary-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
            }
            .summary-label {
                font-weight: bold;
            }
        }
    `;
    
    // تصفية الأقساط المدفوعة
    const dateFilter = document.getElementById('paid-date-filter')?.value || 'all';
    const searchQuery = document.getElementById('paid-installments-search')?.value || '';
    const filteredPaidInstallments = filterPaidInstallments(paidInstallments, dateFilter, searchQuery);
    
    // إعداد محتوى النافذة
    const printContent = `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>تقرير الأقساط المدفوعة</title>
            <style>${printStyles}</style>
        </head>
        <body>
            <div class="print-header">
                <h1 class="print-title">تقرير الأقساط المدفوعة</h1>
                <div class="print-subtitle">تاريخ الطباعة: ${formatDate(new Date())}</div>
            </div>
            
            <div class="summary">
                <div class="summary-row">
                    <span class="summary-label">إجمالي عدد الأقساط المدفوعة:</span>
                    <span>${filteredPaidInstallments.length}</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">إجمالي المبالغ المدفوعة:</span>
                    <span>${formatCurrency(filteredPaidInstallments.reduce((sum, inst) => sum + inst.totalAmount, 0))}</span>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>المستثمر</th>
                        <th>عنوان القسط</th>
                        <th>المبلغ الكلي</th>
                        <th>تاريخ البدء</th>
                        <th>تاريخ الانتهاء</th>
                        <th>المدة (شهر)</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredPaidInstallments.map((installment, index) => {
                        const startDate = formatDate(installment.startDate);
                        const completedDate = formatDate(installment.completedDate || findLastPaymentDate(installment));
                        
                        return `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${installment.investorName}</td>
                                <td>${installment.title}</td>
                                <td>${formatCurrency(installment.totalAmount)}</td>
                                <td>${startDate}</td>
                                <td>${completedDate}</td>
                                <td>${installment.monthsCount}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            
            <div class="print-footer">
                <p>تم إنشاء هذا التقرير بواسطة نظام الأقساط المتكامل - الإصدار ${VERSION}</p>
            </div>
        </body>
        </html>
    `;
    
    // كتابة المحتوى في نافذة الطباعة
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // انتظار تحميل المحتوى ثم طباعته
    printWindow.onload = function() {
        setTimeout(function() {
            printWindow.print();
        }, 500);
    };
}

// ===========================
// وظائف الإشعارات والتحقق
// ===========================

/**
 * التحقق من الأقساط المستحقة
 */
function checkDueInstallments() {
    console.log('التحقق من الأقساط المستحقة...');
    
    if (!settings.enableNotifications) {
        console.log('الإشعارات غير مفعلة');
        return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // تعيين الوقت إلى بداية اليوم
    
    let dueTodayCount = 0;
    let overdueCount = 0;
    let upcomingCount = 0;
    
    // التحقق من كل قسط نشط
    installments.forEach(installment => {
        if (installment.status !== 'active') return;
        
        // التحقق من الأقساط الشهرية
        installment.monthlyInstallments.forEach(monthlyInst => {
            if (!monthlyInst.isPaid) {
                const dueDate = new Date(monthlyInst.dueDate);
                
                // تحديد الفرق بالأيام
                const diffDays = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
                
                if (diffDays === 0) {
                    // قسط مستحق اليوم
                    dueTodayCount++;
                    showDueInstallmentNotification(installment, monthlyInst, 'today');
                } else if (diffDays < 0) {
                    // قسط متأخر
                    overdueCount++;
                    if (Math.abs(diffDays) % 7 === 0) { // إشعار أسبوعي للأقساط المتأخرة
                        showDueInstallmentNotification(installment, monthlyInst, 'overdue', Math.abs(diffDays));
                    }
                } else if (diffDays <= settings.sendReminderDaysBefore) {
                    // قسط سيستحق قريبًا
                    upcomingCount++;
                    showDueInstallmentNotification(installment, monthlyInst, 'upcoming', diffDays);
                }
            }
        });
    });
    
    // إظهار إشعار عام إذا كان هناك أقساط مستحقة
    if (dueTodayCount > 0 || overdueCount > 0) {
        let message = '';
        if (dueTodayCount > 0) {
            message += `لديك ${dueTodayCount} قسط مستحق اليوم. `;
        }
        if (overdueCount > 0) {
            message += `لديك ${overdueCount} قسط متأخر عن الدفع. `;
        }
        
        if (message) {
            showNotification(message, 'warning');
        }
    }
    
    // إضافة شارة الإشعارات
    updateNotificationBadge(dueTodayCount + overdueCount);
    
    // إرسال إشعارات الواتساب إذا كانت مفعلة
    if (settings.enableWhatsAppNotifications) {
        sendWhatsAppNotifications();
    }
}

/**
 * إظهار إشعار قسط مستحق
 * @param {Object} installment - كائن القسط
 * @param {Object} monthlyInstallment - كائن القسط الشهري
 * @param {string} type - نوع الإشعار (today, overdue, upcoming)
 * @param {number} days - عدد الأيام (للمتأخر والقادم)
 */
function showDueInstallmentNotification(installment, monthlyInstallment, type, days) {
    // الحصول على العنوان والرسالة حسب النوع
    let title, message, notificationType;
    
    switch (type) {
        case 'today':
            title = 'قسط مستحق اليوم';
            message = `القسط رقم ${monthlyInstallment.installmentNumber} من ${installment.title} للمستثمر ${installment.investorName} مستحق اليوم`;
            notificationType = 'warning';
            break;
        case 'overdue':
            title = 'قسط متأخر عن الدفع';
            message = `القسط رقم ${monthlyInstallment.installmentNumber} من ${installment.title} للمستثمر ${installment.investorName} متأخر عن الدفع منذ ${days} يوم`;
            notificationType = 'error';
            break;
        case 'upcoming':
            title = 'قسط سيستحق قريبًا';
            message = `القسط رقم ${monthlyInstallment.installmentNumber} من ${installment.title} للمستثمر ${installment.investorName} سيستحق بعد ${days} يوم`;
            notificationType = 'info';
            break;
        default:
            return;
    }
    
    // إضافة الإشعار في نظام الإشعارات العام إذا كان موجودًا
    if (typeof window.addNotificationItem === 'function') {
        window.addNotificationItem({
            title,
            message,
            type: notificationType,
            date: new Date().toISOString(),
            action: `openInstallmentDetails('${installment.id}')`,
            category: 'installments'
        });
    }
}

/**
 * إرسال إشعارات الواتساب
 */
function sendWhatsAppNotifications() {
    // التحقق من وجود دالة إرسال رسائل الواتساب
    if (typeof window.sendWhatsAppMessage !== 'function') {
        console.log('دالة إرسال رسائل الواتساب غير موجودة');
        return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // تعيين الوقت إلى بداية اليوم
    
    // التحقق من كل قسط نشط
    installments.forEach(installment => {
        if (installment.status !== 'active') return;
        
        // العثور على المستثمر
        const investor = findInvestor(installment.investorId);
        if (!investor || !investor.phone) return;
        
        // التحقق من الأقساط الشهرية
        installment.monthlyInstallments.forEach(monthlyInst => {
            if (!monthlyInst.isPaid) {
                const dueDate = new Date(monthlyInst.dueDate);
                
                // تحديد الفرق بالأيام
                const diffDays = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
                
                // نص الرسالة
                let message = '';
                
                if (diffDays === 0) {
                    // قسط مستحق اليوم
                    message = `تذكير: يستحق اليوم القسط رقم ${monthlyInst.installmentNumber} من ${installment.title} بمبلغ ${formatCurrency(monthlyInst.amount)}.`;
                } else if (diffDays < 0) {
                    // قسط متأخر (إرسال الرسالة مرة أسبوعيًا)
                    if (Math.abs(diffDays) % 7 === 0) {
                        message = `تنبيه: القسط رقم ${monthlyInst.installmentNumber} من ${installment.title} متأخر عن الدفع منذ ${Math.abs(diffDays)} يوم. المبلغ المستحق: ${formatCurrency(monthlyInst.amount)}.`;
                    }
                } else if (diffDays === 1) {
                    // قسط يستحق غدًا
                    message = `تذكير: يستحق غدًا القسط رقم ${monthlyInst.installmentNumber} من ${installment.title} بمبلغ ${formatCurrency(monthlyInst.amount)}.`;
                } else if (diffDays <= settings.sendReminderDaysBefore) {
                    // قسط سيستحق خلال الأيام القادمة
                    message = `تذكير: يستحق بعد ${diffDays} يوم القسط رقم ${monthlyInst.installmentNumber} من ${installment.title} بمبلغ ${formatCurrency(monthlyInst.amount)}.`;
                }
                
                // إرسال الرسالة إذا كان هناك نص
                if (message) {
                    window.sendWhatsAppMessage(investor.phone, message);
                }
            }
        });
    });
}

/**
 * تحديث شارة الإشعارات
 * @param {number} count - عدد الإشعارات
 */
function updateNotificationBadge(count) {
    // قد تكون هذه الوظيفة مختلفة حسب النظام الرئيسي
    const badge = document.getElementById('notification-badge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

/**
 * إعداد فواصل زمنية للتحقق التلقائي
 */
function setupAutomaticChecks() {
    // التحقق من الأقساط المستحقة كل يوم (86400000 مللي ثانية)
    setInterval(checkDueInstallments, 86400000);
    
    // الحفظ التلقائي للبيانات كل ساعة (3600000 مللي ثانية) إذا كان مفعلاً
    if (settings.autoSaveEnabled) {
        setInterval(saveInstallmentData, 3600000);
    }
}

/**
 * عرض إشعار للمستخدم
 * @param {string} message - نص الإشعار
 * @param {string} type - نوع الإشعار (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    // استخدام دالة الإشعارات من النظام الرئيسي إذا كانت موجودة
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        // إنشاء إشعار مخصص إذا لم تكن دالة النظام الرئيسي موجودة
        showSystemNotification(message, type);
    }
}

/**
 * عرض إشعار مخصص للنظام
 * @param {string} message - نص الإشعار
 * @param {string} type - نوع الإشعار (success, error, warning, info)
 */
function showSystemNotification(message, type = 'info') {
    // التحقق من وجود حاوية الإشعارات
    let notificationsContainer = document.getElementById('system-notifications');
    
    // إنشاء حاوية الإشعارات إذا لم تكن موجودة
    if (!notificationsContainer) {
        notificationsContainer = document.createElement('div');
        notificationsContainer.id = 'system-notifications';
        notificationsContainer.className = 'system-notifications';
        document.body.appendChild(notificationsContainer);
        
        // إضافة نمط للإشعارات
        const style = document.createElement('style');
        style.textContent = `
            .system-notifications {
                position: fixed;
                top: 20px;
                left: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 350px;
            }
            .system-notification {
                padding: 12px 15px;
                border-radius: 8px;
                color: white;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                animation: fadeIn 0.3s ease, fadeOut 0.3s ease 4.7s;
                opacity: 0;
                position: relative;
            }
            .system-notification.show {
                opacity: 1;
            }
            .system-notification.success {
                background-color: #10b981;
            }
            .system-notification.error {
                background-color: #ef4444;
            }
            .system-notification.warning {
                background-color: #f59e0b;
            }
            .system-notification.info {
                background-color: #3b82f6;
            }
            .system-notification i {
                margin-left: 10px;
                font-size: 1.2rem;
            }
            .notification-progress {
                position: absolute;
                bottom: 0;
                right: 0;
                height: 3px;
                width: 100%;
                background-color: rgba(255, 255, 255, 0.3);
            }
            .notification-progress-bar {
                height: 100%;
                background-color: rgba(255, 255, 255, 0.6);
                width: 100%;
                animation: progress 5s linear;
            }
            @keyframes progress {
                0% { width: 100%; }
                100% { width: 0%; }
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(-10px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // تحديد أيقونة الإشعار حسب النوع
    let icon;
    switch (type) {
        case 'success': icon = 'fas fa-check-circle'; break;
        case 'error': icon = 'fas fa-exclamation-circle'; break;
        case 'warning': icon = 'fas fa-exclamation-triangle'; break;
        default: icon = 'fas fa-info-circle'; break;
    }
    
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `system-notification ${type}`;
    notification.innerHTML = `
        <i class="${icon}"></i>
        <div>${message}</div>
        <div class="notification-progress">
            <div class="notification-progress-bar"></div>
        </div>
    `;
    
    // إضافة الإشعار إلى الحاوية
    notificationsContainer.appendChild(notification);
    
    // تأخير لإظهار الإشعار بتأثير متحرك
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // إزالة الإشعار بعد 5 ثوانٍ
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notificationsContainer.removeChild(notification);
        }, 300);
    }, 5000);
}

// ===========================
// وظائف تنسيق البيانات
// ===========================

/**
 * تنسيق التاريخ حسب الإعدادات
 * @param {string|Date} date - التاريخ
 * @param {string} format - تنسيق التاريخ (اختياري)
 * @returns {string} - التاريخ المنسق
 */
function formatDate(date, format = settings.dateFormat) {
    if (!date) return '-';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) return '-';
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    let formattedDate = format;
    formattedDate = formattedDate.replace('YYYY', year);
    formattedDate = formattedDate.replace('MM', month);
    formattedDate = formattedDate.replace('DD', day);
    
    return formattedDate;
}

/**
 * تنسيق المبلغ كعملة
 * @param {number} amount - المبلغ
 * @param {boolean} addCurrency - إضافة العملة
 * @returns {string} - المبلغ المنسق
 */
function formatCurrency(amount, addCurrency = true) {
    // التأكد من أن القيمة رقمية
    amount = parseFloat(amount);
    
    if (isNaN(amount)) return '0';
    
    // تقريب المبلغ إلى أقرب قيمتين عشريتين
    amount = Math.round(amount * 100) / 100;
    
    // تنسيق المبلغ باستخدام الفواصل للآلاف
    const formatted = amount.toLocaleString('ar-SA', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
    
    // إضافة العملة إذا كان مطلوبًا
    return addCurrency ? `${formatted} ${settings.currency}` : formatted;
}

/**
 * إنشاء معرف فريد
 * @returns {string} - معرف فريد
 */
function generateUniqueId() {
    return 'inst_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ===========================
// تعريف واجهة النظام العامة
// ===========================

/**
 * تصدير واجهة النظام العامة
 */
window.InstallmentSystem = {
    // وظائف إدارة البيانات
    loadInstallmentData,
    saveInstallmentData,
    addInstallment,
    updateInstallment,
    deleteInstallment,
    payInstallmentMonth,
    importInstallmentData,
    exportInstallmentData,
    
    // وظائف عرض البيانات
    renderInstallmentsTable,
    renderPaidInstallmentsTable,
    renderUpcomingInstallments,
    showInstallmentDetails,
    showPaidInstallmentDetails,
    
    // وظائف النوافذ المنبثقة
    openModal,
    closeModal,
    
    // وظائف الإشعارات
    checkDueInstallments,
    showNotification,
    
    // الوصول إلى البيانات
    getCurrentFilter: () => currentFilter,
    setCurrentFilter: (filter) => {
        currentFilter = filter;
        renderInstallmentsTable();
    },
    
    // وظائف الطباعة والتصدير
    printInstallmentDetails,
    printAllInstallments,
    printAllPaidInstallments,
    
    // الحصول على معلومات النظام
    getVersion: () => VERSION,
    getActiveInstallments: () => installments.length,
    getPaidInstallments: () => paidInstallments.length,
    
    // وظيفة فتح تفاصيل قسط من خارج النظام
    openInstallmentDetails: showInstallmentDetails
};

// ===========================
// تهيئة النظام عند تحميل الصفحة
// ===========================

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log(`بدء تشغيل نظام الأقساط - الإصدار ${VERSION}`);
    
    // تهيئة نظام الأقساط
    initInstallmentSystem();
});

// توفير وظيفة فتح تفاصيل القسط من خارج النظام
window.openInstallmentDetails = function(installmentId) {
    // التحقق من وجود النظام
    if (window.InstallmentSystem) {
        // الانتقال إلى صفحة الأقساط أولاً
        setActivePage('installments');
        
        // فتح تفاصيل القسط
        setTimeout(() => {
            showInstallmentDetails(installmentId);
        }, 300);
    }
};

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



})();