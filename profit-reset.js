/**
 * profit-reset.js
 * نظام تصفير الأرباح بعد الدفع في نظام الاستثمار المتكامل
 * 
 * هذا الملف يوفر وظائف لتصفير الأرباح المتراكمة بعد دفعها للمستثمر
 * وبدء حساب فترة ربح جديدة من تاريخ الدفع
 */

// نظام إعادة ضبط الأرباح
(function() {
    console.log('تهيئة نظام تصفير الأرباح...');
    
    // حفظ الدالة الأصلية لدفع الأرباح
    const originalPayProfit = window.payProfit;
    
    // استبدال دالة دفع الأرباح بنسخة محسنة
    window.payProfit = function() {
        console.log('تنفيذ دفع الأرباح مع تصفير الأرباح السابقة...');
        
        // الحصول على معرف المستثمر من النموذج
        const profitInvestorSelect = document.getElementById('profit-investor');
        if (!profitInvestorSelect) {
            showNotification('خطأ في النموذج: لم يتم العثور على عنصر اختيار المستثمر', 'error');
            return;
        }
        
        const investorId = profitInvestorSelect.value;
        if (!investorId) {
            showNotification('الرجاء اختيار مستثمر', 'error');
            return;
        }
        
        // البحث عن بيانات المستثمر
        const investor = investors.find(inv => inv.id === investorId);
        if (!investor) {
            showNotification('لم يتم العثور على بيانات المستثمر', 'error');
            return;
        }
        
        // حساب إجمالي الأرباح المستحقة قبل التصفير
        let totalProfit = 0;
        
        // حساب الأرباح للاستثمارات النشطة فقط
        if (investor.investments && Array.isArray(investor.investments)) {
            investor.investments.forEach(inv => {
                // تجاهل الاستثمارات ذات المبلغ الصفري
                if (inv.amount <= 0) return;
                
                const start = new Date(inv.date);
                const today = new Date();
                
                // حساب الربح حتى اليوم الحالي
                const profit = calculateInterest(inv.amount, inv.date, today.toISOString().split('T')[0]);
                totalProfit += profit;
            });
        }
        
        // تأكيد من المستخدم قبل المتابعة
        if (!confirm(`سيتم دفع أرباح بقيمة ${formatCurrency(totalProfit)} للمستثمر ${investor.name} وتصفير فترة الربح. هل تريد المتابعة؟`)) {
            return;
        }
        
        // حفظ تاريخ الدفع الحالي
        const paymentDate = new Date().toISOString().split('T')[0];
        
        // إعادة ضبط تواريخ الاستثمارات لتبدأ من تاريخ الدفع
        if (investor.investments && Array.isArray(investor.investments)) {
            investor.investments.forEach(inv => {
                // فقط إذا كان الاستثمار نشطًا
                if (inv.amount > 0) {
                    // حفظ المبلغ والملاحظات الأصلية
                    const originalAmount = inv.amount;
                    const originalNotes = inv.notes || '';
                    
                    // إعادة ضبط تاريخ الاستثمار إلى تاريخ دفع الربح
                    inv.date = paymentDate;
                    
                    // إعادة حساب الفائدة من التاريخ الجديد
                    inv.interest = calculateInterest(originalAmount, paymentDate);
                    
                    // إضافة ملاحظة عن إعادة ضبط فترة الربح
                    inv.notes = originalNotes + (originalNotes ? ' | ' : '') + `تم تصفير فترة الربح في ${paymentDate}`;
                }
            });
        }
        
        // تسجيل عملية دفع الأرباح
        if (!investor.profits) {
            investor.profits = [];
        }
        
        investor.profits.push({
            date: paymentDate,
            amount: totalProfit
        });
        
        // إضافة عملية جديدة
        addTransaction('دفع أرباح', investorId, totalProfit, `دفع أرباح مستحقة وتصفير فترة الربح في ${paymentDate}`);
        
        // حفظ البيانات
        saveData();
        
        // إغلاق النافذة المنبثقة
        closeModal('pay-profit-modal');
        
        // إظهار إشعار بنجاح العملية
        showNotification(`تم دفع الأرباح بمبلغ ${formatCurrency(totalProfit)} للمستثمر ${investor.name} وتم تصفير فترة الربح بنجاح!`, 'success');
        
        // تحديث واجهة المستخدم
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
        
        if (typeof renderProfitsTable === 'function') {
            renderProfitsTable();
        }
        
        if (typeof renderInvestorsTable === 'function') {
            renderInvestorsTable();
        }
        
        if (typeof renderTransactionsTable === 'function') {
            renderTransactionsTable();
        }
        
        return totalProfit;
    };
    
    // إضافة دالة لحساب وإظهار تاريخ الاستحقاق القادم للمستثمر
    window.calculateNextProfitDate = function(investorId) {
        const investor = investors.find(inv => inv.id === investorId);
        if (!investor || !investor.investments || investor.investments.length === 0) {
            return null;
        }
        
        // الحصول على أحدث تاريخ استثمار أو دفع ربح
        let latestDate = null;
        
        // التحقق من تواريخ الاستثمارات
        investor.investments.forEach(inv => {
            if (inv.amount > 0) {
                const investmentDate = new Date(inv.date);
                if (!latestDate || investmentDate > latestDate) {
                    latestDate = investmentDate;
                }
            }
        });
        
        // إذا لم نجد تاريخًا، نستخدم التاريخ الحالي
        if (!latestDate) {
            latestDate = new Date();
        }
        
        // حساب تاريخ الاستحقاق التالي (بعد مدة الدورة)
        const settings = window.settings || { profitCycle: 30 };
        const nextProfitDate = new Date(latestDate);
        nextProfitDate.setDate(nextProfitDate.getDate() + settings.profitCycle);
        
        return nextProfitDate;
    };
    
    // تعديل دالة حساب الأرباح للمستثمر لتعكس التواريخ الجديدة
    const originalCalculateProfitForInvestor = window.calculateProfitForInvestor;
    
    window.calculateProfitForInvestor = function() {
        // استخدام الدالة الأصلية
        const result = originalCalculateProfitForInvestor ? originalCalculateProfitForInvestor.apply(this, arguments) : null;
        
        // إضافة معلومات تاريخ الاستحقاق القادم
        const profitInvestorSelect = document.getElementById('profit-investor');
        const profitDetails = document.getElementById('profit-details');
        
        if (profitInvestorSelect && profitDetails) {
            const investorId = profitInvestorSelect.value;
            if (investorId) {
                // حساب تاريخ الاستحقاق القادم
                const nextProfitDate = calculateNextProfitDate(investorId);
                
                // إضافة معلومات تاريخ الاستحقاق إذا وجد
                if (nextProfitDate) {
                    const nextDateElement = document.createElement('div');
                    nextDateElement.className = 'next-profit-date-info';
                    nextDateElement.innerHTML = `
                        <div class="notice-box">
                            <div class="notice-icon">
                                <i class="fas fa-calendar-alt"></i>
                            </div>
                            <div class="notice-content">
                                <strong>تاريخ الاستحقاق القادم:</strong> ${nextProfitDate.toISOString().split('T')[0]}
                                <p>سيتم تصفير فترة الربح الحالية عند دفع الأرباح وبدء فترة جديدة.</p>
                            </div>
                        </div>
                    `;
                    
                    // إضافة العنصر إلى تفاصيل الربح
                    profitDetails.appendChild(nextDateElement);
                    
                    // إضافة نمط CSS للعنصر إذا لم يكن موجودًا
                    addProfitDateStyles();
                }
            }
        }
        
        return result;
    };
    
    // إضافة أنماط CSS للإشعارات
    function addProfitDateStyles() {
        // التحقق من وجود الأنماط مسبقًا
        if (document.getElementById('profit-reset-styles')) {
            return;
        }
        
        // إنشاء عنصر النمط
        const styleElement = document.createElement('style');
        styleElement.id = 'profit-reset-styles';
        
        // إضافة أنماط CSS
        styleElement.textContent = `
            .next-profit-date-info {
                margin-top: 20px;
            }
            
            .notice-box {
                display: flex;
                background-color: #f0f4ff;
                border: 1px solid #d4e0ff;
                border-right: 4px solid #3b82f6;
                border-radius: 6px;
                padding: 12px;
                margin-top: 15px;
            }
            
            .notice-icon {
                font-size: 24px;
                color: #3b82f6;
                margin-left: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .notice-content {
                flex: 1;
            }
            
            .notice-content strong {
                color: #1e40af;
            }
            
            .notice-content p {
                margin: 5px 0 0 0;
                font-size: 0.9rem;
                color: #4b5563;
            }
        `;
        
        // إضافة عنصر النمط إلى رأس الصفحة
        document.head.appendChild(styleElement);
        console.log('تم إضافة أنماط CSS لنظام تصفير الأرباح');
    }
    
    // تعديل طريقة عرض تفاصيل المستثمر لإظهار معلومات تصفير الأرباح
    const originalShowInvestorDetails = window.showInvestorDetails;
    
    if (typeof originalShowInvestorDetails === 'function') {
        window.showInvestorDetails = function(investorId) {
            // استدعاء الدالة الأصلية
            originalShowInvestorDetails.apply(this, arguments);
            
            // إضافة معلومات تاريخ الاستحقاق القادم بعد فترة قصيرة
            setTimeout(() => {
                const investor = investors.find(inv => inv.id === investorId);
                if (!investor) return;
                
                // البحث عن قسم الإحصائيات في التفاصيل
                const statsContainer = document.querySelector('.investor-stats');
                if (!statsContainer) return;
                
                // حساب تاريخ الاستحقاق القادم
                const nextProfitDate = calculateNextProfitDate(investorId);
                if (!nextProfitDate) return;
                
                // التحقق من عدم وجود معلومات مضافة مسبقًا
                if (statsContainer.querySelector('.next-profit-date')) return;
                
                // إنشاء عنصر معلومات تاريخ الاستحقاق
                const nextDateElement = document.createElement('div');
                nextDateElement.className = 'stat-item next-profit-date';
                nextDateElement.innerHTML = `
                    <div class="stat-value">${nextProfitDate.toISOString().split('T')[0]}</div>
                    <div class="stat-label">تاريخ استحقاق الربح القادم</div>
                `;
                
                // إضافة العنصر إلى قسم الإحصائيات
                statsContainer.appendChild(nextDateElement);
            }, 300);
        };
    }
    
    /**
     * إنشاء تقرير سجل تصفير الأرباح للمستثمر
     * @param {string} investorId - معرف المستثمر
     * @returns {Array} - سجل عمليات تصفير الأرباح
     */
    window.getProfitResetHistory = function(investorId) {
        // البحث عن المستثمر
        const investor = investors.find(inv => inv.id === investorId);
        if (!investor) return [];
        
        // البحث عن عمليات دفع الأرباح في سجل العمليات
        const profitPayments = transactions.filter(tx => 
            tx.investorId === investorId && 
            tx.type === 'دفع أرباح' &&
            tx.notes && 
            tx.notes.includes('تصفير فترة الربح')
        );
        
        // ترتيب العمليات من الأحدث للأقدم
        return profitPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
    };
    
    /**
     * عرض سجل عمليات تصفير الأرباح للمستثمر
     * @param {string} investorId - معرف المستثمر
     */
    window.showProfitResetHistory = function(investorId) {
        // الحصول على بيانات المستثمر
        const investor = investors.find(inv => inv.id === investorId);
        if (!investor) {
            showNotification('لم يتم العثور على بيانات المستثمر', 'error');
            return;
        }
        
        // الحصول على سجل عمليات تصفير الأرباح
        const resetHistory = getProfitResetHistory(investorId);
        
        // إنشاء محتوى النافذة
        let content = `
            <div class="modal-header">
                <h3 class="modal-title">سجل تصفير الأرباح - ${investor.name}</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
        `;
        
        if (resetHistory.length === 0) {
            content += `
                <div class="empty-state">
                    <i class="fas fa-info-circle"></i>
                    <p>لا توجد عمليات تصفير أرباح سابقة لهذا المستثمر</p>
                </div>
            `;
        } else {
            content += `
                <div class="table-container">
                    <table class="mini-table">
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>المبلغ المدفوع</th>
                                <th>الملاحظات</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            resetHistory.forEach(payment => {
                content += `
                    <tr>
                        <td>${payment.date}</td>
                        <td>${formatCurrency(payment.amount)}</td>
                        <td>${payment.notes}</td>
                    </tr>
                `;
            });
            
            content += `
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        content += `
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إغلاق</button>
            </div>
        `;
        
        // عرض النافذة
        showModal('سجل تصفير الأرباح', content);
    };
    
    // إضافة زر لعرض سجل تصفير الأرباح في تفاصيل المستثمر
    document.addEventListener('click', function(e) {
        // البحث عن زر عرض تفاصيل المستثمر
        const viewButton = e.target.closest('.view-investor');
        if (viewButton) {
            const investorId = viewButton.getAttribute('data-id');
            if (!investorId) return;
            
            // الانتظار حتى يتم عرض التفاصيل
            setTimeout(() => {
                // البحث عن شريط الإجراءات
                const actionsContainer = document.querySelector('.investor-actions-big');
                if (!actionsContainer) return;
                
                // البحث عن الزر الموجود (لتجنب الإضافة المتكررة)
                if (actionsContainer.querySelector('.profit-reset-history-btn')) return;
                
                // إنشاء زر عرض سجل تصفير الأرباح
                const historyButton = document.createElement('button');
                historyButton.className = 'btn btn-info profit-reset-history-btn';
                historyButton.innerHTML = '<i class="fas fa-history"></i> سجل تصفير الأرباح';
                
                // إضافة مستمع حدث
                historyButton.addEventListener('click', function() {
                    showProfitResetHistory(investorId);
                });
                
                // إضافة الزر إلى الشريط
                actionsContainer.appendChild(historyButton);
            }, 300);
        }
    });
    
    console.log('تم تهيئة نظام تصفير الأرباح بنجاح');
})();