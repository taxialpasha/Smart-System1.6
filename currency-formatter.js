/**
 * منسق المبالغ المالية - نسخة مبسطة لتضمينها مباشرة في صفحة HTML
 * 
 * كيفية الاستخدام:
 * 1. انسخ هذا الكود كاملاً
 * 2. ألصقه في وسم <script> في نهاية ملف index.html مباشرة قبل </body>
 */

(function() {
    /**
     * دالة تنسيق المبالغ المالية
     * تقوم بتحويل الأرقام إلى صيغة مقروءة مع إضافة النقاط بين كل ثلاثة أرقام
     * مثال: 10000000 -> 10.000.000
     */
    function formatCurrency(amount, addCurrency = true) {
        // التأكد من أن المبلغ رقم
        if (amount === null || amount === undefined || isNaN(amount)) {
            amount = 0;
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
        const currency = window.settings ? window.settings.currency : 'دينار';
        return addCurrency ? `${formattedAmount} ${currency}` : formattedAmount;
    }
    
    // إضافة الدالة إلى النافذة لاستخدامها في جميع أنحاء التطبيق
    window.formatCurrency = formatCurrency;
    
    // تحديث عناصر الصفحة مباشرة
    function updatePageElements() {
        // 1. تحديث لوحة التحكم
        updateDashboardElements();
        
        // 2. تحديث جداول البيانات
        updateTableElements();
        
        console.log('تم تطبيق تنسيق المبالغ المالية');
    }
    
    function updateDashboardElements() {
        try {
            // تحديث إجمالي الاستثمارات
            const totalInvestmentsEl = document.getElementById('total-investments');
            if (totalInvestmentsEl) {
                const text = totalInvestmentsEl.textContent;
                const amount = parseFloat(text.replace(/[^0-9.]/g, ''));
                if (!isNaN(amount)) {
                    totalInvestmentsEl.textContent = formatCurrency(amount);
                }
            }
            
            // تحديث الأرباح الشهرية
            const monthlyProfitsEl = document.getElementById('monthly-profits');
            if (monthlyProfitsEl) {
                const text = monthlyProfitsEl.textContent;
                const amount = parseFloat(text.replace(/[^0-9.]/g, ''));
                if (!isNaN(amount)) {
                    monthlyProfitsEl.textContent = formatCurrency(amount);
                }
            }
        } catch (error) {
            console.error('خطأ في تحديث لوحة التحكم:', error);
        }
    }
    
    function updateTableElements() {
        try {
            // تحديث المبالغ في جدول المستثمرين
            const investorAmountCells = document.querySelectorAll('#investors-table td:nth-child(4), #investors-table td:nth-child(5)');
            investorAmountCells.forEach(cell => {
                const text = cell.textContent;
                const amount = parseFloat(text.replace(/[^0-9.]/g, ''));
                if (!isNaN(amount)) {
                    cell.textContent = formatCurrency(amount);
                }
            });
            
            // تحديث المبالغ في جدول العمليات
            const transactionAmountCells = document.querySelectorAll('#transactions-table td:nth-child(5), #transactions-table td:nth-child(6)');
            transactionAmountCells.forEach(cell => {
                const text = cell.textContent;
                if (text !== '-') {
                    const amount = parseFloat(text.replace(/[^0-9.]/g, ''));
                    if (!isNaN(amount)) {
                        cell.textContent = formatCurrency(amount);
                    }
                }
            });
            
            // تحديث المبالغ في جدول الأرباح
            const profitAmountCells = document.querySelectorAll('#profits-table td:nth-child(2), #profits-table td:nth-child(5)');
            profitAmountCells.forEach(cell => {
                const text = cell.textContent;
                const amount = parseFloat(text.replace(/[^0-9.]/g, ''));
                if (!isNaN(amount)) {
                    cell.textContent = formatCurrency(amount);
                }
            });
            
            // تحديث المبالغ في جدول آخر العمليات
            const recentTransactionCells = document.querySelectorAll('#recent-transactions td:nth-child(5)');
            recentTransactionCells.forEach(cell => {
                const text = cell.textContent;
                const amount = parseFloat(text.replace(/[^0-9.]/g, ''));
                if (!isNaN(amount)) {
                    cell.textContent = formatCurrency(amount);
                }
            });
        } catch (error) {
            console.error('خطأ في تحديث الجداول:', error);
        }
    }
    
    // استبدال دوال العرض الأصلية
    function overrideRenderFunctions() {
        try {
            // استبدال دالة تحديث لوحة التحكم
            if (typeof window.updateDashboard === 'function') {
                const originalUpdateDashboard = window.updateDashboard;
                window.updateDashboard = function() {
                    originalUpdateDashboard();
                    updateDashboardElements();
                };
            }
            
            // استبدال دالة عرض جدول المستثمرين
            if (typeof window.renderInvestorsTable === 'function') {
                const originalRenderInvestorsTable = window.renderInvestorsTable;
                window.renderInvestorsTable = function() {
                    originalRenderInvestorsTable();
                    updateTableElements();
                };
            }
            
            // استبدال دالة عرض جدول العمليات
            if (typeof window.renderTransactionsTable === 'function') {
                const originalRenderTransactionsTable = window.renderTransactionsTable;
                window.renderTransactionsTable = function() {
                    originalRenderTransactionsTable();
                    updateTableElements();
                };
            }
            
            // استبدال دالة عرض جدول الأرباح
            if (typeof window.renderProfitsTable === 'function') {
                const originalRenderProfitsTable = window.renderProfitsTable;
                window.renderProfitsTable = function() {
                    originalRenderProfitsTable();
                    updateTableElements();
                };
            }
            
            // استبدال دالة عرض آخر العمليات
            if (typeof window.renderRecentTransactions === 'function') {
                const originalRenderRecentTransactions = window.renderRecentTransactions;
                window.renderRecentTransactions = function() {
                    originalRenderRecentTransactions();
                    updateTableElements();
                };
            }
        } catch (error) {
            console.error('خطأ في استبدال دوال العرض:', error);
        }
    }
    
    // استبدال دالة toLocaleString
    const originalToLocaleString = Number.prototype.toLocaleString;
    Number.prototype.toLocaleString = function() {
        return formatCurrency(this, false);
    };
    
    // تنفيذ التعديلات
    overrideRenderFunctions();
    
    // تحديث العناصر بعد فترة
    setTimeout(updatePageElements, 1000);
    
    // تحديث العناصر عند تغيير الصفحة
    document.addEventListener('click', function(event) {
        if (event.target.matches('.nav-link, [data-page]')) {
            setTimeout(updatePageElements, 500);
        }
    });
})();