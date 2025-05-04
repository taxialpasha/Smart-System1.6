

/**
 * employees-integration.js
 * ملف تكامل نظام إدارة الموظفين مع نظام الاستثمار المتكامل
 * هذا الملف يحل مشكلة عدم عمل صفحة الموظفين عند النقر على القائمة الجانبية
 */

(function() {
    // تهيئة النظام عند تحميل الصفحة
    document.addEventListener('DOMContentLoaded', function() {
        console.log('تهيئة تكامل نظام إدارة الموظفين...');
        initEmployeesSystem();
    });

    /**
     * تهيئة نظام الموظفين
     */
    function initEmployeesSystem() {
        // إضافة رابط صفحة الموظفين إلى القائمة الجانبية
        addEmployeesSidebarLink();
        
        // إضافة صفحة الموظفين إلى التطبيق
        addEmployeesPage();
        
        // إضافة نوافذ إدارة الموظفين
        addEmployeesModals();
        
        // تهيئة مستمعي الأحداث
        initEmployeesEventListeners();
        
        // إضافة أنماط CSS
        addEmployeesStyles();

        // تحميل بيانات الموظفين
        setTimeout(function() {
            loadEmployeesData();
        }, 500);
    }

    /**
     * إضافة رابط صفحة الموظفين إلى القائمة الجانبية
     */
    function addEmployeesSidebarLink() {
        const navList = document.querySelector('.nav-list');
        if (!navList) {
            console.error('لم يتم العثور على القائمة الجانبية');
            return;
        }
        
        // التحقق من عدم وجود الرابط مسبقاً
        if (document.querySelector('a[data-page="employees"]')) {
            console.log('رابط الموظفين موجود بالفعل');
            return;
        }
        
        // إنشاء عنصر الرابط
        const navItem = document.createElement('li');
        navItem.className = 'nav-item';
        
        navItem.innerHTML = `
            <a class="nav-link" data-page="employees" href="#">
                <div class="nav-icon">
                    <i class="fas fa-user-tie"></i>
                </div>
                <span>الموظفين</span>
            </a>
        `;
        
        // إضافة الرابط قبل رابط الإعدادات
        const settingsNavItem = document.querySelector('a[data-page="settings"]');
        if (settingsNavItem && settingsNavItem.parentNode) {
            navList.insertBefore(navItem, settingsNavItem.parentNode);
        } else {
            // إذا لم يتم العثور على رابط الإعدادات، أضف في نهاية القائمة
            navList.appendChild(navItem);
        }

        // إضافة مستمع حدث خاص للرابط
        const employeesLink = navItem.querySelector('a[data-page="employees"]');
        if (employeesLink) {
            employeesLink.addEventListener('click', function(e) {
                e.preventDefault();
                activateEmployeesPage();
            });
        }
    }

    /**
     * تنشيط صفحة الموظفين
     */
    function activateEmployeesPage() {
        // إخفاء جميع الصفحات
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // إلغاء تنشيط جميع روابط القائمة
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // تنشيط رابط الموظفين
        const employeesLink = document.querySelector('a[data-page="employees"]');
        if (employeesLink) {
            employeesLink.classList.add('active');
        }
        
        // عرض صفحة الموظفين
        const employeesPage = document.getElementById('employees-page');
        if (employeesPage) {
            employeesPage.classList.add('active');
            
            // حدث خاص لإخبار المكونات الأخرى بتنشيط صفحة الموظفين
            const event = new CustomEvent('page:change', { 
                detail: { page: 'employees' } 
            });
            document.dispatchEvent(event);
            
            // تحديث جدول الموظفين
            renderEmployeesTable();
        } else {
            console.error('لم يتم العثور على صفحة الموظفين');
        }
    }

    /**
     * إضافة صفحة الموظفين إلى التطبيق
     */
    function addEmployeesPage() {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) {
            console.error('لم يتم العثور على المحتوى الرئيسي');
            return;
        }
        
        // التحقق من عدم وجود الصفحة مسبقاً
        if (document.getElementById('employees-page')) {
            console.log('صفحة الموظفين موجودة بالفعل');
            return;
        }
        
        // إنشاء عنصر الصفحة
        const employeesPage = document.createElement('div');
        employeesPage.className = 'page';
        employeesPage.id = 'employees-page';
        
        employeesPage.innerHTML = `
            <div class="header">
                <button class="toggle-sidebar">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 class="page-title">إدارة الموظفين</h1>
                <div class="header-actions">
                    <div class="search-box">
                        <input class="search-input" placeholder="بحث عن موظف..." type="text" />
                        <i class="fas fa-search search-icon"></i>
                    </div>
                    <button class="btn btn-primary" id="add-employee-btn">
                        <i class="fas fa-plus"></i>
                        <span>إضافة موظف</span>
                    </button>
                </div>
            </div>
            
            <div class="tabs">
                <div class="tab-buttons">
                    <button class="tab-btn active" data-tab="employees-list">قائمة الموظفين</button>
                    <button class="tab-btn" data-tab="salary-transactions">سجل الرواتب</button>
                    <button class="tab-btn" data-tab="employees-reports">تقارير</button>
                </div>
                
                <div class="tab-content active" id="employees-list-tab">
                    <div class="section">
                        <div class="section-header">
                            <h2 class="section-title">قائمة الموظفين</h2>
                            <div class="section-actions">
                                <div class="btn-group">
                                    <button class="btn btn-outline btn-sm active" data-filter="all">الكل</button>
                                    <button class="btn btn-outline btn-sm" data-filter="active">نشط</button>
                                    <button class="btn btn-outline btn-sm" data-filter="inactive">غير نشط</button>
                                </div>
                                <button class="btn btn-outline btn-sm" title="تصدير" id="export-employees-btn">
                                    <i class="fas fa-download"></i>
                                    <span>تصدير</span>
                                </button>
                            </div>
                        </div>
                        <div class="table-container">
                            <table id="employees-table">
                                <thead>
                                    <tr>
                                        <th>المعرف</th>
                                        <th>الموظف</th>
                                        <th>المسمى الوظيفي</th>
                                        <th>رقم الهاتف</th>
                                        <th>الراتب الأساسي</th>
                                        <th>نسبة المبيعات</th>
                                        <th>تاريخ التعيين</th>
                                        <th>الحالة</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- سيتم ملؤها ديناميكياً -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div class="tab-content" id="salary-transactions-tab">
                    <div class="section">
                        <div class="section-header">
                            <h2 class="section-title">سجل الرواتب</h2>
                            <div class="section-actions">
                                <button class="btn btn-success" id="pay-salary-btn">
                                    <i class="fas fa-money-bill-wave"></i>
                                    <span>صرف راتب</span>
                                </button>
                                <button class="btn btn-outline btn-sm" title="تصدير" id="export-salaries-btn">
                                    <i class="fas fa-download"></i>
                                    <span>تصدير</span>
                                </button>
                            </div>
                        </div>
                        <div class="table-container">
                            <table id="salary-transactions-table">
                                <thead>
                                    <tr>
                                        <th>رقم العملية</th>
                                        <th>الموظف</th>
                                        <th>تاريخ الصرف</th>
                                        <th>الراتب الأساسي</th>
                                        <th>المبيعات</th>
                                        <th>النسبة</th>
                                        <th>مبلغ النسبة</th>
                                        <th>العلاوات</th>
                                        <th>الاستقطاعات</th>
                                        <th>الراتب النهائي</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- سيتم ملؤها ديناميكياً -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div class="tab-content" id="employees-reports-tab">
                    <div class="section">
                        <div class="section-header">
                            <h2 class="section-title">تقارير الموظفين</h2>
                            <div class="section-actions">
                                <div class="btn-group">
                                    <button class="btn btn-outline btn-sm active">شهري</button>
                                    <button class="btn btn-outline btn-sm">ربع سنوي</button>
                                    <button class="btn btn-outline btn-sm">سنوي</button>
                                </div>
                            </div>
                        </div>
                        <div class="grid-cols-2">
                            <div class="chart-container">
                                <canvas id="employees-salaries-chart"></canvas>
                            </div>
                            <div class="chart-container">
                                <canvas id="employees-performance-chart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // إضافة الصفحة إلى العنصر الرئيسي
        mainContent.appendChild(employeesPage);

        // تهيئة مستمع زر القائمة الجانبية
        const sidebarToggle = employeesPage.querySelector('.toggle-sidebar');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', function() {
                document.body.classList.toggle('sidebar-collapsed');
            });
        }

        // تهيئة تبويبات الصفحة
        const tabButtons = employeesPage.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                // إزالة الفئة النشطة من جميع الأزرار
                tabButtons.forEach(btn => btn.classList.remove('active'));
                
                // إضافة الفئة النشطة للزر الحالي
                this.classList.add('active');
                
                // تحديد معرف التبويب
                const tabId = this.getAttribute('data-tab') + '-tab';
                
                // إخفاء جميع محتويات التبويبات
                employeesPage.querySelectorAll('.tab-content').forEach(tab => {
                    tab.classList.remove('active');
                });
                
                // إظهار محتوى التبويب المطلوب
                const tabContent = document.getElementById(tabId);
                if (tabContent) {
                    tabContent.classList.add('active');
                    
                    // تحديث البيانات حسب التبويب النشط
                    if (tabId === 'employees-list-tab') {
                        renderEmployeesTable();
                    } else if (tabId === 'salary-transactions-tab') {
                        renderSalaryTransactionsTable();
                    } else if (tabId === 'employees-reports-tab') {
                        renderEmployeesReports();
                    }
                }
            });
        });
    }

    /**
     * إضافة نوافذ إدارة الموظفين
     */
    function addEmployeesModals() {
        // التحقق من عدم وجود النوافذ مسبقاً
        if (document.getElementById('add-employee-modal')) {
            console.log('نوافذ الموظفين موجودة بالفعل');
            return;
        }
        
        // إنشاء عناصر النوافذ
        const modalsContainer = document.createElement('div');
        modalsContainer.id = 'employees-modals-container';
        modalsContainer.style.display = 'none';
        
        modalsContainer.innerHTML = `
            <!-- نافذة إضافة موظف جديد -->
            <div class="modal-overlay" id="add-employee-modal">
                <div class="modal animate__animated animate__fadeInUp">
                    <div class="modal-header">
                        <h3 class="modal-title">إضافة موظف جديد</h3>
                        <button class="modal-close">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="add-employee-form">
                            <div class="form-tabs">
                                <div class="form-tab-buttons">
                                    <button type="button" class="form-tab-btn active" data-tab="personal-info">معلومات شخصية</button>
                                    <button type="button" class="form-tab-btn" data-tab="job-info">معلومات وظيفية</button>
                                    <button type="button" class="form-tab-btn" data-tab="documents">المستندات</button>
                                </div>
                                <div class="form-tab-content active" id="personal-info-tab">
                                    <div class="grid-cols-2">
                                        <div class="form-group">
                                            <label class="form-label">اسم الموظف</label>
                                            <div class="input-group">
                                                <input class="form-input" id="employee-name" required="" type="text" />
                                                <button class="btn btn-icon-sm mic-btn" data-input="employee-name" type="button">
                                                    <i class="fas fa-microphone"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">رقم الهاتف</label>
                                            <div class="input-group">
                                                <input class="form-input" id="employee-phone" required="" type="tel" />
                                                <button class="btn btn-icon-sm mic-btn" data-input="employee-phone" type="button">
                                                    <i class="fas fa-microphone"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">العنوان</label>
                                            <div class="input-group">
                                                <input class="form-input" id="employee-address" required="" type="text" />
                                                <button class="btn btn-icon-sm mic-btn" data-input="employee-address" type="button">
                                                    <i class="fas fa-microphone"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">البريد الإلكتروني</label>
                                            <input class="form-input" id="employee-email" type="email" />
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">تاريخ الميلاد</label>
                                            <input class="form-input" id="employee-birthdate" type="date" />
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">الجنس</label>
                                            <select class="form-select" id="employee-gender">
                                                <option value="male">ذكر</option>
                                                <option value="female">أنثى</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-tab-content" id="job-info-tab">
                                    <div class="grid-cols-2">
                                        <div class="form-group">
                                            <label class="form-label">المسمى الوظيفي</label>
                                            <div class="input-group">
                                                <input class="form-input" id="employee-job-title" required="" type="text" />
                                                <button class="btn btn-icon-sm mic-btn" data-input="employee-job-title" type="button">
                                                    <i class="fas fa-microphone"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">القسم</label>
                                            <select class="form-select" id="employee-department">
                                                <option value="sales">المبيعات</option>
                                                <option value="finance">المالية</option>
                                                <option value="admin">الإدارة</option>
                                                <option value="it">تكنولوجيا المعلومات</option>
                                                <option value="operations">العمليات</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">الراتب الأساسي</label>
                                            <div class="input-group">
                                                <input class="form-input" id="employee-base-salary" min="0" required="" type="number" />
                                                <button class="btn btn-icon-sm mic-btn" data-input="employee-base-salary" type="button">
                                                    <i class="fas fa-microphone"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">نسبة المبيعات (%)</label>
                                            <input class="form-input" id="employee-commission-rate" max="30" min="0" required="" step="0.1" type="number" value="3" />
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">تاريخ التعيين</label>
                                            <input class="form-input" id="employee-hire-date" required="" type="date" />
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">نوع العقد</label>
                                            <select class="form-select" id="employee-contract-type">
                                                <option value="full-time">دوام كامل</option>
                                                <option value="part-time">دوام جزئي</option>
                                                <option value="contract">عقد مؤقت</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-tab-content" id="documents-tab">
                                    <div class="grid-cols-2">
                                        <div class="form-group">
                                            <label class="form-label">رقم البطاقة الموحدة</label>
                                            <div class="input-group">
                                                <input class="form-input" id="employee-id-number" required="" type="text" />
                                                <button class="btn btn-icon-sm mic-btn" data-input="employee-id-number" type="button">
                                                    <i class="fas fa-microphone"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">رقم بطاقة السكن</label>
                                            <div class="input-group">
                                                <input class="form-input" id="employee-residence-card" type="text" />
                                                <button class="btn btn-icon-sm mic-btn" data-input="employee-residence-card" type="button">
                                                    <i class="fas fa-microphone"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">صورة البطاقة الموحدة</label>
                                            <div class="file-upload-container">
                                                <button type="button" class="btn btn-outline btn-sm file-upload-btn" id="id-card-upload-btn">
                                                    <i class="fas fa-upload"></i>
                                                    <span>تحميل الصورة</span>
                                                </button>
                                                <div class="file-preview" id="id-card-preview"></div>
                                                <input type="file" id="id-card-upload" accept="image/*" hidden />
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">صورة بطاقة السكن</label>
                                            <div class="file-upload-container">
                                                <button type="button" class="btn btn-outline btn-sm file-upload-btn" id="residence-card-upload-btn">
                                                    <i class="fas fa-upload"></i>
                                                    <span>تحميل الصورة</span>
                                                </button>
                                                <div class="file-preview" id="residence-card-preview"></div>
                                                <input type="file" id="residence-card-upload" accept="image/*" hidden />
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">صورة شخصية</label>
                                            <div class="file-upload-container">
                                                <button type="button" class="btn btn-outline btn-sm file-upload-btn" id="employee-photo-upload-btn">
                                                    <i class="fas fa-upload"></i>
                                                    <span>تحميل الصورة</span>
                                                </button>
                                                <div class="file-preview" id="employee-photo-preview"></div>
                                                <input type="file" id="employee-photo-upload" accept="image/*" hidden />
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">ملاحظات إضافية</label>
                                            <textarea class="form-input" id="employee-notes" rows="3"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline modal-close-btn">إلغاء</button>
                        <button class="btn btn-primary" id="save-employee-btn">إضافة</button>
                    </div>
                </div>
            </div>
            
            <!-- نافذة صرف راتب -->
            <div class="modal-overlay" id="pay-salary-modal">
                <div class="modal animate__animated animate__fadeInUp">
                    <div class="modal-header">
                        <h3 class="modal-title">صرف راتب</h3>
                        <button class="modal-close">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="pay-salary-form">
                            <div class="form-group">
                                <label class="form-label">الموظف</label>
                                <select class="form-select" id="salary-employee" required="">
                                    <option value="">اختر الموظف</option>
                                    <!-- سيتم ملؤها ديناميكياً -->
                                </select>
                            </div>
                            <div id="employee-salary-info"></div>
                            <div class="grid-cols-2">
                                <div class="form-group">
                                    <label class="form-label">تاريخ صرف الراتب</label>
                                    <input class="form-input" id="salary-date" required="" type="date" />
                                </div>
                                <div class="form-group">
                                    <label class="form-label">الشهر المستحق</label>
                                    <select class="form-select" id="salary-month" required="">
                                        <option value="">اختر الشهر</option>
                                        <option value="1">كانون الثاني (يناير)</option>
                                        <option value="2">شباط (فبراير)</option>
                                        <option value="3">آذار (مارس)</option>
                                        <option value="4">نيسان (أبريل)</option>
                                        <option value="5">أيار (مايو)</option>
                                        <option value="6">حزيران (يونيو)</option>
                                        <option value="7">تموز (يوليو)</option>
                                        <option value="8">آب (أغسطس)</option>
                                        <option value="9">أيلول (سبتمبر)</option>
                                        <option value="10">تشرين الأول (أكتوبر)</option>
                                        <option value="11">تشرين الثاني (نوفمبر)</option>
                                        <option value="12">كانون الأول (ديسمبر)</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">الراتب الأساسي (دينار)</label>
                                    <input class="form-input" id="salary-base" readonly type="text" />
                                </div>
                                <div class="form-group">
                                    <label class="form-label">المبيعات الشهرية (دينار)</label>
                                    <div class="input-group">
                                        <input class="form-input" id="salary-sales" min="0" required="" step="1000" type="number" />
                                        <button class="btn btn-icon-sm mic-btn" data-input="salary-sales" type="button">
                                            <i class="fas fa-microphone"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">نسبة المبيعات (%)</label>
                                    <input class="form-input" id="salary-commission-rate" readonly type="text" />
                                </div>
                                <div class="form-group">
                                    <label class="form-label">مبلغ العمولة (دينار)</label>
                                    <input class="form-input" id="salary-commission-amount" readonly type="text" />
                                </div>
                                <div class="form-group">
                                    <label class="form-label">العلاوات (دينار)</label>
                                    <div class="input-group">
                                        <input class="form-input" id="salary-bonuses" min="0" type="number" value="0" />
                                        <button class="btn btn-icon-sm mic-btn" data-input="salary-bonuses" type="button">
                                            <i class="fas fa-microphone"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">الاستقطاعات (دينار)</label>
                                    <div class="input-group">
                                        <input class="form-input" id="salary-deductions" min="0" type="number" value="0" />
                                        <button class="btn btn-icon-sm mic-btn" data-input="salary-deductions" type="button">
                                            <i class="fas fa-microphone"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">ملاحظات</label>
                                <textarea class="form-input" id="salary-notes" rows="2"></textarea>
                            </div>
                            <div class="salary-summary">
                                <h4>إجمالي الراتب</h4>
                                <div class="salary-total" id="salary-total">0 دينار</div>
                                <div class="salary-calculation" id="salary-calculation"></div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline modal-close-btn">إلغاء</button>
                        <button class="btn btn-success" id="confirm-pay-salary-btn">صرف الراتب</button>
                    </div>
                </div>
            </div>
            
            <!-- نافذة عرض تفاصيل الموظف -->
            <div class="modal-overlay" id="employee-details-modal">
                <div class="modal animate__animated animate__fadeInUp">
                    <div class="modal-header">
                        <h3 class="modal-title">تفاصيل الموظف</h3>
                        <button class="modal-close">×</button>
                    </div>
                    <div class="modal-body">
                        <div id="employee-details-content">
                            <!-- سيتم ملؤها ديناميكياً -->
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline modal-close-btn">إغلاق</button>
                        <div class="btn-group">
                            <button class="btn btn-primary" id="edit-employee-btn">
                                <i class="fas fa-edit"></i>
                                <span>تعديل</span>
                            </button>
                            <button class="btn btn-success" id="employee-pay-salary-btn">
                                <i class="fas fa-money-bill-wave"></i>
                                <span>صرف راتب</span>
                            </button>
                            <button class="btn btn-danger" id="delete-employee-btn">
                                <i class="fas fa-trash"></i>
                                <span>حذف</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- نافذة عرض تفاصيل الراتب -->
            <div class="modal-overlay" id="salary-details-modal">
                <div class="modal animate__animated animate__fadeInUp">
                    <div class="modal-header">
                        <h3 class="modal-title">تفاصيل الراتب</h3>
                        <button class="modal-close">×</button>
                    </div>
                    <div class="modal-body">
                        <div id="salary-details-content">
                            <!-- سيتم ملؤها ديناميكياً -->
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline modal-close-btn">إغلاق</button>
                        <button class="btn btn-primary" id="print-salary-details-btn">
                            <i class="fas fa-print"></i>
                            <span>طباعة</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // إضافة النوافذ إلى نهاية الصفحة
        document.body.appendChild(modalsContainer);
    }

    /**
     * إضافة أنماط CSS الخاصة بإدارة الموظفين
     */
    function addEmployeesStyles() {
        // التحقق من عدم وجود الأنماط مسبقاً
        if (document.getElementById('employees-management-styles')) {
            console.log('أنماط الموظفين موجودة بالفعل');
            return;
        }
        
        // إنشاء عنصر نمط
        const styleElement = document.createElement('style');
        styleElement.id = 'employees-management-styles';
        
        // تعريف أنماط CSS
        styleElement.textContent = `
            /* أنماط تبويبات النموذج */
            .form-tab-btn {
                padding: 8px 16px;
                background: none;
                border: none;
                border-bottom: 2px solid transparent;
                cursor: pointer;
                font-weight: 500;
                color: #6c757d;
                transition: all 0.3s ease;
            }
            
            .form-tab-btn.active {
                color: #3b82f6;
                border-bottom-color: #3b82f6;
            }
            
            .form-tab-content {
                display: none;
                animation: fadeIn 0.3s ease;
            }
            
            .form-tab-content.active {
                display: block;
            }
            
            /* أنماط تحميل الملفات */
            .file-upload-container {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .file-preview {
                min-height: 80px;
                border: 1px dashed #ccc;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }
            
            .file-preview img {
                max-width: 100%;
                max-height: 100px;
                object-fit: contain;
            }
            
            /* أنماط ملخص الراتب */
            .salary-summary {
                margin-top: 20px;
                padding: 16px;
                background-color: #f8f9fa;
                border-radius: 8px;
                text-align: center;
            }
            
            .salary-total {
                font-size: 2rem;
                font-weight: 700;
                color: #3b82f6;
                margin: 10px 0;
            }
            
            .salary-calculation {
                font-size: 0.9rem;
                color: #6c757d;
            }
            
            /* أنماط بطاقة الموظف */
            .employee-profile {
                display: flex;
                align-items: center;
                margin-bottom: 24px;
            }
            
            .employee-photo {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                overflow: hidden;
                border: 3px solid #3b82f6;
                margin-left: 20px;
                background-color: #e9ecef;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .employee-photo img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .employee-photo-placeholder {
                font-size: 2.5rem;
                color: #adb5bd;
            }
            
            .employee-info {
                flex: 1;
            }
            
            .employee-name {
                font-size: 1.5rem;
                font-weight: 700;
                margin-bottom: 4px;
            }
            
            .employee-job-title {
                font-size: 1.1rem;
                color: #6c757d;
                margin-bottom: 8px;
            }
            
            .employee-status {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.85rem;
                font-weight: 500;
            }
            
            .employee-status.active {
                background-color: rgba(16, 185, 129, 0.1);
                color: #10b981;
            }
            
            .employee-status.inactive {
                background-color: rgba(239, 68, 68, 0.1);
                color: #ef4444;
            }
            
            /* أنماط بطاقة معلومات الموظف */
            .employee-details-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 24px;
                margin-bottom: 24px;
            }
            
            .employee-detail-card {
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 16px;
            }
            
            .employee-detail-card h4 {
                font-size: 1.1rem;
                font-weight: 600;
                margin-bottom: 16px;
                padding-bottom: 8px;
                border-bottom: 1px solid #e9ecef;
                color: #3b82f6;
            }
            
            .employee-detail-item {
                display: flex;
                margin-bottom: 8px;
            }
            
            .employee-detail-label {
                min-width: 120px;
                color: #6c757d;
                font-weight: 500;
            }
            
            .employee-detail-value {
                flex: 1;
                font-weight: 400;
            }
            
            /* أنماط بطاقة التوثيق */
            .documents-container {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                margin-top: 16px;
            }
            
            .document-card {
                border: 1px solid #e9ecef;
                border-radius: 8px;
                overflow: hidden;
            }
            
            .document-card-header {
                padding: 8px 12px;
                background-color: #f8f9fa;
                border-bottom: 1px solid #e9ecef;
                font-weight: 500;
            }
            
            .document-card-body {
                padding: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 150px;
            }
            
            .document-card-body img {
                max-width: 100%;
                max-height: 200px;
                object-fit: contain;
            }
            
            /* أنماط معلومات الراتب */
            #employee-salary-info {
                margin-bottom: 20px;
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 8px;
                border-right: 3px solid #3b82f6;
                display: none;
            }
            
            .employee-salary-header {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .employee-salary-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-color: #3b82f6;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                margin-left: 10px;
            }
            
            .employee-salary-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }
            
            .employee-salary-detail {
                display: flex;
                flex-direction: column;
            }
            
            .employee-salary-label {
                font-size: 0.85rem;
                color: #6c757d;
            }
            
            .employee-salary-value {
                font-weight: 600;
            }
            
            /* أنماط طباعة تفاصيل الراتب */
            .receipt-container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #e9ecef;
                border-radius: 8px;
            }
            
            .receipt-header {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #3b82f6;
            }
            
            .receipt-title {
                font-size: 1.5rem;
                font-weight: 700;
                margin-bottom: 5px;
                color: #3b82f6;
            }
            
            .receipt-subtitle {
                font-size: 1rem;
                color: #6c757d;
            }
            
            .receipt-employee {
                display: flex;
                margin-bottom: 20px;
            }
            
            .receipt-employee-info {
                flex: 1;
            }
            
            .receipt-employee-name {
                font-size: 1.2rem;
                font-weight: 600;
            }
            
            .receipt-employee-job {
                color: #6c757d;
            }
            
            .receipt-date {
                text-align: left;
            }
            
            .receipt-details {
                border: 1px solid #e9ecef;
                border-radius: 8px;
                overflow: hidden;
                margin-bottom: 20px;
            }
            
            .receipt-details table {
                width: 100%;
                border-collapse: collapse;
            }
            
            .receipt-details th,
            .receipt-details td {
                padding: 12px 15px;
                text-align: right;
                border-bottom: 1px solid #e9ecef;
            }
            
            .receipt-details th {
                background-color: #f8f9fa;
                font-weight: 600;
            }
            
            .receipt-details tr:last-child td {
                border-bottom: none;
            }
            
            .receipt-total {
                text-align: center;
                margin-top: 20px;
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 8px;
            }
            
            .receipt-total-amount {
                font-size: 1.5rem;
                font-weight: 700;
                color: #3b82f6;
            }

            /* إضافة نمط للموظفين في الجدول */
            .employee-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background-color: #3b82f6;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                margin-left: 10px;
            }

            .employee-info {
                display: flex;
                align-items: center;
            }

            .employee-actions {
                display: flex;
                gap: 5px;
            }

            .employee-action-btn {
                background: none;
                border: none;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s;
            }

            .employee-action-btn:hover {
                background-color: #f8f9fa;
            }

            .employee-action-btn.view {
                color: #6c757d;
            }

            .employee-action-btn.edit {
                color: #3b82f6;
            }

            .employee-action-btn.delete {
                color: #ef4444;
            }

            @media print {
                body * {
                    visibility: hidden;
                }
                
                .printable-content,
                .printable-content * {
                    visibility: visible;
                }
                
                .printable-content {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
                
                .no-print {
                    display: none !important;
                }
            }
        `; 
        
        // إضافة عنصر النمط إلى رأس الصفحة
        document.head.appendChild(styleElement);
    }

    /**
     * تهيئة مستمعي الأحداث
     */
    function initEmployeesEventListeners() {
        // مستمع زر إضافة موظف
        const addEmployeeBtn = document.getElementById('add-employee-btn');
        if (addEmployeeBtn) {
            addEmployeeBtn.addEventListener('click', function() {
                openModal('add-employee-modal');
            });
        }
        
        // مستمع زر صرف راتب
        const paySalaryBtn = document.getElementById('pay-salary-btn');
        if (paySalaryBtn) {
            paySalaryBtn.addEventListener('click', function() {
                openModal('pay-salary-modal');
                populateEmployeeSelect();
            });
        }
        
        // مستمعي أزرار تبويبات النموذج
        const formTabButtons = document.querySelectorAll('.form-tab-btn');
        if (formTabButtons.length > 0) {
            formTabButtons.forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    // إزالة الفئة النشطة من جميع الأزرار
                    document.querySelectorAll('.form-tab-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    
                    // إضافة الفئة النشطة للزر الحالي
                    this.classList.add('active');
                    
                    // تحديد معرف التبويب
                    const tabId = this.getAttribute('data-tab') + '-tab';
                    
                    // إخفاء جميع محتويات التبويبات
                    document.querySelectorAll('.form-tab-content').forEach(tab => {
                        tab.classList.remove('active');
                    });
                    
                    // إظهار محتوى التبويب المطلوب
                    const tabContent = document.getElementById(tabId);
                    if (tabContent) {
                        tabContent.classList.add('active');
                    }
                });
            });
        }
        
        // مستمعي أزرار تحميل الملفات
        setupFileUploadListeners();
        
        // مستمع زر حفظ الموظف
        const saveEmployeeBtn = document.getElementById('save-employee-btn');
        if (saveEmployeeBtn) {
            saveEmployeeBtn.addEventListener('click', addNewEmployee);
        }
        
        // مستمع تغيير الموظف في نموذج صرف الراتب
        const salaryEmployeeSelect = document.getElementById('salary-employee');
        if (salaryEmployeeSelect) {
            salaryEmployeeSelect.addEventListener('change', updateEmployeeSalaryInfo);
        }
        
        // مستمعي حساب الراتب النهائي
        const salaryInputs = document.querySelectorAll('#pay-salary-form input[type="number"]');
        if (salaryInputs.length > 0) {
            salaryInputs.forEach(input => {
                input.addEventListener('change', calculateTotalSalary);
                input.addEventListener('keyup', calculateTotalSalary);
            });
        }
        
        // مستمع زر تأكيد صرف الراتب
        const confirmPaySalaryBtn = document.getElementById('confirm-pay-salary-btn');
        if (confirmPaySalaryBtn) {
            confirmPaySalaryBtn.addEventListener('click', payEmployeeSalary);
        }
        
        // مستمع زر طباعة تفاصيل الراتب
        const printSalaryDetailsBtn = document.getElementById('print-salary-details-btn');
        if (printSalaryDetailsBtn) {
            printSalaryDetailsBtn.addEventListener('click', function() {
                window.print();
            });
        }
        
        // مستمعي أزرار إغلاق النوافذ المنبثقة
        document.querySelectorAll('.modal-close, .modal-close-btn').forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal-overlay');
                if (modal) {
                    closeModal(modal.id);
                }
            });
        });
        
        // إضافة مستمعي أزرار فلترة جدول الموظفين
        const filterButtons = document.querySelectorAll('.btn-group [data-filter]');
        if (filterButtons.length > 0) {
            filterButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // إزالة الفئة النشطة من جميع الأزرار
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    
                    // إضافة الفئة النشطة للزر الحالي
                    this.classList.add('active');
                    
                    // فلترة الجدول
                    const filter = this.getAttribute('data-filter');
                    filterEmployeesTable(filter);
                });
            });
        }
        
        // مستمع زر تصدير بيانات الموظفين
        const exportBtn = document.getElementById('export-employees-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportEmployeesData);
        }
        
        // مستمع زر تصدير بيانات الرواتب
        const exportSalariesBtn = document.getElementById('export-salaries-btn');
        if (exportSalariesBtn) {
            exportSalariesBtn.addEventListener('click', exportSalariesData);
        }
    }

    /**
     * إعداد مستمعي أحداث تحميل الملفات
     */
    function setupFileUploadListeners() {
        // تحميل صورة البطاقة الموحدة
        setupFileUpload('id-card-upload-btn', 'id-card-upload', 'id-card-preview');
        
        // تحميل صورة بطاقة السكن
        setupFileUpload('residence-card-upload-btn', 'residence-card-upload', 'residence-card-preview');
        
        // تحميل الصورة الشخصية
        setupFileUpload('employee-photo-upload-btn', 'employee-photo-upload', 'employee-photo-preview');
    }

    /**
     * إعداد تحميل الملفات
     * @param {string} buttonId - معرف زر التحميل
     * @param {string} inputId - معرف حقل الإدخال
     * @param {string} previewId - معرف عنصر المعاينة
     */
    function setupFileUpload(buttonId, inputId, previewId) {
        const uploadBtn = document.getElementById(buttonId);
        const fileInput = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        
        if (!uploadBtn || !fileInput || !preview) return;
        
        uploadBtn.addEventListener('click', function() {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    preview.innerHTML = `<img src="${e.target.result}" alt="Preview" />`;
                };
                
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    // المتغيرات الرئيسية
    let employees = [];
    let salaryTransactions = [];

    /**
     * تحميل بيانات الموظفين من التخزين المحلي
     */
    function loadEmployeesData() {
        try {
            const savedEmployees = localStorage.getItem('employees');
            if (savedEmployees) {
                employees = JSON.parse(savedEmployees);
                console.log(`تم تحميل ${employees.length} موظف`);
            } else {
                // إضافة بعض البيانات للعرض إذا لم تكن هناك بيانات سابقة
                addSampleEmployeesData();
            }
            
            const savedSalaryTransactions = localStorage.getItem('salaryTransactions');
            if (savedSalaryTransactions) {
                salaryTransactions = JSON.parse(savedSalaryTransactions);
                console.log(`تم تحميل ${salaryTransactions.length} عملية راتب`);
            }
            
            // تهيئة الجداول
            renderEmployeesTable();
            renderSalaryTransactionsTable();
        } catch (error) {
            console.error('خطأ في تحميل بيانات الموظفين:', error);
            showNotification('حدث خطأ أثناء تحميل بيانات الموظفين', 'error');
        }
    }

    /**
     * إضافة بيانات عينة للموظفين
     */
    function addSampleEmployeesData() {
        // إضافة بعض الموظفين للعرض
        if (employees.length === 0) {
            employees = [
                {
                    id: "1001",
                    name: "أحمد محمد",
                    phone: "07705551234",
                    address: "بغداد - الكرادة",
                    email: "ahmed@example.com",
                    jobTitle: "مدير المبيعات",
                    department: "sales",
                    baseSalary: 1200000,
                    commissionRate: 15,
                    hireDate: "2023-01-10",
                    contractType: "full-time",
                    idNumber: "A12345678",
                    status: "active",
                    createdAt: "2023-01-10T08:30:00.000Z"
                },
                {
                    id: "1002",
                    name: "مريم علي",
                    phone: "07706665555",
                    address: "بغداد - المنصور",
                    email: "mariam@example.com",
                    jobTitle: "محاسب",
                    department: "finance",
                    baseSalary: 900000,
                    commissionRate: 5,
                    hireDate: "2023-02-15",
                    contractType: "full-time",
                    idNumber: "B98765432",
                    status: "active",
                    createdAt: "2023-02-15T10:15:00.000Z"
                },
                {
                    id: "1003",
                    name: "حسين جاسم",
                    phone: "07707778888",
                    address: "بغداد - الكاظمية",
                    email: "hussein@example.com",
                    jobTitle: "مندوب مبيعات",
                    department: "sales",
                    baseSalary: 750000,
                    commissionRate: 10,
                    hireDate: "2023-03-01",
                    contractType: "full-time",
                    idNumber: "C45678901",
                    status: "active",
                    createdAt: "2023-03-01T09:00:00.000Z"
                }
            ];
            
            // حفظ البيانات
            saveEmployeesData();
        }
    }

   /**
     * حفظ بيانات الموظفين في التخزين المحلي
     */
    function saveEmployeesData() {
        try {
            localStorage.setItem('employees', JSON.stringify(employees));
            localStorage.setItem('salaryTransactions', JSON.stringify(salaryTransactions));
            console.log('تم حفظ بيانات الموظفين بنجاح');
            return true;
        } catch (error) {
            console.error('خطأ في حفظ بيانات الموظفين:', error);
            showNotification('حدث خطأ أثناء حفظ بيانات الموظفين', 'error');
            return false;
        }
    }

    /**
     * عرض جدول الموظفين
     */
    function renderEmployeesTable() {
        console.log('عرض جدول الموظفين...');
        
        const tableBody = document.querySelector('#employees-table tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        // ترتيب الموظفين حسب تاريخ الإضافة (الأحدث أولاً)
        const sortedEmployees = [...employees].sort((a, b) => {
            return new Date(b.createdAt || b.hireDate) - new Date(a.createdAt || a.hireDate);
        });
        
        sortedEmployees.forEach(employee => {
            const row = document.createElement('tr');
            
            // تنسيق النسبة المئوية
            const commissionRate = employee.commissionRate || 0;
            
            // تنسيق تاريخ التعيين
            const hireDate = employee.hireDate || '';
            
            // حالة الموظف
            const statusClass = employee.status === 'inactive' ? 'danger' : 'success';
            const statusText = employee.status === 'inactive' ? 'غير نشط' : 'نشط';
            
            row.innerHTML = `
                <td>${employee.id}</td>
                <td>
                    <div class="employee-info">
                        <div class="employee-avatar">${employee.name.charAt(0)}</div>
                        <div>
                            <div class="employee-name">${employee.name}</div>
                            <div class="employee-phone">${employee.phone}</div>
                        </div>
                    </div>
                </td>
                <td>${employee.jobTitle}</td>
                <td>${employee.phone}</td>
                <td>${formatCurrency(employee.baseSalary || 0)}</td>
                <td>${commissionRate}%</td>
                <td>${hireDate}</td>
                <td><span class="badge badge-${statusClass}">${statusText}</span></td>
                <td>
                    <div class="employee-actions">
                        <button class="employee-action-btn view-employee" data-id="${employee.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="employee-action-btn edit edit-employee" data-id="${employee.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="employee-action-btn delete delete-employee" data-id="${employee.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
            
            // إضافة مستمعي الأحداث للأزرار
            const viewButton = row.querySelector('.view-employee');
            const editButton = row.querySelector('.edit-employee');
            const deleteButton = row.querySelector('.delete-employee');
            
            if (viewButton) {
                viewButton.addEventListener('click', () => {
                    showEmployeeDetails(employee.id);
                });
            }
            
            if (editButton) {
                editButton.addEventListener('click', () => {
                    editEmployee(employee.id);
                });
            }
            
            if (deleteButton) {
                deleteButton.addEventListener('click', () => {
                    deleteEmployee(employee.id);
                });
            }
        });
        
        if (sortedEmployees.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="9" class="text-center">لا يوجد موظفين</td>';
            tableBody.appendChild(emptyRow);
        }
    }

    /**
     * فلترة جدول الموظفين
     * @param {string} filter - نوع الفلتر (all, active, inactive)
     */
    function filterEmployeesTable(filter) {
        const rows = document.querySelectorAll('#employees-table tbody tr');
        
        rows.forEach(row => {
            const statusCell = row.querySelector('td:nth-child(8)');
            
            if (!statusCell) return;
            
            const statusText = statusCell.textContent.trim();
            
            if (filter === 'all') {
                row.style.display = '';
            } else if (filter === 'active' && statusText === 'نشط') {
                row.style.display = '';
            } else if (filter === 'inactive' && statusText === 'غير نشط') {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    /**
     * عرض جدول معاملات الرواتب
     */
    function renderSalaryTransactionsTable() {
        console.log('عرض جدول معاملات الرواتب...');
        
        const tableBody = document.querySelector('#salary-transactions-table tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        // ترتيب المعاملات حسب التاريخ (الأحدث أولاً)
        const sortedTransactions = [...salaryTransactions].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        sortedTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            
            // تنسيق النسبة المئوية
            const commissionRate = transaction.commissionRate || 0;
            
            row.innerHTML = `
                <td>${transaction.id}</td>
                <td>${transaction.employeeName}</td>
                <td>${transaction.date}</td>
                <td>${formatCurrency(transaction.baseSalary || 0)}</td>
                <td>${formatCurrency(transaction.sales || 0)}</td>
                <td>${commissionRate}%</td>
                <td>${formatCurrency(transaction.commissionAmount || 0)}</td>
                <td>${formatCurrency(transaction.bonuses || 0)}</td>
                <td>${formatCurrency(transaction.deductions || 0)}</td>
                <td>${formatCurrency(transaction.totalSalary || 0)}</td>
                <td>
                    <div class="employee-actions">
                        <button class="employee-action-btn view-salary" data-id="${transaction.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="employee-action-btn print-salary" data-id="${transaction.id}">
                            <i class="fas fa-print"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
            
            // إضافة مستمعي الأحداث للأزرار
            const viewButton = row.querySelector('.view-salary');
            const printButton = row.querySelector('.print-salary');
            
            if (viewButton) {
                viewButton.addEventListener('click', () => {
                    showSalaryDetails(transaction.id);
                });
            }
            
            if (printButton) {
                printButton.addEventListener('click', () => {
                    showSalaryDetails(transaction.id, true);
                });
            }
        });
        
        if (sortedTransactions.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="11" class="text-center">لا يوجد معاملات رواتب</td>';
            tableBody.appendChild(emptyRow);
        }
    }

    /**
     * ملء قائمة الموظفين في نموذج صرف الراتب
     */
    function populateEmployeeSelect() {
        const employeeSelect = document.getElementById('salary-employee');
        if (!employeeSelect) return;
        
        // تفريغ القائمة
        employeeSelect.innerHTML = '<option value="">اختر الموظف</option>';
        
        // ترتيب الموظفين أبجدياً
        const sortedEmployees = [...employees]
            .filter(employee => employee.status !== 'inactive')
            .sort((a, b) => a.name.localeCompare(b.name));
        
        // إضافة الموظفين إلى القائمة
        sortedEmployees.forEach(employee => {
            const option = document.createElement('option');
            option.value = employee.id;
            option.textContent = `${employee.name} (${employee.jobTitle})`;
            employeeSelect.appendChild(option);
        });
    }

    /**
     * تحديث معلومات راتب الموظف في نموذج صرف الراتب
     */
    function updateEmployeeSalaryInfo() {
        const employeeSelect = document.getElementById('salary-employee');
        const salaryInfoContainer = document.getElementById('employee-salary-info');
        
        if (!employeeSelect || !salaryInfoContainer) return;
        
        const employeeId = employeeSelect.value;
        
        if (!employeeId) {
            salaryInfoContainer.style.display = 'none';
            return;
        }
        
        const employee = employees.find(emp => emp.id === employeeId);
        if (!employee) {
            salaryInfoContainer.style.display = 'none';
            return;
        }
        
        // تحديث معلومات الموظف
        salaryInfoContainer.innerHTML = `
            <div class="employee-salary-header">
                <div class="employee-salary-avatar">${employee.name.charAt(0)}</div>
                <div>
                    <h4>${employee.name}</h4>
                    <span>${employee.jobTitle}</span>
                </div>
            </div>
            <div class="employee-salary-details">
                <div class="employee-salary-detail">
                    <span class="employee-salary-label">الراتب الأساسي</span>
                    <span class="employee-salary-value">${formatCurrency(employee.baseSalary || 0)}</span>
                </div>
                <div class="employee-salary-detail">
                    <span class="employee-salary-label">نسبة المبيعات</span>
                    <span class="employee-salary-value">${employee.commissionRate || 0}%</span>
                </div>
                <div class="employee-salary-detail">
                    <span class="employee-salary-label">تاريخ التعيين</span>
                    <span class="employee-salary-value">${employee.hireDate || ''}</span>
                </div>
                <div class="employee-salary-detail">
                    <span class="employee-salary-label">القسم</span>
                    <span class="employee-salary-value">${getArabicDepartment(employee.department)}</span>
                </div>
            </div>
        `;
        
        // عرض معلومات الموظف
        salaryInfoContainer.style.display = 'block';
        
        // تحديث قيم النموذج
        document.getElementById('salary-base').value = employee.baseSalary || 0;
        document.getElementById('salary-commission-rate').value = employee.commissionRate || 0;
        
        // تعيين التاريخ الحالي إذا لم يكن محدداً
        const salaryDateInput = document.getElementById('salary-date');
        if (salaryDateInput && !salaryDateInput.value) {
            salaryDateInput.value = new Date().toISOString().split('T')[0];
        }
        
        // تعيين الشهر الحالي
        const salaryMonthSelect = document.getElementById('salary-month');
        if (salaryMonthSelect && !salaryMonthSelect.value) {
            const currentMonth = new Date().getMonth() + 1; // الأشهر تبدأ من 0
            salaryMonthSelect.value = currentMonth.toString();
        }
        
        // إعادة حساب الراتب الإجمالي
        calculateTotalSalary();
    }

    /**
     * حساب إجمالي الراتب
     */
    function calculateTotalSalary() {
        const baseSalary = parseFloat(document.getElementById('salary-base').value) || 0;
        const sales = parseFloat(document.getElementById('salary-sales').value) || 0;
        const commissionRate = parseFloat(document.getElementById('salary-commission-rate').value) || 0;
        const bonuses = parseFloat(document.getElementById('salary-bonuses').value) || 0;
        const deductions = parseFloat(document.getElementById('salary-deductions').value) || 0;
        
        // حساب مبلغ العمولة
        const commissionAmount = sales * (commissionRate / 100);
        
        // حساب إجمالي الراتب
        const totalSalary = baseSalary + commissionAmount + bonuses - deductions;
        
        // تحديث حقل مبلغ العمولة
        document.getElementById('salary-commission-amount').value = commissionAmount.toFixed(0);
        
        // تحديث عرض إجمالي الراتب
        document.getElementById('salary-total').textContent = formatCurrency(totalSalary);
        
        // تحديث تفاصيل حساب الراتب
        document.getElementById('salary-calculation').innerHTML = `
            الراتب الأساسي (${formatCurrency(baseSalary)}) + 
            عمولة المبيعات (${formatCurrency(sales)} × ${commissionRate}% = ${formatCurrency(commissionAmount)}) + 
            العلاوات (${formatCurrency(bonuses)}) - 
            الاستقطاعات (${formatCurrency(deductions)})
        `;
    }

    /**
     * إضافة موظف جديد
     */
    function addNewEmployee() {
        console.log('إضافة موظف جديد...');
        
        // جمع بيانات الموظف من النموذج
        const employeeData = collectEmployeeFormData();
        
        if (!employeeData) {
            showNotification('يرجى إدخال جميع البيانات المطلوبة بشكل صحيح', 'error');
            return;
        }
        
        // إضافة معرف فريد وتاريخ الإنشاء
        employeeData.id = Date.now().toString();
        employeeData.createdAt = new Date().toISOString();
        employeeData.status = 'active';
        
        // إضافة الموظف إلى المصفوفة
        employees.push(employeeData);
        
        // حفظ البيانات
        saveEmployeesData();
        
        // تحديث الجدول
        renderEmployeesTable();
        
        // إغلاق النافذة المنبثقة
        closeModal('add-employee-modal');
        
        // عرض إشعار النجاح
        showNotification(`تم إضافة الموظف ${employeeData.name} بنجاح!`, 'success');
    }

    /**
     * جمع بيانات الموظف من النموذج
     * @returns {Object|null} بيانات الموظف أو null إذا كانت البيانات غير صالحة
     */
    function collectEmployeeFormData() {
        // البيانات الشخصية
        const name = document.getElementById('employee-name')?.value.trim();
        const phone = document.getElementById('employee-phone')?.value.trim();
        const address = document.getElementById('employee-address')?.value.trim();
        const email = document.getElementById('employee-email')?.value.trim();
        const birthdate = document.getElementById('employee-birthdate')?.value;
        const gender = document.getElementById('employee-gender')?.value;
        
        // البيانات الوظيفية
        const jobTitle = document.getElementById('employee-job-title')?.value.trim();
        const department = document.getElementById('employee-department')?.value;
        const baseSalary = parseFloat(document.getElementById('employee-base-salary')?.value);
        const commissionRate = parseFloat(document.getElementById('employee-commission-rate')?.value);
        const hireDate = document.getElementById('employee-hire-date')?.value;
        const contractType = document.getElementById('employee-contract-type')?.value;
        
        // بيانات المستندات
        const idNumber = document.getElementById('employee-id-number')?.value.trim();
        const residenceCard = document.getElementById('employee-residence-card')?.value.trim();
        const notes = document.getElementById('employee-notes')?.value.trim();
        
        // التحقق من البيانات المطلوبة
        if (!name || !phone || !address || !jobTitle || !baseSalary || isNaN(baseSalary) || 
            !commissionRate || isNaN(commissionRate) || !hireDate || !idNumber) {
            return null;
        }
        
        // جمع بيانات الصور
        const idCardPreview = document.getElementById('id-card-preview');
        const residenceCardPreview = document.getElementById('residence-card-preview');
        const employeePhotoPreview = document.getElementById('employee-photo-preview');
        
        // استخراج بيانات الصور إذا وجدت
        const idCardImage = idCardPreview?.querySelector('img') ? 
            idCardPreview.querySelector('img').src : '';
        
        const residenceCardImage = residenceCardPreview?.querySelector('img') ? 
            residenceCardPreview.querySelector('img').src : '';
        
        const photoImage = employeePhotoPreview?.querySelector('img') ? 
            employeePhotoPreview.querySelector('img').src : '';
        
        // إنشاء كائن الموظف
        return {
            name,
            phone,
            address,
            email,
            birthdate,
            gender,
            jobTitle,
            department,
            baseSalary,
            commissionRate,
            hireDate,
            contractType,
            idNumber,
            residenceCard,
            notes,
            documents: {
                idCard: idCardImage,
                residenceCard: residenceCardImage,
                photo: photoImage
            }
        };
    }

    /**
     * عرض تفاصيل الموظف
     * @param {string} employeeId - معرف الموظف
     */
    function showEmployeeDetails(employeeId) {
        console.log(`عرض تفاصيل الموظف: ${employeeId}`);
        
        const employee = employees.find(emp => emp.id === employeeId);
        if (!employee) {
            showNotification('لم يتم العثور على الموظف', 'error');
            return;
        }
        
        // التحقق من وجود صورة للموظف
        const hasPhoto = employee.documents && employee.documents.photo;
        
        // إنشاء محتوى النافذة المنبثقة
        const content = `
            <div class="employee-profile">
                <div class="employee-photo">
                    ${hasPhoto ? 
                        `<img src="${employee.documents.photo}" alt="${employee.name}" />` : 
                        `<div class="employee-photo-placeholder"><i class="fas fa-user"></i></div>`
                    }
                </div>
                <div class="employee-info">
                    <h2 class="employee-name">${employee.name}</h2>
                    <p class="employee-job-title">${employee.jobTitle}</p>
                    <span class="employee-status ${employee.status}">${employee.status === 'active' ? 'نشط' : 'غير نشط'}</span>
                </div>
            </div>
            
            <div class="employee-details-grid">
                <div class="employee-detail-card">
                    <h4><i class="fas fa-user"></i> معلومات شخصية</h4>
                    <div class="employee-detail-item">
                        <div class="employee-detail-label">رقم الهاتف</div>
                        <div class="employee-detail-value">${employee.phone}</div>
                    </div>
                    <div class="employee-detail-item">
                        <div class="employee-detail-label">العنوان</div>
                        <div class="employee-detail-value">${employee.address || 'غير محدد'}</div>
                    </div>
                    <div class="employee-detail-item">
                        <div class="employee-detail-label">البريد الإلكتروني</div>
                        <div class="employee-detail-value">${employee.email || 'غير محدد'}</div>
                    </div>
                    <div class="employee-detail-item">
                        <div class="employee-detail-label">تاريخ الميلاد</div>
                        <div class="employee-detail-value">${employee.birthdate || 'غير محدد'}</div>
                    </div>
                    <div class="employee-detail-item">
                        <div class="employee-detail-label">الجنس</div>
                        <div class="employee-detail-value">${employee.gender === 'male' ? 'ذكر' : 'أنثى'}</div>
                    </div>
                </div>
                
                <div class="employee-detail-card">
                    <h4><i class="fas fa-briefcase"></i> معلومات وظيفية</h4>
                    <div class="employee-detail-item">
                        <div class="employee-detail-label">المسمى الوظيفي</div>
                        <div class="employee-detail-value">${employee.jobTitle}</div>
                    </div>
                    <div class="employee-detail-item">
                        <div class="employee-detail-label">القسم</div>
                        <div class="employee-detail-value">${getArabicDepartment(employee.department)}</div>
                    </div>
                    <div class="employee-detail-item">
                        <div class="employee-detail-label">تاريخ التعيين</div>
                        <div class="employee-detail-value">${employee.hireDate || 'غير محدد'}</div>
                    </div>
                    <div class="employee-detail-item">
                        <div class="employee-detail-label">نوع العقد</div>
                        <div class="employee-detail-value">${getArabicContractType(employee.contractType)}</div>
                    </div>
                    <div class="employee-detail-item">
                        <div class="employee-detail-label">الراتب الأساسي</div>
                        <div class="employee-detail-value">${formatCurrency(employee.baseSalary || 0)}</div>
                    </div>
                    <div class="employee-detail-item">
                        <div class="employee-detail-label">نسبة المبيعات</div>
                        <div class="employee-detail-value">${employee.commissionRate || 0}%</div>
                    </div>
                </div>
            </div>
            
            <div class="employee-detail-card">
                <h4><i class="fas fa-id-card"></i> المستندات والوثائق</h4>
                <div class="employee-detail-item">
                    <div class="employee-detail-label">رقم البطاقة الموحدة</div>
                    <div class="employee-detail-value">${employee.idNumber || 'غير محدد'}</div>
                </div>
                <div class="employee-detail-item">
                    <div class="employee-detail-label">رقم بطاقة السكن</div>
                    <div class="employee-detail-value">${employee.residenceCard || 'غير محدد'}</div>
                </div>
                
                <div class="documents-container">
                    ${employee.documents && employee.documents.idCard ? `
                    <div class="document-card">
                        <div class="document-card-header">البطاقة الموحدة</div>
                        <div class="document-card-body">
                            <img src="${employee.documents.idCard}" alt="بطاقة موحدة" />
                        </div>
                    </div>
                    ` : ''}
                    
                    ${employee.documents && employee.documents.residenceCard ? `
                    <div class="document-card">
                        <div class="document-card-header">بطاقة السكن</div>
                        <div class="document-card-body">
                            <img src="${employee.documents.residenceCard}" alt="بطاقة السكن" />
                        </div>
                    </div>
                    ` : ''}
                </div>
                
                ${employee.notes ? `
                <div class="employee-detail-item" style="margin-top: 15px;">
                    <div class="employee-detail-label">ملاحظات</div>
                    <div class="employee-detail-value">${employee.notes}</div>
                </div>
                ` : ''}
            </div>
            
            <div class="employee-detail-card">
                <h4><i class="fas fa-history"></i> سجل الرواتب</h4>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>الشهر</th>
                                <th>المبيعات</th>
                                <th>العمولة</th>
                                <th>الراتب النهائي</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${getSalaryHistoryForEmployee(employeeId)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // عرض النافذة المنبثقة
        openModal('employee-details-modal');
        
        // تحديث محتوى النافذة
        const contentContainer = document.getElementById('employee-details-content');
        if (contentContainer) {
            contentContainer.innerHTML = content;
        }
        
        // تحديث عنوان النافذة
        const modalTitle = document.querySelector('#employee-details-modal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = `تفاصيل الموظف - ${employee.name}`;
        }
        
        // إضافة مستمعي الأحداث للأزرار
        const editButton = document.getElementById('edit-employee-btn');
        const paySalaryButton = document.getElementById('employee-pay-salary-btn');
        const deleteButton = document.getElementById('delete-employee-btn');
        
        if (editButton) {
            editButton.setAttribute('data-id', employeeId);
            editButton.addEventListener('click', function() {
                closeModal('employee-details-modal');
                editEmployee(employeeId);
            });
        }
        
        if (paySalaryButton) {
            paySalaryButton.setAttribute('data-id', employeeId);
            paySalaryButton.addEventListener('click', function() {
                closeModal('employee-details-modal');
                openPaySalaryModalForEmployee(employeeId);
            });
        }
        
        if (deleteButton) {
            deleteButton.setAttribute('data-id', employeeId);
            deleteButton.addEventListener('click', function() {
                closeModal('employee-details-modal');
                deleteEmployee(employeeId);
            });
        }
    }

    /**
     * الحصول على سجل رواتب الموظف بتنسيق HTML
     * @param {string} employeeId - معرف الموظف
     * @returns {string} - سجل الرواتب بتنسيق HTML
     */
    function getSalaryHistoryForEmployee(employeeId) {
        // تصفية المعاملات للموظف المحدد
        const employeeSalaries = salaryTransactions.filter(transaction => 
            transaction.employeeId === employeeId
        );
        
        // ترتيب المعاملات حسب التاريخ (الأحدث أولاً)
        employeeSalaries.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // إذا لم تكن هناك معاملات، عرض رسالة فارغة
        if (employeeSalaries.length === 0) {
            return '<tr><td colspan="5" class="text-center">لا يوجد سجل رواتب</td></tr>';
        }
        
        // إنشاء صفوف الجدول
        return employeeSalaries.map(salary => `
            <tr>
                <td>${salary.date}</td>
                <td>${getArabicMonthName(salary.month)}</td>
                <td>${formatCurrency(salary.sales || 0)}</td>
                <td>${formatCurrency(salary.commissionAmount || 0)}</td>
                <td>${formatCurrency(salary.totalSalary || 0)}</td>
            </tr>
        `).join('');
    }

  /**
     * فتح نافذة صرف راتب لموظف محدد
     * @param {string} employeeId - معرف الموظف
     */
    function openPaySalaryModalForEmployee(employeeId) {
        // فتح نافذة صرف الراتب
        openModal('pay-salary-modal');
        
        // تعبئة قائمة الموظفين أولاً
        populateEmployeeSelect();
        
        // تحديد الموظف في القائمة
        const employeeSelect = document.getElementById('salary-employee');
        if (employeeSelect) {
            employeeSelect.value = employeeId;
            
            // تحديث معلومات الموظف
            updateEmployeeSalaryInfo();
        }
    }

    /**
     * دفع راتب الموظف
     */
    function payEmployeeSalary() {
        // جمع بيانات الراتب من النموذج
        const employeeId = document.getElementById('salary-employee').value;
        const salaryDate = document.getElementById('salary-date').value;
        const salaryMonth = document.getElementById('salary-month').value;
        const baseSalary = parseFloat(document.getElementById('salary-base').value) || 0;
        const sales = parseFloat(document.getElementById('salary-sales').value) || 0;
        const commissionRate = parseFloat(document.getElementById('salary-commission-rate').value) || 0;
        const commissionAmount = parseFloat(document.getElementById('salary-commission-amount').value) || 0;
        const bonuses = parseFloat(document.getElementById('salary-bonuses').value) || 0;
        const deductions = parseFloat(document.getElementById('salary-deductions').value) || 0;
        const notes = document.getElementById('salary-notes').value.trim();
        
        // التحقق من البيانات المطلوبة
        if (!employeeId || !salaryDate || !salaryMonth || !baseSalary || isNaN(sales)) {
            showNotification('يرجى إدخال جميع البيانات المطلوبة بشكل صحيح', 'error');
            return;
        }
        
        // الحصول على بيانات الموظف
        const employee = employees.find(emp => emp.id === employeeId);
        if (!employee) {
            showNotification('لم يتم العثور على الموظف', 'error');
            return;
        }
        
        // حساب إجمالي الراتب
        const totalSalary = baseSalary + commissionAmount + bonuses - deductions;
        
        // إنشاء معاملة الراتب
        const salaryTransaction = {
            id: Date.now().toString(),
            employeeId,
            employeeName: employee.name,
            date: salaryDate,
            month: salaryMonth,
            baseSalary,
            sales,
            commissionRate,
            commissionAmount,
            bonuses,
            deductions,
            totalSalary,
            notes,
            createdAt: new Date().toISOString()
        };
        
        // إضافة المعاملة إلى المصفوفة
        salaryTransactions.push(salaryTransaction);
        
        // حفظ البيانات
        saveEmployeesData();
        
        // تحديث جدول معاملات الرواتب
        renderSalaryTransactionsTable();
        
        // إغلاق النافذة المنبثقة
        closeModal('pay-salary-modal');
        
        // عرض إشعار النجاح
        showNotification(`تم صرف راتب الموظف ${employee.name} بنجاح!`, 'success');
        
        // عرض تفاصيل الراتب
        showSalaryDetails(salaryTransaction.id);
    }

    /**
     * عرض تفاصيل الراتب
     * @param {string} transactionId - معرف معاملة الراتب
     * @param {boolean} printAfterShow - ما إذا كان يجب طباعة التفاصيل بعد العرض
     */
    function showSalaryDetails(transactionId, printAfterShow = false) {
        console.log(`عرض تفاصيل الراتب: ${transactionId}`);
        
        const transaction = salaryTransactions.find(tr => tr.id === transactionId);
        if (!transaction) {
            showNotification('لم يتم العثور على معاملة الراتب', 'error');
            return;
        }
        
        // الحصول على بيانات الموظف
        const employee = employees.find(emp => emp.id === transaction.employeeId);
        
        // إنشاء محتوى النافذة المنبثقة
        const content = `
            <div class="receipt-container printable-content">
                <div class="receipt-header">
                    <h1 class="receipt-title">إيصال صرف راتب</h1>
                    <p class="receipt-subtitle">نظام الاستثمار المتكامل</p>
                </div>
                
                <div class="receipt-employee">
                    <div class="receipt-employee-info">
                        <h3 class="receipt-employee-name">${transaction.employeeName}</h3>
                        <p class="receipt-employee-job">${employee ? employee.jobTitle : 'موظف'}</p>
                    </div>
                    <div class="receipt-date">
                        <p>تاريخ الصرف: ${transaction.date}</p>
                        <p>الشهر: ${getArabicMonthName(transaction.month)}</p>
                    </div>
                </div>
                
                <div class="receipt-details">
                    <table>
                        <tr>
                            <th>البند</th>
                            <th>القيمة</th>
                        </tr>
                        <tr>
                            <td>الراتب الأساسي</td>
                            <td>${formatCurrency(transaction.baseSalary || 0)}</td>
                        </tr>
                        <tr>
                            <td>المبيعات</td>
                            <td>${formatCurrency(transaction.sales || 0)}</td>
                        </tr>
                        <tr>
                            <td>نسبة العمولة</td>
                            <td>${transaction.commissionRate || 0}%</td>
                        </tr>
                        <tr>
                            <td>مبلغ العمولة</td>
                            <td>${formatCurrency(transaction.commissionAmount || 0)}</td>
                        </tr>
                        <tr>
                            <td>العلاوات</td>
                            <td>${formatCurrency(transaction.bonuses || 0)}</td>
                        </tr>
                        <tr>
                            <td>الاستقطاعات</td>
                            <td>${formatCurrency(transaction.deductions || 0)}</td>
                        </tr>
                    </table>
                </div>
                
                <div class="receipt-total">
                    <p>إجمالي الراتب</p>
                    <h2 class="receipt-total-amount">${formatCurrency(transaction.totalSalary || 0)}</h2>
                </div>
                
                ${transaction.notes ? `
                <div class="receipt-notes" style="margin-top: 20px; padding: 10px; border: 1px dashed #e0e0e0; border-radius: 4px;">
                    <p style="margin: 0;"><strong>ملاحظات:</strong> ${transaction.notes}</p>
                </div>
                ` : ''}
                
                <div class="receipt-signature">
                    <div class="signature-box">
                        <p>توقيع الموظف</p>
                    </div>
                    <div class="signature-box">
                        <p>توقيع المدير</p>
                    </div>
                </div>
                
                <div class="receipt-footer">
                    <p>تم إصدار هذا الإيصال بواسطة نظام الاستثمار المتكامل</p>
                    <p>رقم المعاملة: ${transaction.id}</p>
                </div>
            </div>
            
            <div class="no-print" style="margin-top: 20px; text-align: center;">
                <button class="btn btn-primary" id="print-this-salary-btn" style="min-width: 150px;">
                    <i class="fas fa-print"></i>
                    <span>طباعة الإيصال</span>
                </button>
            </div>
        `;
        
        // عرض النافذة المنبثقة
        openModal('salary-details-modal');
        
        // تحديث محتوى النافذة
        const contentContainer = document.getElementById('salary-details-content');
        if (contentContainer) {
            contentContainer.innerHTML = content;
        }
        
        // تحديث عنوان النافذة
        const modalTitle = document.querySelector('#salary-details-modal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = `تفاصيل راتب - ${transaction.employeeName}`;
        }
        
        // إضافة مستمع حدث لزر الطباعة داخل التفاصيل
        const printButton = document.getElementById('print-this-salary-btn');
        if (printButton) {
            printButton.addEventListener('click', function() {
                window.print();
            });
        }
        
        // طباعة التفاصيل تلقائياً إذا كان مطلوباً
        if (printAfterShow) {
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }

    /**
     * تعديل بيانات موظف
     * @param {string} employeeId - معرف الموظف
     */
    function editEmployee(employeeId) {
        console.log(`تعديل الموظف: ${employeeId}`);
        
        const employee = employees.find(emp => emp.id === employeeId);
        if (!employee) {
            showNotification('لم يتم العثور على الموظف', 'error');
            return;
        }
        
        // فتح نافذة إضافة موظف
        openModal('add-employee-modal');
        
        // تعبئة النموذج ببيانات الموظف
        document.getElementById('employee-name').value = employee.name || '';
        document.getElementById('employee-phone').value = employee.phone || '';
        document.getElementById('employee-address').value = employee.address || '';
        document.getElementById('employee-email').value = employee.email || '';
        document.getElementById('employee-birthdate').value = employee.birthdate || '';
        document.getElementById('employee-gender').value = employee.gender || 'male';
        document.getElementById('employee-job-title').value = employee.jobTitle || '';
        document.getElementById('employee-department').value = employee.department || 'sales';
        document.getElementById('employee-base-salary').value = employee.baseSalary || '';
        document.getElementById('employee-commission-rate').value = employee.commissionRate || '';
        document.getElementById('employee-hire-date').value = employee.hireDate || '';
        document.getElementById('employee-contract-type').value = employee.contractType || 'full-time';
        document.getElementById('employee-id-number').value = employee.idNumber || '';
        document.getElementById('employee-residence-card').value = employee.residenceCard || '';
        document.getElementById('employee-notes').value = employee.notes || '';
        
        // عرض الصور إذا كانت موجودة
        if (employee.documents) {
            if (employee.documents.idCard) {
                document.getElementById('id-card-preview').innerHTML = `<img src="${employee.documents.idCard}" alt="بطاقة موحدة" />`;
            }
            
            if (employee.documents.residenceCard) {
                document.getElementById('residence-card-preview').innerHTML = `<img src="${employee.documents.residenceCard}" alt="بطاقة السكن" />`;
            }
            
            if (employee.documents.photo) {
                document.getElementById('employee-photo-preview').innerHTML = `<img src="${employee.documents.photo}" alt="صورة شخصية" />`;
            }
        }
        
        // تغيير عنوان النافذة
        const modalTitle = document.querySelector('#add-employee-modal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'تعديل بيانات الموظف';
        }
        
        // تغيير نص زر الحفظ
        const saveButton = document.getElementById('save-employee-btn');
        if (saveButton) {
            saveButton.textContent = 'حفظ التعديلات';
            
            // حفظ الوظيفة الأصلية
            const originalClickHandler = saveButton.onclick;
            
            // تعيين وظيفة جديدة
            saveButton.onclick = function() {
                // جمع البيانات المحدثة
                const updatedEmployeeData = collectEmployeeFormData();
                
                if (!updatedEmployeeData) {
                    showNotification('يرجى إدخال جميع البيانات المطلوبة بشكل صحيح', 'error');
                    return;
                }
                
                // تحديث بيانات الموظف مع الاحتفاظ بالبيانات الأصلية
                updatedEmployeeData.id = employee.id;
                updatedEmployeeData.createdAt = employee.createdAt;
                updatedEmployeeData.status = employee.status;
                
                // تحديث الموظف في المصفوفة
                const employeeIndex = employees.findIndex(emp => emp.id === employeeId);
                if (employeeIndex !== -1) {
                    employees[employeeIndex] = updatedEmployeeData;
                    
                    // حفظ البيانات
                    saveEmployeesData();
                    
                    // تحديث الجدول
                    renderEmployeesTable();
                    
                    // إغلاق النافذة المنبثقة
                    closeModal('add-employee-modal');
                    
                    // عرض إشعار النجاح
                    showNotification(`تم تحديث بيانات الموظف ${updatedEmployeeData.name} بنجاح!`, 'success');
                }
                
                // إعادة تعيين زر الحفظ إلى الوضع الأصلي
                saveButton.textContent = 'إضافة';
                saveButton.onclick = originalClickHandler;
            };
        }
    }

    /**
     * حذف موظف
     * @param {string} employeeId - معرف الموظف
     */
    function deleteEmployee(employeeId) {
        console.log(`حذف الموظف: ${employeeId}`);
        
        const employee = employees.find(emp => emp.id === employeeId);
        if (!employee) {
            showNotification('لم يتم العثور على الموظف', 'error');
            return;
        }
        
        // تأكيد الحذف
        if (!confirm(`هل أنت متأكد من رغبتك في حذف الموظف ${employee.name}؟\nسيتم حذف جميع بيانات الرواتب المرتبطة به.`)) {
            return;
        }
        
        // حذف الموظف
        employees = employees.filter(emp => emp.id !== employeeId);
        
        // حذف سجلات الرواتب المرتبطة بالموظف
        salaryTransactions = salaryTransactions.filter(transaction => transaction.employeeId !== employeeId);
        
        // حفظ البيانات
        saveEmployeesData();
        
        // تحديث الجدول
        renderEmployeesTable();
        
        // تحديث جدول معاملات الرواتب إذا كان معروضاً
        if (document.querySelector('#salary-transactions-tab.active')) {
            renderSalaryTransactionsTable();
        }
        
        // عرض إشعار النجاح
        showNotification(`تم حذف الموظف ${employee.name} بنجاح!`, 'success');
    }

    /**
     * عرض تقارير الموظفين
     */
    function renderEmployeesReports() {
        console.log('عرض تقارير الموظفين...');
        
        // تهيئة الرسوم البيانية
        renderEmployeesSalariesChart();
        renderEmployeesPerformanceChart();
    }

    /**
     * عرض الرسم البياني لرواتب الموظفين
     */
    function renderEmployeesSalariesChart() {
        const chartCanvas = document.getElementById('employees-salaries-chart');
        if (!chartCanvas || typeof Chart === 'undefined') return;
        
        // حساب إجمالي الرواتب لكل موظف
        const employeeTotals = {};
        
        // تجميع الرواتب حسب الموظف
        salaryTransactions.forEach(transaction => {
            if (!employeeTotals[transaction.employeeId]) {
                employeeTotals[transaction.employeeId] = {
                    name: transaction.employeeName,
                    baseSalary: 0,
                    commission: 0,
                    total: 0
                };
            }
            
            employeeTotals[transaction.employeeId].baseSalary += transaction.baseSalary || 0;
            employeeTotals[transaction.employeeId].commission += transaction.commissionAmount || 0;
            employeeTotals[transaction.employeeId].total += transaction.totalSalary || 0;
        });
        
        // تحويل البيانات إلى تنسيق الرسم البياني
        const employeeNames = [];
        const baseSalaryData = [];
        const commissionData = [];
        
        Object.keys(employeeTotals).forEach(employeeId => {
            const employeeData = employeeTotals[employeeId];
            employeeNames.push(employeeData.name);
            baseSalaryData.push(employeeData.baseSalary);
            commissionData.push(employeeData.commission);
        });
        
        // إنشاء الرسم البياني
        const existingChart = Chart.getChart(chartCanvas);
        if (existingChart) {
            existingChart.destroy();
        }
        
        const salariesChart = new Chart(chartCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: employeeNames,
                datasets: [
                    {
                        label: 'الراتب الأساسي',
                        data: baseSalaryData,
                        backgroundColor: 'rgba(59, 130, 246, 0.7)',
                        borderColor: '#3b82f6',
                        borderWidth: 1
                    },
                    {
                        label: 'العمولات',
                        data: commissionData,
                        backgroundColor: 'rgba(16, 185, 129, 0.7)',
                        borderColor: '#10b981',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'المبلغ (دينار)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'الموظف'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'توزيع الرواتب والعمولات للموظفين',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
    }

    /**
     * عرض الرسم البياني لأداء الموظفين
     */
    function renderEmployeesPerformanceChart() {
        const chartCanvas = document.getElementById('employees-performance-chart');
        if (!chartCanvas || typeof Chart === 'undefined') return;
        
        // حساب إجمالي المبيعات لكل موظف
        const employeeSales = {};
        
        // تجميع المبيعات حسب الموظف
        salaryTransactions.forEach(transaction => {
            if (!employeeSales[transaction.employeeId]) {
                employeeSales[transaction.employeeId] = {
                    name: transaction.employeeName,
                    sales: 0
                };
            }
            
            employeeSales[transaction.employeeId].sales += transaction.sales || 0;
        });
        
        // تحويل البيانات إلى تنسيق الرسم البياني
        const employeeNames = [];
        const salesData = [];
        const backgroundColors = [];
        
        // مجموعة من الألوان
        const colors = [
            'rgba(59, 130, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(239, 68, 68, 0.7)',
            'rgba(139, 92, 246, 0.7)',
            'rgba(236, 72, 153, 0.7)',
            'rgba(248, 113, 113, 0.7)',
            'rgba(52, 211, 153, 0.7)',
            'rgba(251, 191, 36, 0.7)',
            'rgba(167, 139, 250, 0.7)'
        ];
        
        let colorIndex = 0;
        Object.keys(employeeSales).forEach(employeeId => {
            const employeeData = employeeSales[employeeId];
            employeeNames.push(employeeData.name);
            salesData.push(employeeData.sales);
            backgroundColors.push(colors[colorIndex % colors.length]);
            colorIndex++;
        });
        
        // إنشاء الرسم البياني
        const existingChart = Chart.getChart(chartCanvas);
        if (existingChart) {
            existingChart.destroy();
        }
        
        const performanceChart = new Chart(chartCanvas.getContext('2d'), {
            type: 'pie',
            data: {
                labels: employeeNames,
                datasets: [{
                    data: salesData,
                    backgroundColor: backgroundColors,
                    borderWidth: 1,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'توزيع المبيعات حسب الموظفين',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(2) + '%';
                                return `${label}: ${formatCurrency(value)} (${percentage})`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * تصدير بيانات الموظفين إلى ملف CSV
     */
    function exportEmployeesData() {
        if (employees.length === 0) {
            showNotification('لا توجد بيانات للتصدير', 'warning');
            return;
        }
        
        // إنشاء محتوى CSV
        let csvContent = 'المعرف,الاسم,الهاتف,العنوان,البريد الإلكتروني,المسمى الوظيفي,القسم,الراتب الأساسي,نسبة العمولة,تاريخ التعيين,الحالة\n';
        
        employees.forEach(employee => {
            const row = [
                employee.id,
                employee.name,
                employee.phone,
                employee.address || '',
                employee.email || '',
                employee.jobTitle || '',
                getArabicDepartment(employee.department) || '',
                employee.baseSalary || 0,
                employee.commissionRate || 0,
                employee.hireDate || '',
                employee.status === 'active' ? 'نشط' : 'غير نشط'
            ];
            
            // تنظيف القيم وإضافتها إلى CSV
            csvContent += row.map(value => {
                const cleanValue = String(value).replace(/"/g, '""');
                return `"${cleanValue}"`;
            }).join(',') + '\n';
        });
        
        // إنشاء رابط التنزيل
        downloadCSV(csvContent, 'employees_data.csv');
    }

    /**
     * تصدير بيانات الرواتب إلى ملف CSV
     */
    function exportSalariesData() {
        if (salaryTransactions.length === 0) {
            showNotification('لا توجد بيانات للتصدير', 'warning');
            return;
        }
        
        // إنشاء محتوى CSV
        let csvContent = 'المعرف,الموظف,تاريخ الصرف,الشهر,الراتب الأساسي,المبيعات,النسبة,مبلغ العمولة,العلاوات,الاستقطاعات,الإجمالي\n';
        
        salaryTransactions.forEach(transaction => {
            const row = [
                transaction.id,
                transaction.employeeName,
                transaction.date,
                getArabicMonthName(transaction.month),
                transaction.baseSalary || 0,
                transaction.sales || 0,
                transaction.commissionRate || 0,
                transaction.commissionAmount || 0,
                transaction.bonuses || 0,
                transaction.deductions || 0,
                transaction.totalSalary || 0
            ];
            
            // تنظيف القيم وإضافتها إلى CSV
            csvContent += row.map(value => {
                const cleanValue = String(value).replace(/"/g, '""');
                return `"${cleanValue}"`;
            }).join(',') + '\n';
        });
        
        // إنشاء رابط التنزيل
        downloadCSV(csvContent, 'salary_transactions.csv');
    }

    /**
     * تنزيل ملف CSV
     * @param {string} csvContent - محتوى ملف CSV
     * @param {string} fileName - اسم الملف
     */
    function downloadCSV(csvContent, fileName) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (navigator.msSaveBlob) { // دعم IE 10+
            navigator.msSaveBlob(blob, fileName);
        } else {
            // للمتصفحات الأخرى
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        showNotification(`تم تصدير البيانات بنجاح إلى ${fileName}`, 'success');
    }

    /**
     * فتح نافذة منبثقة
     * @param {string} modalId - معرف النافذة
     */
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.classList.add('active');
        
        // إجراءات خاصة حسب النافذة
        if (modalId === 'add-employee-modal') {
            // إعادة تعيين النموذج
            document.getElementById('add-employee-form').reset();
            
            // إعادة تعيين معاينة الصور
            document.getElementById('id-card-preview').innerHTML = '';
            document.getElementById('residence-card-preview').innerHTML = '';
            document.getElementById('employee-photo-preview').innerHTML = '';
            
            // إعادة تعيين تبويبات النموذج
            document.querySelectorAll('.form-tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector('.form-tab-btn[data-tab="personal-info"]').classList.add('active');
            
            document.querySelectorAll('.form-tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.getElementById('personal-info-tab').classList.add('active');
            
            // إعادة تعيين عنوان النافذة
            const modalTitle = document.querySelector('#add-employee-modal .modal-title');
            if (modalTitle) {
                modalTitle.textContent = 'إضافة موظف جديد';
            }
            
            // إعادة تعيين نص زر الحفظ
            const saveButton = document.getElementById('save-employee-btn');
            if (saveButton) {
                saveButton.textContent = 'إضافة';
                saveButton.onclick = addNewEmployee;
            }
            
         // تعيين تاريخ اليوم في حقل تاريخ التعيين
            const hireDateInput = document.getElementById('employee-hire-date');
            if (hireDateInput) {
                hireDateInput.value = new Date().toISOString().split('T')[0];
            }
        } else if (modalId === 'pay-salary-modal') {
            // إعادة تعيين النموذج
            document.getElementById('pay-salary-form').reset();
            
            // إخفاء معلومات الموظف
            document.getElementById('employee-salary-info').style.display = 'none';
            
            // تعبئة قائمة الموظفين
            populateEmployeeSelect();
            
            // تعيين تاريخ اليوم في حقل تاريخ الصرف
            const salaryDateInput = document.getElementById('salary-date');
            if (salaryDateInput) {
                salaryDateInput.value = new Date().toISOString().split('T')[0];
            }
            
            // تعيين الشهر الحالي
            const salaryMonthSelect = document.getElementById('salary-month');
            if (salaryMonthSelect) {
                const currentMonth = new Date().getMonth() + 1; // الأشهر تبدأ من 0
                salaryMonthSelect.value = currentMonth.toString();
            }
        }
    }

    /**
     * إغلاق نافذة منبثقة
     * @param {string} modalId - معرف النافذة
     */
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.classList.remove('active');
    }

    /**
     * عرض إشعار للمستخدم
     * @param {string} message - نص الإشعار
     * @param {string} type - نوع الإشعار (success, error, warning, info)
     */
    function showNotification(message, type = 'success') {
        try {
            // استخدام دالة الإشعارات الموجودة في النظام
            if (typeof window.showNotification === 'function') {
                window.showNotification(message, type);
                return;
            }

            // إنشاء عنصر الإشعار
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.innerHTML = `
                <div class="notification-icon">
                    <i class="fas ${getNotificationIcon(type)}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${getNotificationTitle(type)}</div>
                    <div class="notification-message">${message}</div>
                </div>
                <button class="notification-close">×</button>
            `;
            
            // إضافة الإشعار إلى الصفحة
            document.body.appendChild(notification);
            
            // إضافة مستمع حدث للإغلاق
            const closeButton = notification.querySelector('.notification-close');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    document.body.removeChild(notification);
                });
            }
            
            // إغلاق الإشعار تلقائياً بعد 5 ثوانٍ
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 5000);
        } catch (error) {
            console.error('خطأ في عرض الإشعار:', error);
        }
    }

    /**
     * الحصول على أيقونة الإشعار حسب النوع
     * @param {string} type - نوع الإشعار
     * @returns {string} - اسم الأيقونة
     */
    function getNotificationIcon(type) {
        switch (type) {
            case 'success':
                return 'fa-check-circle';
            case 'error':
                return 'fa-times-circle';
            case 'warning':
                return 'fa-exclamation-triangle';
            case 'info':
            default:
                return 'fa-info-circle';
        }
    }

    /**
     * الحصول على عنوان الإشعار حسب النوع
     * @param {string} type - نوع الإشعار
     * @returns {string} - عنوان الإشعار
     */
    function getNotificationTitle(type) {
        switch (type) {
            case 'success':
                return 'نجاح';
            case 'error':
                return 'خطأ';
            case 'warning':
                return 'تنبيه';
            case 'info':
            default:
                return 'معلومات';
        }
    }

    /**
     * تنسيق المبلغ المالي
     * @param {number} amount - المبلغ
     * @param {boolean} addCurrency - إضافة وحدة العملة
     * @returns {string} - المبلغ المنسق
     */
    function formatCurrency(amount, addCurrency = true) {
        // استخدام دالة تنسيق العملة الموجودة في التطبيق إذا كانت متاحة
        if (typeof window.formatCurrency === 'function') {
            return window.formatCurrency(amount, addCurrency);
        }
        
        // التحقق من صحة المبلغ
        if (amount === undefined || amount === null || isNaN(amount)) {
            return addCurrency ? "0 دينار" : "0";
        }
        
        // تقريب المبلغ إلى رقمين عشريين إذا كان يحتوي على كسور
        amount = parseFloat(amount);
        if (amount % 1 !== 0) {
            amount = amount.toFixed(0);
        }
        
        // تحويل المبلغ إلى نص وإضافة النقاط بين كل ثلاثة أرقام
        const parts = amount.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        
        // إعادة المبلغ مع إضافة العملة إذا تم طلب ذلك
        const formattedAmount = parts.join('.');
        
        if (addCurrency) {
            return formattedAmount + " دينار";
        } else {
            return formattedAmount;
        }
    }

    /**
     * الحصول على اسم القسم بالعربية
     * @param {string} department - رمز القسم
     * @returns {string} - اسم القسم بالعربية
     */
    function getArabicDepartment(department) {
        const departments = {
            'sales': 'المبيعات',
            'finance': 'المالية',
            'admin': 'الإدارة',
            'it': 'تكنولوجيا المعلومات',
            'operations': 'العمليات'
        };
        
        return departments[department] || department;
    }

    /**
     * الحصول على نوع العقد بالعربية
     * @param {string} contractType - رمز نوع العقد
     * @returns {string} - نوع العقد بالعربية
     */
    function getArabicContractType(contractType) {
        const types = {
            'full-time': 'دوام كامل',
            'part-time': 'دوام جزئي',
            'contract': 'عقد مؤقت'
        };
        
        return types[contractType] || contractType;
    }

    /**
     * الحصول على اسم الشهر بالعربية
     * @param {string|number} month - رقم الشهر (1-12)
     * @returns {string} - اسم الشهر بالعربية
     */
    function getArabicMonthName(month) {
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

    // تصدير دوال النظام للاستخدام العام
    window.EmployeesModule = {
        activate: activateEmployeesPage,
        addEmployee: addNewEmployee,
        editEmployee: editEmployee,
        deleteEmployee: deleteEmployee,
        paySalary: payEmployeeSalary,
        loadEmployees: loadEmployeesData,
        renderEmployeesTable: renderEmployeesTable,
        renderSalaryTransactionsTable: renderSalaryTransactionsTable,
        showEmployeeDetails: showEmployeeDetails,
        showSalaryDetails: showSalaryDetails,
        exportEmployeesData: exportEmployeesData,
        exportSalariesData: exportSalariesData
    };

    // تحميل النظام
    console.log('تم تحميل نظام إدارة الموظفين بنجاح');
})();




/**
 * employees-system-init.js
 * ملف لتهيئة وربط نظام إدارة الموظفين مع نظام الاستثمار المتكامل
 */

(function() {
    // تنفيذ الكود بعد اكتمال تحميل الصفحة
    document.addEventListener('DOMContentLoaded', function() {
        console.log('بدء تهيئة نظام إدارة الموظفين...');
        
        // تحميل المكونات المطلوبة
        loadEmployeesComponents().then(() => {
            console.log('تم تحميل جميع مكونات نظام إدارة الموظفين بنجاح');
            
            // تهيئة مستمع حدث للروابط في القائمة الجانبية
            setupSidebarListeners();
        });
    });
    
    /**
     * تحميل مكونات نظام إدارة الموظفين
     * @returns {Promise} - وعد يتم حله عند اكتمال تحميل جميع المكونات
     */
    function loadEmployeesComponents() {
        return new Promise((resolve, reject) => {
            try {
                // تحميل الملفات المطلوبة بالترتيب
                const scripts = [
                    'employees-integration.js',
                    'employees-integration-continued.js',
                    'employees-integration-final-part.js',
                    'employees-integration-final-functions.js'
                ];
                
                // تحميل الملفات تتابعياً
                loadScripts(scripts, 0, resolve);
            } catch (error) {
                console.error('خطأ في تحميل مكونات نظام إدارة الموظفين:', error);
                
                // إظهار إشعار الخطأ
                if (typeof window.showNotification === 'function') {
                    window.showNotification('فشل في تحميل نظام إدارة الموظفين. يرجى تحديث الصفحة والمحاولة مرة أخرى.', 'error');
                }
                
                reject(error);
            }
        });
    }
    
    /**
     * تحميل ملفات النصوص البرمجية تتابعياً
     * @param {Array} scripts - مصفوفة بأسماء ملفات النصوص البرمجية
     * @param {number} index - مؤشر الملف الحالي
     * @param {Function} resolve - دالة الوعد المحقق
     */
    function loadScripts(scripts, index, resolve) {
        if (index >= scripts.length) {
            // اكتمل تحميل جميع الملفات
            resolve();
            return;
        }
        
        // إنشاء عنصر النص البرمجي
        const script = document.createElement('script');
        script.src = scripts[index];
        
        // تنفيذ الدالة عند اكتمال تحميل الملف
        script.onload = function() {
            console.log(`تم تحميل الملف: ${scripts[index]}`);
            
            // الانتقال للملف التالي
            loadScripts(scripts, index + 1, resolve);
        };
        
        // تنفيذ الدالة عند فشل تحميل الملف
        script.onerror = function() {
            console.error(`فشل تحميل الملف: ${scripts[index]}`);
            
            // عرض إشعار بالفشل
            if (typeof window.showNotification === 'function') {
                window.showNotification(`فشل في تحميل الملف: ${scripts[index]}`, 'error');
            }
            
            // محاولة الانتقال للملف التالي
            loadScripts(scripts, index + 1, resolve);
        };
        
        // إضافة العنصر إلى الصفحة
        document.head.appendChild(script);
    }
    
    /**
     * تهيئة مستمعي أحداث القائمة الجانبية
     */
    function setupSidebarListeners() {
        // البحث عن رابط صفحة الموظفين
        const employeesLink = document.querySelector('a[data-page="employees"]');
        if (!employeesLink) {
            console.warn('لم يتم العثور على رابط صفحة الموظفين في القائمة');
            return;
        }
        
        // إضافة مستمع حدث لرابط الموظفين في القائمة الجانبية
        employeesLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // إلغاء تنشيط جميع الروابط
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            
            // تنشيط رابط الموظفين
            this.classList.add('active');
            
            // إخفاء جميع الصفحات
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            // عرض صفحة الموظفين
            const employeesPage = document.getElementById('employees-page');
            if (employeesPage) {
                employeesPage.classList.add('active');
                
                // تحديث جدول الموظفين
                if (window.EmployeesModule && window.EmployeesModule.renderEmployeesTable) {
                    window.EmployeesModule.renderEmployeesTable();
                }
            } else {
                console.error('لم يتم العثور على صفحة الموظفين');
                
                // إعادة المحاولة مرة واحدة
                if (window.EmployeesModule && window.EmployeesModule.activate) {
                    window.EmployeesModule.activate();
                }
            }
        });
        
        // تسجيل وظيفة المزامنة
        registerSyncFunction();
    }
    
    /**
     * تسجيل وظيفة المزامنة مع نظام التحديث
     */
    function registerSyncFunction() {
        // إذا كان هناك زر تحديث، إضافة مستمع حدث له
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            const originalClickHandler = refreshBtn.onclick;
            
            refreshBtn.onclick = function(e) {
                // استدعاء المعالج الأصلي إذا كان موجودًا
                if (typeof originalClickHandler === 'function') {
                    originalClickHandler.call(this, e);
                }
                
                // تحديث بيانات الموظفين
                if (window.EmployeesModule && window.EmployeesModule.loadEmployees) {
                    setTimeout(() => {
                        window.EmployeesModule.loadEmployees();
                    }, 500);
                }
            };
        }
        
        // تسجيل وظيفة تحديث الموظفين مع نظام التحديث العام
        if (window.loadData) {
            const originalLoadData = window.loadData;
            
            window.loadData = function() {
                // استدعاء الدالة الأصلية
                originalLoadData.apply(this, arguments);
                
                // تحديث بيانات الموظفين
                if (window.EmployeesModule && window.EmployeesModule.loadEmployees) {
                    window.EmployeesModule.loadEmployees();
                }
            };
        }
    }
})();