/**
 * نظام البحث الذكي لتطبيق نظام الاستثمار
 * يسمح بالبحث الفوري في جميع أقسام التطبيق
 */

// تهيئة نظام البحث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تهيئة نظام البحث الذكي...');
    
    // إعداد مستمعي البحث في جميع أقسام التطبيق
    setupSearchListeners();
    
    // إنشاء مكون البحث المقترح
    createSearchSuggestionComponent();
});

/**
 * إعداد مستمعي الأحداث لحقول البحث في جميع أقسام التطبيق
 */
function setupSearchListeners() {
    // البحث الرئيسي في لوحة التحكم
    const dashboardSearchInput = document.querySelector('#dashboard-page .search-input');
    if (dashboardSearchInput) {
        dashboardSearchInput.addEventListener('input', function() {
            performSearch(this.value, 'dashboard');
        });
        
        // عند الضغط على زر الإدخال (Enter)
        dashboardSearchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter' || e.keyCode === 13) {
                performSearch(this.value, 'dashboard', true);
            }
        });
        
        // إضافة مستمع لتنظيف حقل البحث
        dashboardSearchInput.addEventListener('search', function() {
            if (!this.value) {
                clearSearch('dashboard');
            }
        });
    }
    
    // البحث في صفحة المستثمرين
    const investorsSearchInput = document.querySelector('#investors-page .search-input');
    if (investorsSearchInput) {
        investorsSearchInput.addEventListener('input', function() {
            performSearch(this.value, 'investors');
        });
        
        investorsSearchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter' || e.keyCode === 13) {
                performSearch(this.value, 'investors', true);
            }
        });
        
        investorsSearchInput.addEventListener('search', function() {
            if (!this.value) {
                clearSearch('investors');
            }
        });
    }
    
    // البحث في صفحة العمليات
    const transactionsSearchInput = document.querySelector('#transactions-page .search-input');
    if (transactionsSearchInput) {
        transactionsSearchInput.addEventListener('input', function() {
            performSearch(this.value, 'transactions');
        });
        
        transactionsSearchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter' || e.keyCode === 13) {
                performSearch(this.value, 'transactions', true);
            }
        });
        
        transactionsSearchInput.addEventListener('search', function() {
            if (!this.value) {
                clearSearch('transactions');
            }
        });
    }
    
    // البحث في صفحة الأرباح
    const profitsSearchInput = document.querySelector('#profits-page .search-input');
    if (profitsSearchInput) {
        profitsSearchInput.addEventListener('input', function() {
            performSearch(this.value, 'profits');
        });
        
        profitsSearchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter' || e.keyCode === 13) {
                performSearch(this.value, 'profits', true);
            }
        });
        
        profitsSearchInput.addEventListener('search', function() {
            if (!this.value) {
                clearSearch('profits');
            }
        });
    }
}

/**
 * إنشاء مكون اقتراحات البحث للواجهة
 */
function createSearchSuggestionComponent() {
    // التحقق من وجود مكون اقتراحات البحث
    if (document.getElementById('search-suggestions')) {
        return;
    }
    
    // إنشاء عنصر اقتراحات البحث
    const searchSuggestions = document.createElement('div');
    searchSuggestions.id = 'search-suggestions';
    searchSuggestions.className = 'search-suggestions';
    
    // إضافة الأنماط المطلوبة
    const searchStyles = document.createElement('style');
    searchStyles.id = 'search-styles';
    searchStyles.textContent = `
        .search-suggestions {
            position: absolute;
            top: 100%;
            right: 0;
            width: 100%;
            max-height: 300px;
            overflow-y: auto;
            background-color: white;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            display: none;
        }
        
        .search-suggestion-item {
            padding: 10px 15px;
            border-bottom: 1px solid #f0f0f0;
            cursor: pointer;
            transition: background-color 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .search-suggestion-item:last-child {
            border-bottom: none;
        }
        
        .search-suggestion-item:hover {
            background-color: #f8f9fa;
        }
        
        .search-suggestion-main {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .suggestion-icon {
            font-size: 16px;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            color: white;
        }
        
        .suggestion-icon.investor {
            background-color: #3b82f6;
        }
        
        .suggestion-icon.transaction {
            background-color: #10b981;
        }
        
        .suggestion-icon.profit {
            background-color: #f59e0b;
        }
        
        .suggestion-content {
            display: flex;
            flex-direction: column;
        }
        
        .suggestion-title {
            font-weight: 600;
            font-size: 14px;
        }
        
        .suggestion-subtitle {
            font-size: 12px;
            color: #6b7280;
        }
        
        .suggestion-highlight {
            color: #3b82f6;
            font-weight: 600;
        }
        
        .suggestion-meta {
            font-size: 13px;
            color: #6b7280;
        }
        
        .search-suggestions.show {
            display: block;
        }
        
        .search-box {
            position: relative;
        }
        
        .no-results {
            padding: 15px;
            text-align: center;
            color: #6b7280;
        }
        
        .search-category-title {
            padding: 8px 15px;
            font-size: 13px;
            font-weight: 600;
            background-color: #f3f4f6;
            color: #4b5563;
        }
    `;
    
    // إضافة العناصر للصفحة
    document.head.appendChild(searchStyles);
    
    // إضافة مكون اقتراحات البحث لكل مربع بحث
    document.querySelectorAll('.search-box').forEach(searchBox => {
        const suggestionClone = searchSuggestions.cloneNode(true);
        searchBox.appendChild(suggestionClone);
    });
}

/**
 * تنفيذ عملية البحث
 * @param {string} query - نص البحث
 * @param {string} section - القسم الذي يتم البحث فيه (dashboard, investors, transactions, profits)
 * @param {boolean} isSubmit - ما إذا كان البحث قد تم تقديمه (بالضغط على Enter)
 */
