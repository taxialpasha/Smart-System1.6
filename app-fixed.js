/**
 * نظام الاستثمار المتكامل - ملف إصلاح التطبيق
 * يحتوي على إصلاحات للمشاكل الرئيسية في تطبيق نظام الاستثمار
 */

// تهيئة المتغيرات الرئيسية للتطبيق
let investors = [];
let transactions = [];
let settings = {
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

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تهيئة التطبيق...');
    loadData();
    initNavigation();
    initEventListeners();
    setCurrentDateAsDefault();
    updateDashboard();
    populateInvestorSelects();
    
    initCharts();

    // تفعيل الزر العائم
    initFloatingActionButton();
    
    // تفعيل البحث
    initSearchFunctionality();
});

// تحميل البيانات من التخزين المحلي
function loadData() {
    console.log('تحميل البيانات...');
    
    try {
        const savedInvestors = localStorage.getItem('investors');
        if (savedInvestors) {
            investors = JSON.parse(savedInvestors);
            console.log(`تم تحميل ${investors.length} مستثمر`);
        }

        const savedTransactions = localStorage.getItem('transactions');
        if (savedTransactions) {
            transactions = JSON.parse(savedTransactions);
            console.log(`تم تحميل ${transactions.length} عملية`);
        }

        const savedSettings = localStorage.getItem('settings');
        if (savedSettings) {
            settings = JSON.parse(savedSettings);
            
            // التحقق من وجود العناصر قبل تعيين القيم
            const interestRateSetting = document.getElementById('interest-rate-setting');
            const reminderDays = document.getElementById('reminder-days');
            const interestRate = document.getElementById('interest-rate');
            
            if (interestRateSetting) interestRateSetting.value = settings.interestRate;
            if (reminderDays) reminderDays.value = settings.reminderDays;
            if (interestRate) interestRate.textContent = `${settings.interestRate}%`;
        }
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        showNotification('حدث خطأ أثناء تحميل البيانات', 'error');
    }

    renderInvestorsTable();
    renderTransactionsTable();
    renderProfitsTable();
    renderRecentTransactions();
}

// حفظ البيانات في التخزين المحلي
function saveData() {
    try {
        localStorage.setItem('investors', JSON.stringify(investors));
        localStorage.setItem('transactions', JSON.stringify(transactions));
        localStorage.setItem('settings', JSON.stringify(settings));
        console.log('تم حفظ البيانات بنجاح');
        return true;
    } catch (error) {
        console.error('خطأ في حفظ البيانات:', error);
        showNotification('حدث خطأ أثناء حفظ البيانات', 'error');
        return false;
    }
}

// تهيئة التنقل بين الصفحات
function initNavigation() {
    console.log('تهيئة التنقل...');
    
    // التنقل بين الصفحات
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // إزالة الكلاس النشط من جميع الروابط
            navLinks.forEach(l => l.classList.remove('active'));
            
            // إضافة الكلاس النشط للرابط المحدد
            this.classList.add('active');
            
            // إظهار الصفحة المقابلة
            const pageId = this.getAttribute('data-page');
            showPage(pageId);
        });
    });

    // التبديل بين التبويبات
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            const tabContent = document.getElementById(`${tabId}-tab`);
            
            // إزالة الكلاس النشط من جميع الأزرار والمحتويات
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // إضافة الكلاس النشط للزر والمحتوى المحدد
            this.classList.add('active');
            if (tabContent) {
                tabContent.classList.add('active');
            }
        });
    });

    // أزرار فتح وإغلاق القائمة الجانبية
    document.querySelectorAll('.toggle-sidebar').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('active');
            document.querySelector('.layout').classList.toggle('sidebar-collapsed');
        });
    });
}

// إظهار صفحة محددة
function showPage(pageId) {
    console.log(`عرض الصفحة: ${pageId}`);
    
    // إخفاء جميع الصفحات
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // إظهار الصفحة المطلوبة
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // تحديث البيانات حسب الصفحة
        if (pageId === 'dashboard') {
            updateDashboard();
            renderRecentTransactions();
        } else if (pageId === 'investors') {
            renderInvestorsTable();
        } else if (pageId === 'transactions') {
            renderTransactionsTable();
        } else if (pageId === 'profits') {
            renderProfitsTable();
        }
    }
}

// تهيئة مستمعي الأحداث
function initEventListeners() {
    console.log('تهيئة مستمعي الأحداث...');
    
    // فتح النوافذ المنبثقة
    const addInvestorBtn = document.getElementById('add-investor-btn');
    const addDepositBtn = document.getElementById('add-deposit-btn');
    const addWithdrawBtn = document.getElementById('add-withdraw-btn');
    const payProfitsBtn = document.getElementById('pay-profits-btn');
    const addNewFab = document.getElementById('add-new-fab');

    if (addInvestorBtn) addInvestorBtn.addEventListener('click', () => openModal('add-investor-modal'));
    if (addDepositBtn) addDepositBtn.addEventListener('click', () => openModal('add-deposit-modal'));
    if (addWithdrawBtn) addWithdrawBtn.addEventListener('click', () => openModal('add-withdraw-modal'));
    if (payProfitsBtn) payProfitsBtn.addEventListener('click', () => openModal('pay-profit-modal'));
    if (addNewFab) addNewFab.addEventListener('click', () => openModal('add-investor-modal'));
    
    // إغلاق النوافذ المنبثقة
    document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });

    // حفظ البيانات
    const saveInvestorBtn = document.getElementById('save-investor-btn');
    const saveDepositBtn = document.getElementById('save-deposit-btn');
    const saveWithdrawBtn = document.getElementById('save-withdraw-btn');
    const confirmPayProfit = document.getElementById('confirm-pay-profit');

    if (saveInvestorBtn) saveInvestorBtn.addEventListener('click', addNewInvestor);
    if (saveDepositBtn) saveDepositBtn.addEventListener('click', addDeposit);
    if (saveWithdrawBtn) saveWithdrawBtn.addEventListener('click', withdrawAmount);
    if (confirmPayProfit) confirmPayProfit.addEventListener('click', payProfit);
    
    // نماذج الإعدادات
    const generalSettingsForm = document.getElementById('general-settings-form');
    const profitsSettingsForm = document.getElementById('profits-settings-form');
    const notificationsSettingsForm = document.getElementById('notifications-settings-form');
    
    if (generalSettingsForm) {
        generalSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveGeneralSettings();
        });
    }
    
    if (profitsSettingsForm) {
        profitsSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProfitsSettings();
        });
    }
    
    if (notificationsSettingsForm) {
        notificationsSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveNotificationsSettings();
        });
    }
    
    // اختيار المستثمر للأرباح
    const profitInvestor = document.getElementById('profit-investor');
    const withdrawInvestor = document.getElementById('withdraw-investor');
    
    if (profitInvestor) profitInvestor.addEventListener('change', calculateProfitForInvestor);
    if (withdrawInvestor) withdrawInvestor.addEventListener('change', showInvestorBalance);
    
    // إغلاق الإشعارات
    const notificationClose = document.querySelector('.notification-close');
    if (notificationClose) {
        notificationClose.addEventListener('click', function() {
            const notification = this.closest('.notification');
            if (notification) {
                notification.classList.remove('show');
            }
        });
    }
    
    // تصفية البيانات في جدول العمليات
    const transactionFilters = document.querySelectorAll('#transactions-page .btn-group .btn');
    if (transactionFilters.length > 0) {
        transactionFilters.forEach(button => {
            button.addEventListener('click', function() {
                // تحديث الزر النشط
                transactionFilters.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // تحديث عرض العمليات حسب النوع
                const filterType = this.textContent.trim();
                filterTransactions(filterType);
            });
        });
    }
    
    // الاستماع إلى حدث إضافة/تعديل/حذف المستثمر
    document.addEventListener('investor:update', function() {
        renderInvestorsTable();
        populateInvestorSelects();
        updateDashboard();
    });
    
    // الاستماع إلى حدث إضافة/تعديل/حذف العمليات
    document.addEventListener('transaction:update', function() {
        renderTransactionsTable();
        renderRecentTransactions();
        updateDashboard();
    });
}

// فتح نافذة منبثقة
function openModal(modalId) {
    console.log(`فتح النافذة: ${modalId}`);
    
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`لم يتم العثور على النافذة: ${modalId}`);
        return;
    }
    
    modal.classList.add('active');
    
    // إعادة تعيين النموذج إذا كان موجودًا
    const form = modal.querySelector('form');
    if (form) form.reset();
    
    // تحديث تاريخ اليوم إذا كان هناك حقل تاريخ
    const dateInputs = modal.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.value = new Date().toISOString().split('T')[0];
    });
    
    // تحديث قوائم المستثمرين
    populateInvestorSelects();
    
    // تحديثات خاصة بنوافذ محددة
    if (modalId === 'pay-profit-modal') {
        calculateProfitForInvestor();
    } else if (modalId === 'add-withdraw-modal') {
        showInvestorBalance();
    }
}

// إغلاق نافذة منبثقة
function closeModal(modalId) {
    console.log(`إغلاق النافذة: ${modalId}`);
    
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// تعيين التاريخ الحالي كقيمة افتراضية لحقول التاريخ
function setCurrentDateAsDefault() {
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.value = today;
    });
    console.log('تم تعيين التاريخ الحالي لجميع حقول التاريخ');
}




// الحصول على إجمالي الاستثمارات للمستثمر
function getTotalInvestmentForInvestor(investorId) {
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) return 0;
    
    return investor.investments.reduce((total, inv) => total + inv.amount, 0);
}

// الحصول على إجمالي الأرباح للمستثمر
function getTotalProfitForInvestor(investorId) {
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) return 0;
    
    return investor.investments.reduce((total, inv) => total + inv.interest, 0);
}

// حساب الأرباح لمستثمر محدد
// 3. تعديل دالة حساب الأرباح للمستثمر لتأخذ بعين الاعتبار المبالغ المسحوبة التي تم قطع فائدتها
function calculateProfitForInvestor() {
    console.log('حساب الأرباح للمستثمر...');
    
    const investorSelect = document.getElementById('profit-investor');
    if (!investorSelect) return;
    
    const investorId = investorSelect.value;
    const profitDetails = document.getElementById('profit-details');
    
    if (!investorId || !profitDetails) {
        if (profitDetails) profitDetails.innerHTML = '';
        return;
    }
    
    const investor = investors.find(inv => inv.id === investorId);
    
    if (investor) {
        let totalProfit = 0;
        let profitBreakdown = `
            <div class="section">
                <h3 class="section-title">تفاصيل الأرباح</h3>
                <table>
                    <thead>
                        <tr>
                            <th>المبلغ</th>
                            <th>تاريخ الإيداع</th>
                            <th>أيام الاستثمار</th>
                            <th>الربح</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // معالجة الاستثمارات النشطة
        investor.investments.forEach(inv => {
            // تجاهل الاستثمارات ذات المبلغ الصفري
            if (inv.amount <= 0) return;
            
            const start = new Date(inv.date);
            const today = new Date();
            const days = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
            
            // حساب الربح للاستثمارات النشطة فقط
            const profit = calculateInterest(inv.amount, inv.date, today.toISOString().split('T')[0]);
            
            totalProfit += profit;
            profitBreakdown += `
                <tr>
                    <td>${formatCurrency(inv.amount, true)}</td>
                    <td>${inv.date}</td>
                    <td>${days} يوم</td>
                    <td>${formatCurrency(profit, true)}</td>
                </tr>
            `;
        });
        
        // إضافة قسم للاستثمارات المسحوبة التي تم قطع فائدتها
        if (investor.withdrawnInvestments && investor.withdrawnInvestments.length > 0) {
            profitBreakdown += `
                <tr class="separator">
                    <td colspan="4"><strong>الاستثمارات المسحوبة (تم قطع فائدتها)</strong></td>
                </tr>
            `;
            
            investor.withdrawnInvestments.forEach(inv => {
                const start = new Date(inv.date);
                const end = new Date(inv.endDate);
                const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
                
                profitBreakdown += `
                    <tr class="withdrawn">
                        <td>${formatCurrency(inv.amount, true)}</td>
                        <td>${inv.date} إلى ${inv.endDate}</td>
                        <td>${days} يوم</td>
                        <td>${formatCurrency(0, true)} <small>(تم قطع الفائدة)</small></td>
                    </tr>
                `;
            });
        }
        
        profitBreakdown += `
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3"><strong>إجمالي الربح</strong></td>
                            <td><strong>${formatCurrency(totalProfit, true)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
        
        profitDetails.innerHTML = profitBreakdown;
    } else {
        profitDetails.innerHTML = '<p>لم يتم العثور على بيانات المستثمر</p>';
    }
}

// إضافة عملية جديدة
function addTransaction(type, investorId, amount, notes = '') {
    console.log(`إضافة عملية ${type} بقيمة ${amount} للمستثمر ${investorId}`);
    
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) {
        console.error(`لم يتم العثور على المستثمر: ${investorId}`);
        return null;
    }
    
    // تحديد رصيد المستثمر بعد العملية
    let balanceAfter = 0;
    if (type === 'إيداع') {
        // تحديث رصيد المستثمر
        investor.amount = (investor.amount || 0) + amount;
        balanceAfter = investor.amount;
    } else if (type === 'سحب') {
        // تحديث رصيد المستثمر
        investor.amount = (investor.amount || 0) - amount;
        balanceAfter = investor.amount;
    } else {
        // في حالة الأرباح، لا نضيف للرصيد الأساسي
        balanceAfter = investor.amount || 0;
    }
    
    const newTransaction = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        type,
        investorId,
        investorName: investor ? investor.name : 'غير معروف',
        amount,
        balanceAfter,
        notes
    };
    
    transactions.push(newTransaction);
    saveData();
    
    // إطلاق حدث تحديث العمليات
    document.dispatchEvent(new CustomEvent('transaction:update'));
    
    return newTransaction;
}

// 4. تحديث دالة دفع الأرباح لتأخذ بعين الاعتبار المبالغ المسحوبة
function payProfit() {
    console.log('دفع الأرباح...');
    
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
    
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) {
        showNotification('لم يتم العثور على بيانات المستثمر', 'error');
        return;
    }
    
    let totalProfit = 0;
    
    // حساب الأرباح للاستثمارات النشطة فقط
    investor.investments.forEach(inv => {
        // تجاهل الاستثمارات ذات المبلغ الصفري
        if (inv.amount <= 0) return;
        
        const start = new Date(inv.date);
        const today = new Date();
        const profit = calculateInterest(inv.amount, inv.date, today.toISOString().split('T')[0]);
        totalProfit += profit;
    });
    
    // تسجيل عملية دفع الأرباح
    investor.profits.push({
        date: new Date().toISOString().split('T')[0],
        amount: totalProfit
    });
    
    // إضافة عملية جديدة
    addTransaction('دفع أرباح', investorId, totalProfit, 'دفع أرباح مستحقة');
    
    saveData();
    
    // إغلاق النافذة المنبثقة
    closeModal('pay-profit-modal');
    
    showNotification(`تم دفع الأرباح بمبلغ ${formatCurrency(totalProfit)} للمستثمر ${investor.name} بنجاح!`, 'success');
}


// إضافة إيداع جديد
function addDeposit() {
    console.log('إضافة إيداع جديد...');
    
    const depositInvestorSelect = document.getElementById('deposit-investor');
    const depositAmountInput = document.getElementById('deposit-amount');
    const depositDateInput = document.getElementById('deposit-date');
    const depositNotesInput = document.getElementById('deposit-notes');
    
    if (!depositInvestorSelect || !depositAmountInput || !depositDateInput) {
        showNotification('خطأ في النموذج: بعض الحقول المطلوبة غير موجودة', 'error');
        return;
    }
    
    const investorId = depositInvestorSelect.value;
    const amount = parseFloat(depositAmountInput.value);
    const depositDate = depositDateInput.value;
    const notes = depositNotesInput ? depositNotesInput.value || '' : '';
    
    if (!investorId || isNaN(amount) || amount <= 0 || !depositDate) {
        showNotification('الرجاء إدخال جميع البيانات المطلوبة بشكل صحيح', 'error');
        return;
    }
    
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) {
        showNotification('لم يتم العثور على بيانات المستثمر', 'error');
        return;
    }
    
    // إضافة الاستثمار الجديد
    investor.investments.push({
        amount,
        date: depositDate,
        interest: calculateInterest(amount, depositDate),
        notes
    });
    
    // إضافة عملية جديدة
    addTransaction('إيداع', investorId, amount, notes);
    
    saveData();
    
    // إغلاق النافذة المنبثقة
    closeModal('add-deposit-modal');
    
    showNotification(`تم إضافة إيداع جديد بمبلغ ${amount.toLocaleString()} ${settings.currency} للمستثمر ${investor.name} بنجاح!`, 'success');
}

// سحب مبلغ
function withdrawAmount() {
    console.log('سحب مبلغ...');
    
    const withdrawInvestorSelect = document.getElementById('withdraw-investor');
    const withdrawAmountInput = document.getElementById('withdraw-amount');
    const withdrawDateInput = document.getElementById('withdraw-date');
    const withdrawNotesInput = document.getElementById('withdraw-notes');
    
    if (!withdrawInvestorSelect || !withdrawAmountInput || !withdrawDateInput) {
        showNotification('خطأ في النموذج: بعض الحقول المطلوبة غير موجودة', 'error');
        return;
    }
    
    const investorId = withdrawInvestorSelect.value;
    const amount = parseFloat(withdrawAmountInput.value);
    const withdrawDate = withdrawDateInput.value;
    const notes = withdrawNotesInput ? withdrawNotesInput.value || '' : '';
    
    if (!investorId || isNaN(amount) || amount <= 0 || !withdrawDate) {
        showNotification('الرجاء إدخال جميع البيانات المطلوبة بشكل صحيح', 'error');
        return;
    }
    
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) {
        showNotification('لم يتم العثور على بيانات المستثمر', 'error');
        return;
    }
    
    if (amount > investor.amount) {
        showNotification('مبلغ السحب أكبر من الرصيد المتاح', 'error');
        return;
    }
    
    // البحث عن أقرب استثمار لخصم المبلغ منه
    // نقوم بترتيب الاستثمارات من الأقدم إلى الأحدث
    const sortedInvestments = [...investor.investments].sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });
    
    let remainingWithdrawal = amount;
    
    // معالجة السحب وقطع الفائدة
    for (let i = 0; i < sortedInvestments.length && remainingWithdrawal > 0; i++) {
        const currentInvestment = sortedInvestments[i];
        
        // إذا كان الاستثمار به مبلغ كافٍ للسحب
        if (currentInvestment.amount >= remainingWithdrawal) {
            // خصم المبلغ من الاستثمار
            currentInvestment.amount -= remainingWithdrawal;
            
            // إنشاء استثمار جديد للمبلغ المسحوب مع تاريخ السحب كتاريخ انتهاء
            // وقطع الفائدة عن هذا المبلغ (وضع الفائدة بصفر)
            const withdrawnInvestment = {
                amount: remainingWithdrawal,
                date: currentInvestment.date,
                endDate: withdrawDate,
                interest: 0, // قطع الفائدة
                notes: `تم سحب ${remainingWithdrawal} في ${withdrawDate}`
            };
            
            // إضافة المبلغ المسحوب إلى قائمة السحوبات
            if (!investor.withdrawnInvestments) {
                investor.withdrawnInvestments = [];
            }
            investor.withdrawnInvestments.push(withdrawnInvestment);
            
            // إعادة حساب الفائدة للمبلغ المتبقي
            currentInvestment.interest = calculateInterest(currentInvestment.amount, currentInvestment.date);
            
            remainingWithdrawal = 0;
        }
        // إذا كان المبلغ المطلوب سحبه أكبر من الاستثمار الحالي
        else {
            // سحب كامل الاستثمار
            remainingWithdrawal -= currentInvestment.amount;
            
            // إنشاء استثمار منتهي للمبلغ المسحوب وقطع الفائدة
            const withdrawnInvestment = {
                amount: currentInvestment.amount,
                date: currentInvestment.date,
                endDate: withdrawDate,
                interest: 0, // قطع الفائدة
                notes: `تم سحب ${currentInvestment.amount} في ${withdrawDate}`
            };
            
            // إضافة المبلغ المسحوب إلى قائمة السحوبات
            if (!investor.withdrawnInvestments) {
                investor.withdrawnInvestments = [];
            }
            investor.withdrawnInvestments.push(withdrawnInvestment);
            
            // تصفير هذا الاستثمار
            currentInvestment.amount = 0;
            currentInvestment.interest = 0;
        }
    }
    
    // إضافة السحب إلى قائمة السحوبات
    investor.withdrawals.push({
        date: withdrawDate,
        amount,
        notes
    });
    
    // تحديث رصيد المستثمر الإجمالي
    investor.amount = (investor.amount || 0) - amount;
    
    // إضافة عملية جديدة
    addTransaction('سحب', investorId, amount, notes);
    
    saveData();
    
    // إغلاق النافذة المنبثقة
    closeModal('add-withdraw-modal');
    
    showNotification(`تم سحب مبلغ ${formatCurrency(amount)} من حساب المستثمر ${investor.name} بنجاح!`, 'success');
}

// 5. تعديل دالة عرض رصيد المستثمر للتحقق من المبالغ المسحوبة
function showInvestorBalance() {
    console.log('عرض رصيد المستثمر...');
    
    const withdrawInvestorSelect = document.getElementById('withdraw-investor');
    const balanceInfo = document.getElementById('withdraw-balance-info');
    
    if (!withdrawInvestorSelect || !balanceInfo) return;
    
    const investorId = withdrawInvestorSelect.value;
    
    if (!investorId) {
        balanceInfo.innerHTML = '';
        return;
    }
    
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) {
        balanceInfo.innerHTML = '';
        return;
    }
    
    // الحصول على إجمالي المبلغ المستثمر المتاح للسحب
    const totalInvestment = investor.amount || 0;
    
    // إضافة معلومات إضافية عن السحوبات السابقة
    let withdrawalsHTML = '';
    if (investor.withdrawals && investor.withdrawals.length > 0) {
        withdrawalsHTML = `
            <div class="mt-3">
                <label class="form-label text-warning">تنبيه: سحب المبالغ يؤدي إلى قطع الفائدة عنها للشهر بالكامل</label>
                <div class="recent-withdrawals">
                    <small>آخر السحوبات:</small>
                    <ul class="withdrawal-list">
        `;
        
        // عرض آخر 3 سحوبات
        const recentWithdrawals = investor.withdrawals
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);
            
        recentWithdrawals.forEach(withdrawal => {
            withdrawalsHTML += `
                <li>
                    <span class="date">${withdrawal.date}</span>
                    <span class="amount">${formatCurrency(withdrawal.amount)}</span>
                </li>
            `;
        });
        
        withdrawalsHTML += `
                    </ul>
                </div>
            </div>
        `;
    }
    
    balanceInfo.innerHTML = `
        <label class="form-label">الرصيد المتاح</label>
        <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color); margin-bottom: 1rem;">
            ${formatCurrency(totalInvestment)}
        </div>
        ${withdrawalsHTML}
    `;
}

// 6. إضافة أنماط CSS لتحسين عرض المعلومات المتعلقة بالسحوبات
function addWithdrawalStyles() {
    // التحقق من وجود أنماط مسبقة
    if (document.getElementById('withdrawal-styles')) {
        return;
    }
    
    // إنشاء عنصر نمط جديد
    const styleElement = document.createElement('style');
    styleElement.id = 'withdrawal-styles';
    
    // إضافة أنماط CSS
    styleElement.textContent = `
        /* أنماط لقائمة السحوبات */
        .withdrawal-list {
            list-style: none;
            padding: 0;
            margin: 0.5rem 0;
        }
        
        .withdrawal-list li {
            display: flex;
            justify-content: space-between;
            padding: 0.3rem 0;
            border-bottom: 1px dashed #eee;
            font-size: 0.85rem;
        }
        
        .withdrawal-list .date {
            color: #666;
        }
        
        .withdrawal-list .amount {
            font-weight: 500;
            color: #e74c3c;
        }
        
        /* أنماط للصفوف في جدول الأرباح */
        tr.separator td {
            background-color: #f8f9fa;
            border-top: 2px solid #dee2e6;
            padding: 0.5rem;
            font-size: 0.9rem;
        }
        
        tr.withdrawn {
            color: #6c757d;
            background-color: #f8f9fa;
        }
        
        tr.withdrawn td {
            text-decoration: line-through;
            opacity: 0.8;
        }
        
        tr.withdrawn td:last-child {
            text-decoration: none;
            color: #e74c3c;
        }
        
        tr.withdrawn small {
            display: block;
            text-decoration: none;
            font-style: italic;
            color: #e74c3c;
        }
        
        /* أنماط للتنبيهات */
        .text-warning {
            color: #f39c12;
            font-size: 0.9rem;
            display: block;
            margin-bottom: 0.5rem;
        }
    `;
    
    // إضافة عنصر النمط إلى رأس الصفحة
    document.head.appendChild(styleElement);
    console.log('تم إضافة أنماط CSS للسحوبات');
}

// 7. تطبيق التغييرات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تطبيق إصلاحات معالجة قطع الفائدة عند السحب...');
    
    // استبدال الدوال الأصلية بالدوال المحدثة
    window.calculateInterest = calculateInterest;
    window.withdrawAmount = withdrawAmount;
    window.calculateProfitForInvestor = calculateProfitForInvestor;
    window.payProfit = payProfit;
    window.showInvestorBalance = showInvestorBalance;
    
    // إضافة أنماط CSS
    addWithdrawalStyles();
    
    // إضافة رسالة تنبيه عند فتح نافذة السحب
    const withdrawalModal = document.getElementById('add-withdraw-modal');
    if (withdrawalModal) {
        const modalTitle = withdrawalModal.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.innerHTML = 'سحب <small style="font-size: 0.75rem; color: #e74c3c; display: block; margin-top: 5px;"> (سيتم قطع فائدة المبلغ المسحوب للشهر بالكامل)</small>';
        }
    }
    
    console.log('تم تطبيق الإصلاحات بنجاح');
});
/**
 * إصلاح شامل لمشاكل الإعدادات
 * يستخدم محددات أكثر مرونة للعثور على عناصر النموذج
 */

