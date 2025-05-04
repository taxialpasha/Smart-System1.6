/**
 * employees-management.js
 * نظام إدارة الموظفين ذوي النسبة والرواتب
 * يتكامل مع نظام الاستثمار المتكامل
 */

// المتغيرات الرئيسية
let employees = [];
let salaryTransactions = [];

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تهيئة نظام إدارة الموظفين...');
    
    // إضافة رابط الصفحة في القائمة الجانبية
    addEmployeesSidebarLink();
    
    // إضافة صفحة الموظفين إلى التطبيق
    addEmployeesPage();
    
    // إضافة نوافذ إدارة الموظفين
    addEmployeesModals();
    
    // تحميل بيانات الموظفين
    loadEmployeesData();
    
    // إضافة أنماط CSS
    addEmployeesStyles();
    
    // تهيئة مستمعي الأحداث
    initEmployeesEventListeners();
});

/**
 * إضافة رابط صفحة الموظفين إلى القائمة الجانبية
 */
function addEmployeesSidebarLink() {
    const navList = document.querySelector('.nav-list');
    if (!navList) return;
    
    // التحقق من عدم وجود الرابط مسبقاً
    if (document.querySelector('a[data-page="employees"]')) return;
    
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
    const settingsNavItem = document.querySelector('a[data-page="settings"]').parentNode;
    navList.insertBefore(navItem, settingsNavItem);
}

/**
 * إضافة صفحة الموظفين إلى التطبيق
 */
function addEmployeesPage() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    // التحقق من عدم وجود الصفحة مسبقاً
    if (document.getElementById('employees-page')) return;
    
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
}

/**
 * إضافة نوافذ إدارة الموظفين
 */