function performSearch(query, section, isSubmit = false) {
    console.log(`البحث عن: "${query}" في قسم ${section}`);
    
    // تنظيف النص المدخل
    query = query.trim().toLowerCase();
    
    // الحصول على عنصر اقتراحات البحث
    const searchBox = document.querySelector(`#${section}-page .search-box`);
    const suggestionsContainer = searchBox ? searchBox.querySelector('.search-suggestions') : null;
    
    // إذا كان نص البحث فارغاً، قم بإخفاء اقتراحات البحث
    if (!query || !suggestionsContainer) {
        if (suggestionsContainer) {
            suggestionsContainer.classList.remove('show');
        }
        
        // إعادة عرض جميع العناصر إذا كان نص البحث فارغاً
        if (!query) {
            clearSearch(section);
        }
        
        return;
    }
    
    // أنواع البحث حسب القسم
    switch (section) {
        case 'dashboard':
            searchDashboard(query, suggestionsContainer, isSubmit);
            break;
            
        case 'investors':
            searchInvestors(query, suggestionsContainer, isSubmit);
            break;
            
        case 'transactions':
            searchTransactions(query, suggestionsContainer, isSubmit);
            break;
            
        case 'profits':
            searchProfits(query, suggestionsContainer, isSubmit);
            break;
    }
}

/**
 * البحث في لوحة التحكم
 * @param {string} query - نص البحث
 * @param {HTMLElement} suggestionsContainer - حاوية اقتراحات البحث
 * @param {boolean} isSubmit - ما إذا كان البحث قد تم تقديمه
 */
function searchDashboard(query, suggestionsContainer, isSubmit) {
    // البحث في كل من المستثمرين والعمليات
    const investorResults = searchInvestorData(query, 3);
    const transactionResults = searchTransactionData(query, 3);
    
    // إذا كان البحث مقدماً، قم بعرض النتائج الكاملة
    if (isSubmit && (investorResults.length > 0 || transactionResults.length > 0)) {
        // إذا كانت نتائج المستثمرين أكثر، انتقل إلى صفحة المستثمرين
        if (investorResults.length > transactionResults.length) {
            // انتقل إلى صفحة المستثمرين وامرر نص البحث
            const investorsLink = document.querySelector('[data-page="investors"]');
            if (investorsLink) {
                investorsLink.click();
                
                // تأخير قصير لضمان تحميل الصفحة
                setTimeout(() => {
                    const investorsSearchInput = document.querySelector('#investors-page .search-input');
                    if (investorsSearchInput) {
                        investorsSearchInput.value = query;
                        performSearch(query, 'investors', true);
                    }
                }, 300);
            }
        } else {
            // انتقل إلى صفحة العمليات وامرر نص البحث
            const transactionsLink = document.querySelector('[data-page="transactions"]');
            if (transactionsLink) {
                transactionsLink.click();
                
                // تأخير قصير لضمان تحميل الصفحة
                setTimeout(() => {
                    const transactionsSearchInput = document.querySelector('#transactions-page .search-input');
                    if (transactionsSearchInput) {
                        transactionsSearchInput.value = query;
                        performSearch(query, 'transactions', true);
                    }
                }, 300);
            }
        }
        
        // إخفاء اقتراحات البحث بعد التقديم
        suggestionsContainer.classList.remove('show');
        return;
    }
    
    // عرض نتائج البحث في قائمة الاقتراحات
    renderSearchSuggestions(suggestionsContainer, investorResults, transactionResults);
}

/**
 * البحث في المستثمرين
 * @param {string} query - نص البحث
 * @param {HTMLElement} suggestionsContainer - حاوية اقتراحات البحث
 * @param {boolean} isSubmit - ما إذا كان البحث قد تم تقديمه
 */
function searchInvestors(query, suggestionsContainer, isSubmit) {
    // البحث في بيانات المستثمرين
    const results = searchInvestorData(query);
    
    // إذا كان البحث مقدماً، قم بتصفية جدول المستثمرين
    if (isSubmit) {
        filterInvestorsTable(query);
        suggestionsContainer.classList.remove('show');
        return;
    }
    
    // عرض نتائج البحث في قائمة الاقتراحات
    renderSearchSuggestions(suggestionsContainer, results, []);
}

/**
 * البحث في العمليات
 * @param {string} query - نص البحث
 * @param {HTMLElement} suggestionsContainer - حاوية اقتراحات البحث
 * @param {boolean} isSubmit - ما إذا كان البحث قد تم تقديمه
 */
function searchTransactions(query, suggestionsContainer, isSubmit) {
    // البحث في بيانات العمليات
    const results = searchTransactionData(query);
    
    // إذا كان البحث مقدماً، قم بتصفية جدول العمليات
    if (isSubmit) {
        filterTransactionsTable(query);
        suggestionsContainer.classList.remove('show');
        return;
    }
    
    // عرض نتائج البحث في قائمة الاقتراحات
    renderSearchSuggestions(suggestionsContainer, [], results);
}

/**
 * البحث في الأرباح
 * @param {string} query - نص البحث
 * @param {HTMLElement} suggestionsContainer - حاوية اقتراحات البحث
 * @param {boolean} isSubmit - ما إذا كان البحث قد تم تقديمه
 */
function searchProfits(query, suggestionsContainer, isSubmit) {
    // البحث أولاً في المستثمرين لأن الأرباح مرتبطة بهم
    const investorResults = searchInvestorData(query);
    
    // إذا كان البحث مقدماً، قم بتصفية جدول الأرباح
    if (isSubmit) {
        filterProfitsTable(query);
        suggestionsContainer.classList.remove('show');
        return;
    }
    
    // عرض نتائج البحث في قائمة الاقتراحات
    renderSearchSuggestions(suggestionsContainer, investorResults, []);
}

