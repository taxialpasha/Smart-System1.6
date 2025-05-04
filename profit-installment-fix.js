/**
 * إصلاح مشكلة تضارب نظام الأقساط مع نظام الأرباح
 * هذا الملف يحل مشكلة عدم ظهور المستثمرين في نافذة دفع الأرباح
 * عند استخدام نظام الأقساط مع النظام الرئيسي
 */

(function() {
    console.log('تطبيق إصلاح تضارب نظام الأقساط مع نظام الأرباح...');
    
    // انتظار تحميل المستند بالكامل
    document.addEventListener('DOMContentLoaded', function() {
        // تأخير تطبيق الإصلاح لضمان تحميل جميع العناصر
        setTimeout(fixProfitPaymentIssue, 1000);
    });

    /**
     * إصلاح مشكلة دفع الأرباح
     */
    function fixProfitPaymentIssue() {
        // 1. تعديل دالة فتح نافذة دفع الأرباح
        patchOpenProfitModalFunction();
        
        // 2. تعديل دالة تحميل قوائم المستثمرين في نظام الأقساط
        patchInstallmentInvestorSelectFunction();
        
        // 3. إضافة معالج أحداث لفتح نافذة دفع الأرباح
        addProfitModalEventHandler();
        
        console.log('تم تطبيق إصلاح مشكلة دفع الأرباح بنجاح');
    }
    
    /**
     * تعديل دالة فتح نافذة دفع الأرباح
     */
    function patchOpenProfitModalFunction() {
        // التحقق من وجود النافذة المنبثقة لدفع الأرباح
        const payProfitModal = document.getElementById('pay-profit-modal');
        if (!payProfitModal) {
            console.log('نافذة دفع الأرباح غير موجودة');
            return;
        }
        
        // حفظ الدالة الأصلية
        const originalOpenModal = window.openModal;
        
        // استبدال دالة فتح النافذة المنبثقة بنسخة معدلة
        window.openModal = function(modalId) {
            console.log(`فتح النافذة: ${modalId}`);
            
            // استدعاء الدالة الأصلية لفتح النافذة
            if (originalOpenModal) {
                originalOpenModal(modalId);
            } else {
                // إذا لم تكن الدالة الأصلية موجودة
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.classList.add('active');
                }
            }
            
            // تنفيذ معالجة خاصة لنافذة دفع الأرباح
            if (modalId === 'pay-profit-modal') {
                console.log('جاري تعبئة قائمة المستثمرين في نافذة دفع الأرباح...');
                
                // تأكد من تحميل قوائم المستثمرين
                ensureProfitInvestorSelectPopulated();
            }
        };
        
        console.log('تم تعديل دالة فتح النافذة المنبثقة');
    }
    
    /**
     * تعديل دالة تحميل قائمة المستثمرين في نظام الأقساط
     */
    function patchInstallmentInvestorSelectFunction() {
        // إذا كانت دالة تحميل المستثمرين في نظام الأقساط موجودة
        if (typeof window.populateInvestorSelects === 'function') {
            // حفظ الدالة الأصلية
            const originalPopulateInvestorSelects = window.populateInvestorSelects;
            
            // استبدال الدالة بنسخة معدلة
            window.populateInvestorSelects = function() {
                console.log('تعبئة قائمة المستثمرين (النسخة المعدلة)...');
                
                // استدعاء النسخة الأصلية
                originalPopulateInvestorSelects();
                
                // التأكد من عدم التأثير على قائمة المستثمرين في نافذة دفع الأرباح
                const profitInvestorSelect = document.getElementById('profit-investor');
                if (profitInvestorSelect) {
                    // تعبئة قائمة المستثمرين في نافذة دفع الأرباح من النظام الرئيسي
                    ensureProfitInvestorSelectPopulated();
                }
            };
            
            console.log('تم تعديل دالة تحميل قائمة المستثمرين في نظام الأقساط');
        }
    }
    
    /**
     * إضافة معالج أحداث لفتح نافذة دفع الأرباح
     */
    function addProfitModalEventHandler() {
        // العثور على زر فتح نافذة دفع الأرباح
        const payProfitsBtn = document.getElementById('pay-profits-btn');
        if (payProfitsBtn) {
            // إزالة مستمعي الأحداث السابقة عبر نسخ العنصر واستبداله
            const newPayProfitsBtn = payProfitsBtn.cloneNode(true);
            payProfitsBtn.parentNode.replaceChild(newPayProfitsBtn, payProfitsBtn);
            
            // إضافة مستمع حدث جديد
            newPayProfitsBtn.addEventListener('click', function() {
                // فتح نافذة دفع الأرباح
                openModal('pay-profit-modal');
                
                // التأكد من تحميل قائمة المستثمرين
                setTimeout(ensureProfitInvestorSelectPopulated, 100);
            });
            
            console.log('تم إعادة تعيين مستمع الحدث لزر دفع الأرباح');
        }
    }
    
    /**
     * التأكد من تعبئة قائمة المستثمرين في نافذة دفع الأرباح
     */
    function ensureProfitInvestorSelectPopulated() {
        console.log('التأكد من تعبئة قائمة المستثمرين في نافذة دفع الأرباح...');
        
        const profitInvestorSelect = document.getElementById('profit-investor');
        if (!profitInvestorSelect) {
            console.warn('لم يتم العثور على قائمة المستثمرين في نافذة دفع الأرباح');
            return;
        }
        
        // التحقق مما إذا كانت القائمة فارغة أو تحتوي فقط على خيار واحد (الافتراضي)
        if (profitInvestorSelect.options.length <= 1) {
            console.log('قائمة المستثمرين فارغة، جاري تعبئتها...');
            
            // تحميل المستثمرين من النظام الرئيسي
            if (window.investors && Array.isArray(window.investors)) {
                // ترتيب المستثمرين أبجديًا
                const sortedInvestors = [...window.investors].sort((a, b) => 
                    a.name.localeCompare(b.name)
                );
                
                // تفريغ القائمة
                profitInvestorSelect.innerHTML = '<option value="">اختر المستثمر</option>';
                
                // تعبئة القائمة بالمستثمرين
                sortedInvestors.forEach(investor => {
                    const option = document.createElement('option');
                    option.value = investor.id;
                    option.textContent = `${investor.name} (${investor.phone || ''})`;
                    profitInvestorSelect.appendChild(option);
                });
                
                console.log(`تم تعبئة قائمة المستثمرين بـ ${sortedInvestors.length} مستثمر`);
                
                // تنفيذ حدث تغيير للتأكد من تحديث واجهة المستخدم
                if (typeof window.calculateProfitForInvestor === 'function') {
                    const event = new Event('change');
                    profitInvestorSelect.dispatchEvent(event);
                }
            } else {
                console.warn('مصفوفة المستثمرين غير موجودة أو ليست مصفوفة');
            }
        } else {
            console.log('قائمة المستثمرين في نافذة دفع الأرباح ممتلئة بالفعل');
        }
    }
})();