function addEmployeesModals() {
    // التحقق من عدم وجود النوافذ مسبقاً
    if (document.getElementById('add-employee-modal')) return;
    
    // إنشاء عناصر النوافذ
    const modalsHTML = `
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
    document.body.insertAdjacentHTML('beforeend', modalsHTML);
}

/**
 * إضافة أنماط CSS الخاصة بإدارة الموظفين
 */
function addEmployeesStyles() {
    // التحقق من عدم وجود الأنماط مسبقاً
    if (document.getElementById('employees-management-styles')) return;
    
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
        
        .receipt-footer {
            margin-top: 30px;
            text-align: center;
            color: #6c757d;
            font-size: 0.9rem;
        }
        
        .receipt-signature {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
        }
        
        .signature-box {
            flex: 1;
            max-width: 200px;
            border-top: 1px solid #adb5bd;
            padding-top: 10px;
            text-align: center;
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
        addEmployeeBtn.addEventListener('click', () => openModal('add-employee-modal'));
    }
    
    // مستمع زر صرف راتب
    const paySalaryBtn = document.getElementById('pay-salary-btn');
    if (paySalaryBtn) {
        paySalaryBtn.addEventListener('click', () => openModal('pay-salary-modal'));
    }
    
    // مستمعي أزرار تبويبات الصفحة
    const tabButtons = document.querySelectorAll('#employees-page .tab-btn');
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                // إزالة الفئة النشطة من جميع الأزرار
                tabButtons.forEach(btn => btn.classList.remove('active'));
                
                // إضافة الفئة النشطة للزر الحالي
                this.classList.add('active');
                
                // تحديد معرف التبويب
                const tabId = this.getAttribute('data-tab') + '-tab';
                
                // إخفاء جميع محتويات التبويبات
                document.querySelectorAll('#employees-page .tab-content').forEach(tab => {
                    tab.classList.remove('active');
                });
                
                // إظهار محتوى التبويب المطلوب
                const tabContent = document.getElementById(tabId);
                if (tabContent) {
                    tabContent.classList.add('active');
                    
                    // تحديث الجداول حسب التبويب
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
    
    // مستمعي أزرار تبويبات النموذج
    const formTabButtons = document.querySelectorAll('.form-tab-btn');
    if (formTabButtons.length > 0) {
        formTabButtons.forEach(button => {
            button.addEventListener('click', function() {
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
        printSalaryDetailsBtn.addEventListener('click', printSalaryDetails);
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
    
    uploadBtn.addEventListener('click', () => {
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

/**
 * تحميل بيانات الموظفين من التخزين المحلي
 */
function loadEmployeesData() {
    try {
        const savedEmployees = localStorage.getItem('employees');
        if (savedEmployees) {
            employees = JSON.parse(savedEmployees);
            console.log(`تم تحميل ${employees.length} موظف`);
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
 if (!employeeId || !salaryDate || !salaryMonth || !baseSalary || !sales || isNaN(sales)) {
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
* طباعة تفاصيل الراتب
*/
function printSalaryDetails() {
 window.print();
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
 if (!chartCanvas || !window.Chart) return;
 
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
 if (!chartCanvas || !window.Chart) return;
 
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

// === وظائف مساعدة ===

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
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">×</button>
        `;
        
        // إضافة الإشعار إلى الصفحة
        document.body.appendChild(notification);
        
        // إزالة الإشعار بعد مدة زمنية
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        // زر الإغلاق اليدوي
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => notification.remove());
        }
    } catch (error) {
        console.error('خطأ أثناء عرض الإشعار:', error);
        // لا تستدعي showNotification هنا أبداً حتى لا تدخل في حلقة لا نهائية
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

// إضافة مستمعي الأحداث
document.getElementById('export-employees-btn')?.addEventListener('click', exportEmployeesData);
document.getElementById('export-salaries-btn')?.addEventListener('click', exportSalariesData);


/**
 * employees-integration.js
 * ملف التكامل بين نظام إدارة الموظفين ونظام الاستثمار المتكامل
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('تهيئة تكامل نظام إدارة الموظفين...');
    
    // التحقق من تحميل نظام الموظفين
    if (typeof addEmployeesSidebarLink !== 'function') {
        console.error('لم يتم العثور على نظام الموظفين');
        return;
    }
    
    // إضافة تكامل مع نظام الإبلاغ عن المبيعات
    setupSalesNotifications();
    
    // ربط بيانات المبيعات بسجلات الموظفين
    linkSalesDataToEmployees();
    
    // إضافة تكامل مع النظام المالي
    setupFinancialIntegration();
    
    // إضافة الربط مع نظام المصادقة
    setupAuthIntegration();
});

/**
 * إعداد تكامل مع نظام الإبلاغ عن المبيعات
 */
function setupSalesNotifications() {
    // الاستماع لأحداث إضافة/تعديل العمليات
    document.addEventListener('transaction:update', function() {
        // تحديث إحصائيات المبيعات
        updateSalesStatistics();
    });
    
    // إذا كان هناك نظام إشعارات، إعداد إشعارات للموظفين
    if (window.showNotification) {
        // يمكن إضافة إشعارات خاصة بالموظفين هنا
    }
}

/**
 * تحديث إحصائيات المبيعات
 */
function updateSalesStatistics() {
    // لا يتم تنفيذ هذه الوظيفة إلا إذا كانت هناك مصفوفة معاملات وموظفين
    if (!window.transactions || !window.employees) return;
    try {
        // حساب إجمالي المبيعات للشهر الحالي
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        // تصفية المعاملات للشهر الحالي
        const currentMonthDeposits = window.transactions.filter(tx => {
            if (tx.type !== 'إيداع') return false;
            
            const txDate = new Date(tx.date);
            return txDate.getMonth() === currentMonth && 
                   txDate.getFullYear() === currentYear;
        });
        

        
        // حساب إجمالي المبيعات
        const totalMonthSales = currentMonthDeposits.reduce((total, tx) => total + tx.amount, 0);
        
        console.log(`إجمالي المبيعات للشهر الحالي: ${totalMonthSales}`);
        
        // تخزين البيانات المؤقتة للاستخدام في نظام الموظفين
        window.currentMonthSales = totalMonthSales;
        
        // إذا كانت صفحة الموظفين مفتوحة، تحديث القيم التلقائية للمبيعات
        const salesInput = document.getElementById('salary-sales');
        if (salesInput && salesInput.value === '') {
            salesInput.value = totalMonthSales;
            
            // إعادة حساب إجمالي الراتب
            if (typeof calculateTotalSalary === 'function') {
                calculateTotalSalary();
            }
        }
    } catch (error) {
        console.error('خطأ في تحديث إحصائيات المبيعات:', error);
    }
}

/**
 * ربط بيانات المبيعات بسجلات الموظفين
 */
function linkSalesDataToEmployees() {
    // التحقق من وجود بيانات المعاملات والموظفين
    if (!window.transactions || !window.employees) return;
    
    // ربط المعاملات بالموظفين المسؤولين عنها
    try {
        // تحديث نموذج صرف الراتب
        enhancePaySalaryForm();
        
        // إضافة عرض المبيعات في تفاصيل الموظف
        enhanceEmployeeDetails();
        
    } catch (error) {
        console.error('خطأ في ربط بيانات المبيعات بسجلات الموظفين:', error);
    }
}

/**
 * تحسين نموذج صرف الراتب
 */
function enhancePaySalaryForm() {
    // إضافة زر التحميل التلقائي للمبيعات
    const salaryForm = document.getElementById('pay-salary-form');
    if (!salaryForm) return;
    
    const salesInputGroup = document.querySelector('#salary-sales').parentNode;
    if (!salesInputGroup) return;
    
    // إضافة زر التحميل التلقائي
    const autoLoadButton = document.createElement('button');
    autoLoadButton.type = 'button';
    autoLoadButton.className = 'btn btn-info btn-sm';
    autoLoadButton.style.marginTop = '5px';
    autoLoadButton.innerHTML = '<i class="fas fa-sync-alt"></i> تحميل المبيعات تلقائياً';
    
    autoLoadButton.addEventListener('click', function() {
        // تحميل المبيعات للشهر الحالي
        updateSalesStatistics();
        
        // استخدام القيمة المحسوبة
        if (window.currentMonthSales) {
            document.getElementById('salary-sales').value = window.currentMonthSales;
            
            // إعادة حساب إجمالي الراتب
            if (typeof calculateTotalSalary === 'function') {
                calculateTotalSalary();
            }
            
            // عرض إشعار
            if (window.showNotification) {
                window.showNotification('تم تحميل بيانات المبيعات للشهر الحالي', 'success');
            }
        } else {
            if (window.showNotification) {
                window.showNotification('لا توجد بيانات مبيعات للشهر الحالي', 'warning');
            }
        }
    });
    
    // إضافة الزر بعد حقل المبيعات
    salesInputGroup.appendChild(autoLoadButton);
}

/**
 * تحسين عرض تفاصيل الموظف
 */
function enhanceEmployeeDetails() {
    // إضافة مستمع حدث لعرض تفاصيل الموظف
    document.body.addEventListener('click', function(e) {
        // التحقق من أن الزر هو زر عرض تفاصيل الموظف
        const viewButton = e.target.closest('.view-employee');
        if (!viewButton) return;
        
        // الحصول على معرف الموظف
        const employeeId = viewButton.getAttribute('data-id');
        if (!employeeId) return;
        
        // إضافة إحصائيات المبيعات لعرض تفاصيل الموظف
        setTimeout(() => {
            addSalesStatisticsToEmployeeDetails(employeeId);
        }, 500);
    });
}

/**
 * إضافة إحصائيات المبيعات لعرض تفاصيل الموظف
 * @param {string} employeeId - معرف الموظف
 */
function addSalesStatisticsToEmployeeDetails(employeeId) {
    const detailsContent = document.getElementById('employee-details-content');
    if (!detailsContent) return;
    
    // البحث عن آخر قسم في التفاصيل (سجل الرواتب)
    const lastCard = detailsContent.querySelector('.employee-detail-card:last-child');
    if (!lastCard) return;
    
    // إنشاء قسم إحصائيات المبيعات
    const salesStatsCard = document.createElement('div');
    salesStatsCard.className = 'employee-detail-card';
    salesStatsCard.innerHTML = `
        <h4><i class="fas fa-chart-line"></i> إحصائيات المبيعات</h4>
        <div id="employee-sales-stats">
            <div class="loader" style="margin: 20px auto;"></div>
            <p class="text-center">جاري تحميل إحصائيات المبيعات...</p>
        </div>
    `;
    
    // إضافة القسم قبل سجل الرواتب
    lastCard.parentNode.insertBefore(salesStatsCard, lastCard);
    
    // تحميل إحصائيات المبيعات
    loadEmployeeSalesStatistics(employeeId);
}

/**
 * تحميل إحصائيات المبيعات للموظف
 * @param {string} employeeId - معرف الموظف
 */
function loadEmployeeSalesStatistics(employeeId) {
    const statsContainer = document.getElementById('employee-sales-stats');
    if (!statsContainer) return;
    
    // التحقق من وجود بيانات المعاملات
    if (!window.transactions) {
        statsContainer.innerHTML = '<p class="text-center">لا يمكن تحميل إحصائيات المبيعات</p>';
        return;
    }
    
    try {
        // الحصول على إحصائيات المبيعات للموظف
        const employee = window.employees.find(emp => emp.id === employeeId);
        if (!employee) throw new Error('لم يتم العثور على الموظف');
        
        // حساب إحصائيات المبيعات للأشهر الستة الماضية
        const months = [];
        const monthlySales = [];
        const monthlyCommissions = [];
        
        const today = new Date();
        
        for (let i = 5; i >= 0; i--) {
            // حساب الشهر
            const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = month.toLocaleDateString('ar-EG', { month: 'short' });
            months.push(monthName);
            
            // إيجاد معاملات رواتب الموظف لهذا الشهر
            const monthSalary = window.salaryTransactions?.find(salary => {
                const salaryDate = new Date(salary.date);
                return salary.employeeId === employeeId && 
                       salaryDate.getMonth() === month.getMonth() && 
                       salaryDate.getFullYear() === month.getFullYear();
            });
            
            // إضافة المبيعات والعمولات
            monthlySales.push(monthSalary ? monthSalary.sales : 0);
            monthlyCommissions.push(monthSalary ? monthSalary.commissionAmount : 0);
        }
        
        // إنشاء عرض الإحصائيات
        let statsHTML = `
            <div class="sales-statistics">
                <div class="grid-cols-2">
                    <div class="stat-card">
                        <div class="stat-title">إجمالي المبيعات (6 أشهر)</div>
                        <div class="stat-value">${formatCurrency(monthlySales.reduce((a, b) => a + b, 0))}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-title">إجمالي العمولات (6 أشهر)</div>
                        <div class="stat-value">${formatCurrency(monthlyCommissions.reduce((a, b) => a + b, 0))}</div>
                    </div>
                </div>
                
                <div class="chart-container" style="height: 200px; margin-top: 20px;">
                    <canvas id="employee-sales-chart"></canvas>
                </div>
            </div>
        `;
        
        // تحديث المحتوى
        statsContainer.innerHTML = statsHTML;
        
        // إنشاء الرسم البياني
        if (window.Chart) {
            const ctx = document.getElementById('employee-sales-chart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: months,
                    datasets: [
                        {
                            label: 'المبيعات',
                            data: monthlySales,
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'العمولات',
                            data: monthlyCommissions,
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4,
                            fill: true
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
        
    } catch (error) {
        console.error('خطأ في تحميل إحصائيات المبيعات للموظف:', error);
        statsContainer.innerHTML = '<p class="text-center">تعذر تحميل إحصائيات المبيعات</p>';
    }
}

/**
 * إعداد تكامل مع النظام المالي
 */
function setupFinancialIntegration() {
    // ربط دفع الرواتب بسجل العمليات المالية
    setupSalaryTransactionIntegration();
    
    // إضافة تقارير رواتب الموظفين إلى نظام التقارير
    setupEmployeeReportsIntegration();
}

/**
 * ربط دفع الرواتب بسجل العمليات المالية
 */
function setupSalaryTransactionIntegration() {
    // التنصت على أحداث دفع الرواتب
    document.body.addEventListener('click', function(e) {
        // التحقق من أن الزر هو زر تأكيد دفع الراتب
        const confirmButton = e.target.closest('#confirm-pay-salary-btn');
        if (!confirmButton) return;
        
        // إضافة مستمع حدث لما بعد دفع الراتب
        setTimeout(() => {
            const salaryDetailsContent = document.getElementById('salary-details-content');
            if (!salaryDetailsContent) return;
            
            // إضافة زر إضافة العملية للسجل المالي
            const addToTransactionsButton = document.createElement('button');
            addToTransactionsButton.className = 'btn btn-primary no-print';
            addToTransactionsButton.style.marginRight = '10px';
            addToTransactionsButton.innerHTML = '<i class="fas fa-exchange-alt"></i> إضافة للسجل المالي';
            
            // إضافة الزر قبل زر الطباعة
            const printButton = document.getElementById('print-salary-details-btn');
            if (printButton && printButton.parentNode) {
                printButton.parentNode.insertBefore(addToTransactionsButton, printButton);
                
                // إضافة مستمع حدث للزر
                addToTransactionsButton.addEventListener('click', function() {
                    // استخراج معرف معاملة الراتب من عنوان النافذة
                    const modalTitle = document.querySelector('#salary-details-modal .modal-title').textContent;
                    const employeeName = modalTitle.replace('تفاصيل راتب - ', '');
                    
                    // البحث عن معاملة الراتب الأخيرة للموظف
                    const latestSalaryTransaction = window.salaryTransactions.find(tr => 
                        tr.employeeName === employeeName
                    );
                    
                    if (latestSalaryTransaction) {
                        // إضافة العملية إلى سجل العمليات المالية
                        addSalaryToFinancialTransactions(latestSalaryTransaction);
                    } else {
                        if (window.showNotification) {
                            window.showNotification('لم يتم العثور على معاملة الراتب', 'error');
                        }
                    }
                });
            }
        }, 500);
    });
}

/**
 * إضافة معاملة راتب إلى سجل العمليات المالية
 * @param {Object} salaryTransaction - معاملة الراتب
 */
function addSalaryToFinancialTransactions(salaryTransaction) {
    // التحقق من وجود دالة إضافة العمليات
    if (typeof window.addTransaction !== 'function') {
        if (window.showNotification) {
            window.showNotification('لا يمكن إضافة العملية للسجل المالي، النظام غير متاح', 'error');
        }
        return;
    }
    
    try {
        // إضافة العملية للسجل المالي
        window.addTransaction(
            'سحب', // نوع العملية
            'expenses-account', // حساب النفقات (يمكن تغييره)
            salaryTransaction.totalSalary, // المبلغ
            `دفع راتب للموظف ${salaryTransaction.employeeName} - ${getArabicMonthName(salaryTransaction.month)}` // ملاحظات
        );
        
        if (window.showNotification) {
            window.showNotification('تم إضافة الراتب للسجل المالي بنجاح', 'success');
        }
        
        // إغلاق النافذة المنبثقة
        closeModal('salary-details-modal');
        
    } catch (error) {
        console.error('خطأ في إضافة الراتب للسجل المالي:', error);
        if (window.showNotification) {
            window.showNotification('حدث خطأ أثناء إضافة الراتب للسجل المالي', 'error');
        }
    }
}

/**
 * إضافة تقارير رواتب الموظفين إلى نظام التقارير
 */
function setupEmployeeReportsIntegration() {
    // إذا كان هناك صفحة تقارير، إضافة تبويب للموظفين
    const reportsPage = document.getElementById('reports-page');
    if (!reportsPage) return;
    
    // البحث عن أزرار التبويبات
    const tabButtons = reportsPage.querySelector('.tab-buttons');
    if (!tabButtons) return;
    
    // إضافة تبويب للموظفين
    const employeesTabButton = document.createElement('button');
    employeesTabButton.className = 'btn btn-outline';
    employeesTabButton.textContent = 'الموظفين';
    
    // إضافة الزر إلى الأزرار
    tabButtons.appendChild(employeesTabButton);
    
    // إضافة مستمع حدث للزر
    employeesTabButton.addEventListener('click', function() {
        // إزالة الفئة النشطة من جميع الأزرار
        tabButtons.querySelectorAll('.btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // إضافة الفئة النشطة للزر الحالي
        this.classList.add('active');
        
        // عرض تقارير الموظفين
        showEmployeesInReports();
    });
}

/**
 * عرض تقارير الموظفين في صفحة التقارير
 */
function showEmployeesInReports() {
    // العثور على حاوية المحتوى
    const reportsContent = document.querySelector('#reports-page .grid-cols-2');
    if (!reportsContent) return;
    
    // إنشاء محتوى تقارير الموظفين
    reportsContent.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">توزيع رواتب الموظفين</h2>
            </div>
            <div class="chart-container">
                <canvas id="employees-salaries-report-chart"></canvas>
            </div>
        </div>
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">أداء الموظفين (المبيعات)</h2>
            </div>
            <div class="chart-container">
                <canvas id="employees-performance-report-chart"></canvas>
            </div>
        </div>
    `;
    
    // إنشاء الرسوم البيانية
    if (window.Chart && window.employees && window.salaryTransactions) {
        // رسم توزيع الرواتب
        renderEmployeesSalariesReportChart();
        
        // رسم أداء الموظفين
        renderEmployeesPerformanceReportChart();
    }
}

/**
 * رسم مخطط توزيع رواتب الموظفين في التقارير
 */
function renderEmployeesSalariesReportChart() {
    const canvas = document.getElementById('employees-salaries-report-chart');
    if (!canvas) return;
    
    // تجميع بيانات الرواتب
    const employeeSalaries = {};
    
    window.salaryTransactions.forEach(transaction => {
        if (!employeeSalaries[transaction.employeeId]) {
            employeeSalaries[transaction.employeeId] = {
                name: transaction.employeeName,
                baseSalary: 0,
                commission: 0,
                total: 0
            };
        }
        
        employeeSalaries[transaction.employeeId].baseSalary += transaction.baseSalary || 0;
        employeeSalaries[transaction.employeeId].commission += transaction.commissionAmount || 0;
        employeeSalaries[transaction.employeeId].total += transaction.totalSalary || 0;
    });
    
    // تحويل البيانات إلى مصفوفات
    const labels = [];
    const baseSalaryData = [];
    const commissionData = [];
    
    Object.values(employeeSalaries).forEach(salary => {
        labels.push(salary.name);
        baseSalaryData.push(salary.baseSalary);
        commissionData.push(salary.commission);
    });
    
    // إنشاء الرسم البياني
    new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'الراتب الأساسي',
                    data: baseSalaryData,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)'
                },
                {
                    label: 'العمولات',
                    data: commissionData,
                    backgroundColor: 'rgba(16, 185, 129, 0.7)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'توزيع رواتب الموظفين'
                }
            },
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * رسم مخطط أداء الموظفين في التقارير
 */
function renderEmployeesPerformanceReportChart() {
    const canvas = document.getElementById('employees-performance-report-chart');
    if (!canvas) return;
    
    // تجميع بيانات المبيعات
    const employeeSales = {};
    
    window.salaryTransactions.forEach(transaction => {
        if (!employeeSales[transaction.employeeId]) {
            employeeSales[transaction.employeeId] = {
                name: transaction.employeeName,
                sales: 0
            };
        }
        
        employeeSales[transaction.employeeId].sales += transaction.sales || 0;
    });
    
    // تحويل البيانات إلى مصفوفات
    const data = Object.values(employeeSales).map(sale => ({
        name: sale.name,
        sales: sale.sales
    }));
    
    // ترتيب البيانات تنازلياً حسب المبيعات
    data.sort((a, b) => b.sales - a.sales);
    
    // إنشاء الرسم البياني
    new Chart(canvas.getContext('2d'), {
        type: 'pie',
        data: {
            labels: data.map(item => item.name),
            datasets: [{
                data: data.map(item => item.sales),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(236, 72, 153, 0.7)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'توزيع المبيعات حسب الموظفين'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = formatCurrency(context.raw);
                            const percentage = ((context.raw / data.reduce((sum, item) => sum + item.sales, 0)) * 100).toFixed(1) + '%';
                            return `${label}: ${value} (${percentage})`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * إعداد تكامل مع نظام المصادقة
 */
function setupAuthIntegration() {
    // تعيين الصلاحيات للصفحات
    addPagePermissions();
    
    // ربط صلاحيات المستخدمين
    linkUserPermissions();
}

/**
 * إضافة صلاحيات الصفحات
 */
function addPagePermissions() {
    // إذا كان هناك نظام صلاحيات، إضافة صلاحيات للصفحة
    if (typeof window.PermissionsSystem !== 'undefined') {
        // إضافة صفحة الموظفين إلى قائمة الصفحات المحمية
        if (window.PermissionsSystem.addProtectedPage) {
            window.PermissionsSystem.addProtectedPage('employees', ['admin', 'manager']);
        }
    }
}

/**
 * ربط صلاحيات المستخدمين
 */
function linkUserPermissions() {
    // إضافة مستمع حدث للتحقق من صلاحيات الوصول
    document.addEventListener('page:change', function(e) {
        if (e.detail && e.detail.page === 'employees') {
            // التحقق من صلاحيات المستخدم للوصول إلى صفحة الموظفين
            checkEmployeesPageAccess();
        }
    });
}

/**
 * التحقق من صلاحيات الوصول لصفحة الموظفين
 */
function checkEmployeesPageAccess() {
    // التحقق من وجود نظام صلاحيات
    if (typeof window.AuthSystem !== 'undefined' && window.AuthSystem.hasPermission) {
        if (!window.AuthSystem.hasPermission('employees')) {
            // عرض رسالة خطأ وإعادة التوجيه
            if (window.showNotification) {
                window.showNotification('ليس لديك صلاحية للوصول إلى صفحة الموظفين', 'error');
            }
            
            // العودة إلى الصفحة الرئيسية
            const dashboardLink = document.querySelector('a[data-page="dashboard"]');
            if (dashboardLink) {
                dashboardLink.click();
            }
        }
    }
}

/**
 * الحصول على اسم الشهر بالعربية
 * @param {string|number} month - رقم الشهر (1-12)
 * @returns {string} - اسم الشهر بالعربية
 */
function getArabicMonthName(month) {
    // استخدام الدالة من وحدة الموظفين إذا كانت متاحة
    if (typeof window.getArabicMonthName === 'function') {
        return window.getArabicMonthName(month);
    }
    
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
    
    // تحويل المبلغ إلى رقم
    amount = parseFloat(amount);
    
    // تنسيق المبلغ
    const formattedAmount = amount.toLocaleString('ar-IQ');
    
    // إعادة المبلغ مع إضافة العملة إذا تم طلب ذلك
    return addCurrency ? `${formattedAmount} دينار` : formattedAmount;
}


document.addEventListener('DOMContentLoaded', function() {
    console.log('تهيئة تكامل نظام إدارة الموظفين...');
    
    // التحقق من تحميل نظام الموظفين
    if (typeof addEmployeesSidebarLink !== 'function') {
        console.error('لم يتم العثور على نظام الموظفين');
        return;
    }
    
    // إضافة تكامل مع نظام الإبلاغ عن المبيعات
    setupSalesNotifications();
    
    // ربط بيانات المبيعات بسجلات الموظفين
    linkSalesDataToEmployees();
    
    // إضافة تكامل مع النظام المالي
    setupFinancialIntegration();
    
    // إضافة الربط مع نظام المصادقة
    setupAuthIntegration();
});

/**
 * إعداد تكامل مع نظام الإبلاغ عن المبيعات
 */
function setupSalesNotifications() {
    // الاستماع لأحداث إضافة/تعديل العمليات
    document.addEventListener('transaction:update', function() {
        // تحديث إحصائيات المبيعات
        updateSalesStatistics();
    });
    
    // إذا كان هناك نظام إشعارات، إعداد إشعارات للموظفين
    if (window.showNotification) {
        // يمكن إضافة إشعارات خاصة بالموظفين هنا
    }
}

/**
 * تحديث إحصائيات المبيعات
 */
function updateSalesStatistics() {
    // لا يتم تنفيذ هذه الوظيفة إلا إذا كانت هناك مصفوفة معاملات وموظفين
    if (!window.transactions || !window.employees) return;
    
    try {
        // حساب إجمالي المبيعات للشهر الحالي
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        // تصفية المعاملات للشهر الحالي
        const currentMonthDeposits = window.transactions.filter(tx => {
            if (tx.type !== 'إيداع') return false;
            
            const txDate = new Date(tx.date);
            return txDate.getMonth() === currentMonth && 
                   txDate.getFullYear() === currentYear;
        });
        
        // حساب إجمالي المبيعات
        const totalMonthSales = currentMonthDeposits.reduce((total, tx) => total + tx.amount, 0);
        
        console.log(`إجمالي المبيعات للشهر الحالي: ${totalMonthSales}`);
        
        // تخزين البيانات المؤقتة للاستخدام في نظام الموظفين
        window.currentMonthSales = totalMonthSales;
        
        // إذا كانت صفحة الموظفين مفتوحة، تحديث القيم التلقائية للمبيعات
        const salesInput = document.getElementById('salary-sales');
        if (salesInput && salesInput.value === '') {
            salesInput.value = totalMonthSales;
            
            // إعادة حساب إجمالي الراتب
            if (typeof calculateTotalSalary === 'function') {
                calculateTotalSalary();
            }
        }
        
        // تحديث إحصائيات المبيعات لكل موظف
        updateEmployeesSalesStats();
        
    } catch (error) {
        console.error('خطأ في تحديث إحصائيات المبيعات:', error);
    }
}

/**
 * تحديث إحصائيات المبيعات للموظفين
 */
function updateEmployeesSalesStats() {
    // التأكد من وجود مصفوفة الموظفين والمعاملات
    if (!window.employees || !window.transactions) return;
    
    // الحصول على المبيعات للشهر الحالي
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // تصفية معاملات الإيداع للشهر الحالي
    const currentMonthDeposits = window.transactions.filter(tx => {
        if (tx.type !== 'إيداع') return false;
        
        const txDate = new Date(tx.date);
        return txDate.getMonth() === currentMonth && 
               txDate.getFullYear() === currentYear;
    });
    
    // حساب إجمالي المبيعات للشهر الحالي
    const totalMonthSales = currentMonthDeposits.reduce((total, tx) => total + tx.amount, 0);
    
    // حساب متوسط المبيعات للموظف
    const activeEmployees = window.employees.filter(employee => employee.status === 'active');
    const averageSalesPerEmployee = activeEmployees.length > 0 ? 
        totalMonthSales / activeEmployees.length : 0;
    
    // تخزين البيانات للاستخدام في نظام الموظفين
    window.salesStats = {
        totalMonthSales,
        averageSalesPerEmployee,
        month: currentMonth,
        year: currentYear
    };
    
    console.log(`متوسط المبيعات للموظف: ${averageSalesPerEmployee}`);
}

/**
 * ربط بيانات المبيعات بسجلات الموظفين
 */
function linkSalesDataToEmployees() {
    // التحقق من وجود بيانات المعاملات والموظفين
    if (!window.transactions || !window.employees) return;
    
    // ربط المعاملات بالموظفين المسؤولين عنها
    try {
        // تحديث نموذج صرف الراتب
        enhancePaySalaryForm();
        
        // إضافة عرض المبيعات في تفاصيل الموظف
        enhanceEmployeeDetails();
        
        // إضافة توزيع المبيعات بين الموظفين
        setupSalesDistribution();
        
    } catch (error) {
        console.error('خطأ في ربط بيانات المبيعات بسجلات الموظفين:', error);
    }
}

/**
 * تحسين نموذج صرف الراتب
 */
function enhancePaySalaryForm() {
    // إضافة زر التحميل التلقائي للمبيعات
    const salaryForm = document.getElementById('pay-salary-form');
    if (!salaryForm) return;
    
    const salesInputGroup = document.querySelector('#salary-sales')?.parentNode;
    if (!salesInputGroup) return;
    
    // إضافة زر التحميل التلقائي
    const autoLoadButton = document.createElement('button');
    autoLoadButton.type = 'button';
    autoLoadButton.className = 'btn btn-info btn-sm';
    autoLoadButton.style.marginTop = '5px';
    autoLoadButton.innerHTML = '<i class="fas fa-sync-alt"></i> تحميل المبيعات تلقائياً';
    
    autoLoadButton.addEventListener('click', function() {
        // تحميل المبيعات للشهر الحالي
        updateSalesStatistics();
        
        // استخدام القيمة المحسوبة
        if (window.currentMonthSales) {
            document.getElementById('salary-sales').value = window.currentMonthSales;
            
            // إعادة حساب إجمالي الراتب
            if (typeof calculateTotalSalary === 'function') {
                calculateTotalSalary();
            }
            
            // عرض إشعار
            if (window.showNotification) {
                window.showNotification('تم تحميل بيانات المبيعات للشهر الحالي', 'success');
            }
        } else {
            if (window.showNotification) {
                window.showNotification('لا توجد بيانات مبيعات للشهر الحالي', 'warning');
            }
        }
    });
    
    // إضافة الزر بعد حقل المبيعات
    salesInputGroup.appendChild(autoLoadButton);
    
    // إضافة حقل توزيع المبيعات
    addSalesDistributionField(salaryForm);
}

/**
 * إضافة حقل توزيع المبيعات في نموذج صرف الراتب
 * @param {HTMLElement} salaryForm - نموذج صرف الراتب
 */
function addSalesDistributionField(salaryForm) {
    // البحث عن حقل المبيعات
    const salesInput = document.getElementById('salary-sales');
    if (!salesInput) return;
    
    // إضافة خانة اختيار توزيع المبيعات
    const distributionField = document.createElement('div');
    distributionField.className = 'form-group';
    distributionField.style.marginTop = '10px';
    
    distributionField.innerHTML = `
        <div class="form-check">
            <input type="checkbox" id="distribute-sales" class="form-check-input">
            <label for="distribute-sales" class="form-check-label">
                توزيع المبيعات تلقائياً بين الموظفين
            </label>
        </div>
        <div id="sales-distribution-options" style="display: none; margin-top: 10px;">
            <div class="grid-cols-2">
                <div class="form-group">
                    <label class="form-label">نسبة مساهمة الموظف (%)</label>
                    <input type="number" id="employee-contribution" class="form-input" value="70" min="1" max="100">
                </div>
                <div class="form-group">
                    <label class="form-label">عدد الموظفين المشاركين</label>
                    <select id="contributing-employees" class="form-select">
                        <option value="all">جميع الموظفين</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                </div>
            </div>
            <button type="button" id="calculate-distribution" class="btn btn-primary btn-sm">
                <i class="fas fa-calculator"></i> حساب التوزيع
            </button>
        </div>
    `;
    
    // إضافة الحقل بعد حقل المبيعات
    const salesField = salesInput.closest('.form-group');
    if (salesField && salesField.parentNode) {
        salesField.parentNode.insertBefore(distributionField, salesField.nextSibling);
        
        // إضافة مستمعي الأحداث
        document.getElementById('distribute-sales').addEventListener('change', function() {
            document.getElementById('sales-distribution-options').style.display = this.checked ? 'block' : 'none';
        });
        
        document.getElementById('calculate-distribution').addEventListener('click', function() {
            calculateSalesDistribution();
        });
    }
}

/**
 * حساب توزيع المبيعات بين الموظفين
 */
function calculateSalesDistribution() {
    const totalSales = parseFloat(document.getElementById('salary-sales').value) || 0;
    if (totalSales <= 0) {
        if (window.showNotification) {
            window.showNotification('يرجى إدخال قيمة المبيعات أولاً', 'warning');
        }
        return;
    }
    
    // الحصول على نسبة مساهمة الموظف
    const employeeContribution = parseFloat(document.getElementById('employee-contribution').value) || 70;
    if (employeeContribution <= 0 || employeeContribution > 100) {
        if (window.showNotification) {
            window.showNotification('يرجى إدخال نسبة مساهمة صحيحة بين 1 و 100', 'warning');
        }
        return;
    }
    
    // الحصول على عدد الموظفين المشاركين
    const contributingEmployeesSelect = document.getElementById('contributing-employees');
    const contributingEmployeesOption = contributingEmployeesSelect.value;
    
    // حساب عدد الموظفين الفعلي
    const activeEmployees = window.employees ? window.employees.filter(emp => emp.status === 'active') : [];
    const numEmployees = contributingEmployeesOption === 'all' ? 
        activeEmployees.length : parseInt(contributingEmployeesOption);
    
    if (numEmployees <= 0) {
        if (window.showNotification) {
            window.showNotification('لا يوجد موظفين نشطين للتوزيع', 'warning');
        }
        return;
    }
    
    // حساب المبيعات للموظف الحالي
    const currentEmployeeSales = totalSales * (employeeContribution / 100);
    
    // حساب المبيعات للموظفين الآخرين
    const otherEmployeesSales = totalSales - currentEmployeeSales;
    const salesPerOtherEmployee = numEmployees > 1 ? otherEmployeesSales / (numEmployees - 1) : 0;
    
    // عرض النتائج
    const resultsHTML = `
        <div class="sales-distribution-results" style="margin-top: 15px; padding: 10px; background-color: #f8f9fa; border-radius: 8px;">
            <h4 style="margin-top: 0;">نتائج توزيع المبيعات</h4>
            <ul style="padding-right: 20px; margin-bottom: 0;">
                <li>مبيعات الموظف الحالي: <strong>${formatCurrency(currentEmployeeSales)}</strong> (${employeeContribution}%)</li>
                <li>المبيعات الموزعة على الموظفين الآخرين: <strong>${formatCurrency(otherEmployeesSales)}</strong></li>
                ${numEmployees > 1 ? `<li>نصيب كل موظف آخر: <strong>${formatCurrency(salesPerOtherEmployee)}</strong></li>` : ''}
            </ul>
            <p style="margin-top: 10px; margin-bottom: 0;">تم تحديث مبيعات الموظف الحالي.</p>
        </div>
    `;
    
    // إضافة النتائج إلى النموذج
    const resultsContainer = document.getElementById('sales-distribution-results');
    if (resultsContainer) {
        resultsContainer.innerHTML = resultsHTML;
    } else {
        const distributionContainer = document.getElementById('sales-distribution-options');
        if (distributionContainer) {
            const resultsDiv = document.createElement('div');
            resultsDiv.id = 'sales-distribution-results';
            resultsDiv.innerHTML = resultsHTML;
            distributionContainer.appendChild(resultsDiv);
        }
    }
    
    // تحديث قيمة المبيعات للموظف الحالي
    document.getElementById('salary-sales').value = currentEmployeeSales.toFixed(0);
    
    // إعادة حساب الراتب
    if (typeof calculateTotalSalary === 'function') {
        calculateTotalSalary();
    }
}

/**
 * إعداد توزيع المبيعات بين الموظفين
 */
function setupSalesDistribution() {
    // إضافة نموذج توزيع المبيعات إلى صفحة المبيعات إذا كانت موجودة
    const transactionsPage = document.getElementById('transactions-page');
    if (!transactionsPage) return;
    
    // البحث عن قسم إضافة الإيداع
    const headerActions = transactionsPage.querySelector('.header-actions');
    if (!headerActions) return;
    
    // إضافة زر توزيع المبيعات
    const distributeSalesBtn = document.createElement('button');
    distributeSalesBtn.className = 'btn btn-primary';
    distributeSalesBtn.innerHTML = '<i class="fas fa-chart-pie"></i> <span>توزيع المبيعات</span>';
    distributeSalesBtn.style.marginRight = '10px';
    
    // إضافة الزر في بداية الإجراءات
    if (headerActions.firstChild) {
        headerActions.insertBefore(distributeSalesBtn, headerActions.firstChild);
    } else {
        headerActions.appendChild(distributeSalesBtn);
    }
    
    // إضافة مستمع حدث للزر
    distributeSalesBtn.addEventListener('click', function() {
        showSalesDistributionModal();
    });
    
    // إضافة نافذة توزيع المبيعات
    addSalesDistributionModal();
}

/**
 * إضافة نافذة توزيع المبيعات
 */
function addSalesDistributionModal() {
    // التحقق من وجود النافذة مسبقاً
    if (document.getElementById('sales-distribution-modal')) return;
    
    // إنشاء عنصر النافذة
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'sales-distribution-modal';
    
    modalOverlay.innerHTML = `
        <div class="modal animate__animated animate__fadeInUp">
            <div class="modal-header">
                <h3 class="modal-title">توزيع المبيعات بين الموظفين</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <form id="sales-distribution-form">
                    <div class="form-group">
                        <label class="form-label">إجمالي المبيعات</label>
                        <div class="input-group">
                            <input class="form-input" id="distribution-total-sales" min="0" required type="number" />
                            <button class="btn btn-icon-sm mic-btn" data-input="distribution-total-sales" type="button">
                                <i class="fas fa-microphone"></i>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">تاريخ العملية</label>
                        <input class="form-input" id="distribution-date" required type="date" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">ملاحظات</label>
                        <textarea class="form-input" id="distribution-notes" rows="2"></textarea>
                    </div>
                    
                    <h4 style="margin-top: 20px;">توزيع المبيعات</h4>
                    <div id="employees-distribution-container">
                        <!-- يتم ملؤها ديناميكياً -->
                        <div class="loader"></div>
                        <p class="text-center">جاري تحميل بيانات الموظفين...</p>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-close-btn">إلغاء</button>
                <button class="btn btn-primary" id="save-distribution-btn">توزيع وحفظ</button>
            </div>
        </div>
    `;
    
    // إضافة النافذة إلى الصفحة
    document.body.appendChild(modalOverlay);
    
    // إضافة مستمعي الأحداث
    modalOverlay.querySelector('.modal-close').addEventListener('click', function() {
        modalOverlay.classList.remove('active');
    });
    
    modalOverlay.querySelector('.modal-close-btn').addEventListener('click', function() {
        modalOverlay.classList.remove('active');
    });
    
    const saveButton = modalOverlay.querySelector('#save-distribution-btn');
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            saveSalesDistribution();
        });
    }
    
    // إضافة مستمع حدث لتحديث التوزيع عند تغيير إجمالي المبيعات
    const totalSalesInput = modalOverlay.querySelector('#distribution-total-sales');
    if (totalSalesInput) {
        totalSalesInput.addEventListener('change', function() {
            updateEmployeesSalesDistribution();
        });
        
        totalSalesInput.addEventListener('keyup', function() {
            updateEmployeesSalesDistribution();
        });
    }
}

/**
 * عرض نافذة توزيع المبيعات
 */
function showSalesDistributionModal() {
    const modal = document.getElementById('sales-distribution-modal');
    if (!modal) return;
    
    // تعيين تاريخ اليوم كتاريخ افتراضي
    const dateInput = document.getElementById('distribution-date');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    // تعيين إجمالي المبيعات من إحصائيات الشهر الحالي إذا كانت متاحة
    const totalSalesInput = document.getElementById('distribution-total-sales');
    if (totalSalesInput && window.currentMonthSales) {
        totalSalesInput.value = window.currentMonthSales;
    }
    
    // تحميل بيانات الموظفين
    loadEmployeesForDistribution();
    
    // عرض النافذة
    modal.classList.add('active');
}

/**
 * تحميل بيانات الموظفين لتوزيع المبيعات
 */
function loadEmployeesForDistribution() {
    const container = document.getElementById('employees-distribution-container');
    if (!container) return;
    
    // التحقق من وجود بيانات الموظفين
    if (!window.employees || window.employees.length === 0) {
        container.innerHTML = '<p class="text-center">لا يوجد موظفين متاحين للتوزيع</p>';
        return;
    }
    
    // تصفية الموظفين النشطين
    const activeEmployees = window.employees.filter(emp => emp.status === 'active');
    
    if (activeEmployees.length === 0) {
        container.innerHTML = '<p class="text-center">لا يوجد موظفين نشطين</p>';
        return;
    }
    
    // إنشاء نموذج توزيع المبيعات
    let html = `
        <div class="distribution-options">
            <div class="grid-cols-2">
                <div class="form-group">
                    <label class="form-label">طريقة التوزيع</label>
                    <select class="form-select" id="distribution-type">
                        <option value="equal">توزيع متساوي</option>
                        <option value="weighted">توزيع بالنسب</option>
                        <option value="manual">توزيع يدوي</option>
                    </select>
                </div>
                <div class="form-group" id="distribution-presets-container" style="display: none;">
                    <label class="form-label">النموذج</label>
                    <select class="form-select" id="distribution-preset">
                        <option value="manager-heavy">مدير ومساعدين (60/40)</option>
                        <option value="balanced">متوازن (40/30/30)</option>
                        <option value="team">فريق متساوي مع قائد</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div class="employees-distribution-list">
    `;
    
    // إضافة قائمة الموظفين
    activeEmployees.forEach((employee, index) => {
        html += `
            <div class="employee-distribution-item">
                <div class="employee-info">
                    <div class="employee-avatar">${employee.name.charAt(0)}</div>
                    <div>
                        <div class="employee-name">${employee.name}</div>
                        <div class="employee-job">${employee.jobTitle}</div>
                    </div>
                </div>
                <div class="employee-distribution">
                    <div class="distribution-controls">
                        <input type="range" class="distribution-range" id="employee-range-${employee.id}" 
                               min="0" max="100" value="${Math.floor(100 / activeEmployees.length)}" 
                               data-employee-id="${employee.id}">
                        <div class="distribution-value">
                            <input type="number" class="form-input distribution-percent" id="employee-percent-${employee.id}" 
                                   min="0" max="100" value="${Math.floor(100 / activeEmployees.length)}" 
                                   data-employee-id="${employee.id}">
                            <span>%</span>
                        </div>
                    </div>
                    <div class="distribution-amount" id="employee-amount-${employee.id}">-</div>
                </div>
            </div>
        `;
    });
    
    html += `
        </div>
        
        <div class="distribution-summary">
            <div class="distribution-total">
                <span>المجموع:</span>
                <span id="distribution-percent-total">100%</span>
            </div>
            <button type="button" class="btn btn-sm btn-outline" id="reset-distribution">
                <i class="fas fa-redo"></i> إعادة تعيين
            </button>
        </div>
    `;
    
    // تحديث المحتوى
    container.innerHTML = html;
    
    // إضافة أنماط CSS
    addDistributionStyles();
    
    // إضافة مستمعي الأحداث
    setupDistributionEventListeners();
    
    // تحديث عرض المبالغ
    updateEmployeesSalesDistribution();
}

/**
 * إضافة أنماط CSS لتوزيع المبيعات
 */
function addDistributionStyles() {
    // التحقق من وجود الأنماط مسبقاً
    if (document.getElementById('sales-distribution-styles')) return;
    
    // إنشاء عنصر نمط
    const styleElement = document.createElement('style');
    styleElement.id = 'sales-distribution-styles';
    
    // إضافة أنماط CSS
    styleElement.textContent = `
        .employees-distribution-list {
            margin-top: 20px;
            max-height: 400px;
            overflow-y: auto;
        }
        
        .employee-distribution-item {
            display: flex;
            align-items: center;
            padding: 10px;
            border-bottom: 1px solid #e9ecef;
        }
        
        .employee-distribution-item:last-child {
            border-bottom: none;
        }
        
        .employee-info {
            display: flex;
            align-items: center;
            min-width: 200px;
            margin-left: 20px;
        }
        
        .employee-avatar {
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
        
        .employee-name {
            font-weight: 500;
        }
        
        .employee-job {
            font-size: 0.85rem;
            color: #6c757d;
        }
        
        .employee-distribution {
            flex: 1;
            display: flex;
            align-items: center;
        }
        
        .distribution-controls {
            flex: 1;
            display: flex;
            align-items: center;
        }
        
        .distribution-range {
            flex: 1;
            margin-left: 10px;
        }
        
        .distribution-value {
            display: flex;
            align-items: center;
            width: 80px;
        }
        
        .distribution-percent {
            width: 60px;
            text-align: center;
            padding: 4px;
        }
        
        .distribution-amount {
            width: 120px;
            text-align: left;
            font-weight: 500;
        }
        
        .distribution-summary {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #e9ecef;
        }
        
        .distribution-total {
            font-weight: 700;
        }
        
        #distribution-percent-total {
            color: #3b82f6;
        }
        
        #distribution-percent-total.error {
            color: #ef4444;
        }
    `;
    
    // إضافة النمط إلى الصفحة
    document.head.appendChild(styleElement);
}

/**
 * إعداد مستمعي الأحداث لتوزيع المبيعات
 */
function setupDistributionEventListeners() {
    // مستمع حدث لتغيير نوع التوزيع
    const distributionTypeSelect = document.getElementById('distribution-type');
    if (distributionTypeSelect) {
        distributionTypeSelect.addEventListener('change', function() {
            const distributionType = this.value;
            
            // إظهار/إخفاء نماذج التوزيع
            const presetsContainer = document.getElementById('distribution-presets-container');
            if (presetsContainer) {
                presetsContainer.style.display = distributionType === 'weighted' ? 'block' : 'none';
            }
            
            // تحديث التوزيع حسب النوع
            if (distributionType === 'equal') {
                resetToEqualDistribution();
            } else if (distributionType === 'weighted') {
                applyDistributionPreset();
            }
        });
    }
    
    // مستمع حدث لتغيير نموذج التوزيع
    const distributionPresetSelect = document.getElementById('distribution-preset');
    if (distributionPresetSelect) {
        distributionPresetSelect.addEventListener('change', function() {
            applyDistributionPreset();
        });
    }
    
    // مستمعي أحداث لشرائط التمرير
    const rangeInputs = document.querySelectorAll('.distribution-range');
    rangeInputs.forEach(range => {
        range.addEventListener('input', function() {
           // تحديث حقل النسبة المئوية المقابل
           const employeeId = this.getAttribute('data-employee-id');
           const percentInput = document.getElementById(`employee-percent-${employeeId}`);
           if (percentInput) {
               percentInput.value = this.value;
           }
           
           // تحديث التوزيع
           updateEmployeesSalesDistribution();
           
           // تحديث نوع التوزيع إلى يدوي
           if (distributionTypeSelect) {
               distributionTypeSelect.value = 'manual';
           }
       });
   });
   
   // مستمعي أحداث لحقول النسبة المئوية
   const percentInputs = document.querySelectorAll('.distribution-percent');
   percentInputs.forEach(input => {
       input.addEventListener('change', function() {
           // تحديث شريط التمرير المقابل
           const employeeId = this.getAttribute('data-employee-id');
           const rangeInput = document.getElementById(`employee-range-${employeeId}`);
           if (rangeInput) {
               rangeInput.value = this.value;
           }
           
           // تحديث التوزيع
           updateEmployeesSalesDistribution();
           
           // تحديث نوع التوزيع إلى يدوي
           if (distributionTypeSelect) {
               distributionTypeSelect.value = 'manual';
           }
       });
   });
   
   // مستمع حدث لزر إعادة التعيين
   const resetButton = document.getElementById('reset-distribution');
   if (resetButton) {
       resetButton.addEventListener('click', function() {
           resetToEqualDistribution();
       });
   }
}

/**
* إعادة تعيين التوزيع إلى قيم متساوية
*/
function resetToEqualDistribution() {
   const activeEmployees = window.employees ? window.employees.filter(emp => emp.status === 'active') : [];
   if (activeEmployees.length === 0) return;
   
   const equalPercent = Math.floor(100 / activeEmployees.length);
   const remainder = 100 - (equalPercent * activeEmployees.length);
   
   activeEmployees.forEach((employee, index) => {
       // حساب النسبة مع إضافة الباقي للموظف الأول
       const percent = index === 0 ? equalPercent + remainder : equalPercent;
       
       // تحديث شريط التمرير
       const rangeInput = document.getElementById(`employee-range-${employee.id}`);
       if (rangeInput) {
           rangeInput.value = percent;
       }
       
       // تحديث حقل النسبة
       const percentInput = document.getElementById(`employee-percent-${employee.id}`);
       if (percentInput) {
           percentInput.value = percent;
       }
   });
   
   // تحديث التوزيع
   updateEmployeesSalesDistribution();
   
   // تحديث نوع التوزيع
   const distributionTypeSelect = document.getElementById('distribution-type');
   if (distributionTypeSelect) {
       distributionTypeSelect.value = 'equal';
   }
}

/**
* تطبيق نموذج توزيع
*/
function applyDistributionPreset() {
   const preset = document.getElementById('distribution-preset').value;
   const activeEmployees = window.employees ? window.employees.filter(emp => emp.status === 'active') : [];
   if (activeEmployees.length === 0) return;
   
   let percentages = [];
   
   switch (preset) {
       case 'manager-heavy':
           // 60% للمدير، 40% موزعة على الباقي
           if (activeEmployees.length === 1) {
               percentages = [100];
           } else {
               const managerPercent = 60;
               const otherPercent = Math.floor((100 - managerPercent) / (activeEmployees.length - 1));
               percentages = [managerPercent];
               
               for (let i = 1; i < activeEmployees.length; i++) {
                   percentages.push(otherPercent);
               }
               
               // توزيع الباقي
               const total = percentages.reduce((sum, p) => sum + p, 0);
               if (total < 100) {
                   percentages[0] += 100 - total;
               }
           }
           break;
           
       case 'balanced':
           // 40% للمدير، 30% للثاني، 30% موزعة على الباقي
           if (activeEmployees.length === 1) {
               percentages = [100];
           } else if (activeEmployees.length === 2) {
               percentages = [60, 40];
           } else {
               percentages = [40, 30];
               const remainingPercent = Math.floor(30 / (activeEmployees.length - 2));
               
               for (let i = 2; i < activeEmployees.length; i++) {
                   percentages.push(remainingPercent);
               }
               
               // توزيع الباقي
               const total = percentages.reduce((sum, p) => sum + p, 0);
               if (total < 100) {
                   percentages[0] += 100 - total;
               }
           }
           break;
           
       case 'team':
           // قائد الفريق يحصل على نسبة أعلى بقليل
           if (activeEmployees.length === 1) {
               percentages = [100];
           } else {
               const leaderBonus = Math.min(20, 100 / activeEmployees.length);
               const basePercent = Math.floor((100 - leaderBonus) / activeEmployees.length);
               
               percentages = [basePercent + leaderBonus];
               
               for (let i = 1; i < activeEmployees.length; i++) {
                   percentages.push(basePercent);
               }
               
               // توزيع الباقي
               const total = percentages.reduce((sum, p) => sum + p, 0);
               if (total < 100) {
                   percentages[0] += 100 - total;
               }
           }
           break;
           
       default:
           // توزيع متساوي
           const equalPercent = Math.floor(100 / activeEmployees.length);
           percentages = Array(activeEmployees.length).fill(equalPercent);
           
           // توزيع الباقي
           const total = percentages.reduce((sum, p) => sum + p, 0);
           if (total < 100) {
               percentages[0] += 100 - total;
           }
   }
   
   // تطبيق النسب على الموظفين
   activeEmployees.forEach((employee, index) => {
       const percent = percentages[index] || 0;
       
       // تحديث شريط التمرير
       const rangeInput = document.getElementById(`employee-range-${employee.id}`);
       if (rangeInput) {
           rangeInput.value = percent;
       }
       
       // تحديث حقل النسبة
       const percentInput = document.getElementById(`employee-percent-${employee.id}`);
       if (percentInput) {
           percentInput.value = percent;
       }
   });
   
   // تحديث التوزيع
   updateEmployeesSalesDistribution();
}

/**
* تحديث توزيع المبيعات على الموظفين
*/
function updateEmployeesSalesDistribution() {
   const totalSales = parseFloat(document.getElementById('distribution-total-sales').value) || 0;
   
   // جمع النسب المئوية لجميع الموظفين
   const percentInputs = document.querySelectorAll('.distribution-percent');
   let totalPercent = 0;
   
   percentInputs.forEach(input => {
       totalPercent += parseFloat(input.value) || 0;
   });
   
   // عرض إجمالي النسب
   const percentTotalElement = document.getElementById('distribution-percent-total');
   if (percentTotalElement) {
       percentTotalElement.textContent = `${totalPercent}%`;
       
       // إضافة تنسيق للخطأ إذا كان الإجمالي ليس 100%
       if (Math.abs(totalPercent - 100) > 0.1) {
           percentTotalElement.classList.add('error');
       } else {
           percentTotalElement.classList.remove('error');
       }
   }
   
   // تحديث مبالغ التوزيع
   percentInputs.forEach(input => {
       const employeeId = input.getAttribute('data-employee-id');
       const percent = parseFloat(input.value) || 0;
       const amount = totalSales * (percent / 100);
       
       // تحديث عنصر المبلغ
       const amountElement = document.getElementById(`employee-amount-${employeeId}`);
       if (amountElement) {
           amountElement.textContent = formatCurrency(amount);
       }
   });
}

/**
* حفظ توزيع المبيعات
*/
function saveSalesDistribution() {
   // التحقق من البيانات المطلوبة
   const totalSales = parseFloat(document.getElementById('distribution-total-sales').value) || 0;
   const distributionDate = document.getElementById('distribution-date').value;
   const notes = document.getElementById('distribution-notes').value || '';
   
   if (totalSales <= 0 || !distributionDate) {
       if (window.showNotification) {
           window.showNotification('يرجى إدخال إجمالي المبيعات وتاريخ العملية', 'error');
       }
       return;
   }
   
   // جمع توزيع المبيعات
   const distribution = [];
   const percentInputs = document.querySelectorAll('.distribution-percent');
   let totalPercent = 0;
   
   percentInputs.forEach(input => {
       const employeeId = input.getAttribute('data-employee-id');
       const percent = parseFloat(input.value) || 0;
       totalPercent += percent;
       
       const amount = totalSales * (percent / 100);
       
       // البحث عن الموظف
       const employee = window.employees.find(emp => emp.id === employeeId);
       if (employee) {
           distribution.push({
               employeeId,
               employeeName: employee.name,
               percent,
               amount
           });
       }
   });
   
   // التحقق من صحة النسب
   if (Math.abs(totalPercent - 100) > 0.1) {
       if (window.showNotification) {
           window.showNotification('مجموع النسب المئوية يجب أن يكون 100%', 'error');
       }
       return;
   }
   
   // إنشاء توزيع المبيعات
   const salesDistribution = {
       id: Date.now().toString(),
       date: distributionDate,
       totalSales,
       notes,
       distribution,
       createdAt: new Date().toISOString()
   };
   
   try {
       // حفظ توزيع المبيعات
       saveSalesDistributionRecord(salesDistribution);
       
       // إضافة معاملات للموظفين
       addSalesTransactionsForEmployees(salesDistribution);
       
       // إغلاق النافذة
       const modal = document.getElementById('sales-distribution-modal');
       if (modal) {
           modal.classList.remove('active');
       }
       
       // عرض إشعار النجاح
       if (window.showNotification) {
           window.showNotification('تم توزيع المبيعات بنجاح', 'success');
       }
   } catch (error) {
       console.error('خطأ في حفظ توزيع المبيعات:', error);
       if (window.showNotification) {
           window.showNotification('حدث خطأ أثناء حفظ توزيع المبيعات', 'error');
       }
   }
}

/**
* حفظ سجل توزيع المبيعات
* @param {Object} salesDistribution - توزيع المبيعات
*/
function saveSalesDistributionRecord(salesDistribution) {
   // إضافة توزيع المبيعات إلى التخزين المحلي
   const savedDistributions = localStorage.getItem('salesDistributions');
   let salesDistributions = [];
   
   if (savedDistributions) {
       try {
           salesDistributions = JSON.parse(savedDistributions);
       } catch (error) {
           console.error('خطأ في تحليل بيانات توزيع المبيعات:', error);
       }
   }
   
   // إضافة التوزيع الجديد
   salesDistributions.push(salesDistribution);
   
   // حفظ البيانات في التخزين المحلي
   localStorage.setItem('salesDistributions', JSON.stringify(salesDistributions));
   
   // تخزين البيانات في المتغير العالمي
   window.salesDistributions = salesDistributions;
   
   console.log('تم حفظ توزيع المبيعات بنجاح');
}

/**
* إضافة معاملات للموظفين بناءً على توزيع المبيعات
* @param {Object} salesDistribution - توزيع المبيعات
*/
function addSalesTransactionsForEmployees(salesDistribution) {
   // إضافة إيداع لكل موظف حسب حصته
   salesDistribution.distribution.forEach(item => {
       if (item.amount <= 0) return;
       
       // إضافة معاملة إيداع
       if (typeof window.addTransaction === 'function') {
           window.addTransaction(
               'إيداع', // نوع العملية
               item.employeeId, // معرف المستثمر (الموظف)
               item.amount, // المبلغ
               `توزيع مبيعات - ${salesDistribution.notes}` // ملاحظات
           );
       }
   });
   
   console.log('تم إضافة معاملات توزيع المبيعات للموظفين');
}

/**
* إضافة تكامل مع النظام المالي
*/
function setupFinancialIntegration() {
   // ربط دفع الرواتب بسجل العمليات المالية
   setupSalaryTransactionIntegration();
   
   // إضافة تقارير رواتب الموظفين إلى نظام التقارير
   setupEmployeeReportsIntegration();
   
   // ربط نظام الموظفين بنظام المصروفات
   setupExpensesIntegration();
}

/**
* ربط دفع الرواتب بسجل العمليات المالية
*/
function setupSalaryTransactionIntegration() {
   // التنصت على أحداث دفع الرواتب
   document.body.addEventListener('click', function(e) {
       // التحقق من أن الزر هو زر تأكيد دفع الراتب
       const confirmButton = e.target.closest('#confirm-pay-salary-btn');
       if (!confirmButton) return;
       
       // إضافة مستمع حدث لما بعد دفع الراتب
       setTimeout(() => {
           const salaryDetailsContent = document.getElementById('salary-details-content');
           if (!salaryDetailsContent) return;
           
           // إضافة زر إضافة العملية للسجل المالي
           const addToTransactionsButton = document.createElement('button');
           addToTransactionsButton.className = 'btn btn-primary no-print';
           addToTransactionsButton.style.marginRight = '10px';
           addToTransactionsButton.innerHTML = '<i class="fas fa-exchange-alt"></i> إضافة للسجل المالي';
           
           // إضافة الزر قبل زر الطباعة
           const printButton = document.getElementById('print-salary-details-btn');
           if (printButton && printButton.parentNode) {
               printButton.parentNode.insertBefore(addToTransactionsButton, printButton);
               
               // إضافة مستمع حدث للزر
               addToTransactionsButton.addEventListener('click', function() {
                   // استخراج معرف معاملة الراتب من عنوان النافذة
                   const modalTitle = document.querySelector('#salary-details-modal .modal-title').textContent;
                   const employeeName = modalTitle.replace('تفاصيل راتب - ', '');
                   
                   // البحث عن معاملة الراتب الأخيرة للموظف
                   const latestSalaryTransaction = window.salaryTransactions.find(tr => 
                       tr.employeeName === employeeName
                   );
                   
                   if (latestSalaryTransaction) {
                       // إضافة العملية إلى سجل العمليات المالية
                       addSalaryToFinancialTransactions(latestSalaryTransaction);
                   } else {
                       if (window.showNotification) {
                           window.showNotification('لم يتم العثور على معاملة الراتب', 'error');
                       }
                   }
               });
           }
       }, 500);
   });
}

/**
* إضافة معاملة راتب إلى سجل العمليات المالية
* @param {Object} salaryTransaction - معاملة الراتب
*/
function addSalaryToFinancialTransactions(salaryTransaction) {
   // التحقق من وجود دالة إضافة العمليات
   if (typeof window.addTransaction !== 'function') {
       if (window.showNotification) {
           window.showNotification('لا يمكن إضافة العملية للسجل المالي، النظام غير متاح', 'error');
       }
       return;
   }
   
   try {
       // إنشاء معاملة جديدة
       const transactionData = {
           type: 'سحب', // نوع العملية
           investorId: 'expenses-account', // حساب النفقات
           amount: salaryTransaction.totalSalary, // المبلغ
           notes: `دفع راتب للموظف ${salaryTransaction.employeeName} - ${getArabicMonthName(salaryTransaction.month)}` // ملاحظات
       };
       
       // إضافة العملية للسجل المالي
       window.addTransaction(
           transactionData.type,
           transactionData.investorId,
           transactionData.amount,
           transactionData.notes
       );
       
       if (window.showNotification) {
           window.showNotification('تم إضافة الراتب للسجل المالي بنجاح', 'success');
       }
       
       // إغلاق النافذة المنبثقة
       const modal = document.getElementById('salary-details-modal');
       if (modal) {
           modal.classList.remove('active');
       }
       
   } catch (error) {
       console.error('خطأ في إضافة الراتب للسجل المالي:', error);
       if (window.showNotification) {
           window.showNotification('حدث خطأ أثناء إضافة الراتب للسجل المالي', 'error');
       }
   }
}

/**
* إضافة تقارير رواتب الموظفين إلى نظام التقارير
*/
function setupEmployeeReportsIntegration() {
   // إذا كان هناك صفحة تقارير، إضافة تبويب للموظفين
   const reportsPage = document.getElementById('reports-page');
   if (!reportsPage) return;
   
   // البحث عن أزرار التبويبات
   const tabButtons = reportsPage.querySelector('.tab-buttons');
   if (!tabButtons) return;
   
   // إضافة تبويب للموظفين
   const employeesTabButton = document.createElement('button');
   employeesTabButton.className = 'btn btn-outline';
   employeesTabButton.textContent = 'الموظفين';
   
   // إضافة الزر إلى الأزرار
   tabButtons.appendChild(employeesTabButton);
   
   // إضافة مستمع حدث للزر
   employeesTabButton.addEventListener('click', function() {
       // إزالة الفئة النشطة من جميع الأزرار
       tabButtons.querySelectorAll('.btn').forEach(btn => {
           btn.classList.remove('active');
       });
       
       // إضافة الفئة النشطة للزر الحالي
       this.classList.add('active');
       
       // عرض تقارير الموظفين
       showEmployeesInReports();
   });
}

/**
* ربط نظام الموظفين بنظام المصروفات
*/
function setupExpensesIntegration() {
    // إذا كان هناك صفحة مصروفات، إضافة قسم لمصروفات الموظفين
    const dashboard = document.getElementById('dashboard-page');
    if (!dashboard) return;
    
    // البحث عن قسم الإحصائيات
    const statisticsSection = dashboard.querySelector('.dashboard-cards');
    if (!statisticsSection) return;
    
    // إضافة بطاقة مصروفات الموظفين
    const employeeExpensesCard = document.createElement('div');
    employeeExpensesCard.className = 'card';
    employeeExpensesCard.innerHTML = `
         <div class="card-pattern">
              <i class="fas fa-user-tie"></i>
         </div>
         <div class="card-header">
              <div>
                    <div class="card-title">مصروفات الموظفين</div>
                    <div class="card-value" id="employee-expenses">0 دينار</div>
                    <div class="card-change">
                         <i class="fas fa-calendar-check"></i>
                         <span>الشهر الحالي</span>
                    </div>
              </div>
              <div class="card-icon warning">
                    <i class="fas fa-money-bill-wave"></i>
              </div>
         </div>
    `;
    
    // إضافة البطاقة إلى قسم الإحصائيات
    statisticsSection.appendChild(employeeExpensesCard);
    
    // تحديث البطاقة
    updateEmployeeExpensesCard();
    
    // تحديث البطاقة عند تحديث لوحة التحكم
    const originalUpdateDashboard = window.updateDashboard;
    if (typeof originalUpdateDashboard === 'function') {
         window.updateDashboard = function() {
              // استدعاء الدالة الأصلية
              originalUpdateDashboard.apply(this, arguments);
              
              // تحديث بطاقة مصروفات الموظفين
              updateEmployeeExpensesCard();
         };
    }

    // إضافة مستمع أحداث لتحديث البطاقة عند صرف الرواتب
    document.addEventListener('salary:paid', function() {
         updateEmployeeExpensesCard();
    });
}

/**
* تحديث بطاقة مصروفات الموظفين
*/
function updateEmployeeExpensesCard() {
    // البحث عن معاملات رواتب الموظفين للشهر الحالي
    if (!window.salaryTransactions) return;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // تصفية معاملات الرواتب للشهر الحالي
    const currentMonthSalaries = window.salaryTransactions.filter(salary => {
         const salaryDate = new Date(salary.date);
         return salaryDate.getMonth() === currentMonth && 
                  salaryDate.getFullYear() === currentYear;
    });
    
    // حساب إجمالي مصروفات الموظفين
    const totalExpenses = currentMonthSalaries.reduce((total, salary) => 
         total + (salary.totalSalary || 0), 0);
    
    // تحديث القيمة في البطاقة
    const expensesElement = document.getElementById('employee-expenses');
    if (expensesElement) {
         expensesElement.textContent = formatCurrency(totalExpenses);
    }
}

/**
* عرض تقارير الموظفين في صفحة التقارير
*/
function showEmployeesInReports() {
   // العثور على حاوية المحتوى
   const reportsContent = document.querySelector('#reports-page .grid-cols-2');
   if (!reportsContent) return;
   
   // إنشاء محتوى تقارير الموظفين
   reportsContent.innerHTML = `
       <div class="section">
           <div class="section-header">
               <h2 class="section-title">توزيع رواتب الموظفين</h2>
           </div>
           <div class="chart-container">
               <canvas id="employees-salaries-report-chart"></canvas>
           </div>
       </div>
       <div class="section">
           <div class="section-header">
               <h2 class="section-title">أداء الموظفين (المبيعات)</h2>
           </div>
           <div class="chart-container">
               <canvas id="employees-performance-report-chart"></canvas>
           </div>
       </div>
   `;
   
   // إنشاء الرسوم البيانية
   if (window.Chart && window.employees && window.salaryTransactions) {
       // رسم توزيع الرواتب
       renderEmployeesSalariesReportChart();
       
       // رسم أداء الموظفين
       renderEmployeesPerformanceReportChart();
   }
}

/**
* رسم مخطط توزيع رواتب الموظفين في التقارير
*/
function renderEmployeesSalariesReportChart() {
   const canvas = document.getElementById('employees-salaries-report-chart');
   if (!canvas) return;
   
   // تجميع بيانات الرواتب
   const employeeSalaries = {};
   
   window.salaryTransactions.forEach(transaction => {
       if (!employeeSalaries[transaction.employeeId]) {
           employeeSalaries[transaction.employeeId] = {
               name: transaction.employeeName,
               baseSalary: 0,
               commission: 0,
               total: 0
           };
       }
       
       employeeSalaries[transaction.employeeId].baseSalary += transaction.baseSalary || 0;
       employeeSalaries[transaction.employeeId].commission += transaction.commissionAmount || 0;
       employeeSalaries[transaction.employeeId].total += transaction.totalSalary || 0;
   });
   
   // تحويل البيانات إلى مصفوفات
   const labels = [];
   const baseSalaryData = [];
   const commissionData = [];
   
   Object.values(employeeSalaries).forEach(salary => {
       labels.push(salary.name);
       baseSalaryData.push(salary.baseSalary);
       commissionData.push(salary.commission);
   });
   
   // إنشاء الرسم البياني
   new Chart(canvas.getContext('2d'), {
       type: 'bar',
       data: {
           labels: labels,
           datasets: [
               {
                   label: 'الراتب الأساسي',
                   data: baseSalaryData,
                   backgroundColor: 'rgba(59, 130, 246, 0.7)'
               },
               {
                   label: 'العمولات',
                   data: commissionData,
                   backgroundColor: 'rgba(16, 185, 129, 0.7)'
               }
           ]
       },
       options: {
           responsive: true,
           maintainAspectRatio: false,
           plugins: {
               title: {
                   display: true,
                   text: 'توزيع رواتب الموظفين'
               }
           },
           scales: {
               x: {
                   stacked: true
               },
               y: {
                   stacked: true,
                   beginAtZero: true
               }
           }
       }
   });
}

/**
* رسم مخطط أداء الموظفين في التقارير
*/
function renderEmployeesPerformanceReportChart() {
   const canvas = document.getElementById('employees-performance-report-chart');
   if (!canvas) return;
   
   // تجميع بيانات المبيعات
   const employeeSales = {};
   
   window.salaryTransactions.forEach(transaction => {
       if (!employeeSales[transaction.employeeId]) {
           employeeSales[transaction.employeeId] = {
               name: transaction.employeeName,
               sales: 0
           };
       }
       
       employeeSales[transaction.employeeId].sales += transaction.sales || 0;
   });
   
   // تحويل البيانات إلى مصفوفات
   const data = Object.values(employeeSales).map(sale => ({
       name: sale.name,
       sales: sale.sales
   }));
   
   // ترتيب البيانات تنازلياً حسب المبيعات
   data.sort((a, b) => b.sales - a.sales);
   new Chart(canvas.getContext('2d'), {
    type: 'pie',
    data: {
        labels: data.map(item => item.name),
        datasets: [{
            data: data.map(item => item.sales),
            backgroundColor: [
                'rgba(59, 130, 246, 0.7)',
                'rgba(16, 185, 129, 0.7)',
                'rgba(245, 158, 11, 0.7)',
                'rgba(239, 68, 68, 0.7)',
                'rgba(139, 92, 246, 0.7)',
                'rgba(236, 72, 153, 0.7)'
            ]
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'توزيع المبيعات حسب الموظفين'
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = formatCurrency(context.raw);
                        const percentage = ((context.raw / data.reduce((sum, item) => sum + item.sales, 0)) * 100).toFixed(1) + '%';
                        return `${label}: ${value} (${percentage})`;
                    }
                }
            }
        }
    }
});
}

/**
* إضافة تحسين لعرض تفاصيل الموظف
*/
function enhanceEmployeeDetails() {
// إضافة مستمع حدث لعرض تفاصيل الموظف
document.body.addEventListener('click', function(e) {
    // التحقق من أن الزر هو زر عرض تفاصيل الموظف
    const viewButton = e.target.closest('.view-employee');
    if (!viewButton) return;
    
    // الحصول على معرف الموظف
    const employeeId = viewButton.getAttribute('data-id');
    if (!employeeId) return;
    
    // إضافة إحصائيات المبيعات لعرض تفاصيل الموظف
    setTimeout(() => {
        addSalesStatisticsToEmployeeDetails(employeeId);
    }, 500);
});
}

/**
* إضافة إحصائيات المبيعات لعرض تفاصيل الموظف
* @param {string} employeeId - معرف الموظف
*/
function addSalesStatisticsToEmployeeDetails(employeeId) {
const detailsContent = document.getElementById('employee-details-content');
if (!detailsContent) return;

// البحث عن آخر قسم في التفاصيل (سجل الرواتب)
const lastCard = detailsContent.querySelector('.employee-detail-card:last-child');
if (!lastCard) return;

// إنشاء قسم إحصائيات المبيعات
const salesStatsCard = document.createElement('div');
salesStatsCard.className = 'employee-detail-card';
salesStatsCard.innerHTML = `
    <h4><i class="fas fa-chart-line"></i> إحصائيات المبيعات</h4>
    <div id="employee-sales-stats">
        <div class="loader" style="margin: 20px auto;"></div>
        <p class="text-center">جاري تحميل إحصائيات المبيعات...</p>
    </div>
`;

// إضافة القسم قبل سجل الرواتب
lastCard.parentNode.insertBefore(salesStatsCard, lastCard);

// تحميل إحصائيات المبيعات
loadEmployeeSalesStatistics(employeeId);
}

/**
* تحميل إحصائيات المبيعات للموظف
* @param {string} employeeId - معرف الموظف
*/
function loadEmployeeSalesStatistics(employeeId) {
const statsContainer = document.getElementById('employee-sales-stats');
if (!statsContainer) return;

// التحقق من وجود بيانات المعاملات
if (!window.transactions) {
    statsContainer.innerHTML = '<p class="text-center">لا يمكن تحميل إحصائيات المبيعات</p>';
    return;
}

try {
    // الحصول على إحصائيات المبيعات للموظف
    const employee = window.employees.find(emp => emp.id === employeeId);
    if (!employee) throw new Error('لم يتم العثور على الموظف');
    
    // حساب إحصائيات المبيعات للأشهر الستة الماضية
    const months = [];
    const monthlySales = [];
    const monthlyCommissions = [];
    
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
        // حساب الشهر
        const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = month.toLocaleDateString('ar-EG', { month: 'short' });
        months.push(monthName);
        
        // إيجاد معاملات رواتب الموظف لهذا الشهر
        const monthSalary = window.salaryTransactions?.find(salary => {
            const salaryDate = new Date(salary.date);
            return salary.employeeId === employeeId && 
                   salaryDate.getMonth() === month.getMonth() && 
                   salaryDate.getFullYear() === month.getFullYear();
        });
        
        // إضافة المبيعات والعمولات
        monthlySales.push(monthSalary ? monthSalary.sales : 0);
        monthlyCommissions.push(monthSalary ? monthSalary.commissionAmount : 0);
    }
    
    // حساب المتوسط والإجماليات
    const totalSales = monthlySales.reduce((a, b) => a + b, 0);
    const totalCommissions = monthlyCommissions.reduce((a, b) => a + b, 0);
    const avgMonthlySales = totalSales / (monthlySales.filter(s => s > 0).length || 1);
    const avgMonthlyCommission = totalCommissions / (monthlyCommissions.filter(c => c > 0).length || 1);
    
    // إنشاء عرض الإحصائيات
    let statsHTML = `
        <div class="sales-statistics">
            <div class="grid-cols-2">
                <div class="stat-card">
                    <div class="stat-title">إجمالي المبيعات (6 أشهر)</div>
                    <div class="stat-value">${formatCurrency(totalSales)}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">إجمالي العمولات (6 أشهر)</div>
                    <div class="stat-value">${formatCurrency(totalCommissions)}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">متوسط المبيعات الشهرية</div>
                    <div class="stat-value">${formatCurrency(avgMonthlySales)}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">متوسط العمولة الشهرية</div>
                    <div class="stat-value">${formatCurrency(avgMonthlyCommission)}</div>
                </div>
            </div>
            
            <div class="chart-container" style="height: 200px; margin-top: 20px;">
                <canvas id="employee-sales-chart"></canvas>
            </div>
            
            <div class="sales-performance" style="margin-top: 20px;">
                <h5 style="margin-bottom: 10px;">تحليل الأداء</h5>
                <div class="performance-metric">
                    <div class="metric-label">نسبة العمولة:</div>
                    <div class="metric-value">${employee.commissionRate}%</div>
                </div>
                <div class="performance-metric">
                    <div class="metric-label">نسبة العمولة من إجمالي المبيعات:</div>
                    <div class="metric-value">${totalSales > 0 ? ((totalCommissions / totalSales) * 100).toFixed(2) : 0}%</div>
                </div>
                <div class="performance-metric">
                    <div class="metric-label">اتجاه المبيعات:</div>
                    <div class="metric-value">
                        ${getSalesTrend(monthlySales)}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // إضافة أنماط CSS
    addSalesStatisticsStyles();
    
    // تحديث المحتوى
    statsContainer.innerHTML = statsHTML;
    
    // إنشاء الرسم البياني
    if (window.Chart) {
        const ctx = document.getElementById('employee-sales-chart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'المبيعات',
                        data: monthlySales,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'العمولات',
                        data: monthlyCommissions,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
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
    
} catch (error) {
    console.error('خطأ في تحميل إحصائيات المبيعات للموظف:', error);
    statsContainer.innerHTML = '<p class="text-center">تعذر تحميل إحصائيات المبيعات</p>';
}
}

/**
* تحليل اتجاه المبيعات
* @param {Array} sales - مصفوفة المبيعات
* @returns {string} - وصف اتجاه المبيعات مع أيقونة
*/
function getSalesTrend(sales) {
if (sales.length < 2) return 'غير متوفر';

// حساب متوسط التغير
let totalChange = 0;
let numChanges = 0;

for (let i = 1; i < sales.length; i++) {
    if (sales[i-1] > 0 && sales[i] > 0) {
        const change = sales[i] - sales[i-1];
        totalChange += change;
        numChanges++;
    }
}

const avgChange = numChanges > 0 ? totalChange / numChanges : 0;

// تحديد الاتجاه
if (Math.abs(avgChange) < 1000) {
    return '<i class="fas fa-equals" style="color: #6c757d;"></i> مستقر';
} else if (avgChange > 0) {
    return '<i class="fas fa-arrow-up" style="color: #10b981;"></i> متزايد';
} else {
    return '<i class="fas fa-arrow-down" style="color: #ef4444;"></i> متناقص';
}
}

/**
* إضافة أنماط CSS لإحصائيات المبيعات
*/
function addSalesStatisticsStyles() {
// التحقق من وجود الأنماط مسبقاً
if (document.getElementById('sales-statistics-styles')) return;

// إنشاء عنصر نمط
const styleElement = document.createElement('style');
styleElement.id = 'sales-statistics-styles';

// إضافة أنماط CSS
styleElement.textContent = `
    .sales-statistics .grid-cols-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-bottom: 10px;
    }
    
    .sales-statistics .stat-card {
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 10px;
        text-align: center;
    }
    
    .sales-statistics .stat-title {
        font-size: 0.85rem;
        color: #6c757d;
        margin-bottom: 5px;
    }
    
    .sales-statistics .stat-value {
        font-size: 1.2rem;
        font-weight: 600;
        color: #3b82f6;
    }
    
    .sales-performance {
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 10px 15px;
    }
    
    .sales-performance h5 {
        color: #3b82f6;
        font-weight: 600;
        margin-top: 0;
    }
    
    .performance-metric {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
        font-size: 0.9rem;
    }
    
    .metric-label {
        color: #6c757d;
    }
    
    .metric-value {
        font-weight: 500;
    }
`;

// إضافة عنصر النمط إلى الصفحة
document.head.appendChild(styleElement);
}

/**
* إعداد تكامل مع نظام المصادقة
*/
function setupAuthIntegration() {
// تعيين الصلاحيات للصفحات
addPagePermissions();

// ربط صلاحيات المستخدمين
linkUserPermissions();

// إضافة تكامل مع نظام المصادقة
enhanceAuthSystem();
}

/**
* إضافة صلاحيات الصفحات
*/
function addPagePermissions() {
// إذا كان هناك نظام صلاحيات، إضافة صلاحيات للصفحة
if (typeof window.PermissionsSystem !== 'undefined') {
    // إضافة صفحة الموظفين إلى قائمة الصفحات المحمية
    if (window.PermissionsSystem.addProtectedPage) {
        window.PermissionsSystem.addProtectedPage('employees', ['admin', 'manager', 'hr']);
    }
}
}

/**
* ربط صلاحيات المستخدمين
*/
function linkUserPermissions() {
// إضافة مستمع حدث للتحقق من صلاحيات الوصول
document.addEventListener('page:change', function(e) {
    if (e.detail && e.detail.page === 'employees') {
        // التحقق من صلاحيات المستخدم للوصول إلى صفحة الموظفين
        checkEmployeesPageAccess();
    }
});
}

/**
* تحسين نظام المصادقة
*/
function enhanceAuthSystem() {
// التحقق من وجود نظام المصادقة
if (typeof window.AuthSystem === 'undefined') return;

// إضافة تكامل مع صلاحيات نظام الموظفين
const originalHasPermission = window.AuthSystem.hasPermission;
if (typeof originalHasPermission === 'function') {
    window.AuthSystem.hasPermission = function(permission) {
        // استدعاء الدالة الأصلية
        const result = originalHasPermission.call(this, permission);
        
        // إضافة صلاحيات خاصة بالموظفين
        if (permission === 'employees-manage') {
            // التحقق مما إذا كان المستخدم مسؤول أو مدير أو موارد بشرية
            const userRole = this.getUserRole();
            return userRole === 'admin' || userRole === 'manager' || userRole === 'hr';
        }
        
        return result;
    };
}
}

/**
* التحقق من صلاحيات الوصول لصفحة الموظفين
*/
function checkEmployeesPageAccess() {
// التحقق من وجود نظام صلاحيات
if (typeof window.AuthSystem !== 'undefined' && window.AuthSystem.hasPermission) {
    if (!window.AuthSystem.hasPermission('employees')) {
        // عرض رسالة خطأ وإعادة التوجيه
        if (window.showNotification) {
            window.showNotification('ليس لديك صلاحية للوصول إلى صفحة الموظفين', 'error');
        }
        
        // العودة إلى الصفحة الرئيسية
        const dashboardLink = document.querySelector('a[data-page="dashboard"]');
        if (dashboardLink) {
            dashboardLink.click();
        }
    }
}
}

/**
* الحصول على اسم الشهر بالعربية
* @param {string|number} month - رقم الشهر (1-12)
* @returns {string} - اسم الشهر بالعربية
*/
function getArabicMonthName(month) {
// استخدام الدالة من وحدة الموظفين إذا كانت متاحة
if (typeof window.getArabicMonthName === 'function') {
    return window.getArabicMonthName(month);
}

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

// تحويل المبلغ إلى رقم
amount = parseFloat(amount);

// تنسيق المبلغ
const formattedAmount = amount.toLocaleString('ar-IQ');

// إعادة المبلغ مع إضافة العملة إذا تم طلب ذلك
return addCurrency ? `${formattedAmount} دينار` : formattedAmount;
}

// بدء تنفيذ النظام
console.log('تم تهيئة تكامل نظام إدارة الموظفين بنجاح');





/**
 * employees-permissions.js
 * صلاحيات نظام إدارة الموظفين
 * يوفر ربط نظام الصلاحيات مع نظام إدارة الموظفين
 */

(function() {
    // تهيئة النظام عند تحميل الصفحة
    document.addEventListener('DOMContentLoaded', function() {
        console.log('تهيئة صلاحيات نظام إدارة الموظفين...');
        
        // تعريف صلاحيات الموظفين
        defineEmployeePermissions();
        
        // إضافة واجهة إدارة الصلاحيات
        addPermissionsUI();
        
        // ربط نظام الصلاحيات بوظائف الموظفين
        setupPermissionsIntegration();
    });
    
    /**
     * تعريف صلاحيات الموظفين
     */
    function defineEmployeePermissions() {
        // التحقق من وجود نظام الصلاحيات
        if (typeof window.PermissionsSystem === 'undefined') {
            console.warn('لم يتم العثور على نظام الصلاحيات');
            return;
        }
        
        // إضافة صلاحيات الموظفين
        const employeePermissions = [
            { key: 'employees-view', name: 'عرض الموظفين', description: 'عرض قائمة الموظفين وتفاصيلهم' },
            { key: 'employees-add', name: 'إضافة موظفين', description: 'إضافة موظفين جدد للنظام' },
            { key: 'employees-edit', name: 'تعديل الموظفين', description: 'تعديل بيانات الموظفين' },
            { key: 'employees-delete', name: 'حذف الموظفين', description: 'حذف الموظفين من النظام' },
            { key: 'employees-salary', name: 'إدارة الرواتب', description: 'صرف الرواتب وتعديلها' },
            { key: 'employees-reports', name: 'تقارير الموظفين', description: 'عرض تقارير الموظفين والرواتب' },
        ];
        
        // إضافة الصلاحيات إلى النظام
        window.PermissionsSystem.addPermissions('employees', employeePermissions);
        
        // ربط الصلاحيات بالأدوار
        window.PermissionsSystem.assignPermissionToRole('admin', 'employees-view');
        window.PermissionsSystem.assignPermissionToRole('admin', 'employees-add');
        window.PermissionsSystem.assignPermissionToRole('admin', 'employees-edit');
        window.PermissionsSystem.assignPermissionToRole('admin', 'employees-delete');
        window.PermissionsSystem.assignPermissionToRole('admin', 'employees-salary');
        window.PermissionsSystem.assignPermissionToRole('admin', 'employees-reports');
        
        window.PermissionsSystem.assignPermissionToRole('manager', 'employees-view');
        window.PermissionsSystem.assignPermissionToRole('manager', 'employees-add');
        window.PermissionsSystem.assignPermissionToRole('manager', 'employees-edit');
        window.PermissionsSystem.assignPermissionToRole('manager', 'employees-salary');
        window.PermissionsSystem.assignPermissionToRole('manager', 'employees-reports');
        
        window.PermissionsSystem.assignPermissionToRole('hr', 'employees-view');
        window.PermissionsSystem.assignPermissionToRole('hr', 'employees-add');
        window.PermissionsSystem.assignPermissionToRole('hr', 'employees-edit');
        window.PermissionsSystem.assignPermissionToRole('hr', 'employees-salary');
        
        window.PermissionsSystem.assignPermissionToRole('user', 'employees-view');
    }
    
    /**
     * إضافة واجهة إدارة الصلاحيات
     */
    function addPermissionsUI() {
        // التحقق من وجود صفحة الإعدادات
        const settingsPage = document.getElementById('settings-page');
        if (!settingsPage) return;
        
        // البحث عن تبويبات الإعدادات
        const tabButtons = settingsPage.querySelector('.tab-buttons');
        if (!tabButtons) return;
        
        // إضافة تبويب الصلاحيات إذا لم يكن موجوداً
        if (!document.querySelector('button[data-tab="permissions"]')) {
            const permissionsTabButton = document.createElement('button');
            permissionsTabButton.className = 'tab-btn';
            permissionsTabButton.setAttribute('data-tab', 'permissions');
            permissionsTabButton.textContent = 'الصلاحيات';
            
            // إضافة التبويب إلى الأزرار
            tabButtons.appendChild(permissionsTabButton);
            
            // إضافة محتوى تبويب الصلاحيات
            addPermissionsTabContent(settingsPage);
        }
    }
    
    /**
     * إضافة محتوى تبويب الصلاحيات
     * @param {HTMLElement} settingsPage - صفحة الإعدادات
     */
    function addPermissionsTabContent(settingsPage) {
        // التحقق من عدم وجود التبويب مسبقاً
        if (document.getElementById('permissions-tab')) return;
        
        // إنشاء محتوى التبويب
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-content';
        tabContent.id = 'permissions-tab';
        
        tabContent.innerHTML = `
            <div class="section">
                <div class="section-header">
                    <h3 class="section-title">إدارة صلاحيات الموظفين</h3>
                </div>
                <div class="permissions-container">
                    <div class="permissions-roles">
                        <h4>الأدوار والصلاحيات</h4>
                        <div class="roles-list">
                            <div class="role-item active" data-role="admin">
                                <div class="role-name">مسؤول النظام</div>
                                <div class="role-description">صلاحيات كاملة للنظام</div>
                            </div>
                            <div class="role-item" data-role="manager">
                                <div class="role-name">مدير</div>
                                <div class="role-description">إدارة الموظفين والرواتب</div>
                            </div>
                            <div class="role-item" data-role="hr">
                                <div class="role-name">موارد بشرية</div>
                                <div class="role-description">إدارة الموظفين وصرف الرواتب</div>
                            </div>
                            <div class="role-item" data-role="user">
                                <div class="role-name">مستخدم</div>
                                <div class="role-description">وصول محدود</div>
                            </div>
                        </div>
                    </div>
                    <div class="permissions-details">
                        <h4>صلاحيات الدور: <span id="selected-role-name">مسؤول النظام</span></h4>
                        <div class="permissions-list" id="role-permissions-list">
                            <!-- تملأ ديناميكياً -->
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h3 class="section-title">إدارة المستخدمين</h3>
                </div>
                <div class="users-container">
                    <div class="table-container">
                        <table id="users-table">
                            <thead>
                                <tr>
                                    <th>المعرف</th>
                                    <th>اسم المستخدم</th>
                                    <th>الاسم الكامل</th>
                                    <th>البريد الإلكتروني</th>
                                    <th>الدور</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- تملأ ديناميكياً -->
                            </tbody>
                        </table>
                    </div>
                    <div class="actions-bar">
                        <button class="btn btn-primary" id="add-user-btn">
                            <i class="fas fa-plus"></i>
                            <span>إضافة مستخدم</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // إضافة التبويب إلى صفحة الإعدادات
        const tabContainer = settingsPage.querySelector('.tabs');
        if (tabContainer) {
            tabContainer.appendChild(tabContent);
        }
        
        // إضافة أنماط CSS
        addPermissionsStyles();
        
        // إضافة مستمعي الأحداث
        setupPermissionsEventListeners();
        
        // تهيئة عرض صلاحيات الدور الافتراضي
        loadRolePermissions('admin');
        
        // تحميل بيانات المستخدمين
        loadUsersData();
    }
    
    /**
     * إضافة أنماط CSS الخاصة بإدارة الصلاحيات
     */
    function addPermissionsStyles() {
        // التحقق من عدم وجود الأنماط مسبقاً
        if (document.getElementById('permissions-styles')) return;
        
        // إنشاء عنصر نمط
        const styleElement = document.createElement('style');
        styleElement.id = 'permissions-styles';
        
        // إضافة أنماط CSS
        styleElement.textContent = `
            .permissions-container {
                display: flex;
                gap: 20px;
                margin-top: 20px;
            }
            
            .permissions-roles {
                width: 300px;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                padding: 15px;
            }
            
            .permissions-details {
                flex: 1;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                padding: 15px;
            }
            
            .roles-list {
                margin-top: 15px;
            }
            
            .role-item {
                padding: 10px;
                border-radius: 6px;
                margin-bottom: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .role-item:hover {
                background-color: #f8f9fa;
            }
            
            .role-item.active {
                background-color: #e9f5ff;
                border-right: 3px solid #3b82f6;
            }
            
            .role-name {
                font-weight: 600;
                margin-bottom: 4px;
            }
            
            .role-description {
                font-size: 0.85rem;
                color: #6c757d;
            }
            
            .permissions-list {
                margin-top: 15px;
            }
            
            .permission-item {
                display: flex;
                align-items: center;
                padding: 10px;
                border-bottom: 1px solid #e9ecef;
            }
            
            .permission-item:last-child {
                border-bottom: none;
            }
            
            .permission-checkbox {
                margin-left: 10px;
            }
            
            .permission-info {
                flex: 1;
            }
            
            .permission-name {
                font-weight: 500;
                margin-bottom: 2px;
            }
            
            .permission-description {
                font-size: 0.85rem;
                color: #6c757d;
            }
            
            .users-container {
                margin-top: 20px;
            }
            
            .actions-bar {
                margin-top: 15px;
                display: flex;
                justify-content: end;
            }
            
            .user-role {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.85rem;
                font-weight: 500;
            }
            
            .user-role.admin {
                background-color: rgba(239, 68, 68, 0.1);
                color: #ef4444;
            }
            
            .user-role.manager {
                background-color: rgba(59, 130, 246, 0.1);
                color: #3b82f6;
            }
            
            .user-role.hr {
                background-color: rgba(139, 92, 246, 0.1);
                color: #8b5cf6;
            }
            
            .user-role.user {
                background-color: rgba(16, 185, 129, 0.1);
                color: #10b981;
            }
            
            .user-status {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.85rem;
                font-weight: 500;
            }
            
            .user-status.active {
                background-color: rgba(16, 185, 129, 0.1);
                color: #10b981;
            }
            
            .user-status.inactive {
                background-color: rgba(239, 68, 68, 0.1);
                color: #ef4444;
            }
            
            .user-actions {
                display: flex;
                gap: 5px;
            }
            
            .user-action-btn {
                border: none;
                background-color: transparent;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .user-action-btn:hover {
                background-color: #f8f9fa;
            }
            
            .user-action-btn.edit {
                color: #3b82f6;
            }
            
            .user-action-btn.delete {
                color: #ef4444;
            }
        `;
        
        // إضافة العنصر إلى الصفحة
        document.head.appendChild(styleElement);
    }
    
    /**
     * إعداد مستمعي الأحداث لصفحة الصلاحيات
     */
    function setupPermissionsEventListeners() {
        // مستمع النقر على عناصر الأدوار
        document.querySelectorAll('.role-item').forEach(roleItem => {
            roleItem.addEventListener('click', function() {
                // إزالة الفئة النشطة من جميع العناصر
                document.querySelectorAll('.role-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // إضافة الفئة النشطة للعنصر المحدد
                this.classList.add('active');
                
                // تحميل صلاحيات الدور
                const role = this.getAttribute('data-role');
                loadRolePermissions(role);
                
                // تحديث اسم الدور المحدد
                document.getElementById('selected-role-name').textContent = this.querySelector('.role-name').textContent;
            });
        });
        
        // مستمع النقر على زر إضافة مستخدم
        const addUserBtn = document.getElementById('add-user-btn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', showAddUserModal);
        }
    }
    
    /**
     * تحميل صلاحيات الدور
     * @param {string} role - اسم الدور
     */
    function loadRolePermissions(role) {
        // التحقق من وجود نظام الصلاحيات
        if (typeof window.PermissionsSystem === 'undefined') return;
        
        // الحصول على صلاحيات الدور
        const rolePermissions = window.PermissionsSystem.getRolePermissions(role) || [];
        
        // الحصول على جميع صلاحيات الموظفين
        const allEmployeePermissions = window.PermissionsSystem.getPermissions('employees') || [];
        
        // تهيئة قائمة الصلاحيات
        const permissionsList = document.getElementById('role-permissions-list');
        if (!permissionsList) return;
        
        permissionsList.innerHTML = '';
        
        // إضافة صلاحيات الموظفين إلى القائمة
        allEmployeePermissions.forEach(permission => {
            const hasPermission = rolePermissions.includes(permission.key);
            
            const permissionItem = document.createElement('div');
            permissionItem.className = 'permission-item';
            
            permissionItem.innerHTML = `
                <div class="permission-checkbox">
                    <input type="checkbox" id="${permission.key}-${role}" 
                           data-role="${role}" data-permission="${permission.key}" 
                           ${hasPermission ? 'checked' : ''} />
                </div>
                <div class="permission-info">
                    <div class="permission-name">${permission.name}</div>
                    <div class="permission-description">${permission.description}</div>
                </div>
            `;
            
            permissionsList.appendChild(permissionItem);
            
            // إضافة مستمع تغيير لخانة الاختيار
            const checkbox = permissionItem.querySelector(`input[type="checkbox"]`);
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    const permissionKey = this.getAttribute('data-permission');
                    const roleName = this.getAttribute('data-role');
                    
                    if (this.checked) {
                        window.PermissionsSystem.assignPermissionToRole(roleName, permissionKey);
                    } else {
                        window.PermissionsSystem.removePermissionFromRole(roleName, permissionKey);
                    }
                    
                    // حفظ التغييرات
                    window.PermissionsSystem.savePermissions();
                    
                    // عرض إشعار
                    if (window.showNotification) {
                        window.showNotification(`تم تحديث صلاحيات دور ${getRoleDisplayName(roleName)}`, 'success');
                    }
                });
            }
        });
    }
    
    /**
     * الحصول على اسم العرض للدور
     * @param {string} role - اسم الدور
     * @returns {string} - اسم العرض للدور
     */
    function getRoleDisplayName(role) {
        const roleNames = {
            'admin': 'مسؤول النظام',
            'manager': 'مدير',
            'hr': 'موارد بشرية',
            'user': 'مستخدم'
        };
        
        return roleNames[role] || role;
    }
    
    /**
     * تحميل بيانات المستخدمين
     */
    function loadUsersData() {
        // التحقق من وجود نظام المصادقة
        if (typeof window.AuthSystem === 'undefined') return;
        
        // الحصول على بيانات المستخدمين
        const users = window.AuthSystem.getUsers() || [];
        
        // عرض المستخدمين في الجدول
        const usersTableBody = document.querySelector('#users-table tbody');
        if (!usersTableBody) return;
        
        usersTableBody.innerHTML = '';
        
        // إضافة المستخدمين إلى الجدول
        users.forEach(user => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.fullName || '-'}</td>
                <td>${user.email || '-'}</td>
                <td><span class="user-role ${user.role}">${getRoleDisplayName(user.role)}</span></td>
                <td><span class="user-status ${user.status}">${user.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
                <td>
                    <div class="user-actions">
                        <button class="user-action-btn edit" data-id="${user.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="user-action-btn delete" data-id="${user.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            usersTableBody.appendChild(row);
            
            // إضافة مستمعي الأحداث للأزرار
            const editButton = row.querySelector('.edit');
            if (editButton) {
                editButton.addEventListener('click', function() {
                    const userId = this.getAttribute('data-id');
                    showEditUserModal(userId);
                });
            }
            
            const deleteButton = row.querySelector('.delete');
            if (deleteButton) {
                deleteButton.addEventListener('click', function() {
                    const userId = this.getAttribute('data-id');
                    deleteUser(userId);
                });
            }
        });
    }
    
    /**
     * عرض نافذة إضافة مستخدم جديد
     */
    function showAddUserModal() {
        // التحقق من وجود نظام النوافذ المنبثقة
        if (typeof window.showModal !== 'function') {
            console.warn('لم يتم العثور على نظام النوافذ المنبثقة');
            return;
        }
        
        // إنشاء محتوى النافذة
        const modalContent = `
            <form id="add-user-form">
                <div class="grid-cols-2">
                    <div class="form-group">
                        <label class="form-label">اسم المستخدم</label>
                        <input class="form-input" id="user-username" required type="text" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">كلمة المرور</label>
                        <input class="form-input" id="user-password" required type="password" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">الاسم الكامل</label>
                        <input class="form-input" id="user-fullname" type="text" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">البريد الإلكتروني</label>
                        <input class="form-input" id="user-email" type="email" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">الدور</label>
                        <select class="form-select" id="user-role" required>
                            <option value="admin">مسؤول النظام</option>
                            <option value="manager">مدير</option>
                            <option value="hr">موارد بشرية</option>
                            <option value="user" selected>مستخدم</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">الحالة</label>
                        <select class="form-select" id="user-status" required>
                            <option value="active" selected>نشط</option>
                            <option value="inactive">غير نشط</option>
                        </select>
                    </div>
                </div>
            </form>
        `;
        
        // عرض النافذة المنبثقة
        window.showModal({
            title: 'إضافة مستخدم جديد',
            content: modalContent,
            onConfirm: addNewUser,
            confirmText: 'إضافة',
            cancelText: 'إلغاء'
        });
    }
    
    /**
     * إضافة مستخدم جديد
     */
    function addNewUser() {
        // التحقق من وجود نظام المصادقة
        if (typeof window.AuthSystem === 'undefined') return false;
        
        // جمع بيانات المستخدم
        const username = document.getElementById('user-username').value.trim();
        const password = document.getElementById('user-password').value.trim();
        const fullName = document.getElementById('user-fullname').value.trim();
        const email = document.getElementById('user-email').value.trim();
        const role = document.getElementById('user-role').value;
        const status = document.getElementById('user-status').value;
        
        // التحقق من البيانات المطلوبة
        if (!username || !password || !role) {
            if (window.showNotification) {
                window.showNotification('يرجى إدخال جميع البيانات المطلوبة', 'error');
            }
            return false;
        }
        
        // إنشاء بيانات المستخدم
        const userData = {
            username,
            password,
            fullName,
            email,
            role,
            status
        };
        
        try {
            // إضافة المستخدم
            window.AuthSystem.addUser(userData);
            
            // إعادة تحميل بيانات المستخدمين
            loadUsersData();
            
            // عرض إشعار النجاح
            if (window.showNotification) {
                window.showNotification(`تم إضافة المستخدم ${username} بنجاح`, 'success');
            }
            
            return true;
        } catch (error) {
            console.error('خطأ في إضافة المستخدم:', error);
            
            if (window.showNotification) {
                window.showNotification(`حدث خطأ أثناء إضافة المستخدم: ${error.message}`, 'error');
            }
            
            return false;
        }
    }
    
    /**
     * عرض نافذة تعديل المستخدم
     * @param {string} userId - معرف المستخدم
     */
    function showEditUserModal(userId) {
        // التحقق من وجود نظام المصادقة والنوافذ المنبثقة
        if (typeof window.AuthSystem === 'undefined' || typeof window.showModal !== 'function') {
            return;
        }
        
        // الحصول على بيانات المستخدم
        const user = window.AuthSystem.getUserById(userId);
        if (!user) {
            if (window.showNotification) {
                window.showNotification('لم يتم العثور على المستخدم', 'error');
            }
            return;
        }
        
        // إنشاء محتوى النافذة
        const modalContent = `
            <form id="edit-user-form">
                <div class="grid-cols-2">
                    <div class="form-group">
                        <label class="form-label">اسم المستخدم</label>
                        <input class="form-input" id="user-username" required type="text" value="${user.username}" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">كلمة المرور</label>
                        <input class="form-input" id="user-password" type="password" placeholder="اترك فارغاً للاحتفاظ بنفس كلمة المرور" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">الاسم الكامل</label>
                        <input class="form-input" id="user-fullname" type="text" value="${user.fullName || ''}" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">البريد الإلكتروني</label>
                        <input class="form-input" id="user-email" type="email" value="${user.email || ''}" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">الدور</label>
                        <select class="form-select" id="user-role" required>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>مسؤول النظام</option>
                            <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>مدير</option>
                            <option value="hr" ${user.role === 'hr' ? 'selected' : ''}>موارد بشرية</option>
                            <option value="user" ${user.role === 'user' ? 'selected' : ''}>مستخدم</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">الحالة</label>
                        <select class="form-select" id="user-status" required>
                            <option value="active" ${user.status === 'active' ? 'selected' : ''}>نشط</option>
                            <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>غير نشط</option>
                        </select>
                    </div>
                </div>
            </form>
        `;
        
        // عرض النافذة المنبثقة
        window.showModal({
            title: `تعديل المستخدم: ${user.username}`,
            content: modalContent,
            onConfirm: () => updateUser(userId),
            confirmText: 'حفظ',
            cancelText: 'إلغاء'
        });
    }
    
    /**
     * تحديث بيانات المستخدم
     * @param {string} userId - معرف المستخدم
     */
    function updateUser(userId) {
        // التحقق من وجود نظام المصادقة
        if (typeof window.AuthSystem === 'undefined') return false;
        
        // جمع بيانات المستخدم المحدثة
        const username = document.getElementById('user-username').value.trim();
        const password = document.getElementById('user-password').value.trim();
        const fullName = document.getElementById('user-fullname').value.trim();
        const email = document.getElementById('user-email').value.trim();
        const role = document.getElementById('user-role').value;
        const status = document.getElementById('user-status').value;
        
        // التحقق من البيانات المطلوبة
        if (!username || !role) {
            if (window.showNotification) {
                window.showNotification('يرجى إدخال جميع البيانات المطلوبة', 'error');
            }
            return false;
        }
        
        // إنشاء بيانات المستخدم المحدثة
        const userData = {
            username,
            fullName,
            email,
            role,
            status
        };
        
        // إضافة كلمة المرور إذا تم تغييرها
        if (password) {
            userData.password = password;
        }
        
        try {
            // تحديث بيانات المستخدم
            window.AuthSystem.updateUser(userId, userData);
            
            // إعادة تحميل بيانات المستخدمين
            loadUsersData();
            
            // عرض إشعار النجاح
            if (window.showNotification) {
                window.showNotification(`تم تحديث بيانات المستخدم ${username} بنجاح`, 'success');
            }
            
            return true;
        } catch (error) {
            console.error('خطأ في تحديث المستخدم:', error);
            
            if (window.showNotification) {
                window.showNotification(`حدث خطأ أثناء تحديث بيانات المستخدم: ${error.message}`, 'error');
            }
            
            return false;
        }
    }
    
    /**
     * حذف مستخدم
     * @param {string} userId - معرف المستخدم
     */
    function deleteUser(userId) {
        // التحقق من وجود نظام المصادقة والنوافذ المنبثقة
        if (typeof window.AuthSystem === 'undefined' || typeof window.showModal !== 'function') {
            return;
        }
        
        // الحصول على بيانات المستخدم
        const user = window.AuthSystem.getUserById(userId);
        if (!user) {
            if (window.showNotification) {
                window.showNotification('لم يتم العثور على المستخدم', 'error');
            }
            return;
        }
        
        // عرض نافذة تأكيد الحذف
        window.showModal({
            title: 'تأكيد الحذف',
            content: `هل أنت متأكد من رغبتك بحذف المستخدم "${user.username}"؟`,
            onConfirm: () => confirmDeleteUser(userId, user.username),
            confirmText: 'حذف',
            cancelText: 'إلغاء',
            type: 'warning'
        });
    }
    
    /**
     * تأكيد حذف المستخدم
     * @param {string} userId - معرف المستخدم
     * @param {string} username - اسم المستخدم
     */
    function confirmDeleteUser(userId, username) {
        try {
            // حذف المستخدم
            window.AuthSystem.deleteUser(userId);
            
            // إعادة تحميل بيانات المستخدمين
            loadUsersData();
            
            // عرض إشعار النجاح
            if (window.showNotification) {
                window.showNotification(`تم حذف المستخدم ${username} بنجاح`, 'success');
            }
            
            return true;
        } catch (error) {
            console.error('خطأ في حذف المستخدم:', error);
            
            if (window.showNotification) {
                window.showNotification(`حدث خطأ أثناء حذف المستخدم: ${error.message}`, 'error');
            }
            
            return false;
        }
    }
    
    /**
     * ربط نظام الصلاحيات بوظائف الموظفين
     */
    function setupPermissionsIntegration() {
        // تعريف وظيفة التحقق من الصلاحيات
        window.hasEmployeePermission = function(permission) {
            // التحقق من وجود نظام الصلاحيات
            if (typeof window.PermissionsSystem === 'undefined') return false;
            
            // التحقق من وجود نظام المصادقة
            if (typeof window.AuthSystem === 'undefined') return false;
            
            // الحصول على المستخدم الحالي
            const currentUser = window.AuthSystem.getCurrentUser();
            if (!currentUser) return false;
            
            // التحقق من صلاحية المستخدم
            return window.PermissionsSystem.checkPermission(currentUser.role, permission);
        };
        
        // ربط وظائف التحقق من الصلاحيات بوظائف الموظفين
        if (window.EmployeesModule) {
            // التحقق من صلاحية عرض الموظفين
            const originalLoadEmployees = window.EmployeesModule.loadEmployees;
            window.EmployeesModule.loadEmployees = function() {
                if (!window.hasEmployeePermission('employees-view')) {
                    if (window.showNotification) {
                        window.showNotification('ليس لديك صلاحية لعرض الموظفين', 'error');
                    }
                    return false;
                }
                
                return originalLoadEmployees.apply(this, arguments);
            };
            
            // التحقق من صلاحية إضافة موظف
            const originalAddEmployee = window.EmployeesModule.addEmployee;
            window.EmployeesModule.addEmployee = function() {
                if (!window.hasEmployeePermission('employees-add')) {
                    if (window.showNotification) {
                        window.showNotification('ليس لديك صلاحية لإضافة موظفين', 'error');
                    }
                    return false;
                }
                
                return originalAddEmployee.apply(this, arguments);
            };
            
            // التحقق من صلاحية تعديل موظف
            const originalUpdateEmployee = window.EmployeesModule.updateEmployee;
            window.EmployeesModule.updateEmployee = function() {
                if (!window.hasEmployeePermission('employees-edit')) {
                    if (window.showNotification) {
                        window.showNotification('ليس لديك صلاحية لتعديل بيانات الموظفين', 'error');
                    }
                    return false;
                }
                
                return originalUpdateEmployee.apply(this, arguments);
            };
            
            // التحقق من صلاحية حذف موظف
            const originalDeleteEmployee = window.EmployeesModule.deleteEmployee;
            window.EmployeesModule.deleteEmployee = function() {
                if (!window.hasEmployeePermission('employees-delete')) {
                    if (window.showNotification) {
                        window.showNotification('ليس لديك صلاحية لحذف الموظفين', 'error');
                    }
                    return false;
                }
                
                return originalDeleteEmployee.apply(this, arguments);
            };
            
            // التحقق من صلاحية إدارة الرواتب
            const originalManageSalary = window.EmployeesModule.manageSalary;
            if (originalManageSalary) {
                window.EmployeesModule.manageSalary = function() {
                    if (!window.hasEmployeePermission('employees-salary')) {
                        if (window.showNotification) {
                            window.showNotification('ليس لديك صلاحية لإدارة رواتب الموظفين', 'error');
                        }
                        return false;
                    }
                    
                    return originalManageSalary.apply(this, arguments);
                };
            }
            
            // التحقق من صلاحية عرض تقارير الموظفين
            const originalViewReports = window.EmployeesModule.viewReports;
            if (originalViewReports) {
                window.EmployeesModule.viewReports = function() {
                    if (!window.hasEmployeePermission('employees-reports')) {
                        if (window.showNotification) {
                            window.showNotification('ليس لديك صلاحية لعرض تقارير الموظفين', 'error');
                        }
                        return false;
                    }
                    
                    return originalViewReports.apply(this, arguments);
                };
            }
        }
        
        // إخفاء أو إظهار أزرار واجهة المستخدم بناءً على الصلاحيات
        updateUIBasedOnPermissions();
    }
    
    /**
     * تحديث واجهة المستخدم بناءً على الصلاحيات
     */
    function updateUIBasedOnPermissions() {
        // تنفيذ عند تحميل صفحة الموظفين
        document.addEventListener('employeesPageLoaded', function() {
            // التحقق من صلاحية إضافة موظف
            const addEmployeeBtn = document.getElementById('add-employee-btn');
            if (addEmployeeBtn) {
                addEmployeeBtn.style.display = window.hasEmployeePermission('employees-add') ? 'flex' : 'none';
            }
            
            // التحقق من صلاحية تعديل وحذف الموظفين
            const employeeActionBtns = document.querySelectorAll('.employee-action-btn');
            employeeActionBtns.forEach(btn => {
                if (btn.classList.contains('edit')) {
                    btn.style.display = window.hasEmployeePermission('employees-edit') ? 'flex' : 'none';
                } else if (btn.classList.contains('delete')) {
                    btn.style.display = window.hasEmployeePermission('employees-delete') ? 'flex' : 'none';
                }
            });
            
            // التحقق من صلاحية إدارة الرواتب
            const salaryManagementBtns = document.querySelectorAll('.salary-btn');
            salaryManagementBtns.forEach(btn => {
                btn.style.display = window.hasEmployeePermission('employees-salary') ? 'flex' : 'none';
            });
            
            // التحقق من صلاحية عرض التقارير
            const reportsBtn = document.getElementById('reports-btn');
            if (reportsBtn) {
                reportsBtn.style.display = window.hasEmployeePermission('employees-reports') ? 'flex' : 'none';
            }
        });
    }



/**
 * نظام الاستثمار المتكامل - الشريط الجانبي والتنقل
 * يتحكم في وظائف الشريط الجانبي والتنقل بين الصفحات المختلفة
 */

class Navigation {
    constructor() {
        // عناصر واجهة المستخدم
        this.sidebar = document.querySelector('.sidebar');
        this.mainContent = document.querySelector('.main-content');
        this.toggleButtons = document.querySelectorAll('.toggle-sidebar');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.pages = document.querySelectorAll('.page');
        
        // تعيين الصفحة النشطة
        this.activePage = 'dashboard';
        
        // معدلات التغيير
        this.transitionDuration = 300; // مللي ثانية
        
        // تهيئة الأحداث
        this.initEvents();
        
        // تطبيق حالة الشريط الجانبي المحفوظة
        this.applySavedSidebarState();
    }
    
    // تهيئة الأحداث
    initEvents() {
        // أحداث أزرار طي/فتح الشريط الجانبي
        this.toggleButtons.forEach(button => {
            button.addEventListener('click', () => this.toggleSidebar());
        });
        
        // أحداث روابط التنقل
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                if (page) {
                    this.navigateTo(page);
                }
            });
        });
        
        // الاستجابة لتغير حجم النافذة
        window.addEventListener('resize', () => this.handleResize());
    }
    
    // طي/فتح الشريط الجانبي
    toggleSidebar() {
        const layout = document.querySelector('.layout');
        layout.classList.toggle('sidebar-collapsed');
        
        // حفظ حالة الشريط الجانبي
        this.saveSidebarState(layout.classList.contains('sidebar-collapsed'));
        
        // إرسال حدث تغيير حجم الشريط الجانبي
        this.dispatchSidebarEvent(layout.classList.contains('sidebar-collapsed'));
    }
    
    // التنقل إلى صفحة معينة
    navigateTo(page) {
        // لا نفعل شيئًا إذا كانت الصفحة هي نفسها النشطة حاليًا
        if (page === this.activePage) {
            return;
        }
        
        // تحديث الروابط النشطة
        this.navLinks.forEach(link => {
            if (link.getAttribute('data-page') === page) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // تحديث الصفحات النشطة مع تأثير التلاشي
        this.pages.forEach(pageEl => {
            const pageId = pageEl.id.replace('-page', '');
            
            if (pageId === page) {
                // نضيف تأثير الظهور للصفحة الجديدة
                pageEl.style.opacity = '0';
                pageEl.classList.add('active');
                
                // تأثير ظهور تدريجي
                setTimeout(() => {
                    pageEl.style.opacity = '1';
                    pageEl.style.transition = `opacity ${this.transitionDuration}ms ease`;
                }, 50);
            } else {
                if (pageEl.classList.contains('active')) {
                    // إخفاء الصفحة السابقة بتلاشي تدريجي
                    pageEl.style.opacity = '0';
                    pageEl.style.transition = `opacity ${this.transitionDuration}ms ease`;
                    
                    setTimeout(() => {
                        pageEl.classList.remove('active');
                    }, this.transitionDuration);
                } else {
                    pageEl.classList.remove('active');
                }
            }
        });
        
        // تحديث الصفحة النشطة
        this.activePage = page;
        
        // حفظ الصفحة النشطة في التخزين المحلي
        localStorage.setItem('activePage', page);
        
        // إرسال حدث تغيير الصفحة
        this.dispatchPageChangeEvent(page);
        
        // تمرير للأعلى
        window.scrollTo(0, 0);
    }
    
    // التعامل مع تغيير حجم النافذة
    handleResize() {
        // إغلاق الشريط الجانبي تلقائيًا في الشاشات الصغيرة
        if (window.innerWidth < 768) {
            document.querySelector('.layout').classList.add('sidebar-collapsed');
            this.saveSidebarState(true);
        }
    }
    
    // حفظ حالة الشريط الجانبي
    saveSidebarState(isCollapsed) {
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    }
    
    // تطبيق حالة الشريط الجانبي المحفوظة
    applySavedSidebarState() {
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        
        if (isCollapsed) {
            document.querySelector('.layout').classList.add('sidebar-collapsed');
        } else {
            document.querySelector('.layout').classList.remove('sidebar-collapsed');
        }
        
        // تطبيق الصفحة المحفوظة
        const savedPage = localStorage.getItem('activePage');
        if (savedPage) {
            this.navigateTo(savedPage);
        }
        
        // للشاشات الصغيرة، نغلق الشريط الجانبي تلقائيًا
        this.handleResize();
    }
    
    // إرسال حدث تغيير حجم الشريط الجانبي
    dispatchSidebarEvent(isCollapsed) {
        const event = new CustomEvent('sidebar:toggle', {
            detail: { isCollapsed }
        });
        document.dispatchEvent(event);
    }
    
    // إرسال حدث تغيير الصفحة
    dispatchPageChangeEvent(page) {
        const event = new CustomEvent('page:change', {
            detail: { page }
        });
        document.dispatchEvent(event);
    }
    
    // فتح الشريط الجانبي
    openSidebar() {
        document.querySelector('.layout').classList.remove('sidebar-collapsed');
        this.saveSidebarState(false);
        this.dispatchSidebarEvent(false);
    }
    
    // إغلاق الشريط الجانبي
    closeSidebar() {
        document.querySelector('.layout').classList.add('sidebar-collapsed');
        this.saveSidebarState(true);
        this.dispatchSidebarEvent(true);
    }
    
    // إضافة سلوك التمرير عند التنقل السريع
    enableSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href').substring(1);
                if (!targetId) return;
                
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// إنشاء كائن التنقل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.navigation = new Navigation();
});





})();