/**
 * البحث في بيانات المستثمرين
 * @param {string} query - نص البحث
 * @param {number} limit - الحد الأقصى لعدد النتائج
 * @returns {Array} - نتائج البحث
 */
function searchInvestorData(query, limit = 10) {
    // التأكد من تحميل متغير المستثمرين
    if (!window.investors || !Array.isArray(window.investors)) {
        return [];
    }
    
    // البحث في بيانات المستثمرين
    let results = window.investors.filter(investor => {
        // البحث في الاسم
        if (investor.name && investor.name.toLowerCase().includes(query)) {
            return true;
        }
        
        // البحث في رقم الهاتف
        if (investor.phone && investor.phone.includes(query)) {
            return true;
        }
        
        // البحث في العنوان
        if (investor.address && investor.address.toLowerCase().includes(query)) {
            return true;
        }
        
        // البحث في المبلغ
        if (investor.amount && investor.amount.toString().includes(query)) {
            return true;
        }
        
        return false;
    });
    
    // تطبيق الحد الأقصى لعدد النتائج
    if (limit > 0 && results.length > limit) {
        results = results.slice(0, limit);
    }
    
    return results.map(investor => ({
        type: 'investor',
        id: investor.id,
        name: investor.name,
        phone: investor.phone,
        amount: investor.amount,
        data: investor
    }));
}

/**
 * البحث في بيانات العمليات
 * @param {string} query - نص البحث
 * @param {number} limit - الحد الأقصى لعدد النتائج
 * @returns {Array} - نتائج البحث
 */
function searchTransactionData(query, limit = 10) {
    // التأكد من تحميل متغير العمليات
    if (!window.transactions || !Array.isArray(window.transactions)) {
        return [];
    }
    
    // البحث في بيانات العمليات
    let results = window.transactions.filter(transaction => {
        // البحث في اسم المستثمر
        if (transaction.investorName && transaction.investorName.toLowerCase().includes(query)) {
            return true;
        }
        
        // البحث في نوع العملية
        if (transaction.type && transaction.type.toLowerCase().includes(query)) {
            return true;
        }
        
        // البحث في المبلغ
        if (transaction.amount && transaction.amount.toString().includes(query)) {
            return true;
        }
        
        // البحث في التاريخ
        if (transaction.date && transaction.date.includes(query)) {
            return true;
        }
        
        // البحث في الملاحظات
        if (transaction.notes && transaction.notes.toLowerCase().includes(query)) {
            return true;
        }
        
        return false;
    });
    
    // ترتيب النتائج حسب التاريخ (الأحدث أولاً)
    results.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    // تطبيق الحد الأقصى لعدد النتائج
    if (limit > 0 && results.length > limit) {
        results = results.slice(0, limit);
    }
    
    return results.map(transaction => ({
        type: 'transaction',
        id: transaction.id,
        investorName: transaction.investorName,
        transactionType: transaction.type,
        amount: transaction.amount,
        date: transaction.date,
        data: transaction
    }));
}

/**
 * عرض نتائج البحث في حاوية الاقتراحات
 * @param {HTMLElement} container - حاوية اقتراحات البحث
 * @param {Array} investorResults - نتائج البحث في المستثمرين
 * @param {Array} transactionResults - نتائج البحث في العمليات
 */
function renderSearchSuggestions(container, investorResults, transactionResults) {
    // التحقق من وجود نتائج للبحث
    if (investorResults.length === 0 && transactionResults.length === 0) {
        // إخفاء حاوية الاقتراحات إذا لم تكن هناك نتائج
        container.classList.remove('show');
        return;
    }
    
    // تفريغ حاوية الاقتراحات
    container.innerHTML = '';
    
    // إضافة نتائج المستثمرين
    if (investorResults.length > 0) {
        // إضافة عنوان قسم المستثمرين
        const investorsTitle = document.createElement('div');
        investorsTitle.className = 'search-category-title';
        investorsTitle.textContent = 'المستثمرين';
        container.appendChild(investorsTitle);
        
        // إضافة نتائج المستثمرين
        investorResults.forEach(result => {
            const item = createSuggestionItem(result, 'investor');
            container.appendChild(item);
        });
    }
    
    // إضافة نتائج العمليات
    if (transactionResults.length > 0) {
        // إضافة عنوان قسم العمليات
        const transactionsTitle = document.createElement('div');
        transactionsTitle.className = 'search-category-title';
        transactionsTitle.textContent = 'العمليات';
        container.appendChild(transactionsTitle);
        
        // إضافة نتائج العمليات
        transactionResults.forEach(result => {
            const item = createSuggestionItem(result, 'transaction');
            container.appendChild(item);
        });
    }
    
    // إظهار حاوية الاقتراحات
    container.classList.add('show');
}

/**
 * إنشاء عنصر اقتراح البحث
 * @param {Object} result - نتيجة البحث
 * @param {string} itemType - نوع العنصر (investor, transaction)
 * @returns {HTMLElement} - عنصر اقتراح البحث
 */