// حفظ الإعدادات العامة
function saveGeneralSettings() {
    console.log('حفظ الإعدادات العامة...');
    
    try {
        // محاولة العثور على العناصر بعدة طرق
        let systemNameInput = document.querySelector('#general-tab input[type="text"]');
        if (!systemNameInput) {
            systemNameInput = document.querySelector('#general-settings-form input[type="text"]');
        }
        
        let currencySelect = document.querySelector('#general-tab select:nth-of-type(1)');
        if (!currencySelect) {
            currencySelect = document.querySelector('#general-settings-form select:nth-of-type(1)');
        }
        
        let languageSelect = document.querySelector('#general-tab select:nth-of-type(2)');
        if (!languageSelect) {
            languageSelect = document.querySelector('#general-settings-form select:nth-of-type(2)');
        }
        
        // إذا لم نتمكن من العثور على العناصر، سنعرض رسالة توضيحية
        if (!systemNameInput || !currencySelect || !languageSelect) {
            console.error('بعض حقول الإعدادات العامة غير موجودة', {
                systemName: !!systemNameInput,
                currency: !!currencySelect,
                language: !!languageSelect
            });
            
            // تجربة استخدام selectors مختلفة
            const allInputs = document.querySelectorAll('#general-settings-form input, #general-tab input');
            const allSelects = document.querySelectorAll('#general-settings-form select, #general-tab select');
            
            console.log('عدد عناصر الإدخال المتاحة:', allInputs.length);
            console.log('عدد عناصر الاختيار المتاحة:', allSelects.length);
            
            // استخدام عناصر متاحة إذا وجدت
            if (!systemNameInput && allInputs.length > 0) {
                systemNameInput = allInputs[0];
                console.log('تم استخدام أول عنصر إدخال متاح');
            }
            
            if (!currencySelect && allSelects.length > 0) {
                currencySelect = allSelects[0];
                console.log('تم استخدام أول عنصر اختيار متاح');
            }
            
            if (!languageSelect && allSelects.length > 1) {
                languageSelect = allSelects[1];
                console.log('تم استخدام ثاني عنصر اختيار متاح');
            }
            
            // إذا لم نجد أي عناصر، نعرض رسالة خطأ ونتوقف
            if (!systemNameInput || !currencySelect || !languageSelect) {
                showNotification('لم يتم العثور على بعض عناصر النموذج. يرجى التحقق من الصفحة.', 'error');
                return;
            }
        }
        
        // تحديث الإعدادات بالقيم الموجودة
        settings.systemName = systemNameInput.value;
        settings.currency = currencySelect.value;
        settings.language = languageSelect.value;
        
        // حفظ الإعدادات
        if (saveData()) {
            // تحديث عنوان الصفحة
            document.title = settings.systemName;
            
            showNotification('تم حفظ الإعدادات العامة بنجاح', 'success');
        } else {
            showNotification('حدث خطأ أثناء حفظ الإعدادات', 'error');
        }
    } catch (error) {
        console.error('خطأ في حفظ الإعدادات العامة:', error);
        showNotification('حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.', 'error');
    }
}

// حفظ إعدادات الأرباح
function saveProfitsSettings() {
    console.log('حفظ إعدادات الأرباح...');
    
    try {
        // محاولة العثور على العناصر بعدة طرق
        let interestRateInput = document.getElementById('interest-rate-setting');
        if (!interestRateInput) {
            interestRateInput = document.querySelector('#profits-settings-form input[type="number"]');
        }
        
        let profitCalculationSelect = document.querySelector('#profits-tab select[name="profit-calculation"]');
        if (!profitCalculationSelect) {
            profitCalculationSelect = document.querySelector('#profits-settings-form select:nth-of-type(1)');
        }
        
        let profitCycleSelect = document.querySelector('#profits-tab select[name="profit-cycle"]');
        if (!profitCycleSelect) {
            profitCycleSelect = document.querySelector('#profits-settings-form select:nth-of-type(2)');
        }
        
        // عرض توضيح للعناصر المتاحة إذا لم نجد ما نبحث عنه
        if (!interestRateInput || !profitCalculationSelect || !profitCycleSelect) {
            console.error('بعض حقول إعدادات الأرباح غير موجودة', {
                interestRate: !!interestRateInput,
                profitCalculation: !!profitCalculationSelect,
                profitCycle: !!profitCycleSelect
            });
            
            // تجربة استخدام selectors مختلفة
            const allInputs = document.querySelectorAll('#profits-settings-form input, #profits-tab input');
            const allSelects = document.querySelectorAll('#profits-settings-form select, #profits-tab select');
            
            console.log('عدد عناصر الإدخال المتاحة:', allInputs.length);
            console.log('عدد عناصر الاختيار المتاحة:', allSelects.length);
            
            // استخدام عناصر متاحة إذا وجدت
            if (!interestRateInput && allInputs.length > 0) {
                interestRateInput = allInputs[0];
                console.log('تم استخدام أول عنصر إدخال متاح');
            }
            
            if (!profitCalculationSelect && allSelects.length > 0) {
                profitCalculationSelect = allSelects[0];
                console.log('تم استخدام أول عنصر اختيار متاح');
            }
            
            if (!profitCycleSelect && allSelects.length > 1) {
                profitCycleSelect = allSelects[1];
                console.log('تم استخدام ثاني عنصر اختيار متاح');
            }
            
            // إذا لم نجد أي عناصر، نعرض رسالة خطأ ونتوقف
            if (!interestRateInput || !profitCalculationSelect || !profitCycleSelect) {
                showNotification('لم يتم العثور على بعض عناصر النموذج. يرجى التحقق من الصفحة.', 'error');
                return;
            }
        }
        
        // التحقق من قيم الحقول
        const interestRate = parseFloat(interestRateInput.value);
        if (isNaN(interestRate) || interestRate < 0 || interestRate > 100) {
            showNotification('يرجى إدخال نسبة ربح صحيحة بين 0 و 100', 'error');
            return;
        }
        
        // تحديث إعدادات النظام
        settings.interestRate = interestRate;
        settings.profitCalculation = profitCalculationSelect.value;
        settings.profitCycle = parseInt(profitCycleSelect.value);
        
        // حفظ الإعدادات
        if (saveData()) {
            // تحديث عرض نسبة الفائدة في لوحة التحكم
            const interestRateEl = document.getElementById('interest-rate');
            if (interestRateEl) {
                interestRateEl.textContent = `${settings.interestRate}%`;
            }
            
            showNotification('تم حفظ إعدادات الأرباح بنجاح', 'success');
        } else {
            showNotification('حدث خطأ أثناء حفظ الإعدادات', 'error');
        }
    } catch (error) {
        console.error('خطأ في حفظ إعدادات الأرباح:', error);
        showNotification('حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.', 'error');
    }
}

// حفظ إعدادات الإشعارات
function saveNotificationsSettings() {
    console.log('حفظ إعدادات الإشعارات...');
    
    try {
        // محاولة العثور على العناصر بعدة طرق
        let reminderDaysInput = document.getElementById('reminder-days');
        if (!reminderDaysInput) {
            reminderDaysInput = document.querySelector('#notifications-settings-form input[type="number"]');
        }
        
        let emailNewInvestorCheck = document.getElementById('email-new-investor');
        let emailProfitPaymentCheck = document.getElementById('email-profit-payment');
        let emailWithdrawalCheck = document.getElementById('email-withdrawal');
        
        // إذا لم يتم العثور على عناصر التحقق، نبحث عن جميع مربعات الاختيار
        const checkboxes = document.querySelectorAll('#notifications-settings-form input[type="checkbox"]');
        if ((!emailNewInvestorCheck || !emailProfitPaymentCheck || !emailWithdrawalCheck) && checkboxes.length >= 3) {
            emailNewInvestorCheck = checkboxes[0];
            emailProfitPaymentCheck = checkboxes[1];
            emailWithdrawalCheck = checkboxes[2];
        }
        
        // التحقق من وجود العناصر
        if (!reminderDaysInput || !emailNewInvestorCheck || !emailProfitPaymentCheck || !emailWithdrawalCheck) {
            console.error('بعض حقول إعدادات الإشعارات غير موجودة', {
                reminderDays: !!reminderDaysInput,
                emailNewInvestor: !!emailNewInvestorCheck,
                emailProfitPayment: !!emailProfitPaymentCheck,
                emailWithdrawal: !!emailWithdrawalCheck
            });
            
            showNotification('لم يتم العثور على بعض عناصر النموذج. يرجى التحقق من الصفحة.', 'error');
            return;
        }
        
        // التحقق من قيم الحقول
        const reminderDays = parseInt(reminderDaysInput.value);
        if (isNaN(reminderDays) || reminderDays < 1 || reminderDays > 30) {
            showNotification('يرجى إدخال عدد أيام تذكير صحيح بين 1 و 30', 'error');
            return;
        }
        
        // تحديث إعدادات النظام
        settings.reminderDays = reminderDays;
        settings.emailNotifications = {
            newInvestor: emailNewInvestorCheck.checked,
            profitPayment: emailProfitPaymentCheck.checked,
            withdrawal: emailWithdrawalCheck.checked
        };
        
        // حفظ الإعدادات
        if (saveData()) {
            showNotification('تم حفظ إعدادات الإشعارات بنجاح', 'success');
        } else {
            showNotification('حدث خطأ أثناء حفظ الإعدادات', 'error');
        }
    } catch (error) {
        console.error('خطأ في حفظ إعدادات الإشعارات:', error);
        showNotification('حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.', 'error');
    }
}

/**
 * وظيفة إضافية لإظهار العناصر الموجودة في الصفحة للمساعدة في تشخيص المشكلة
 */
function debugForms() {
    console.log('=== تشخيص النماذج ===');
    
    // إعدادات عامة
    const generalForm = document.getElementById('general-settings-form');
    console.log('نموذج الإعدادات العامة موجود:', !!generalForm);
    if (generalForm) {
        console.log('الحقول في نموذج الإعدادات العامة:', {
            inputs: generalForm.querySelectorAll('input').length,
            selects: generalForm.querySelectorAll('select').length,
            buttons: generalForm.querySelectorAll('button').length
        });
    }
    
    // إعدادات الأرباح
    const profitsForm = document.getElementById('profits-settings-form');
    console.log('نموذج إعدادات الأرباح موجود:', !!profitsForm);
    if (profitsForm) {
        console.log('الحقول في نموذج إعدادات الأرباح:', {
            inputs: profitsForm.querySelectorAll('input').length,
            selects: profitsForm.querySelectorAll('select').length,
            buttons: profitsForm.querySelectorAll('button').length
        });
    }
    
    // إعدادات الإشعارات
    const notificationsForm = document.getElementById('notifications-settings-form');
    console.log('نموذج إعدادات الإشعارات موجود:', !!notificationsForm);
    if (notificationsForm) {
        console.log('الحقول في نموذج إعدادات الإشعارات:', {
            inputs: notificationsForm.querySelectorAll('input').length,
            selects: notificationsForm.querySelectorAll('select').length,
            buttons: notificationsForm.querySelectorAll('button').length
        });
    }
    
    // البحث عن عناصر محددة
    console.log('العناصر المحددة:', {
        'interest-rate-setting': !!document.getElementById('interest-rate-setting'),
        'reminder-days': !!document.getElementById('reminder-days'),
        'email-new-investor': !!document.getElementById('email-new-investor'),
        'email-profit-payment': !!document.getElementById('email-profit-payment'),
        'email-withdrawal': !!document.getElementById('email-withdrawal')
    });
    
    // عرض كل النماذج
    console.log('جميع النماذج في الصفحة:', document.querySelectorAll('form').length);
    
    // عرض كل علامات التبويب
    console.log('علامات التبويب:', {
        'general-tab': !!document.getElementById('general-tab'),
        'profits-tab': !!document.getElementById('profits-tab'),
        'notifications-tab': !!document.getElementById('notifications-tab'),
        'backup-tab': !!document.getElementById('backup-tab')
    });
}

// استدعاء دالة التشخيص عند فتح صفحة الإعدادات
document.addEventListener('page:change', function(e) {
    if (e.detail.page === 'settings') {
        // تأخير التشخيص للتأكد من تحميل جميع العناصر
        setTimeout(debugForms, 500);
    }
});
// تحديث لوحة التحكم الرئيسية
function updateDashboard() {
    console.log('تحديث لوحة التحكم...');
    
    // تحديث إجمالي الاستثمارات
    const totalInvestments = investors.reduce((sum, investor) => sum + (investor.amount || 0), 0);
    const totalInvestmentsElement = document.getElementById('total-investments');
    if (totalInvestmentsElement) {
        totalInvestmentsElement.textContent = `${totalInvestments.toLocaleString()} ${settings.currency}`;
    }
    
    // تحديث الأرباح الشهرية
    const monthlyProfits = calculateMonthlyProfits();
    const monthlyProfitsElement = document.getElementById('monthly-profits');
    if (monthlyProfitsElement) {
        monthlyProfitsElement.textContent = `${monthlyProfits.toLocaleString()} ${settings.currency}`;
    }
    
    // تحديث عدد المستثمرين
    const investorsCountElement = document.getElementById('investors-count');
    if (investorsCountElement) {
        investorsCountElement.textContent = investors.length;
    }
    
    // تحديث نسبة العائد
    const interestRateElement = document.getElementById('interest-rate');
    if (interestRateElement) {
        interestRateElement.textContent = `${settings.interestRate}%`;
    }
    
    // تحديث الرسوم البيانية
    updateCharts();
}

// حساب الأرباح الشهرية
function calculateMonthlyProfits() {
    console.log('حساب الأرباح الشهرية...');
    
    // التأكد من وجود مصفوفة المستثمرين
    if (!Array.isArray(investors) || investors.length === 0) {
        return 0;
    }
    
    return investors.reduce((sum, investor) => {
        // التحقق من وجود المستثمر واستثماراته
        if (!investor || !investor.investments || !Array.isArray(investor.investments)) {
            return sum;
        }
        
        const monthlyProfit = investor.investments.reduce((total, investment) => {
            if (!investment || !investment.amount) {
                return total;
            }
            return total + calculateInterest(investment.amount, investment.date);
        }, 0);
        
        return sum + monthlyProfit;
    }, 0);
}

// ملء قوائم اختيار المستثمرين
function populateInvestorSelects() {
    console.log('ملء قوائم المستثمرين...');
    
    const depositInvestorSelect = document.getElementById('deposit-investor');
    const withdrawInvestorSelect = document.getElementById('withdraw-investor');
    const profitInvestorSelect = document.getElementById('profit-investor');
    
    // تجهيز قائمة المستثمرين مرتبة أبجديًا
    const sortedInvestors = [...investors].sort((a, b) => a.name.localeCompare(b.name));
    
    // ملء قائمة الإيداع
    if (depositInvestorSelect) {
        depositInvestorSelect.innerHTML = '<option value="">اختر المستثمر</option>';
        sortedInvestors.forEach(investor => {
            const option = document.createElement('option');
            option.value = investor.id;
            option.textContent = `${investor.name} (${investor.phone})`;
            depositInvestorSelect.appendChild(option);
        });
    }
    
    // ملء قائمة السحب
    if (withdrawInvestorSelect) {
        withdrawInvestorSelect.innerHTML = '<option value="">اختر المستثمر</option>';
        sortedInvestors.forEach(investor => {
            const option = document.createElement('option');
            option.value = investor.id;
            option.textContent = `${investor.name} (${investor.phone})`;
            withdrawInvestorSelect.appendChild(option);
        });
    }
    
    // ملء قائمة الأرباح
    if (profitInvestorSelect) {
        profitInvestorSelect.innerHTML = '<option value="">اختر المستثمر</option>';
        sortedInvestors.forEach(investor => {
            const option = document.createElement('option');
            option.value = investor.id;
            option.textContent = `${investor.name} (${investor.phone})`;
            profitInvestorSelect.appendChild(option);
        });
    }
}

/**
 * تحديث لإصلاح خطأ في دالة renderInvestorsTable
 * يجب استبدال الكود التالي في ملف app-fixed.js
 */

