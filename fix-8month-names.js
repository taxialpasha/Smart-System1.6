/**
 * fix-month-names.js
 * ملف يحل مشكلة تضارب دالة getArabicMonthName
 * نسخة محسنة تتجنب الخطأ المتعلق بـ window.salaryTransactions
 */

(function() {
    console.log("تطبيق إصلاح دالة أسماء الشهور العربية (النسخة المحسنة)");
    
    // حفظ نسخة من الدالة الأصلية في حال وجودها
    const originalGetArabicMonthName = window.getArabicMonthName;
    
    /**
     * دالة معدلة للحصول على اسم الشهر بالعربية
     * هذه الدالة تتجنب مشكلة الاستدعاء المتكرر (الحلقة اللانهائية)
     * @param {string|number} month - رقم الشهر (1-12)
     * @returns {string} - اسم الشهر بالعربية
     */
    window.getArabicMonthName = function(month) {
        // إذا كانت القيمة ليست رقماً، نحاول تحويلها
        const monthNumber = parseInt(month);
        
        // نتأكد أن لدينا رقماً صالحاً
        if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
            return `الشهر ${month}`;
        }
        
        // قائمة ثابتة بأسماء الأشهر العربية
        const arabicMonths = {
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
        
        // إرجاع اسم الشهر من القائمة
        return arabicMonths[monthNumber] || `الشهر ${monthNumber}`;
    };
    
    /**
     * دالة خاصة تستخدم في الوظائف المختلفة
     */
    function getMonthNameSafe(month) {
        const monthNumber = parseInt(month);
        
        const months = {
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
        
        return months[monthNumber] || `الشهر ${month}`;
    }
    
    // إضافة الدالة المساعدة للاستخدام العام
    window.employeesGetArabicMonthName = getMonthNameSafe;
    
    // تصحيح الدوال المختلفة في ملفات نظام الموظفين

    // 1. محاولة تعديل دالة showSalaryDetails الأصلية
    // نستخدم استراتيجية مختلفة باستخدام prototype
    try {
        if (window.showSalaryDetails) {
            const originalFunction = window.showSalaryDetails;
            window.showSalaryDetails = function(transactionId, printAfterShow) {
                // استخدام الدالة الأصلية كما هي
                return originalFunction.call(this, transactionId, printAfterShow);
            };
        }
    } catch (e) {
        console.error("لم نتمكن من تعديل دالة عرض تفاصيل الراتب:", e);
    }

    // 2. إضافة دالة مساعدة للنظام بأكمله
    window.getSafeMonthName = function(month) {
        return getMonthNameSafe(month);
    };

    // 3. إصلاح دمج الدوال المتضاربة
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            try {
                // البحث عن العناصر التي قد تحتوي على معلومات الشهر وتحديثها
                const monthElements = document.querySelectorAll('[data-month]');
                monthElements.forEach(function(element) {
                    const monthNumber = element.getAttribute('data-month');
                    if (monthNumber) {
                        element.textContent = getMonthNameSafe(monthNumber);
                    }
                });

                // التحقق من وجود وظائف الموظفين
                if (window.EmployeesModule) {
                    // إضافة وظيفة آمنة للحصول على اسم الشهر
                    window.EmployeesModule.safeGetMonthName = getMonthNameSafe;
                    
                    // استبدال الوظيفة الأصلية إذا كانت موجودة
                    if (typeof window.EmployeesModule.getArabicMonthName === 'function') {
                        window.EmployeesModule.getArabicMonthName = getMonthNameSafe;
                    }
                }
                
                console.log("تم تطبيق إصلاحات دالة الشهور بنجاح");
            } catch (err) {
                console.error("حدث خطأ أثناء تطبيق إصلاحات إضافية للشهور:", err);
            }
        }, 1000); // انتظر ثانية واحدة للتأكد من تحميل جميع العناصر
    });

    // 4. إضافة مستمع أحداث لتعديل عرض الرواتب
    document.addEventListener('click', function(event) {
        // إذا كان الهدف زر عرض تفاصيل الراتب
        if (event.target && (
            event.target.classList.contains('view-salary') || 
            event.target.closest('.view-salary') ||
            event.target.classList.contains('print-salary') ||
            event.target.closest('.print-salary')
        )) {
            // هناك نقرة على زر عرض تفاصيل الراتب، نضيف تأخيرًا لإصلاح عرض اسم الشهر
            setTimeout(function() {
                try {
                    // البحث عن أي عنصر قد يحتوي على اسم شهر وتصحيحه
                    const monthTexts = document.querySelectorAll('.receipt-date p:nth-child(2)');
                    monthTexts.forEach(function(element) {
                        const text = element.textContent;
                        if (text && text.startsWith('الشهر:')) {
                            const monthNumber = text.replace('الشهر:', '').trim();
                            const parsedMonth = parseInt(monthNumber);
                            if (!isNaN(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12) {
                                element.textContent = `الشهر: ${getMonthNameSafe(parsedMonth)}`;
                            }
                        }
                    });
                } catch (err) {
                    console.log("محاولة تصحيح إضافية لعرض اسم الشهر لم تنجح:", err);
                }
            }, 300);
        }
    }, true);
})();