function createSuggestionItem(result, itemType) {
    const item = document.createElement('div');
    item.className = 'search-suggestion-item';
    
    // تخزين بيانات النتيجة في العنصر
    item.dataset.id = result.id;
    item.dataset.type = itemType;
    
    // المحتوى الرئيسي
    const mainContent = document.createElement('div');
    mainContent.className = 'search-suggestion-main';
    
    // الأيقونة
    const icon = document.createElement('div');
    icon.className = `suggestion-icon ${itemType}`;
    
    // تحديد الأيقونة حسب النوع
    switch (itemType) {
        case 'investor':
            icon.innerHTML = '<i class="fas fa-user"></i>';
            break;
        case 'transaction':
            // تحديد أيقونة العملية حسب نوعها
            switch (result.transactionType) {
                case 'إيداع':
                    icon.innerHTML = '<i class="fas fa-arrow-up"></i>';
                    break;
                case 'سحب':
                    icon.innerHTML = '<i class="fas fa-arrow-down"></i>';
                    break;
                case 'دفع أرباح':
                    icon.innerHTML = '<i class="fas fa-coins"></i>';
                    break;
                default:
                    icon.innerHTML = '<i class="fas fa-exchange-alt"></i>';
            }
            break;
    }
    
    // المحتوى النصي
    const content = document.createElement('div');
    content.className = 'suggestion-content';
    
    // العنوان والعنوان الفرعي
    const title = document.createElement('div');
    title.className = 'suggestion-title';
    
    const subtitle = document.createElement('div');
    subtitle.className = 'suggestion-subtitle';
    
    // تعيين المحتوى حسب النوع
    if (itemType === 'investor') {
        title.textContent = result.name;
        subtitle.textContent = `هاتف: ${result.phone || '-'}`;
    } else if (itemType === 'transaction') {
        title.textContent = result.investorName;
        subtitle.textContent = `${result.transactionType} - ${result.date}`;
    }
    
    content.appendChild(title);
    content.appendChild(subtitle);
    
    // إضافة المحتوى الرئيسي
    mainContent.appendChild(icon);
    mainContent.appendChild(content);
    
    // البيانات الإضافية (المبلغ)
    const meta = document.createElement('div');
    meta.className = 'suggestion-meta';
    meta.textContent = formatCurrency(result.amount, false) + ' ' + (window.settings?.currency || 'دينار');
    
    // تجميع العناصر
    item.appendChild(mainContent);
    item.appendChild(meta);
    
    // إضافة مستمع النقر
    item.addEventListener('click', function() {
        handleSuggestionClick(result, itemType);
    });
    
    return item;
}

/**
 * معالجة النقر على اقتراح البحث
 * @param {Object} result - نتيجة البحث
 * @param {string} itemType - نوع العنصر (investor, transaction)
 */
function handleSuggestionClick(result, itemType) {
    console.log(`تم النقر على اقتراح البحث: ${itemType} - ${result.id}`);
    
    // إخفاء قائمة الاقتراحات
    document.querySelectorAll('.search-suggestions').forEach(container => {
        container.classList.remove('show');
    });
    
    // معالجة النقر حسب نوع العنصر
    if (itemType === 'investor') {
        // عرض تفاصيل المستثمر
        if (window.showInvestorDetails) {
            window.showInvestorDetails(result.id);
        }
    } else if (itemType === 'transaction') {
        // عرض تفاصيل العملية
        if (window.showTransactionDetails) {
            window.showTransactionDetails(result.id);
        }
    }
}

/**
 * تصفية جدول المستثمرين وفقاً لنص البحث
 * @param {string} query - نص البحث
 */
function filterInvestorsTable(query) {
    // يتم تنفيذ البحث من خلال استدعاء دالة البحث الموجودة
    if (window.searchInvestors) {
        window.searchInvestors(query);
    } else {
        console.error('دالة البحث في المستثمرين غير موجودة');
        
        // تنفيذ البحث بشكل مبسط
        const rows = document.querySelectorAll('#investors-table tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
        });
    }
}

/**
 * تصفية جدول العمليات وفقاً لنص البحث
 * @param {string} query - نص البحث
 */
function filterTransactionsTable(query) {
    // يتم تنفيذ البحث من خلال استدعاء دالة البحث الموجودة
    if (window.searchTransactions) {
        window.searchTransactions(query);
    } else {
        console.error('دالة البحث في العمليات غير موجودة');
        
        // تنفيذ البحث بشكل مبسط
        const rows = document.querySelectorAll('#transactions-table tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
        });
    }
}

/**
 * تصفية جدول الأرباح وفقاً لنص البحث
 * @param {string} query - نص البحث
 */
function filterProfitsTable(query) {
    // يتم تنفيذ البحث من خلال استدعاء دالة البحث الموجودة
    if (window.searchProfits) {
        window.searchProfits(query);
    } else {
        console.error('دالة البحث في الأرباح غير موجودة');
        
        // تنفيذ البحث بشكل مبسط
        const rows = document.querySelectorAll('#profits-table tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
        });
    }
}

/**
 * تنظيف البحث وإعادة عرض جميع العناصر
 * @param {string} section - القسم (dashboard, investors, transactions, profits)
 */
function clearSearch(section) {
    console.log(`تنظيف البحث في قسم ${section}`);
    
    switch(section) {
        case 'dashboard':
            // إعادة عرض أحدث العمليات
            if (window.renderRecentTransactions) {
                window.renderRecentTransactions();
            }
            break;
            
        case 'investors':
            // إعادة عرض جميع المستثمرين
            if (window.renderInvestorsTable) {
                window.renderInvestorsTable();
            } else {
                // إظهار جميع الصفوف في الجدول
                const rows = document.querySelectorAll('#investors-table tbody tr');
                rows.forEach(row => {
                    row.style.display = '';
                });
            }
            break;
            
        case 'transactions':
            // إعادة عرض جميع العمليات
            if (window.renderTransactionsTable) {
                window.renderTransactionsTable();
            } else {
                // إظهار جميع الصفوف في الجدول
                const rows = document.querySelectorAll('#transactions-table tbody tr');
                rows.forEach(row => {
                    row.style.display = '';
                });
            }
            break;
            
        case 'profits':
            // إعادة عرض جميع الأرباح
            if (window.renderProfitsTable) {
                window.renderProfitsTable();
            } else {
                // إظهار جميع الصفوف في الجدول
                const rows = document.querySelectorAll('#profits-table tbody tr');
                rows.forEach(row => {
                    row.style.display = '';
                });
            }
            break;
    }
}