// عرض جدول المستثمرين
function renderInvestorsTable() {
    console.log('عرض جدول المستثمرين...');
    
    const tableBody = document.querySelector('#investors-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // ترتيب المستثمرين حسب تاريخ الإضافة (الأحدث أولاً)
    const sortedInvestors = [...investors].sort((a, b) => {
        return new Date(b.createdAt || b.joinDate) - new Date(a.createdAt || a.joinDate);
    });
    
    sortedInvestors.forEach(investor => {
        const row = document.createElement('tr');
        
        // حساب الربح الشهري - مع التحقق من وجود المصفوفة قبل استخدام reduce
        let monthlyProfit = 0;
        if (investor.investments && Array.isArray(investor.investments)) {
            monthlyProfit = investor.investments.reduce((total, inv) => {
                return total + calculateInterest(inv.amount, inv.date);
            }, 0);
        } else {
            // إذا لم تكن المصفوفة موجودة، نحسب الربح على المبلغ الإجمالي
            monthlyProfit = calculateInterest(investor.amount, investor.joinDate || investor.createdAt);
        }
        
        // تنسيق تاريخ الانضمام
        const joinDate = investor.joinDate || investor.createdAt || '';
        
        row.innerHTML = `
            <td>${investor.id}</td>
            <td>
                <div class="investor-info">
                    <div class="investor-avatar">${investor.name.charAt(0)}</div>
                    <div>
                        <div class="investor-name">${investor.name}</div>
                        <div class="investor-phone">${investor.phone}</div>
                    </div>
                </div>
            </td>
            <td>${investor.phone}</td>
            <td>${(investor.amount || 0).toLocaleString()} ${settings.currency}</td>
            <td>${monthlyProfit.toLocaleString()} ${settings.currency}</td>
            <td>${joinDate}</td>
            <td><span class="badge badge-success">نشط</span></td>
            <td>
                <div class="investor-actions">
                    <button class="investor-action-btn view-investor" data-id="${investor.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="investor-action-btn edit edit-investor" data-id="${investor.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="investor-action-btn delete delete-investor" data-id="${investor.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // إضافة مستمعي الأحداث للأزرار
        const viewButton = row.querySelector('.view-investor');
        const editButton = row.querySelector('.edit-investor');
        const deleteButton = row.querySelector('.delete-investor');
        
        if (viewButton) {
            viewButton.addEventListener('click', () => {
                showInvestorDetails(investor.id);
            });
        }
        
        if (editButton) {
            editButton.addEventListener('click', () => {
                editInvestor(investor.id);
            });
        }
        
        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                deleteInvestor(investor.id);
            });
        }
    });
    
    if (sortedInvestors.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="8" class="text-center">لا يوجد مستثمرين</td>';
        tableBody.appendChild(emptyRow);
    }
}

/**
 * إصلاح آخر لمشكلة محتملة في إضافة مستثمر جديد
 */

/**
 * إصلاح مشكلة عرض المبالغ المالية المزدوجة في نظام الاستثمار المتكامل
 * 
 * المشكلة: عند إضافة استثمار جديد، يظهر المبلغ مضاعفاً في تفاصيل المستثمر والعمليات
 * الحل: تعديل الدوال المسؤولة عن إضافة المستثمرين والعمليات لمنع الإضافة المزدوجة للمبالغ
 */

// 1. تعديل دالة إضافة مستثمر جديد
function addNewInvestor() {
    console.log('إضافة مستثمر جديد (بعد الإصلاح)...');
    
    const nameInput = document.getElementById('investor-name');
    const phoneInput = document.getElementById('investor-phone');
    const addressInput = document.getElementById('investor-address');
    const cardInput = document.getElementById('investor-card');
    const depositDateInput = document.getElementById('investor-deposit-date');
    const amountInput = document.getElementById('investor-amount');

    if (!nameInput || !phoneInput || !addressInput || !cardInput || !depositDateInput || !amountInput) {
        showNotification('خطأ في النموذج: بعض الحقول المطلوبة غير موجودة', 'error');
        return;
    }

    const name = nameInput.value;
    const phone = phoneInput.value;
    const address = addressInput.value;
    const cardNumber = cardInput.value;
    const depositDate = depositDateInput.value;
    const amount = parseFloat(amountInput.value);

    if (!name || !phone || !address || !cardNumber || !depositDate || isNaN(amount) || amount <= 0) {
        showNotification('يرجى إدخال جميع البيانات المطلوبة بشكل صحيح', 'error');
        return;
    }

    // حساب الفائدة المتوقعة
    const interest = calculateInterest(amount, depositDate);

    const newInvestor = {
        id: Date.now().toString(),
        name,
        phone,
        address,
        cardNumber,
        joinDate: depositDate,
        createdAt: new Date().toISOString(),
        status: 'نشط',
        investments: [
            {
                amount,
                date: depositDate,
                interest: interest
            }
        ],
        profits: [],
        withdrawals: [],
        // تعيين المبلغ الإجمالي مباشرة دون إضافته مرة أخرى
        amount: amount // هذا هو المبلغ الأصلي الذي سيظهر في التفاصيل
    };

    investors.push(newInvestor);

    // إضافة عملية جديدة بنوع "إيداع"
    // تم تغيير الدالة لتجنب إضافة المبلغ مرة أخرى إلى رصيد المستثمر
    addTransaction('إيداع', newInvestor.id, amount, '', true);

    // حفظ البيانات
    saveData();
    
    // إطلاق حدث تحديث المستثمرين
    document.dispatchEvent(new CustomEvent('investor:update'));
    
    // إغلاق النافذة المنبثقة
    closeModal('add-investor-modal');
    
    // عرض إشعار النجاح
    showNotification(`تمت إضافة المستثمر ${name} بنجاح!`, 'success');
}

// 2. تعديل دالة إضافة عملية جديدة لمنع الإضافة المزدوجة للمبالغ
function addTransaction(type, investorId, amount, notes = '', isInitialDeposit = false) {
    console.log(`إضافة عملية ${type} بقيمة ${amount} للمستثمر ${investorId}`);
    
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) {
        console.error(`لم يتم العثور على المستثمر: ${investorId}`);
        return null;
    }
    
    // تحديد رصيد المستثمر بعد العملية
    let balanceAfter = 0;
    
    // الفرق الرئيسي: إذا كانت هذه هي العملية الأولى (الإيداع الأولي)، لا نقوم بتحديث الرصيد
    // لأننا قمنا بتعيينه بالفعل عند إنشاء المستثمر
    if (type === 'إيداع' && !isInitialDeposit) {
        // تحديث رصيد المستثمر في حالة الإيداع الجديد (ليس الإيداع الأولي)
        investor.amount = (investor.amount || 0) + amount;
        balanceAfter = investor.amount;
    } else if (type === 'سحب') {
        // تحديث رصيد المستثمر في حالة السحب
        investor.amount = (investor.amount || 0) - amount;
        balanceAfter = investor.amount;
    } else {
        // في حالة الأرباح أو الإيداع الأولي، لا نغير الرصيد الأساسي
        balanceAfter = investor.amount || 0;
    }
    
    const newTransaction = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        type,
        investorId,
        investorName: investor ? investor.name : 'غير معروف',
        amount,
        balanceAfter,
        notes
    };
    
    transactions.push(newTransaction);
    saveData();
    
    // إطلاق حدث تحديث العمليات
    document.dispatchEvent(new CustomEvent('transaction:update'));
    
    return newTransaction;
}

// 3. تعديل دالة إضافة إيداع جديد لمستثمر موجود
function addDeposit() {
    console.log('إضافة إيداع جديد (بعد الإصلاح)...');
    
    const depositInvestorSelect = document.getElementById('deposit-investor');
    const depositAmountInput = document.getElementById('deposit-amount');
    const depositDateInput = document.getElementById('deposit-date');
    const depositNotesInput = document.getElementById('deposit-notes');
    
    if (!depositInvestorSelect || !depositAmountInput || !depositDateInput) {
        showNotification('خطأ في النموذج: بعض الحقول المطلوبة غير موجودة', 'error');
        return;
    }
    
    const investorId = depositInvestorSelect.value;
    const amount = parseFloat(depositAmountInput.value);
    const depositDate = depositDateInput.value;
    const notes = depositNotesInput ? depositNotesInput.value || '' : '';
    
    if (!investorId || isNaN(amount) || amount <= 0 || !depositDate) {
        showNotification('الرجاء إدخال جميع البيانات المطلوبة بشكل صحيح', 'error');
        return;
    }
    
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) {
        showNotification('لم يتم العثور على بيانات المستثمر', 'error');
        return;
    }
    
    // إضافة الاستثمار الجديد إلى قائمة استثمارات المستثمر
    investor.investments.push({
        amount,
        date: depositDate,
        interest: calculateInterest(amount, depositDate),
        notes
    });
    
    // إضافة عملية جديدة - نمرر false لتمكين تحديث الرصيد
    addTransaction('إيداع', investorId, amount, notes, false);
    
    saveData();
    
    // إغلاق النافذة المنبثقة
    closeModal('add-deposit-modal');
    
    showNotification(`تم إضافة إيداع جديد بمبلغ ${formatCurrency(amount)} للمستثمر ${investor.name} بنجاح!`, 'success');
}

// 4. التأكد من صحة عرض تفاصيل المستثمر
function showInvestorDetails(investorId) {
    console.log(`عرض تفاصيل المستثمر (بعد الإصلاح): ${investorId}`);
    
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) {
        showNotification('لم يتم العثور على المستثمر', 'error');
        return;
    }
    
    // استخدام القيمة الفعلية للمبلغ المستثمر
    const totalInvestment = investor.amount || 0;
    const monthlyProfit = investor.investments.reduce((total, inv) => {
        return total + calculateInterest(inv.amount, inv.date);
    }, 0);
    
    // حساب مدة الاستثمار
    const startDate = new Date(investor.joinDate || investor.createdAt);
    const today = new Date();
    const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    
    // الحصول على عمليات المستثمر
    const investorTransactions = transactions.filter(tr => tr.investorId === investorId);
    
    // إنشاء محتوى النافذة المنبثقة
    const content = `
        <div class="investor-profile">
            <div class="investor-avatar large">${investor.name.charAt(0)}</div>
            <h2 class="investor-fullname">${investor.name}</h2>
            <span class="badge badge-success">${investor.status || 'نشط'}</span>
        </div>
        
        <div class="investor-stats">
            <div class="stat-item">
                <div class="stat-value">${formatCurrency(totalInvestment)}</div>
                <div class="stat-label">إجمالي الاستثمار</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${formatCurrency(monthlyProfit)}</div>
                <div class="stat-label">الربح الشهري</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${daysPassed} يوم</div>
                <div class="stat-label">مدة الاستثمار</div>
            </div>
        </div>
        
        <div class="detail-group">
            <h3 class="detail-group-title">معلومات الاتصال</h3>
            <div class="detail-item">
                <div class="detail-label">رقم الهاتف</div>
                <div class="detail-value">${investor.phone}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">العنوان</div>
                <div class="detail-value">${investor.address || 'غير محدد'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">رقم البطاقة</div>
                <div class="detail-value">${investor.cardNumber || 'غير محدد'}</div>
            </div>
        </div>
        
        <div class="detail-group">
            <h3 class="detail-group-title">آخر العمليات</h3>
            <div class="mini-table-container">
                <table class="mini-table">
                    <thead>
                        <tr>
                            <th>التاريخ</th>
                            <th>النوع</th>
                            <th>المبلغ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${investorTransactions.length > 0 ? 
                            investorTransactions.slice(0, 5).map(tr => `
                                <tr>
                                    <td>${tr.date}</td>
                                    <td>${tr.type}</td>
                                    <td>${formatCurrency(tr.amount)}</td>
                                </tr>
                            `).join('') : 
                            '<tr><td colspan="3">لا توجد عمليات</td></tr>'
                        }
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="investor-actions-big">
            <button class="btn btn-primary" onclick="editInvestor('${investorId}')">
                <i class="fas fa-edit"></i> تعديل البيانات
            </button>
            <button class="btn btn-success" onclick="openProfitModal('${investorId}')">
                <i class="fas fa-coins"></i> دفع الأرباح
            </button>
            <button class="btn btn-danger" onclick="deleteInvestor('${investorId}')">
                <i class="fas fa-trash"></i> حذف المستثمر
            </button>
        </div>
        <td>
  <button class="btn btn-sm btn-outline edit-transaction" data-id="${txn.id}">
    <i class="fas fa-edit"></i>
  </button>
</td>

    `;
    
    // عرض النافذة المنبثقة
    showModal(`تفاصيل المستثمر - ${investor.name}`, content);
}

// 5. تصحيح طريقة عرض تفاصيل العمليات
function showTransactionDetails(transactionId) {
    console.log(`عرض تفاصيل العملية (بعد الإصلاح): ${transactionId}`);
    
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) {
        showNotification('لم يتم العثور على العملية', 'error');
        return;
    }
    
    const investor = investors.find(i => i.id === transaction.investorId);
    const investorName = investor ? investor.name : transaction.investorName || 'غير معروف';
    
    let typeClass = '';
    switch(transaction.type) {
        case 'إيداع':
            typeClass = 'success';
            break;
        case 'سحب':
            typeClass = 'danger';
            break;
        case 'دفع أرباح':
            typeClass = 'info';
            break;
        default:
            typeClass = 'primary';
    }
    
    // إنشاء محتوى النافذة المنبثقة
    const content = `
        <div class="transaction-details">
            <div class="transaction-header">
                <span class="badge badge-${typeClass}">${transaction.type}</span>
                <span class="transaction-date">${transaction.date}</span>
            </div>
            <div class="transaction-body">
                <div class="detail-item">
                    <div class="detail-label">رقم العملية</div>
                    <div class="detail-value">${transaction.id}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">المستثمر</div>
                    <div class="detail-value">${investorName}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">نوع العملية</div>
                    <div class="detail-value">${transaction.type}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">تاريخ العملية</div>
                    <div class="detail-value">${transaction.date}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">المبلغ</div>
                    <div class="detail-value">${formatCurrency(transaction.amount)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">الرصيد بعد العملية</div>
                    <div class="detail-value">${transaction.balanceAfter ? formatCurrency(transaction.balanceAfter) : '-'}</div>
                </div>
                ${transaction.notes ? `
                <div class="detail-item">
                    <div class="detail-label">ملاحظات</div>
                    <div class="detail-value">${transaction.notes}</div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // عرض النافذة المنبثقة
    showModal('تفاصيل العملية', content);
}

// 6. نسخة محسنة من تهيئة التطبيق تقوم بإصلاح البيانات الموجودة
function fixExistingData() {
    console.log('إصلاح البيانات الموجودة...');
    
    // البحث عن المستثمرين الذين قد يكون لديهم مبالغ مضاعفة
    let fixedCount = 0;
    
    investors.forEach(investor => {
        // حساب إجمالي مبالغ الاستثمارات الفعلية
        const totalInvestmentsAmount = investor.investments.reduce((sum, inv) => sum + inv.amount, 0);
        
        // حساب إجمالي عمليات الإيداع المرتبطة بالمستثمر
        const totalDeposits = transactions
            .filter(tr => tr.investorId === investor.id && tr.type === 'إيداع')
            .reduce((sum, tr) => sum + tr.amount, 0);
            
        // حساب إجمالي عمليات السحب المرتبطة بالمستثمر
        const totalWithdrawals = transactions
            .filter(tr => tr.investorId === investor.id && tr.type === 'سحب')
            .reduce((sum, tr) => sum + tr.amount, 0);
        
        // المبلغ الصحيح المفترض أن يكون للمستثمر (الإيداعات - السحوبات)
        const correctAmount = totalDeposits - totalWithdrawals;
        
        // إذا كان الفرق كبير، نقوم بتصحيح المبلغ
        if (Math.abs(investor.amount - correctAmount) > 1) {
            console.log(`تصحيح مبلغ المستثمر ${investor.name} من ${investor.amount} إلى ${correctAmount}`);
            investor.amount = correctAmount;
            
            // تحديث آخر عملية للمستثمر لتعكس الرصيد الصحيح
            const lastTransaction = transactions
                .filter(tr => tr.investorId === investor.id)
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                
            if (lastTransaction) {
                lastTransaction.balanceAfter = correctAmount;
            }
            
            fixedCount++;
        }
    });
    
    if (fixedCount > 0) {
        saveData();
        console.log(`تم إصلاح ${fixedCount} من سجلات المستثمرين`);
        return true;
    }
    
    return false;
}

// تطبيق الإصلاحات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تطبيق إصلاحات عرض المبالغ المزدوجة...');
    
    // استبدال الدوال الأصلية بالدوال المصححة
    window.addNewInvestor = addNewInvestor;
    window.addTransaction = addTransaction;
    window.addDeposit = addDeposit;
    window.showInvestorDetails = showInvestorDetails;
    window.showTransactionDetails = showTransactionDetails;
    
    // محاولة إصلاح البيانات الموجودة
    setTimeout(() => {
        if (fixExistingData()) {
            // تحديث واجهة المستخدم بعد إصلاح البيانات
            updateDashboard();
            renderInvestorsTable();
            renderTransactionsTable();
            renderProfitsTable();
            renderRecentTransactions();
            
            showNotification('تم إصلاح المبالغ المضاعفة في البيانات', 'success');
        }
    }, 2000);
});


/**
 * سكربت تصحيح أرصدة المستثمرين الموجودة
 * يقوم هذا السكربت بالتحقق من صحة أرصدة المستثمرين الحاليين وتصحيحها
 * لاستخدامه، انسخ الكود وألصقه في وحدة تحكم المتصفح (F12 ثم Console)
 */

(function() {
    // دالة لتنسيق المبالغ المالية للعرض
    function formatAmount(amount) {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return "0";
        }
        return amount.toLocaleString();
    }

    // 1. عرض حالة البيانات الحالية
    console.log("=== تشخيص مشكلة المبالغ المضاعفة ===");
    console.log(`عدد المستثمرين: ${investors.length}`);
    console.log(`عدد العمليات: ${transactions.length}`);

    // 2. التحقق من كل مستثمر
    const problemsFound = [];
    
    investors.forEach(investor => {
        // حساب إجمالي الإيداعات
        const totalDeposits = transactions
            .filter(tr => tr.investorId === investor.id && tr.type === 'إيداع')
            .reduce((sum, tr) => sum + tr.amount, 0);
        
        // حساب إجمالي السحوبات
        const totalWithdrawals = transactions
            .filter(tr => tr.investorId === investor.id && tr.type === 'سحب')
            .reduce((sum, tr) => sum + tr.amount, 0);
        
        // الرصيد الفعلي المفترض
        const expectedBalance = totalDeposits - totalWithdrawals;
        
        // مقارنة مع الرصيد المخزن للمستثمر
        if (Math.abs(investor.amount - expectedBalance) > 1) {
            problemsFound.push({
                investorId: investor.id,
                investorName: investor.name,
                storedAmount: investor.amount,
                expectedAmount: expectedBalance,
                difference: investor.amount - expectedAmount
            });
        }
    });

    // 3. عرض المشاكل التي تم اكتشافها
    if (problemsFound.length > 0) {
        console.log(`تم اكتشاف ${problemsFound.length} من المشاكل في أرصدة المستثمرين:`);
        console.table(problemsFound.map(p => ({
            "المستثمر": p.investorName,
            "المبلغ المخزن": formatAmount(p.storedAmount),
            "المبلغ المتوقع": formatAmount(p.expectedAmount),
            "الفرق": formatAmount(p.difference)
        })));
    } else {
        console.log("لم يتم اكتشاف أي مشاكل في أرصدة المستثمرين");
    }

    // 4. السؤال عن رغبة المستخدم في تصحيح المشاكل
    if (problemsFound.length > 0) {
        const shouldFix = confirm(`تم اكتشاف ${problemsFound.length} من المشاكل في أرصدة المستثمرين. هل ترغب في تصحيح هذه المشاكل؟`);
        
        if (shouldFix) {
            // 5. تصحيح المشاكل
            let fixedCount = 0;
            
            problemsFound.forEach(problem => {
                const investor = investors.find(inv => inv.id === problem.investorId);
                if (investor) {
                    investor.amount = problem.expectedAmount;
                    
                    // تحديث آخر عملية للمستثمر لتعكس الرصيد الصحيح
                    const lastTransaction = transactions
                        .filter(tr => tr.investorId === investor.id)
                        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                        
                    if (lastTransaction) {
                        lastTransaction.balanceAfter = problem.expectedAmount;
                    }
                    
                    fixedCount++;
                }
            });
            
            // 6. حفظ البيانات
            localStorage.setItem('investors', JSON.stringify(investors));
            localStorage.setItem('transactions', JSON.stringify(transactions));
            
            console.log(`تم تصحيح ${fixedCount} من سجلات المستثمرين`);
            alert(`تم تصحيح ${fixedCount} من سجلات المستثمرين. الرجاء تحديث الصفحة لتطبيق التغييرات.`);
        }
    }
    
    // 7. نصائح إضافية
    console.log("=== نصائح إضافية ===");
    console.log("1. قم بتحديث الصفحة بعد إجراء التصحيحات");
    console.log("2. جرب إضافة مستثمر جديد للتأكد من أن المشكلة لم تعد موجودة");
    console.log("3. قم بتنزيل نسخة احتياطية من البيانات بعد التصحيح");
})();



document.querySelectorAll('input[type="date"]').forEach(input => {
    input.addEventListener('change', function () {
        const selected = new Date(this.value);
        const today = new Date();
        const days = Math.floor((today - selected) / (1000 * 60 * 60 * 24));
        const message = isNaN(days) ? '' : `(${days} يوم منذ هذا التاريخ)`;

        const msgBox = this.parentElement.querySelector('.days-since-text');
        if (msgBox) {
            msgBox.textContent = message;
        } else {
            const span = document.createElement('small');
            span.className = 'days-since-text';
            span.style.color = '#888';
            span.textContent = message;
            this.parentElement.appendChild(span);
        }
    });
});



/**
 * إصلاح للتأكد من عدم استخدام خصائص undefined أثناء حساب الفائدة
 */

// حساب الفائدة
function calculateInterest(amount, startDate, endDate = null) {
    // التأكد من وجود القيم قبل استخدامها
    if (!amount || isNaN(amount) || amount <= 0) {
        return 0;
    }

    if (!startDate) {
        startDate = new Date().toISOString().split('T')[0];
    }

    const rate = settings.interestRate / 100;
    
    // استخدام تاريخ نهاية محدد أو تاريخ اليوم
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    // حساب عدد الأيام
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    // عدد الأيام في الشهر (أو الدورة)
    const daysInCycle = settings.profitCycle || 30;
    
    // حساب الفائدة حسب طريقة الحساب
    let interest = 0;
    
    if (settings.profitCalculation === 'daily') {
        // حساب الفائدة النسبية بالأيام
        interest = (amount * rate * days) / daysInCycle;
    } else {
        // حساب الفائدة الشهرية كاملة
        interest = amount * rate;
    }
    
    return interest;
}


/**
 * إضافة دالة تهيئة افتراضية لبيانات المستثمر
 * إذا لم تكن موجودة
 */

// إضافة بيانات افتراضية للتطبيق إذا كان فارغاً
function initializeDefaultData() {
    console.log('تهيئة البيانات الافتراضية...');
    
    // إضافة مستثمر افتراضي إذا لم يكن هناك مستثمرين
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
                    interest: calculateInterest(50000, new Date().toISOString().split('T')[0])
                }
            ],
            profits: [],
            withdrawals: []
        };
        
        investors.push(defaultInvestor);
        
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
        
        transactions.push(defaultTransaction);
        
        saveData();
        console.log('تم إضافة بيانات افتراضية للنظام');
    }
}

// إضافة استدعاء لدالة البيانات الافتراضية في بداية التطبيق
document.addEventListener('DOMContentLoaded', function() {
    console.log('تهيئة التطبيق...');
    loadData();
   
    initNavigation();
    initEventListeners();
    setCurrentDateAsDefault();
    updateDashboard();
    populateInvestorSelects();
 
    initCharts();

    // تفعيل الزر العائم
    initFloatingActionButton();
    
    // تفعيل البحث
    initSearchFunctionality();
});

// عرض جدول العمليات
function renderTransactionsTable() {
    console.log('عرض جدول العمليات...');
    
    const tableBody = document.querySelector('#transactions-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // ترتيب العمليات حسب التاريخ (الأحدث أولاً)
    const sortedTransactions = [...transactions].sort((a, b) => {
        return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
    });
    
    sortedTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        
        // تحديد نوع العملية وأيقونتها
        let typeClass = '';
        let typeIcon = '';
        
        switch(transaction.type) {
            case 'إيداع':
                typeClass = 'success';
                typeIcon = '<i class="fas fa-arrow-up"></i>';
                break;
            case 'سحب':
                typeClass = 'danger';
                typeIcon = '<i class="fas fa-arrow-down"></i>';
                break;
            case 'دفع أرباح':
                typeClass = 'info';
                typeIcon = '<i class="fas fa-hand-holding-usd"></i>';
                break;
            default:
                typeClass = 'primary';
                typeIcon = '<i class="fas fa-exchange-alt"></i>';
        }
        
        row.innerHTML = `
            <td>${transaction.id}</td>
            <td>${transaction.investorName}</td>
            <td>
                <span class="badge badge-${typeClass}">${typeIcon} ${transaction.type}</span>
            </td>
            <td>${transaction.date}</td>
            <td>${transaction.amount.toLocaleString()} ${settings.currency}</td>
            <td>${transaction.balanceAfter ? transaction.balanceAfter.toLocaleString() + ' ' + settings.currency : '-'}</td>
            <td>
                <button class="btn btn-outline btn-sm transaction-details" data-id="${transaction.id}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // إضافة مستمع الحدث لزر التفاصيل
        const detailsButton = row.querySelector('.transaction-details');
        if (detailsButton) {
            detailsButton.addEventListener('click', () => {
                showTransactionDetails(transaction.id);
            });
        }
    });
    
    if (sortedTransactions.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="7" class="text-center">لا يوجد عمليات</td>';
        tableBody.appendChild(emptyRow);
    }
}

// عرض تفاصيل العملية
function showTransactionDetails(transactionId) {
    console.log(`عرض تفاصيل العملية: ${transactionId}`);
    
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) {
        showNotification('لم يتم العثور على العملية', 'error');
        return;
    }
    
    const investor = investors.find(i => i.id === transaction.investorId);
    const investorName = investor ? investor.name : transaction.investorName || 'غير معروف';
    
    let typeClass = '';
    switch(transaction.type) {
        case 'إيداع':
            typeClass = 'success';
            break;
        case 'سحب':
            typeClass = 'danger';
            break;
        case 'دفع أرباح':
            typeClass = 'info';
            break;
        default:
            typeClass = 'primary';
    }
    
    // إنشاء محتوى النافذة المنبثقة
    const content = `
        <div class="transaction-details">
            <div class="transaction-header">
                <span class="badge badge-${typeClass}">${transaction.type}</span>
                <span class="transaction-date">${transaction.date}</span>
            </div>
            <div class="transaction-body">
                <div class="detail-item">
                    <div class="detail-label">رقم العملية</div>
                    <div class="detail-value">${transaction.id}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">المستثمر</div>
                    <div class="detail-value">${investorName}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">نوع العملية</div>
                    <div class="detail-value">${transaction.type}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">تاريخ العملية</div>
                    <div class="detail-value">${transaction.date}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">المبلغ</div>
                    <div class="detail-value">${transaction.amount.toLocaleString()} ${settings.currency}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">الرصيد بعد العملية</div>
                    <div class="detail-value">${transaction.balanceAfter ? transaction.balanceAfter.toLocaleString() + ' ' + settings.currency : '-'}</div>
                </div>
                ${transaction.notes ? `
                <div class="detail-item">
                    <div class="detail-label">ملاحظات</div>
                    <div class="detail-value">${transaction.notes}</div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // عرض النافذة المنبثقة
    showModal('تفاصيل العملية', content);
}

// عرض جدول الأرباح
function renderProfitsTable() {
    console.log('عرض جدول الأرباح...');
    
    const tableBody = document.querySelector('#profits-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // حساب الأرباح المستحقة
    const dueProfits = [];
    
    investors.forEach(investor => {
        if (investor.status !== 'نشط' || !investor.investments || investor.investments.length === 0) return;
        
        const totalInvestment = investor.amount || 0;
        if (totalInvestment <= 0) return;
        
        // اختيار أقدم تاريخ استثمار
        const oldestInvestment = investor.investments.reduce((oldest, current) => {
            const oldestDate = oldest ? new Date(oldest.date) : new Date();
            const currentDate = new Date(current.date);
            return currentDate < oldestDate ? current : oldest;
        }, null);
        
        if (!oldestInvestment) return;
        
        const investmentDate = oldestInvestment.date;
        const today = new Date();
        const investmentStartDate = new Date(investmentDate);
        
        // حساب عدد أيام الاستثمار
        const days = Math.floor((today - investmentStartDate) / (1000 * 60 * 60 * 24));
        
        // حساب الربح المستحق
        const profit = investor.investments.reduce((total, inv) => {
            return total + calculateInterest(inv.amount, inv.date);
        }, 0);
        
        // تقدير تاريخ الاستحقاق (بعد 30 يوم من تاريخ الاستثمار)
        const dueDate = new Date(investmentStartDate);
        dueDate.setDate(dueDate.getDate() + settings.profitCycle);
        
        dueProfits.push({
            investor: investor,
            investmentAmount: totalInvestment,
            investmentDate: investmentDate,
            days: days,
            profit: profit,
            dueDate: dueDate
        });
    });
    
    // ترتيب الأرباح حسب تاريخ الاستحقاق (الأقرب أولاً)
    dueProfits.sort((a, b) => a.dueDate - b.dueDate);
    
    // عرض الأرباح في الجدول
    dueProfits.forEach(item => {
        const row = document.createElement('tr');
        
        // تحديد حالة استحقاق الربح
        const today = new Date();
        const isDue = item.dueDate <= today;
        const daysToMaturity = Math.floor((item.dueDate - today) / (1000 * 60 * 60 * 24));
        
        let dueBadge = '';
        if (isDue) {
            dueBadge = '<span class="badge badge-danger">مستحق الآن</span>';
        } else if (daysToMaturity <= settings.reminderDays) {
            dueBadge = `<span class="badge badge-warning">بعد ${daysToMaturity} يوم</span>`;
        }
        
        row.innerHTML = `
            <td>
                <div class="investor-info">
                    <div class="investor-avatar">${item.investor.name.charAt(0)}</div>
                    <div>
                        <div class="investor-name">${item.investor.name}</div>
                        <div class="investor-id">${item.investor.phone}</div>
                    </div>
                </div>
            </td>
            <td>${item.investmentAmount.toLocaleString()} ${settings.currency}</td>
            <td>${item.investmentDate}</td>
            <td>${item.days} يوم</td>
            <td>${item.profit.toLocaleString()} ${settings.currency}</td>
            <td>${item.dueDate.toISOString().split('T')[0]} ${dueBadge}</td>
            <td>
                <button class="btn btn-success btn-sm pay-profit-btn" data-id="${item.investor.id}">
                    <i class="fas fa-coins"></i>
                    <span>دفع الأرباح</span>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // إضافة مستمع الحدث لزر دفع الأرباح
        const payProfitBtn = row.querySelector('.pay-profit-btn');
        if (payProfitBtn) {
            payProfitBtn.addEventListener('click', function() {
                const investorId = this.getAttribute('data-id');
                const profitInvestorSelect = document.getElementById('profit-investor');
                if (profitInvestorSelect) {
                    profitInvestorSelect.value = investorId;
                    calculateProfitForInvestor();
                    openModal('pay-profit-modal');
                }
            });
        }
    });
    
    if (dueProfits.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="7" class="text-center">لا يوجد أرباح مستحقة</td>';
        tableBody.appendChild(emptyRow);
    }
}

// عرض آخر العمليات في لوحة التحكم
function renderRecentTransactions() {
    console.log('عرض آخر العمليات...');
    
    const tableBody = document.querySelector('#recent-transactions tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    // عرض أحدث 5 عمليات فقط
    const recent = [...transactions].sort((a, b) => {
        return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
    }).slice(0, 5);

    recent.forEach(tr => {
        // تحديد نوع العملية وأيقونتها
        let statusClass = 'active';
        
        switch(tr.type) {
            case 'إيداع':
                statusClass = 'success';
                break;
            case 'سحب':
                statusClass = 'warning';
                break;
            case 'دفع أرباح':
                statusClass = 'info';
                break;
        }

        const daysAgo = Math.floor((new Date() - new Date(tr.date)) / (1000 * 60 * 60 * 24));
        const daysText = daysAgo === 0 ? 'اليوم' : `${daysAgo} يومًا مضت`;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${tr.id}</td>
            <td>${tr.investorName}</td>
            <td>${tr.type}</td>
            <td>${tr.date}<br><small>${daysText}</small></td>
            <td>${tr.amount.toLocaleString()} ${settings.currency}</td>
            <td><span class="status status-${statusClass}">مكتمل</span></td>
            <td>
                <button class="btn btn-outline btn-sm transaction-details" data-id="${tr.id}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
        
        // إضافة مستمع الحدث لزر التفاصيل
        const detailsButton = row.querySelector('.transaction-details');
        if (detailsButton) {
            detailsButton.addEventListener('click', () => {
                showTransactionDetails(tr.id);
            });
        }
    });
    
    if (recent.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="7" class="text-center">لا يوجد عمليات حديثة</td>';
        tableBody.appendChild(emptyRow);
    }
}

// تهيئة وتحديث الرسوم البيانية
function initCharts() {
    console.log('تهيئة الرسوم البيانية...');
    
    // رسم بياني للاستثمارات
    const investmentChart = document.getElementById('investment-chart');
    if (investmentChart && window.Chart) {
        new Chart(investmentChart.getContext('2d'), {
            type: 'line',
            data: {
                labels: getLast6Months(),
                datasets: [{
                    label: 'إجمالي الاستثمارات',
                    data: getMonthlyInvestmentData(),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // رسم بياني للمستثمرين
    const investorsChart = document.getElementById('investors-chart');
    if (investorsChart && window.Chart) {
        new Chart(investorsChart.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['نشط', 'قيد المراجعة', 'غير نشط'],
                datasets: [{
                    data: [investors.length, 0, 0],
                    backgroundColor: [
                        '#10b981',
                        '#f59e0b',
                        '#ef4444'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

// الحصول على أسماء الأشهر الستة الأخيرة
function getLast6Months() {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = month.toLocaleDateString('ar-EG', { month: 'short' });
        months.push(monthName);
    }
    
    return months;
}

// الحصول على بيانات الاستثمارات الشهرية
function getMonthlyInvestmentData() {
    const data = [0, 0, 0, 0, 0, 0]; // 6 أشهر
    const now = new Date();
    
    transactions.forEach(transaction => {
        if (transaction.type !== 'إيداع') return;
        
        const transDate = new Date(transaction.date || transaction.createdAt);
        const monthsAgo = (now.getFullYear() - transDate.getFullYear()) * 12 + now.getMonth() - transDate.getMonth();
        
        if (monthsAgo >= 0 && monthsAgo < 6) {
            data[5 - monthsAgo] += transaction.amount;
        }
    });
    
    return data;
}

// تحديث الرسوم البيانية
function updateCharts() {
    // في الإصدار الحالي، يتم إعادة تهيئة الرسوم بالكامل لتبسيط التحديث
    initCharts();
}

// إعداد التعرف على الصوت (يمكن تنفيذ هذا لاحقًا)
function setupSpeechRecognition() {
    console.log('تهيئة التعرف على الصوت...');
    // سيتم تنفيذ هذه الميزة لاحقًا
}

// عرض إشعار للمستخدم
function showNotification(message, type = 'success') {
    console.log(`إشعار (${type}): ${message}`);
    
    const notification = document.getElementById('success-notification');
    if (!notification) return;
    
    const notificationIcon = notification.querySelector('.notification-icon');
    const notificationTitle = notification.querySelector('.notification-title');
    const notificationMessage = notification.querySelector('.notification-message');
    
    if (!notificationIcon || !notificationTitle || !notificationMessage) return;
    
    // تعيين نوع الإشعار
    notificationIcon.className = 'notification-icon';
    notificationIcon.classList.add(type);
    
    // تعيين العنوان حسب النوع
    let title = 'إشعار';
    switch(type) {
        case 'success':
            title = 'تمت العملية بنجاح';
            notificationIcon.innerHTML = '<i class="fas fa-check"></i>';
            break;
        case 'error':
            title = 'خطأ';
            notificationIcon.innerHTML = '<i class="fas fa-times"></i>';
            break;
        case 'warning':
            title = 'تنبيه';
            notificationIcon.innerHTML = '<i class="fas fa-exclamation"></i>';
            break;
        case 'info':
            title = 'معلومات';
            notificationIcon.innerHTML = '<i class="fas fa-info"></i>';
            break;
    }
    
    notificationTitle.textContent = title;
    notificationMessage.textContent = message;
    
    // عرض الإشعار
    notification.classList.add('show');
    
    // إخفاء الإشعار بعد فترة
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// عرض نافذة منبثقة مخصصة
function showModal(title, content) {
    console.log(`عرض نافذة: ${title}`);
    
    // إنشاء عناصر النافذة المنبثقة
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'custom-modal-' + Date.now();
    
    modalOverlay.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إغلاق</button>
            </div>
        </div>
    `;
    
    // إضافة النافذة للصفحة
    document.body.appendChild(modalOverlay);
    
    // إظهار النافذة
    setTimeout(() => {
        modalOverlay.classList.add('active');
    }, 50);
    
    // إضافة مستمعي الأحداث
    const closeButtons = modalOverlay.querySelectorAll('.modal-close, .modal-close-btn');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modalOverlay.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(modalOverlay);
            }, 300);
        });
    });
    
    // إغلاق النافذة عند النقر خارجها
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(modalOverlay);
            }, 300);
        }
    });
    
    return modalOverlay;
}

