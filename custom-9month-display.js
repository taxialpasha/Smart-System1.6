/**
 * custom-month-display.js
 * ملف خاص لإصلاح عرض الشهور في سجل الرواتب
 * هذا الملف يتجاوز مشكلة تضارب دالة getArabicMonthName بطريقة مختلفة
 */

(function() {
    console.log("تهيئة عرض الشهور المخصص لنظام الرواتب");
    
    // تعريف قائمة الأشهر العربية
    const ARABIC_MONTHS = {
        1: 'كانون الثاني (يناير)',
        2: 'شباط (فبراير)',
        3: 'آذار (مارس)',
        4: 'نيسان (أبريل)',
        5: 'أيار (مايو)',
        6: 'حزيران (يونيو)',
        7: 'تموز (يوليو)',
        8: 'آب (أغسطس)',
        9: 'أيلول (سبتمبر)',
        10: 'تشرين الأول (أكتوبر)',
        11: 'تشرين الثاني (نوفمبر)',
        12: 'كانون الأول (ديسمبر)'
    };
    
    // وظيفة مساعدة تستخدم القائمة المعرفة محلياً
    function getMonthName(month) {
        const monthNum = parseInt(month);
        return ARABIC_MONTHS[monthNum] || `الشهر ${month}`;
    }
    
    // إضافة الوظيفة إلى النطاق العام
    window.getCustomMonthName = getMonthName;
    
    // الانتظار حتى اكتمال تحميل المستند
    document.addEventListener('DOMContentLoaded', function() {
        // 1. إصلاح جدول معاملات الرواتب
        patchSalaryTable();
        
        // 2. إصلاح مستمع حدث لتفاصيل الراتب
        patchSalaryDetailsDisplay();
        
        // 3. إصلاح طباعة الإيصالات
        patchReceiptPrinting();
    });
    
    /**
     * إصلاح طريقة عرض الشهور في جدول معاملات الرواتب
     */
    function patchSalaryTable() {
        try {
            // تتم المراقبة المستمرة لتغيرات الجدول
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                        // البحث عن خلايا الجدول التي تحتوي على أرقام الشهور
                        const cells = document.querySelectorAll('#salary-transactions-table td:nth-child(3)');
                        cells.forEach(function(cell) {
                            // التحقق ما إذا كانت تحتوي على تاريخ
                            const dateText = cell.textContent.trim();
                            if (dateText && dateText.includes('-')) {
                                // استخراج الشهر من التاريخ (بتنسيق YYYY-MM-DD)
                                const dateParts = dateText.split('-');
                                if (dateParts.length === 3) {
                                    const month = parseInt(dateParts[1]);
                                    // إضافة اسم الشهر كعنصر إضافي
                                    if (!cell.querySelector('.month-name')) {
                                        const monthSpan = document.createElement('span');
                                        monthSpan.className = 'month-name';
                                        monthSpan.style.display = 'block';
                                        monthSpan.style.fontSize = '0.8em';
                                        monthSpan.style.color = '#6c757d';
                                        monthSpan.textContent = getMonthName(month);
                                        cell.appendChild(monthSpan);
                                    }
                                }
                            }
                        });
                    }
                });
            });
            
            // بدء المراقبة لجدول معاملات الرواتب
            const salaryTable = document.querySelector('#salary-transactions-table tbody');
            if (salaryTable) {
                observer.observe(salaryTable, { childList: true, subtree: true });
                console.log('تم تفعيل مراقبة جدول معاملات الرواتب');
            }
        } catch (error) {
            console.error('خطأ في إصلاح جدول الرواتب:', error);
        }
    }
    
    /**
     * إصلاح عرض تفاصيل الراتب
     */
    function patchSalaryDetailsDisplay() {
        try {
            // إضافة مستمع حدث على مستوى المستند
            document.addEventListener('click', function(event) {
                // التحقق من النقر على زر عرض تفاصيل الراتب
                const viewSalaryBtn = event.target.closest('.view-salary, .print-salary');
                if (viewSalaryBtn) {
                    // تأخير قصير للتأكد من عرض التفاصيل
                    setTimeout(fixSalaryDetailsContent, 300);
                }
            });
            
            // إصلاح محتوى تفاصيل الراتب
            function fixSalaryDetailsContent() {
                // البحث عن عنصر التاريخ في التفاصيل
                const dateElement = document.querySelector('.receipt-date p:nth-child(2)');
                if (dateElement) {
                    const text = dateElement.textContent;
                    // استخراج رقم الشهر
                    const monthMatch = text.match(/الشهر:\s*(\d+)/);
                    if (monthMatch && monthMatch[1]) {
                        const monthNumber = parseInt(monthMatch[1]);
                        if (!isNaN(monthNumber) && monthNumber >= 1 && monthNumber <= 12) {
                            // تحديث النص باسم الشهر
                            dateElement.textContent = `الشهر: ${getMonthName(monthNumber)}`;
                        }
                    }
                }
            }
        } catch (error) {
            console.error('خطأ في إصلاح عرض تفاصيل الراتب:', error);
        }
    }
    
    /**
     * إصلاح طباعة إيصالات الرواتب
     */
    function patchReceiptPrinting() {
        try {
            // البحث عن زر الطباعة وتعديل سلوكه
            document.addEventListener('click', function(event) {
                const printButton = event.target.closest('#print-salary-details-btn, #print-this-salary-btn');
                if (printButton) {
                    // التأكد من أن اسم الشهر صحيح قبل الطباعة
                    const dateElement = document.querySelector('.receipt-date p:nth-child(2)');
                    if (dateElement) {
                        const text = dateElement.textContent;
                        // استخراج رقم الشهر
                        const monthMatch = text.match(/الشهر:\s*(\d+)/);
                        if (monthMatch && monthMatch[1]) {
                            const monthNumber = parseInt(monthMatch[1]);
                            if (!isNaN(monthNumber) && monthNumber >= 1 && monthNumber <= 12) {
                                // تحديث النص باسم الشهر
                                dateElement.textContent = `الشهر: ${getMonthName(monthNumber)}`;
                                
                                // السماح بمرور قليل من الوقت قبل الطباعة
                                setTimeout(function() {
                                    window.print();
                                }, 100);
                                
                                // منع السلوك الافتراضي
                                event.preventDefault();
                                event.stopPropagation();
                                return false;
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('خطأ في إصلاح طباعة الإيصالات:', error);
        }
    }
    
    // إعلان نظام الشهور جاهز
    window.customMonthDisplayReady = true;
    console.log("نظام عرض الشهور المخصص جاهز");
})();