/**
 * تنسيق المبلغ بتنسيق العملة
 * @param {number} amount - المبلغ
 * @param {boolean} addCurrency - إضافة رمز العملة
 * @returns {string} - المبلغ المنسق
 */
function formatCurrency(amount, addCurrency = true) {
    // استخدام دالة تنسيق العملة الموجودة في النظام إذا كانت متاحة
    if (window.formatCurrency) {
        return window.formatCurrency(amount, addCurrency);
    }

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

/**
 * تحسين خبرة المستخدم لحقول البحث في النظام
 */
function enhanceSearchExperience() {
    // إضافة زر مسح للبحث
    document.querySelectorAll('.search-box').forEach(box => {
        const searchInput = box.querySelector('.search-input');
        if (!searchInput) return;
        
        // إضافة زر المسح
        const clearButton = document.createElement('button');
        clearButton.className = 'search-clear-btn';
        clearButton.type = 'button';
        clearButton.innerHTML = '<i class="fas fa-times"></i>';
        clearButton.style.position = 'absolute';
        clearButton.style.left = '30px';
        clearButton.style.top = '50%';
        clearButton.style.transform = 'translateY(-50%)';
        clearButton.style.background = 'none';
        clearButton.style.border = 'none';
        clearButton.style.cursor = 'pointer';
        clearButton.style.color = '#9ca3af';
        clearButton.style.display = 'none';
        clearButton.title = 'مسح البحث';
        
        // إضافة الزر إلى حقل البحث
        box.style.position = 'relative';
        box.appendChild(clearButton);
        
        // إظهار/إخفاء زر المسح عند كتابة/مسح البحث
        searchInput.addEventListener('input', function() {
            clearButton.style.display = this.value ? 'block' : 'none';
        });
        
        // معالجة النقر على زر المسح
        clearButton.addEventListener('click', function() {
            searchInput.value = '';
            searchInput.focus();
            this.style.display = 'none';
            
            // إطلاق حدث input لتحديث نتائج البحث
            const inputEvent = new Event('input', { bubbles: true });
            searchInput.dispatchEvent(inputEvent);
            
            // إطلاق حدث search لتنظيف البحث
            const searchEvent = new Event('search', { bubbles: true });
            searchInput.dispatchEvent(searchEvent);
        });
    });
    
    // تحسين تجربة المستخدم عند النقر على حقل البحث
    document.querySelectorAll('.search-input').forEach(input => {
        // عند التركيز على حقل البحث
        input.addEventListener('focus', function() {
            // إظهار اقتراحات البحث السابقة إذا كان هناك قيمة
            if (this.value) {
                const parentBox = this.closest('.search-box');
                const suggestionsContainer = parentBox ? parentBox.querySelector('.search-suggestions') : null;
                
                if (suggestionsContainer) {
                    // تحديد القسم الحالي
                    const page = this.closest('.page');
                    let section = page ? page.id.replace('-page', '') : 'dashboard';
                    
                    // إعادة تنفيذ البحث لإظهار الاقتراحات
                    performSearch(this.value, section);
                }
            }
        });
        
        // إغلاق اقتراحات البحث عند الضغط خارج حقل البحث
        document.addEventListener('click', function(event) {
            // التحقق مما إذا كان النقر خارج حقل البحث واقتراحات البحث
            if (!event.target.closest('.search-box')) {
                document.querySelectorAll('.search-suggestions').forEach(container => {
                    container.classList.remove('show');
                });
            }
        });
    });
}

/**
 * تعزيز تسليط الضوء على نص البحث في النتائج
 * @param {string} text - النص الأصلي
 * @param {string} query - نص البحث
 * @returns {string} - النص مع تسليط الضوء على نص البحث
 */
function highlightText(text, query) {
    if (!text || !query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="suggestion-highlight">$1</span>');
}

/**
 * حدث يتم إطلاقه عند تحميل البيانات للتأكد من جاهزية نظام البحث
 */
document.addEventListener('data:loaded', function() {
    console.log('تم تحميل البيانات، جاهز للبحث');
    
    // تنفيذ البحث الأولي إذا كان هناك نص في حقل البحث
    document.querySelectorAll('.search-input').forEach(input => {
        if (input.value) {
            const page = input.closest('.page');
            if (page && page.classList.contains('active')) {
                const section = page.id.replace('-page', '');
                performSearch(input.value, section);
            }
        }
    });
});

// تهيئة تحسينات البحث بعد تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة نظام البحث
    setupSearchListeners();
    createSearchSuggestionComponent();
    enhanceSearchExperience();
    
    // إطلاق حدث تحميل البيانات بعد تحميل التطبيق
    setTimeout(function() {
        const event = new Event('data:loaded');
        document.dispatchEvent(event);
    }, 1000);
});

// إضافة مثال لنظام البحث إلى النافذة العالمية
window.SearchSystem = {
    search: performSearch,
    clearSearch: clearSearch,
    searchInvestorData: searchInvestorData,
    searchTransactionData: searchTransactionData
};








/**
 * تكملة كود دمج وتفعيل نظام البحث الذكي
 */