// عرض تفاصيل المستثمر
function showInvestorDetails(investorId) {
    console.log(`عرض تفاصيل المستثمر: ${investorId}`);
    
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) {
        showNotification('لم يتم العثور على المستثمر', 'error');
        return;
    }
    
    // حساب القيم المطلوبة
    const totalInvestment = investor.amount || 0;
    const monthlyProfit = investor.investments.reduce((total, inv) => {
        return total + calculateInterest(inv.amount, inv.date);
    }, 0);
    
    // حساب مدة الاستثمار
    const startDate = new Date(investor.joinDate || investor.createdAt);
    const today = new Date();
    const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    
    // الحصول على عمليات المستثمر
    const investorTransactions = transactions.filter(tr => tr.investorId === investorId);
    
    // إنشاء محتوى النافذة المنبثقة
    const content = `
        <div class="investor-profile">
            <div class="investor-avatar large">${investor.name.charAt(0)}</div>
            <h2 class="investor-fullname">${investor.name}</h2>
            <span class="badge badge-success">${investor.status || 'نشط'}</span>
        </div>
        
        <div class="investor-stats">
            <div class="stat-item">
                <div class="stat-value">${totalInvestment.toLocaleString()} ${settings.currency}</div>
                <div class="stat-label">إجمالي الاستثمار</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${monthlyProfit.toLocaleString()} ${settings.currency}</div>
                <div class="stat-label">الربح الشهري</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${daysPassed} يوم</div>
                <div class="stat-label">مدة الاستثمار</div>
            </div>
        </div>
        
        <div class="detail-group">
            <h3 class="detail-group-title">معلومات الاتصال</h3>
            <div class="detail-item">
                <div class="detail-label">رقم الهاتف</div>
                <div class="detail-value">${investor.phone}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">العنوان</div>
                <div class="detail-value">${investor.address || 'غير محدد'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">رقم البطاقة</div>
                <div class="detail-value">${investor.cardNumber || 'غير محدد'}</div>
            </div>
        </div>
        
        <div class="detail-group">
            <h3 class="detail-group-title">آخر العمليات</h3>
            <div class="mini-table-container">
                <table class="mini-table">
                    <thead>
                        <tr>
                            <th>التاريخ</th>
                            <th>النوع</th>
                            <th>المبلغ</th>
                            <th>الإجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${investorTransactions.length > 0 ? 
                            investorTransactions.slice(0, 5).map(tr => `
                                <tr>
                                    <td>${tr.date}</td>
                                    <td>${tr.type}</td>
                                    <td>${tr.amount.toLocaleString()} ${settings.currency}</td>
                                    <td>
                                        <button class="btn btn-sm btn-outline edit-transaction" data-id="${tr.id}">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('') : 
                            '<tr><td colspan="4">لا توجد عمليات</td></tr>'
                        }
                    </tbody>
                </table>
            </div>
        </div>

        <div class="investor-actions-big">
            <button class="btn btn-primary" onclick="editInvestor('${investorId}')">
                <i class="fas fa-edit"></i> تعديل البيانات
            </button>
            <button class="btn btn-success" onclick="openProfitModal('${investorId}')">
                <i class="fas fa-coins"></i> دفع الأرباح
            </button>
            <button class="btn btn-danger" onclick="deleteInvestor('${investorId}')">
                <i class="fas fa-trash"></i> حذف المستثمر
            </button>
        </div>
    `;
    
    // عرض النافذة المنبثقة
    showModal(`تفاصيل المستثمر - ${investor.name}`, content);

    // إضافة مستمعي الأحداث لأزرار تعديل العمليات
    document.querySelectorAll('.edit-transaction').forEach(btn => {
        btn.addEventListener('click', function () {
            const txnId = this.getAttribute('data-id');
            openEditTransactionModal(txnId);
        });
    });
}

// تعديل بيانات المستثمر
function editInvestor(investorId) {
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) {
        showNotification('لم يتم العثور على المستثمر', 'error');
        return;
    }

    // فتح النافذة
    openModal('add-investor-modal');

    // تعبئة النموذج
    document.getElementById('investor-name').value = investor.name;
    document.getElementById('investor-phone').value = investor.phone;
    document.getElementById('investor-address').value = investor.address || '';
    document.getElementById('investor-card').value = investor.cardNumber || '';
    document.getElementById('investor-deposit-date').value = investor.joinDate || '';
    document.getElementById('investor-amount').value = investor.amount || 0;

    // تغيير وظيفة زر الحفظ
    const saveButton = document.getElementById('save-investor-btn');
    if (saveButton) {
        // حفظ الوظيفة الأصلية
        const originalClickHandler = saveButton.onclick;

        // تعيين وظيفة جديدة
        saveButton.textContent = 'حفظ التعديلات';
        saveButton.onclick = function () {
            // تجميع البيانات المعدلة
            const updatedInvestor = {
                name: document.getElementById('investor-name').value,
                phone: document.getElementById('investor-phone').value,
                address: document.getElementById('investor-address').value,
                cardNumber: document.getElementById('investor-card').value,
                amount: parseFloat(document.getElementById('investor-amount').value)
            };

            // تحديث بيانات المستثمر
            updateInvestor(investorId, updatedInvestor);

            // إعادة تعيين الوظيفة الأصلية
            saveButton.textContent = 'إضافة';
            saveButton.onclick = originalClickHandler;

            // إغلاق النافذة
            closeModal('add-investor-modal');
        };
    }
}

function openEditTransactionModal(txnId) {
    const txn = transactions.find(t => t.id === txnId);
    if (!txn) return;

    document.getElementById('edit-transaction-id').value = txn.id;
    document.getElementById('edit-transaction-date').value = txn.date;
    document.getElementById('edit-transaction-amount').value = txn.amount;
    document.getElementById('edit-transaction-notes').value = txn.notes || '';

    openModal('edit-transaction-modal');
}


// تحديث بيانات المستثمر
function updateInvestor(investorId, updatedData) {
    console.log(`تحديث بيانات المستثمر: ${investorId}`);
    
    const investorIndex = investors.findIndex(inv => inv.id === investorId);
    if (investorIndex === -1) {
        showNotification('لم يتم العثور على المستثمر', 'error');
        return false;
    }
    
    // الاحتفاظ ببعض البيانات الأصلية
    const originalInvestor = investors[investorIndex];
    updatedData.id = originalInvestor.id;
    updatedData.createdAt = originalInvestor.createdAt;
    updatedData.investments = originalInvestor.investments;
    updatedData.profits = originalInvestor.profits;
    updatedData.withdrawals = originalInvestor.withdrawals;
    updatedData.status = originalInvestor.status;
    
    // تحديث البيانات
    investors[investorIndex] = {
        ...originalInvestor,
        ...updatedData
    };
    
    // حفظ البيانات
    saveData();
    
    // إطلاق حدث تحديث المستثمرين
    document.dispatchEvent(new CustomEvent('investor:update'));
    
    // عرض إشعار النجاح
    showNotification(`تم تحديث بيانات المستثمر ${updatedData.name} بنجاح`, 'success');
    
    return true;
}

// حذف مستثمر
function deleteInvestor(investorId) {
    console.log(`حذف المستثمر: ${investorId}`);
    
    // البحث عن المستثمر
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) {
        showNotification('لم يتم العثور على المستثمر', 'error');
        return false;
    }
    
    // طلب تأكيد الحذف
    if (!confirm(`هل أنت متأكد من رغبتك في حذف المستثمر ${investor.name}؟\nسيتم حذف جميع البيانات المتعلقة به.`)) {
        return false;
    }
    
    // حذف المستثمر
    investors = investors.filter(inv => inv.id !== investorId);
    
    // حذف العمليات المرتبطة بالمستثمر
    transactions = transactions.filter(tr => tr.investorId !== investorId);
    
    // حفظ البيانات
    saveData();
    
    // إطلاق حدث تحديث المستثمرين
    document.dispatchEvent(new CustomEvent('investor:update'));
    
    // إطلاق حدث تحديث العمليات
    document.dispatchEvent(new CustomEvent('transaction:update'));
    
    // عرض إشعار النجاح
    showNotification(`تم حذف المستثمر ${investor.name} بنجاح`, 'success');
    
    return true;
}

// فتح نافذة دفع الأرباح للمستثمر
function openProfitModal(investorId) {
    console.log(`فتح نافذة دفع الأرباح للمستثمر: ${investorId}`);
    
    // البحث عن المستثمر
    const investor = investors.find(inv => inv.id === investorId);
    if (!investor) {
        showNotification('لم يتم العثور على المستثمر', 'error');
        return;
    }
    
    // تحديد المستثمر في نموذج دفع الأرباح
    const profitInvestorSelect = document.getElementById('profit-investor');
    if (profitInvestorSelect) {
        profitInvestorSelect.value = investorId;
        
        // حساب الأرباح للمستثمر
        calculateProfitForInvestor();
        
        // فتح النافذة
        openModal('pay-profit-modal');
    } else {
        showNotification('لم يتم العثور على نموذج دفع الأرباح', 'error');
    }
}

// تصفية العمليات حسب النوع
function filterTransactions(filterType) {
    console.log(`تصفية العمليات حسب النوع: ${filterType}`);
    
    let filteredTransactions = [...transactions];
    
    switch (filterType) {
        case 'الكل':
            // لا نقوم بأي تصفية
            break;
        case 'إيداع':
            filteredTransactions = filteredTransactions.filter(tr => tr.type === 'إيداع');
            break;
        case 'سحب':
            filteredTransactions = filteredTransactions.filter(tr => tr.type === 'سحب');
            break;
        case 'أرباح':
        case 'دفع أرباح':
            filteredTransactions = filteredTransactions.filter(tr => tr.type === 'دفع أرباح');
            break;
    }
    
    // تحديث جدول العمليات
    const tableBody = document.querySelector('#transactions-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // ترتيب العمليات حسب التاريخ (الأحدث أولاً)
    filteredTransactions.sort((a, b) => {
        return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
    });
    
    filteredTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        
        // تحديد نوع العملية وأيقونتها
        let typeClass = '';
        let typeIcon = '';
        
        switch(transaction.type) {
            case 'إيداع':
                typeClass = 'success';
                typeIcon = '<i class="fas fa-arrow-up"></i>';
                break;
            case 'سحب':
                typeClass = 'danger';
                typeIcon = '<i class="fas fa-arrow-down"></i>';
                break;
            case 'دفع أرباح':
                typeClass = 'info';
                typeIcon = '<i class="fas fa-hand-holding-usd"></i>';
                break;
            default:
                typeClass = 'primary';
                typeIcon = '<i class="fas fa-exchange-alt"></i>';
        }
        
        row.innerHTML = `
            <td>${transaction.id}</td>
            <td>${transaction.investorName}</td>
            <td>
                <span class="badge badge-${typeClass}">${typeIcon} ${transaction.type}</span>
            </td>
            <td>${transaction.date}</td>
            <td>${transaction.amount.toLocaleString()} ${settings.currency}</td>
            <td>${transaction.balanceAfter ? transaction.balanceAfter.toLocaleString() + ' ' + settings.currency : '-'}</td>
            <td>
                <button class="btn btn-outline btn-sm transaction-details" data-id="${transaction.id}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // إضافة مستمع الحدث لزر التفاصيل
        const detailsButton = row.querySelector('.transaction-details');
        if (detailsButton) {
            detailsButton.addEventListener('click', () => {
                showTransactionDetails(transaction.id);
            });
        }
    });
    
    if (filteredTransactions.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="7" class="text-center">لا يوجد عمليات</td>';
        tableBody.appendChild(emptyRow);
    }
}

// تهيئة وظيفة البحث
function initSearchFunctionality() {
    console.log('تهيئة وظيفة البحث...');
    
    // البحث في صفحة المستثمرين
    const investorsSearchInput = document.querySelector('#investors-page .search-input');
    if (investorsSearchInput) {
        investorsSearchInput.addEventListener('input', function() {
            searchInvestors(this.value);
        });
    }
    
    // البحث في صفحة العمليات
    const transactionsSearchInput = document.querySelector('#transactions-page .search-input');
    if (transactionsSearchInput) {
        transactionsSearchInput.addEventListener('input', function() {
            searchTransactions(this.value);
        });
    }
    
    // البحث في صفحة الأرباح
    const profitsSearchInput = document.querySelector('#profits-page .search-input');
    if (profitsSearchInput) {
        profitsSearchInput.addEventListener('input', function() {
            searchProfits(this.value);
        });
    }
}

