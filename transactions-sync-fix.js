/**
 * حل مشكلة مزامنة العمليات مع صفحات الصادرات والواردات
 * ملف: transactions-sync-fix.js
 */

(function() {
    console.log("تشغيل نظام مزامنة العمليات مع الصادرات والواردات...");
    
    // مصفوفات عالمية للتأكد من وجودها
    if (!window.exports) window.exports = [];
    if (!window.imports) window.imports = [];
    
    // ربط مباشر بين نظام العمليات ونظام الصادرات/الواردات
    function enhanceTransactionSystem() {
        console.log("تعزيز نظام العمليات للربط مع الصادرات والواردات...");
        
        // نسخة احتياطية من الدوال الأصلية
        const originalAddTransaction = window.addTransaction;
        const originalSaveData = window.saveData;
        
        // تعزيز دالة إضافة العمليات
        if (typeof window.addTransaction === 'function') {
            window.addTransaction = function(type, investorId, amount, notes = '', skipAutoUpdate = false) {
                // استدعاء الدالة الأصلية
                const newTransaction = originalAddTransaction.call(this, type, investorId, amount, notes, skipAutoUpdate);
                
                // إضافة العملية إلى نظام الصادرات/الواردات
                if (newTransaction) {
                    syncTransactionToFinancialSystem(newTransaction);
                }
                
                return newTransaction;
            };
            console.log("تم تعزيز دالة إضافة العمليات");
        }
        
        // تعزيز دالة حفظ البيانات
        if (typeof window.saveData === 'function') {
            window.saveData = function() {
                // استدعاء الدالة الأصلية
                const result = originalSaveData.call(this);
                
                // حفظ بيانات الصادرات والواردات أيضًا
                try {
                    localStorage.setItem('exports', JSON.stringify(window.exports));
                    localStorage.setItem('imports', JSON.stringify(window.imports));
                } catch (error) {
                    console.error('خطأ في حفظ بيانات الصادرات والواردات:', error);
                }
                
                return result;
            };
            console.log("تم تعزيز دالة حفظ البيانات");
        }
        
        // تعزيز دوال المستثمرين
        enhanceInvestorFunctions();
        
        // إضافة مستمع حدث للعمليات
        document.addEventListener('transaction:update', function(event) {
            console.log("تم التقاط حدث تحديث العمليات، جاري مزامنة البيانات...");
            syncAllTransactions();
        });
        
        // مزامنة كاملة عند بدء التشغيل
        syncAllTransactions();
    }
    
    // تعزيز دوال المستثمرين
    function enhanceInvestorFunctions() {
        // تعزيز دالة إضافة مستثمر جديد
        if (typeof window.addNewInvestor === 'function') {
            const originalAddNewInvestor = window.addNewInvestor;
            window.addNewInvestor = function() {
                const result = originalAddNewInvestor.apply(this, arguments);
                
                // التقاط آخر عملية إيداع أولية من المستثمر الجديد
                if (Array.isArray(window.transactions) && window.transactions.length > 0) {
                    const lastTransaction = window.transactions[window.transactions.length - 1];
                    if (lastTransaction && lastTransaction.type === 'إيداع') {
                        syncTransactionToFinancialSystem(lastTransaction);
                    }
                }
                
                return result;
            };
            console.log("تم تعزيز دالة إضافة مستثمر جديد");
        }
        
        // تعزيز دالة إضافة إيداع جديد
        if (typeof window.addDeposit === 'function') {
            const originalAddDeposit = window.addDeposit;
            window.addDeposit = function() {
                const result = originalAddDeposit.apply(this, arguments);
                
                // التقاط آخر عملية إيداع
                if (Array.isArray(window.transactions) && window.transactions.length > 0) {
                    const lastTransaction = window.transactions[window.transactions.length - 1];
                    if (lastTransaction && lastTransaction.type === 'إيداع') {
                        syncTransactionToFinancialSystem(lastTransaction);
                    }
                }
                
                return result;
            };
            console.log("تم تعزيز دالة إضافة إيداع جديد");
        }
        
        // تعزيز دالة سحب مبلغ
        if (typeof window.withdrawAmount === 'function') {
            const originalWithdrawAmount = window.withdrawAmount;
            window.withdrawAmount = function() {
                const result = originalWithdrawAmount.apply(this, arguments);
                
                // التقاط آخر عملية سحب
                if (Array.isArray(window.transactions) && window.transactions.length > 0) {
                    const lastTransaction = window.transactions[window.transactions.length - 1];
                    if (lastTransaction && lastTransaction.type === 'سحب') {
                        syncTransactionToFinancialSystem(lastTransaction);
                    }
                }
                
                return result;
            };
            console.log("تم تعزيز دالة سحب مبلغ");
        }
        
        // تعزيز دالة دفع الأرباح
        if (typeof window.payProfit === 'function') {
            const originalPayProfit = window.payProfit;
            window.payProfit = function() {
                const result = originalPayProfit.apply(this, arguments);
                
                // التقاط آخر عملية دفع أرباح
                if (Array.isArray(window.transactions) && window.transactions.length > 0) {
                    const lastTransaction = window.transactions[window.transactions.length - 1];
                    if (lastTransaction && lastTransaction.type === 'دفع أرباح') {
                        syncTransactionToFinancialSystem(lastTransaction);
                    }
                }
                
                return result;
            };
            console.log("تم تعزيز دالة دفع الأرباح");
        }
    }
    
    // مزامنة جميع العمليات
    function syncAllTransactions() {
        console.log("مزامنة جميع العمليات مع نظام الصادرات والواردات...");
        
        if (!Array.isArray(window.transactions) || window.transactions.length === 0) {
            console.log("لا توجد عمليات للمزامنة");
            return;
        }
        
        // تحديد آخر العمليات المضافة
        const lastExportId = window.exports.length > 0 ? 
            window.exports[window.exports.length - 1].id : null;
            
        const lastImportId = window.imports.length > 0 ? 
            window.imports[window.imports.length - 1].id : null;
        
        // البحث عن العمليات الجديدة التي لم تتم إضافتها بعد
        let newFound = 0;
        window.transactions.forEach(transaction => {
            // تجاهل العمليات التي تم استيرادها بالفعل
            const inExports = window.exports.some(exp => exp.id === transaction.id);
            const inImports = window.imports.some(imp => imp.id === transaction.id);
            
            if (!inExports && !inImports) {
                syncTransactionToFinancialSystem(transaction);
                newFound++;
            }
        });
        
        console.log(`تمت مزامنة ${newFound} عملية جديدة`);
        
        // تحديث واجهة المستخدم إذا كانت الصفحة مفتوحة
        if (newFound > 0) {
            updateFinancialUI();
        }
    }
    
    // مزامنة عملية واحدة مع نظام الصادرات/الواردات
    function syncTransactionToFinancialSystem(transaction) {
        if (!transaction || !transaction.id) {
            console.error("محاولة مزامنة عملية غير صالحة:", transaction);
            return;
        }
        
        // تجنب المزامنة المكررة
        const alreadyInExports = window.exports.some(item => item.id === transaction.id);
        const alreadyInImports = window.imports.some(item => item.id === transaction.id);
        
        if (alreadyInExports || alreadyInImports) {
            console.log(`العملية ${transaction.id} موجودة بالفعل في النظام`);
            return;
        }
        
        console.log(`مزامنة العملية ${transaction.id} (${transaction.type})`);
        
        // إنشاء سجل مالي من العملية
        const financialRecord = {
            id: transaction.id,
            date: transaction.date,
            createdAt: transaction.createdAt || new Date().toISOString(),
            type: transaction.type,
            investorId: transaction.investorId,
            investorName: transaction.investorName || getInvestorName(transaction.investorId),
            amount: transaction.amount,
            balanceAfter: transaction.balanceAfter,
            notes: transaction.notes || '',
            description: getDescriptionFromType(transaction.type)
        };
        
        // تصنيف العمليات إلى صادرات وواردات
        if (transaction.type === 'سحب' || transaction.type === 'دفع أرباح' || transaction.type === 'مصروف') {
            window.exports.push(financialRecord);
            console.log(`تمت إضافة العملية إلى الصادرات: ${transaction.type}`);
        } else if (transaction.type === 'إيداع' || transaction.type === 'دفع قسط' || transaction.type === 'وارد') {
            window.imports.push(financialRecord);
            console.log(`تمت إضافة العملية إلى الواردات: ${transaction.type}`);
        } else {
            console.log(`نوع العملية غير معروف: ${transaction.type}`);
        }
        
        // حفظ البيانات
        try {
            localStorage.setItem('exports', JSON.stringify(window.exports));
            localStorage.setItem('imports', JSON.stringify(window.imports));
        } catch (error) {
            console.error('خطأ في حفظ بيانات الصادرات والواردات:', error);
        }
    }
    
    // الحصول على وصف من نوع العملية
    function getDescriptionFromType(type) {
        switch (type) {
            case 'إيداع':
                return 'إيداع مبلغ استثمار';
            case 'سحب':
                return 'سحب مبلغ من الاستثمار';
            case 'دفع أرباح':
                return 'دفع أرباح للمستثمر';
            case 'دفع قسط':
                return 'تسديد قسط';
            case 'مصروف':
                return 'مصروف تشغيلي';
            default:
                return type;
        }
    }
    
    // الحصول على اسم المستثمر من المعرف
    function getInvestorName(investorId) {
        if (!investorId || !Array.isArray(window.investors)) return 'غير معروف';
        
        const investor = window.investors.find(inv => inv.id === investorId);
        return investor ? investor.name : 'غير معروف';
    }
    
    // تحديث واجهة المستخدم المالية
    function updateFinancialUI() {
        console.log("تحديث واجهة المستخدم المالية...");
        
        // تحديث صفحة الصادرات إذا كانت مفتوحة
        const exportsPage = document.getElementById('exports-page');
        if (exportsPage && exportsPage.classList.contains('active') && typeof window.renderExportsData === 'function') {
            window.renderExportsData();
            console.log("تم تحديث صفحة الصادرات");
        }
        
        // تحديث صفحة الواردات إذا كانت مفتوحة
        const importsPage = document.getElementById('imports-page');
        if (importsPage && importsPage.classList.contains('active') && typeof window.renderImportsData === 'function') {
            window.renderImportsData();
            console.log("تم تحديث صفحة الواردات");
        }
        
        // ترحيل الأحداث
        const event = new CustomEvent('financial:update', { detail: { source: 'sync' } });
        document.dispatchEvent(event);
    }
    
    // تحميل بيانات الصادرات والواردات من التخزين المحلي
    function loadFinancialData() {
        console.log("تحميل بيانات الصادرات والواردات...");
        
        try {
            const savedExports = localStorage.getItem('exports');
            if (savedExports) {
                window.exports = JSON.parse(savedExports);
                console.log(`تم تحميل ${window.exports.length} صادر`);
            }
    
            const savedImports = localStorage.getItem('imports');
            if (savedImports) {
                window.imports = JSON.parse(savedImports);
                console.log(`تم تحميل ${window.imports.length} وارد`);
            }
        } catch (error) {
            console.error('خطأ في تحميل بيانات الصادرات والواردات:', error);
        }
    }
    
    // إضافة مستمع لأحداث واجهة المستخدم
    function addUIEventListeners() {
        // الاستماع لأحداث الصادرات والواردات
        document.addEventListener('financial:update', function(event) {
            // تنفيذ أي إجراءات إضافية عند تحديث البيانات المالية
            console.log("تم تحديث البيانات المالية:", event.detail);
        });
        
        // التحقق من وجود الصفحات وإضافة مستمعات أحداث عند التنقل
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                const pageId = this.getAttribute('data-page');
                if (pageId === 'exports' || pageId === 'imports') {
                    setTimeout(() => {
                        updateFinancialUI();
                    }, 500);
                }
            });
        });
    }
    
    // الخطوات الرئيسية للتشغيل
    function main() {
        // تحميل البيانات المالية
        loadFinancialData();
        
        // تعزيز نظام العمليات
        enhanceTransactionSystem();
        
        // إضافة مستمعات أحداث واجهة المستخدم
        addUIEventListeners();
        
        console.log("تم تشغيل نظام مزامنة العمليات مع الصادرات والواردات بنجاح!");
    }
    
    // إضافة مستمع لتحميل الصفحة
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', main);
    } else {
        // الصفحة محملة بالفعل
        main();
    }
    
    // إضافة مستمع لتحميل الصفحة بالكامل للتأكد
    window.addEventListener('load', function() {
        setTimeout(function() {
            // مزامنة مرة أخرى بعد التحميل الكامل
            syncAllTransactions();
            
            // عرض إشعار بنجاح التزامن
            if (typeof window.showNotification === 'function') {
                window.showNotification('تم مزامنة بيانات الصادرات والواردات بنجاح', 'success');
            }
        }, 2000);
    });
})();