// البحث في جدول آخر العمليات في لوحة التحكم (تتمة)
function fallbackSearchRecentTransactions(query) {
    // ... (الكود السابق)
    
    // عرض رسالة إذا لم يتم العثور على نتائج
    if (!found) {
        // اختياري: إضافة صف لإظهار عدم وجود نتائج
        const tbody = document.querySelector('#recent-transactions tbody');
        
        if (tbody) {
            // التحقق من وجود رسالة لا توجد نتائج
            if (!document.getElementById('no-results-row-recent')) {
                const noResultsRow = document.createElement('tr');
                noResultsRow.id = 'no-results-row-recent';
                noResultsRow.innerHTML = `<td colspan="7" class="text-center">لم يتم العثور على نتائج للبحث: "${query}"</td>`;
                tbody.appendChild(noResultsRow);
            } else {
                document.getElementById('no-results-row-recent').style.display = '';
            }
        }
    } else {
        // إخفاء رسالة عدم وجود نتائج إذا كانت موجودة
        const noResultsRow = document.getElementById('no-results-row-recent');
        if (noResultsRow) {
            noResultsRow.style.display = 'none';
        }
    }
}

/**
 * إعداد مستمعي أحداث لأزرار البحث
 */
function setupSearchButtonListeners() {
    console.log('إعداد مستمعي أحداث لأزرار البحث');
    
    // إضافة مستمعي أحداث لأيقونات البحث
    document.querySelectorAll('.search-icon').forEach(icon => {
        icon.addEventListener('click', function() {
            const searchBox = this.closest('.search-box');
            if (!searchBox) return;
            
            const searchInput = searchBox.querySelector('.search-input');
            if (!searchInput || !searchInput.value) return;
            
            // تحديد القسم النشط
            const activePage = document.querySelector('.page.active');
            if (!activePage) return;
            
            const section = activePage.id.replace('-page', '');
            
            // تنفيذ البحث
            if (window.SearchSystem && window.SearchSystem.search) {
                window.SearchSystem.search(searchInput.value, section, true);
            } else {
                // استخدام دوال البحث الموجودة
                switch (section) {
                    case 'investors':
                        if (window.searchInvestors) {
                            window.searchInvestors(searchInput.value);
                        }
                        break;
                        
                    case 'transactions':
                        if (window.searchTransactions) {
                            window.searchTransactions(searchInput.value);
                        }
                        break;
                        
                    case 'profits':
                        if (window.searchProfits) {
                            window.searchProfits(searchInput.value);
                        }
                        break;
                        
                    case 'dashboard':
                        fallbackSearchRecentTransactions(searchInput.value);
                        break;
                }
            }
        });
    });
    
    // إضافة تفاعلية معززة لحقول البحث
    document.querySelectorAll('.search-input').forEach(input => {
        // تحسين تجربة المستخدم باستخدام أحداث التركيز
        input.addEventListener('focus', function() {
            this.closest('.search-box')?.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.closest('.search-box')?.classList.remove('focused');
        });
        
        // تنفيذ البحث عند الضغط على Enter
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.keyCode === 13) {
                e.preventDefault();
                
                // تحديد القسم النشط
                const activePage = document.querySelector('.page.active');
                if (!activePage) return;
                
                const section = activePage.id.replace('-page', '');
                
                // تنفيذ البحث
                if (window.SearchSystem && window.SearchSystem.search) {
                    window.SearchSystem.search(this.value, section, true);
                } else {
                    // استخدام دوال البحث الموجودة
                    switch (section) {
                        case 'investors':
                            if (window.searchInvestors) {
                                window.searchInvestors(this.value);
                            }
                            break;
                            
                        case 'transactions':
                            if (window.searchTransactions) {
                                window.searchTransactions(this.value);
                            }
                            break;
                            
                        case 'profits':
                            if (window.searchProfits) {
                                window.searchProfits(this.value);
                            }
                            break;
                            
                        case 'dashboard':
                            fallbackSearchRecentTransactions(this.value);
                            break;
                    }
                }
            }
        });
    });
}

/**
 * إعداد مستمع لتغيير الصفحة لتفعيل البحث في الصفحة الجديدة
 */
function setupPageChangeListener() {
    console.log('إعداد مستمع لتغيير الصفحة');
    
    // الاستماع لتغيير الصفحة عن طريق النقر على روابط التنقل
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            const pageId = this.getAttribute('data-page');
            if (!pageId) return;
            
            // إعطاء وقت للصفحة للعرض
            setTimeout(() => {
                // التحقق من وجود البحث في الصفحة الجديدة
                const searchInput = document.querySelector(`#${pageId}-page .search-input`);
                if (searchInput && searchInput.value) {
                    // تنفيذ البحث في الصفحة الجديدة
                    if (window.SearchSystem && window.SearchSystem.search) {
                        window.SearchSystem.search(searchInput.value, pageId, true);
                    } else {
                        // استخدام دوال البحث الموجودة
                        switch (pageId) {
                            case 'investors':
                                if (window.searchInvestors) {
                                    window.searchInvestors(searchInput.value);
                                }
                                break;
                                
                            case 'transactions':
                                if (window.searchTransactions) {
                                    window.searchTransactions(searchInput.value);
                                }
                                break;
                                
                            case 'profits':
                                if (window.searchProfits) {
                                    window.searchProfits(searchInput.value);
                                }
                                break;
                                
                            case 'dashboard':
                                fallbackSearchRecentTransactions(searchInput.value);
                                break;
                        }
                    }
                }
            }, 300);
        });
    });
    
    // إنشاء حدث مخصص لتغيير الصفحة إذا لم يكن موجودًا
    if (!window.hasOwnProperty('pageChange')) {
        window.pageChange = new Event('page:change');
        
        // إضافة معلومات الصفحة النشطة للحدث
        Object.defineProperty(window.pageChange, 'detail', {
            writable: true,
            value: { page: '' }
        });
    }
    
    // الاستماع لحدث تغيير الصفحة
    document.addEventListener('page:change', function(e) {
        if (!e.detail || !e.detail.page) return;
        
        // الحصول على معلومات الصفحة الجديدة
        const pageId = e.detail.page;
        
        // إعطاء وقت للصفحة للعرض
        setTimeout(() => {
            // التحقق من وجود البحث في الصفحة الجديدة
            const searchInput = document.querySelector(`#${pageId}-page .search-input`);
            if (searchInput && searchInput.value) {
                // تنفيذ البحث في الصفحة الجديدة
                if (window.SearchSystem && window.SearchSystem.search) {
                    window.SearchSystem.search(searchInput.value, pageId, true);
                }
            }
        }, 300);
    });
}