// البحث في المستثمرين
function searchInvestors(query) {
    console.log(`البحث في المستثمرين: ${query}`);
    
    query = query.trim().toLowerCase();
    
    if (!query) {
        // إذا كان البحث فارغًا، نعيد عرض جميع المستثمرين
        renderInvestorsTable();
        return;
    }
    
    // تصفية المستثمرين حسب البحث
    const filtered = investors.filter(investor => {
        return investor.name.toLowerCase().includes(query) ||
               investor.phone.toLowerCase().includes(query) ||
               (investor.address && investor.address.toLowerCase().includes(query)) ||
               (investor.cardNumber && investor.cardNumber.toLowerCase().includes(query)) ||
               investor.id.toLowerCase().includes(query);
    });
    
    // عرض المستثمرين المصفّين
    const tableBody = document.querySelector('#investors-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (filtered.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="8" class="text-center">لم يتم العثور على نتائج للبحث: "${query}"</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // عرض المستثمرين المصفّين
    filtered.forEach(investor => {
        const row = document.createElement('tr');
        
        // حساب الربح الشهري
        const monthlyProfit = investor.investments.reduce((total, inv) => {
            return total + calculateInterest(inv.amount, inv.date);
        }, 0);
        
        // تنسيق تاريخ الانضمام
        const joinDate = investor.joinDate || investor.createdAt || '';
        
        row.innerHTML = `
            <td>${investor.id}</td>
            <td>
                <div class="investor-info">
                    <div class="investor-avatar">${investor.name.charAt(0)}</div>
                    <div>
                        <div class="investor-name">${investor.name}</div>
                        <div class="investor-phone">${investor.phone}</div>
                    </div>
                </div>
            </td>
            <td>${investor.phone}</td>
            <td>${(investor.amount || 0).toLocaleString()} ${settings.currency}</td>
            <td>${monthlyProfit.toLocaleString()} ${settings.currency}</td>
            <td>${joinDate}</td>
            <td><span class="badge badge-success">نشط</span></td>
            <td>
                <div class="investor-actions">
                    <button class="investor-action-btn view-investor" data-id="${investor.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="investor-action-btn edit edit-investor" data-id="${investor.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="investor-action-btn delete delete-investor" data-id="${investor.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // إضافة مستمعي الأحداث للأزرار
        const viewButton = row.querySelector('.view-investor');
        const editButton = row.querySelector('.edit-investor');
        const deleteButton = row.querySelector('.delete-investor');
        
        if (viewButton) {
            viewButton.addEventListener('click', () => {
                showInvestorDetails(investor.id);
            });
        }
        
        if (editButton) {
            editButton.addEventListener('click', () => {
                editInvestor(investor.id);
            });
        }
        
        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                deleteInvestor(investor.id);
            });
        }
    });
}

// البحث في العمليات
function searchTransactions(query) {
    console.log(`البحث في العمليات: ${query}`);
    
    query = query.trim().toLowerCase();
    
    if (!query) {
        // إذا كان البحث فارغًا، نعيد عرض جميع العمليات
        renderTransactionsTable();
        return;
    }
    
    // تصفية العمليات حسب البحث
    const filtered = transactions.filter(transaction => {
        return transaction.id.toLowerCase().includes(query) ||
               transaction.investorName.toLowerCase().includes(query) ||
               transaction.type.toLowerCase().includes(query) ||
               transaction.date.toLowerCase().includes(query) ||
               transaction.amount.toString().includes(query);
    });
    
    // عرض العمليات المصفّاة في الجدول
    const tableBody = document.querySelector('#transactions-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (filtered.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="7" class="text-center">لم يتم العثور على نتائج للبحث: "${query}"</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // عرض العمليات المصفّاة
    filtered.forEach(transaction => {
        const row = document.createElement('tr');
        
        // تحديد نوع العملية وأيقونتها
        let typeClass = '';
        let typeIcon = '';
        
        switch(transaction.type) {
            case 'إيداع':
                typeClass = 'success';
                typeIcon = '<i class="fas fa-arrow-up"></i>';
                break;
            case 'سحب':
                typeClass = 'danger';
                typeIcon = '<i class="fas fa-arrow-down"></i>';
                break;
            case 'دفع أرباح':
                typeClass = 'info';
                typeIcon = '<i class="fas fa-hand-holding-usd"></i>';
                break;
            default:
                typeClass = 'primary';
                typeIcon = '<i class="fas fa-exchange-alt"></i>';
        }
        
        row.innerHTML = `
            <td>${transaction.id}</td>
            <td>${transaction.investorName}</td>
            <td>
                <span class="badge badge-${typeClass}">${typeIcon} ${transaction.type}</span>
            </td>
            <td>${transaction.date}</td>
            <td>${transaction.amount.toLocaleString()} ${settings.currency}</td>
            <td>${transaction.balanceAfter ? transaction.balanceAfter.toLocaleString() + ' ' + settings.currency : '-'}</td>
            <td>
                <button class="btn btn-outline btn-sm transaction-details" data-id="${transaction.id}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // إضافة مستمع الحدث لزر التفاصيل
        const detailsButton = row.querySelector('.transaction-details');
        if (detailsButton) {
            detailsButton.addEventListener('click', () => {
                showTransactionDetails(transaction.id);
            });
        }
    });
}

// البحث في الأرباح
function searchProfits(query) {
    console.log(`البحث في الأرباح: ${query}`);
    
    query = query.trim().toLowerCase();
    
    if (!query) {
        // إذا كان البحث فارغًا، نعيد عرض جميع الأرباح
        renderProfitsTable();
        return;
    }
    
    // تصفية المستثمرين حسب البحث
    const filteredInvestors = investors.filter(investor => {
        return investor.name.toLowerCase().includes(query) ||
               investor.phone.toLowerCase().includes(query) ||
               investor.id.toLowerCase().includes(query);
    });
    
    // إعادة تقديم جدول الأرباح فقط للمستثمرين المصفّين
    const dueProfits = [];
    
    filteredInvestors.forEach(investor => {
        if (investor.status !== 'نشط' || !investor.investments || investor.investments.length === 0) return;
        
        const totalInvestment = investor.amount || 0;
        if (totalInvestment <= 0) return;
        
        // اختيار أقدم تاريخ استثمار
        const oldestInvestment = investor.investments.reduce((oldest, current) => {
            const oldestDate = oldest ? new Date(oldest.date) : new Date();
            const currentDate = new Date(current.date);
            return currentDate < oldestDate ? current : oldest;
        }, null);
        
        if (!oldestInvestment) return;
        
        const investmentDate = oldestInvestment.date;
        const today = new Date();
        const investmentStartDate = new Date(investmentDate);
        
        // حساب عدد أيام الاستثمار
        const days = Math.floor((today - investmentStartDate) / (1000 * 60 * 60 * 24));
        
        // حساب الربح المستحق
        const profit = investor.investments.reduce((total, inv) => {
            return total + calculateInterest(inv.amount, inv.date);
        }, 0);
        
        // تقدير تاريخ الاستحقاق (بعد 30 يوم من تاريخ الاستثمار)
        const dueDate = new Date(investmentStartDate);
        dueDate.setDate(dueDate.getDate() + settings.profitCycle);
        
        dueProfits.push({
            investor: investor,
            investmentAmount: totalInvestment,
            investmentDate: investmentDate,
            days: days,
            profit: profit,
            dueDate: dueDate
        });
    });
    
    // عرض الأرباح المصفّاة في الجدول
    const tableBody = document.querySelector('#profits-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (dueProfits.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="7" class="text-center">لم يتم العثور على نتائج للبحث: "${query}"</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // ترتيب الأرباح حسب تاريخ الاستحقاق (الأقرب أولاً)
    dueProfits.sort((a, b) => a.dueDate - b.dueDate);
    
    // عرض الأرباح في الجدول
    dueProfits.forEach(item => {
        const row = document.createElement('tr');
        
        // تحديد حالة استحقاق الربح
        const today = new Date();
        const isDue = item.dueDate <= today;
        const daysToMaturity = Math.floor((item.dueDate - today) / (1000 * 60 * 60 * 24));
        
        let dueBadge = '';
        if (isDue) {
            dueBadge = '<span class="badge badge-danger">مستحق الآن</span>';
        } else if (daysToMaturity <= settings.reminderDays) {
            dueBadge = `<span class="badge badge-warning">بعد ${daysToMaturity} يوم</span>`;
        }
        
        row.innerHTML = `
            <td>
                <div class="investor-info">
                    <div class="investor-avatar">${item.investor.name.charAt(0)}</div>
                    <div>
                        <div class="investor-name">${item.investor.name}</div>
                        <div class="investor-id">${item.investor.phone}</div>
                    </div>
                </div>
            </td>
            <td>${item.investmentAmount.toLocaleString()} ${settings.currency}</td>
            <td>${item.investmentDate}</td>
            <td>${item.days} يوم</td>
            <td>${item.profit.toLocaleString()} ${settings.currency}</td>
            <td>${item.dueDate.toISOString().split('T')[0]} ${dueBadge}</td>
            <td>
                <button class="btn btn-success btn-sm pay-profit-btn" data-id="${item.investor.id}">
                    <i class="fas fa-coins"></i>
                    <span>دفع الأرباح</span>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // إضافة مستمع الحدث لزر دفع الأرباح
        const payProfitBtn = row.querySelector('.pay-profit-btn');
        if (payProfitBtn) {
            payProfitBtn.addEventListener('click', function() {
                const investorId = this.getAttribute('data-id');
                const profitInvestorSelect = document.getElementById('profit-investor');
                if (profitInvestorSelect) {
                    profitInvestorSelect.value = investorId;
                    calculateProfitForInvestor();
                    openModal('pay-profit-modal');
                }
            });
        }
    });
}


// استبدال كامل تعريف الدالة وإعادة تعيين مستمع الحدث 
// هذا الحل يجب أن يوضع في نهاية ملف app-fixed.js

// إزالة جميع مستمعي الأحداث الموجودة على الزر العائم
document.addEventListener('DOMContentLoaded', function() {
    const fab = document.getElementById('add-new-fab');
    if (fab) {
        // إزالة مستمعي الأحداث السابقة عبر نسخ العنصر واستبداله
        const newFab = fab.cloneNode(true);
        fab.parentNode.replaceChild(newFab, fab);
        
        // تعيين مستمع الحدث الجديد
        newFab.addEventListener('click', showFloatingMenu);
        
        console.log('تم تهيئة زر الإضافة العائم بنجاح');
    } else {
        console.error('لم يتم العثور على زر الإضافة العائم');
    }
});

// دالة منفصلة لإظهار القائمة المنسدلة
function showFloatingMenu(e) {
    e.stopPropagation(); // منع انتشار الحدث
    
    // التحقق مما إذا كانت القائمة مفتوحة بالفعل
    const existingMenu = document.querySelector('.fab-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }

    // إنشاء القائمة المنسدلة
    const menu = document.createElement('div');
    menu.className = 'fab-menu';
    menu.innerHTML = `
        <div class="fab-menu-item" data-action="add-investor">
            <i class="fas fa-user-plus"></i>
            <span>إضافة مستثمر</span>
        </div>
        <div class="fab-menu-item" data-action="add-deposit">
            <i class="fas fa-arrow-up"></i>
            <span>إيداع جديد</span>
        </div>
        <div class="fab-menu-item" data-action="add-withdraw">
            <i class="fas fa-arrow-down"></i>
            <span>سحب جديد</span>
        </div>
        <div class="fab-menu-item" data-action="pay-profit">
            <i class="fas fa-hand-holding-usd"></i>
            <span>دفع أرباح</span>
        </div>
    `;

    // تحديد موقع القائمة بناءً على موقع الزر
    const fabRect = this.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.bottom = (window.innerHeight - fabRect.top + 10) + 'px';
    menu.style.left = (fabRect.left + 10) + 'px';
    menu.style.zIndex = '1000';

    // أنماط القائمة
    menu.style.background = 'white';
    menu.style.borderRadius = '16px';
    menu.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
    menu.style.padding = '12px';
    menu.style.minWidth = '220px';
    menu.style.fontFamily = 'Tajawal, sans-serif';
    menu.style.animation = 'fadeInUp 0.3s ease';

    // أنماط عناصر القائمة
    const menuItems = menu.querySelectorAll('.fab-menu-item');
    menuItems.forEach(item => {
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.padding = '12px 16px';
        item.style.margin = '6px 0';
        item.style.cursor = 'pointer';
        item.style.borderRadius = '12px';
        item.style.transition = 'all 0.2s ease-in-out';
        item.style.color = '#333';
        item.style.fontSize = '15px';
        item.style.fontWeight = '500';

        // تفاعل hover
        item.addEventListener('mouseenter', function () {
            this.style.background = '#f0f4ff';
            this.style.transform = 'translateX(-4px)';
        });
        
        item.addEventListener('mouseleave', function () {
            this.style.background = 'transparent';
            this.style.transform = 'translateX(0)';
        });

        // عند النقر على أحد خيارات القائمة
        item.addEventListener('click', function (e) {
            e.stopPropagation(); // منع انتشار الحدث
            
            // الحصول على نوع الإجراء من سمة data-action
            const action = this.getAttribute('data-action');
            
            // إغلاق القائمة المنسدلة أولاً
            if (menu.parentNode) {
                document.body.removeChild(menu);
            }
            
            // فتح النافذة المنبثقة المناسبة بعد إغلاق القائمة
            setTimeout(() => {
                switch (action) {
                    case 'add-investor': openModal('add-investor-modal'); break;
                    case 'add-deposit': openModal('add-deposit-modal'); break;
                    case 'add-withdraw': openModal('add-withdraw-modal'); break;
                    case 'pay-profit': openModal('pay-profit-modal'); break;
                }
            }, 50);
        });

        // أنماط الأيقونة
        const icon = item.querySelector('i');
        if (icon) {
            icon.style.marginLeft = '12px';
            icon.style.fontSize = '1.3rem';
            icon.style.width = '24px';
            icon.style.color = '#007BFF'; // لون أزرق جميل
        }
    });

    // إضافة القائمة إلى الصفحة
    document.body.appendChild(menu);

    // إغلاق القائمة عند النقر خارجها
    const handleClickOutside = function (event) {
        // التحقق مما إذا كان النقر خارج القائمة وليس على الزر العائم
        if (!menu.contains(event.target) && event.target !== document.getElementById('add-new-fab')) {
            if (menu.parentNode) {
                menu.remove();
            }
            document.removeEventListener('click', handleClickOutside);
        }
    };
    
    setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
    }, 10);
}

// إعادة تعريف دالة initFloatingActionButton الأصلية لتجنب التضارب
// إذا تم استدعاؤها في مكان آخر في الكود
function initFloatingActionButton() {
    console.log('تم تعطيل الدالة الأصلية واستبدالها بالنسخة المحدثة');
}


// تصدير البيانات (مستثمرين/عمليات/أرباح)
function exportData(type = 'investors') {
    console.log(`تصدير البيانات: ${type}`);
    
    let data = [];
    let filename = '';
    let headers = [];
    
    switch(type) {
        case 'investors':
            data = investors;
            filename = 'المستثمرين';
            headers = ['المعرف', 'الاسم', 'رقم الهاتف', 'العنوان', 'رقم البطاقة', 'المبلغ المستثمر', 'تاريخ الانضمام', 'الحالة'];
            break;
        case 'transactions':
            data = transactions;
            filename = 'العمليات';
            headers = ['المعرف', 'المستثمر', 'نوع العملية', 'التاريخ', 'المبلغ', 'الرصيد بعد العملية', 'ملاحظات'];
            break;
        case 'profits':
            // لا نصدر من جدول الأرباح لأنه يتم حسابه ديناميكيًا
            showNotification('تصدير الأرباح غير متاح حاليًا', 'warning');
            return;
    }
    
    if (data.length === 0) {
        showNotification('لا توجد بيانات للتصدير', 'warning');
        return;
    }
    
    // إنشاء مصفوفة البيانات للتصدير
    const csvRows = [];
    
    // إضافة عناوين الأعمدة
    csvRows.push(headers.join(','));
    
    // إضافة الصفوف
    data.forEach(item => {
        let row = [];
        switch(type) {
            case 'investors':
                row = [
                    item.id,
                    item.name,
                    item.phone,
                    item.address || '',
                    item.cardNumber || '',
                    item.amount || 0,
                    item.joinDate || item.createdAt || '',
                    item.status || 'نشط'
                ];
                break;
            case 'transactions':
                row = [
                    item.id,
                    item.investorName,
                    item.type,
                    item.date,
                    item.amount,
                    item.balanceAfter || '',
                    item.notes || ''
                ];
                break;
        }
        
        // تنظيف القيم للتصدير CSV
        row = row.map(value => {
            // إذا كانت القيمة تحتوي على فواصل، نضعها بين علامات اقتباس
            value = String(value).replace(/"/g, '""');
            return value.includes(',') ? `"${value}"` : value;
        });
        
        csvRows.push(row.join(','));
    });
    
    // إنشاء ملف CSV
    const csvContent = csvRows.join('\n');
    
    // إنشاء Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // إنشاء رابط التنزيل
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    
    // إضافة الرابط وتنفيذ النقر
    document.body.appendChild(link);
    link.click();
    
    // تنظيف
    document.body.removeChild(link);
    
    showNotification(`تم تصدير ${filename} بنجاح`, 'success');
}

// إضافة مستمعي الأحداث لأزرار التصدير
function setupExportButtons() {
    console.log('تهيئة أزرار التصدير...');
    
    // زر تصدير المستثمرين
    const exportInvestorsBtn = document.querySelector('#investors-page .btn[title="تصدير"]');
    if (exportInvestorsBtn) {
        exportInvestorsBtn.addEventListener('click', () => {
            exportData('investors');
        });
    }
    
    // زر تصدير العمليات
    const exportTransactionsBtn = document.querySelector('#transactions-page .btn[title="تصدير"]');
    if (exportTransactionsBtn) {
        exportTransactionsBtn.addEventListener('click', () => {
            exportData('transactions');
        });
    }
    
    // زر تصدير الأرباح
    const exportProfitsBtn = document.querySelector('#profits-page .btn[title="تصدير"]');
    if (exportProfitsBtn) {
        exportProfitsBtn.addEventListener('click', () => {
            exportData('profits');
        });
    }
}

// تهيئة دوال النسخ الاحتياطي
function setupBackupFunctions() {
    console.log('تهيئة دوال النسخ الاحتياطي...');
    
    // زر تنزيل نسخة احتياطية
    const downloadBackupBtn = document.querySelector('button[title="تنزيل نسخة احتياطية"]');
    if (downloadBackupBtn) {
        downloadBackupBtn.addEventListener('click', () => {
            createBackup();
        });
    }
    
    // زر استعادة من نسخة احتياطية
    const restoreBackupBtn = document.querySelector('button[title="استعادة من نسخة احتياطية"]');
    if (restoreBackupBtn) {
        restoreBackupBtn.addEventListener('click', () => {
            restoreBackup();
        });
    }
}

// إنشاء نسخة احتياطية
function createBackup() {
    console.log('إنشاء نسخة احتياطية...');
    
    // تجميع البيانات
    const backupData = {
        investors: investors,
        transactions: transactions,
        settings: settings,
        timestamp: new Date().toISOString()
    };
    
    // تحويل البيانات إلى نص JSON
    const jsonData = JSON.stringify(backupData);
    
    // إنشاء Blob
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // إنشاء رابط التنزيل
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `نظام_الاستثمار_نسخة_احتياطية_${new Date().toISOString().split('T')[0]}.json`;
    
    // إضافة الرابط وتنفيذ النقر
    document.body.appendChild(link);
    link.click();
    
    // تنظيف
    document.body.removeChild(link);
    
    showNotification('تم إنشاء النسخة الاحتياطية بنجاح', 'success');
}

// استعادة من نسخة احتياطية
function restoreBackup() {
    console.log('استعادة من نسخة احتياطية...');
    
    // إنشاء عنصر إدخال ملف
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    
    // إضافة عنصر الإدخال للصفحة
    document.body.appendChild(fileInput);
    
    // إضافة مستمع للتغيير
    fileInput.addEventListener('change', function() {
        if (this.files.length === 0) {
            document.body.removeChild(fileInput);
            return;
        }
        
        const file = this.files[0];
        const reader = new FileReader();
        
        reader.onload = function() {
            try {
                // قراءة البيانات
                const backupData = JSON.parse(reader.result);
                
                // التحقق من صحة البيانات
                if (!backupData.investors || !backupData.transactions || !backupData.settings) {
                    showNotification('ملف النسخة الاحتياطية غير صالح', 'error');
                    return;
                }
                
                // طلب تأكيد الاستعادة
                if (confirm('سيتم استبدال جميع البيانات الحالية بالبيانات من النسخة الاحتياطية. هل تريد المتابعة؟')) {
                    // استعادة البيانات
                    investors = backupData.investors;
                    transactions = backupData.transactions;
                    settings = backupData.settings;
                    
                    // حفظ البيانات
                    saveData();
                    
                    // تحديث واجهة المستخدم
                    updateDashboard();
                    renderInvestorsTable();
                    renderTransactionsTable();
                    renderProfitsTable();
                    renderRecentTransactions();
                    populateInvestorSelects();
                    
                    showNotification('تمت استعادة البيانات بنجاح', 'success');
                }
            } catch (error) {
                console.error('خطأ في استعادة النسخة الاحتياطية:', error);
                showNotification('حدث خطأ أثناء استعادة النسخة الاحتياطية', 'error');
            }
            
            // تنظيف
            document.body.removeChild(fileInput);
        };
        
        reader.onerror = function() {
            showNotification('حدث خطأ أثناء قراءة الملف', 'error');
            document.body.removeChild(fileInput);
        };
        
        reader.readAsText(file);
    });
    
    // تنفيذ النقر على عنصر الإدخال
    fileInput.click();
}

// إعداد مستمعي الأحداث الإضافية
function setupAdditionalEventListeners() {
    console.log('إعداد مستمعي الأحداث الإضافية...');
    
    // --- صفحة المستثمرين ---
    
    // أزرار التصفية في صفحة المستثمرين
    const investorsFilterButtons = document.querySelectorAll('#investors-page .btn-group .btn');
    if (investorsFilterButtons.length > 0) {
        investorsFilterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // تحديث الزر النشط
                investorsFilterButtons.forEach(btn => {
                    btn.classList.remove('active');
                });
                this.classList.add('active');
                
                // يمكن إضافة تصفية المستثمرين حسب الحالة هنا
                // لكن المستثمرين كلهم نشطون في النظام الحالي
            });
        });
    }
    
    // --- صفحة العمليات ---
    
    // أزرار التصفية في صفحة العمليات (تم تنفيذها بالفعل في filterTransactions)
    
    // --- صفحة الأرباح ---
    
    // أزرار التصفية في صفحة الأرباح
    const profitsFilterButtons = document.querySelectorAll('#profits-page .btn-group .btn');
    if (profitsFilterButtons.length > 0) {
        profitsFilterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // تحديث الزر النشط
                profitsFilterButtons.forEach(btn => {
                    btn.classList.remove('active');
                });
                this.classList.add('active');
                
                // يمكن إضافة تصفية الأرباح حسب الفترة هنا
            });
        });
    }
    
    // --- صفحة التقارير ---
    
    // أزرار التصفية في صفحة التقارير
    const reportsFilterButtons = document.querySelectorAll('#reports-page .btn-group .btn');
    if (reportsFilterButtons.length > 0) {
        reportsFilterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // تحديث الزر النشط
                reportsFilterButtons.forEach(btn => {
                    btn.classList.remove('active');
                });
                this.classList.add('active');
                
                // تحديث الرسوم البيانية
                updateCharts();
            });
        });
    }
}


// تخزين مراجع للرسوم البيانية
let investmentChart = null;
let investorsChart = null;
let investmentsGrowthChart = null;
let profitsGrowthChart = null;
let investmentsDistributionChart = null;
let investmentsPerformanceChart = null;

// تهيئة وتحديث الرسوم البيانية
function initCharts() {
    console.log('تهيئة الرسوم البيانية...');
    
    // رسم بياني للاستثمارات
    const investmentChartCanvas = document.getElementById('investment-chart');
    if (investmentChartCanvas && window.Chart) {
        // تدمير الرسم البياني الموجود إذا كان موجودًا
        if (investmentChart) {
            investmentChart.destroy();
        }
        
        // إنشاء رسم بياني جديد
        investmentChart = new Chart(investmentChartCanvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: getLast6Months(),
                datasets: [{
                    label: 'إجمالي الاستثمارات',
                    data: getMonthlyInvestmentData(),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // رسم بياني للمستثمرين
    const investorsChartCanvas = document.getElementById('investors-chart');
    if (investorsChartCanvas && window.Chart) {
        // تدمير الرسم البياني الموجود إذا كان موجودًا
        if (investorsChart) {
            investorsChart.destroy();
        }
        
        // إنشاء رسم بياني جديد
        investorsChart = new Chart(investorsChartCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['نشط', 'قيد المراجعة', 'غير نشط'],
                datasets: [{
                    data: [investors.length, 0, 0],
                    backgroundColor: [
                        '#10b981',
                        '#f59e0b',
                        '#ef4444'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // تهيئة رسوم صفحة التقارير إذا كانت الصفحة مفتوحة
    initReportCharts();
}

// تهيئة رسوم صفحة التقارير
function initReportCharts() {
    // رسم تطور الاستثمارات
    const investmentsGrowthChartCanvas = document.getElementById('investments-growth-chart');
    if (investmentsGrowthChartCanvas && window.Chart) {
        // تدمير الرسم البياني الموجود إذا كان موجودًا
        if (investmentsGrowthChart) {
            investmentsGrowthChart.destroy();
        }
        
        // إنشاء رسم بياني جديد
        investmentsGrowthChart = new Chart(investmentsGrowthChartCanvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: getLast6Months(),
                datasets: [{
                    label: 'إجمالي الاستثمارات',
                    data: getMonthlyInvestmentData(),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // رسم تطور الأرباح
    const profitsGrowthChartCanvas = document.getElementById('profits-growth-chart');
    if (profitsGrowthChartCanvas && window.Chart) {
        // تدمير الرسم البياني الموجود إذا كان موجودًا
        if (profitsGrowthChart) {
            profitsGrowthChart.destroy();
        }
        
        // إنشاء رسم بياني جديد
        profitsGrowthChart = new Chart(profitsGrowthChartCanvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: getLast6Months(),
                datasets: [{
                    label: 'إجمالي الأرباح',
                    data: getMonthlyProfitData(),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // رسم توزيع الاستثمارات
    const investmentsDistributionChartCanvas = document.getElementById('investments-distribution-chart');
    if (investmentsDistributionChartCanvas && window.Chart) {
        // تدمير الرسم البياني الموجود إذا كان موجودًا
        if (investmentsDistributionChart) {
            investmentsDistributionChart.destroy();
        }
        
        // تجهيز بيانات توزيع الاستثمارات
        const categories = {
            small: { count: 0, total: 0, label: 'أقل من 10,000' },
            medium: { count: 0, total: 0, label: 'من 10,000 إلى 50,000' },
            large: { count: 0, total: 0, label: 'من 50,000 إلى 100,000' },
            xlarge: { count: 0, total: 0, label: 'أكثر من 100,000' }
        };
        
        investors.forEach(inv => {
            const amount = inv.amount || 0;
            if (amount < 10000) {
                categories.small.count++;
                categories.small.total += amount;
            } else if (amount < 50000) {
                categories.medium.count++;
                categories.medium.total += amount;
            } else if (amount < 100000) {
                categories.large.count++;
                categories.large.total += amount;
            } else {
                categories.xlarge.count++;
                categories.xlarge.total += amount;
            }
        });
        
        // إنشاء رسم بياني جديد
        investmentsDistributionChart = new Chart(investmentsDistributionChartCanvas.getContext('2d'), {
            type: 'pie',
            data: {
                labels: Object.values(categories).map(c => c.label),
                datasets: [{
                    data: Object.values(categories).map(c => c.total),
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(239, 68, 68, 0.7)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // رسم أداء الاستثمارات
    const investmentsPerformanceChartCanvas = document.getElementById('investments-performance-chart');
    if (investmentsPerformanceChartCanvas && window.Chart) {
        // تدمير الرسم البياني الموجود إذا كان موجودًا
        if (investmentsPerformanceChart) {
            investmentsPerformanceChart.destroy();
        }
        
        // تجهيز بيانات أداء الاستثمارات والأرباح
        const months = getLast6Months();
        const investmentData = getMonthlyInvestmentData();
        const profitData = getMonthlyProfitData();
        
        // إنشاء رسم بياني جديد
        investmentsPerformanceChart = new Chart(investmentsPerformanceChartCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'الاستثمارات',
                        data: investmentData,
                        backgroundColor: 'rgba(59, 130, 246, 0.7)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'الأرباح',
                        data: profitData,
                        backgroundColor: 'rgba(16, 185, 129, 0.7)',
                        borderColor: 'rgba(16, 185, 129, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// تحديث الرسوم البيانية
function updateCharts() {
    console.log('تحديث الرسوم البيانية...');
    
    // في الإصدار المحدث، نعيد تهيئة الرسوم بالكامل
    initCharts();
}

// الحصول على بيانات الأرباح الشهرية
function getMonthlyProfitData() {
    const data = [0, 0, 0, 0, 0, 0]; // 6 أشهر
    const now = new Date();
    
    transactions.forEach(transaction => {
        if (transaction.type === 'دفع أرباح') {
            const transDate = new Date(transaction.date || transaction.createdAt);
            const monthsAgo = (now.getFullYear() - transDate.getFullYear()) * 12 + now.getMonth() - transDate.getMonth();
            
            if (monthsAgo >= 0 && monthsAgo < 6) {
                data[5 - monthsAgo] += transaction.amount;
            }
        }
    });
    
    return data;
}

// الحصول على بيانات الإيداعات الشهرية
function getMonthlyDeposits() {
    const data = [0, 0, 0, 0, 0, 0]; // 6 أشهر
    const now = new Date();
    
    transactions.forEach(transaction => {
        if (transaction.type !== 'إيداع') return;
        
        const transDate = new Date(transaction.date || transaction.createdAt);
        const monthsAgo = (now.getFullYear() - transDate.getFullYear()) * 12 + now.getMonth() - transDate.getMonth();
        
        if (monthsAgo >= 0 && monthsAgo < 6) {
            data[5 - monthsAgo] += transaction.amount;
        }
    });
    
    return data;
}

// الحصول على بيانات السحوبات الشهرية
function getMonthlyWithdrawals() {
    const data = [0, 0, 0, 0, 0, 0]; // 6 أشهر
    const now = new Date();
    
    transactions.forEach(transaction => {
        if (transaction.type !== 'سحب') return;
        
        const transDate = new Date(transaction.date || transaction.createdAt);
        const monthsAgo = (now.getFullYear() - transDate.getFullYear()) * 12 + now.getMonth() - transDate.getMonth();
        
        if (monthsAgo >= 0 && monthsAgo < 6) {
            data[5 - monthsAgo] += transaction.amount;
        }
    });
    
    return data;
}

// الحصول على بيانات الأرباح الشهرية
function getMonthlyProfitData() {
    const data = [0, 0, 0, 0, 0, 0]; // 6 أشهر
    const now = new Date();
    
    transactions.forEach(transaction => {
        if (transaction.type !== 'دفع أرباح') return;
        
        const transDate = new Date(transaction.date || transaction.createdAt);
        const monthsAgo = (now.getFullYear() - transDate.getFullYear()) * 12 + now.getMonth() - transDate.getMonth();
        
        if (monthsAgo >= 0 && monthsAgo < 6) {
            data[5 - monthsAgo] += transaction.amount;
        }
    });
    
    return data;
}

// الحصول على توزيع الاستثمارات حسب الفئة
function getInvestmentDistribution() {
    const distribution = [0, 0, 0, 0]; // أربع فئات
    
    investors.forEach(investor => {
        const amount = investor.amount || 0;
        
        if (amount < 10000) {
            distribution[0] += amount;
        } else if (amount >= 10000 && amount < 50000) {
            distribution[1] += amount;
        } else if (amount >= 50000 && amount < 100000) {
            distribution[2] += amount;
        } else {
            distribution[3] += amount;
        }
    });
    
    return distribution;
}

// تحديث إضافي للتطبيق
document.addEventListener('DOMContentLoaded', function() {
    console.log('تحميل الصفحة اكتمل، إضافة مستمعي الأحداث النهائية...');
    
    // تهيئة أزرار التصدير
    setupExportButtons();
    
    // تهيئة دوال النسخ الاحتياطي
    setupBackupFunctions();
    
    // إعداد مستمعي الأحداث الإضافية
    setupAdditionalEventListeners();
    
    
    // عرض رسالة ترحيب
    setTimeout(() => {
        showNotification('مرحباً بك في نظام الاستثمار المتكامل', 'info');
    }, 1000);
});


/**
 * إصلاح لمشكلة الرسوم البيانية
 * للتأكد من تدمير الرسوم البيانية قبل إعادة إنشائها
 */
document.addEventListener("DOMContentLoaded", () => {
    loadData();

    document.getElementById("general-settings-form")?.addEventListener("submit", e => {
        e.preventDefault();
        saveGeneralSettings();
    });

    document.getElementById("profits-settings-form")?.addEventListener("submit", e => {
        e.preventDefault();
        saveProfitsSettings();
    });

    document.getElementById("notifications-settings-form")?.addEventListener("submit", e => {
        e.preventDefault();
        saveNotificationsSettings();
    });
});


/**
 * وظيفة التعرف على الصوت للنظام
 * تمكن المستخدم من إدخال البيانات باللغة العربية عن طريق المايكروفون
 */

// تعريف كائن التعرف على الصوت باستخدام الواجهة المناسبة للمتصفح
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

// متغير يخزن كائن التعرف على الصوت النشط
let recognitionInstance = null;
// متغير يخزن حقل الإدخال الذي سيتم تعبئته بالصوت
let currentInputField = null;

/**
 * وظيفة إعداد أزرار المايكروفون في النظام
 * تضيف مستمع حدث لكل زر للمايكروفون
 */
function setupSpeechRecognition() {
    console.log('تهيئة نظام التعرف على الصوت...');
    
    // التحقق من دعم المتصفح للتعرف على الصوت
    if (!SpeechRecognition) {
        console.error('المتصفح لا يدعم ميزة التعرف على الصوت');
        // تغيير شكل أزرار المايكروفون لتعكس عدم الدعم
        disableMicrophoneButtons();
        return;
    }
    
    // العثور على جميع أزرار المايكروفون في الصفحة
    const micButtons = document.querySelectorAll('.mic-btn');
    
    // إضافة مستمع حدث لكل زر
    micButtons.forEach(button => {
        // إضافة فئة تشير إلى أن الزر مدعوم
        button.classList.add('supported');
        
        // إضافة نص بديل للزر
        button.title = 'انقر للتحدث';
        
        // إضافة مستمع حدث النقر
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // الحصول على معرف حقل الإدخال المرتبط بالزر
            const inputId = this.getAttribute('data-input');
            const inputField = document.getElementById(inputId);
            
            if (!inputField) {
                console.error(`لم يتم العثور على حقل الإدخال: ${inputId}`);
                return;
            }
            
            // إذا كان هناك تعرف نشط على الصوت، يتم إيقافه أولاً
            if (recognitionInstance) {
                recognitionInstance.abort();
                stopRecognition();
                
                // إذا كان حقل الإدخال الحالي هو نفسه، فلا داعي لبدء تعرف جديد
                if (currentInputField === inputField) {
                    return;
                }
            }
            
            // تخزين حقل الإدخال الحالي
            currentInputField = inputField;
            
            // بدء التعرف على الصوت
            startRecognition(button);
        });
    });
    
    console.log(`تم تهيئة ${micButtons.length} زر للمايكروفون`);
}

/**
 * تعطيل أزرار المايكروفون في حالة عدم دعم المتصفح
 */
function disableMicrophoneButtons() {
    const micButtons = document.querySelectorAll('.mic-btn');
    
    micButtons.forEach(button => {
        // إضافة فئة تشير إلى أن الزر غير مدعوم
        button.classList.add('not-supported');
        button.title = 'التعرف على الصوت غير مدعوم في هذا المتصفح';
        
        // تغيير الأيقونة
        const icon = button.querySelector('i.fa-microphone');
        if (icon) {
            icon.classList.remove('fa-microphone');
            icon.classList.add('fa-microphone-slash');
        }
        
        // تعطيل الزر
        button.disabled = true;
    });
}

/**
 * بدء عملية التعرف على الصوت
 * @param {HTMLElement} button - زر المايكروفون الذي تم النقر عليه
 */
function startRecognition(button) {
    try {
        // إنشاء كائن جديد للتعرف على الصوت
        const recognition = new SpeechRecognition();
        recognitionInstance = recognition;
        
        // إعداد خيارات التعرف على الصوت
        recognition.lang = 'ar-SA'; // تعيين اللغة العربية
        recognition.continuous = false; // التعرف على جملة واحدة فقط
        recognition.interimResults = true; // عرض النتائج المؤقتة
        recognition.maxAlternatives = 1; // الحصول على نتيجة واحدة فقط
        
        // تغيير مظهر الزر لتعكس حالة الاستماع
        button.classList.add('listening');
        const icon = button.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-microphone');
            icon.classList.add('fa-spinner');
            icon.classList.add('fa-pulse');
        }
        
        // إنشاء عنصر للإشارة إلى التسجيل النشط
        const recordingIndicator = document.createElement('div');
        recordingIndicator.className = 'recording-indicator';
        document.body.appendChild(recordingIndicator);
        
        // إظهار إشعار للمستخدم
        showNotification('جارٍ الاستماع... تحدث الآن', 'info');
        
        // مستمع حدث لنتائج التعرف المؤقتة
        recognition.onresult = function(event) {
            // الحصول على النص المتعرف عليه
            const speechResult = event.results[0][0].transcript;
            console.log(`نتيجة التعرف: "${speechResult}" (الثقة: ${event.results[0][0].confidence})`);
            
            // تحديث قيمة حقل الإدخال بالنص المتعرف عليه
            if (currentInputField) {
                currentInputField.value = speechResult;
                
                // إطلاق حدث تغيير لحقل الإدخال
                const changeEvent = new Event('change', { bubbles: true });
                currentInputField.dispatchEvent(changeEvent);
                
                // إطلاق حدث إدخال لحقل الإدخال
                const inputEvent = new Event('input', { bubbles: true });
                currentInputField.dispatchEvent(inputEvent);
            }
        };
        
        // مستمع حدث لانتهاء التعرف
        recognition.onend = function() {
            stopRecognition();
            
            // إزالة مؤشر التسجيل
            if (recordingIndicator) {
                document.body.removeChild(recordingIndicator);
            }
            
            if (currentInputField && currentInputField.value) {
                showNotification('تم التعرف بنجاح!', 'success');
            }
        };
        
        // مستمع حدث للأخطاء
        recognition.onerror = function(event) {
            console.error(`خطأ في التعرف على الصوت: ${event.error}`);
            
            let errorMessage = 'حدث خطأ في التعرف على الصوت';
            
            // تحديد رسائل الخطأ المختلفة
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
                case 'aborted':
                    // لا حاجة لعرض إشعار في حالة الإلغاء
                    errorMessage = null;
                    break;
            }
            
            // إزالة مؤشر التسجيل
            if (recordingIndicator) {
                document.body.removeChild(recordingIndicator);
            }
            
            stopRecognition();
            
            if (errorMessage) {
                showNotification(errorMessage, 'error');
            }
        };
        
        // بدء عملية التعرف على الصوت
        recognition.start();
        console.log('بدأ الاستماع للصوت...');
        
    } catch (error) {
        console.error('خطأ في بدء التعرف على الصوت:', error);
        showNotification('تعذر بدء التعرف على الصوت', 'error');
        
        stopRecognition();
    }
}

/**
 * إيقاف عملية التعرف على الصوت وإعادة تعيين واجهة المستخدم
 */
function stopRecognition() {
    if (recognitionInstance) {
        try {
            recognitionInstance.stop();
        } catch (e) {
            // تجاهل الأخطاء عند إيقاف التعرف
        }
        
        recognitionInstance = null;
    }
    
    // إعادة تعيين حالة جميع أزرار المايكروفون
    const micButtons = document.querySelectorAll('.mic-btn');
    micButtons.forEach(button => {
        button.classList.remove('listening');
        
        // إعادة تعيين الأيقونة
        const icon = button.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-spinner');
            icon.classList.remove('fa-pulse');
            icon.classList.add('fa-microphone');
        }
    });
    
    // إزالة جميع مؤشرات التسجيل المتبقية
    const indicators = document.querySelectorAll('.recording-indicator');
    indicators.forEach(indicator => {
        indicator.parentNode.removeChild(indicator);
    });
}

/**
 * إضافة أنماط CSS لعناصر التعرف على الصوت
 */
function addSpeechRecognitionStyles() {
    // التحقق من وجود أنماط مسبقة
    if (document.getElementById('speech-recognition-styles')) {
        return;
    }
    
    // إنشاء عنصر نمط جديد
    const styleElement = document.createElement('style');
    styleElement.id = 'speech-recognition-styles';
    
    // إضافة أنماط CSS
    styleElement.textContent = `
        /* نمط لزر المايكروفون */
        .mic-btn {
            position: relative;
            transition: all 0.3s ease;
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
            content: "●  جارٍ الاستماع...";
            font-family: 'Tajawal', sans-serif;
        }
        
        /* تنشيط نبض للمؤشر */
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.6; }
            100% { opacity: 1; }
        }
        
        /* توسيط الأيقونة في الزر */
        .mic-btn i {
            margin: 0;
        }
        
        /* تنسيق لمجموعة الإدخال مع زر المايكروفون */
        .input-group {
            position: relative;
            display: flex;
            align-items: center;
        }
        
        .input-group .form-input {
            flex: 1;
            border-left: 0;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
        }
        
        .input-group .btn-icon-sm {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
        }
    `;
    
    // إضافة عنصر النمط إلى رأس الصفحة
    document.head.appendChild(styleElement);
    console.log('تم إضافة أنماط CSS للتعرف على الصوت');
}

/**
 * إضافة معلومات المساعدة للمستخدم عن استخدام المايكروفون
 */
function addSpeechRecognitionHelpInfo() {
    // إنشاء نافذة منبثقة للمساعدة
    const helpButton = document.createElement('button');
    helpButton.className = 'btn btn-info speech-help-btn';
    helpButton.innerHTML = '<i class="fas fa-question-circle"></i>';
    helpButton.title = 'مساعدة حول استخدام الإدخال الصوتي';
    
    // موضع الزر
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
}

/**
 * عرض شاشة المساعدة للتعرف على الصوت
 */
function showSpeechHelpModal() {
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
    
    // استخدام دالة عرض النافذة المنبثقة الموجودة
    showModal('مساعدة الإدخال الصوتي', content);
}

/**
 * تحسين التعرف على الصوت بإضافة قواعد نحوية للكلمات المتوقعة
 * يساعد على تحسين دقة التعرف على الأرقام والمصطلحات المالية
 */
function setupSpeechGrammar() {
    if (!SpeechGrammarList) {
        return; // عدم دعم قوائم القواعد النحوية
    }
    
    // إنشاء قائمة قواعد نحوية للأرقام والكلمات المتوقعة
    const numbers = '0 1 2 3 4 5 6 7 8 9 صفر واحد اثنان ثلاثة أربعة خمسة ستة سبعة ثمانية تسعة عشرة عشرون ثلاثون أربعون خمسون ستون سبعون ثمانون تسعون مائة مئة ألف مليون';
    const financialTerms = 'دينار ريال درهم دولار يورو إيداع سحب استثمار ربح أرباح فائدة رصيد مستثمر';
    
    // إنشاء قواعد JSGF
    const grammar = `#JSGF V1.0; grammar numbers; public <numbers> = ${numbers}; public <terms> = ${financialTerms};`;
    
    // تطبيق القواعد على كائن التعرف على الصوت
    const speechRecognitionList = new SpeechGrammarList();
    speechRecognitionList.addFromString(grammar, 1);
    
    // حفظ القواعد لاستخدامها لاحقًا
    window.speechGrammarList = speechRecognitionList;
}

// تهيئة نظام التعرف على الصوت عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // إضافة أنماط CSS
    addSpeechRecognitionStyles();
   
    
    // إعداد القواعد النحوية
    setupSpeechGrammar();
    
    // إضافة معلومات المساعدة
    addSpeechRecognitionHelpInfo();
});

