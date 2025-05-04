/**
 * إصلاح أزرار البحث والتصدير في صفحات الصادرات والواردات
 * ملف: buttons-functionality-fix.js
 */

(function() {
    console.log("تشغيل إصلاح أزرار البحث والتصدير...");
    
    // دالة لإعادة تعيين وتفعيل أزرار البحث والتصدير
    function fixButtonsFunctionality() {
        console.log("بدء إصلاح وظائف الأزرار...");
        
        // إصلاح حقول البحث
        setupSearchFields();
        
        // إصلاح أزرار التصدير
        setupExportButtons();
        
        // إصلاح أزرار الفلترة
        setupFilterButtons();
        
        // إصلاح أزرار إضافة المصروفات والواردات
        setupAddButtons();
        
        console.log("تم إصلاح وظائف الأزرار بنجاح!");
    }
    
    // إعداد حقول البحث
    function setupSearchFields() {
        // حقل البحث في صفحة الصادرات
        const exportsSearch = document.getElementById('exports-search');
        if (exportsSearch) {
            console.log("تم العثور على حقل البحث في الصادرات، جاري إعداده...");
            
            // إزالة أي مستمعي أحداث موجودة
            const newExportsSearch = exportsSearch.cloneNode(true);
            exportsSearch.parentNode.replaceChild(newExportsSearch, exportsSearch);
            
            // إضافة مستمع جديد
            newExportsSearch.addEventListener('input', function() {
                searchFinancialRecords('exports', this.value);
            });
        } else {
            console.log("لم يتم العثور على حقل البحث في الصادرات");
        }
        
        // حقل البحث في صفحة الواردات
        const importsSearch = document.getElementById('imports-search');
        if (importsSearch) {
            console.log("تم العثور على حقل البحث في الواردات، جاري إعداده...");
            
            // إزالة أي مستمعي أحداث موجودة
            const newImportsSearch = importsSearch.cloneNode(true);
            importsSearch.parentNode.replaceChild(newImportsSearch, importsSearch);
            
            // إضافة مستمع جديد
            newImportsSearch.addEventListener('input', function() {
                searchFinancialRecords('imports', this.value);
            });
        } else {
            console.log("لم يتم العثور على حقل البحث في الواردات");
        }
    }
    
    // إعداد أزرار التصدير
    function setupExportButtons() {
        // زر تصدير الصادرات
        const exportDataBtn = document.getElementById('export-data-btn');
        if (exportDataBtn) {
            console.log("تم العثور على زر تصدير الصادرات، جاري إعداده...");
            
            // إزالة أي مستمعي أحداث موجودة
            const newExportDataBtn = exportDataBtn.cloneNode(true);
            exportDataBtn.parentNode.replaceChild(newExportDataBtn, exportDataBtn);
            
            // إضافة مستمع جديد
            newExportDataBtn.addEventListener('click', function() {
                exportFinancialData('exports');
            });
        } else {
            console.log("لم يتم العثور على زر تصدير الصادرات");
        }
        
        // زر تصدير الواردات
        const importDataBtn = document.getElementById('import-data-btn');
        if (importDataBtn) {
            console.log("تم العثور على زر تصدير الواردات، جاري إعداده...");
            
            // إزالة أي مستمعي أحداث موجودة
            const newImportDataBtn = importDataBtn.cloneNode(true);
            importDataBtn.parentNode.replaceChild(newImportDataBtn, importDataBtn);
            
            // إضافة مستمع جديد
            newImportDataBtn.addEventListener('click', function() {
                exportFinancialData('imports');
            });
        } else {
            console.log("لم يتم العثور على زر تصدير الواردات");
        }
    }
    
    // إعداد أزرار الفلترة
    function setupFilterButtons() {
        // أزرار الفلترة في صفحة الصادرات
        const exportsPeriodBtns = document.querySelectorAll('#exports-page .btn-group .btn[data-period]');
        if (exportsPeriodBtns.length > 0) {
            console.log(`تم العثور على ${exportsPeriodBtns.length} زر فلترة في الصادرات، جاري إعدادها...`);
            
            exportsPeriodBtns.forEach(button => {
                // إزالة أي مستمعي أحداث موجودة
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                // إضافة مستمع جديد
                newButton.addEventListener('click', function() {
                    // إزالة الفئة النشطة من جميع الأزرار
                    exportsPeriodBtns.forEach(btn => {
                        btn.classList.remove('active');
                    });
                    
                    // إضافة الفئة النشطة لهذا الزر
                    this.classList.add('active');
                    
                    // تطبيق الفلترة
                    const period = this.getAttribute('data-period');
                    filterFinancialRecords('exports', period);
                });
            });
        } else {
            console.log("لم يتم العثور على أزرار الفلترة في الصادرات");
        }
        
        // أزرار الفلترة في صفحة الواردات
        const importsPeriodBtns = document.querySelectorAll('#imports-page .btn-group .btn[data-period]');
        if (importsPeriodBtns.length > 0) {
            console.log(`تم العثور على ${importsPeriodBtns.length} زر فلترة في الواردات، جاري إعدادها...`);
            
            importsPeriodBtns.forEach(button => {
                // إزالة أي مستمعي أحداث موجودة
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                // إضافة مستمع جديد
                newButton.addEventListener('click', function() {
                    // إزالة الفئة النشطة من جميع الأزرار
                    importsPeriodBtns.forEach(btn => {
                        btn.classList.remove('active');
                    });
                    
                    // إضافة الفئة النشطة لهذا الزر
                    this.classList.add('active');
                    
                    // تطبيق الفلترة
                    const period = this.getAttribute('data-period');
                    filterFinancialRecords('imports', period);
                });
            });
        } else {
            console.log("لم يتم العثور على أزرار الفلترة في الواردات");
        }
    }
    
    // إعداد أزرار الإضافة
    function setupAddButtons() {
        // زر إضافة مصروف
        const addExpenseBtn = document.getElementById('add-expense-btn');
        if (addExpenseBtn) {
            console.log("تم العثور على زر إضافة مصروف، جاري إعداده...");
            
            // إزالة أي مستمعي أحداث موجودة
            const newAddExpenseBtn = addExpenseBtn.cloneNode(true);
            addExpenseBtn.parentNode.replaceChild(newAddExpenseBtn, addExpenseBtn);
            
            // إضافة مستمع جديد
            newAddExpenseBtn.addEventListener('click', function() {
                openAddExpenseModal();
            });
        } else {
            console.log("لم يتم العثور على زر إضافة مصروف");
        }
        
        // زر إضافة وارد
        const addIncomeBtn = document.getElementById('add-income-btn');
        if (addIncomeBtn) {
            console.log("تم العثور على زر إضافة وارد، جاري إعداده...");
            
            // إزالة أي مستمعي أحداث موجودة
            const newAddIncomeBtn = addIncomeBtn.cloneNode(true);
            addIncomeBtn.parentNode.replaceChild(newAddIncomeBtn, addIncomeBtn);
            
            // إضافة مستمع جديد
            newAddIncomeBtn.addEventListener('click', function() {
                openAddIncomeModal();
            });
        } else {
            console.log("لم يتم العثور على زر إضافة وارد");
        }
    }
    
    // البحث في السجلات المالية
    function searchFinancialRecords(type, query) {
        console.log(`البحث في ${type} عن: ${query}`);
        
        // التحقق من وجود الدالة الأصلية
        if (typeof window.searchFinancialData === 'function') {
            window.searchFinancialData(type, query);
            return;
        }
        
        // تنفيذ البحث بشكل مباشر إذا لم تكن الدالة الأصلية موجودة
        const data = type === 'exports' ? window.exports : window.imports;
        
        if (!data || !Array.isArray(data)) {
            console.error(`مصفوفة ${type} غير موجودة أو ليست مصفوفة!`);
            return;
        }
        
        if (!query || query.trim() === '') {
            // إعادة عرض جميع البيانات
            if (type === 'exports') {
                renderExportsData();
            } else {
                renderImportsData();
            }
            return;
        }
        
        query = query.trim().toLowerCase();
        
        const filteredData = data.filter(item => {
            return (
                (item.type && item.type.toLowerCase().includes(query)) ||
                (item.description && item.description.toLowerCase().includes(query)) ||
                (item.investorName && item.investorName.toLowerCase().includes(query)) ||
                (item.notes && item.notes.toLowerCase().includes(query)) ||
                (item.amount && item.amount.toString().includes(query))
            );
        });
        
        // عرض نتائج البحث
        const tableBody = document.querySelector(`#${type}-table tbody`);
        if (!tableBody) {
            console.error(`لم يتم العثور على جدول ${type}!`);
            return;
        }
        
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
                <td>${item.description || '-'}</td>
                <td>${item.investorName || '-'}</td>
                <td>${formatCurrency(item.amount)}</td>
                <td>${item.notes || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline edit-${type.slice(0, -1)}-btn" data-id="${item.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline danger delete-${type.slice(0, -1)}-btn" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // إعادة تعيين مستمعي الأحداث للأزرار
        if (type === 'exports') {
            setupExportsActionButtons();
        } else {
            setupImportsActionButtons();
        }
    }
    
    // فلترة السجلات المالية حسب الفترة
    function filterFinancialRecords(type, period) {
        console.log(`فلترة ${type} حسب الفترة: ${period}`);
        
        // التحقق من وجود الدالة الأصلية
        if (typeof window.renderExportsData === 'function' && type === 'exports') {
            window.renderExportsData(period);
            return;
        }
        
        if (typeof window.renderImportsData === 'function' && type === 'imports') {
            window.renderImportsData(period);
            return;
        }
        
        // تنفيذ الفلترة بشكل مباشر إذا لم تكن الدالة الأصلية موجودة
        const data = type === 'exports' ? window.exports : window.imports;
        
        if (!data || !Array.isArray(data)) {
            console.error(`مصفوفة ${type} غير موجودة أو ليست مصفوفة!`);
            return;
        }
        
        // فلترة البيانات حسب الفترة
        const filteredData = filterDataByPeriod(data, period);
        
        // عرض البيانات المصفاة
        const tableBody = document.querySelector(`#${type}-table tbody`);
        if (!tableBody) {
            console.error(`لم يتم العثور على جدول ${type}!`);
            return;
        }
        
        if (filteredData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center">لا توجد بيانات ${type === 'exports' ? 'صادرات' : 'واردات'} ${getPeriodText(period)}</td></tr>`;
            return;
        }
        
        // ترتيب البيانات حسب التاريخ (الأحدث أولاً)
        filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // عرض البيانات المصفاة
        tableBody.innerHTML = '';
        filteredData.forEach(item => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${formatDate(item.date)}</td>
                <td><span class="badge badge-${getTypeClass(item.type)}">${item.type}</span></td>
                <td>${item.description || '-'}</td>
                <td>${item.investorName || '-'}</td>
                <td>${formatCurrency(item.amount)}</td>
                <td>${item.notes || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline edit-${type.slice(0, -1)}-btn" data-id="${item.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline danger delete-${type.slice(0, -1)}-btn" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // إعادة تعيين مستمعي الأحداث للأزرار
        if (type === 'exports') {
            setupExportsActionButtons();
        } else {
            setupImportsActionButtons();
        }
        
        // تحديث لوحة المعلومات
        if (type === 'exports') {
            updateExportsDashboard(filteredData, period);
        } else {
            updateImportsDashboard(filteredData, period);
        }
    }
    
    // فلترة البيانات حسب الفترة
    function filterDataByPeriod(data, period) {
        if (period === 'all') {
            return data;
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return data.filter(item => {
            if (!item.date) return false;
            
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
    
    // تصدير البيانات المالية
    function exportFinancialData(type) {
        console.log(`تصدير بيانات ${type}...`);
        
        // التحقق من وجود الدالة الأصلية
        if (typeof window.exportFinancialData === 'function') {
            window.exportFinancialData(type);
            return;
        }
        
        // تنفيذ التصدير بشكل مباشر إذا لم تكن الدالة الأصلية موجودة
        const data = type === 'exports' ? window.exports : window.imports;
        
        if (!data || !Array.isArray(data) || data.length === 0) {
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
                item.id || '',
                item.date || '',
                item.type || '',
                item.description ? `"${item.description.replace(/"/g, '""')}"` : '',
                item.investorName || '',
                item.amount || '0',
                item.notes ? `"${item.notes.replace(/"/g, '""')}"` : ''
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
    
    // فتح نافذة إضافة مصروف
    function openAddExpenseModal() {
        console.log("فتح نافذة إضافة مصروف...");
        
        // التحقق من وجود الدالة الأصلية
        if (typeof window.openAddExpenseModal === 'function') {
            window.openAddExpenseModal();
            return;
        }
        
        // التحقق من وجود النافذة
        if (!document.getElementById('add-expense-modal')) {
            createExpenseModal();
        }
        
        // فتح النافذة
        openModal('add-expense-modal');
    }
    
    // فتح نافذة إضافة وارد
    function openAddIncomeModal() {
        console.log("فتح نافذة إضافة وارد...");
        
        // التحقق من وجود الدالة الأصلية
        if (typeof window.openAddIncomeModal === 'function') {
            window.openAddIncomeModal();
            return;
        }
        
        // التحقق من وجود النافذة
        if (!document.getElementById('add-income-modal')) {
            createIncomeModal();
        }
        
        // فتح النافذة
        openModal('add-income-modal');
    }
    
    // إنشاء نافذة إضافة مصروف
    function createExpenseModal() {
        // التحقق من عدم وجود النافذة مسبقًا
        if (document.getElementById('add-expense-modal')) {
            return;
        }
        
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
                closeModal('add-expense-modal');
            });
        });
    }
    
    // إنشاء نافذة إضافة وارد
    function createIncomeModal() {
        // التحقق من عدم وجود النافذة مسبقًا
        if (document.getElementById('add-income-modal')) {
            return;
        }
        
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
                closeModal('add-income-modal');
            });
        });
    }
    
    // فتح النافذة المنبثقة
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.classList.add('active');
        
        // تعيين التاريخ الحالي
        const dateInput = modal.querySelector('input[type="date"]');
        if (dateInput && !dateInput.value) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
        
        // ملء قائمة المستثمرين
        const investorSelect = modal.querySelector('select[id$="-investor"]');
        if (investorSelect) {
            populateInvestorsList(investorSelect.id);
        }
    }
    
    // إغلاق النافذة المنبثقة
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.classList.remove('active');
    }
    
    // حفظ مصروف جديد
    function saveExpense() {
        // التحقق من وجود الدالة الأصلية
        if (typeof window.saveExpense === 'function') {
            window.saveExpense();
            return;
        }
        
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
        if (investorId && window.investors) {
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
        if (!Array.isArray(window.exports)) {
            window.exports = [];
        }
        
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
        try {
            localStorage.setItem('exports', JSON.stringify(window.exports));
        } catch (error) {
            console.error('خطأ في حفظ بيانات الصادرات:', error);
        }
        
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
        // التحقق من وجود الدالة الأصلية
        if (typeof window.saveIncome === 'function') {
            window.saveIncome();
            return;
        }
        
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
        if (investorId && window.investors) {
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
        if (!Array.isArray(window.imports)) {
            window.imports = [];
        }
        
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
        try {
            localStorage.setItem('imports', JSON.stringify(window.imports));
        } catch (error) {
            console.error('خطأ في حفظ بيانات الواردات:', error);
        }
        
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
        if (record.investorId && window.investors) {
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
        } else {
            try {
                localStorage.setItem('transactions', JSON.stringify(window.transactions));
            } catch (error) {
                console.error('خطأ في حفظ بيانات العمليات:', error);
            }
        }
        
        // إطلاق حدث تحديث العمليات
        document.dispatchEvent(new CustomEvent('transaction:update'));
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
    
    // إعادة تعيين مستمعي الأحداث للأزرار في جدول الصادرات
    function setupExportsActionButtons() {
        // التحقق من وجود الدالة الأصلية
        if (typeof window.setupExportsActionButtons === 'function') {
            window.setupExportsActionButtons();
            return;
        }
        
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
    
    // إعادة تعيين مستمعي الأحداث للأزرار في جدول الواردات
    function setupImportsActionButtons() {
        // التحقق من وجود الدالة الأصلية
        if (typeof window.setupImportsActionButtons === 'function') {
            window.setupImportsActionButtons();
            return;
        }
        
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
    
    // تحديث لوحة معلومات الصادرات
    function updateExportsDashboard(data, period) {
        // التحقق من وجود الدالة الأصلية
        if (typeof window.updateExportsDashboard === 'function') {
            window.updateExportsDashboard(data, period);
            return;
        }
        
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
        const totalExpensesEl = document.getElementById('total-expenses');
        if (totalExpensesEl) {
            totalExpensesEl.textContent = formatCurrency(totalExpenses);
        }
        
        const expensePeriodEl = document.getElementById('expense-period');
        if (expensePeriodEl) {
            expensePeriodEl.textContent = getPeriodText(period);
        }
        
        const withdrawalsAmountEl = document.getElementById('withdrawals-amount');
        if (withdrawalsAmountEl) {
            withdrawalsAmountEl.textContent = formatCurrency(totalWithdrawals);
        }
        
        const withdrawalsCountEl = document.getElementById('withdrawals-count');
        if (withdrawalsCountEl) {
            withdrawalsCountEl.textContent = `${withdrawals.length} عملية`;
        }
        
        const operationalExpensesEl = document.getElementById('operational-expenses');
        if (operationalExpensesEl) {
            operationalExpensesEl.textContent = formatCurrency(totalOperationalExpenses);
        }
        
        const operationalCountEl = document.getElementById('operational-count');
        if (operationalCountEl) {
            operationalCountEl.textContent = `${operationalExpenses.length} عملية`;
        }
        
        const profitPaymentsEl = document.getElementById('profit-payments');
        if (profitPaymentsEl) {
            profitPaymentsEl.textContent = formatCurrency(totalProfitPayments);
        }
        
        const profitPaymentsCountEl = document.getElementById('profit-payments-count');
        if (profitPaymentsCountEl) {
            profitPaymentsCountEl.textContent = `${profitPayments.length} عملية`;
        }
    }
    
    // تحديث لوحة معلومات الواردات
    function updateImportsDashboard(data, period) {
        // التحقق من وجود الدالة الأصلية
        if (typeof window.updateImportsDashboard === 'function') {
            window.updateImportsDashboard(data, period);
            return;
        }
        
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
        const totalIncomeEl = document.getElementById('total-income');
        if (totalIncomeEl) {
            totalIncomeEl.textContent = formatCurrency(totalIncome);
        }
        
        const incomePeriodEl = document.getElementById('income-period');
        if (incomePeriodEl) {
            incomePeriodEl.textContent = getPeriodText(period);
        }
        
        const depositsAmountEl = document.getElementById('deposits-amount');
        if (depositsAmountEl) {
            depositsAmountEl.textContent = formatCurrency(totalDeposits);
        }
        
        const depositsCountEl = document.getElementById('deposits-count');
        if (depositsCountEl) {
            depositsCountEl.textContent = `${deposits.length} عملية`;
        }
        
        const installmentsAmountEl = document.getElementById('installments-amount');
        if (installmentsAmountEl) {
            installmentsAmountEl.textContent = formatCurrency(totalInstallments);
        }
        
        const installmentsCountEl = document.getElementById('installments-count');
        if (installmentsCountEl) {
            installmentsCountEl.textContent = `${installments.length} عملية`;
        }
        
        const otherIncomeEl = document.getElementById('other-income');
        if (otherIncomeEl) {
            otherIncomeEl.textContent = formatCurrency(totalOtherIncome);
        }
        
        const otherIncomeCountEl = document.getElementById('other-income-count');
        if (otherIncomeCountEl) {
            otherIncomeCountEl.textContent = `${otherIncome.length} عملية`;
        }
    }
    
    // تعديل سجل مالي
    function editFinancialRecord(type, id) {
        // التحقق من وجود الدالة الأصلية
        if (typeof window.editFinancialRecord === 'function') {
            window.editFinancialRecord(type, id);
            return;
        }
        
        // البحث عن السجل
        const data = type === 'exports' ? window.exports : window.imports;
        
        if (!data || !Array.isArray(data)) {
            console.error(`مصفوفة ${type} غير موجودة أو ليست مصفوفة!`);
            return;
        }
        
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
            
            const typeSelect = document.getElementById('expense-type');
            if (typeSelect) {
                // البحث عن الخيار المطابق
                const option = typeSelect.querySelector(`option[value="${record.type}"]`);
                if (option) {
                    option.selected = true;
                } else {
                    // إذا لم يتم العثور على الخيار، أضف خيارًا جديدًا
                    const newOption = document.createElement('option');
                    newOption.value = record.type;
                    newOption.textContent = record.type;
                    newOption.selected = true;
                    typeSelect.appendChild(newOption);
                }
            }
            
            document.getElementById('expense-description').value = record.description || '';
            document.getElementById('expense-amount').value = record.amount || '';
            document.getElementById('expense-date').value = record.date || '';
            document.getElementById('expense-notes').value = record.notes || '';
            
            // ملء قائمة المستثمرين
            populateInvestorsList('expense-investor', record.investorId);
        } else {
            document.getElementById('income-id').value = record.id;
            
            const typeSelect = document.getElementById('income-type');
            if (typeSelect) {
                // البحث عن الخيار المطابق
                const option = typeSelect.querySelector(`option[value="${record.type}"]`);
                if (option) {
                    option.selected = true;
                } else {
                    // إذا لم يتم العثور على الخيار، أضف خيارًا جديدًا
                    const newOption = document.createElement('option');
                    newOption.value = record.type;
                    newOption.textContent = record.type;
                    newOption.selected = true;
                    typeSelect.appendChild(newOption);
                }
            }
            
            document.getElementById('income-description').value = record.description || '';
            document.getElementById('income-amount').value = record.amount || '';
            document.getElementById('income-date').value = record.date || '';
            document.getElementById('income-notes').value = record.notes || '';
            
            // ملء قائمة المستثمرين
            populateInvestorsList('income-investor', record.investorId);
        }
        
        // فتح النافذة
        openModal(modalId);
    }
    
    // حذف سجل مالي
    function deleteFinancialRecord(type, id) {
        // التحقق من وجود الدالة الأصلية
        if (typeof window.deleteFinancialRecord === 'function') {
            window.deleteFinancialRecord(type, id);
            return;
        }
        
        // التأكيد قبل الحذف
        if (!confirm('هل أنت متأكد من رغبتك في حذف هذا السجل؟')) {
            return;
        }
        
        // الحصول على مصفوفة البيانات المناسبة
        const dataType = type === 'exports' ? 'exports' : 'imports';
        
        if (!window[dataType] || !Array.isArray(window[dataType])) {
            console.error(`مصفوفة ${dataType} غير موجودة أو ليست مصفوفة!`);
            return;
        }
        
        // حذف السجل
        window[dataType] = window[dataType].filter(item => item.id !== id);
        
        // حفظ البيانات
        try {
            localStorage.setItem(dataType, JSON.stringify(window[dataType]));
        } catch (error) {
            console.error(`خطأ في حفظ بيانات ${dataType}:`, error);
        }
        
        // تحديث واجهة المستخدم
        if (type === 'exports') {
            renderExportsData();
        } else {
            renderImportsData();
        }
        
        // عرض إشعار النجاح
        showNotification('تم حذف السجل بنجاح', 'success');
    }
    
    // عرض بيانات الصادرات
    function renderExportsData(period = 'all') {
        // التحقق من وجود الدالة الأصلية
        if (typeof window.renderExportsData === 'function') {
            window.renderExportsData(period);
            return;
        }
        
        console.log(`عرض بيانات الصادرات (الفترة: ${period})...`);
        
        const tableBody = document.querySelector('#exports-table tbody');
        if (!tableBody) {
            console.error("لم يتم العثور على جدول الصادرات!");
            return;
        }
        
        // فلترة البيانات حسب الفترة المحددة
        const filteredData = filterDataByPeriod(window.exports || [], period);
        
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
                <td>${item.description || '-'}</td>
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
        // التحقق من وجود الدالة الأصلية
        if (typeof window.renderImportsData === 'function') {
            window.renderImportsData(period);
            return;
        }
        
        console.log(`عرض بيانات الواردات (الفترة: ${period})...`);
        
        const tableBody = document.querySelector('#imports-table tbody');
        if (!tableBody) {
            console.error("لم يتم العثور على جدول الواردات!");
            return;
        }
        
        // فلترة البيانات حسب الفترة المحددة
        const filteredData = filterDataByPeriod(window.imports || [], period);
        
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
                <td>${item.description || '-'}</td>
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
    
    // تنسيق التاريخ
    function formatDate(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            
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
            case 'مصروف آخر':
                return 'warning';
            case 'وارد آخر':
                return 'secondary';
            default:
                return 'secondary';
        }
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
    
    // عرض إشعار
    function showNotification(message, type = 'success') {
        // استخدام دالة النظام لعرض الإشعارات إذا كانت موجودة
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
            return;
        }
        
        console.log(`إشعار [${type}]: ${message}`);
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} show`;
        
        notification.innerHTML = `
            <div class="notification-icon ${type}">
                <i class="fas fa-${
                    type === 'success' ? 'check' : 
                    type === 'error' ? 'times' : 
                    type === 'warning' ? 'exclamation-triangle' : 'info-circle'
                }"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${
                    type === 'success' ? 'تمت العملية بنجاح' : 
                    type === 'error' ? 'خطأ' : 
                    type === 'warning' ? 'تنبيه' : 'معلومات'
                }</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">×</button>
        `;
        
        document.body.appendChild(notification);
        
        // إغلاق الإشعار بعد 5 ثوانٍ
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
        
        // إضافة مستمع حدث لزر الإغلاق
        const closeButton = notification.querySelector('.notification-close');
        if (closeButton) {
            closeButton.addEventListener('click', function() {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            });
        }
    }
    
    // إضافة مستمع حدث لحقل البحث في الصادرات والواردات
    document.addEventListener('DOMContentLoaded', function() {
        console.log("تهيئة نظام البحث والتصدير...");
        
        // تنفيذ الإصلاح عند تحميل الصفحة بالكامل
        fixButtonsFunctionality();
        
        // إضافة مستمع حدث لحقول البحث يتم تشغيله عند إدخال البيانات
        document.body.addEventListener('input', function(event) {
            const searchInput = event.target;
            
            if (searchInput.id === 'exports-search') {
                searchFinancialRecords('exports', searchInput.value);
            } else if (searchInput.id === 'imports-search') {
                searchFinancialRecords('imports', searchInput.value);
            }
        });
        
        // إضافة استماع للتبديل بين الصفحات
        document.addEventListener('financial:pageChange', function(event) {
            const pageType = event.detail.pageType;
            if (pageType === 'exports' || pageType === 'imports') {
                fixButtonsFunctionality();
            }
        });
    });
    
    // إضافة مستمع حدث لتحميل الصفحة بالكامل
    window.addEventListener('load', function() {
        setTimeout(function() {
            console.log("تشغيل إصلاح نهائي لأزرار البحث والتصدير...");
            fixButtonsFunctionality();
            
            // إعادة عرض البيانات في الصفحة النشطة
            if (document.getElementById('exports-page').classList.contains('active')) {
                renderExportsData();
            } else if (document.getElementById('imports-page').classList.contains('active')) {
                renderImportsData();
            }
            
            showNotification('تم إصلاح وظائف أزرار البحث والتصدير بنجاح', 'success');
        }, 1000);
    });
    
    // تنفيذ الإصلاح الآن
    fixButtonsFunctionality();
})();