/**
 * تحسين وتعزيز مظهر عناصر البحث في الواجهة
 */
function enhanceSearchUI() {
    console.log('تحسين مظهر عناصر البحث');
    
    // التحقق من وجود أنماط CSS للبحث
    if (!document.getElementById('enhanced-search-styles')) {
        // إنشاء عنصر أنماط جديد
        const styles = document.createElement('style');
        styles.id = 'enhanced-search-styles';
        
        // إضافة أنماط CSS لتحسين مظهر البحث
        styles.textContent = `
            /* تحسين مظهر حقل البحث */
            .search-box {
                position: relative;
                transition: all 0.3s ease;
            }
            
            .search-box.focused {
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
            }
            
            .search-input {
                padding-left: 30px;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
                transition: all 0.3s ease;
            }
            
            .search-input:focus {
                border-color: #3b82f6;
                box-shadow: none;
                outline: none;
            }
            
            .search-icon {
                position: absolute;
                left: 10px;
                top: 50%;
                transform: translateY(-50%);
                color: #9ca3af;
                cursor: pointer;
                transition: color 0.3s ease;
            }
            
            .search-icon:hover {
                color: #3b82f6;
            }
            
            /* تنسيق للنتائج المظللة */
            .highlight-search {
                background-color: rgba(59, 130, 246, 0.2);
                border-radius: 2px;
                padding: 0 2px;
                font-weight: bold;
                color: #2563eb;
            }
            
            /* تحسين مظهر زر مسح البحث */
            .search-clear-btn {
                position: absolute;
                left: 35px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: #9ca3af;
                cursor: pointer;
                opacity: 0;
                transition: opacity 0.2s ease, color 0.2s ease;
                font-size: 12px;
                width: 16px;
                height: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
            }
            
            .search-clear-btn:hover {
                color: #ef4444;
                background-color: rgba(239, 68, 68, 0.1);
            }
            
            .search-input:not(:placeholder-shown) ~ .search-clear-btn {
                opacity: 1;
            }
            
            /* أنماط لمؤشر النتائج */
            .search-results-indicator {
                position: absolute;
                top: calc(100% + 5px);
                right: 0;
                background-color: #f3f4f6;
                border-radius: 4px;
                padding: 4px 8px;
                font-size: 12px;
                color: #6b7280;
                z-index: 10;
                display: none;
            }
            
            .search-results-indicator.show {
                display: block;
            }
        `;
        
        // إضافة الأنماط إلى رأس الصفحة
        document.head.appendChild(styles);
    }
    
    // إضافة زر مسح لكل حقل بحث
    document.querySelectorAll('.search-box').forEach(box => {
        // التحقق من وجود زر المسح
        if (box.querySelector('.search-clear-btn')) return;
        
        // الحصول على حقل البحث
        const input = box.querySelector('.search-input');
        if (!input) return;
        
        // إنشاء زر المسح
        const clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.className = 'search-clear-btn';
        clearBtn.innerHTML = '<i class="fas fa-times"></i>';
        clearBtn.title = 'مسح البحث';
        
        // إضافة زر المسح إلى حقل البحث
        box.appendChild(clearBtn);
        
        // مستمع نقر لزر المسح
        clearBtn.addEventListener('click', function() {
            input.value = '';
            input.focus();
            
            // الحصول على القسم النشط
            const activePage = document.querySelector('.page.active');
            if (!activePage) return;
            
            const section = activePage.id.replace('-page', '');
            
            // تنظيف البحث
            if (window.SearchSystem && window.SearchSystem.clearSearch) {
                window.SearchSystem.clearSearch(section);
            } else {
                // إعادة عرض جميع الصفوف
                switch (section) {
                    case 'investors':
                        if (window.renderInvestorsTable) {
                            window.renderInvestorsTable();
                        }
                        break;
                        
                    case 'transactions':
                        if (window.renderTransactionsTable) {
                            window.renderTransactionsTable();
                        }
                        break;
                        
                    case 'profits':
                        if (window.renderProfitsTable) {
                            window.renderProfitsTable();
                        }
                        break;
                        
                    case 'dashboard':
                        if (window.renderRecentTransactions) {
                            window.renderRecentTransactions();
                        }
                        break;
                }
            }
        });
    });
    
    // إضافة مؤشر لنتائج البحث
    document.querySelectorAll('.search-box').forEach(box => {
        // التحقق من وجود مؤشر النتائج
        if (box.querySelector('.search-results-indicator')) return;
        
        // إنشاء مؤشر النتائج
        const indicator = document.createElement('div');
        indicator.className = 'search-results-indicator';
        
        // إضافة مؤشر النتائج إلى حقل البحث
        box.appendChild(indicator);
    });
}

/**
 * أضف تظليل لنتائج البحث في الجداول
 * @param {string} query - نص البحث
 * @param {string} tableSelector - محدد الجدول
 */