// التعامل مع فتح وإغلاق النوافذ المنبثقة
document.addEventListener('modal:opened', function(e) {
    // إيقاف أي تعرف على الصوت نشط عند فتح نافذة منبثقة
    stopRecognition();
    
    // البحث عن أزرار المايكروفون الجديدة في النافذة المنبثقة وتهيئتها
    const modalId = e.detail.modalId;
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
        const newMicButtons = modalElement.querySelectorAll('.mic-btn:not(.supported)');
        if (newMicButtons.length > 0) {
            setupSpeechRecognitionForButtons(newMicButtons);
        }
    }
});

// وظيفة تهيئة مجموعة محددة من أزرار المايكروفون
function setupSpeechRecognitionForButtons(buttons) {
    if (!SpeechRecognition) {
        disableMicrophoneButtons();
        return;
    }
    
    buttons.forEach(button => {
        button.classList.add('supported');
        button.title = 'انقر للتحدث';
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const inputId = this.getAttribute('data-input');
            const inputField = document.getElementById(inputId);
            
            if (!inputField) {
                console.error(`لم يتم العثور على حقل الإدخال: ${inputId}`);
                return;
            }
            
            if (recognitionInstance) {
                recognitionInstance.abort();
                stopRecognition();
                
                if (currentInputField === inputField) {
                    return;
                }
            }
            
            currentInputField = inputField;
            startRecognition(button);
        });
    });
}



// إضافة هذه الدالة في ملف app-fixed.js (يمكن إضافتها في نهاية الملف، قبل آخر سطر)
function formatCurrency(amount, addCurrency = true) {
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
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // إعادة المبلغ مع إضافة العملة إذا تم طلب ذلك
    const formattedAmount = parts.join('.');
    
    if (addCurrency) {
        return formattedAmount + " " + (window.settings?.currency || 'دينار');
    } else {
        return formattedAmount;
    }
}

// إضافة الدالة كخاصية لكائن window للتأكد من إمكانية الوصول إليها
window.formatCurrency = formatCurrency;

/**
 * دمج ميزة التعرف على الصوت مع نظام الاستثمار المتكامل
 * يوفر هذا الملف التكامل بين نظام التعرف على الصوت والتطبيق الأساسي
 */

// تحديث دالة setupSpeechRecognition الموجودة في ملف app-fixed.js
// نستبدل الدالة الحالية بالتنفيذ المحسن التالي

/**
 * إعداد التعرف على الصوت وتكامله مع نظام الاستثمار
 */
function setupSpeechRecognition() {
    console.log('تهيئة نظام التعرف على الصوت...');
    
    // التحقق من دعم المتصفح للتعرف على الصوت
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    
    if (!SpeechRecognition) {
        console.warn('المتصفح لا يدعم ميزة التعرف على الصوت');
        disableMicrophoneButtons();
        return;
    }
    
    // إضافة أنماط CSS للتعرف على الصوت
    addSpeechRecognitionStyles();
    
    // إعداد قواعد القواميس للتعرف على الصوت (للأرقام والمصطلحات المالية)
    setupSpeechGrammar(SpeechGrammarList);
    
    // البحث عن جميع أزرار المايكروفون المتوافرة في الصفحة
    const micButtons = document.querySelectorAll('.mic-btn');
    if (micButtons.length === 0) {
        console.warn('لم يتم العثور على أزرار مايكروفون في الصفحة');
        
        // إنشاء أزرار المايكروفون للحقول الموجودة
        createMicrophoneButtons();
    } else {
        setupExistingMicrophoneButtons(micButtons);
    }
    
    // إضافة زر المساعدة للتعرف على الصوت
    addSpeechRecognitionHelpButton();
    
    // إضافة مستمعي الأحداث النافذة المنبثقة
    setupModalEvents();
    
    console.log('تم تهيئة نظام التعرف على الصوت بنجاح');
}

/**
 * تعطيل أزرار المايكروفون في حالة عدم دعم المتصفح
 */
function disableMicrophoneButtons() {
    const micButtons = document.querySelectorAll('.mic-btn');
    
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
}

/**
 * إنشاء أزرار المايكروفون للحقول النصية الموجودة في النماذج
 */
function createMicrophoneButtons() {
    console.log('إنشاء أزرار المايكروفون للحقول النصية...');
    
    // العثور على جميع حقول الإدخال النصية ورقمية
    const textInputs = document.querySelectorAll('input[type="text"], input[type="tel"], input[type="number"], textarea');
    
    textInputs.forEach((input, index) => {
        // التحقق من أن الحقل ليس مخفيًا
        if (input.style.display === 'none' || input.type === 'hidden') {
            return;
        }
        
        // التحقق مما إذا كان الحقل يقع داخل مجموعة إدخال
        const parentGroup = input.closest('.input-group');
        
        // إذا كان الحقل ليس بداخل مجموعة إدخال، قم بإنشاء مجموعة جديدة
        if (!parentGroup) {
            // الحصول على معرف الحقل، أو إنشاء واحد إذا لم يكن موجودًا
            if (!input.id) {
                input.id = `input-field-${Date.now()}-${index}`;
            }
            
            // إنشاء مجموعة إدخال جديدة
            const inputGroup = document.createElement('div');
            inputGroup.className = 'input-group';
            
            // إدراج مجموعة الإدخال قبل الحقل النصي في DOM
            input.parentNode.insertBefore(inputGroup, input);
            
            // نقل الحقل النصي إلى داخل مجموعة الإدخال
            inputGroup.appendChild(input);
            
            // إنشاء زر المايكروفون
            const micButton = document.createElement('button');
            micButton.className = 'btn btn-icon-sm mic-btn';
            micButton.type = 'button';
            micButton.setAttribute('data-input', input.id);
            micButton.title = 'انقر للتحدث';
            micButton.innerHTML = '<i class="fas fa-microphone"></i>';
            
            // إضافة زر المايكروفون إلى مجموعة الإدخال
            inputGroup.appendChild(micButton);
        }
    });
    
    // إعداد أزرار المايكروفون التي تم إنشاؤها
    const newMicButtons = document.querySelectorAll('.mic-btn:not(.setup-complete)');
    setupExistingMicrophoneButtons(newMicButtons);
}

/**
 * إعداد أزرار المايكروفون الموجودة بالفعل
 * @param {NodeList} buttons - قائمة أزرار المايكروفون
 */
function setupExistingMicrophoneButtons(buttons) {
    let recognitionInstance = null;
    let currentInputField = null;
    
    buttons.forEach(button => {
        // تجنب إعادة إعداد الأزرار التي تم إعدادها بالفعل
        if (button.classList.contains('setup-complete')) {
            return;
        }
        
        // إضافة فئة تشير إلى اكتمال الإعداد
        button.classList.add('setup-complete');
        
        // إضافة نص بديل للزر
        button.title = 'انقر للتحدث';
        
        // التأكد من وجود معرف لحقل الإدخال
        const inputId = button.getAttribute('data-input');
        if (!inputId) {
            console.error('زر المايكروفون ليس له سمة data-input:', button);
            return;
        }
        
        // إضافة مستمع حدث النقر
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // الحصول على حقل الإدخال المرتبط بالزر
            const inputField = document.getElementById(inputId);
            
            if (!inputField) {
                console.error(`لم يتم العثور على حقل الإدخال: ${inputId}`);
                return;
            }
            
            // إذا كان هناك تعرف نشط على الصوت، يتم إيقافه أولاً
            if (recognitionInstance) {
                recognitionInstance.abort();
                stopSpeechRecognition(recognitionInstance);
                
                // إذا كان حقل الإدخال الحالي هو نفسه، فلا داعي لبدء تعرف جديد
                if (currentInputField === inputField) {
                    currentInputField = null;
                    return;
                }
            }
            
            // تخزين حقل الإدخال الحالي
            currentInputField = inputField;
            
            // بدء التعرف على الصوت
            recognitionInstance = startSpeechRecognition(button, inputField);
        });
    });
}

/**
 * بدء عملية التعرف على الصوت
 * @param {HTMLElement} button - زر المايكروفون الذي تم النقر عليه
 * @param {HTMLElement} inputField - حقل الإدخال المرتبط
 * @returns {SpeechRecognition} - كائن التعرف على الصوت
 */
function startSpeechRecognition(button, inputField) {
    // الحصول على كائن التعرف على الصوت
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    try {
        // إنشاء كائن جديد للتعرف على الصوت
        const recognition = new SpeechRecognition();
        
        // إعداد خيارات التعرف على الصوت
        recognition.lang = 'ar-SA'; // تعيين اللغة العربية
        recognition.continuous = false; // التعرف على جملة واحدة فقط
        recognition.interimResults = true; // عرض النتائج المؤقتة
        recognition.maxAlternatives = 1; // الحصول على نتيجة واحدة فقط
        
        // إضافة قواعد القواميس إذا كانت متاحة
        if (window.speechGrammarList) {
            recognition.grammars = window.speechGrammarList;
        }
        
        // تغيير مظهر الزر ليعكس حالة الاستماع
        button.classList.add('listening');
        const icon = button.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-microphone');
            icon.classList.add('fa-spinner');
            icon.classList.add('fa-pulse');
        }
        
        // إضافة فئة تشير إلى أن الحقل يستخدم الإدخال الصوتي
        inputField.classList.add('voice-input');
        
        // إنشاء مؤشر التسجيل النشط
        const recordingIndicator = document.createElement('div');
        recordingIndicator.className = 'recording-indicator';
        recordingIndicator.textContent = 'جارٍ الاستماع... تحدث الآن';
        document.body.appendChild(recordingIndicator);
        
        // إظهار إشعار للمستخدم
        showNotification('جارٍ الاستماع... تحدث الآن', 'info');
        
        // مستمع حدث لنتائج التعرف المؤقتة
        recognition.onresult = function(event) {
            // الحصول على النص المتعرف عليه
            const speechResult = event.results[0][0].transcript;
            console.log(`نتيجة التعرف: "${speechResult}" (الثقة: ${event.results[0][0].confidence})`);
            
            // تحديث قيمة حقل الإدخال بالنص المتعرف عليه
            inputField.value = speechResult;
            
            // إطلاق حدث تغيير لحقل الإدخال
            const changeEvent = new Event('change', { bubbles: true });
            inputField.dispatchEvent(changeEvent);
            
            // إطلاق حدث إدخال لحقل الإدخال
            const inputEvent = new Event('input', { bubbles: true });
            inputField.dispatchEvent(inputEvent);
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
            
            // إزالة فئة الإدخال الصوتي بعد فترة قصيرة
            setTimeout(() => {
                inputField.classList.remove('voice-input');
            }, 2000);
            
            // إزالة مؤشر التسجيل
            if (recordingIndicator.parentNode) {
                recordingIndicator.parentNode.removeChild(recordingIndicator);
            }
            
            if (inputField.value) {
                showNotification('تم التعرف بنجاح!', 'success');
            }
        };
        
        // مستمع حدث للأخطاء
        recognition.onerror = function(event) {
            console.error(`خطأ في التعرف على الصوت: ${event.error}`);
            
            let errorMessage = 'حدث خطأ في التعرف على الصوت';
            
            // تحديد رسائل الخطأ المختلفة
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
                case 'aborted':
                    // لا حاجة لعرض إشعار في حالة الإلغاء
                    errorMessage = null;
                    break;
            }
            
            // إعادة تعيين حالة الزر
            button.classList.remove('listening');
            if (icon) {
                icon.classList.remove('fa-spinner');
                icon.classList.remove('fa-pulse');
                icon.classList.add('fa-microphone');
            }
            
            // إزالة فئة الإدخال الصوتي
            inputField.classList.remove('voice-input');
            
            // إزالة مؤشر التسجيل
            if (recordingIndicator.parentNode) {
                recordingIndicator.parentNode.removeChild(recordingIndicator);
            }
            
            if (errorMessage) {
                showNotification(errorMessage, 'error');
            }
        };
        
        // بدء عملية التعرف على الصوت
        recognition.start();
        console.log('بدأ الاستماع للصوت...');
        
        return recognition;
        
    } catch (error) {
        console.error('خطأ في بدء التعرف على الصوت:', error);
        showNotification('تعذر بدء التعرف على الصوت', 'error');
        
        // إعادة تعيين حالة الزر
        button.classList.remove('listening');
        const icon = button.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-spinner');
            icon.classList.remove('fa-pulse');
            icon.classList.add('fa-microphone');
        }
        
        return null;
    }
}

/**
 * إيقاف عملية التعرف على الصوت
 * @param {SpeechRecognition} recognition - كائن التعرف على الصوت
 */
function stopSpeechRecognition(recognition) {
    if (recognition) {
        try {
            recognition.stop();
        } catch (e) {
            // تجاهل الأخطاء عند إيقاف التعرف
        }
    }
    
    // إعادة تعيين حالة جميع أزرار المايكروفون
    const micButtons = document.querySelectorAll('.mic-btn.listening');
    micButtons.forEach(button => {
        button.classList.remove('listening');
        
        // إعادة تعيين الأيقونة
        const icon = button.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-spinner');
            icon.classList.remove('fa-pulse');
            icon.classList.add('fa-microphone');
        }
    });
    
    // إزالة جميع مؤشرات التسجيل المتبقية
    const indicators = document.querySelectorAll('.recording-indicator');
    indicators.forEach(indicator => {
        if (indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    });
    
    // إزالة فئة الإدخال الصوتي من جميع الحقول
    const voiceInputs = document.querySelectorAll('.voice-input');
    voiceInputs.forEach(input => {
        input.classList.remove('voice-input');
    });
}

/**
 * إضافة أنماط CSS للتعرف على الصوت
 */
function addSpeechRecognitionStyles() {
    // التحقق من وجود أنماط مسبقة
    if (document.getElementById('speech-recognition-styles')) {
        return;
    }
    
    // إنشاء عنصر نمط جديد
    const styleElement = document.createElement('style');
    styleElement.id = 'speech-recognition-styles';
    
    // إضافة أنماط CSS
    styleElement.textContent = `
        /* نمط لزر المايكروفون */
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
            display: flex;
            align-items: center;
            animation: pulse 1.5s infinite;
        }
        
        .recording-indicator::before {
            content: "●";
            margin-left: 8px;
            font-size: 16px;
            animation: blink 1s infinite;
        }
        
        /* تنسيق حقل الإدخال أثناء استخدام الصوت */
        .voice-input {
            border-color: #f44336 !important;
            background-color: rgba(244, 67, 54, 0.05) !important;
            transition: all 0.3s ease;
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
    `;
    
    // إضافة عنصر النمط إلى رأس الصفحة
    document.head.appendChild(styleElement);
    console.log('تم إضافة أنماط CSS للتعرف على الصوت');
}

/**
 * إعداد قواعد القواميس للتعرف على الصوت
 * @param {Object} SpeechGrammarList - كائن قائمة القواعد النحوية
 */
function setupSpeechGrammar(SpeechGrammarList) {
    if (!SpeechGrammarList) {
        return; // عدم دعم قوائم القواعد النحوية
    }
    
    try {
        // إنشاء قائمة قواعد نحوية للأرقام والكلمات المتوقعة
        const numbers = '0 1 2 3 4 5 6 7 8 9 صفر واحد اثنان ثلاثة أربعة خمسة ستة سبعة ثمانية تسعة عشرة عشرون ثلاثون أربعون خمسون ستون سبعون ثمانون تسعون مائة مئة ألف مليون';
        const financialTerms = 'دينار ريال درهم دولار يورو إيداع سحب استثمار ربح أرباح فائدة رصيد مستثمر';
        
        // إنشاء قواعد JSGF
        const grammar = `#JSGF V1.0; grammar numbers; public <numbers> = ${numbers}; public <terms> = ${financialTerms};`;
        
        // إنشاء قائمة القواعد النحوية
        const speechGrammarList = new SpeechGrammarList();
        speechGrammarList.addFromString(grammar, 1);
        
        // حفظ القواعد النحوية
        window.speechGrammarList = speechGrammarList;
        
        console.log('تم إعداد قواعد القواميس للتعرف على الصوت');
    } catch (error) {
        console.error('خطأ في إعداد قواعد القواميس:', error);
    }
}



/**
 * إعداد مستمعي الأحداث للنوافذ المنبثقة
 */
function setupModalEvents() {
    // استمع لأحداث فتح النوافذ المنبثقة لإضافة أزرار المايكروفون للحقول الجديدة
    document.addEventListener('click', function(event) {
        // البحث عن أزرار فتح النوافذ المنبثقة التي تم النقر عليها
        const modalTrigger = event.target.closest('[data-modal], [data-page], .modal-close, .modal-close-btn');
        
        if (modalTrigger) {
            // تأخير لإعطاء وقت للنافذة المنبثقة للظهور
            setTimeout(() => {
                // البحث عن حقول النموذج التي تحتاج إلى أزرار المايكروفون
                createMicrophoneButtons();
                
                // البحث عن أزرار المايكروفون الموجودة وإعدادها
                const modalMicButtons = document.querySelectorAll('.modal.active .mic-btn:not(.setup-complete)');
                if (modalMicButtons.length > 0) {
                    setupExistingMicrophoneButtons(modalMicButtons);
                }
            }, 300);
        }
    });
    
    // إيقاف أي تعرف على الصوت نشط عند إغلاق النافذة المنبثقة
    document.addEventListener('click', function(event) {
        const modalCloseBtn = event.target.closest('.modal-close, .modal-close-btn');
        if (modalCloseBtn) {
                        // إيقاف أي تعرف على الصوت نشط
                    }
                });
            }


            document.getElementById("minimize-btn").addEventListener("click", () => {
                window.windowControls.minimize();
              });
            
              document.getElementById("maximize-btn").addEventListener("click", () => {
                window.windowControls.maximize();
              });
            
              document.getElementById("close-btn").addEventListener("click", () => {
                window.windowControls.close();
              });
              
              
              
              document.addEventListener('page:change', function(e) {
    if (!e.detail || !e.detail.page) return;
    
    // قائمة الصفحات المحمية التي تتطلب تسجيل الدخول
    const protectedPages = [
        'investors', 'transactions', 'profits', 'reports', 'settings'
    ];
    
    // التحقق مما إذا كانت الصفحة المطلوبة محمية
    if (protectedPages.includes(e.detail.page)) {
        // التحقق من حالة المصادقة
        const isAuthenticated = window.AuthSystem ? window.AuthSystem.isAuthenticated() : false;
        
        if (!isAuthenticated) {
            // منع الوصول إلى الصفحة المحمية
            e.preventDefault();
            e.stopPropagation();
            
            // إظهار نافذة تسجيل الدخول
            if (window.AuthSystem) {
                window.AuthSystem.showAuthModal();
            }
            
            // إظهار إشعار للمستخدم
            if (window.showNotification) {
                window.showNotification('يجب تسجيل الدخول للوصول إلى هذه الصفحة', 'warning');
            }
            
            // العودة إلى الصفحة الرئيسية
            showPage('dashboard');
            
            return false;
        }
    }
});

// إضافة أنماط CSS للصادرات والواردات
function addFinancialTrackingStyles() {
    // التحقق من وجود أنماط مسبقة
    if (document.getElementById('financial-tracking-styles')) {
        return;
    }
    
    // إنشاء عنصر نمط جديد
    const styleElement = document.createElement('style');
    styleElement.id = 'financial-tracking-styles';
    
    // إضافة أنماط CSS
    styleElement.textContent = `
        /* أنماط عامة للصادرات والواردات */
        .exports-dashboard,
        .imports-dashboard {
            margin-bottom: 1.5rem;
        }
        
        /* تنسيق الشارات */
        .badge.badge-success {
            background-color: #10b981;
            color: white;
        }
        
        .badge.badge-danger {
            background-color: #ef4444;
            color: white;
        }
        
        .badge.badge-info {
            background-color: #3b82f6;
            color: white;
        }
        
        .badge.badge-primary {
            background-color: #6366f1;
            color: white;
        }
        
        .badge.badge-warning {
            background-color: #f59e0b;
            color: white;
        }
        
        .badge.badge-secondary {
            background-color: #6b7280;
            color: white;
        }
        
        /* تنسيق جدول الصادرات والواردات */
        #exports-table td,
        #imports-table td {
            vertical-align: middle;
        }
        
        /* تنسيق حقول النماذج */
        #expense-form .form-group,
        #income-form .form-group {
            margin-bottom: 1rem;
        }
        
        /* تنسيق الرسوم البيانية */
        .chart-container {
            height: 300px;
            margin-top: 1rem;
        }
        
        /* تنسيق فجوة بين الأزرار */
        .btn + .btn {
            margin-right: 0.5rem;
        }
        
        /* تحسين مظهر البطاقات */
        .card-value {
            font-weight: bold;
            font-size: 1.5rem;
            margin: 0.5rem 0;
        }
        
        .card-change {
            font-size: 0.85rem;
            color: #6b7280;
        }
        
        /* تنسيق الأقسام */
        .section {
            margin-bottom: 2rem;
        }
        
        .mt-4 {
            margin-top: 2rem;
        }
    `;
    
    // إضافة عنصر النمط إلى رأس الصفحة
    document.head.appendChild(styleElement);
    console.log('تم إضافة أنماط CSS للصادرات والواردات');
}

// إضافة دالة تهيئة الأنماط عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تأخير قليل للتأكد من تحميل باقي النظام
    setTimeout(() => {
        addFinancialTrackingStyles();
    }, 500);
});// عرض بيانات الصادرات
function renderExportsData(period = 'all') {
    console.log(`عرض بيانات الصادرات (الفترة: ${period})...`);
    
    const tableBody = document.querySelector('#exports-table tbody');
    if (!tableBody) {
        console.error("لم يتم العثور على جدول الصادرات!");
        return;
    }
    
    // فلترة البيانات حسب الفترة المحددة
    const filteredData = filterDataByPeriod(window.exports, period);
    
    // إذا لم تكن هناك بيانات
    if (filteredData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center">لا توجد بيانات صادرات ${getPeriodText(period)}</td></tr>`;
        // تحديث بطاقات الإحصائيات
        updateExportsDashboard(filteredData, period);
        return;
    }
    
    // ترتيب البيانات حسب التاريخ (الأحدث أولاً)
    filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // إنشاء صفوف الجدول
    tableBody.innerHTML = '';
    filteredData.forEach(item => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${formatDate(item.date)}</td>
            <td><span class="badge badge-${getTypeClass(item.type)}">${item.type}</span></td>
            <td>${item.description}</td>
            <td>${item.investorName || '-'}</td>
            <td>${formatCurrency(item.amount)}</td>
            <td>${item.notes || '-'}</td>
            <td>
                <button class="btn btn-sm btn-outline edit-export-btn" data-id="${item.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline danger delete-export-btn" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // إضافة مستمعي الأحداث للأزرار
    setupExportsActionButtons();
    
    // تحديث بطاقات الإحصائيات
    updateExportsDashboard(filteredData, period);
}

// عرض بيانات الواردات
function renderImportsData(period = 'all') {
    console.log(`عرض بيانات الواردات (الفترة: ${period})...`);
    
    const tableBody = document.querySelector('#imports-table tbody');
    if (!tableBody) {
        console.error("لم يتم العثور على جدول الواردات!");
        return;
    }
    
    // فلترة البيانات حسب الفترة المحددة
    const filteredData = filterDataByPeriod(window.imports, period);
    
    // إذا لم تكن هناك بيانات
    if (filteredData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center">لا توجد بيانات واردات ${getPeriodText(period)}</td></tr>`;
        // تحديث بطاقات الإحصائيات
        updateImportsDashboard(filteredData, period);
        return;
    }
    
    // ترتيب البيانات حسب التاريخ (الأحدث أولاً)
    filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // إنشاء صفوف الجدول
    tableBody.innerHTML = '';
    filteredData.forEach(item => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${formatDate(item.date)}</td>
            <td><span class="badge badge-${getTypeClass(item.type)}">${item.type}</span></td>
            <td>${item.description}</td>
            <td>${item.investorName || '-'}</td>
            <td>${formatCurrency(item.amount)}</td>
            <td>${item.notes || '-'}</td>
            <td>
                <button class="btn btn-sm btn-outline edit-import-btn" data-id="${item.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline danger delete-import-btn" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // إضافة مستمعي الأحداث للأزرار
    setupImportsActionButtons();
    
    // تحديث بطاقات الإحصائيات
    updateImportsDashboard(filteredData, period);
}

// تحديث لوحة معلومات الصادرات
function updateExportsDashboard(data, period) {
    console.log("تحديث لوحة معلومات الصادرات...");
    
    // إجمالي الصادرات
    const totalExpenses = data.reduce((sum, item) => sum + item.amount, 0);
    
    // تصنيف المصروفات حسب النوع
    const withdrawals = data.filter(item => item.type === 'سحب');
    const profitPayments = data.filter(item => item.type === 'دفع أرباح');
    const operationalExpenses = data.filter(item => item.type === 'مصروف');
    
    // إجمالي السحوبات
    const totalWithdrawals = withdrawals.reduce((sum, item) => sum + item.amount, 0);
    
    // إجمالي دفع الأرباح
    const totalProfitPayments = profitPayments.reduce((sum, item) => sum + item.amount, 0);
    
    // إجمالي المصاريف التشغيلية
    const totalOperationalExpenses = operationalExpenses.reduce((sum, item) => sum + item.amount, 0);
    
    // تحديث البطاقات
    document.getElementById('total-expenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('expense-period').textContent = getPeriodText(period);
    
    document.getElementById('withdrawals-amount').textContent = formatCurrency(totalWithdrawals);
    document.getElementById('withdrawals-count').textContent = `${withdrawals.length} عملية`;
    
    document.getElementById('operational-expenses').textContent = formatCurrency(totalOperationalExpenses);
    document.getElementById('operational-count').textContent = `${operationalExpenses.length} عملية`;
    
    document.getElementById('profit-payments').textContent = formatCurrency(totalProfitPayments);
    document.getElementById('profit-payments-count').textContent = `${profitPayments.length} عملية`;
}

// تحديث لوحة معلومات الواردات
function updateImportsDashboard(data, period) {
    console.log("تحديث لوحة معلومات الواردات...");
    
    // إجمالي الواردات
    const totalIncome = data.reduce((sum, item) => sum + item.amount, 0);
    
    // تصنيف الواردات حسب النوع
    const deposits = data.filter(item => item.type === 'إيداع');
    const installments = data.filter(item => item.type === 'دفع قسط');
    const otherIncome = data.filter(item => item.type !== 'إيداع' && item.type !== 'دفع قسط');
    
    // إجمالي الإيداعات
    const totalDeposits = deposits.reduce((sum, item) => sum + item.amount, 0);
    
    // إجمالي الأقساط
    const totalInstallments = installments.reduce((sum, item) => sum + item.amount, 0);
    
    // إجمالي الواردات الأخرى
    const totalOtherIncome = otherIncome.reduce((sum, item) => sum + item.amount, 0);
    
    // تحديث البطاقات
    document.getElementById('total-income').textContent = formatCurrency(totalIncome);
    document.getElementById('income-period').textContent = getPeriodText(period);
    
    document.getElementById('deposits-amount').textContent = formatCurrency(totalDeposits);
    document.getElementById('deposits-count').textContent = `${deposits.length} عملية`;
    
    document.getElementById('installments-amount').textContent = formatCurrency(totalInstallments);
    document.getElementById('installments-count').textContent = `${installments.length} عملية`;
    
    document.getElementById('other-income').textContent = formatCurrency(totalOtherIncome);
    document.getElementById('other-income-count').textContent = `${otherIncome.length} عملية`;
}

// فلترة البيانات حسب الفترة المحددة
function filterDataByPeriod(data, period) {
    if (period === 'all') {
        return data;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return data.filter(item => {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        
        switch (period) {
            case 'today':
                return itemDate.getTime() === today.getTime();
                
            case 'week':
                // آخر 7 أيام
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                return itemDate >= weekAgo;
                
            case 'month':
                // آخر 30 يوم
                const monthAgo = new Date(today);
                monthAgo.setDate(today.getDate() - 30);
                return itemDate >= monthAgo;
                
            default:
                return true;
        }
    });
}

// البحث في البيانات المالية
function searchFinancialData(type, query) {
    if (!query || query.trim() === '') {
        if (type === 'exports') {
            renderExportsData();
        } else {
            renderImportsData();
        }
        return;
    }
    
    query = query.trim().toLowerCase();
    
    const data = type === 'exports' ? window.exports : window.imports;
    
    const filteredData = data.filter(item => {
        return (
            (item.type && item.type.toLowerCase().includes(query)) ||
            (item.description && item.description.toLowerCase().includes(query)) ||
            (item.investorName && item.investorName.toLowerCase().includes(query)) ||
            (item.notes && item.notes.toLowerCase().includes(query)) ||
            (item.amount && item.amount.toString().includes(query))
        );
    });
    
    // عرض النتائج
    if (type === 'exports') {
        const tableBody = document.querySelector('#exports-table tbody');
        if (!tableBody) return;
        
        if (filteredData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center">لا توجد نتائج للبحث: "${query}"</td></tr>`;
            return;
        }
        
        // عرض البيانات المصفاة
        tableBody.innerHTML = '';
        filteredData.forEach(item => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${formatDate(item.date)}</td>
                <td><span class="badge badge-${getTypeClass(item.type)}">${item.type}</span></td>
                <td>${item.description}</td>
                <td>${item.investorName || '-'}</td>
                <td>${formatCurrency(item.amount)}</td>
                <td>${item.notes || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline edit-export-btn" data-id="${item.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline danger delete-export-btn" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // إضافة مستمعي الأحداث للأزرار
        setupExportsActionButtons();
    } else {
        const tableBody = document.querySelector('#imports-table tbody');
        if (!tableBody) return;
        
        if (filteredData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center">لا توجد نتائج للبحث: "${query}"</td></tr>`;
            return;
        }
        
        // عرض البيانات المصفاة
        tableBody.innerHTML = '';
        filteredData.forEach(item => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${formatDate(item.date)}</td>
                <td><span class="badge badge-${getTypeClass(item.type)}">${item.type}</span></td>
                <td>${item.description}</td>
                <td>${item.investorName || '-'}</td>
                <td>${formatCurrency(item.amount)}</td>
                <td>${item.notes || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline edit-import-btn" data-id="${item.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline danger delete-import-btn" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // إضافة مستمعي الأحداث للأزرار
        setupImportsActionButtons();
    }
}

// إضافة مستمعي الأحداث لأزرار الصادرات
function setupExportsActionButtons() {
    // أزرار التعديل
    document.querySelectorAll('.edit-export-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            editFinancialRecord('exports', id);
        });
    });
    
    // أزرار الحذف
    document.querySelectorAll('.delete-export-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            deleteFinancialRecord('exports', id);
        });
    });
}

// إضافة مستمعي الأحداث لأزرار الواردات
function setupImportsActionButtons() {
    // أزرار التعديل
    document.querySelectorAll('.edit-import-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            editFinancialRecord('imports', id);
        });
    });
    
    // أزرار الحذف
    document.querySelectorAll('.delete-import-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            deleteFinancialRecord('imports', id);
        });
    });
}

// فتح نافذة إضافة مصروف جديد
function openAddExpenseModal() {
    // إنشاء النافذة المنبثقة
    const modalId = 'add-expense-modal';
    
    // التحقق من وجود النافذة
    if (!document.getElementById(modalId)) {
        createExpenseModal();
    }
    
    // تعيين عنوان النافذة
    const modalTitle = document.querySelector(`#${modalId} .modal-title`);
    if (modalTitle) {
        modalTitle.textContent = 'إضافة مصروف جديد';
    }
    
    // إعادة تعيين النموذج
    const form = document.getElementById('expense-form');
    if (form) {
        form.reset();
    }
    
    // تعيين التاريخ الحالي
    const dateInput = document.getElementById('expense-date');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    // ملء قائمة المستثمرين
    populateInvestorsList('expense-investor');
    
    // فتح النافذة
    openModal(modalId);
}

// فتح نافذة إضافة وارد جديد
function openAddIncomeModal() {
    // إنشاء النافذة المنبثقة
    const modalId = 'add-income-modal';
    
    // التحقق من وجود النافذة
    if (!document.getElementById(modalId)) {
        createIncomeModal();
    }
    
    // تعيين عنوان النافذة
    const modalTitle = document.querySelector(`#${modalId} .modal-title`);
    if (modalTitle) {
        modalTitle.textContent = 'إضافة وارد جديد';
    }
    
    // إعادة تعيين النموذج
    const form = document.getElementById('income-form');
    if (form) {
        form.reset();
    }
    
    // تعيين التاريخ الحالي
    const dateInput = document.getElementById('income-date');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    // ملء قائمة المستثمرين
    populateInvestorsList('income-investor');
    
    // فتح النافذة
    openModal(modalId);
}

// تعديل سجل مالي
function editFinancialRecord(type, id) {
    // البحث عن السجل
    const data = type === 'exports' ? window.exports : window.imports;
    const record = data.find(item => item.id === id);
    
    if (!record) {
        showNotification(`لم يتم العثور على السجل المطلوب`, 'error');
        return;
    }
    
    // فتح النافذة المناسبة
    const modalId = type === 'exports' ? 'add-expense-modal' : 'add-income-modal';
    
    // التحقق من وجود النافذة
    if (!document.getElementById(modalId)) {
        if (type === 'exports') {
            createExpenseModal();
        } else {
            createIncomeModal();
        }
    }
    
    // تعيين عنوان النافذة
    const modalTitle = document.querySelector(`#${modalId} .modal-title`);
    if (modalTitle) {
        modalTitle.textContent = type === 'exports' ? 'تعديل مصروف' : 'تعديل وارد';
    }
    
    // ملء النموذج ببيانات السجل
    if (type === 'exports') {
        document.getElementById('expense-id').value = record.id;
        document.getElementById('expense-type').value = record.type;
        document.getElementById('expense-description').value = record.description;
        document.getElementById('expense-amount').value = record.amount;
        document.getElementById('expense-date').value = record.date;
        document.getElementById('expense-notes').value = record.notes || '';
        
        // ملء قائمة المستثمرين
        populateInvestorsList('expense-investor', record.investorId);
    } else {
        document.getElementById('income-id').value = record.id;
        document.getElementById('income-type').value = record.type;
        document.getElementById('income-description').value = record.description;
        document.getElementById('income-amount').value = record.amount;
        document.getElementById('income-date').value = record.date;
        document.getElementById('income-notes').value = record.notes || '';
        
        // ملء قائمة المستثمرين
        populateInvestorsList('income-investor', record.investorId);
    }
    
    // فتح النافذة
    openModal(modalId);
}

// حذف سجل مالي
function deleteFinancialRecord(type, id) {
    // التأكيد قبل الحذف
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا السجل؟')) {
        return;
    }
    
    // حذف السجل
    if (type === 'exports') {
        window.exports = window.exports.filter(item => item.id !== id);
    } else {
        window.imports = window.imports.filter(item => item.id !== id);
    }
    
    // حفظ البيانات
    saveFinancialData();
    
    // تحديث واجهة المستخدم
    if (type === 'exports') {
        renderExportsData();
    } else {
        renderImportsData();
    }
    
    // عرض إشعار النجاح
    showNotification('تم حذف السجل بنجاح', 'success');
}

// إنشاء نافذة إضافة مصروف
function createExpenseModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'add-expense-modal';
    
    modalOverlay.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title">إضافة مصروف جديد</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <form id="expense-form">
                    <input type="hidden" id="expense-id" value="">
                    
                    <div class="form-group">
                        <label class="form-label">نوع المصروف</label>
                        <select class="form-select" id="expense-type" required>
                            <option value="">اختر النوع</option>
                            <option value="سحب">سحب</option>
                            <option value="دفع أرباح">دفع أرباح</option>
                            <option value="مصروف">مصروف تشغيلي</option>
                            <option value="مصروف آخر">مصروف آخر</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">الوصف</label>
                        <input type="text" class="form-input" id="expense-description" placeholder="وصف المصروف" required>
                    </div>
                    
                    <div class="grid-cols-2">
                        <div class="form-group">
                            <label class="form-label">المبلغ</label>
                            <input type="number" class="form-input" id="expense-amount" min="1" step="1000" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">التاريخ</label>
                            <input type="date" class="form-input" id="expense-date" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">المستثمر (اختياري)</label>
                        <select class="form-select" id="expense-investor">
                            <option value="">غير محدد</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">ملاحظات</label>
                        <textarea class="form-input" id="expense-notes" rows="3"></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إلغاء</button>
                <button class="btn btn-primary" id="save-expense-btn">حفظ</button>
            </div>
        </div>
    `;
    
    // إضافة النافذة للجسم
    document.body.appendChild(modalOverlay);
    
    // إضافة مستمع حدث لزر الحفظ
    const saveButton = modalOverlay.querySelector('#save-expense-btn');
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            saveExpense();
        });
    }
    
    // إضافة مستمع حدث لزر الإغلاق
    const closeButtons = modalOverlay.querySelectorAll('.modal-close, .modal-close-btn');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// إنشاء نافذة إضافة وارد
function createIncomeModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'add-income-modal';
    
    modalOverlay.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title">إضافة وارد جديد</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <form id="income-form">
                    <input type="hidden" id="income-id" value="">
                    
                    <div class="form-group">
                        <label class="form-label">نوع الوارد</label>
                        <select class="form-select" id="income-type" required>
                            <option value="">اختر النوع</option>
                            <option value="إيداع">إيداع</option>
                            <option value="دفع قسط">دفع قسط</option>
                            <option value="وارد آخر">وارد آخر</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">الوصف</label>
                        <input type="text" class="form-input" id="income-description" placeholder="وصف الوارد" required>
                    </div>
                    
                    <div class="grid-cols-2">
                        <div class="form-group">
                            <label class="form-label">المبلغ</label>
                            <input type="number" class="form-input" id="income-amount" min="1" step="1000" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">التاريخ</label>
                            <input type="date" class="form-input" id="income-date" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">المستثمر (اختياري)</label>
                        <select class="form-select" id="income-investor">
                            <option value="">غير محدد</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">ملاحظات</label>
                        <textarea class="form-input" id="income-notes" rows="3"></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إلغاء</button>
                <button class="btn btn-primary" id="save-income-btn">حفظ</button>
            </div>
        </div>
    `;
    
    // إضافة النافذة للجسم
    document.body.appendChild(modalOverlay);
    
    // إضافة مستمع حدث لزر الحفظ
    const saveButton = modalOverlay.querySelector('#save-income-btn');
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            saveIncome();
        });
    }
    
    // إضافة مستمع حدث لزر الإغلاق
    const closeButtons = modalOverlay.querySelectorAll('.modal-close, .modal-close-btn');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// ملء قائمة المستثمرين
function populateInvestorsList(selectId, selectedId = null) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    // الحفاظ على الخيار الأول
    const firstOption = select.querySelector('option:first-child');
    select.innerHTML = '';
    if (firstOption) {
        select.appendChild(firstOption);
    }
    
    // ملء القائمة بالمستثمرين
    if (Array.isArray(window.investors)) {
        // ترتيب المستثمرين أبجديًا
        const sortedInvestors = [...window.investors].sort((a, b) => a.name.localeCompare(b.name));
        
        sortedInvestors.forEach(investor => {
            const option = document.createElement('option');
            option.value = investor.id;
            option.textContent = investor.name;
            
            // تحديد الخيار إذا كان مطابقًا
            if (selectedId && investor.id === selectedId) {
                option.selected = true;
            }
            
            select.appendChild(option);
        });
    }
}

// حفظ مصروف جديد
function saveExpense() {
    const form = document.getElementById('expense-form');
    if (!form) return;
    
    // التحقق من صحة البيانات
    const id = document.getElementById('expense-id').value;
    const type = document.getElementById('expense-type').value;
    const description = document.getElementById('expense-description').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const date = document.getElementById('expense-date').value;
    const investorId = document.getElementById('expense-investor').value;
    const notes = document.getElementById('expense-notes').value;
    
    if (!type || !description || isNaN(amount) || amount <= 0 || !date) {
        showNotification('يرجى ملء جميع الحقول المطلوبة بشكل صحيح', 'error');
        return;
    }
    
    // الحصول على اسم المستثمر إذا كان محددًا
    let investorName = '';
    if (investorId) {
        const investor = window.investors.find(inv => inv.id === investorId);
        if (investor) {
            investorName = investor.name;
        }
    }
    
    // إنشاء سجل مصروف جديد
    const expense = {
        id: id || Date.now().toString(),
        type,
        description,
        amount,
        date,
        investorId,
        investorName,
        notes,
        createdAt: new Date().toISOString()
    };
    
    // إضافة أو تحديث السجل
    if (id) {
        // تحديث سجل موجود
        const index = window.exports.findIndex(item => item.id === id);
        if (index !== -1) {
            window.exports[index] = expense;
        }
    } else {
        // إضافة سجل جديد
        window.exports.push(expense);
    }
    
    // حفظ البيانات
    saveFinancialData();
    
    // إضافة إلى سجل العمليات أيضًا إذا كان سجل جديد
    if (!id && (type === 'سحب' || type === 'دفع أرباح')) {
        addToTransactions(expense);
    }
    
    // إغلاق النافذة
    closeModal('add-expense-modal');
    
    // تحديث واجهة المستخدم
    renderExportsData();
    
    // عرض إشعار النجاح
    showNotification(id ? 'تم تحديث المصروف بنجاح' : 'تم إضافة المصروف بنجاح', 'success');
}

// حفظ وارد جديد
function saveIncome() {
    const form = document.getElementById('income-form');
    if (!form) return;
    
    // التحقق من صحة البيانات
    const id = document.getElementById('income-id').value;
    const type = document.getElementById('income-type').value;
    const description = document.getElementById('income-description').value;
    const amount = parseFloat(document.getElementById('income-amount').value);
    const date = document.getElementById('income-date').value;
    const investorId = document.getElementById('income-investor').value;
    const notes = document.getElementById('income-notes').value;
    
    if (!type || !description || isNaN(amount) || amount <= 0 || !date) {
        showNotification('يرجى ملء جميع الحقول المطلوبة بشكل صحيح', 'error');
        return;
    }
    
    // الحصول على اسم المستثمر إذا كان محددًا
    let investorName = '';
    if (investorId) {
        const investor = window.investors.find(inv => inv.id === investorId);
        if (investor) {
            investorName = investor.name;
        }
    }
    
    // إنشاء سجل وارد جديد
    const income = {
        id: id || Date.now().toString(),
        type,
        description,
        amount,
        date,
        investorId,
        investorName,
        notes,
        createdAt: new Date().toISOString()
    };
    
    // إضافة أو تحديث السجل
    if (id) {
        // تحديث سجل موجود
        const index = window.imports.findIndex(item => item.id === id);
        if (index !== -1) {
            window.imports[index] = income;
        }
    } else {
        // إضافة سجل جديد
        window.imports.push(income);
    }
    
    // حفظ البيانات
    saveFinancialData();
    
    // إضافة إلى سجل العمليات أيضًا إذا كان سجل جديد
    if (!id && (type === 'إيداع' || type === 'دفع قسط')) {
        addToTransactions(income);
    }
    
    // إغلاق النافذة
    closeModal('add-income-modal');
    
    // تحديث واجهة المستخدم
    renderImportsData();
    
    // عرض إشعار النجاح
    showNotification(id ? 'تم تحديث الوارد بنجاح' : 'تم إضافة الوارد بنجاح', 'success');
}

// إضافة سجل إلى transactions
function addToTransactions(record) {
    if (!Array.isArray(window.transactions)) {
        window.transactions = [];
    }
    
    // إنشاء سجل للعملية
    const transaction = {
        id: record.id,
        date: record.date,
        createdAt: record.createdAt,
        type: record.type,
        investorId: record.investorId,
        investorName: record.investorName,
        amount: record.amount,
        notes: record.notes
    };
    
    // إضافة العملية
    window.transactions.push(transaction);
    
    // تحديث رصيد المستثمر إذا كان محددًا
    if (record.investorId) {
        const investor = window.investors.find(inv => inv.id === record.investorId);
        if (investor) {
            if (record.type === 'إيداع') {
                investor.amount = (investor.amount || 0) + record.amount;
            } else if (record.type === 'سحب') {
                investor.amount = (investor.amount || 0) - record.amount;
            }
            
            // تحديث transaction بالرصيد الجديد
            transaction.balanceAfter = investor.amount;
        }
    }
    
    // حفظ البيانات
    if (typeof window.saveData === 'function') {
        window.saveData();
    }
    
    // إطلاق حدث تحديث العمليات
    document.dispatchEvent(new CustomEvent('transaction:update'));
}