function highlightSearchResults(query, tableSelector) {
    if (!query) return;
    
    query = query.trim().toLowerCase();
    if (!query) return;
    
    // الحصول على الجدول
    const table = document.querySelector(tableSelector);
    if (!table) return;
    
    // الحصول على صفوف الجدول
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        // تخطي الصفوف المخفية
        if (row.style.display === 'none') return;
        
        // البحث عن نص البحث في محتوى الصف
        const cells = row.querySelectorAll('td');
        cells.forEach(cell => {
            const originalText = cell.textContent;
            const lowerText = originalText.toLowerCase();
            
            // إذا وجدنا نص البحث في الخلية
            if (lowerText.includes(query)) {
                // إنشاء نسخة من المحتوى الأصلي مع تظليل نص البحث
                const highlighted = originalText.replace(
                    new RegExp(`(${query})`, 'gi'),
                    '<span class="highlight-search">$1</span>'
                );
                
                // إضافة العلامة data-original للاحتفاظ بالنص الأصلي
                if (!cell.hasAttribute('data-original')) {
                    cell.setAttribute('data-original', originalText);
                }
                
                // تحديث محتوى الخلية
                cell.innerHTML = highlighted;
            }
        });
    });
}

/**
 * إزالة التظليل من نتائج البحث
 * @param {string} tableSelector - محدد الجدول
 */
function removeHighlighting(tableSelector) {
    // الحصول على الجدول
    const table = document.querySelector(tableSelector);
    if (!table) return;
    
    // الحصول على الخلايا المظللة
    const cells = table.querySelectorAll('td[data-original]');
    cells.forEach(cell => {
        // استعادة النص الأصلي
        cell.textContent = cell.getAttribute('data-original');
        
        // إزالة السمة
        cell.removeAttribute('data-original');
    });
}

/**
 * تحسين دمج نظام البحث مع بقية مكونات النظام
 */
function improveSearchSystemIntegration() {
    console.log('تحسين دمج نظام البحث');
    
    // الاستماع لحدث تحديث البيانات
    document.addEventListener('data:updated', function() {
        console.log('تم تحديث البيانات - تحديث نتائج البحث');
        
        // الحصول على الصفحة النشطة
        const activePage = document.querySelector('.page.active');
        if (!activePage) return;
        
        const section = activePage.id.replace('-page', '');
        
        // الحصول على نص البحث الحالي
        const searchInput = document.querySelector(`#${section}-page .search-input`);
        if (!searchInput || !searchInput.value) return;
        
        // إعادة تنفيذ البحث لتحديث النتائج
        if (window.SearchSystem && window.SearchSystem.search) {
            window.SearchSystem.search(searchInput.value, section, true);
        }
    });
    
    // إضافة دعم لتاريخ البحث
    setupSearchHistory();
}

/**
 * إعداد تاريخ البحث للمستخدم
 */
function setupSearchHistory() {
    console.log('إعداد تاريخ البحث');
    
    // التحقق من وجود كائن تاريخ البحث
    if (!window.searchHistory) {
        window.searchHistory = {
            items: [],
            maxItems: 10,
            
            // إضافة عبارة بحث جديدة
            add: function(query, section) {
                if (!query) return;
                
                // تنظيف العبارة
                query = query.trim();
                if (!query) return;
                
                // التحقق من وجود العبارة
                const index = this.items.findIndex(item => item.query === query && item.section === section);
                
                if (index !== -1) {
                    // إزالة العبارة الموجودة
                    this.items.splice(index, 1);
                }
                
                // إضافة العبارة في المقدمة
                this.items.unshift({
                    query,
                    section,
                    timestamp: new Date().toISOString()
                });
                
                // التأكد من عدم تجاوز الحد الأقصى
                if (this.items.length > this.maxItems) {
                    this.items.pop();
                }
                
                // حفظ التاريخ
                this.save();
            },
            
            // الحصول على عبارات البحث السابقة
            get: function(section) {
                if (!section) {
                    return this.items;
                }
                
                // تصفية العبارات حسب القسم
                return this.items.filter(item => item.section === section);
            },
            
            // حفظ التاريخ في التخزين المحلي
            save: function() {
                try {
                    localStorage.setItem('searchHistory', JSON.stringify(this.items));
                } catch (error) {
                    console.error('فشل حفظ تاريخ البحث', error);
                }
            },
            
            // تحميل التاريخ من التخزين المحلي
            load: function() {
                try {
                    const saved = localStorage.getItem('searchHistory');
                    if (saved) {
                        this.items = JSON.parse(saved);
                    }
                } catch (error) {
                    console.error('فشل تحميل تاريخ البحث', error);
                    this.items = [];
                }
            },
            
            // مسح التاريخ
            clear: function() {
                this.items = [];
                this.save();
            }
        };
        
        // تحميل التاريخ المحفوظ
        window.searchHistory.load();
    }
    
    // استمع لأحداث البحث لتحديث التاريخ
    document.querySelectorAll('.search-input').forEach(input => {
        input.addEventListener('search', function(e) {
            if (!this.value) return;
            
            // تحديد القسم
            const page = this.closest('.page');
            if (!page) return;
            
            const section = page.id.replace('-page', '');
            
            // إضافة البحث إلى التاريخ
            window.searchHistory.add(this.value, section);
        });
    });
}

// تنفيذ التحسينات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة نظام البحث
    if (!window.SearchSystem) {
        loadSearchSystem();
    }
    
    // تحسين مظهر عناصر البحث
    enhanceSearchUI();
    
    // تحسين دمج نظام البحث
    improveSearchSystemIntegration();
});

// وظيفة مساعدة للاختبار - يمكن إزالتها في الإنتاج
function testSearchSystem() {
    console.log('اختبار نظام البحث');
    
    if (window.SearchSystem) {
        console.log('نظام البحث جاهز للاستخدام');
        return true;
    } else {
        console.error('نظام البحث غير متوفر');
        return false;
    }
}