// رسم مخطط الصادرات
function renderExportsChart() {
    const canvas = document.getElementById('expenses-chart');
    if (!canvas || !window.Chart) return;
    
    // تنظيف المخطط السابق
    const chartInstance = Chart.getChart(canvas);
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    // تجميع البيانات حسب النوع
    const withdrawals = window.exports.filter(item => item.type === 'سحب').reduce((sum, item) => sum + item.amount, 0);
    const profitPayments = window.exports.filter(item => item.type === 'دفع أرباح').reduce((sum, item) => sum + item.amount, 0);
    const operationalExpenses = window.exports.filter(item => item.type === 'مصروف').reduce((sum, item) => sum + item.amount, 0);
    const otherExpenses = window.exports.filter(item => item.type === 'مصروف آخر').reduce((sum, item) => sum + item.amount, 0);
    
    // إنشاء المخطط
    new Chart(canvas, {
        type: 'pie',
        data: {
            labels: ['سحوبات', 'دفع أرباح', 'مصاريف تشغيلية', 'مصاريف أخرى'],
            datasets: [{
                data: [withdrawals, profitPayments, operationalExpenses, otherExpenses],
                backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            family: 'Tajawal'
                        }
                    }
                }
            }
        }
    });
}

// رسم مخطط الواردات
function renderImportsChart() {
    const canvas = document.getElementById('income-chart');
    if (!canvas || !window.Chart) return;
    
    // تنظيف المخطط السابق
    const chartInstance = Chart.getChart(canvas);
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    // تجميع البيانات حسب النوع
    const deposits = window.imports.filter(item => item.type === 'إيداع').reduce((sum, item) => sum + item.amount, 0);
    const installments = window.imports.filter(item => item.type === 'دفع قسط').reduce((sum, item) => sum + item.amount, 0);
    const otherIncome = window.imports.filter(item => item.type === 'وارد آخر').reduce((sum, item) => sum + item.amount, 0);
    
    // إنشاء المخطط
    new Chart(canvas, {
        type: 'pie',
        data: {
            labels: ['إيداعات', 'دفع أقساط', 'واردات أخرى'],
            datasets: [{
                data: [deposits, installments, otherIncome],
                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            family: 'Tajawal'
                        }
                    }
                }
            }
        }
    });
}

// تصدير البيانات المالية إلى ملف CSV
function exportFinancialData(type) {
    const data = type === 'exports' ? window.exports : window.imports;
    
    if (!data || data.length === 0) {
        showNotification('لا توجد بيانات للتصدير', 'warning');
        return;
    }
    
    // إنشاء عناوين الأعمدة
    const headers = ['المعرف', 'التاريخ', 'النوع', 'الوصف', 'المستثمر', 'المبلغ', 'ملاحظات'];
    
    // تحويل البيانات إلى صفوف CSV
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    // إضافة الصفوف
    data.forEach(item => {
        const row = [
            item.id,
            item.date,
            item.type,
            `"${item.description.replace(/"/g, '""')}"`,
            item.investorName || '',
            item.amount,
            `"${(item.notes || '').replace(/"/g, '""')}"`
        ];
        
        csvRows.push(row.join(','));
    });
    
    // إنشاء محتوى الملف
    const csvContent = csvRows.join('\n');
    
    // إنشاء رابط التنزيل
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${type === 'exports' ? 'صادرات' : 'واردات'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    // إضافة الرابط للصفحة والنقر عليه
    document.body.appendChild(link);
    link.click();
    
    // تنظيف
    document.body.removeChild(link);
    
    showNotification(`تم تصدير بيانات ${type === 'exports' ? 'الصادرات' : 'الواردات'} بنجاح`, 'success');
}

// فتح النافذة المنبثقة
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.add('active');
}

// إغلاق النافذة المنبثقة
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('active');
}

// الحصول على نص الفترة
function getPeriodText(period) {
    switch (period) {
        case 'today':
            return 'اليوم';
        case 'week':
            return 'هذا الأسبوع';
        case 'month':
            return 'هذا الشهر';
        default:
            return '';
    }
}

// الحصول على فئة لون نوع العملية
function getTypeClass(type) {
    switch (type) {
        case 'إيداع':
            return 'success';
        case 'سحب':
            return 'danger';
        case 'دفع أرباح':
            return 'info';
        case 'دفع قسط':
            return 'primary';
        case 'مصروف':
            return 'warning';
        default:
            return 'secondary';
    }
}

// تنسيق التاريخ
function formatDate(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG');
    } catch (e) {
        return dateString;
    }
}

// تنسيق المبلغ المالي
function formatCurrency(amount) {
    // استخدام دالة النظام لتنسيق المبلغ إذا كانت موجودة
    if (typeof window.formatCurrency === 'function') {
        return window.formatCurrency(amount);
    }
    
    if (isNaN(amount)) amount = 0;
    const formattedAmount = amount.toLocaleString();
    const currency = window.settings?.currency || 'دينار';
    
    return `${formattedAmount} ${currency}`;
}

// تشغيل نظام تتبع الصادرات والواردات
function runFinancialTrackingSystem() {
    console.log("بدء تشغيل نظام تتبع الصادرات والواردات...");

    // تهيئة نظام تتبع الصادرات والواردات
    initFinancialTracking();
    
    // إضافة الأنماط
    addFinancialTrackingStyles();
    
    console.log("تم تشغيل نظام تتبع الصادرات والواردات بنجاح!");
}

// تهيئة نظام تتبع الصادرات والواردات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تأخير قليل للتأكد من تحميل باقي النظام
    setTimeout(() => {
        runFinancialTrackingSystem();
    }, 1000);
});/**
 * إضافة صفحات الصادرات والواردات إلى نظام الاستثمار المتكامل
 * يجب إضافة هذا الملف في نهاية ملف app-fixed.js
 */

// مصفوفات لتخزين الصادرات والواردات
if (!window.exports) {
    window.exports = [];
}

if (!window.imports) {
    window.imports = [];
}

// دالة تهيئة صفحات الصادرات والواردات
function initFinancialTracking() {
    console.log("تهيئة نظام تتبع الصادرات والواردات...");

    // إضافة أزرار التنقل إلى الشريط الجانبي
    addNavBarItems();

    // إنشاء صفحات الصادرات والواردات
    createExportsPage();
    createImportsPage();

    // تحميل بيانات الصادرات والواردات
    loadFinancialData();

    // تسجيل مستمعي الأحداث للعمليات المالية
    registerTransactionListeners();

    console.log("تم تهيئة نظام تتبع الصادرات والواردات بنجاح");
}

// إضافة عناصر القائمة الجانبية
function addNavBarItems() {
    console.log("إضافة أزرار الصادرات والواردات إلى القائمة الجانبية...");
    
    const navList = document.querySelector('.nav-list');
    if (!navList) {
        console.error("لم يتم العثور على قائمة التنقل!");
        return false;
    }
    
    // التحقق من عدم وجود الأزرار مسبقًا
    if (document.querySelector('.nav-link[data-page="exports"]') || document.querySelector('.nav-link[data-page="imports"]')) {
        console.log("أزرار الصادرات والواردات موجودة بالفعل");
        return true;
    }
    
    // البحث عن عنصر التقارير لإضافة الأزرار بعده
    const reportsItem = document.querySelector('.nav-link[data-page="reports"]');
    const reportsLi = reportsItem ? reportsItem.closest('.nav-item') : null;
    
    // إنشاء عنصر زر الصادرات
    const exportsItem = document.createElement('li');
    exportsItem.className = 'nav-item';
    exportsItem.innerHTML = `
        <a class="nav-link" data-page="exports" href="#">
            <div class="nav-icon">
                <i class="fas fa-file-export"></i>
            </div>
            <span>الصادرات</span>
        </a>
    `;
    
    // إنشاء عنصر زر الواردات
    const importsItem = document.createElement('li');
    importsItem.className = 'nav-item';
    importsItem.innerHTML = `
        <a class="nav-link" data-page="imports" href="#">
            <div class="nav-icon">
                <i class="fas fa-file-import"></i>
            </div>
            <span>الواردات</span>
        </a>
    `;
    
    // إضافة الأزرار إلى القائمة
    if (reportsLi) {
        // إضافة بعد زر التقارير مباشرة
        const nextSibling = reportsLi.nextSibling;
        if (nextSibling) {
            navList.insertBefore(exportsItem, nextSibling);
            navList.insertBefore(importsItem, nextSibling);
        } else {
            navList.appendChild(exportsItem);
            navList.appendChild(importsItem);
        }
    } else {
        navList.appendChild(exportsItem);
        navList.appendChild(importsItem);
    }
    
    // إضافة مستمعي أحداث للأزرار
    exportsItem.querySelector('.nav-link').addEventListener('click', function(e) {
        e.preventDefault();
        showFinancialPage("exports");
    });
    
    importsItem.querySelector('.nav-link').addEventListener('click', function(e) {
        e.preventDefault();
        showFinancialPage("imports");
    });
    
    console.log("تم إضافة أزرار الصادرات والواردات بنجاح");
    return true;
}

// إنشاء صفحة الصادرات
function createExportsPage() {
    // التحقق من عدم وجود الصفحة مسبقًا
    if (document.getElementById('exports-page')) {
        return;
    }
    
    // إنشاء عنصر الصفحة
    const pageElement = document.createElement('div');
    pageElement.className = 'page';
    pageElement.id = 'exports-page';
    
    // إنشاء محتوى الصفحة
    pageElement.innerHTML = `
        <div class="header">
            <button class="toggle-sidebar">
                <i class="fas fa-bars"></i>
            </button>
            <h1 class="page-title">الصادرات المالية</h1>
            <div class="header-actions">
                <div class="search-box">
                    <input class="search-input" id="exports-search" placeholder="بحث في الصادرات..." type="text" />
                    <i class="fas fa-search search-icon"></i>
                </div>
                <button class="btn btn-primary" id="export-data-btn">
                    <i class="fas fa-download"></i>
                    <span>تصدير البيانات</span>
                </button>
            </div>
        </div>
        
        <div class="exports-dashboard">
            <div class="dashboard-cards">
                <div class="card">
                    <div class="card-pattern">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="card-header">
                        <div>
                            <div class="card-title">إجمالي الصادرات</div>
                            <div class="card-value" id="total-expenses">0 دينار</div>
                            <div class="card-change">
                                <span id="expense-period">هذا الشهر</span>
                            </div>
                        </div>
                        <div class="card-icon danger">
                            <i class="fas fa-money-bill-wave"></i>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-pattern">
                        <i class="fas fa-hand-holding-usd"></i>
                    </div>
                    <div class="card-header">
                        <div>
                            <div class="card-title">سحوبات المستثمرين</div>
                            <div class="card-value" id="withdrawals-amount">0 دينار</div>
                            <div class="card-change">
                                <span id="withdrawals-count">0 عملية</span>
                            </div>
                        </div>
                        <div class="card-icon warning">
                            <i class="fas fa-wallet"></i>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-pattern">
                        <i class="fas fa-hand-holding-usd"></i>
                    </div>
                    <div class="card-header">
                        <div>
                            <div class="card-title">المصاريف التشغيلية</div>
                            <div class="card-value" id="operational-expenses">0 دينار</div>
                            <div class="card-change">
                                <span id="operational-count">0 عملية</span>
                            </div>
                        </div>
                        <div class="card-icon info">
                            <i class="fas fa-tools"></i>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-pattern">
                        <i class="fas fa-coins"></i>
                    </div>
                    <div class="card-header">
                        <div>
                            <div class="card-title">دفع الأرباح</div>
                            <div class="card-value" id="profit-payments">0 دينار</div>
                            <div class="card-change">
                                <span id="profit-payments-count">0 عملية</span>
                            </div>
                        </div>
                        <div class="card-icon success">
                            <i class="fas fa-percentage"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">سجل الصادرات</h2>
                <div class="section-actions">
                    <div class="btn-group">
                        <button class="btn btn-outline btn-sm active" data-period="all">الكل</button>
                        <button class="btn btn-outline btn-sm" data-period="today">اليوم</button>
                        <button class="btn btn-outline btn-sm" data-period="week">هذا الأسبوع</button>
                        <button class="btn btn-outline btn-sm" data-period="month">هذا الشهر</button>
                    </div>
                    <button class="btn btn-outline btn-sm" id="add-expense-btn">
                        <i class="fas fa-plus"></i>
                        <span>إضافة مصروف</span>
                    </button>
                </div>
            </div>
            
            <div class="table-container">
                <table id="exports-table">
                    <thead>
                        <tr>
                            <th>التاريخ</th>
                            <th>النوع</th>
                            <th>الوصف</th>
                            <th>المستثمر</th>
                            <th>المبلغ</th>
                            <th>ملاحظات</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="7" class="text-center">جاري تحميل بيانات الصادرات...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="section mt-4">
                <div class="section-header">
                    <h2 class="section-title">إحصائيات الصادرات</h2>
                </div>
                <div class="chart-container">
                    <canvas id="expenses-chart"></canvas>
                </div>
            </div>
        </div>
    `;
    
    // إضافة الصفحة للمحتوى الرئيسي
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.appendChild(pageElement);
        console.log('تم إنشاء صفحة الصادرات بنجاح');
    }
}

// إنشاء صفحة الواردات
function createImportsPage() {
    // التحقق من عدم وجود الصفحة مسبقًا
    if (document.getElementById('imports-page')) {
        return;
    }
    
    // إنشاء عنصر الصفحة
    const pageElement = document.createElement('div');
    pageElement.className = 'page';
    pageElement.id = 'imports-page';
    
    // إنشاء محتوى الصفحة
    pageElement.innerHTML = `
        <div class="header">
            <button class="toggle-sidebar">
                <i class="fas fa-bars"></i>
            </button>
            <h1 class="page-title">الواردات المالية</h1>
            <div class="header-actions">
                <div class="search-box">
                    <input class="search-input" id="imports-search" placeholder="بحث في الواردات..." type="text" />
                    <i class="fas fa-search search-icon"></i>
                </div>
                <button class="btn btn-primary" id="import-data-btn">
                    <i class="fas fa-download"></i>
                    <span>تصدير البيانات</span>
                </button>
            </div>
        </div>
        
        <div class="imports-dashboard">
            <div class="dashboard-cards">
                <div class="card">
                    <div class="card-pattern">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="card-header">
                        <div>
                            <div class="card-title">إجمالي الواردات</div>
                            <div class="card-value" id="total-income">0 دينار</div>
                            <div class="card-change">
                                <span id="income-period">هذا الشهر</span>
                            </div>
                        </div>
                        <div class="card-icon success">
                            <i class="fas fa-money-bill-wave"></i>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-pattern">
                        <i class="fas fa-hand-holding-usd"></i>
                    </div>
                    <div class="card-header">
                        <div>
                            <div class="card-title">إيداعات المستثمرين</div>
                            <div class="card-value" id="deposits-amount">0 دينار</div>
                            <div class="card-change">
                                <span id="deposits-count">0 عملية</span>
                            </div>
                        </div>
                        <div class="card-icon primary">
                            <i class="fas fa-wallet"></i>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-pattern">
                        <i class="fas fa-hand-holding-usd"></i>
                    </div>
                    <div class="card-header">
                        <div>
                            <div class="card-title">تسديد الأقساط</div>
                            <div class="card-value" id="installments-amount">0 دينار</div>
                            <div class="card-change">
                                <span id="installments-count">0 عملية</span>
                            </div>
                        </div>
                        <div class="card-icon info">
                            <i class="fas fa-receipt"></i>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-pattern">
                        <i class="fas fa-coins"></i>
                    </div>
                    <div class="card-header">
                        <div>
                            <div class="card-title">عائدات أخرى</div>
                            <div class="card-value" id="other-income">0 دينار</div>
                            <div class="card-change">
                                <span id="other-income-count">0 عملية</span>
                            </div>
                        </div>
                        <div class="card-icon warning">
                            <i class="fas fa-coins"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">سجل الواردات</h2>
                <div class="section-actions">
                    <div class="btn-group">
                        <button class="btn btn-outline btn-sm active" data-period="all">الكل</button>
                        <button class="btn btn-outline btn-sm" data-period="today">اليوم</button>
                        <button class="btn btn-outline btn-sm" data-period="week">هذا الأسبوع</button>
                        <button class="btn btn-outline btn-sm" data-period="month">هذا الشهر</button>
                    </div>
                    <button class="btn btn-outline btn-sm" id="add-income-btn">
                        <i class="fas fa-plus"></i>
                        <span>إضافة وارد</span>
                    </button>
                </div>
            </div>
            
            <div class="table-container">
                <table id="imports-table">
                    <thead>
                        <tr>
                            <th>التاريخ</th>
                            <th>النوع</th>
                            <th>الوصف</th>
                            <th>المستثمر</th>
                            <th>المبلغ</th>
                            <th>ملاحظات</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="7" class="text-center">جاري تحميل بيانات الواردات...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="section mt-4">
                <div class="section-header">
                    <h2 class="section-title">إحصائيات الواردات</h2>
                </div>
                <div class="chart-container">
                    <canvas id="income-chart"></canvas>
                </div>
            </div>
        </div>
    `;
    
    // إضافة الصفحة للمحتوى الرئيسي
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.appendChild(pageElement);
        console.log('تم إنشاء صفحة الواردات بنجاح');
    }
}

// عرض صفحة مالية محددة (صادرات أو واردات)
function showFinancialPage(pageType) {
    const pageId = `${pageType}-page`;
    const page = document.getElementById(pageId);
    
    if (!page) {
        console.error(`الصفحة ${pageId} غير موجودة!`);
        return;
    }
    
    // إخفاء جميع الصفحات
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    
    // إظهار الصفحة المطلوبة
    page.classList.add('active');
    
    // تحديث القائمة الجانبية
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const navLink = document.querySelector(`.nav-link[data-page="${pageType}"]`);
    if (navLink) {
        navLink.classList.add('active');
    }
    
    // تحديث بيانات الصفحة
    if (pageType === 'exports') {
        renderExportsData();
        if (window.Chart) {
            renderExportsChart();
        }
    } else {
        renderImportsData();
        if (window.Chart) {
            renderImportsChart();
        }
    }
}

// تحميل بيانات الصادرات والواردات
function loadFinancialData() {
    console.log("تحميل بيانات الصادرات والواردات...");
    
    // محاولة تحميل البيانات من التخزين المحلي
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
        showNotification('حدث خطأ أثناء تحميل بيانات الصادرات والواردات', 'error');
    }
    
    // أول مرة نقوم بإنشاء البيانات، نحاول استيراد البيانات من transactions
    if (window.exports.length === 0 && window.imports.length === 0) {
        importFromTransactions();
    }
}

// استيراد البيانات من transactions الموجودة
function importFromTransactions() {
    console.log("استيراد البيانات من سجل العمليات...");
    
    if (!Array.isArray(window.transactions) || window.transactions.length === 0) {
        console.log("لا توجد عمليات لاستيرادها");
        return;
    }
    
    // استيراد العمليات إلى الصادرات والواردات
    window.transactions.forEach(transaction => {
        const financialRecord = {
            id: transaction.id,
            date: transaction.date,
            createdAt: transaction.createdAt,
            type: transaction.type,
            investorId: transaction.investorId,
            investorName: transaction.investorName,
            amount: transaction.amount,
            balanceAfter: transaction.balanceAfter,
            notes: transaction.notes || '',
            description: getDescriptionFromType(transaction.type)
        };
        
        // تصنيف العمليات إلى صادرات وواردات
        if (transaction.type === 'سحب' || transaction.type === 'دفع أرباح' || transaction.type === 'مصروف') {
            window.exports.push(financialRecord);
        } else if (transaction.type === 'إيداع' || transaction.type === 'دفع قسط' || transaction.type === 'وارد') {
            window.imports.push(financialRecord);
        }
    });
    
    // حفظ البيانات المستوردة
    saveFinancialData();
    
    console.log(`تم استيراد ${window.exports.length} صادر و ${window.imports.length} وارد من سجل العمليات`);
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
        default:
            return type;
    }
}

// حفظ بيانات الصادرات والواردات
function saveFinancialData() {
    try {
        localStorage.setItem('exports', JSON.stringify(window.exports));
        localStorage.setItem('imports', JSON.stringify(window.imports));
        console.log('تم حفظ بيانات الصادرات والواردات بنجاح');
        return true;
    } catch (error) {
        console.error('خطأ في حفظ بيانات الصادرات والواردات:', error);
        showNotification('حدث خطأ أثناء حفظ بيانات الصادرات والواردات', 'error');
        return false;
    }
}

// تسجيل مستمعي الأحداث للعمليات المالية
function registerTransactionListeners() {
    // الاستماع إلى حدث إضافة/تعديل/حذف العمليات
    document.addEventListener('transaction:update', function() {
        // تحديث البيانات من transactions الموجودة (للعمليات الجديدة فقط)
        updateFromNewTransactions();
    });
    
    // إضافة مستمعي أحداث للأزرار
    document.addEventListener('DOMContentLoaded', function() {
        // أزرار إضافة المصروفات والواردات
        const addExpenseBtn = document.getElementById('add-expense-btn');
        if (addExpenseBtn) {
            addExpenseBtn.addEventListener('click', function() {
                openAddExpenseModal();
            });
        }
        
        const addIncomeBtn = document.getElementById('add-income-btn');
        if (addIncomeBtn) {
            addIncomeBtn.addEventListener('click', function() {
                openAddIncomeModal();
            });
        }
        
        // أزرار تصدير البيانات
        const exportDataBtn = document.getElementById('export-data-btn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', function() {
                exportFinancialData('exports');
            });
        }
        
        const importDataBtn = document.getElementById('import-data-btn');
        if (importDataBtn) {
            importDataBtn.addEventListener('click', function() {
                exportFinancialData('imports');
            });
        }
        
        // أزرار تصفية البيانات حسب الفترة
        const periodBtns = document.querySelectorAll('.btn-group .btn[data-period]');
        periodBtns.forEach(button => {
            button.addEventListener('click', function() {
                const periodBtns = this.closest('.btn-group').querySelectorAll('.btn');
                periodBtns.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                const period = this.getAttribute('data-period');
                const pageType = this.closest('.page').id.includes('exports') ? 'exports' : 'imports';
                
                if (pageType === 'exports') {
                    renderExportsData(period);
                } else {
                    renderImportsData(period);
                }
            });
        });
        
        // حقول البحث
        const exportsSearch = document.getElementById('exports-search');
        if (exportsSearch) {
            exportsSearch.addEventListener('input', function() {
                searchFinancialData('exports', this.value);
            });
        }
        
        const importsSearch = document.getElementById('imports-search');
        if (importsSearch) {
            importsSearch.addEventListener('input', function() {
                searchFinancialData('imports', this.value);
            });
        }
    });
}

// تحديث البيانات من العمليات الجديدة
function updateFromNewTransactions() {
    console.log("تحديث البيانات من العمليات الجديدة...");
    
    if (!Array.isArray(window.transactions) || window.transactions.length === 0) {
        return;
    }
    
    // الحصول على آخر معرف في الصادرات والواردات
    const lastExportId = window.exports.length > 0 ? 
        window.exports[window.exports.length - 1].id : null;
        
    const lastImportId = window.imports.length > 0 ? 
        window.imports[window.imports.length - 1].id : null;
    
    // البحث عن العمليات الجديدة التي لم تتم إضافتها بعد
    const newTransactions = window.transactions.filter(transaction => {
        // تجاهل العمليات التي تم استيرادها بالفعل
        const inExports = window.exports.some(exp => exp.id === transaction.id);
        const inImports = window.imports.some(imp => imp.id === transaction.id);
        return !inExports && !inImports;
    });
    
    if (newTransactions.length === 0) {
        console.log("لا توجد عمليات جديدة للتحديث");
        return;
    }
    
    // استيراد العمليات الجديدة
    newTransactions.forEach(transaction => {
        const financialRecord = {
            id: transaction.id,
            date: transaction.date,
            createdAt: transaction.createdAt,
            type: transaction.type,
            investorId: transaction.investorId,
            investorName: transaction.investorName || 'غير محدد',
            amount: transaction.amount,
            balanceAfter: transaction.balanceAfter,
            notes: transaction.notes || '',
            description: getDescriptionFromType(transaction.type)
        };
        
        // تصنيف العمليات إلى صادرات وواردات
        if (transaction.type === 'سحب' || transaction.type === 'دفع أرباح' || transaction.type === 'مصروف') {
            window.exports.push(financialRecord);
        } else if (transaction.type === 'إيداع' || transaction.type === 'دفع قسط' || transaction.type === 'وارد') {
            window.imports.push(financialRecord);
        }
    });
    
    // حفظ البيانات المستوردة
    saveFinancialData();
    
    // تحديث واجهة المستخدم إذا كانت الصفحة مفتوحة
    const exportsPage = document.getElementById('exports-page');
    const importsPage = document.getElementById('imports-page');
    
    if (exportsPage && exportsPage.classList.contains('active')) {
        renderExportsData();
    }
    
    if (importsPage && importsPage.classList.contains('active')) {
        renderImportsData();
    }
    
    console.log(`تم تحديث ${newTransactions.length} عملية جديدة`);
}

// استدعاء شاشات الترحيب عند بدء التطبيق
document.addEventListener('DOMContentLoaded', function() {
    // الكود الحالي لتهيئة التطبيق
    
    // عرض شاشات الترحيب مع كل فتح للتطبيق
    if (window.WelcomeScreens && typeof window.WelcomeScreens.show === 'function') {
        window.WelcomeScreens.show();
    }
});