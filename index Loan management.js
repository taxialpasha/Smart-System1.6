/**
 * نظام القروض المتكامل - الإصدار 1.0
 * تكامل مع نظام الأقساط المتكامل
 * 
 * تاريخ الإضافة: مايو 2025
 */

(function() {
    // الإصدار
    const LOAN_SYSTEM_VERSION = '1.0.0';
    
    // تهيئة متغيرات النظام
    let loans = []; // مصفوفة القروض النشطة
    let approvedLoans = []; // مصفوفة القروض الموافق عليها
    let rejectedLoans = []; // مصفوفة القروض المرفوضة
    let currentLoanFilter = 'all'; // فلتر القروض الحالي
    let currentLoanPage = 1; // رقم الصفحة الحالية
    let loansPerPage = 10; // عدد العناصر في الصفحة الواحدة
    let loanSearchQuery = ''; // نص البحث الحالي
    let isLoanSystemInitialized = false; // حالة تهيئة نظام القروض
    
    // كائن لتخزين إعدادات القروض
    const loanSettings = {
        enableNotifications: true,           // تفعيل الإشعارات
        maxLoanAmount: {                     // الحد الأقصى لمبلغ القرض حسب الفئة
            kasb: 10000000,                  // كاسب
            employee: 5000000,               // موظف
            military: 7000000,               // عسكري
            social: 3000000                  // رعاية اجتماعية
        },
        defaultInterestRate: {               // نسبة الفائدة الافتراضية حسب الفئة
            kasb: 8,                         // كاسب
            employee: 6,                     // موظف
            military: 5,                     // عسكري
            social: 4                        // رعاية اجتماعية
        },
        defaultLoanPeriod: {                 // المدة الافتراضية للقرض (بالأشهر)
            kasb: 24,                        // كاسب
            employee: 36,                    // موظف
            military: 36,                    // عسكري
            social: 24                       // رعاية اجتماعية
        },
        requireSecondGuarantor: {            // هل يتطلب كفيل ثاني إجباري؟
            kasb: true,                      // كاسب
            employee: false,                 // موظف
            military: false,                 // عسكري
            social: true                     // رعاية اجتماعية
        },
        minSalary: {                         // الحد الأدنى للراتب
            kasb: 500000,                    // كاسب
            employee: 500000,                // موظف
            military: 600000,                // عسكري
            social: 300000                   // رعاية اجتماعية
        },
        maxLoanToSalaryRatio: {              // نسبة القرض للراتب القصوى
            kasb: 15,                        // كاسب (القرض يمكن أن يكون 15 ضعف الراتب)
            employee: 12,                    // موظف
            military: 12,                    // عسكري
            social: 8                        // رعاية اجتماعية
        },
        autoSaveEnabled: true,               // حفظ تلقائي
        requireAllDocuments: true,           // طلب جميع المستندات إجباري
        useFirebaseStorage: false,           // استخدام تخزين Firebase
        useFirebaseDB: false,                // استخدام قاعدة بيانات Firebase
        firebaseConfig: {                    // إعدادات Firebase (يجب تعديلها)
            apiKey: "",
            authDomain: "",
            projectId: "",
            storageBucket: "",
            messagingSenderId: "",
            appId: ""
        }
    };
    
    // ===========================
    // وظائف تحميل النظام وتهيئته
    // ===========================
    
    /**
     * تهيئة نظام القروض
     */
    function initLoanSystem() {
        console.log(`تهيئة نظام القروض - الإصدار ${LOAN_SYSTEM_VERSION}`);
        
        if (isLoanSystemInitialized) {
            console.log('نظام القروض مُهيأ بالفعل');
            return;
        }
        
        // تحميل بيانات النظام من التخزين المحلي
        loadLoanData();
        
        // تحميل إعدادات النظام
        loadLoanSettings();
        
        // إضافة العناصر إلى واجهة المستخدم
        createLoanUIElements();
        
        // ضبط مستمعي الأحداث
        setupLoanEventListeners();
        
        // تحديث المؤشرات والإحصائيات
        updateLoanDashboardStats();
        
        // تهيئة Firebase إذا كان مفعلاً
        if (loanSettings.useFirebaseDB || loanSettings.useFirebaseStorage) {
            initFirebase();
        }
        
        isLoanSystemInitialized = true;
        console.log('تم تهيئة نظام القروض بنجاح');
    }
    
    /**
     * تحميل بيانات القروض من التخزين المحلي
     */
    function loadLoanData() {
        try {
            // تحميل القروض النشطة
            const savedLoans = localStorage.getItem('loans');
            if (savedLoans) {
                loans = JSON.parse(savedLoans);
                console.log(`تم تحميل ${loans.length} من طلبات القروض النشطة`);
            } else {
                loans = [];
                console.log('لم يتم العثور على بيانات القروض النشطة، تم إنشاء مصفوفة جديدة');
            }
            
            // تحميل القروض الموافق عليها
            const savedApprovedLoans = localStorage.getItem('approvedLoans');
            if (savedApprovedLoans) {
                approvedLoans = JSON.parse(savedApprovedLoans);
                console.log(`تم تحميل ${approvedLoans.length} من طلبات القروض الموافق عليها`);
            } else {
                approvedLoans = [];
                console.log('لم يتم العثور على بيانات القروض الموافق عليها، تم إنشاء مصفوفة جديدة');
            }
            
            // تحميل القروض المرفوضة
            const savedRejectedLoans = localStorage.getItem('rejectedLoans');
            if (savedRejectedLoans) {
                rejectedLoans = JSON.parse(savedRejectedLoans);
                console.log(`تم تحميل ${rejectedLoans.length} من طلبات القروض المرفوضة`);
            } else {
                rejectedLoans = [];
                console.log('لم يتم العثور على بيانات القروض المرفوضة، تم إنشاء مصفوفة جديدة');
            }
            
        } catch (error) {
            console.error('خطأ في تحميل بيانات القروض:', error);
            showSystemNotification('حدث خطأ أثناء تحميل بيانات القروض', 'error');
            
            loans = [];
            approvedLoans = [];
            rejectedLoans = [];
        }
    }
    
    /**
     * تحميل إعدادات نظام القروض من التخزين المحلي
     */
    function loadLoanSettings() {
        try {
            const savedSettings = localStorage.getItem('loan_settings');
            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                
                // دمج الإعدادات المحفوظة مع الإعدادات الافتراضية
                Object.assign(loanSettings, parsedSettings);
                
                console.log('تم تحميل إعدادات نظام القروض بنجاح');
            } else {
                console.log('لم يتم العثور على إعدادات محفوظة لنظام القروض، سيتم استخدام الإعدادات الافتراضية');
                
                // حفظ الإعدادات الافتراضية
                saveLoanSettings();
            }
        } catch (error) {
            console.error('خطأ في تحميل إعدادات نظام القروض:', error);
            showSystemNotification('حدث خطأ أثناء تحميل إعدادات نظام القروض', 'error');
        }
    }
    
    /**
     * حفظ إعدادات نظام القروض في التخزين المحلي
     */
    function saveLoanSettings() {
        try {
            localStorage.setItem('loan_settings', JSON.stringify(loanSettings));
            console.log('تم حفظ إعدادات نظام القروض بنجاح');
            return true;
        } catch (error) {
            console.error('خطأ في حفظ إعدادات نظام القروض:', error);
            showSystemNotification('حدث خطأ أثناء حفظ إعدادات نظام القروض', 'error');
            return false;
        }
    }
    
    /**
     * تهيئة Firebase إذا كان مفعلاً
     */
    function initFirebase() {
        // التحقق من وجود مكتبة Firebase
        if (typeof firebase === 'undefined') {
            console.warn('مكتبة Firebase غير موجودة');
            
            // تحميل مكتبة Firebase ديناميكياً
            const firebaseScript = document.createElement('script');
            firebaseScript.src = 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
            document.head.appendChild(firebaseScript);
            
            const firestoreScript = document.createElement('script');
            firestoreScript.src = 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
            document.head.appendChild(firestoreScript);
            
            const storageScript = document.createElement('script');
            storageScript.src = 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';
            document.head.appendChild(storageScript);
            
            // الانتظار حتى تحميل المكتبات ثم تهيئة Firebase
            storageScript.onload = function() {
                initializeFirebaseApp();
            };
            
            return;
        }
        
        initializeFirebaseApp();
    }
    
    /**
     * تهيئة تطبيق Firebase
     */
    function initializeFirebaseApp() {
        try {
            // التحقق من وجود إعدادات Firebase
            if (!loanSettings.firebaseConfig || !loanSettings.firebaseConfig.apiKey) {
                console.warn('إعدادات Firebase غير مكتملة');
                return;
            }
            
            // تهيئة تطبيق Firebase
            firebase.initializeApp(loanSettings.firebaseConfig);
            console.log('تم تهيئة Firebase بنجاح');
            
            // تهيئة خدمات Firebase
            if (loanSettings.useFirebaseDB) {
                window.loanFirestore = firebase.firestore();
                console.log('تم تهيئة Firestore بنجاح');
            }
            
            if (loanSettings.useFirebaseStorage) {
                window.loanStorage = firebase.storage();
                console.log('تم تهيئة Storage بنجاح');
            }
        } catch (error) {
            console.error('خطأ في تهيئة Firebase:', error);
        }
    }
    
    // ===========================
    // وظائف إدارة البيانات
    // ===========================
    
    /**
     * حفظ بيانات القروض في التخزين المحلي
     */
    function saveLoanData() {
        try {
            // حفظ القروض النشطة
            localStorage.setItem('loans', JSON.stringify(loans));
            
            // حفظ القروض الموافق عليها
            localStorage.setItem('approvedLoans', JSON.stringify(approvedLoans));
            
            // حفظ القروض المرفوضة
            localStorage.setItem('rejectedLoans', JSON.stringify(rejectedLoans));
            
            console.log('تم حفظ بيانات القروض بنجاح');
            console.log(`- عدد القروض النشطة: ${loans.length}`);
            console.log(`- عدد القروض الموافق عليها: ${approvedLoans.length}`);
            console.log(`- عدد القروض المرفوضة: ${rejectedLoans.length}`);
            
            // حفظ البيانات في Firestore إذا كان مفعلاً
            if (loanSettings.useFirebaseDB && window.loanFirestore) {
                syncLoansWithFirestore();
            }
            
            return true;
        } catch (error) {
            console.error('خطأ في حفظ بيانات القروض:', error);
            showSystemNotification('حدث خطأ أثناء حفظ بيانات القروض', 'error');
            return false;
        }
    }
    
    /**
     * مزامنة بيانات القروض مع Firestore
     */
    function syncLoansWithFirestore() {
        if (!window.loanFirestore) return;
        
        try {
            // مزامنة القروض النشطة
            const loansCollection = window.loanFirestore.collection('loans');
            loans.forEach(loan => {
                loansCollection.doc(loan.id).set(loan);
            });
            
            // مزامنة القروض الموافق عليها
            const approvedCollection = window.loanFirestore.collection('approvedLoans');
            approvedLoans.forEach(loan => {
                approvedCollection.doc(loan.id).set(loan);
            });
            
            // مزامنة القروض المرفوضة
            const rejectedCollection = window.loanFirestore.collection('rejectedLoans');
            rejectedLoans.forEach(loan => {
                rejectedCollection.doc(loan.id).set(loan);
            });
            
            console.log('تمت مزامنة بيانات القروض مع Firestore بنجاح');
        } catch (error) {
            console.error('خطأ في مزامنة البيانات مع Firestore:', error);
        }
    }
    
    /**
     * إضافة قرض جديد
     * @param {Object} newLoan - كائن القرض الجديد
     * @return {boolean} نجاح العملية
     */
    function addLoan(newLoan) {
        // إضافة القرض إلى المصفوفة
        loans.push(newLoan);
        
        // حفظ البيانات
        if (saveLoanData()) {
            // تحديث عرض القروض
            renderLoansTable();
            
            // تحديث الإحصائيات
            updateLoanDashboardStats();
            
            return true;
        }
        
        return false;
    }
    
    /**
     * تعديل قرض موجود
     * @param {string} loanId - معرف القرض
     * @param {Object} updatedData - البيانات المحدثة
     * @return {boolean} نجاح العملية
     */
    function updateLoan(loanId, updatedData) {
        // البحث عن القرض
        const index = loans.findIndex(item => item.id === loanId);
        
        if (index === -1) {
            console.error(`لم يتم العثور على القرض بالمعرف: ${loanId}`);
            return false;
        }
        
        // تحديث بيانات القرض
        loans[index] = { ...loans[index], ...updatedData };
        
        // حفظ البيانات
        if (saveLoanData()) {
            // تحديث عرض القروض
            renderLoansTable();
            
            // تحديث الإحصائيات
            updateLoanDashboardStats();
            
            return true;
        }
        
        return false;
    }
    
    /**
     * الموافقة على قرض
     * @param {string} loanId - معرف القرض
     * @param {Object} approvalData - بيانات الموافقة
     * @return {boolean} نجاح العملية
     */
    function approveLoan(loanId, approvalData) {
        // البحث عن القرض
        const index = loans.findIndex(item => item.id === loanId);
        
        if (index === -1) {
            console.error(`لم يتم العثور على القرض بالمعرف: ${loanId}`);
            return false;
        }
        
        // تحديث بيانات القرض
        const loan = { ...loans[index], ...approvalData };
        loan.status = 'approved';
        loan.approvedAt = new Date().toISOString();
        
        // إزالة القرض من قائمة القروض النشطة
        loans.splice(index, 1);
        
        // إضافته إلى قائمة القروض الموافق عليها
        approvedLoans.push(loan);
        
        // إنشاء الأقساط للقرض إذا تمت الموافقة
        createInstallmentsForLoan(loan);
        
        // حفظ البيانات
        if (saveLoanData()) {
            // تحديث عرض القروض
            renderLoansTable();
            
            // تحديث الإحصائيات
            updateLoanDashboardStats();
            
            return true;
        }
        
        return false;
    }
    
    /**
     * رفض قرض
     * @param {string} loanId - معرف القرض
     * @param {Object} rejectionData - بيانات الرفض
     * @return {boolean} نجاح العملية
     */
    function rejectLoan(loanId, rejectionData) {
        // البحث عن القرض
        const index = loans.findIndex(item => item.id === loanId);
        
        if (index === -1) {
            console.error(`لم يتم العثور على القرض بالمعرف: ${loanId}`);
            return false;
        }
        
        // تحديث بيانات القرض
        const loan = { ...loans[index], ...rejectionData };
        loan.status = 'rejected';
        loan.rejectedAt = new Date().toISOString();
        
        // إزالة القرض من قائمة القروض النشطة
        loans.splice(index, 1);
        
        // إضافته إلى قائمة القروض المرفوضة
        rejectedLoans.push(loan);
        
        // حفظ البيانات
        if (saveLoanData()) {
            // تحديث عرض القروض
            renderLoansTable();
            
            // تحديث الإحصائيات
            updateLoanDashboardStats();
            
            return true;
        }
        
        return false;
    }
    
    /**
     * حذف قرض
     * @param {string} loanId - معرف القرض
     * @return {boolean} نجاح العملية
     */
    function deleteLoan(loanId) {
        // البحث عن القرض في جميع المصفوفات
        const activeIndex = loans.findIndex(item => item.id === loanId);
        const approvedIndex = approvedLoans.findIndex(item => item.id === loanId);
        const rejectedIndex = rejectedLoans.findIndex(item => item.id === loanId);
        
        // حذف القرض من المصفوفة المناسبة
        if (activeIndex !== -1) {
            loans.splice(activeIndex, 1);
        } else if (approvedIndex !== -1) {
            approvedLoans.splice(approvedIndex, 1);
        } else if (rejectedIndex !== -1) {
            rejectedLoans.splice(rejectedIndex, 1);
        } else {
            console.error(`لم يتم العثور على القرض بالمعرف: ${loanId}`);
            return false;
        }
        
        // حفظ البيانات
        if (saveLoanData()) {
            // تحديث عرض القروض
            renderLoansTable();
            
            // تحديث الإحصائيات
            updateLoanDashboardStats();
            
            return true;
        }
        
        return false;
    }
    
    /**
     * إنشاء أقساط لقرض موافق عليه
     * @param {Object} loan - كائن القرض
     */
    function createInstallmentsForLoan(loan) {
        try {
            // التحقق من وجود وظيفة إنشاء الأقساط
            if (typeof window.InstallmentSystem === 'undefined' || typeof window.InstallmentSystem.addInstallment !== 'function') {
                console.error('نظام الأقساط غير متاح لإنشاء الأقساط');
                return false;
            }
            
            // إعداد بيانات القسط
            const installmentData = {
                id: `inst_loan_${loan.id.replace('loan_', '')}`,
                investorId: loan.borrowerId || 'direct',
                investorName: loan.borrowerName,
                title: `قرض ${getCategoryName(loan.borrowerCategory)} - ${loan.borrowerName}`,
                originalAmount: loan.loanAmount,
                interestRate: loan.interestRate,
                interestValue: (loan.loanAmount * loan.interestRate / 100),
                totalAmount: loan.loanAmount + (loan.loanAmount * loan.interestRate / 100 * loan.loanPeriod / 12),
                monthsCount: loan.loanPeriod,
                monthlyInstallment: calculateMonthlyPayment(loan.loanAmount, loan.interestRate, loan.loanPeriod),
                startDate: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString(),
                notes: `قرض ${getCategoryName(loan.borrowerCategory)} - رقم الطلب: ${loan.id}`,
                status: 'active',
                loanReference: loan.id,
                paidAmount: 0,
                remainingAmount: loan.loanAmount + (loan.loanAmount * loan.interestRate / 100 * loan.loanPeriod / 12)
            };
            
            // إنشاء مصفوفة الأقساط الشهرية
            const monthlyInstallments = [];
            const startDateObj = new Date();
            
            for (let i = 0; i < loan.loanPeriod; i++) {
                const dueDate = new Date(startDateObj);
                dueDate.setMonth(dueDate.getMonth() + i + 1); // بداية من الشهر التالي
                
                monthlyInstallments.push({
                    installmentNumber: i + 1,
                    amount: installmentData.monthlyInstallment,
                    dueDate: dueDate.toISOString().split('T')[0],
                    isPaid: false,
                    paidDate: null,
                    paidAmount: 0,
                    notes: ''
                });
            }
            
            // إضافة مصفوفة الأقساط الشهرية
            installmentData.monthlyInstallments = monthlyInstallments;
            
            // إضافة القسط باستخدام نظام الأقساط
            const success = window.InstallmentSystem.addInstallment(installmentData);
            
            if (success) {
                console.log(`تم إنشاء أقساط للقرض: ${loan.id}`);
                
                // تحديث مرجع الأقساط في القرض
                loan.installmentId = installmentData.id;
                saveLoanData();
                
                return true;
            } else {
                console.error('فشل في إنشاء الأقساط للقرض');
                return false;
            }
        } catch (error) {
            console.error('خطأ في إنشاء أقساط القرض:', error);
            return false;
        }
    }
    
    /**
     * حساب القسط الشهري للقرض
     * @param {number} loanAmount - مبلغ القرض
     * @param {number} interestRate - نسبة الفائدة
     * @param {number} loanPeriod - مدة القرض بالأشهر
     * @return {number} قيمة القسط الشهري
     */
    function calculateMonthlyPayment(loanAmount, interestRate, loanPeriod) {
        // تحويل نسبة الفائدة السنوية إلى شهرية
        const monthlyRate = interestRate / 100 / 12;
        
        // حساب إجمالي المبلغ مع الفائدة
        const totalAmount = loanAmount + (loanAmount * interestRate / 100 * loanPeriod / 12);
        
        // حساب القسط الشهري (القسط الثابت) - المبلغ الإجمالي مقسوم على عدد الأشهر
        return totalAmount / loanPeriod;
    }
    
    /**
     * رفع ملف إلى Firebase Storage
     * @param {File} file - الملف المراد رفعه
     * @param {string} path - مسار الملف في التخزين
     * @return {Promise} وعد بعنوان URL للملف أو خطأ
     */
    function uploadFileToStorage(file, path) {
        return new Promise((resolve, reject) => {
            if (!loanSettings.useFirebaseStorage || !window.loanStorage) {
                // استخدام التخزين المحلي إذا كان Firebase غير مفعل
                // تحويل الملف إلى Data URL
                const reader = new FileReader();
                reader.onload = function(e) {
                    resolve(e.target.result);
                };
                reader.onerror = function(e) {
                    reject(new Error('فشل في قراءة الملف'));
                };
                reader.readAsDataURL(file);
                return;
            }
            
            // استخدام Firebase Storage
            const storageRef = window.loanStorage.ref();
            const fileRef = storageRef.child(path);
            
            // رفع الملف
            const uploadTask = fileRef.put(file);
            
            // مراقبة عملية الرفع
            uploadTask.on('state_changed',
                // التقدم
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`الرفع: ${progress}%`);
                },
                // الخطأ
                (error) => {
                    reject(error);
                },
                // الاكتمال
                () => {
                    // الحصول على URL التنزيل
                    uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                        resolve(downloadURL);
                    });
                }
            );
        });
    }
    
    // ===========================
    // وظائف واجهة المستخدم
    // ===========================
    
    /**
     * إنشاء عناصر واجهة المستخدم
     */
    function createLoanUIElements() {
        // إضافة شعار القروض للقائمة الجانبية
        createLoanSidebarMenu();
        
        // إنشاء صفحة القروض الرئيسية
        createLoansPage();
        
        // إنشاء صفحة إضافة قرض جديد
        createAddLoanPage();
        
        // إنشاء صفحة القروض الموافق عليها
        createApprovedLoansPage();
        
        // إنشاء صفحة القروض المرفوضة
        createRejectedLoansPage();
        
        // إنشاء صفحة إعدادات القروض
        createLoanSettingsPage();
        
        // إنشاء النوافذ المنبثقة
        createLoanModals();
        
        // إضافة أنماط CSS
        addLoanCustomStyles();
        
        console.log('تم إنشاء عناصر واجهة المستخدم لنظام القروض بنجاح');
    }
    
    /**
     * إضافة قائمة القروض إلى الشريط الجانبي
     */
    function createLoanSidebarMenu() {
        // حذف العناصر القديمة إن وجدت لمنع التكرار
        removeLoanExistingMenuItems();
        
        const sidebar = document.querySelector('.sidebar .nav-list');
        if (!sidebar) {
            console.error('لم يتم العثور على القائمة الجانبية');
            return;
        }
        
        // إنشاء عنصر القائمة الرئيسي (القروض)
        const loansMenuItem = document.createElement('li');
        loansMenuItem.className = 'nav-item';
        loansMenuItem.innerHTML = `
            <a class="nav-link" data-page="loans" href="#">
                <div class="nav-icon">
                    <i class="fas fa-hand-holding-usd"></i>
                </div>
                <span>القروض النشطة</span>
            </a>
        `;
        
        // إنشاء عنصر قائمة إضافة قرض جديد
        const addLoanMenuItem = document.createElement('li');
        addLoanMenuItem.className = 'nav-item';
        addLoanMenuItem.innerHTML = `
            <a class="nav-link" data-page="add-loan" href="#">
                <div class="nav-icon">
                    <i class="fas fa-plus-circle"></i>
                </div>
                <span>إضافة قرض جديد</span>
            </a>
        `;
        
        // إنشاء عنصر قائمة القروض الموافق عليها
        const approvedLoansMenuItem = document.createElement('li');
        approvedLoansMenuItem.className = 'nav-item';
        approvedLoansMenuItem.innerHTML = `
            <a class="nav-link" data-page="approved-loans" href="#">
                <div class="nav-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <span>القروض الموافق عليها</span>
            </a>
        `;
        
        // إنشاء عنصر قائمة القروض المرفوضة
        const rejectedLoansMenuItem = document.createElement('li');
        rejectedLoansMenuItem.className = 'nav-item';
        rejectedLoansMenuItem.innerHTML = `
            <a class="nav-link" data-page="rejected-loans" href="#">
                <div class="nav-icon">
                    <i class="fas fa-times-circle"></i>
                </div>
                <span>القروض المرفوضة</span>
            </a>
        `;
        
        // إنشاء عنصر قائمة إعدادات القروض
        const loanSettingsMenuItem = document.createElement('li');
        loanSettingsMenuItem.className = 'nav-item';
        loanSettingsMenuItem.innerHTML = `
            <a class="nav-link" data-page="loan-settings" href="#">
                <div class="nav-icon">
                    <i class="fas fa-cog"></i>
                </div>
                <span>إعدادات القروض</span>
            </a>
        `;
        
        // إضافة العناصر إلى القائمة - نضعها بعد الأقساط
        const installmentSettingsItem = document.querySelector('.nav-link[data-page="installment-settings"]');
        if (installmentSettingsItem) {
            const parentItem = installmentSettingsItem.closest('.nav-item');
            sidebar.insertBefore(loanSettingsMenuItem, parentItem.nextSibling);
            sidebar.insertBefore(rejectedLoansMenuItem, loanSettingsMenuItem);
            sidebar.insertBefore(approvedLoansMenuItem, rejectedLoansMenuItem);
            sidebar.insertBefore(addLoanMenuItem, approvedLoansMenuItem);
            sidebar.insertBefore(loansMenuItem, addLoanMenuItem);
        } else {
            // إذا لم يتم العثور على عنصر إعدادات الأقساط، نضيفها قبل إعدادات النظام
            const settingsItem = document.querySelector('.nav-link[data-page="settings"]');
            if (settingsItem) {
                const parentItem = settingsItem.closest('.nav-item');
                sidebar.insertBefore(loanSettingsMenuItem, parentItem);
                sidebar.insertBefore(rejectedLoansMenuItem, loanSettingsMenuItem);
                sidebar.insertBefore(approvedLoansMenuItem, rejectedLoansMenuItem);
                sidebar.insertBefore(addLoanMenuItem, approvedLoansMenuItem);
                sidebar.insertBefore(loansMenuItem, addLoanMenuItem);
            } else {
                // إذا لم يتم العثور على أي عنصر، نضيفها في النهاية
                sidebar.appendChild(loansMenuItem);
                sidebar.appendChild(addLoanMenuItem);
                sidebar.appendChild(approvedLoansMenuItem);
                sidebar.appendChild(rejectedLoansMenuItem);
                sidebar.appendChild(loanSettingsMenuItem);
            }
        }
        
        // إضافة مستمعي الأحداث
        setupLoanMenuEventListeners();
        
        console.log('تم إضافة عناصر قائمة القروض إلى الشريط الجانبي');
    }
    
    /**
     * حذف عناصر قائمة القروض الموجودة مسبقاً لمنع التكرار
     */
    function removeLoanExistingMenuItems() {
        // حذف عناصر قائمة القروض الموجودة
        const existingLoanLinks = document.querySelectorAll('.nav-link[data-page="loans"], .nav-link[data-page="add-loan"], .nav-link[data-page="approved-loans"], .nav-link[data-page="rejected-loans"], .nav-link[data-page="loan-settings"]');
        
        existingLoanLinks.forEach(link => {
            const menuItem = link.closest('.nav-item');
            if (menuItem) {
                menuItem.remove();
            }
        });
    }
    
    /**
     * إعداد مستمعي أحداث عناصر قائمة القروض
     */
    function setupLoanMenuEventListeners() {
        // مستمع حدث لصفحة القروض النشطة
        const loansLink = document.querySelector('.nav-link[data-page="loans"]');
        if (loansLink) {
            loansLink.addEventListener('click', function(e) {
                e.preventDefault();
                setActivePage('loans');
            });
        }
        
        // مستمع حدث لصفحة إضافة قرض جديد
        const addLoanLink = document.querySelector('.nav-link[data-page="add-loan"]');
        if (addLoanLink) {
            addLoanLink.addEventListener('click', function(e) {
                e.preventDefault();
                setActivePage('add-loan');
            });
        }
        
        // مستمع حدث لصفحة القروض الموافق عليها
        const approvedLoansLink = document.querySelector('.nav-link[data-page="approved-loans"]');
        if (approvedLoansLink) {
            approvedLoansLink.addEventListener('click', function(e) {
                e.preventDefault();
                setActivePage('approved-loans');
            });
        }
        
        // مستمع حدث لصفحة القروض المرفوضة
        const rejectedLoansLink = document.querySelector('.nav-link[data-page="rejected-loans"]');
        if (rejectedLoansLink) {
            rejectedLoansLink.addEventListener('click', function(e) {
                e.preventDefault();
                setActivePage('rejected-loans');
            });
        }
        
        // مستمع حدث لصفحة إعدادات القروض
        const loanSettingsLink = document.querySelector('.nav-link[data-page="loan-settings"]');
        if (loanSettingsLink) {
            loanSettingsLink.addEventListener('click', function(e) {
                e.preventDefault();
                setActivePage('loan-settings');
            });
        }
    }
    
    /**
     * إنشاء صفحة القروض الرئيسية
     */
    function createLoansPage() {
        // التحقق من وجود الصفحة
        if (document.getElementById('loans-page')) {
            console.log('صفحة القروض موجودة بالفعل');
            return;
        }
        
        // إنشاء صفحة القروض
        const loansPage = document.createElement('div');
        loansPage.className = 'page';
        loansPage.id = 'loans-page';
        
        loansPage.innerHTML = `
            <div class="header">
                <button class="toggle-sidebar">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 class="page-title">القروض النشطة</h1>
                <div class="header-actions">
                    <div class="search-box">
                        <input class="search-input" id="loans-search" placeholder="بحث عن قروض..." type="text" />
                        <i class="fas fa-search search-icon"></i>
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-primary" id="new-loan-btn">
                            <i class="fas fa-plus"></i>
                            <span>إضافة قرض جديد</span>
                        </button>
                        <div class="dropdown">
                            <button class="btn btn-outline dropdown-toggle">
                                <i class="fas fa-cog"></i>
                                <span>الخيارات</span>
                            </button>
                            <div class="dropdown-menu">
                                <a href="#" class="dropdown-item" id="export-loans-btn">
                                    <i class="fas fa-file-export"></i>
                                    <span>تصدير القروض</span>
                                </a>
                                <a href="#" class="dropdown-item" id="import-loans-btn">
                                    <i class="fas fa-file-import"></i>
                                    <span>استيراد القروض</span>
                                </a>
                                <a href="#" class="dropdown-item" id="print-loans-btn">
                                    <i class="fas fa-print"></i>
                                    <span>طباعة</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-section">
                <div class="dashboard-cards">
                    <div class="card">
                        <div class="card-pattern">
                            <i class="fas fa-money-check-alt"></i>
                        </div>
                        <div class="card-header">
                            <div>
                                <div class="card-title">إجمالي القروض</div>
                                <div class="card-value" id="total-loans-count">0</div>
                            </div>
                            <div class="card-icon primary">
                                <i class="fas fa-money-check-alt"></i>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-pattern">
                            <i class="fas fa-coins"></i>
                        </div>
                        <div class="card-header">
                            <div>
                                <div class="card-title">إجمالي المبالغ</div>
                                <div class="card-value" id="total-loans-amount">0 دينار</div>
                            </div>
                            <div class="card-icon success">
                                <i class="fas fa-coins"></i>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-pattern">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="card-header">
                            <div>
                                <div class="card-title">القروض بانتظار الموافقة</div>
                                <div class="card-value" id="pending-loans-count">0</div>
                            </div>
                            <div class="card-icon warning">
                                <i class="fas fa-clock"></i>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-pattern">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="card-header">
                            <div>
                                <div class="card-title">معدل الموافقة</div>
                                <div class="card-value" id="approval-rate">0%</div>
                            </div>
                            <div class="card-icon info">
                                <i class="fas fa-chart-line"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">طلبات القروض النشطة</h2>
                    <div class="section-actions">
                        <div class="btn-group filter-buttons">
                            <button class="btn btn-outline btn-sm active" data-filter="all">الكل</button>
                            <button class="btn btn-outline btn-sm" data-filter="kasb">كاسب</button>
                            <button class="btn btn-outline btn-sm" data-filter="employee">موظف</button>
                            <button class="btn btn-outline btn-sm" data-filter="military">عسكري</button>
                            <button class="btn btn-outline btn-sm" data-filter="social">رعاية اجتماعية</button>
                        </div>
                        <button class="btn btn-outline btn-sm" id="refresh-loans-btn" title="تحديث">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="table-responsive">
                    <table id="loans-table" class="data-table">
                        <thead>
                            <tr>
                                <th width="60">المعرف</th>
                                <th width="180">المقترض</th>
                                <th width="120">نوع القرض</th>
                                <th width="120">المبلغ</th>
                                <th width="100">الفائدة</th>
                                <th width="100">المدة</th>
                                <th width="120">تاريخ الطلب</th>
                                <th width="100">الحالة</th>
                                <th width="150">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- سيتم ملؤها ديناميكيًا -->
                        </tbody>
                    </table>
                </div>
                <div class="table-empty-placeholder" id="loans-empty">
                    <i class="fas fa-hand-holding-usd"></i>
                    <p>لا توجد طلبات قروض نشطة</p>
                    <button class="btn btn-primary" id="add-first-loan-btn">
                        <i class="fas fa-plus"></i>
                        <span>إضافة قرض جديد</span>
                    </button>
                </div>
                <div class="pagination" id="loans-pagination">
                    <!-- سيتم ملؤها ديناميكيًا -->
                </div>
            </div>
        `;
        
        // إضافة الصفحة إلى المحتوى الرئيسي
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(loansPage);
            console.log('تم إنشاء صفحة القروض النشطة بنجاح');
        } else {
            console.error('لم يتم العثور على المحتوى الرئيسي');
        }
    }
    
    /**
     * إنشاء صفحة إضافة قرض جديد
     */
    function createAddLoanPage() {
        // التحقق من وجود الصفحة
        if (document.getElementById('add-loan-page')) {
            console.log('صفحة إضافة قرض جديد موجودة بالفعل');
            return;
        }
        
        // إنشاء صفحة إضافة قرض جديد
        const addLoanPage = document.createElement('div');
        addLoanPage.className = 'page';
        addLoanPage.id = 'add-loan-page';
        
        addLoanPage.innerHTML = `
            <div class="header">
                <button class="toggle-sidebar">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 class="page-title">إضافة قرض جديد</h1>
                <div class="header-actions">
                    <button class="btn btn-primary" id="review-loan-btn">
                        <i class="fas fa-check-circle"></i>
                        <span>مراجعة وإرسال الطلب</span>
                    </button>
                </div>
            </div>
            
            <div class="loan-wizard">
                <div class="loan-wizard-steps">
                    <div class="wizard-step active" data-step="1">
                        <div class="step-number">1</div>
                        <div class="step-title">معلومات القرض</div>
                    </div>
                    <div class="wizard-step" data-step="2">
                        <div class="step-number">2</div>
                        <div class="step-title">معلومات المقترض</div>
                    </div>
                    <div class="wizard-step" data-step="3">
                        <div class="step-number">3</div>
                        <div class="step-title">معلومات الكفيل</div>
                    </div>
                    <div class="wizard-step" data-step="4">
                        <div class="step-number">4</div>
                        <div class="step-title">المراجعة والإرسال</div>
                    </div>
                </div>
                
                <div class="loan-wizard-content">
                    <!-- الخطوة 1: معلومات القرض -->
                    <div class="wizard-content-step active" data-step="1">
                        <div class="section">
                            <div class="section-header">
                                <h2 class="section-title">بيانات القرض الأساسية</h2>
                            </div>
                            <div class="section-content">
                                <form class="loan-form" id="loan-info-form">
                                    <div class="form-row">
                                        <div class="form-group col-md-6">
                                            <label class="form-label">نوع المقترض</label>
                                            <select class="form-select" id="borrower-category" required>
                                                <option value="">اختر نوع المقترض</option>
                                                <option value="kasb">كاسب</option>
                                                <option value="employee">موظف</option>
                                                <option value="military">عسكري</option>
                                                <option value="social">رعاية اجتماعية</option>
                                            </select>
                                        </div>
                                        <div class="form-group col-md-6">
                                            <label class="form-label">الاسم الكامل للمقترض</label>
                                            <input type="text" class="form-input" id="borrower-name" placeholder="الاسم الكامل للمقترض" required>
                                        </div>
                                    </div>
                                    
                                    <div class="form-row">
                                        <div class="form-group col-md-6">
                                            <label class="form-label">رقم الهاتف</label>
                                            <input type="tel" class="form-input" id="borrower-phone" placeholder="رقم الهاتف الرئيسي" required>
                                        </div>
                                        <div class="form-group col-md-6">
                                            <label class="form-label">رقم الهاتف البديل</label>
                                            <input type="tel" class="form-input" id="borrower-alt-phone" placeholder="رقم الهاتف البديل">
                                        </div>
                                    </div>
                                    
                                    <div class="form-row">
                                        <div class="form-group col-md-6">
                                            <label class="form-label">رقم البطاقة الشخصية</label>
                                            <input type="text" class="form-input" id="borrower-id-number" placeholder="رقم البطاقة الشخصية" required>
                                        </div>
                                        <div class="form-group col-md-6">
                                            <label class="form-label">العنوان</label>
                                            <input type="text" class="form-input" id="borrower-address" placeholder="عنوان المقترض" required>
                                        </div>
                                    </div>
                                    
                                    <div class="form-row">
                                        <div class="form-group col-md-4">
                                            <label class="form-label">مبلغ القرض</label>
                                            <div class="input-group">
                                                <input type="number" class="form-input" id="loan-amount" min="100000" step="100000" required>
                                                <span class="input-addon currency-addon"></span>
                                            </div>
                                            <small class="form-hint" id="max-loan-hint">الحد الأقصى: 0 دينار</small>
                                        </div>
                                        
                                        <div class="form-group col-md-4">
                                            <label class="form-label">نسبة الفائدة (%)</label>
                                            <div class="input-group">
                                                <input type="number" class="form-input" id="interest-rate" step="0.5" min="0" max="20" required>
                                                <span class="input-addon">%</span>
                                            </div>
                                        </div>
                                        
                                        <div class="form-group col-md-4">
                                            <label class="form-label">مدة القرض (أشهر)</label>
                                            <div class="input-group">
                                                <input type="number" class="form-input" id="loan-period" min="6" max="60" step="6" required>
                                                <span class="input-addon">شهر</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <div class="card bg-light p-3">
                                            <h4 class="summary-title">ملخص القرض</h4>
                                            <div id="loan-summary" class="summary-content">
                                                <div class="summary-row">
                                                    <span class="summary-label">مبلغ القرض:</span>
                                                    <span class="summary-value" id="summary-amount">0</span>
                                                </div>
                                                <div class="summary-row">
                                                    <span class="summary-label">قيمة الفوائد:</span>
                                                    <span class="summary-value" id="summary-interest">0</span>
                                                </div>
                                                <div class="summary-row total-row">
                                                    <span class="summary-label">إجمالي المبلغ:</span>
                                                    <span class="summary-value" id="summary-total">0</span>
                                                </div>
                                                <div class="summary-row monthly-row">
                                                    <span class="summary-label">القسط الشهري:</span>
                                                    <span class="summary-value" id="summary-monthly">0</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="form-actions">
                                <button class="btn btn-primary" id="loan-info-next">التالي <i class="fas fa-arrow-left"></i></button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- الخطوة 2: معلومات المقترض -->
                    <div class="wizard-content-step" data-step="2">
                        <div class="section">
                            <div class="section-header">
                                <h2 class="section-title">معلومات المقترض ومستنداته</h2>
                            </div>
                            <div class="section-content">
                                <form class="loan-form" id="borrower-info-form">
                                    <div class="form-row">
                                        <div class="form-group col-md-6">
                                            <label class="form-label">الراتب الشهري</label>
                                            <div class="input-group">
                                                <input type="number" class="form-input" id="borrower-salary" min="300000" step="50000" required>
                                                <span class="input-addon currency-addon"></span>
                                            </div>
                                            <small class="form-hint" id="min-salary-hint">الحد الأدنى: 0 دينار</small>
                                        </div>
                                        <div class="form-group col-md-6">
                                            <label class="form-label">مكان العمل / الوظيفة</label>
                                            <input type="text" class="form-input" id="borrower-workplace" placeholder="اسم مكان العمل أو الوظيفة" required>
                                        </div>
                                    </div>
                                    
                                    <div class="form-row">
                                        <div class="form-group col-md-6">
                                            <label class="form-label">عنوان العمل</label>
                                            <input type="text" class="form-input" id="borrower-work-address" placeholder="عنوان مكان العمل" required>
                                        </div>
                                        <div class="form-group col-md-6">
                                            <label class="form-label">مدة الخدمة (سنوات)</label>
                                            <input type="number" class="form-input" id="borrower-service-years" min="0" placeholder="مدة الخدمة بالسنوات" required>
                                        </div>
                                    </div>
                                    
                                    <h3 class="subsection-title">المستندات المطلوبة</h3>
                                    
                                    <div class="form-row">
                                        <div class="form-group col-md-6">
                                            <label class="form-label">البطاقة الموحدة (الوجه الأمامي)</label>
                                            <div class="file-upload-container">
                                                <input type="file" id="borrower-id-front" class="file-input" accept="image/*" required>
                                                <label for="borrower-id-front" class="file-label">
                                                    <i class="fas fa-upload"></i>
                                                    <span>اختر الملف</span>
                                                </label>
                                                <div class="file-preview" id="borrower-id-front-preview"></div>
                                            </div>
                                        </div>
                                        <div class="form-group col-md-6">
                                            <label class="form-label">البطاقة الموحدة (الوجه الخلفي)</label>
                                            <div class="file-upload-container">
                                                <input type="file" id="borrower-id-back" class="file-input" accept="image/*" required>
                                                <label for="borrower-id-back" class="file-label">
                                                    <i class="fas fa-upload"></i>
                                                    <span>اختر الملف</span>
                                                </label>
                                                <div class="file-preview" id="borrower-id-back-preview"></div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="form-row">
                                        <div class="form-group col-md-6">
                                            <label class="form-label">بطاقة السكن (الوجه الأمامي)</label>
                                            <div class="file-upload-container">
                                                <input type="file" id="borrower-residence-front" class="file-input" accept="image/*" required>
                                                <label for="borrower-residence-front" class="file-label">
                                                    <i class="fas fa-upload"></i>
                                                    <span>اختر الملف</span>
                                                </label>
                                                <div class="file-preview" id="borrower-residence-front-preview"></div>
                                            </div>
                                        </div>
                                        <div class="form-group col-md-6">
                                            <label class="form-label">بطاقة السكن (الوجه الخلفي)</label>
                                            <div class="file-upload-container">
                                                <input type="file" id="borrower-residence-back" class="file-input" accept="image/*" required>
                                                <label for="borrower-residence-back" class="file-label">
                                                    <i class="fas fa-upload"></i>
                                                    <span>اختر الملف</span>
                                                </label>
                                                <div class="file-preview" id="borrower-residence-back-preview"></div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="form-row">
                                        <div class="form-group col-md-6">
                                            <label class="form-label">تأييد بالراتب</label>
                                            <div class="file-upload-container">
                                                <input type="file" id="borrower-salary-certificate" class="file-input" accept="image/*,application/pdf" required>
                                                <label for="borrower-salary-certificate" class="file-label">
                                                    <i class="fas fa-upload"></i>
                                                    <span>اختر الملف</span>
                                                </label>
                                                <div class="file-preview" id="borrower-salary-certificate-preview"></div>
                                            </div>
                                        </div>
                                        <div class="form-group col-md-6">
                                            <label class="form-label">تأييد استمرارية بالعمل</label>
                                            <div class="file-upload-container">
                                                <input type="file" id="borrower-work-certificate" class="file-input" accept="image/*,application/pdf" required>
                                                <label for="borrower-work-certificate" class="file-label">
                                                    <i class="fas fa-upload"></i>
                                                    <span>اختر الملف</span>
                                                </label>
                                                <div class="file-preview" id="borrower-work-certificate-preview"></div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="form-actions">
                                <button class="btn btn-outline" id="borrower-info-prev"><i class="fas fa-arrow-right"></i> السابق</button>
                                <button class="btn btn-primary" id="borrower-info-next">التالي <i class="fas fa-arrow-left"></i></button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- الخطوة 3: معلومات الكفيل -->
                    <div class="wizard-content-step" data-step="3">
                        <div class="section">
                            <div class="section-header">
                                <h2 class="section-title">معلومات الكفيل الأول</h2>
                            </div>
                            <div class="section-content">
                                <form class="loan-form" id="guarantor-info-form">
                                    <div class="form-row">
                                        <div class="form-group col-md-6">
                                            <label class="form-label">الاسم الكامل للكفيل</label>
                                            <input type="text" class="form-input" id="guarantor-name" placeholder="الاسم الكامل للكفيل" required>
                                        </div>
                                        <div class="form-group col-md-6">
                                            <label class="form-label">رقم الهاتف</label>
                                            <input type="tel" class="form-input" id="guarantor-phone" placeholder="رقم الهاتف الرئيسي" required>
                                        </div>
                                    </div>
                                    
                                    <div class="form-row">
                                        <div class="form-group col-md-6">
                                            <label class="form-label">رقم الهاتف البديل</label>
                                            <input type="tel" class="form-input" id="guarantor-alt-phone" placeholder="رقم الهاتف البديل">
                                        </div>
                                        <div class="form-group col-md-6">
                                            <label class="form-label">العنوان</label>
                                            <input type="text" class="form-input" id="guarantor-address" placeholder="عنوان الكفيل" required>
                                        </div>
                                    </div>
                                    
                                    <div class="form-row">
                                        <div class="form-group col-md-6">
                                            <label class="form-label">مكان العمل / الوظيفة</label>
                                            <input type="text" class="form-input" id="guarantor-workplace" placeholder="اسم مكان العمل أو الوظيفة" required>
                                        </div>
                                        <div class="form-group col-md-6">
                                            <label class="form-label">الراتب الشهري</label>
                                            <div class="input-group">
                                                <input type="number" class="form-input" id="guarantor-salary" min="300000" step="50000" required>
                                                <span class="input-addon currency-addon"></span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <h3 class="subsection-title">مستندات الكفيل</h3>
                                    
                                    <div class="form-row">
                                        <div class="form-group col-md-6">
                                            <label class="form-label">البطاقة الموحدة (الوجه الأمامي)</label>
                                            <div class="file-upload-container">
                                                <input type="file" id="guarantor-id-front" class="file-input" accept="image/*" required>
                                                <label for="guarantor-id-front" class="file-label">
                                                    <i class="fas fa-upload"></i>
                                                    <span>اختر الملف</span>
                                                </label>
                                                <div class="file-preview" id="guarantor-id-front-preview"></div>
                                            </div>
                                        </div>
                                        <div class="form-group col-md-6">
                                            <label class="form-label">البطاقة الموحدة (الوجه الخلفي)</label>
                                            <div class="file-upload-container">
                                                <input type="file" id="guarantor-id-back" class="file-input" accept="image/*" required>
                                                <label for="guarantor-id-back" class="file-label">
                                                    <i class="fas fa-upload"></i>
                                                    <span>اختر الملف</span>
                                                </label>
                                                <div class="file-preview" id="guarantor-id-back-preview"></div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="form-row">
                                        <div class="form-group col-md-6">
                                            <label class="form-label">بطاقة السكن (الوجه الأمامي)</label>
                                            <div class="file-upload-container">
                                                <input type="file" id="guarantor-residence-front" class="file-input" accept="image/*" required>
                                                <label for="guarantor-residence-front" class="file-label">
                                                    <i class="fas fa-upload"></i>
                                                    <span>اختر الملف</span>
                                                </label>
                                                <div class="file-preview" id="guarantor-residence-front-preview"></div>
                                            </div>
                                        </div>
                                        <div class="form-group col-md-6">
                                            <label class="form-label">بطاقة السكن (الوجه الخلفي)</label>
                                            <div class="file-upload-container">
                                                <input type="file" id="guarantor-residence-back" class="file-input" accept="image/*" required>
                                                <label for="guarantor-residence-back" class="file-label">
                                                    <i class="fas fa-upload"></i>
                                                    <span>اختر الملف</span>
                                                </label>
                                                <div class="file-preview" id="guarantor-residence-back-preview"></div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="form-row">
                                        <div class="form-group col-md-6">
                                            <label class="form-label">تأييد بالراتب</label>
                                            <div class="file-upload-container">
                                                <input type="file" id="guarantor-salary-certificate" class="file-input" accept="image/*,application/pdf" required>
                                                <label for="guarantor-salary-certificate" class="file-label">
                                                    <i class="fas fa-upload"></i>
                                                    <span>اختر الملف</span>
                                                </label>
                                                <div class="file-preview" id="guarantor-salary-certificate-preview"></div>
                                            </div>
                                        </div>
                                        <div class="form-group col-md-6">
                                            <label class="form-label">تأييد استمرارية بالعمل</label>
                                            <div class="file-upload-container">
                                                <input type="file" id="guarantor-work-certificate" class="file-input" accept="image/*,application/pdf">
                                                <label for="guarantor-work-certificate" class="file-label">
                                                    <i class="fas fa-upload"></i>
                                                    <span>اختر الملف</span>
                                                </label>
                                                <div class="file-preview" id="guarantor-work-certificate-preview"></div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="add-another-section">
                                        <button type="button" class="btn btn-outline" id="add-second-guarantor-btn">
                                            <i class="fas fa-plus-circle"></i> إضافة كفيل ثاني
                                        </button>
                                    </div>
                                    
                                    <!-- قسم الكفيل الثاني (مخفي بشكل افتراضي) -->
                                    <div id="second-guarantor-section" class="hidden-section">
                                        <h3 class="subsection-title mt-4">معلومات الكفيل الثاني</h3>
                                        
                                        <div class="form-row">
                                            <div class="form-group col-md-6">
                                                <label class="form-label">الاسم الكامل للكفيل الثاني</label>
                                                <input type="text" class="form-input" id="guarantor2-name" placeholder="الاسم الكامل للكفيل الثاني">
                                            </div>
                                            <div class="form-group col-md-6">
                                                <label class="form-label">رقم الهاتف</label>
                                                <input type="tel" class="form-input" id="guarantor2-phone" placeholder="رقم الهاتف الرئيسي">
                                            </div>
                                        </div>
                                        
                                        <div class="form-row">
                                            <div class="form-group col-md-6">
                                                <label class="form-label">رقم الهاتف البديل</label>
                                                <input type="tel" class="form-input" id="guarantor2-alt-phone" placeholder="رقم الهاتف البديل">
                                            </div>
                                            <div class="form-group col-md-6">
                                                <label class="form-label">العنوان</label>
                                                <input type="text" class="form-input" id="guarantor2-address" placeholder="عنوان الكفيل الثاني">
                                            </div>
                                        </div>
                                        
                                        <div class="form-row">
                                            <div class="form-group col-md-6">
                                                <label class="form-label">مكان العمل / الوظيفة</label>
                                                <input type="text" class="form-input" id="guarantor2-workplace" placeholder="اسم مكان العمل أو الوظيفة">
                                            </div>
                                            <div class="form-group col-md-6">
                                                <label class="form-label">الراتب الشهري</label>
                                                <div class="input-group">
                                                    <input type="number" class="form-input" id="guarantor2-salary" min="300000" step="50000">
                                                    <span class="input-addon currency-addon"></span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <h3 class="subsection-title">مستندات الكفيل الثاني</h3>
                                        
                                        <div class="form-row">
                                            <div class="form-group col-md-6">
                                                <label class="form-label">البطاقة الموحدة (الوجه الأمامي)</label>
                                                <div class="file-upload-container">
                                                    <input type="file" id="guarantor2-id-front" class="file-input" accept="image/*">
                                                    <label for="guarantor2-id-front" class="file-label">
                                                        <i class="fas fa-upload"></i>
                                                        <span>اختر الملف</span>
                                                    </label>
                                                    <div class="file-preview" id="guarantor2-id-front-preview"></div>
                                                </div>
                                            </div>
                                            <div class="form-group col-md-6">
                                                <label class="form-label">البطاقة الموحدة (الوجه الخلفي)</label>
                                                <div class="file-upload-container">
                                                    <input type="file" id="guarantor2-id-back" class="file-input" accept="image/*">
                                                    <label for="guarantor2-id-back" class="file-label">
                                                        <i class="fas fa-upload"></i>
                                                        <span>اختر الملف</span>
                                                    </label>
                                                    <div class="file-preview" id="guarantor2-id-back-preview"></div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="form-row">
                                            <div class="form-group col-md-6">
                                                <label class="form-label">بطاقة السكن (الوجه الأمامي)</label>
                                                <div class="file-upload-container">
                                                    <input type="file" id="guarantor2-residence-front" class="file-input" accept="image/*">
                                                    <label for="guarantor2-residence-front" class="file-label">
                                                        <i class="fas fa-upload"></i>
                                                        <span>اختر الملف</span>
                                                    </label>
                                                    <div class="file-preview" id="guarantor2-residence-front-preview"></div>
                                                </div>
                                            </div>
                                            <div class="form-group col-md-6">
                                                <label class="form-label">بطاقة السكن (الوجه الخلفي)</label>
                                                <div class="file-upload-container">
                                                    <input type="file" id="guarantor2-residence-back" class="file-input" accept="image/*">
                                                    <label for="guarantor2-residence-back" class="file-label">
                                                        <i class="fas fa-upload"></i>
                                                        <span>اختر الملف</span>
                                                    </label>
                                                    <div class="file-preview" id="guarantor2-residence-back-preview"></div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="form-row">
                                            <div class="form-group col-md-6">
                                                <label class="form-label">تأييد بالراتب</label>
                                                <div class="file-upload-container">
                                                    <input type="file" id="guarantor2-salary-certificate" class="file-input" accept="image/*,application/pdf">
                                                    <label for="guarantor2-salary-certificate" class="file-label">
                                                        <i class="fas fa-upload"></i>
                                                        <span>اختر الملف</span>
                                                    </label>
                                                    <div class="file-preview" id="guarantor2-salary-certificate-preview"></div>
                                                </div>
                                            </div>
                                            <div class="form-group col-md-6">
                                                <label class="form-label">تأييد استمرارية بالعمل</label>
                                                <div class="file-upload-container">
                                                    <input type="file" id="guarantor2-work-certificate" class="file-input" accept="image/*,application/pdf">
                                                    <label for="guarantor2-work-certificate" class="file-label">
                                                        <i class="fas fa-upload"></i>
                                                        <span>اختر الملف</span>
                                                    </label>
                                                    <div class="file-preview" id="guarantor2-work-certificate-preview"></div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <button type="button" class="btn btn-danger mt-2" id="remove-second-guarantor-btn">
                                            <i class="fas fa-times-circle"></i> إزالة الكفيل الثاني
                                        </button>
                                    </div>
                                </form>
                            </div>
                            <div class="form-actions">
                                <button class="btn btn-outline" id="guarantor-info-prev"><i class="fas fa-arrow-right"></i> السابق</button>
                                <button class="btn btn-primary" id="guarantor-info-next">التالي <i class="fas fa-arrow-left"></i></button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- الخطوة 4: المراجعة والتقديم -->
                    <div class="wizard-content-step" data-step="4">
                        <div class="section">
                            <div class="section-header">
                                <h2 class="section-title">مراجعة وتقديم طلب القرض</h2>
                            </div>
                            <div class="section-content">
                                <div class="review-container">
                                    <h3 class="review-title">ملخص معلومات القرض</h3>
                                    <div class="review-section">
                                        <div class="review-row">
                                            <div class="review-label">نوع المقترض:</div>
                                            <div class="review-value" id="review-borrower-category"></div>
                                        </div>
                                        <div class="review-row">
                                            <div class="review-label">اسم المقترض:</div>
                                            <div class="review-value" id="review-borrower-name"></div>
                                        </div>
                                        <div class="review-row">
                                            <div class="review-label">رقم الهاتف:</div>
                                            <div class="review-value" id="review-borrower-phone"></div>
                                        </div>
                                        <div class="review-row">
                                            <div class="review-label">العنوان:</div>
                                            <div class="review-value" id="review-borrower-address"></div>
                                        </div>
                                    </div>
                                    
                                    <h3 class="review-title">تفاصيل القرض</h3>
                                    <div class="review-section">
                                        <div class="review-row">
                                            <div class="review-label">مبلغ القرض:</div>
                                            <div class="review-value" id="review-loan-amount"></div>
                                        </div>
                                        <div class="review-row">
                                            <div class="review-label">نسبة الفائدة:</div>
                                            <div class="review-value" id="review-interest-rate"></div>
                                        </div>
                                        <div class="review-row">
                                            <div class="review-label">مدة القرض:</div>
                                            <div class="review-value" id="review-loan-period"></div>
                                        </div>
                                        <div class="review-row">
                                            <div class="review-label">القسط الشهري:</div>
                                            <div class="review-value" id="review-monthly-payment"></div>
                                        </div>
                                        <div class="review-row">
                                            <div class="review-label">إجمالي المبلغ:</div>
                                            <div class="review-value" id="review-total-amount"></div>
                                        </div>
                                    </div>
                                    
                                    <h3 class="review-title">الكفلاء</h3>
                                    <div class="review-section">
                                        <div class="review-row">
                                            <div class="review-label">اسم الكفيل الأول:</div>
                                            <div class="review-value" id="review-guarantor-name"></div>
                                        </div>
                                        <div class="review-row">
                                            <div class="review-label">مستندات الكفيل الأول:</div>
                                            <div class="review-value" id="review-guarantor-documents"></div>
                                        </div>
                                        <div class="review-row" id="review-second-guarantor-row">
                                            <div class="review-label">الكفيل الثاني:</div>
                                            <div class="review-value" id="review-has-second-guarantor">غير مضاف</div>
                                        </div>
                                    </div>
                                    
                                    <div class="review-warning">
                                        <i class="fas fa-exclamation-triangle"></i>
                                        <div>
                                            <strong>ملاحظة هامة:</strong>
                                            <p>بعد إرسال الطلب، سيتم مراجعته من قبل فريق الائتمان. قد يستغرق ذلك من 1 إلى 3 أيام عمل.</p>
                                        </div>
                                    </div>
                                    
                                    <div class="form-check mt-3">
                                        <input type="checkbox" id="loan-agreement" class="form-check-input" required>
                                        <label for="loan-agreement" class="form-check-label">
                                            أقر بأن جميع المعلومات المقدمة صحيحة وأوافق على شروط وأحكام القرض
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div class="form-actions">
                                <button class="btn btn-outline" id="review-prev"><i class="fas fa-arrow-right"></i> السابق</button>
                                <button class="btn btn-success" id="submit-loan-btn" disabled>
                                    <i class="fas fa-check-circle"></i> تقديم طلب القرض
                                </button>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        `;
        
        // إضافة الصفحة إلى المحتوى الرئيسي
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(addLoanPage);
            console.log('تم إنشاء صفحة إضافة قرض جديد بنجاح');
        } else {
            console.error('لم يتم العثور على المحتوى الرئيسي');
        }
    }
    
    /**
     * إنشاء صفحة القروض الموافق عليها
     */
    function createApprovedLoansPage() {
        // التحقق من وجود الصفحة
        if (document.getElementById('approved-loans-page')) {
            console.log('صفحة القروض الموافق عليها موجودة بالفعل');
            return;
        }
        
        // إنشاء صفحة القروض الموافق عليها
        const approvedLoansPage = document.createElement('div');
        approvedLoansPage.className = 'page';
        approvedLoansPage.id = 'approved-loans-page';
        
        approvedLoansPage.innerHTML = `
            <div class="header">
                <button class="toggle-sidebar">
                    <i class="fas fa-bars"></i>
                </button>
                <h1 class="page-title">القروض الموافق عليها</h1>
                <div class="header-actions">
                    <div class="search-box">
                        <input class="search-input" id="approved-loans-search" placeholder="بحث في القروض الموافق عليها..." type="text" />
                        <i class="fas fa-search search-icon"></i>
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-outline" id="export-approved-loans-btn">
                            <i class="fas fa-file-export"></i>
                            <span>تصدير</span>
                        </button>
                        <button class="btn btn-outline" id="print-approved-loans-btn">
                            <i class="fas fa-print"></i>
                            <span>طباعة</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">قائمة القروض الموافق عليها</h2>
                    <div class="section-actions">
                    <div class="date-filter">
                              <label>تصفية حسب التاريخ:</label>
                              <select id="approved-date-filter" class="form-select form-select-sm">
                                  <option value="all">الكل</option>
                                  <option value="this-month">هذا الشهر</option>
                                  <option value="last-month">الشهر الماضي</option>
                                  <option value="this-year">هذه السنة</option>
                                  <option value="custom">مخصص</option>
                              </select>
                          </div>
                          <button class="btn btn-outline btn-sm" id="refresh-approved-loans-btn" title="تحديث">
                              <i class="fas fa-sync-alt"></i>
                          </button>
                      </div>
                  </div>
                  <div class="table-responsive">
                      <table id="approved-loans-table" class="data-table">
                          <thead>
                              <tr>
                                  <th width="60">المعرف</th>
                                  <th width="180">المقترض</th>
                                  <th width="120">نوع القرض</th>
                                  <th width="120">المبلغ</th>
                                  <th width="100">الفائدة</th>
                                  <th width="100">المدة</th>
                                  <th width="120">تاريخ الموافقة</th>
                                  <th width="120">رقم القسط</th>
                                  <th width="120">الإجراءات</th>
                              </tr>
                          </thead>
                          <tbody>
                              <!-- سيتم ملؤها ديناميكيًا -->
                          </tbody>
                      </table>
                  </div>
                  <div class="table-empty-placeholder" id="approved-loans-empty">
                      <i class="fas fa-check-circle"></i>
                      <p>لا توجد قروض موافق عليها</p>
                  </div>
                  <div class="pagination" id="approved-loans-pagination">
                      <!-- سيتم ملؤها ديناميكيًا -->
                  </div>
              </div>
              
              <div class="section">
                  <div class="section-header">
                      <h2 class="section-title">إحصائيات القروض الموافق عليها</h2>
                  </div>
                  <div class="cards-container">
                      <div class="card">
                          <div class="card-header">
                              <div>
                                  <div class="card-title">إجمالي عدد القروض</div>
                                  <div class="card-value" id="total-approved-count">0</div>
                              </div>
                              <div class="card-icon success">
                                  <i class="fas fa-check-circle"></i>
                              </div>
                          </div>
                      </div>
                      <div class="card">
                          <div class="card-header">
                              <div>
                                  <div class="card-title">إجمالي مبالغ القروض</div>
                                  <div class="card-value" id="total-approved-amount">0 دينار</div>
                              </div>
                              <div class="card-icon info">
                                  <i class="fas fa-money-bill-wave"></i>
                              </div>
                          </div>
                      </div>
                      <div class="card">
                          <div class="card-header">
                              <div>
                                  <div class="card-title">القروض الأكثر شيوعاً</div>
                                  <div class="card-value" id="most-common-loan-type">-</div>
                              </div>
                              <div class="card-icon primary">
                                  <i class="fas fa-chart-pie"></i>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          `;
          
          // إضافة الصفحة إلى المحتوى الرئيسي
          const mainContent = document.querySelector('.main-content');
          if (mainContent) {
              mainContent.appendChild(approvedLoansPage);
              console.log('تم إنشاء صفحة القروض الموافق عليها بنجاح');
          } else {
              console.error('لم يتم العثور على المحتوى الرئيسي');
          }
      }
      
      /**
       * إنشاء صفحة القروض المرفوضة
       */
      function createRejectedLoansPage() {
          // التحقق من وجود الصفحة
          if (document.getElementById('rejected-loans-page')) {
              console.log('صفحة القروض المرفوضة موجودة بالفعل');
              return;
          }
          
          // إنشاء صفحة القروض المرفوضة
          const rejectedLoansPage = document.createElement('div');
          rejectedLoansPage.className = 'page';
          rejectedLoansPage.id = 'rejected-loans-page';
          
          rejectedLoansPage.innerHTML = `
              <div class="header">
                  <button class="toggle-sidebar">
                      <i class="fas fa-bars"></i>
                  </button>
                  <h1 class="page-title">القروض المرفوضة</h1>
                  <div class="header-actions">
                      <div class="search-box">
                          <input class="search-input" id="rejected-loans-search" placeholder="بحث في القروض المرفوضة..." type="text" />
                          <i class="fas fa-search search-icon"></i>
                      </div>
                      <div class="btn-group">
                          <button class="btn btn-outline" id="export-rejected-loans-btn">
                              <i class="fas fa-file-export"></i>
                              <span>تصدير</span>
                          </button>
                          <button class="btn btn-outline" id="print-rejected-loans-btn">
                              <i class="fas fa-print"></i>
                              <span>طباعة</span>
                          </button>
                      </div>
                  </div>
              </div>
              
              <div class="section">
                  <div class="section-header">
                      <h2 class="section-title">قائمة القروض المرفوضة</h2>
                      <div class="section-actions">
                          <div class="date-filter">
                              <label>تصفية حسب التاريخ:</label>
                              <select id="rejected-date-filter" class="form-select form-select-sm">
                                  <option value="all">الكل</option>
                                  <option value="this-month">هذا الشهر</option>
                                  <option value="last-month">الشهر الماضي</option>
                                  <option value="this-year">هذه السنة</option>
                                  <option value="custom">مخصص</option>
                              </select>
                          </div>
                          <button class="btn btn-outline btn-sm" id="refresh-rejected-loans-btn" title="تحديث">
                              <i class="fas fa-sync-alt"></i>
                          </button>
                      </div>
                  </div>
                  <div class="table-responsive">
                      <table id="rejected-loans-table" class="data-table">
                          <thead>
                              <tr>
                                  <th width="60">المعرف</th>
                                  <th width="180">المقترض</th>
                                  <th width="120">نوع القرض</th>
                                  <th width="120">المبلغ</th>
                                  <th>سبب الرفض</th>
                                  <th width="120">تاريخ الرفض</th>
                                  <th width="120">الإجراءات</th>
                              </tr>
                          </thead>
                          <tbody>
                              <!-- سيتم ملؤها ديناميكيًا -->
                          </tbody>
                      </table>
                  </div>
                  <div class="table-empty-placeholder" id="rejected-loans-empty">
                      <i class="fas fa-times-circle"></i>
                      <p>لا توجد قروض مرفوضة</p>
                  </div>
                  <div class="pagination" id="rejected-loans-pagination">
                      <!-- سيتم ملؤها ديناميكيًا -->
                  </div>
              </div>
              
              <div class="section">
                  <div class="section-header">
                      <h2 class="section-title">أسباب الرفض الشائعة</h2>
                  </div>
                  <div id="rejection-reasons-chart" class="chart-container">
                      <!-- سيتم إنشاء الرسم البياني هنا -->
                      <div class="chart-placeholder">
                          <i class="fas fa-chart-pie"></i>
                          <p>سيتم عرض إحصائيات أسباب الرفض هنا</p>
                      </div>
                  </div>
              </div>
          `;
          
          // إضافة الصفحة إلى المحتوى الرئيسي
          const mainContent = document.querySelector('.main-content');
          if (mainContent) {
              mainContent.appendChild(rejectedLoansPage);
              console.log('تم إنشاء صفحة القروض المرفوضة بنجاح');
          } else {
              console.error('لم يتم العثور على المحتوى الرئيسي');
          }
      }
      
      /**
       * إنشاء صفحة إعدادات القروض
       */
      function createLoanSettingsPage() {
          // التحقق من وجود الصفحة
          if (document.getElementById('loan-settings-page')) {
              console.log('صفحة إعدادات القروض موجودة بالفعل');
              return;
          }
          
          // إنشاء صفحة إعدادات القروض
          const loanSettingsPage = document.createElement('div');
          loanSettingsPage.className = 'page';
          loanSettingsPage.id = 'loan-settings-page';
          
          loanSettingsPage.innerHTML = `
              <div class="header">
                  <button class="toggle-sidebar">
                      <i class="fas fa-bars"></i>
                  </button>
                  <h1 class="page-title">إعدادات نظام القروض</h1>
                  <div class="header-actions">
                      <div class="btn-group">
                          <button class="btn btn-primary" id="save-loan-settings-btn">
                              <i class="fas fa-save"></i>
                              <span>حفظ الإعدادات</span>
                          </button>
                          <button class="btn btn-outline" id="reset-loan-settings-btn">
                              <i class="fas fa-undo"></i>
                              <span>استعادة الافتراضي</span>
                          </button>
                      </div>
                  </div>
              </div>
              
              <div class="section">
                  <div class="section-header">
                      <h2 class="section-title">الإعدادات العامة</h2>
                  </div>
                  <div class="settings-form">
                      <form id="loan-settings-form">
                          <div class="form-row">
                              <div class="form-group col-md-6">
                                  <div class="form-check">
                                      <input type="checkbox" class="form-check-input" id="settings-loan-notifications" name="enableNotifications">
                                      <label class="form-check-label" for="settings-loan-notifications">تفعيل الإشعارات</label>
                                  </div>
                              </div>
                              <div class="form-group col-md-6">
                                  <div class="form-check">
                                      <input type="checkbox" class="form-check-input" id="settings-require-all-documents" name="requireAllDocuments">
                                      <label class="form-check-label" for="settings-require-all-documents">طلب جميع المستندات إجباري</label>
                                  </div>
                              </div>
                          </div>
                      </form>
                  </div>
              </div>
              
              <div class="section">
                  <div class="section-header">
                      <h2 class="section-title">إعدادات القروض حسب نوع المقترض</h2>
                  </div>
                  <div class="tabs-container">
                      <div class="tabs-header">
                          <button class="tab-btn active" data-tab="kasb">كاسب</button>
                          <button class="tab-btn" data-tab="employee">موظف</button>
                          <button class="tab-btn" data-tab="military">عسكري</button>
                          <button class="tab-btn" data-tab="social">رعاية اجتماعية</button>
                      </div>
                      <div class="tabs-content">
                          <!-- إعدادات كاسب -->
                          <div class="tab-content active" data-tab="kasb">
                              <div class="form-row">
                                  <div class="form-group col-md-6">
                                      <label class="form-label">الحد الأقصى لمبلغ القرض</label>
                                      <div class="input-group">
                                          <input type="number" class="form-input" id="settings-kasb-max-amount" name="maxLoanAmount.kasb" min="1000000" step="1000000">
                                          <span class="input-addon currency-addon"></span>
                                      </div>
                                  </div>
                                  <div class="form-group col-md-6">
                                      <label class="form-label">نسبة الفائدة الافتراضية</label>
                                      <div class="input-group">
                                          <input type="number" class="form-input" id="settings-kasb-interest-rate" name="defaultInterestRate.kasb" min="0" max="20" step="0.5">
                                          <span class="input-addon">%</span>
                                      </div>
                                  </div>
                              </div>
                              <div class="form-row">
                                  <div class="form-group col-md-6">
                                      <label class="form-label">المدة الافتراضية للقرض (أشهر)</label>
                                      <input type="number" class="form-input" id="settings-kasb-period" name="defaultLoanPeriod.kasb" min="6" max="60" step="6">
                                  </div>
                                  <div class="form-group col-md-6">
                                      <label class="form-label">الحد الأدنى للراتب</label>
                                      <div class="input-group">
                                          <input type="number" class="form-input" id="settings-kasb-min-salary" name="minSalary.kasb" min="100000" step="50000">
                                          <span class="input-addon currency-addon"></span>
                                      </div>
                                  </div>
                              </div>
                              <div class="form-row">
                                  <div class="form-group col-md-6">
                                      <label class="form-label">نسبة القرض للراتب القصوى</label>
                                      <div class="input-group">
                                          <input type="number" class="form-input" id="settings-kasb-loan-salary-ratio" name="maxLoanToSalaryRatio.kasb" min="1" max="30" step="1">
                                          <span class="input-addon">x</span>
                                      </div>
                                      <small class="form-hint">القرض يمكن أن يكون هذا العدد مضروباً بالراتب</small>
                                  </div>
                                  <div class="form-group col-md-6">
                                      <div class="form-check mt-4">
                                          <input type="checkbox" class="form-check-input" id="settings-kasb-second-guarantor" name="requireSecondGuarantor.kasb">
                                          <label class="form-check-label" for="settings-kasb-second-guarantor">يتطلب كفيل ثاني إجباري</label>
                                      </div>
                                  </div>
                              </div>
                          </div>
                          
                          <!-- إعدادات موظف -->
                          <div class="tab-content" data-tab="employee">
                              <div class="form-row">
                                  <div class="form-group col-md-6">
                                      <label class="form-label">الحد الأقصى لمبلغ القرض</label>
                                      <div class="input-group">
                                          <input type="number" class="form-input" id="settings-employee-max-amount" name="maxLoanAmount.employee" min="1000000" step="1000000">
                                          <span class="input-addon currency-addon"></span>
                                      </div>
                                  </div>
                                  <div class="form-group col-md-6">
                                      <label class="form-label">نسبة الفائدة الافتراضية</label>
                                      <div class="input-group">
                                          <input type="number" class="form-input" id="settings-employee-interest-rate" name="defaultInterestRate.employee" min="0" max="20" step="0.5">
                                          <span class="input-addon">%</span>
                                      </div>
                                  </div>
                              </div>
                              <div class="form-row">
                                  <div class="form-group col-md-6">
                                      <label class="form-label">المدة الافتراضية للقرض (أشهر)</label>
                                      <input type="number" class="form-input" id="settings-employee-period" name="defaultLoanPeriod.employee" min="6" max="60" step="6">
                                  </div>
                                  <div class="form-group col-md-6">
                                      <label class="form-label">الحد الأدنى للراتب</label>
                                      <div class="input-group">
                                          <input type="number" class="form-input" id="settings-employee-min-salary" name="minSalary.employee" min="100000" step="50000">
                                          <span class="input-addon currency-addon"></span>
                                      </div>
                                  </div>
                              </div>
                              <div class="form-row">
                                  <div class="form-group col-md-6">
                                      <label class="form-label">نسبة القرض للراتب القصوى</label>
                                      <div class="input-group">
                                          <input type="number" class="form-input" id="settings-employee-loan-salary-ratio" name="maxLoanToSalaryRatio.employee" min="1" max="30" step="1">
                                          <span class="input-addon">x</span>
                                      </div>
                                      <small class="form-hint">القرض يمكن أن يكون هذا العدد مضروباً بالراتب</small>
                                  </div>
                                  <div class="form-group col-md-6">
                                      <div class="form-check mt-4">
                                          <input type="checkbox" class="form-check-input" id="settings-employee-second-guarantor" name="requireSecondGuarantor.employee">
                                          <label class="form-check-label" for="settings-employee-second-guarantor">يتطلب كفيل ثاني إجباري</label>
                                      </div>
                                  </div>
                              </div>
                          </div>
                          
                          <!-- إعدادات عسكري -->
                          <div class="tab-content" data-tab="military">
                              <div class="form-row">
                                  <div class="form-group col-md-6">
                                      <label class="form-label">الحد الأقصى لمبلغ القرض</label>
                                      <div class="input-group">
                                          <input type="number" class="form-input" id="settings-military-max-amount" name="maxLoanAmount.military" min="1000000" step="1000000">
                                          <span class="input-addon currency-addon"></span>
                                      </div>
                                  </div>
                                  <div class="form-group col-md-6">
                                      <label class="form-label">نسبة الفائدة الافتراضية</label>
                                      <div class="input-group">
                                          <input type="number" class="form-input" id="settings-military-interest-rate" name="defaultInterestRate.military" min="0" max="20" step="0.5">
                                          <span class="input-addon">%</span>
                                      </div>
                                  </div>
                              </div>
                              <div class="form-row">
                                  <div class="form-group col-md-6">
                                      <label class="form-label">المدة الافتراضية للقرض (أشهر)</label>
                                      <input type="number" class="form-input" id="settings-military-period" name="defaultLoanPeriod.military" min="6" max="60" step="6">
                                  </div>
                                  <div class="form-group col-md-6">
                                      <label class="form-label">الحد الأدنى للراتب</label>
                                      <div class="input-group">
                                          <input type="number" class="form-input" id="settings-military-min-salary" name="minSalary.military" min="100000" step="50000">
                                          <span class="input-addon currency-addon"></span>
                                      </div>
                                  </div>
                              </div>
                              <div class="form-row">
                                  <div class="form-group col-md-6">
                                      <label class="form-label">نسبة القرض للراتب القصوى</label>
                                      <div class="input-group">
                                          <input type="number" class="form-input" id="settings-military-loan-salary-ratio" name="maxLoanToSalaryRatio.military" min="1" max="30" step="1">
                                          <span class="input-addon">x</span>
                                      </div>
                                      <small class="form-hint">القرض يمكن أن يكون هذا العدد مضروباً بالراتب</small>
                                  </div>
                                  <div class="form-group col-md-6">
                                      <div class="form-check mt-4">
                                          <input type="checkbox" class="form-check-input" id="settings-military-second-guarantor" name="requireSecondGuarantor.military">
                                          <label class="form-check-label" for="settings-military-second-guarantor">يتطلب كفيل ثاني إجباري</label>
                                      </div>
                                  </div>
                              </div>
                          </div>
                          
                          <!-- إعدادات رعاية اجتماعية -->
                          <div class="tab-content" data-tab="social">
                              <div class="form-row">
                                  <div class="form-group col-md-6">
                                      <label class="form-label">الحد الأقصى لمبلغ القرض</label>
                                      <div class="input-group">
                                          <input type="number" class="form-input" id="settings-social-max-amount" name="maxLoanAmount.social" min="1000000" step="1000000">
                                          <span class="input-addon currency-addon"></span>
                                      </div>
                                  </div>
                                  <div class="form-group col-md-6">
                                      <label class="form-label">نسبة الفائدة الافتراضية</label>
                                      <div class="input-group">
                                          <input type="number" class="form-input" id="settings-social-interest-rate" name="defaultInterestRate.social" min="0" max="20" step="0.5">
                                          <span class="input-addon">%</span>
                                      </div>
                                  </div>
                              </div>
                              <div class="form-row">
                                  <div class="form-group col-md-6">
                                      <label class="form-label">المدة الافتراضية للقرض (أشهر)</label>
                                      <input type="number" class="form-input" id="settings-social-period" name="defaultLoanPeriod.social" min="6" max="60" step="6">
                                  </div>
                                  <div class="form-group col-md-6">
                                      <label class="form-label">الحد الأدنى للراتب</label>
                                      <div class="input-group">
                                          <input type="number" class="form-input" id="settings-social-min-salary" name="minSalary.social" min="100000" step="50000">
                                          <span class="input-addon currency-addon"></span>
                                      </div>
                                  </div>
                              </div>
                              <div class="form-row">
                                  <div class="form-group col-md-6">
                                      <label class="form-label">نسبة القرض للراتب القصوى</label>
                                      <div class="input-group">
                                          <input type="number" class="form-input" id="settings-social-loan-salary-ratio" name="maxLoanToSalaryRatio.social" min="1" max="30" step="1">
                                          <span class="input-addon">x</span>
                                      </div>
                                      <small class="form-hint">القرض يمكن أن يكون هذا العدد مضروباً بالراتب</small>
                                  </div>
                                  <div class="form-group col-md-6">
                                      <div class="form-check mt-4">
                                          <input type="checkbox" class="form-check-input" id="settings-social-second-guarantor" name="requireSecondGuarantor.social">
                                          <label class="form-check-label" for="settings-social-second-guarantor">يتطلب كفيل ثاني إجباري</label>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
              
              <div class="section">
                  <div class="section-header">
                      <h2 class="section-title">إعدادات Firebase (اختياري)</h2>
                  </div>
                  <div class="settings-form">
                      <div class="form-row">
                          <div class="form-group col-md-6">
                              <div class="form-check">
                                  <input type="checkbox" class="form-check-input" id="settings-use-firebase-db" name="useFirebaseDB">
                                  <label class="form-check-label" for="settings-use-firebase-db">استخدام قاعدة بيانات Firebase</label>
                              </div>
                          </div>
                          <div class="form-group col-md-6">
                              <div class="form-check">
                                  <input type="checkbox" class="form-check-input" id="settings-use-firebase-storage" name="useFirebaseStorage">
                                  <label class="form-check-label" for="settings-use-firebase-storage">استخدام Firebase Storage للملفات</label>
                              </div>
                          </div>
                      </div>
                      
                      <div id="firebase-config-section" class="mt-3">
                          <h3 class="subsection-title">إعدادات Firebase</h3>
                          <div class="form-row">
                              <div class="form-group col-md-6">
                                  <label class="form-label">API Key</label>
                                  <input type="text" class="form-input" id="settings-firebase-api-key" name="firebaseConfig.apiKey">
                              </div>
                              <div class="form-group col-md-6">
                                  <label class="form-label">Auth Domain</label>
                                  <input type="text" class="form-input" id="settings-firebase-auth-domain" name="firebaseConfig.authDomain">
                              </div>
                          </div>
                          <div class="form-row">
                              <div class="form-group col-md-6">
                                  <label class="form-label">Project ID</label>
                                  <input type="text" class="form-input" id="settings-firebase-project-id" name="firebaseConfig.projectId">
                              </div>
                              <div class="form-group col-md-6">
                                  <label class="form-label">Storage Bucket</label>
                                  <input type="text" class="form-input" id="settings-firebase-storage-bucket" name="firebaseConfig.storageBucket">
                              </div>
                          </div>
                          <div class="form-row">
                              <div class="form-group col-md-6">
                                  <label class="form-label">Messaging Sender ID</label>
                                  <input type="text" class="form-input" id="settings-firebase-messaging-sender-id" name="firebaseConfig.messagingSenderId">
                              </div>
                              <div class="form-group col-md-6">
                                  <label class="form-label">App ID</label>
                                  <input type="text" class="form-input" id="settings-firebase-app-id" name="firebaseConfig.appId">
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          `;
          
          // إضافة الصفحة إلى المحتوى الرئيسي
          const mainContent = document.querySelector('.main-content');
          if (mainContent) {
              mainContent.appendChild(loanSettingsPage);
              console.log('تم إنشاء صفحة إعدادات القروض بنجاح');
          } else {
              console.error('لم يتم العثور على المحتوى الرئيسي');
          }
      }
      
      /**
       * إنشاء النوافذ المنبثقة لنظام القروض
       */
      function createLoanModals() {
          // إنشاء نافذة تفاصيل القرض
          createLoanDetailsModal();
          
          // إنشاء نافذة الموافقة على القرض
          createApproveLoanModal();
          
          // إنشاء نافذة رفض القرض
          createRejectLoanModal();
          
          // إنشاء نافذة تفاصيل القرض الموافق عليه
          createApprovedLoanDetailsModal();
          
          // إنشاء نافذة تفاصيل القرض المرفوض
          createRejectedLoanDetailsModal();
          
          console.log('تم إنشاء النوافذ المنبثقة لنظام القروض بنجاح');
      }
      
      /**
       * إنشاء نافذة تفاصيل القرض
       */
      function createLoanDetailsModal() {
          // التحقق من وجود النافذة
          if (document.getElementById('loan-details-modal')) {
              console.log('نافذة تفاصيل القرض موجودة بالفعل');
              return;
          }
          
          // إنشاء نافذة تفاصيل القرض
          const modalOverlay = document.createElement('div');
          modalOverlay.className = 'modal-overlay';
          modalOverlay.id = 'loan-details-modal';
          
          modalOverlay.innerHTML = `
              <div class="modal animate__animated animate__fadeInUp modal-lg">
                  <div class="modal-header">
                      <h3 class="modal-title">تفاصيل طلب القرض</h3>
                      <button class="modal-close">×</button>
                  </div>
                  <div class="modal-body">
                      <div id="loan-details-content">
                          <!-- سيتم ملؤها ديناميكيًا -->
                      </div>
                  </div>
                  <div class="modal-footer">
                      <button class="btn btn-outline modal-close-btn">إغلاق</button>
                      <div class="btn-group">
                          <button class="btn btn-success" id="approve-loan-btn">
                              <i class="fas fa-check-circle"></i>
                              <span>الموافقة على الطلب</span>
                          </button>
                          <button class="btn btn-danger" id="reject-loan-btn">
                              <i class="fas fa-times-circle"></i>
                              <span>رفض الطلب</span>
                          </button>
                          <button class="btn btn-warning" id="print-loan-details-btn">
                              <i class="fas fa-print"></i>
                              <span>طباعة</span>
                          </button>
                      </div>
                  </div>
              </div>
          `;
          
          // إضافة النافذة إلى الصفحة
          document.body.appendChild(modalOverlay);
      }
      
      /**
       * إنشاء نافذة الموافقة على القرض
       */
      function createApproveLoanModal() {
          // التحقق من وجود النافذة
          if (document.getElementById('approve-loan-modal')) {
              console.log('نافذة الموافقة على القرض موجودة بالفعل');
              return;
          }
          
          // إنشاء نافذة الموافقة على القرض
          const modalOverlay = document.createElement('div');
          modalOverlay.className = 'modal-overlay';
          modalOverlay.id = 'approve-loan-modal';
          
          modalOverlay.innerHTML = `
              <div class="modal animate__animated animate__fadeInUp">
                  <div class="modal-header">
                      <h3 class="modal-title">الموافقة على طلب القرض</h3>
                      <button class="modal-close">×</button>
                  </div>
                  <div class="modal-body">
                      <form id="approve-loan-form">
                          <div class="form-group">
                              <label class="form-label">تفاصيل الموافقة</label>
                              <textarea class="form-input" id="approval-details" rows="3" placeholder="أدخل أي ملاحظات أو تفاصيل إضافية للموافقة"></textarea>
                          </div>
                          
                          <div class="form-group">
                              <label class="form-label">تاريخ الصرف</label>
                              <input type="date" class="form-input" id="disbursement-date" required>
                          </div>
                          
                          <div class="form-check mt-3">
                              <input type="checkbox" id="create-installment-plan" class="form-check-input" checked>
                              <label for="create-installment-plan" class="form-check-label">
                                  إنشاء خطة أقساط للقرض تلقائياً
                              </label>
                          </div>
                          
                          <div class="alert alert-info mt-3">
                              <i class="fas fa-info-circle"></i>
                              <span>بعد الموافقة، سيتم نقل القرض إلى قائمة القروض الموافق عليها وإنشاء خطة الأقساط الشهرية.</span>
                          </div>
                      </form>
                  </div>
                  <div class="modal-footer">
                      <button class="btn btn-outline modal-close-btn">إلغاء</button>
                      <button class="btn btn-success" id="confirm-approve-btn">
                          <i class="fas fa-check-circle"></i>
                          <span>تأكيد الموافقة</span>
                      </button>
                  </div>
              </div>
          `;
          
          // إضافة النافذة إلى الصفحة
          document.body.appendChild(modalOverlay);
      }
      
      /**
       * إنشاء نافذة رفض القرض
       */
      function createRejectLoanModal() {
          // التحقق من وجود النافذة
          if (document.getElementById('reject-loan-modal')) {
              console.log('نافذة رفض القرض موجودة بالفعل');
              return;
          }
          
          // إنشاء نافذة رفض القرض
          const modalOverlay = document.createElement('div');
          modalOverlay.className = 'modal-overlay';
          modalOverlay.id = 'reject-loan-modal';
          
          modalOverlay.innerHTML = `
              <div class="modal animate__animated animate__fadeInUp">
                  <div class="modal-header">
                      <h3 class="modal-title">رفض طلب القرض</h3>
                      <button class="modal-close">×</button>
                  </div>
                  <div class="modal-body">
                      <form id="reject-loan-form">
                          <div class="form-group">
                              <label class="form-label">سبب الرفض</label>
                              <select class="form-select" id="rejection-reason" required>
                                  <option value="">اختر سبب الرفض</option>
                                  <option value="insufficient-income">دخل غير كافٍ</option>
                                  <option value="incomplete-documents">نقص في المستندات</option>
                                  <option value="bad-credit-history">تاريخ ائتماني سيئ</option>
                                  <option value="guarantor-issues">مشاكل في الكفيل</option>
                                  <option value="exceeds-limits">تجاوز الحدود المسموح بها</option>
                                  <option value="other">أخرى</option>
                              </select>
                          </div>
                          
                          <div class="form-group">
                              <label class="form-label">تفاصيل الرفض</label>
                              <textarea class="form-input" id="rejection-details" rows="3" placeholder="اشرح سبب رفض الطلب بالتفصيل" required></textarea>
                          </div>
                          
                          <div class="form-check mt-3">
                              <input type="checkbox" id="notify-borrower" class="form-check-input" checked>
                              <label for="notify-borrower" class="form-check-label">
                                  إرسال إشعار للمقترض بسبب الرفض
                              </label>
                          </div>
                          
                          <div class="alert alert-warning mt-3">
                              <i class="fas fa-exclamation-triangle"></i>
                              <span>بعد الرفض، سيتم نقل القرض إلى قائمة القروض المرفوضة ولا يمكن استرجاعه.</span>
                          </div>
                      </form>
                  </div>
                  <div class="modal-footer">
                      <button class="btn btn-outline modal-close-btn">إلغاء</button>
                      <button class="btn btn-danger" id="confirm-reject-btn">
                          <i class="fas fa-times-circle"></i>
                          <span>تأكيد الرفض</span>
                      </button>
                  </div>
              </div>
          `;
          
          // إضافة النافذة إلى الصفحة
          document.body.appendChild(modalOverlay);
      }
      
      /**
       * إنشاء نافذة تفاصيل القرض الموافق عليه
       */
      function createApprovedLoanDetailsModal() {
          // التحقق من وجود النافذة
          if (document.getElementById('approved-loan-details-modal')) {
              console.log('نافذة تفاصيل القرض الموافق عليه موجودة بالفعل');
              return;
          }
          
          // إنشاء نافذة تفاصيل القرض الموافق عليه
          const modalOverlay = document.createElement('div');
          modalOverlay.className = 'modal-overlay';
          modalOverlay.id = 'approved-loan-details-modal';
          
          modalOverlay.innerHTML = `
              <div class="modal animate__animated animate__fadeInUp modal-lg">
                  <div class="modal-header">
                      <h3 class="modal-title">تفاصيل القرض الموافق عليه</h3>
                      <button class="modal-close">×</button>
                  </div>
                  <div class="modal-body">
                      <div id="approved-loan-details-content">
                          <!-- سيتم ملؤها ديناميكيًا -->
                      </div>
                      
                      <div class="installments-table-container mt-3">
                          <h3 class="section-title mt-4">جدول الأقساط</h3>
                          <div id="loan-installments-table">
                              <!-- سيتم ملؤها ديناميكيًا -->
                          </div>
                      </div>
                  </div>
                  <div class="modal-footer">
                      <button class="btn btn-outline modal-close-btn">إغلاق</button>
                      <div class="btn-group">
                          <button class="btn btn-warning" id="print-approved-loan-btn">
                              <i class="fas fa-print"></i>
                              <span>طباعة</span>
                          </button>
                          <button class="btn btn-info" id="view-installments-btn">
                              <i class="fas fa-list-ul"></i>
                              <span>عرض الأقساط</span>
                          </button>
                      </div>
                  </div>
              </div>
          `;
          
          // إضافة النافذة إلى الصفحة
          document.body.appendChild(modalOverlay);
      }
      
      /**
       * إنشاء نافذة تفاصيل القرض المرفوض
       */
      function createRejectedLoanDetailsModal() {
          // التحقق من وجود النافذة
          if (document.getElementById('rejected-loan-details-modal')) {
              console.log('نافذة تفاصيل القرض المرفوض موجودة بالفعل');
              return;
          }
          
          // إنشاء نافذة تفاصيل القرض المرفوض
          const modalOverlay = document.createElement('div');
          modalOverlay.className = 'modal-overlay';
          modalOverlay.id = 'rejected-loan-details-modal';
          
          modalOverlay.innerHTML = `
              <div class="modal animate__animated animate__fadeInUp modal-lg">
                  <div class="modal-header">
                      <h3 class="modal-title">تفاصيل القرض المرفوض</h3>
                      <button class="modal-close">×</button>
                  </div>
                  <div class="modal-body">
                      <div id="rejected-loan-details-content">
                          <!-- سيتم ملؤها ديناميكيًا -->
                      </div>
                      
                      <div class="rejection-details mt-4">
                          <h3 class="section-title">تفاصيل الرفض</h3>
                          <div class="card bg-light p-3 mt-2">
                              <div class="rejection-info">
                                  <div class="rejection-row">
                                      <div class="rejection-label">سبب الرفض:</div>
                                      <div class="rejection-value" id="rejection-reason-value"></div>
                                  </div>
                                  <div class="rejection-row">
                                      <div class="rejection-label">تاريخ الرفض:</div>
                                      <div class="rejection-value" id="rejection-date-value"></div>
                                  </div>
                                  <div class="rejection-row">
                                      <div class="rejection-label">تفاصيل:</div>
                                      <div class="rejection-value" id="rejection-details-value"></div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div class="modal-footer">
                      <button class="btn btn-outline modal-close-btn">إغلاق</button>
                      <button class="btn btn-warning" id="print-rejected-loan-btn">
                          <i class="fas fa-print"></i>
                          <span>طباعة</span>
                      </button>
                  </div>
              </div>
          `;
          
          // إضافة النافذة إلى الصفحة
          document.body.appendChild(modalOverlay);
      }
      
      /**
       * إضافة أنماط CSS لنظام القروض
       */
      function addLoanCustomStyles() {
          // التحقق من وجود عنصر الأنماط
          if (document.getElementById('loan-system-styles')) {
              console.log('أنماط CSS لنظام القروض موجودة بالفعل');
              return;
          }
          
          // إنشاء عنصر style جديد
          const styleElement = document.createElement('style');
          styleElement.id = 'loan-system-styles';
          
          // أنماط CSS المخصصة لنظام القروض
          styleElement.textContent = `
              /* أنماط عامة لنظام القروض */
              .loan-wizard {
                  background-color: white;
                  border-radius: 10px;
                  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
                  margin-bottom: 20px;
              }
              
              .loan-wizard-steps {
                  display: flex;
                  background-color: #f8fafc;
                  border-bottom: 1px solid #e2e8f0;
                  padding: 0;
                  border-radius: 10px 10px 0 0;
                  overflow: hidden;
              }
              
              .wizard-step {
                  flex: 1;
                  text-align: center;
                  padding: 15px 10px;
                  position: relative;
                  background-color: #f1f5f9;
                  transition: all 0.3s ease;
                  cursor: pointer;
              }
              
              .wizard-step:not(:last-child)::after {
                  content: '';
                  position: absolute;
                  top: 50%;
                  right: -10px;
                  transform: translateY(-50%);
                  width: 20px;
                  height: 20px;
                  background-color: inherit;
                  clip-path: polygon(0% 50%, 50% 0%, 100% 50%, 50% 100%);
                  z-index: 1;
              }
              
              .wizard-step.active {
                  background-color: #3b82f6;
                  color: white;
              }
              
              .wizard-step.completed {
                  background-color: #10b981;
                  color: white;
              }
              
              .step-number {
                  width: 30px;
                  height: 30px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin: 0 auto 8px;
                  border-radius: 50%;
                  background-color: white;
                  color: #64748b;
                  font-weight: bold;
                  transition: all 0.3s ease;
              }
              
              .wizard-step.active .step-number {
                  background-color: #eff6ff;
                  color: #3b82f6;
              }
              
              .wizard-step.completed .step-number {
                  background-color: #eff6ff;
                  color: #10b981;
              }
              
              .step-title {
                  font-size: 0.9rem;
                  font-weight: 500;
              }
              
              .loan-wizard-content {
                  padding: 0;
                  background-color: white;
                  border-radius: 0 0 10px 10px;
              }
              
              .wizard-content-step {
                  display: none;
                  padding: 20px;
              }
              
              .wizard-content-step.active {
                  display: block;
              }
              
              /* أنماط نموذج القرض */
              .loan-form .subsection-title {
                  font-size: 1.1rem;
                  font-weight: 600;
                  color: #334155;
                  margin: 20px 0 15px;
                  padding-bottom: 5px;
                  border-bottom: 1px solid #e2e8f0;
              }
              
              .form-actions {
                  display: flex;
                  justify-content: space-between;
                  padding: 20px 0 10px;
                  margin-top: 20px;
                  border-top: 1px solid #f1f5f9;
              }
              
              /* أنماط حقول تحميل الملفات */
              .file-upload-container {
                  width: 100%;
                  position: relative;
              }
              
              .file-input {
                  position: absolute;
                  width: 0.1px;
                  height: 0.1px;
                  opacity: 0;
                  overflow: hidden;
                  z-index: -1;
              }
              
              .file-label {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  width: 100%;
                  height: 120px;
                  padding: 15px;
                  background-color: #f8fafc;
                  border: 2px dashed #cbd5e1;
                  border-radius: 8px;
                  cursor: pointer;
                  transition: all 0.3s ease;
              }
              
              .file-label:hover {
                  background-color: #f1f5f9;
                  border-color: #94a3b8;
              }
              
              .file-label i {
                  font-size: 2rem;
                  margin-bottom: 10px;
                  color: #94a3b8;
              }
              
              .file-preview {
                  margin-top: 10px;
                  width: 100%;
                  height: 150px;
                  border-radius: 8px;
                  overflow: hidden;
                  position: relative;
                  display: none;
              }
              
              .file-preview img {
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                  object-position: center;
              }
              
              .file-preview.has-preview {
                  display: block;
              }
              
              .hidden-section {
                  display: none;
              }
              
              .add-another-section {
                  text-align: center;
                  margin: 20px 0;
                  padding: 15px;
                  background-color: #f8fafc;
                  border-radius: 8px;
                  border: 1px dashed #cbd5e1;
              }
              
              /* أنماط المراجعة */
              .review-container {
                  padding: 0;
              }
              
              .review-title {
                  font-size: 1.1rem;
                  font-weight: 600;
                  color: #334155;
                  margin: 20px 0 15px;
                  padding-bottom: 5px;
                  border-bottom: 1px solid #e2e8f0;
              }
              
              .review-section {
                  margin-bottom: 20px;
                  background-color: #f8fafc;
                  border-radius: 8px;
                  padding: 15px;
              }
              
              .review-row {
                  display: flex;
                  margin-bottom: 10px;
                  border-bottom: 1px dashed #e2e8f0;
                  padding-bottom: 10px;
              }
              
              .review-row:last-child {
                  margin-bottom: 0;
                  border-bottom: none;
                  padding-bottom: 0;
              }
              
              .review-label {
                  font-weight: 600;
                  width: 30%;
                  color: #475569;
              }
              
              .review-value {
                  width: 70%;
                  color: #1e293b;
              }
              
              .review-warning {
                  background-color: #fff7ed;
                  border-radius: 8px;
                  padding: 15px;
                  margin-top: 20px;
                  display: flex;
                  align-items: flex-start;
                  gap: 15px;
              }
              
              .review-warning i {
                  color: #f59e0b;
                  font-size: 1.5rem;
              }
              
              /* حاويات للتفاصيل والرفض */
              .rejection-info {
                  padding: 0;
              }
              
              .rejection-row {
                  display: flex;
                  margin-bottom: 10px;
                  padding-bottom: 10px;
                  border-bottom: 1px dashed #e2e8f0;
              }
              
              .rejection-row:last-child {
                  margin-bottom: 0;
                  border-bottom: none;
                  padding-bottom: 0;
              }
              
              .rejection-label {
                  font-weight: 600;
                  width: 30%;
                  color: #475569;
              }
              
              .rejection-value {
                  width: 70%;
                  color: #1e293b;
              }
              
              /* أنماط التبويبات في الإعدادات */
              .tabs-container {
                  border: 1px solid #e2e8f0;
                  border-radius: 8px;
                  overflow: hidden;
              }
              
              .tabs-header {
                  display: flex;
                  background-color: #f8fafc;
                  border-bottom: 1px solid #e2e8f0;
              }
              
              .tab-btn {
                  padding: 12px 20px;
                  background: none;
                  border: none;
                  border-bottom: 2px solid transparent;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  flex: 1;
                  text-align: center;
                  font-weight: 500;
              }
              
              .tab-btn:hover {
                  background-color: #f1f5f9;
              }
              
              .tab-btn.active {
                  border-bottom-color: #3b82f6;
                  color: #3b82f6;
                  background-color: white;
              }
              
              .tabs-content {
                  padding: 20px;
              }
              
              .tab-content {
                  display: none;
              }
              
              .tab-content.active {
                  display: block;
              }
              
              /* أنماط الرسم البياني */
              .chart-container {
                  height: 400px;
                  position: relative;
              }
              
              .chart-placeholder {
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  background-color: #f8fafc;
                  border-radius: 8px;
              }
              
              .chart-placeholder i {
                  font-size: 3rem;
                  color: #cbd5e1;
                  margin-bottom: 15px;
              }
              
              .chart-placeholder p {
                  color: #64748b;
                  text-align: center;
              }
          `;
          
          // إضافة أنماط CSS إلى رأس الصفحة
          document.head.appendChild(styleElement);
          console.log('تم إضافة أنماط CSS لنظام القروض بنجاح');
      }
      
      // ===========================
      // وظائف عرض البيانات
      // ===========================
      
      /**
       * عرض جدول القروض النشطة
       */
      function renderLoansTable() {
          console.log('عرض جدول القروض النشطة');
          
          const tableBody = document.querySelector('#loans-table tbody');
          const emptyPlaceholder = document.getElementById('loans-empty');
          
          if (!tableBody || !emptyPlaceholder) {
              console.error('لم يتم العثور على عناصر جدول القروض');
              return;
          }
          
          // تفريغ الجدول
          tableBody.innerHTML = '';
          
          // تطبيق البحث والتصفية
          const filteredLoans = filterLoans(loans, currentLoanFilter, loanSearchQuery);
          
          // إذا لم تكن هناك قروض، إظهار رسالة فارغة
          if (filteredLoans.length === 0) {
              tableBody.innerHTML = `<tr><td colspan="9" class="text-center">لا توجد قروض ${getLoanFilterName(currentLoanFilter)}</td></tr>`;
              
              // إظهار الشاشة الفارغة إذا لم تكن هناك قروض على الإطلاق
              if (loans.length === 0) {
                  emptyPlaceholder.style.display = 'flex';
              } else {
                  emptyPlaceholder.style.display = 'none';
              }
              
              // تحديث الترقيم
              updatePagination('loans-pagination', [], currentLoanPage, loansPerPage);
              
              return;
          }
          
          // إخفاء الشاشة الفارغة
          emptyPlaceholder.style.display = 'none';
          
          // ترتيب القروض حسب التاريخ (الأحدث أولاً)
          const sortedLoans = [...filteredLoans].sort((a, b) => {
              return new Date(b.createdAt) - new Date(a.createdAt);
          });
          
          // حساب تقسيم الصفحات
          const paginatedLoans = paginateItems(sortedLoans, currentLoanPage, loansPerPage);
          
          // عرض القروض في الجدول
          paginatedLoans.forEach(loan => {
              // تحديد حالة القرض
              const { statusClass, statusText } = getLoanStatus(loan);
              
              // إنشاء صف في الجدول
              const row = document.createElement('tr');
              row.setAttribute('data-id', loan.id);
              
              row.innerHTML = `
                  <td><span class="id-code">${loan.id.slice(-6)}</span></td>
                  <td>
                      <div class="borrower-info">
                          <div class="borrower-name">${loan.borrowerName}</div>
                          <div class="borrower-phone">${loan.borrowerPhone}</div>
                      </div>
                  </td>
                  <td>${getCategoryName(loan.borrowerCategory)}</td>
                  <td>${formatCurrency(loan.loanAmount)}</td>
                  <td>${loan.interestRate}%</td>
                  <td>${loan.loanPeriod} شهر</td>
                  <td>${formatDate(loan.createdAt)}</td>
                  <td><span class="badge badge-${statusClass}">${statusText}</span></td>
                  <td>
                      <div class="loan-actions">
                          <button class="loan-action-btn view-loan" data-id="${loan.id}" title="عرض التفاصيل">
                              <i class="fas fa-eye"></i>
                          </button>
                          <button class="loan-action-btn approve-loan" data-id="${loan.id}" title="الموافقة">
                              <i class="fas fa-check"></i>
                          </button>
                          <button class="loan-action-btn reject-loan" data-id="${loan.id}" title="رفض">
                              <i class="fas fa-times"></i>
                          </button>
                          <button class="loan-action-btn delete-loan" data-id="${loan.id}" title="حذف">
                              <i class="fas fa-trash"></i>
                          </button>
                      </div>
                  </td>
              `;
              
              tableBody.appendChild(row);
          });
          
          // إضافة مستمعي الأحداث للأزرار
          setupLoanTableActionButtons();
          
          // تحديث الترقيم
          updatePagination('loans-pagination', sortedLoans, currentLoanPage, loansPerPage);
      }
      
      /**
       * عرض جدول القروض الموافق عليها
       */
      function renderApprovedLoansTable() {
          console.log('عرض جدول القروض الموافق عليها');
          
          const tableBody = document.querySelector('#approved-loans-table tbody');
          const emptyPlaceholder = document.getElementById('approved-loans-empty');
          
          if (!tableBody || !emptyPlaceholder) {
              console.error('لم يتم العثور على عناصر جدول القروض الموافق عليها');
              return;
          }
          
          // تفريغ الجدول
          tableBody.innerHTML = '';
          
          // تطبيق البحث والتصفية
          const dateFilter = document.getElementById('approved-date-filter')?.value || 'all';
          const searchQuery = document.getElementById('approved-loans-search')?.value || '';
          const filteredLoans = filterLoansByDate(approvedLoans, dateFilter, searchQuery);
          
          // إذا لم تكن هناك قروض، إظهار رسالة فارغة
          if (filteredLoans.length === 0) {
              tableBody.innerHTML = `<tr><td colspan="9" class="text-center">لا توجد قروض موافق عليها</td></tr>`;
              
              // إظهار الشاشة الفارغة إذا لم تكن هناك قروض على الإطلاق
              if (approvedLoans.length === 0) {
                  emptyPlaceholder.style.display = 'flex';
              } else {
                  emptyPlaceholder.style.display = 'none';
              }
              
              // تحديث الترقيم
              updatePagination('approved-loans-pagination', [], 1, loansPerPage);
              
              // تحديث إحصائيات القروض الموافق عليها
              updateApprovedLoansStats(filteredLoans);
              
              return;
          }
          
          // إخفاء الشاشة الفارغة
          emptyPlaceholder.style.display = 'none';
          
          // ترتيب القروض حسب تاريخ الموافقة (الأحدث أولاً)
          const sortedLoans = [...filteredLoans].sort((a, b) => {
              return new Date(b.approvedAt) - new Date(a.approvedAt);
          });
          
          // حساب تقسيم الصفحات
          const paginatedLoans = paginateItems(sortedLoans, 1, loansPerPage);
          
          // عرض القروض في الجدول
          paginatedLoans.forEach(loan => {
              // إنشاء صف في الجدول
              const row = document.createElement('tr');
              row.setAttribute('data-id', loan.id);
              
              row.innerHTML = `
                  <td><span class="id-code">${loan.id.slice(-6)}</span></td>
                  <td>
                      <div class="borrower-info">
                          <div class="borrower-name">${loan.borrowerName}</div>
                          <div class="borrower-phone">${loan.borrowerPhone}</div>
                      </div>
                  </td>
                  <td>${getCategoryName(loan.borrowerCategory)}</td>
                  <td>${formatCurrency(loan.loanAmount)}</td>
                  <td>${loan.interestRate}%</td>
                  <td>${loan.loanPeriod} شهر</td>
                  <td>${formatDate(loan.approvedAt)}</td>
                  <td>${loan.installmentId ? `<a href="#" class="view-installment-link" data-id="${loan.installmentId}">${loan.installmentId.slice(-6)}</a>` : '-'}</td>
                  <td>
                      <div class="loan-actions">
                          <button class="loan-action-btn view-approved-loan" data-id="${loan.id}" title="عرض التفاصيل">
                              <i class="fas fa-eye"></i>
                          </button>
                          <button class="loan-action-btn print-approved-loan" data-id="${loan.id}" title="طباعة">
                              <i class="fas fa-print"></i>
                          </button>
                      </div>
                  </td>
              `;
              
              tableBody.appendChild(row);
          });
          
          // إضافة مستمعي الأحداث للأزرار
          setupApprovedLoansTableButtons();
          
          // تحديث الترقيم
          updatePagination('approved-loans-pagination', sortedLoans, 1, loansPerPage);
          
          // تحديث إحصائيات القروض الموافق عليها
          updateApprovedLoansStats(filteredLoans);
      }
      
      /**
       * عرض جدول القروض المرفوضة
       */
      function renderRejectedLoansTable() {
          console.log('عرض جدول القروض المرفوضة');
          
          const tableBody = document.querySelector('#rejected-loans-table tbody');
          const emptyPlaceholder = document.getElementById('rejected-loans-empty');
          
          if (!tableBody || !emptyPlaceholder) {
              console.error('لم يتم العثور على عناصر جدول القروض المرفوضة');
              return;
          }
          
          // تفريغ الجدول
          tableBody.innerHTML = '';
          
          // تطبيق البحث والتصفية
          const dateFilter = document.getElementById('rejected-date-filter')?.value || 'all';
          const searchQuery = document.getElementById('rejected-loans-search')?.value || '';
          const filteredLoans = filterLoansByDate(rejectedLoans, dateFilter, searchQuery);
          
          // إذا لم تكن هناك قروض، إظهار رسالة فارغة
          if (filteredLoans.length === 0) {
              tableBody.innerHTML = `<tr><td colspan="7" class="text-center">لا توجد قروض مرفوضة</td></tr>`;
              
              // إظهار الشاشة الفارغة إذا لم تكن هناك قروض على الإطلاق
              if (rejectedLoans.length === 0) {
                  emptyPlaceholder.style.display = 'flex';
              } else {
                  emptyPlaceholder.style.display = 'none';
              }
              
              // تحديث الترقيم
              updatePagination('rejected-loans-pagination', [], 1, loansPerPage);
              
              // تحديث الرسم البياني
              updateRejectionChart(filteredLoans);
              
              return;
          }
          
          // إخفاء الشاشة الفارغة
          emptyPlaceholder.style.display = 'none';
          
          // ترتيب القروض حسب تاريخ الرفض (الأحدث أولاً)
          const sortedLoans = [...filteredLoans].sort((a, b) => {
              return new Date(b.rejectedAt) - new Date(a.rejectedAt);
          });
          
          // حساب تقسيم الصفحات
          const paginatedLoans = paginateItems(sortedLoans, 1, loansPerPage);
          
          // عرض القروض في الجدول
          paginatedLoans.forEach(loan => {
              // إنشاء صف في الجدول
              const row = document.createElement('tr');
              row.setAttribute('data-id', loan.id);
              
              row.innerHTML = `
                  <td><span class="id-code">${loan.id.slice(-6)}</span></td>
                  <td>
                      <div class="borrower-info">
                          <div class="borrower-name">${loan.borrowerName}</div>
                          <div class="borrower-phone">${loan.borrowerPhone}</div>
                      </div>
                  </td>
                  <td>${getCategoryName(loan.borrowerCategory)}</td>
                  <td>${formatCurrency(loan.loanAmount)}</td>
                  <td>${getRejectionReasonText(loan.rejectionReason)}</td>
                  <td>${formatDate(loan.rejectedAt)}</td>
                  <td>
                      <div class="loan-actions">
                          <button class="loan-action-btn view-rejected-loan" data-id="${loan.id}" title="عرض التفاصيل">
                              <i class="fas fa-eye"></i>
                          </button>
                          <button class="loan-action-btn print-rejected-loan" data-id="${loan.id}" title="طباعة">
                              <i class="fas fa-print"></i>
                          </button>
                      </div>
                  </td>
              `;
              
              tableBody.appendChild(row);
          });
          
          // إضافة مستمعي الأحداث للأزرار
          setupRejectedLoansTableButtons();
          
          // تحديث الترقيم
          updatePagination('rejected-loans-pagination', sortedLoans, 1, loansPerPage);
          
          // تحديث الرسم البياني
          updateRejectionChart(filteredLoans);
      }
      
      /**
       * تحديث إحصائيات القروض الموافق عليها
       * @param {Array} filteredLoans - القروض المصفاة
       */
      function updateApprovedLoansStats(filteredLoans) {
          // حساب إجمالي عدد القروض
          const totalApprovedCount = filteredLoans.length;
          
          // حساب إجمالي مبالغ القروض
          const totalApprovedAmount = filteredLoans.reduce((sum, loan) => sum + loan.loanAmount, 0);
          
          // حساب نوع القرض الأكثر شيوعاً
          const categoryCounts = {};
          
          filteredLoans.forEach(loan => {
              if (categoryCounts[loan.borrowerCategory]) {
                  categoryCounts[loan.borrowerCategory]++;
              } else {
                  categoryCounts[loan.borrowerCategory] = 1;
              }
          });
          
          let mostCommonCategory = '';
          let highestCount = 0;
          
          for (const category in categoryCounts) {
              if (categoryCounts[category] > highestCount) {
                  highestCount = categoryCounts[category];
                  mostCommonCategory = category;
              }
          }
          
          // تحديث العناصر
          document.getElementById('total-approved-count').textContent = totalApprovedCount;
          document.getElementById('total-approved-amount').textContent = formatCurrency(totalApprovedAmount);
          document.getElementById('most-common-loan-type').textContent = mostCommonCategory ? getCategoryName(mostCommonCategory) : '-';
      }
      
      /**
       * تحديث الرسم البياني لأسباب رفض القروض
       * @param {Array} filteredLoans - القروض المصفاة
       */
      function updateRejectionChart(filteredLoans) {
          const chartContainer = document.getElementById('rejection-reasons-chart');
          if (!chartContainer) return;
          
          // حساب أسباب الرفض
          const reasonCounts = {};
          
          filteredLoans.forEach(loan => {
              if (reasonCounts[loan.rejectionReason]) {
                  reasonCounts[loan.rejectionReason]++;
              } else {
                  reasonCounts[loan.rejectionReason] = 1;
              }
          });
          
          // إذا لم تكن هناك قروض مرفوضة
          if (Object.keys(reasonCounts).length === 0) {
              chartContainer.innerHTML = `
                  <div class="chart-placeholder">
                      <i class="fas fa-chart-pie"></i>
                      <p>لا توجد بيانات كافية لعرض الرسم البياني</p>
                  </div>
              `;
              return;
          }
          
          // تحويل البيانات إلى تنسيق مناسب للرسم البياني
          const chartData = [];
          
          for (const reason in reasonCounts) {
              chartData.push({
                  reason: getRejectionReasonText(reason),
                  count: reasonCounts[reason]
              });
          }
          
          // إنشاء تمثيل بسيط للرسم البياني
          let chartHtml = `
              <div class="rejection-reasons-list">
                  <h4>أسباب الرفض (${filteredLoans.length} قرض):</h4>
                  <div class="rejection-bars">
          `;
          
          chartData.forEach(item => {
              const percentage = (item.count / filteredLoans.length * 100).toFixed(1);
              
              chartHtml += `
                  <div class="rejection-bar-item">
                      <div class="rejection-bar-label">${item.reason}</div>
                      <div class="rejection-bar-container">
                          <div class="rejection-bar" style="width: ${percentage}%;">${percentage}%</div>
                      </div>
                      <div class="rejection-bar-count">${item.count} قرض</div>
                  </div>
              `;
          });
          
          chartHtml += `
                  </div>
              </div>
          `;
          
          chartContainer.innerHTML = chartHtml;
      }
      
      /**
       * تحديث إحصائيات لوحة معلومات القروض
       */
      function updateLoanDashboardStats() {
          console.log('تحديث إحصائيات لوحة معلومات القروض');
          
          // إجمالي عدد القروض
          const totalLoansCount = loans.length + approvedLoans.length + rejectedLoans.length;
          
          // إجمالي المبالغ
          const totalLoansAmount = [...loans, ...approvedLoans].reduce((sum, loan) => sum + loan.loanAmount, 0);
          
          // عدد القروض بانتظار الموافقة
          const pendingLoansCount = loans.length;
          
          // معدل الموافقة
          const approvalRate = totalLoansCount > 0 
              ? ((approvedLoans.length / (approvedLoans.length + rejectedLoans.length)) * 100).toFixed(1)
              : 0;
          
          // تحديث العناصر
          document.getElementById('total-loans-count').textContent = totalLoansCount;
          document.getElementById('total-loans-amount').textContent = formatCurrency(totalLoansAmount);
          document.getElementById('pending-loans-count').textContent = pendingLoansCount;
          document.getElementById('approval-rate').textContent = `${approvalRate}%`;
          
          // تحديث معلومات النظام في صفحة الإعدادات
          updateSystemInfo();
      }
      
      /**
       * تحديث معلومات النظام في صفحة الإعدادات
       */
      function updateSystemInfo() {
          // تحديث معلومات النظام في صفحة إعدادات القروض
          const loanSettingsPage = document.getElementById('loan-settings-page');
          if (loanSettingsPage) {
              // يمكن إضافة عناصر العرض هنا
          }
      }
      
      /**
       * عرض تفاصيل القرض
       * @param {string} loanId - معرف القرض
       */
      function showLoanDetails(loanId) {
          console.log(`عرض تفاصيل القرض: ${loanId}`);
          
          // العثور على القرض
          const loan = loans.find(item => item.id === loanId);
          if (!loan) {
              showNotification('لم يتم العثور على القرض', 'error');
              return;
          }
          
          // تحديث محتوى النافذة
          const detailsContent = document.getElementById('loan-details-content');
          if (!detailsContent) return;
          
          // إعداد محتوى التفاصيل
          detailsContent.innerHTML = `
              <div class="loan-details-header">
                  <div class="loan-info-card">
                      <h3 class="loan-title">${loan.borrowerName} - ${getCategoryName(loan.borrowerCategory)}</h3>
                      <div class="loan-overview">
                          <div class="loan-amount-large">${formatCurrency(loan.loanAmount)}</div>
                          <div class="loan-terms">مدة القرض: ${loan.loanPeriod} شهر · الفائدة: ${loan.interestRate}%</div>
                      </div>
                  </div>
              </div>
              
              <div class="loan-details-tabs">
                  <div class="tabs-header">
                      <button class="loan-tab-btn active" data-tab="loan-basic-info">البيانات الأساسية</button>
                      <button class="loan-tab-btn" data-tab="borrower-details">معلومات المقترض</button>
                      <button class="loan-tab-btn" data-tab="guarantor-details">معلومات الكفلاء</button>
                      <button class="loan-tab-btn" data-tab="documents">المستندات</button>
                  </div>
                  <div class="tabs-content">
                      <!-- البيانات الأساسية -->
                      <div class="loan-tab-content active" id="loan-basic-info">
                          <div class="info-section">
                              <div class="info-row">
                                  <div class="info-label">رقم الطلب:</div>
                                  <div class="info-value">${loan.id}</div>
                              </div>
                              <div class="info-row">
                                  <div class="info-label">تاريخ الطلب:</div>
                                  <div class="info-value">${formatDate(loan.createdAt)}</div>
                              </div>
                              <div class="info-row">
                                  <div class="info-label">مبلغ القرض:</div>
                                  <div class="info-value">${formatCurrency(loan.loanAmount)}</div>
                              </div>
                              <div class="info-row">
                                  <div class="info-label">نسبة الفائدة:</div>
                                  <div class="info-value">${loan.interestRate}%</div>
                              </div>
                              <div class="info-row">
                                  <div class="info-label">مدة القرض:</div>
                                  <div class="info-value">${loan.loanPeriod} شهر</div>
                              </div>
                              <div class="info-row">
                                  <div class="info-label">القسط الشهري:</div>
                                  <div class="info-value">${formatCurrency(calculateMonthlyPayment(loan.loanAmount, loan.interestRate, loan.loanPeriod))}</div>
                              </div>
                              <div class="info-row">
                                  <div class="info-label">إجمالي المبلغ مع الفائدة:</div>
                                  <div class="info-value">${formatCurrency(loan.loanAmount + (loan.loanAmount * loan.interestRate / 100 * loan.loanPeriod / 12))}</div>
                              </div>
                          </div>
                      </div>
                      
                      <!-- معلومات المقترض -->
                      <div class="loan-tab-content" id="borrower-details">
                          <div class="info-section">
                              <div class="info-row">
                                  <div class="info-label">اسم المقترض:</div>
                                  <div class="info-value">${loan.borrowerName}</div>
                              </div>
                              <div class="info-row">
                                  <div class="info-label">رقم الهاتف:</div>
                                  <div class="info-value">${loan.borrowerPhone}</div>
                              </div>
                              <div class="info-row">
                                  <div class="info-label">رقم الهاتف البديل:</div>
                                  <div class="info-value">${loan.borrowerAltPhone || '-'}</div>
                              </div>
                              <div class="info-row">
                                  <div class="info-label">رقم البطاقة الشخصية:</div>
                                  <div class="info-value">${loan.borrowerIdNumber}</div>
                              </div>
                              <div class="info-row">
                                  <div class="info-label">العنوان:</div>
                                  <div class="info-value">${loan.borrowerAddress}</div>
                              </div>
                              <div class="info-row">
                                  <div class="info-label">مكان العمل:</div>
                                  <div class="info-value">${loan.borrowerWorkplace}</div>
                              </div>
                              <div class="info-row">
                                  <div class="info-label">عنوان العمل:</div>
                                  <div class="info-value">${loan.borrowerWorkAddress}</div>
                              </div>
                              <div class="info-row">
                                  <div class="info-label">الراتب الشهري:</div>
                                  <div class="info-value">${formatCurrency(loan.borrowerSalary)}</div>
                              </div>
                              <div class="info-row">
                                  <div class="info-label">مدة الخدمة:</div>
                                  <div class="info-value">${loan.borrowerServiceYears} سنة</div>
                              </div>
                          </div>
                      </div>
                      
                      <!-- معلومات الكفلاء -->
                      <div class="loan-tab-content" id="guarantor-details">
                          <div class="guarantor-details">
                              <h4 class="section-subtitle">الكفيل الأول</h4>
                              <div class="info-section">
                                  <div class="info-row">
                                      <div class="info-label">اسم الكفيل:</div>
                                      <div class="info-value">${loan.guarantorName}</div>
                                  </div>
                                  <div class="info-row">
                                      <div class="info-label">رقم الهاتف:</div>
                                      <div class="info-value">${loan.guarantorPhone}</div>
                                  </div>
                                  <div class="info-row">
                                      <div class="info-label">رقم الهاتف البديل:</div>
                                      <div class="info-value">${loan.guarantorAltPhone || '-'}</div>
                                  </div>
                                  <div class="info-row">
                                      <div class="info-label">العنوان:</div>
                                      <div class="info-value">${loan.guarantorAddress}</div>
                                  </div>
                                  <div class="info-row">
                                      <div class="info-label">مكان العمل:</div>
                                      <div class="info-value">${loan.guarantorWorkplace}</div>
                                  </div>
                                  <div class="info-row">
                                      <div class="info-label">الراتب الشهري:</div>
                                      <div class="info-value">${formatCurrency(loan.guarantorSalary)}</div>
                                  </div>
                              </div>
                              
                              ${loan.hasSecondGuarantor ? `
                              <h4 class="section-subtitle mt-4">الكفيل الثاني</h4>
                              <div class="info-section">
                                  <div class="info-row">
                                      <div class="info-label">اسم الكفيل:</div>
                                      <div class="info-value">${loan.guarantor2Name}</div>
                                  </div>
                                  <div class="info-row">
                                      <div class="info-label">رقم الهاتف:</div>
                                      <div class="info-value">${loan.guarantor2Phone}</div>
                                  </div>
                                  <div class="info-row">
                                      <div class="info-label">رقم الهاتف البديل:</div>
                                      <div class="info-value">${loan.guarantor2AltPhone || '-'}</div>
                                  </div>
                                  <div class="info-row">
                                      <div class="info-label">العنوان:</div>
                                      <div class="info-value">${loan.guarantor2Address}</div>
                                  </div>
                                  <div class="info-row">
                                      <div class="info-label">مكان العمل:</div>
                                      <div class="info-value">${loan.guarantor2Workplace}</div>
                                  </div>
                                  <div class="info-row">
                                      <div class="info-label">الراتب الشهري:</div>
                                      <div class="info-value">${formatCurrency(loan.guarantor2Salary)}</div>
                                  </div>
                              </div>
                              ` : ''}
                          </div>
                      </div>
                      
                      <!-- المستندات -->
                      <div class="loan-tab-content" id="documents">
                          <div class="documents-grid">
                              <h4 class="section-subtitle">مستندات المقترض</h4>
                              <div class="documents-container">
                                  ${renderDocumentThumbnail(loan.borrowerIdFront, 'البطاقة الموحدة (الوجه الأمامي)')}
                                  ${renderDocumentThumbnail(loan.borrowerIdBack, 'البطاقة الموحدة (الوجه الخلفي)')}
                                  ${renderDocumentThumbnail(loan.borrowerResidenceFront, 'بطاقة السكن (الوجه الأمامي)')}
                                  ${renderDocumentThumbnail(loan.borrowerResidenceBack, 'بطاقة السكن (الوجه الخلفي)')}
                                  ${renderDocumentThumbnail(loan.borrowerSalaryCertificate, 'تأييد بالراتب')}
                                  ${renderDocumentThumbnail(loan.borrowerWorkCertificate, 'تأييد استمرارية بالعمل')}
                              </div>
                              
                              <h4 class="section-subtitle mt-4">مستندات الكفيل الأول</h4>
                              <div class="documents-container">
                                  ${renderDocumentThumbnail(loan.guarantorIdFront, 'البطاقة الموحدة (الوجه الأمامي)')}
                                  ${renderDocumentThumbnail(loan.guarantorIdBack, 'البطاقة الموحدة (الوجه الخلفي)')}
                                  ${renderDocumentThumbnail(loan.guarantorResidenceFront, 'بطاقة السكن (الوجه الأمامي)')}
                                  ${renderDocumentThumbnail(loan.guarantorResidenceBack, 'بطاقة السكن (الوجه الخلفي)')}
                                  ${renderDocumentThumbnail(loan.guarantorSalaryCertificate, 'تأييد بالراتب')}
                                  ${renderDocumentThumbnail(loan.guarantorWorkCertificate, 'تأييد استمرارية بالعمل')}
                              </div>
                              
                              ${loan.hasSecondGuarantor ? `
                              <h4 class="section-subtitle mt-4">مستندات الكفيل الثاني</h4>
                              <div class="documents-container">${renderDocumentThumbnail(loan.guarantor2IdFront, 'البطاقة الموحدة (الوجه الأمامي)')}
                                  ${renderDocumentThumbnail(loan.guarantor2IdBack, 'البطاقة الموحدة (الوجه الخلفي)')}
                                  ${renderDocumentThumbnail(loan.guarantor2ResidenceFront, 'بطاقة السكن (الوجه الأمامي)')}
                                  ${renderDocumentThumbnail(loan.guarantor2ResidenceBack, 'بطاقة السكن (الوجه الخلفي)')}
                                  ${renderDocumentThumbnail(loan.guarantor2SalaryCertificate, 'تأييد بالراتب')}
                                  ${renderDocumentThumbnail(loan.guarantor2WorkCertificate, 'تأييد استمرارية بالعمل')}
                              </div>
                              ` : ''}
                          </div>
                      </div>
                  </div>
              </div>
          `;
          
          // إضافة مستمعي الأحداث لعلامات التبويب
          setTimeout(() => {
              setupLoanDetailsTabs();
          }, 100);
          
          // إعداد أزرار الإجراءات في النافذة
          setupLoanDetailsActionButtons(loan);
          
          // فتح النافذة
          openModal('loan-details-modal');
      }
      
      /**
       * إعداد مستمعي الأحداث لعلامات التبويب في نافذة تفاصيل القرض
       */
      function setupLoanDetailsTabs() {
          const tabButtons = document.querySelectorAll('.loan-tab-btn');
          const tabContents = document.querySelectorAll('.loan-tab-content');
          
          tabButtons.forEach(button => {
              button.addEventListener('click', function() {
                  // إزالة الكلاس النشط من جميع الأزرار والمحتويات
                  tabButtons.forEach(btn => btn.classList.remove('active'));
                  tabContents.forEach(content => content.classList.remove('active'));
                  
                  // إضافة الكلاس النشط للزر المحدد
                  this.classList.add('active');
                  
                  // إظهار المحتوى المناسب
                  const tabId = this.getAttribute('data-tab');
                  document.getElementById(tabId).classList.add('active');
              });
          });
      }
      
      /**
       * عرض مصغرات المستندات في نافذة التفاصيل
       * @param {string} documentUrl - عنوان URL للمستند
       * @param {string} title - عنوان المستند
       * @returns {string} - HTML للمصغرة
       */
      function renderDocumentThumbnail(documentUrl, title) {
          if (!documentUrl) {
              return `
                  <div class="document-thumbnail empty">
                      <div class="document-placeholder">
                          <i class="fas fa-file-alt"></i>
                          <span>لا يوجد مستند</span>
                      </div>
                      <div class="document-title">${title}</div>
                  </div>
              `;
          }
          
          // تحديد ما إذا كان المستند صورة أو PDF
          const isPdf = documentUrl.toLowerCase().endsWith('.pdf') || documentUrl.includes('application/pdf');
          
          return `
              <div class="document-thumbnail">
                  <div class="document-preview">
                      ${isPdf ? 
                          `<div class="pdf-preview"><i class="fas fa-file-pdf"></i></div>` : 
                          `<img src="${documentUrl}" alt="${title}" />`
                      }
                  </div>
                  <div class="document-title">${title}</div>
                  <div class="document-actions">
                      <a href="${documentUrl}" target="_blank" class="document-action">
                          <i class="fas fa-external-link-alt"></i>
                      </a>
                  </div>
              </div>
          `;
      }
      
      /**
       * إعداد أزرار الإجراءات في نافذة تفاصيل القرض
       * @param {Object} loan - كائن القرض
       */
      function setupLoanDetailsActionButtons(loan) {
          // زر الموافقة على القرض
          const approveBtn = document.getElementById('approve-loan-btn');
          if (approveBtn) {
              approveBtn.addEventListener('click', function() {
                  closeModal('loan-details-modal');
                  openApproveLoanModal(loan.id);
              });
          }
          
          // زر رفض القرض
          const rejectBtn = document.getElementById('reject-loan-btn');
          if (rejectBtn) {
              rejectBtn.addEventListener('click', function() {
                  closeModal('loan-details-modal');
                  openRejectLoanModal(loan.id);
              });
          }
          
          // زر طباعة تفاصيل القرض
          const printBtn = document.getElementById('print-loan-details-btn');
          if (printBtn) {
              printBtn.addEventListener('click', function() {
                  printLoanDetails(loan.id);
              });
          }
      }
      
      /**
       * عرض تفاصيل القرض الموافق عليه
       * @param {string} loanId - معرف القرض
       */
      function showApprovedLoanDetails(loanId) {
          console.log(`عرض تفاصيل القرض الموافق عليه: ${loanId}`);
          
          // العثور على القرض
          const loan = approvedLoans.find(item => item.id === loanId);
          if (!loan) {
              showNotification('لم يتم العثور على القرض', 'error');
              return;
          }
          
          // تحديث محتوى النافذة
          const detailsContent = document.getElementById('approved-loan-details-content');
          if (!detailsContent) return;
          
          // محتوى تفاصيل القرض الموافق عليه
          detailsContent.innerHTML = `
              <div class="approved-loan-header">
                  <div class="approved-badge">
                      <i class="fas fa-check-circle"></i>
                      <span>تمت الموافقة</span>
                  </div>
                  <h3 class="loan-title">${loan.borrowerName} - ${getCategoryName(loan.borrowerCategory)}</h3>
              </div>
              
              <div class="info-section">
                  <div class="info-row">
                      <div class="info-label">رقم الطلب:</div>
                      <div class="info-value">${loan.id}</div>
                  </div>
                  <div class="info-row">
                      <div class="info-label">تاريخ الطلب:</div>
                      <div class="info-value">${formatDate(loan.createdAt)}</div>
                  </div>
                  <div class="info-row">
                      <div class="info-label">تاريخ الموافقة:</div>
                      <div class="info-value">${formatDate(loan.approvedAt)}</div>
                  </div>
                  <div class="info-row">
                      <div class="info-label">تاريخ الصرف:</div>
                      <div class="info-value">${formatDate(loan.disbursementDate)}</div>
                  </div>
                  <div class="info-row">
                      <div class="info-label">مبلغ القرض:</div>
                      <div class="info-value">${formatCurrency(loan.loanAmount)}</div>
                  </div>
                  <div class="info-row">
                      <div class="info-label">نسبة الفائدة:</div>
                      <div class="info-value">${loan.interestRate}%</div>
                  </div>
                  <div class="info-row">
                      <div class="info-label">مدة القرض:</div>
                      <div class="info-value">${loan.loanPeriod} شهر</div>
                  </div>
                  <div class="info-row">
                      <div class="info-label">القسط الشهري:</div>
                      <div class="info-value">${formatCurrency(calculateMonthlyPayment(loan.loanAmount, loan.interestRate, loan.loanPeriod))}</div>
                  </div>
                  <div class="info-row">
                      <div class="info-label">إجمالي المبلغ مع الفائدة:</div>
                      <div class="info-value">${formatCurrency(loan.loanAmount + (loan.loanAmount * loan.interestRate / 100 * loan.loanPeriod / 12))}</div>
                  </div>
                  <div class="info-row">
                      <div class="info-label">رقم الأقساط المرتبط:</div>
                      <div class="info-value">${loan.installmentId ? loan.installmentId : 'غير مرتبط'}</div>
                  </div>
                  
                  <div class="approval-details">
                      <h4 class="section-subtitle">تفاصيل الموافقة</h4>
                      <div class="approval-notes">${loan.approvalDetails || 'لا توجد ملاحظات إضافية'}</div>
                  </div>
              </div>
          `;
          
          // عرض جدول الأقساط إذا كان مرتبطاً
          const installmentsTableContainer = document.getElementById('loan-installments-table');
          if (installmentsTableContainer && loan.installmentId) {
              renderLoanInstallmentsTable(loan.installmentId, installmentsTableContainer);
          } else if (installmentsTableContainer) {
              installmentsTableContainer.innerHTML = `
                  <div class="alert alert-info">
                      <i class="fas fa-info-circle"></i>
                      <span>لم يتم إنشاء جدول أقساط لهذا القرض بعد.</span>
                  </div>
              `;
          }
          
          // إعداد أزرار الإجراءات
          setupApprovedLoanDetailsButtons(loan);
          
          // فتح النافذة
          openModal('approved-loan-details-modal');
      }
      
      /**
       * عرض جدول الأقساط المرتبط بالقرض
       * @param {string} installmentId - معرف الأقساط
       * @param {HTMLElement} container - حاوية عرض الجدول
       */
      function renderLoanInstallmentsTable(installmentId, container) {
          // التحقق من وجود نظام الأقساط
          if (typeof window.InstallmentSystem === 'undefined' || !window.InstallmentSystem.getCurrentFilter) {
              container.innerHTML = `
                  <div class="alert alert-warning">
                      <i class="fas fa-exclamation-triangle"></i>
                      <span>نظام الأقساط غير متوفر حالياً.</span>
                  </div>
              `;
              return;
          }
          
          // الحصول على بيانات الأقساط
          const allInstallments = window.installments || [];
          const installment = allInstallments.find(inst => inst.id === installmentId);
          
          if (!installment) {
              container.innerHTML = `
                  <div class="alert alert-warning">
                      <i class="fas fa-exclamation-triangle"></i>
                      <span>لم يتم العثور على بيانات الأقساط المرتبطة برقم: ${installmentId}</span>
                  </div>
                  <button class="btn btn-primary mt-2" id="view-in-installments-btn">
                      <i class="fas fa-external-link-alt"></i>
                      <span>عرض في نظام الأقساط</span>
                  </button>
              `;
              
              // إضافة مستمع حدث لزر العرض في نظام الأقساط
              setTimeout(() => {
                  const viewInInstallmentsBtn = document.getElementById('view-in-installments-btn');
                  if (viewInInstallmentsBtn) {
                      viewInInstallmentsBtn.addEventListener('click', function() {
                          closeModal('approved-loan-details-modal');
                          // الانتقال إلى صفحة الأقساط وعرض تفاصيل القسط المحدد
                          if (typeof window.openInstallmentDetails === 'function') {
                              setActivePage('installments');
                              setTimeout(() => {
                                  window.openInstallmentDetails(installmentId);
                              }, 300);
                          }
                      });
                  }
              }, 100);
              
              return;
          }
          
          // إنشاء جدول الأقساط
          let tableHtml = `
              <div class="installment-summary">
                  <div class="summary-row">
                      <div class="summary-item">
                          <div class="summary-label">المبلغ الإجمالي</div>
                          <div class="summary-value">${formatCurrency(installment.totalAmount)}</div>
                      </div>
                      <div class="summary-item">
                          <div class="summary-label">المبلغ المدفوع</div>
                          <div class="summary-value">${formatCurrency(installment.paidAmount)}</div>
                      </div>
                      <div class="summary-item">
                          <div class="summary-label">المبلغ المتبقي</div>
                          <div class="summary-value">${formatCurrency(installment.remainingAmount)}</div>
                      </div>
                  </div>
              </div>
              
              <div class="progress mt-2 mb-3">
                  <div class="progress-bar" style="width: ${Math.round((installment.paidAmount / installment.totalAmount) * 100)}%">
                      ${Math.round((installment.paidAmount / installment.totalAmount) * 100)}%
                  </div>
              </div>
              
              <div class="table-responsive">
                  <table class="mini-table installments-table">
                      <thead>
                          <tr>
                              <th>رقم القسط</th>
                              <th>تاريخ الاستحقاق</th>
                              <th>المبلغ</th>
                              <th>الحالة</th>
                              <th>تاريخ التسديد</th>
                          </tr>
                      </thead>
                      <tbody>
          `;
          
          installment.monthlyInstallments.forEach(monthly => {
              const isPaid = monthly.isPaid;
              const dueDate = new Date(monthly.dueDate);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isOverdue = !isPaid && dueDate < today;
              const isToday = !isPaid && dueDate.toDateString() === today.toDateString();
              
              let statusClass = isPaid ? 'success' : 'primary';
              let statusText = isPaid ? 'مدفوع' : 'مستحق';
              
              if (isOverdue) {
                  statusClass = 'danger';
                  statusText = 'متأخر';
              } else if (isToday) {
                  statusClass = 'warning';
                  statusText = 'اليوم';
              }
              
              const rowClass = isOverdue ? 'bg-light-danger' : (isPaid ? 'bg-light-success' : (isToday ? 'bg-light-warning' : ''));
              
              tableHtml += `
                  <tr class="${rowClass}">
                      <td>${monthly.installmentNumber}</td>
                      <td>${formatDate(monthly.dueDate)}</td>
                      <td>${formatCurrency(monthly.amount)}</td>
                      <td><span class="badge badge-${statusClass}">${statusText}</span></td>
                      <td>${isPaid ? formatDate(monthly.paidDate) : '-'}</td>
                  </tr>
              `;
          });
          
          tableHtml += `
                      </tbody>
                  </table>
              </div>
              
              <div class="text-center mt-3">
                  <button class="btn btn-primary" id="view-in-installments-btn">
                      <i class="fas fa-external-link-alt"></i>
                      <span>عرض في نظام الأقساط</span>
                  </button>
              </div>
          `;
          
          container.innerHTML = tableHtml;
          
          // إضافة مستمع حدث لزر العرض في نظام الأقساط
          setTimeout(() => {
              const viewInInstallmentsBtn = document.getElementById('view-in-installments-btn');
              if (viewInInstallmentsBtn) {
                  viewInInstallmentsBtn.addEventListener('click', function() {
                      closeModal('approved-loan-details-modal');
                      // الانتقال إلى صفحة الأقساط وعرض تفاصيل القسط المحدد
                      if (typeof window.openInstallmentDetails === 'function') {
                          setActivePage('installments');
                          setTimeout(() => {
                              window.openInstallmentDetails(installmentId);
                          }, 300);
                      }
                  });
              }
          }, 100);
      }
      
      /**
       * إعداد أزرار تفاصيل القرض الموافق عليه
       * @param {Object} loan - كائن القرض
       */
      function setupApprovedLoanDetailsButtons(loan) {
          // زر طباعة تفاصيل القرض
          const printBtn = document.getElementById('print-approved-loan-btn');
          if (printBtn) {
              printBtn.addEventListener('click', function() {
                  printApprovedLoanDetails(loan.id);
              });
          }
          
          // زر عرض الأقساط
          const viewInstallmentsBtn = document.getElementById('view-installments-btn');
          if (viewInstallmentsBtn) {
              viewInstallmentsBtn.addEventListener('click', function() {
                  closeModal('approved-loan-details-modal');
                  
                  // الانتقال إلى صفحة الأقساط وعرض تفاصيل القسط المحدد
                  if (loan.installmentId && typeof window.openInstallmentDetails === 'function') {
                      setActivePage('installments');
                      setTimeout(() => {
                          window.openInstallmentDetails(loan.installmentId);
                      }, 300);
                  } else {
                      showNotification('لا يوجد قسط مرتبط بهذا القرض', 'warning');
                  }
              });
          }
      }
      
      /**
       * عرض تفاصيل القرض المرفوض
       * @param {string} loanId - معرف القرض
       */
      function showRejectedLoanDetails(loanId) {
          console.log(`عرض تفاصيل القرض المرفوض: ${loanId}`);
          
          // العثور على القرض
          const loan = rejectedLoans.find(item => item.id === loanId);
          if (!loan) {
              showNotification('لم يتم العثور على القرض', 'error');
              return;
          }
          
          // تحديث محتوى النافذة
          const detailsContent = document.getElementById('rejected-loan-details-content');
          const rejectionReasonValue = document.getElementById('rejection-reason-value');
          const rejectionDateValue = document.getElementById('rejection-date-value');
          const rejectionDetailsValue = document.getElementById('rejection-details-value');
          
          if (!detailsContent || !rejectionReasonValue || !rejectionDateValue || !rejectionDetailsValue) return;
          
          // محتوى تفاصيل القرض المرفوض
          detailsContent.innerHTML = `
              <div class="rejected-loan-header">
                  <div class="rejected-badge">
                      <i class="fas fa-times-circle"></i>
                      <span>تم الرفض</span>
                  </div>
                  <h3 class="loan-title">${loan.borrowerName} - ${getCategoryName(loan.borrowerCategory)}</h3>
              </div>
              
              <div class="info-section">
                  <div class="info-row">
                      <div class="info-label">رقم الطلب:</div>
                      <div class="info-value">${loan.id}</div>
                  </div>
                  <div class="info-row">
                      <div class="info-label">تاريخ الطلب:</div>
                      <div class="info-value">${formatDate(loan.createdAt)}</div>
                  </div>
                  <div class="info-row">
                      <div class="info-label">مبلغ القرض:</div>
                      <div class="info-value">${formatCurrency(loan.loanAmount)}</div>
                  </div>
                  <div class="info-row">
                      <div class="info-label">نسبة الفائدة:</div>
                      <div class="info-value">${loan.interestRate}%</div>
                  </div>
                  <div class="info-row">
                      <div class="info-label">مدة القرض:</div>
                      <div class="info-value">${loan.loanPeriod} شهر</div>
                  </div>
              </div>
              
              <div class="borrower-section mt-3">
                  <h4 class="section-subtitle">معلومات المقترض</h4>
                  <div class="info-section">
                      <div class="info-row">
                          <div class="info-label">اسم المقترض:</div>
                          <div class="info-value">${loan.borrowerName}</div>
                      </div>
                      <div class="info-row">
                          <div class="info-label">رقم الهاتف:</div>
                          <div class="info-value">${loan.borrowerPhone}</div>
                      </div>
                      <div class="info-row">
                          <div class="info-label">رقم البطاقة الشخصية:</div>
                          <div class="info-value">${loan.borrowerIdNumber}</div>
                      </div>
                      <div class="info-row">
                          <div class="info-label">العنوان:</div>
                          <div class="info-value">${loan.borrowerAddress}</div>
                      </div>
                      <div class="info-row">
                          <div class="info-label">الراتب الشهري:</div>
                          <div class="info-value">${formatCurrency(loan.borrowerSalary)}</div>
                      </div>
                  </div>
              </div>
          `;
          
          // تفاصيل الرفض
          rejectionReasonValue.textContent = getRejectionReasonText(loan.rejectionReason);
          rejectionDateValue.textContent = formatDate(loan.rejectedAt);
          rejectionDetailsValue.textContent = loan.rejectionDetails || 'لا توجد تفاصيل إضافية';
          
          // إعداد أزرار الإجراءات
          const printBtn = document.getElementById('print-rejected-loan-btn');
          if (printBtn) {
              printBtn.addEventListener('click', function() {
                  printRejectedLoanDetails(loan.id);
              });
          }
          
          // فتح النافذة
          openModal('rejected-loan-details-modal');
      }
      
      /**
       * عرض نافذة الموافقة على القرض
       * @param {string} loanId - معرف القرض
       */
      function openApproveLoanModal(loanId) {
          // العثور على القرض
          const loan = loans.find(item => item.id === loanId);
          if (!loan) {
              showNotification('لم يتم العثور على القرض', 'error');
              return;
          }
          
          // تعيين تاريخ الصرف الافتراضي (اليوم)
          const disbursementDateInput = document.getElementById('disbursement-date');
          if (disbursementDateInput) {
              disbursementDateInput.value = new Date().toISOString().split('T')[0];
          }
          
          // إعداد زر تأكيد الموافقة
          const confirmBtn = document.getElementById('confirm-approve-btn');
          if (confirmBtn) {
              // إزالة مستمعي الأحداث السابقة
              const newConfirmBtn = confirmBtn.cloneNode(true);
              confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
              
              // إضافة مستمع الحدث الجديد
              newConfirmBtn.addEventListener('click', function() {
                  approveSelectedLoan(loanId);
              });
          }
          
          // فتح النافذة
          openModal('approve-loan-modal');
      }
      
      /**
       * عرض نافذة رفض القرض
       * @param {string} loanId - معرف القرض
       */
      function openRejectLoanModal(loanId) {
          // العثور على القرض
          const loan = loans.find(item => item.id === loanId);
          if (!loan) {
              showNotification('لم يتم العثور على القرض', 'error');
              return;
          }
          
          // إعداد زر تأكيد الرفض
          const confirmBtn = document.getElementById('confirm-reject-btn');
          if (confirmBtn) {
              // إزالة مستمعي الأحداث السابقة
              const newConfirmBtn = confirmBtn.cloneNode(true);
              confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
              
              // إضافة مستمع الحدث الجديد
              newConfirmBtn.addEventListener('click', function() {
                  rejectSelectedLoan(loanId);
              });
          }
          
          // فتح النافذة
          openModal('reject-loan-modal');
      }
      
      /**
       * الموافقة على القرض المحدد
       * @param {string} loanId - معرف القرض
       */
      function approveSelectedLoan(loanId) {
          // التحقق من البيانات
          const approvalDetails = document.getElementById('approval-details').value;
          const disbursementDate = document.getElementById('disbursement-date').value;
          const createInstallmentPlan = document.getElementById('create-installment-plan').checked;
          
          if (!disbursementDate) {
              showNotification('يرجى تحديد تاريخ الصرف', 'error');
              return;
          }
          
          // بيانات الموافقة
          const approvalData = {
              approvalDetails,
              disbursementDate,
              createInstallmentPlan
          };
          
          // الموافقة على القرض
          const success = approveLoan(loanId, approvalData);
          
          if (success) {
              // إغلاق النافذة
              closeModal('approve-loan-modal');
              
              // عرض إشعار النجاح
              showNotification('تمت الموافقة على القرض بنجاح', 'success');
          }
      }
      
      /**
       * رفض القرض المحدد
       * @param {string} loanId - معرف القرض
       */
      function rejectSelectedLoan(loanId) {
          // التحقق من البيانات
          const rejectionReason = document.getElementById('rejection-reason').value;
          const rejectionDetails = document.getElementById('rejection-details').value;
          const notifyBorrower = document.getElementById('notify-borrower').checked;
          
          if (!rejectionReason || !rejectionDetails) {
              showNotification('يرجى تحديد سبب الرفض وإدخال التفاصيل', 'error');
              return;
          }
          
          // بيانات الرفض
          const rejectionData = {
              rejectionReason,
              rejectionDetails,
              notifyBorrower
          };
          
          // رفض القرض
          const success = rejectLoan(loanId, rejectionData);
          
          if (success) {
              // إغلاق النافذة
              closeModal('reject-loan-modal');
              
              // عرض إشعار النجاح
              showNotification('تم رفض القرض بنجاح', 'success');
          }
      }
      
      /**
       * طباعة تفاصيل القرض
       * @param {string} loanId - معرف القرض
       */
      function printLoanDetails(loanId) {
          // العثور على القرض
          const loan = loans.find(item => item.id === loanId);
          if (!loan) {
              showNotification('لم يتم العثور على القرض', 'error');
              return;
          }
          
          // إنشاء نافذة الطباعة
          const printWindow = window.open('', '_blank');
          if (!printWindow) {
              showNotification('لم يتم السماح بفتح نافذة الطباعة', 'error');
              return;
          }
          
          // إعداد محتوى الطباعة
          const printContent = `
              <!DOCTYPE html>
              <html dir="rtl">
              <head>
                  <meta charset="UTF-8">
                  <title>تفاصيل طلب القرض - ${loan.id}</title>
                  <style>
                      body {
                          font-family: Arial, sans-serif;
                          line-height: 1.6;
                          color: #333;
                          direction: rtl;
                      }
                      .container {
                          max-width: 800px;
                          margin: 0 auto;
                          padding: 20px;
                      }
                      .header {
                          text-align: center;
                          margin-bottom: 20px;
                          padding-bottom: 10px;
                          border-bottom: 2px solid #3b82f6;
                      }
                      .title {
                          font-size: 24px;
                          color: #1e293b;
                          margin: 0 0 10px;
                      }
                      .subtitle {
                          font-size: 16px;
                          color: #64748b;
                          margin: 0;
                      }
                      .section {
                          margin-bottom: 20px;
                      }
                      .section-title {
                          font-size: 18px;
                          color: #1e293b;
                          margin: 0 0 10px;
                          padding-bottom: 5px;
                          border-bottom: 1px solid #e2e8f0;
                      }
                      .info-table {
                          width: 100%;
                          border-collapse: collapse;
                          margin-bottom: 20px;
                      }
                      .info-table th, .info-table td {
                          padding: 10px;
                          border: 1px solid #e2e8f0;
                          text-align: right;
                      }
                      .info-table th {
                          background-color: #f8fafc;
                          font-weight: bold;
                          width: 35%;
                      }
                      .footer {
                          margin-top: 30px;
                          text-align: center;
                          font-size: 12px;
                          color: #64748b;
                          padding-top: 10px;
                          border-top: 1px solid #e2e8f0;
                      }
                      .status {
                          display: inline-block;
                          padding: 5px 10px;
                          border-radius: 4px;
                          font-size: 14px;
                          font-weight: bold;
                          color: white;
                          margin-bottom: 10px;
                      }
                      .status-pending {
                          background-color: #3b82f6;
                      }
                      @media print {
                          body {
                              font-size: 12px;
                          }
                          .title {
                              font-size: 18px;
                          }
                          .section-title {
                              font-size: 14px;
                          }
                          .no-print {
                              display: none;
                          }
                      }
                  </style>
              </head>
              <body>
                  <div class="container">
                      <div class="header">
                          <h1 class="title">تفاصيل طلب القرض</h1>
                          <p class="subtitle">رقم الطلب: ${loan.id} | تاريخ الطلب: ${formatDate(loan.createdAt)}</p>
                      </div>
                      
                      <div class="status status-pending">قيد المراجعة</div>
                      
                      <div class="section">
                          <h2 class="section-title">معلومات القرض</h2>
                          <table class="info-table">
                              <tr>
                                  <th>اسم المقترض</th>
                                  <td>${loan.borrowerName}</td>
                              </tr>
                              <tr>
                                  <th>نوع القرض</th>
                                  <td>${getCategoryName(loan.borrowerCategory)}</td>
                              </tr>
                              <tr>
                                  <th>مبلغ القرض</th>
                                  <td>${formatCurrency(loan.loanAmount)}</td>
                              </tr>
                              <tr>
                                  <th>نسبة الفائدة</th>
                                  <td>${loan.interestRate}%</td>
                              </tr>
                              <tr>
                                  <th>مدة القرض</th>
                                  <td>${loan.loanPeriod} شهر</td>
                              </tr>
                              <tr>
                                  <th>القسط الشهري</th>
                                  <td>${formatCurrency(calculateMonthlyPayment(loan.loanAmount, loan.interestRate, loan.loanPeriod))}</td>
                              </tr>
                              <tr>
                                  <th>إجمالي المبلغ مع الفائدة</th>
                                  <td>${formatCurrency(loan.loanAmount + (loan.loanAmount * loan.interestRate / 100 * loan.loanPeriod / 12))}</td>
                              </tr>
                          </table>
                      </div>
                      
                      <div class="section">
                          <h2 class="section-title">معلومات المقترض</h2>
                          <table class="info-table">
                              <tr>
                                  <th>رقم الهاتف</th>
                                  <td>${loan.borrowerPhone}${loan.borrowerAltPhone ? ` / ${loan.borrowerAltPhone}` : ''}</td>
                              </tr>
                              <tr>
                                  <th>رقم البطاقة الشخصية</th>
                                  <td>${loan.borrowerIdNumber}</td>
                              </tr>
                              <tr>
                                  <th>العنوان</th>
                                  <td>${loan.borrowerAddress}</td>
                              </tr>
                              <tr>
                                  <th>مكان العمل</th>
                                  <td>${loan.borrowerWorkplace}</td>
                              </tr>
                              <tr>
                                  <th>عنوان العمل</th>
                                  <td>${loan.borrowerWorkAddress}</td>
                              </tr>
                              <tr>
                                  <th>الراتب الشهري</th>
                                  <td>${formatCurrency(loan.borrowerSalary)}</td>
                              </tr>
                          </table>
                      </div>
                      
                      <div class="section">
                          <h2 class="section-title">معلومات الكفيل</h2>
                          <table class="info-table">
                              <tr>
                                  <th>اسم الكفيل</th>
                                  <td>${loan.guarantorName}</td>
                              </tr>
                              <tr>
                                  <th>رقم الهاتف</th>
                                  <td>${loan.guarantorPhone}${loan.guarantorAltPhone ? ` / ${loan.guarantorAltPhone}` : ''}</td>
                              </tr>
                              <tr>
                                  <th>العنوان</th>
                                  <td>${loan.guarantorAddress}</td>
                              </tr>
                              <tr>
                                  <th>مكان العمل</th>
                                  <td>${loan.guarantorWorkplace}</td>
                              </tr>
                              <tr>
                                  <th>الراتب الشهري</th>
                                  <td>${formatCurrency(loan.guarantorSalary)}</td>
                              </tr>
                              ${loan.hasSecondGuarantor ? `
                              <tr>
                                  <th colspan="2" style="text-align: center;">معلومات الكفيل الثاني</th>
                              </tr>
                              <tr>
                                  <th>اسم الكفيل الثاني</th>
                                  <td>${loan.guarantor2Name}</td>
                              </tr>
                              <tr>
                                  <th>رقم الهاتف</th>
                                  <td>${loan.guarantor2Phone}${loan.guarantor2AltPhone ? ` / ${loan.guarantor2AltPhone}` : ''}</td>
                              </tr>
                              <tr>
                                  <th>العنوان</th>
                                  <td>${loan.guarantor2Address}</td>
                              </tr>
                              <tr>
                                  <th>مكان العمل</th>
                                  <td>${loan.guarantor2Workplace}</td>
                              </tr>
                              <tr>
                                  <th>الراتب الشهري</th>
                                  <td>${formatCurrency(loan.guarantor2Salary)}</td>
                              </tr>
                              ` : ''}
                          </table>
                      </div>
                      
                      <div class="footer">
                          <p>تم إنشاء هذا المستند بواسطة نظام القروض - الإصدار ${LOAN_SYSTEM_VERSION}</p>
                          <p>تاريخ الطباعة: ${formatDate(new Date())}</p>
                      </div>
                      
                      <div class="no-print" style="text-align: center; margin-top: 20px;">
                          <button onclick="window.print()" style="padding: 10px 20px; background-color: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
                              طباعة المستند
                          </button>
                      </div>
                  </div>
              </body>
              </html>
          `;
          
          // كتابة المحتوى في نافذة الطباعة
          printWindow.document.open();
          printWindow.document.write(printContent);
          printWindow.document.close();
          
          // طباعة بعد تحميل المحتوى
          printWindow.onload = function() {
              setTimeout(function() {
                  printWindow.print();
              }, 500);
          };
      }
      
      /**
       * طباعة تفاصيل القرض الموافق عليه
       * @param {string} loanId - معرف القرض
       */
      function printApprovedLoanDetails(loanId) {
          // العثور على القرض
          const loan = approvedLoans.find(item => item.id === loanId);
          if (!loan) {
              showNotification('لم يتم العثور على القرض', 'error');
              return;
          }
          
          // إنشاء نافذة الطباعة
          const printWindow = window.open('', '_blank');
          if (!printWindow) {
              showNotification('لم يتم السماح بفتح نافذة الطباعة', 'error');
              return;
          }
          
          // إعداد محتوى الطباعة
          const printContent = `
              <!DOCTYPE html>
              <html dir="rtl">
              <head>
                  <meta charset="UTF-8">
                  <title>تفاصيل القرض الموافق عليه - ${loan.id}</title>
                  <style>
                      body {
                          font-family: Arial, sans-serif;
                          line-height: 1.6;
                          color: #333;
                          direction: rtl;
                      }
                      .container {
                          max-width: 800px;
                          margin: 0 auto;
                          padding: 20px;
                      }
                      .header {
                          text-align: center;
                          margin-bottom: 20px;
                          padding-bottom: 10px;
                          border-bottom: 2px solid #10b981;
                      }
                      .title {
                          font-size: 24px;
                          color: #1e293b;
                          margin: 0 0 10px;
                      }
                      .subtitle {
                          font-size: 16px;
                          color: #64748b;
                          margin: 0;
                      }
                      .section {
                          margin-bottom: 20px;
                      }
                      .section-title {
                          font-size: 18px;
                          color: #1e293b;
                          margin: 0 0 10px;
                          padding-bottom: 5px;
                          border-bottom: 1px solid #e2e8f0;
                      }
                      .info-table {
                          width: 100%;
                          border-collapse: collapse;
                          margin-bottom: 20px;
                      }
                      .info-table th, .info-table td {
                          padding: 10px;
                          border: 1px solid #e2e8f0;
                          text-align: right;
                      }
                      .info-table th {
                          background-color: #f8fafc;
                          font-weight: bold;
                          width: 35%;
                      }
                      .installments-table {
                          width: 100%;
                          border-collapse: collapse;
                          margin-bottom: 20px;
                      }
                      .installments-table th, .installments-table td {
                          padding: 8px;
                          border: 1px solid #e2e8f0;
                          text-align: center;
                          font-size: 12px;
                      }
                      .installments-table th {
                          background-color: #f8fafc;
                          font-weight: bold;
                      }
                      .footer {
                          margin-top: 30px;
                          text-align: center;
                          font-size: 12px;
                          color: #64748b;
                          padding-top: 10px;
                          border-top: 1px solid #e2e8f0;
                      }
                      .status {
                          display: inline-block;
                          padding: 5px 10px;
                          border-radius: 4px;
                          font-size: 14px;
                          font-weight: bold;
                          color: white;
                          margin-bottom: 10px;
                      }
                      .status-approved {
                          background-color: #10b981;
                      }
                      .signatures {
                          display: flex;
                          justify-content: space-between;
                          margin-top: 50px;
                      }
                      .signature {
                          text-align: center;
                          width: 30%;
                      }
                      .signature-line {
                          border-top: 1px solid #000;
                          margin-top: 40px;
                          margin-bottom: 10px;
                      }
                      @media print {
                          body {
                              font-size: 12px;
                          }
                          .title {
                              font-size: 18px;
                          }
                          .section-title {
                              font-size: 14px;
                          }
                          .no-print {
                              display: none;
                          }
                      }
                  </style>
              </head>
              <body>
                  <div class="container">
                      <div class="header">
                          <h1 class="title">عقد قرض</h1>
                          <p class="subtitle">رقم القرض: ${loan.id}</p>
                      </div>
                      
                      <div class="status status-approved">تمت الموافقة</div>
                      
                      <div class="section">
                          <h2 class="section-title">معلومات القرض</h2>
                          <table class="info-table">
                              <tr>
                                  <th>اسم المقترض</th>
                                  <td>${loan.borrowerName}</td>
                              </tr>
                              <tr>
                                  <th>نوع القرض</th>
                                  <td>${getCategoryName(loan.borrowerCategory)}</td>
                              </tr>
                              <tr>
                                  <th>تاريخ الطلب</th>
                                  <td>${formatDate(loan.createdAt)}</td>
                              </tr>
                              <tr>
                                  <th>تاريخ الموافقة</th>
                                  <td>${formatDate(loan.approvedAt)}</td>
                              </tr>
                              <tr>
                                  <th>تاريخ الصرف</th>
                                  <td>${formatDate(loan.disbursementDate)}</td>
                              </tr>
                              <tr>
                                  <th>مبلغ القرض</th>
                                  <td>${formatCurrency(loan.loanAmount)}</td>
                              </tr>
                              <tr>
                                  <th>نسبة الفائدة</th>
                                  <td>${loan.interestRate}%</td>
                              </tr>
                              <tr>
                                  <th>مدة القرض</th>
                                  <td>${loan.loanPeriod} شهر</td>
                              </tr>
                              <tr>
                                  <th>القسط الشهري</th>
                                  <td>${formatCurrency(calculateMonthlyPayment(loan.loanAmount, loan.interestRate, loan.loanPeriod))}</td>
                              </tr>
                              <tr>
                                  <th>إجمالي المبلغ مع الفائدة</th>
                                  <td>${formatCurrency(loan.loanAmount + (loan.loanAmount * loan.interestRate / 100 * loan.loanPeriod / 12))}</td>
                              </tr>
                          </table>
                      </div>
                      
                      <div class="section">
                          <h2 class="section-title">معلومات المقترض</h2>
                          <table class="info-table">
                              <tr>
                                  <th>رقم الهاتف</th>
                                  <td>${loan.borrowerPhone}${loan.borrowerAltPhone ? ` / ${loan.borrowerAltPhone}` : ''}</td>
                              </tr>
                              <tr>
                                  <th>رقم البطاقة الشخصية</th>
                                  <td>${loan.borrowerIdNumber}</td>
                              </tr>
                              <tr>
                                  <th>العنوان</th>
                                  <td>${loan.borrowerAddress}</td>
                              </tr>
                              <tr>
                                  <th>مكان العمل</th>
                                  <td>${loan.borrowerWorkplace}</td>
                              </tr>
                              <tr>
                                  <th>الراتب الشهري</th>
                                  <td>${formatCurrency(loan.borrowerSalary)}</td>
                              </tr>
                          </table>
                      </div>
                      
                      <div class="section">
                          <h2 class="section-title">معلومات الكفيل</h2>
                          <table class="info-table">
                              <tr>
                                  <th>اسم الكفيل</th>
                                  <td>${loan.guarantorName}</td>
                              </tr>
                              <tr>
                                  <th>رقم الهاتف</th>
                                  <td>${loan.guarantorPhone}${loan.guarantorAltPhone ? ` / ${loan.guarantorAltPhone}` : ''}</td>
                              </tr>
                              <tr>
                                  <th>العنوان</th>
                                  <td>${loan.guarantorAddress}</td>
                              </tr>
                              <tr>
                                  <th>مكان العمل</th>
                                  <td>${loan.guarantorWorkplace}</td>
                              </tr>
                              <tr>
                                  <th>الراتب الشهري</th>
                                  <td>${formatCurrency(loan.guarantorSalary)}</td>
                              </tr>
                              ${loan.hasSecondGuarantor ? `
                              <tr>
                                  <th colspan="2" style="text-align: center;">معلومات الكفيل الثاني</th>
                              </tr>
                              <tr>
                                  <th>اسم الكفيل الثاني</th>
                                  <td>${loan.guarantor2Name}</td>
                              </tr>
                              <tr>
                                  <th>رقم الهاتف</th>
                                  <td>${loan.guarantor2Phone}${loan.guarantor2AltPhone ? ` / ${loan.guarantor2AltPhone}` : ''}</td>
                              </tr>
                              <tr>
                                  <th>العنوان</th>
                                  <td>${loan.guarantor2Address}</td>
                              </tr>
                              <tr>
                                  <th>مكان العمل</th>
                                  <td>${loan.guarantor2Workplace}</td>
                              </tr>
                              <tr>
                                  <th>الراتب الشهري</th>
                                  <td>${formatCurrency(loan.guarantor2Salary)}</td>
                              </tr>
                              ` : ''}
                          </table>
                      </div>
                      
                      <div class="section">
                          <h2 class="section-title">شروط وأحكام القرض</h2>
                          <ol>
                              <li>يلتزم المقترض بسداد الأقساط الشهرية في موعدها المحدد دون تأخير.</li>
                              <li>في حالة التأخر عن سداد أي قسط، يتم احتساب غرامة تأخير بنسبة 1% من قيمة القسط.</li>
                              <li>يتعهد المقترض بإخطار الجهة المانحة في حالة تغيير محل الإقامة أو مكان العمل أو رقم الهاتف.</li>
                              <li>يحق للكفيل الاطلاع على سجل سداد المقترض في أي وقت.</li>
                              <li>في حالة تخلف المقترض عن سداد قسطين متتاليين، يحق للجهة المانحة اتخاذ الإجراءات القانونية لتحصيل المبلغ المتبقي.</li>
                          </ol>
                      </div>
                      
                      <div class="signatures">
                          <div class="signature">
                              <div class="signature-line"></div>
                              <div>توقيع المقترض</div>
                          </div>
                          <div class="signature">
                              <div class="signature-line"></div>
                              <div>توقيع الكفيل</div>
                          </div>
                          <div class="signature">
                              <div class="signature-line"></div>
                              <div>توقيع الموظف المسؤول</div>
                          </div>
                      </div>
                      
                      <div class="footer">
                          <p>تم إنشاء هذا المستند بواسطة نظام القروض - الإصدار ${LOAN_SYSTEM_VERSION}</p>
                          <p>تاريخ الطباعة: ${formatDate(new Date())}</p>
                      </div>
                      
                      <div class="no-print" style="text-align: center; margin-top: 20px;">
                          <button onclick="window.print()" style="padding: 10px 20px; background-color: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">
                              طباعة المستند
                          </button>
                      </div>
                  </div>
              </body>
              </html>
          `;
          
          // كتابة المحتوى في نافذة الطباعة
          printWindow.document.open();
          printWindow.document.write(printContent);
          printWindow.document.close();
          
          // طباعة بعد تحميل المحتوى
          printWindow.onload = function() {
              setTimeout(function() {
                  printWindow.print();
              }, 500);
          };
      }
      
      /**
       * طباعة تفاصيل القرض المرفوض
       * @param {string} loanId - معرف القرض
       */
      function printRejectedLoanDetails(loanId) {
          // العثور على القرض
          const loan = rejectedLoans.find(item => item.id === loanId);
          if (!loan) {
              showNotification('لم يتم العثور على القرض', 'error');
              return;
          }
          
          // إنشاء نافذة الطباعة
          const printWindow = window.open('', '_blank');
          if (!printWindow) {
              showNotification('لم يتم السماح بفتح نافذة الطباعة', 'error');
              return;
          }
          
          // إعداد محتوى الطباعة
          const printContent = `
              <!DOCTYPE html>
              <html dir="rtl">
              <head>
                  <meta charset="UTF-8">
                  <title>تفاصيل القرض المرفوض - ${loan.id}</title>
                  <style>
                      body {
                          font-family: Arial, sans-serif;
                          line-height: 1.6;
                          color: #333;
                          direction: rtl;
                      }
                      .container {
                          max-width: 800px;
                          margin: 0 auto;
                          padding: 20px;
                      }
                      .header {
                          text-align: center;
                          margin-bottom: 20px;
                          padding-bottom: 10px;
                          border-bottom: 2px solid #ef4444;
                      }
                      .title {
                          font-size: 24px;
                          color: #1e293b;
                          margin: 0 0 10px;
                      }
                      .subtitle {
                          font-size: 16px;
                          color: #64748b;
                          margin: 0;
                      }
                      .section {
                          margin-bottom: 20px;
                      }
                      .section-title {
                          font-size: 18px;
                          color: #1e293b;
                          margin: 0 0 10px;
                          padding-bottom: 5px;
                          border-bottom: 1px solid #e2e8f0;
                      }
                      .info-table {
                          width: 100%;
                          border-collapse: collapse;
                          margin-bottom: 20px;
                      }
                      .info-table th, .info-table td {
                          padding: 10px;
                          border: 1px solid #e2e8f0;
                          text-align: right;
                      }
                      .info-table th {
                          background-color: #f8fafc;
                          font-weight: bold;
                          width: 35%;
                      }
                      .footer {
                          margin-top: 30px;
                          text-align: center;
                          font-size: 12px;
                          color: #64748b;
                          padding-top: 10px;
                          border-top: 1px solid #e2e8f0;
                      }
                      .status {
                          display: inline-block;
                          padding: 5px 10px;
                          border-radius: 4px;
                          font-size: 14px;
                          font-weight: bold;
                          color: white;
                          margin-bottom: 10px;
                      }
                      .status-rejected {
                          background-color: #ef4444;
                      }
                      .rejection-box {
                          background-color: #fef2f2;
                          border: 1px solid #fecaca;
                          border-radius: 4px;
                          padding: 15px;
                          margin-bottom: 20px;
                      }
                      .rejection-title {
                          font-size: 16px;
                          color: #ef4444;
                          margin: 0 0 10px;
                      }
                      @media print {
                          body {
                              font-size: 12px;
                          }
                          .title {
                              font-size: 18px;
                          }
                          .section-title {
                              font-size: 14px;
                          }
                          .no-print {
                              display: none;
                          }
                      }
                  </style>
              </head>
              <body>
                  <div class="container">
                      <div class="header">
                          <h1 class="title">إشعار رفض طلب قرض</h1>
                          <p class="subtitle">رقم الطلب: ${loan.id} | تاريخ الرفض: ${formatDate(loan.rejectedAt)}</p>
                      </div>
                      
                      <div class="status status-rejected">مرفوض</div>
                      
                      <div class="rejection-box">
                          <h3 class="rejection-title">سبب الرفض: ${getRejectionReasonText(loan.rejectionReason)}</h3>
                          <p>${loan.rejectionDetails}</p>
                      </div>
                      
                      <div class="section">
                          <h2 class="section-title">معلومات القرض</h2>
                          <table class="info-table">
                              <tr>
                                  <th>اسم المقترض</th>
                                  <td>${loan.borrowerName}</td>
                              </tr>
                              <tr>
                                  <th>نوع القرض</th>
                                  <td>${getCategoryName(loan.borrowerCategory)}</td>
                              </tr>
                              <tr>
                                  <th>تاريخ الطلب</th>
                                  <td>${formatDate(loan.createdAt)}</td>
                              </tr>
                              <tr>
                                  <th>مبلغ القرض</th>
                                  <td>${formatCurrency(loan.loanAmount)}</td>
                              </tr>
                              <tr>
                                  <th>نسبة الفائدة</th>
                                  <td>${loan.interestRate}%</td>
                              </tr>
                              <tr>
                                  <th>مدة القرض</th>
                                  <td>${loan.loanPeriod} شهر</td>
                              </tr>
                          </table>
                      </div>
                      
                      <div class="section">
                          <h2 class="section-title">معلومات المقترض</h2>
                          <table class="info-table">
                              <tr>
                                  <th>رقم الهاتف</th>
                                  <td>${loan.borrowerPhone}${loan.borrowerAltPhone ? ` / ${loan.borrowerAltPhone}` : ''}</td>
                              </tr>
                              <tr>
                                  <th>رقم البطاقة الشخصية</th>
                                  <td>${loan.borrowerIdNumber}</td>
                              </tr>
                              <tr>
                                  <th>العنوان</th>
                                  <td>${loan.borrowerAddress}</td>
                              </tr>
                              <tr>
                                  <th>مكان العمل</th>
                                  <td>${loan.borrowerWorkplace}</td>
                              </tr>
                              <tr>
                                  <th>الراتب الشهري</th>
                                  <td>${formatCurrency(loan.borrowerSalary)}</td>
                              </tr>
                          </table>
                      </div>
                      
                      <div class="section">
                          <h2 class="section-title">ملاحظات إضافية</h2>
                          <p>يمكن إعادة تقديم طلب جديد بعد معالجة أسباب الرفض المذكورة أعلاه.</p>
                          <p>للاستفسار، يرجى الاتصال بقسم خدمة العملاء.</p>
                      </div>
                      
                      <div class="footer">
                          <p>تم إنشاء هذا المستند بواسطة نظام القروض - الإصدار ${LOAN_SYSTEM_VERSION}</p>
                          <p>تاريخ الطباعة: ${formatDate(new Date())}</p>
                      </div>
                      
                      <div class="no-print" style="text-align: center; margin-top: 20px;">
                          <button onclick="window.print()" style="padding: 10px 20px; background-color: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
                              طباعة المستند
                          </button>
                      </div>
                  </div>
              </body>
              </html>
          `;
          
          // كتابة المحتوى في نافذة الطباعة
          printWindow.document.open();
          printWindow.document.write(printContent);
          printWindow.document.close();
          
          // طباعة بعد تحميل المحتوى
          printWindow.onload = function() {
              setTimeout(function() {
                  printWindow.print();
              }, 500);
          };
      }
      
      // ===========================
      // وظائف تصفية وترتيب البيانات
      // ===========================
      
      /**
       * تصفية القروض حسب المعايير
       * @param {Array} loansArray - مصفوفة القروض
       * @param {string} filter - نوع التصفية
       * @param {string} query - نص البحث
       * @returns {Array} - القروض المصفاة
       */
      function filterLoans(loansArray, filter, query) {
          // تطبيق البحث أولاً
          let filtered = loansArray;
          
          if (query && query.trim() !== '') {
              const searchTerm = query.trim().toLowerCase();
              filtered = filtered.filter(loan => {
                  return loan.borrowerName.toLowerCase().includes(searchTerm) ||
                         loan.id.toLowerCase().includes(searchTerm) ||
                         loan.borrowerPhone.toLowerCase().includes(searchTerm) ||
                         (loan.borrowerIdNumber && loan.borrowerIdNumber.toLowerCase().includes(searchTerm));
              });
          }
          
          // تطبيق التصفية حسب الفئة
          if (filter !== 'all') {
              filtered = filtered.filter(loan => loan.borrowerCategory === filter);
          }
          
          return filtered;
      }
      
      /**
       * تصفية القروض حسب التاريخ
       * @param {Array} loansArray - مصفوفة القروض
       * @param {string} dateFilter - تصفية التاريخ
       * @param {string} query - نص البحث
       * @returns {Array} - القروض المصفاة
       */
      function filterLoansByDate(loansArray, dateFilter, query) {
          // تطبيق البحث أولاً
          let filtered = loansArray;
          
          if (query && query.trim() !== '') {
              const searchTerm = query.trim().toLowerCase();
              filtered = filtered.filter(loan => {
                  return loan.borrowerName.toLowerCase().includes(searchTerm) ||
                         loan.id.toLowerCase().includes(searchTerm) ||
                         loan.borrowerPhone.toLowerCase().includes(searchTerm) ||
                         (loan.borrowerIdNumber && loan.borrowerIdNumber.toLowerCase().includes(searchTerm));
              });
          }
          
          // تطبيق تصفية التاريخ
          if (dateFilter !== 'all') {
              const today = new Date();
              const currentMonth = today.getMonth();
              const currentYear = today.getFullYear();
              
              filtered = filtered.filter(loan => {
                  const loanDate = new Date(loan.approvedAt || loan.rejectedAt);
                  
                  switch (dateFilter) {
                      case 'this-month':
                          return loanDate.getMonth() === currentMonth && 
                                 loanDate.getFullYear() === currentYear;
                      case 'last-month':
                          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
                          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
                          return loanDate.getMonth() === lastMonth && 
                                 loanDate.getFullYear() === lastMonthYear;
                      case 'this-year':
                          return loanDate.getFullYear() === currentYear;
                      case 'custom':
                          // يمكن تنفيذ تصفية مخصصة في تحديث لاحق
                          return true;
                      default:
                          return true;
                  }
              });
          }
          
          return filtered;
      }
      
      /**
       * الحصول على اسم تصفية القروض
       * @param {string} filter - نوع التصفية
       * @returns {string} - اسم التصفية
       */
      function getLoanFilterName(filter) {
          switch (filter) {
              case 'kasb': return 'كاسب';
              case 'employee': return 'موظف';
              case 'military': return 'عسكري';
              case 'social': return 'رعاية اجتماعية';
              default: return '';
          }
      }
      
      /**
       * الحصول على اسم الفئة
       * @param {string} category - رمز الفئة
       * @returns {string} - اسم الفئة
       */
      function getCategoryName(category) {
          switch (category) {
              case 'kasb': return 'كاسب';
              case 'employee': return 'موظف';
              case 'military': return 'عسكري';
              case 'social': return 'رعاية اجتماعية';
              default: return category;
          }
      }
      
      /**
       * الحصول على نص سبب الرفض
       * @param {string} reason - رمز سبب الرفض
       * @returns {string} - نص سبب الرفض
       */
      function getRejectionReasonText(reason) {
          switch (reason) {
              case 'insufficient-income': return 'دخل غير كافٍ';
              case 'incomplete-documents': return 'نقص في المستندات';
              case 'bad-credit-history': return 'تاريخ ائتماني سيئ';
              case 'guarantor-issues': return 'مشاكل في الكفيل';
              case 'exceeds-limits': return 'تجاوز الحدود المسموح بها';
              case 'other': return 'أخرى';
              default: return reason;
          }
      }
      
      /**
       * الحصول على حالة القرض
       * @param {Object} loan - كائن القرض
       * @returns {Object} - فئة الحالة ونص الحالة
       */
      function getLoanStatus(loan) {
          let statusClass = 'primary';
          let statusText = 'قيد المراجعة';
          
          return { statusClass, statusText };
      }
      
      // ===========================
      // وظائف مساعدة
      // ===========================
      
      /**
       * تنسيق التاريخ حسب الإعدادات
       * @param {string|Date} date - التاريخ
       * @param {string} format - تنسيق التاريخ (اختياري)
       * @returns {string} - التاريخ المنسق
       */
      function formatDate(date, format = settings.dateFormat) {
          if (!date) return '-';
          
          const dateObj = date instanceof Date ? date : new Date(date);
          
          if (isNaN(dateObj.getTime())) return '-';
          
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          
          let formattedDate = format;
          formattedDate = formattedDate.replace('YYYY', year);
          formattedDate = formattedDate.replace('MM', month);
          formattedDate = formattedDate.replace('DD', day);
          
          return formattedDate;
      }
      
      /**
       * تنسيق المبلغ كعملة
       * @param {number} amount - المبلغ
       * @param {boolean} addCurrency - إضافة العملة
       * @returns {string} - المبلغ المنسق
       */
      function formatCurrency(amount, addCurrency = true) {
          // التأكد من أن القيمة رقمية
          amount = parseFloat(amount);
          
          if (isNaN(amount)) return '0';
          
          // تقريب المبلغ إلى أقرب قيمتين عشريتين
          amount = Math.round(amount * 100) / 100;
          
          // تنسيق المبلغ باستخدام الفواصل للآلاف
          const formatted = amount.toLocaleString('ar-SA', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2
          });
          
          // إضافة العملة إذا كان مطلوبًا
          return addCurrency ? `${formatted} ${settings.currency}` : formatted;
      }
      
      /**
       * إنشاء معرف فريد
       * @returns {string} - معرف فريد
       */
      function generateUniqueId() {
          return 'loan_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
      }
      
      /**
       * تحديث العملة في الحقول
       */
      function updateCurrencyDisplay() {
          const currencyAddons = document.querySelectorAll('.currency-addon');
          currencyAddons.forEach(addon => {
              addon.textContent = settings.currency;
          });
      }
      
      /**
       * إضافة مستمعي الأحداث للجدول
       */
      function setupLoanTableActionButtons() {
          // أزرار عرض التفاصيل
          document.querySelectorAll('.view-loan').forEach(button => {
              button.addEventListener('click', function() {
                  const loanId = this.getAttribute('data-id');
                  showLoanDetails(loanId);
              });
          });
          
          // أزرار الموافقة
          document.querySelectorAll('.approve-loan').forEach(button => {
              button.addEventListener('click', function() {
                  const loanId = this.getAttribute('data-id');
                  openApproveLoanModal(loanId);
              });
          });
          
          // أزرار الرفض
          document.querySelectorAll('.reject-loan').forEach(button => {
              button.addEventListener('click', function() {
                  const loanId = this.getAttribute('data-id');
                  openRejectLoanModal(loanId);
              });
          });
          
          // أزرار الحذف
          document.querySelectorAll('.delete-loan').forEach(button => {
              button.addEventListener('click', function() {
                  const loanId = this.getAttribute('data-id');
                  confirmDeleteLoan(loanId);
              });
          });
      }
      
      /**
       * إضافة مستمعي الأحداث لجدول القروض الموافق عليها
       */
      function setupApprovedLoansTableButtons() {
          // أزرار عرض التفاصيل
          document.querySelectorAll('.view-approved-loan').forEach(button => {
              button.addEventListener('click', function() {
                  const loanId = this.getAttribute('data-id');
                  showApprovedLoanDetails(loanId);
              });
          });
          
          // أزرار الطباعة
          document.querySelectorAll('.print-approved-loan').forEach(button => {
              button.addEventListener('click', function() {
                  const loanId = this.getAttribute('data-id');
                  printApprovedLoanDetails(loanId);
              });
          });
          
          // روابط عرض الأقساط
          document.querySelectorAll('.view-installment-link').forEach(link => {
              link.addEventListener('click', function(e) {
                  e.preventDefault();
                  const installmentId = this.getAttribute('data-id');
                  
                  if (typeof window.openInstallmentDetails === 'function') {
                      setActivePage('installments');
                      setTimeout(() => {
                          window.openInstallmentDetails(installmentId);
                      }, 300);
                  } else {
                      showNotification('نظام الأقساط غير متوفر حالياً', 'error');
                  }
              });
          });
      }
      
      /**
       * إضافة مستمعي الأحداث لجدول القروض المرفوضة
       */
      function setupRejectedLoansTableButtons() {
          // أزرار عرض التفاصيل
          document.querySelectorAll('.view-rejected-loan').forEach(button => {
              button.addEventListener('click', function() {
                  const loanId = this.getAttribute('data-id');
                  showRejectedLoanDetails(loanId);
              });
          });
          
          // أزرار الطباعة
          document.querySelectorAll('.print-rejected-loan').forEach(button => {
              button.addEventListener('click', function() {
                  const loanId = this.getAttribute('data-id');
                  printRejectedLoanDetails(loanId);
              });
          });
      }
      
      /**
       * تأكيد حذف قرض
       * @param {string} loanId - معرف القرض
       */
      function confirmDeleteLoan(loanId) {
          // العثور على القرض
          const loan = loans.find(loan => loan.id === loanId);
          if (!loan) {
              showNotification('لم يتم العثور على القرض', 'error');
              return;
          }
          
          if (confirm(`هل أنت متأكد من حذف القرض "${loan.borrowerName}"؟`)) {
              // حذف القرض
              deleteLoan(loanId);
              showNotification('تم حذف القرض بنجاح', 'success');
          }
      }
      
      // ===========================
      // إعداد مستمعي الأحداث
      // ===========================
      
      /**
       * إعداد مستمعي الأحداث في نظام القروض
       */
      function setupLoanEventListeners() {
          // مستمعي الأحداث العامة
          setupGeneralLoanEventListeners();
          
          // مستمعي أحداث النوافذ المنبثقة
          setupLoanModalEventListeners();
          
          // مستمعي أحداث البحث والتصفية
          setupSearchFilterLoanEventListeners();
          
          // مستمعي أحداث صفحة إضافة قرض
          setupAddLoanPageEventListeners();
          
          // مستمعي أحداث صفحة الإعدادات
          setupLoanSettingsEventListeners();
      }
      
      /**
       * إعداد مستمعي الأحداث العامة
       */
      function setupGeneralLoanEventListeners() {
          // زر إضافة قرض جديد في صفحة القروض
          const newLoanBtn = document.getElementById('new-loan-btn');
          if (newLoanBtn) {
              newLoanBtn.addEventListener('click', function() {
                  setActivePage('add-loan');
              });
          }
          
          // زر إضافة أول قرض
          const addFirstLoanBtn = document.getElementById('add-first-loan-btn');
          if (addFirstLoanBtn) {
              addFirstLoanBtn.addEventListener('click', function() {
                  setActivePage('add-loan');
              });
          }
          
          // زر تحديث القروض
          const refreshLoansBtn = document.getElementById('refresh-loans-btn');
          if (refreshLoansBtn) {
              refreshLoansBtn.addEventListener('click', function() {
                  renderLoansTable();
                  showNotification('تم تحديث بيانات القروض', 'success');
              });
          }
          
          // زر تحديث القروض الموافق عليها
          const refreshApprovedLoansBtn = document.getElementById('refresh-approved-loans-btn');
          if (refreshApprovedLoansBtn) {
              refreshApprovedLoansBtn.addEventListener('click', function() {
                  renderApprovedLoansTable();
                  showNotification('تم تحديث بيانات القروض الموافق عليها', 'success');
              });
          }
          
          // زر تحديث القروض المرفوضة
          const refreshRejectedLoansBtn = document.getElementById('refresh-rejected-loans-btn');
          if (refreshRejectedLoansBtn) {
              refreshRejectedLoansBtn.addEventListener('click', function() {
                  renderRejectedLoansTable();
                  showNotification('تم تحديث بيانات القروض المرفوضة', 'success');
              });
          }
      }
      
      /**
       * إعداد مستمعي أحداث النوافذ المنبثقة
       */
      function setupLoanModalEventListeners() {
          // أزرار إغلاق النوافذ المنبثقة
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
       * إعداد مستمعي أحداث البحث والتصفية
       */
      function setupSearchFilterLoanEventListeners() {
          // حقل البحث في القروض النشطة
          const searchInput = document.getElementById('loans-search');
          if (searchInput) {
              searchInput.addEventListener('input', function() {
                  loanSearchQuery = this.value;
                  renderLoansTable();
              });
          }
          
          // حقل البحث في القروض الموافق عليها
          const approvedSearchInput = document.getElementById('approved-loans-search');
          if (approvedSearchInput) {
              approvedSearchInput.addEventListener('input', function() {
                  renderApprovedLoansTable();
              });
          }
          
          // حقل البحث في القروض المرفوضة
          const rejectedSearchInput = document.getElementById('rejected-loans-search');
          if (rejectedSearchInput) {
              rejectedSearchInput.addEventListener('input', function() {
                  renderRejectedLoansTable();
              });
          }
          
          // أزرار تصفية القروض
          document.querySelectorAll('.filter-buttons .btn').forEach(button => {
              button.addEventListener('click', function() {
                  // تحديث الزر النشط
                  document.querySelectorAll('.filter-buttons .btn').forEach(btn => {
                      btn.classList.remove('active');
                  });
                  this.classList.add('active');
                  
                  // تحديث تصفية القروض
                  currentLoanFilter = this.getAttribute('data-filter');
                  renderLoansTable();
              });
          });
          
          // قائمة تصفية تاريخ القروض الموافق عليها
          const approvedDateFilter = document.getElementById('approved-date-filter');
          if (approvedDateFilter) {
              approvedDateFilter.addEventListener('change', function() {
                  renderApprovedLoansTable();
              });
          }
          
          // قائمة تصفية تاريخ القروض المرفوضة
          const rejectedDateFilter = document.getElementById('rejected-date-filter');
          if (rejectedDateFilter) {
              rejectedDateFilter.addEventListener('change', function() {
                  renderRejectedLoansTable();
              });
          }
      }
      
      /**
       * إعداد مستمعي أحداث صفحة إضافة قرض
       */
      function setupAddLoanPageEventListeners() {
          // أزرار التنقل بين خطوات نموذج القرض
          setupLoanWizardNavigation();
          
          // مستمعي الأحداث لحقول حساب القرض
          setupLoanCalculationListeners();
          
          // مستمعي الأحداث للتحقق من المستندات
          setupFilePreviewListeners();
          
          // مستمعي أحداث الكفيل الثاني
          setupSecondGuarantorListeners();
          
          // زر مراجعة وإرسال طلب القرض
          const reviewLoanBtn = document.getElementById('review-loan-btn');
          if (reviewLoanBtn) {
              reviewLoanBtn.addEventListener('click', function() {
                  const wizardSteps = document.querySelectorAll('.wizard-step');
                  // الانتقال إلى الخطوة الأخيرة (المراجعة)
                  goToLoanStep(wizardSteps.length);
              });
          }
          
          // زر تقديم طلب القرض
          const submitLoanBtn = document.getElementById('submit-loan-btn');
          if (submitLoanBtn) {
              submitLoanBtn.addEventListener('click', submitLoanApplication);
          }
          
          // تحديث حالة زر التقديم بناءً على الموافقة
          const loanAgreementCheckbox = document.getElementById('loan-agreement');
          if (loanAgreementCheckbox) {
              loanAgreementCheckbox.addEventListener('change', function() {
                  document.getElementById('submit-loan-btn').disabled = !this.checked;
              });
          }
          
          // تحديث نوع المقترض
          const borrowerCategorySelect = document.getElementById('borrower-category');
          if (borrowerCategorySelect) {
              borrowerCategorySelect.addEventListener('change', function() {
                  updateLoanLimitsBasedOnCategory(this.value);
              });
          }
      }
      
      /**
       * إعداد التنقل بين خطوات نموذج إضافة القرض
       */
      function setupLoanWizardNavigation() {
          // أزرار "التالي" لكل خطوة
          const loanInfoNextBtn = document.getElementById('loan-info-next');
          if (loanInfoNextBtn) {
              loanInfoNextBtn.addEventListener('click', function() {
                  if (validateLoanInfoStep()) {
                      goToLoanStep(2);
                  }
              });
          }
          
          const borrowerInfoNextBtn = document.getElementById('borrower-info-next');
          if (borrowerInfoNextBtn) {
              borrowerInfoNextBtn.addEventListener('click', function() {
                  if (validateBorrowerInfoStep()) {
                      goToLoanStep(3);
                  }
              });
          }
          
          const borrowerInfoPrevBtn = document.getElementById('borrower-info-prev');
          if (borrowerInfoPrevBtn) {
              borrowerInfoPrevBtn.addEventListener('click', function() {
                  goToLoanStep(1);
              });
          }
          
          const guarantorInfoNextBtn = document.getElementById('guarantor-info-next');
          if (guarantorInfoNextBtn) {
              guarantorInfoNextBtn.addEventListener('click', function() {
                  if (validateGuarantorInfoStep()) {
                      goToLoanStep(4);
                      updateLoanReviewData();
                  }
              });
          }
          
          const guarantorInfoPrevBtn = document.getElementById('guarantor-info-prev');
          if (guarantorInfoPrevBtn) {
              guarantorInfoPrevBtn.addEventListener('click', function() {
                  goToLoanStep(2);
              });
          }
          
          const reviewPrevBtn = document.getElementById('review-prev');
          if (reviewPrevBtn) {
              reviewPrevBtn.addEventListener('click', function() {
                  goToLoanStep(3);
              });
          }
          
          // إضافة مستمعي الأحداث لخطوات المعالج
          document.querySelectorAll('.wizard-step').forEach(step => {
              step.addEventListener('click', function() {
                  const currentStep = parseInt(document.querySelector('.wizard-step.active').getAttribute('data-step'));
                  const targetStep = parseInt(this.getAttribute('data-step'));
                  
                  // السماح بالانتقال إلى الخطوات السابقة فقط
                  if (targetStep < currentStep) {
                      goToLoanStep(targetStep);
                  } else if (targetStep > currentStep) {
                      // التحقق من الخطوات السابقة عند محاولة الانتقال للأمام
                      let isValid = true;
                      
                      for (let i = currentStep; i < targetStep; i++) {
                          switch (i) {
                              case 1:
                                  isValid = validateLoanInfoStep();
                                  break;
                              case 2:
                                  isValid = validateBorrowerInfoStep();
                                  break;
                              case 3:
                                  isValid = validateGuarantorInfoStep();
                                  break;
                          }
                          
                          if (!isValid) break;
                      }
                      
                      if (isValid) {
                          goToLoanStep(targetStep);
                          if (targetStep === 4) {
                              updateLoanReviewData();
                          }
                      }
                  }
              });
          });
      }
      
      /**
       * الانتقال إلى خطوة معينة في معالج إضافة القرض
       * @param {number} stepNumber - رقم الخطوة
       */
      function goToLoanStep(stepNumber) {
          // تحديث الخطوات
          document.querySelectorAll('.wizard-step').forEach(step => {
              const stepNum = parseInt(step.getAttribute('data-step'));
              
              step.classList.remove('active', 'completed');
              
              if (stepNum === stepNumber) {
                  step.classList.add('active');
              } else if (stepNum < stepNumber) {
                  step.classList.add('completed');
              }
          });
          
          // تحديث المحتوى
          document.querySelectorAll('.wizard-content-step').forEach(content => {
              const contentStepNum = parseInt(content.getAttribute('data-step'));
              
              content.classList.remove('active');
              
              if (contentStepNum === stepNumber) {
                  content.classList.add('active');
              }
          });
      }
      
      /**
       * التحقق من صحة الخطوة الأولى (معلومات القرض)
       * @returns {boolean} - نجاح التحقق
       */
      function validateLoanInfoStep() {
          const borrowerCategory = document.getElementById('borrower-category').value;
          const borrowerName = document.getElementById('borrower-name').value;
          const borrowerPhone = document.getElementById('borrower-phone').value;
          const borrowerIdNumber = document.getElementById('borrower-id-number').value;
          const borrowerAddress = document.getElementById('borrower-address').value;
          const loanAmount = parseFloat(document.getElementById('loan-amount').value);
          const interestRate = parseFloat(document.getElementById('interest-rate').value);
          const loanPeriod = parseInt(document.getElementById('loan-period').value);
          
          // التحقق من الحقول المطلوبة
          if (!borrowerCategory) {
              showNotification('يرجى اختيار نوع المقترض', 'error');
              return false;
          }
          
          if (!borrowerName || borrowerName.trim().length < 3) {
              showNotification('يرجى إدخال اسم المقترض بشكل صحيح', 'error');
              return false;
          }
          
          if (!borrowerPhone || !/^\d{10,11}$/.test(borrowerPhone.replace(/\s/g, ''))) {
              showNotification('يرجى إدخال رقم هاتف صحيح', 'error');
              return false;
          }
          
          if (!borrowerIdNumber || borrowerIdNumber.trim().length < 5) {
              showNotification('يرجى إدخال رقم البطاقة الشخصية بشكل صحيح', 'error');
              return false;
          }
          
          if (!borrowerAddress || borrowerAddress.trim().length < 5) {
              showNotification('يرجى إدخال عنوان المقترض بشكل صحيح', 'error');
              return false;
          }
          
          // التحقق من مبلغ القرض
          if (isNaN(loanAmount) || loanAmount <= 0) {
              showNotification('يرجى إدخال مبلغ القرض بشكل صحيح', 'error');
              return false;
          }
          
          // التحقق من الحد الأقصى للقرض حسب الفئة
          const maxLoanAmount = loanSettings.maxLoanAmount[borrowerCategory];
          if (loanAmount > maxLoanAmount) {
              showNotification(`مبلغ القرض يتجاوز الحد الأقصى المسموح به (${formatCurrency(maxLoanAmount)})`, 'error');
              return false;
          }
          
          // التحقق من نسبة الفائدة
          if (isNaN(interestRate) || interestRate < 0 || interestRate > 20) {
              showNotification('يرجى إدخال نسبة الفائدة بشكل صحيح (بين 0 و 20)', 'error');
              return false;
          }
          
          // التحقق من مدة القرض
          if (isNaN(loanPeriod) || loanPeriod < 6 || loanPeriod > 60 || loanPeriod % 6 !== 0) {
              showNotification('يرجى إدخال مدة القرض بشكل صحيح (بين 6 و 60 شهر، مضاعفات 6)', 'error');
              return false;
          }
          
          return true;
      }
      
      /**
       * التحقق من صحة الخطوة الثانية (معلومات المقترض)
       * @returns {boolean} - نجاح التحقق
       */
      function validateBorrowerInfoStep() {
          const borrowerCategory = document.getElementById('borrower-category').value;
          const borrowerSalary = parseFloat(document.getElementById('borrower-salary').value);
          const borrowerWorkplace = document.getElementById('borrower-workplace').value;
          const borrowerWorkAddress = document.getElementById('borrower-work-address').value;
          const borrowerServiceYears = parseFloat(document.getElementById('borrower-service-years').value);
          
          // التحقق من الحقول المطلوبة
          if (isNaN(borrowerSalary) || borrowerSalary <= 0) {
              showNotification('يرجى إدخال الراتب الشهري بشكل صحيح', 'error');
              return false;
          }
          
          // التحقق من الحد الأدنى للراتب
          const minSalary = loanSettings.minSalary[borrowerCategory];
          if (borrowerSalary < minSalary) {
              showNotification(`الراتب الشهري أقل من الحد الأدنى المطلوب (${formatCurrency(minSalary)})`, 'error');
              return false;
          }
          
          if (!borrowerWorkplace || borrowerWorkplace.trim().length < 3) {
              showNotification('يرجى إدخال مكان العمل بشكل صحيح', 'error');
              return false;
          }
          
          if (!borrowerWorkAddress || borrowerWorkAddress.trim().length < 5) {
              showNotification('يرجى إدخال عنوان العمل بشكل صحيح', 'error');
              return false;
          }
          
          if (isNaN(borrowerServiceYears) || borrowerServiceYears < 0) {
              showNotification('يرجى إدخال مدة الخدمة بشكل صحيح', 'error');
              return false;
          }
          
          // التحقق من حد القرض نسبة إلى الراتب
          const loanAmount = parseFloat(document.getElementById('loan-amount').value);
          const maxLoanToSalaryRatio = loanSettings.maxLoanToSalaryRatio[borrowerCategory];
          const maxLoanBasedOnSalary = borrowerSalary * maxLoanToSalaryRatio;
          
          if (loanAmount > maxLoanBasedOnSalary) {
              showNotification(`مبلغ القرض يتجاوز الحد المسموح به بناءً على الراتب (${formatCurrency(maxLoanBasedOnSalary)})`, 'error');
              return false;
          }
          
          // التحقق من المستندات المطلوبة
          if (loanSettings.requireAllDocuments) {
              const requiredDocuments = [
                  { id: 'borrower-id-front', name: 'البطاقة الموحدة (الوجه الأمامي)' },
                  { id: 'borrower-id-back', name: 'البطاقة الموحدة (الوجه الخلفي)' },
                  { id: 'borrower-residence-front', name: 'بطاقة السكن (الوجه الأمامي)' },
                  { id: 'borrower-residence-back', name: 'بطاقة السكن (الوجه الخلفي)' },
                  { id: 'borrower-salary-certificate', name: 'تأييد بالراتب' },
                  { id: 'borrower-work-certificate', name: 'تأييد استمرارية بالعمل' }
              ];
              
              for (const doc of requiredDocuments) {
                  const fileInput = document.getElementById(doc.id);
                  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                      showNotification(`يرجى إرفاق ${doc.name}`, 'error');
                      return false;
                  }
              }
          }
          
          return true;
      }
      
      /**
       * التحقق من صحة الخطوة الثالثة (معلومات الكفيل)
       * @returns {boolean} - نجاح التحقق
       */
      function validateGuarantorInfoStep() {
          const borrowerCategory = document.getElementById('borrower-category').value;
          const guarantorName = document.getElementById('guarantor-name').value;
          const guarantorPhone = document.getElementById('guarantor-phone').value;
          const guarantorAddress = document.getElementById('guarantor-address').value;
          const guarantorWorkplace = document.getElementById('guarantor-workplace').value;
          const guarantorSalary = parseFloat(document.getElementById('guarantor-salary').value);
          
          // التحقق من الحقول المطلوبة للكفيل الأول
          if (!guarantorName || guarantorName.trim().length < 3) {
              showNotification('يرجى إدخال اسم الكفيل بشكل صحيح', 'error');
              return false;
          }
          
          if (!guarantorPhone || !/^\d{10,11}$/.test(guarantorPhone.replace(/\s/g, ''))) {
              showNotification('يرجى إدخال رقم هاتف الكفيل بشكل صحيح', 'error');
              return false;
          }
          
          if (!guarantorAddress || guarantorAddress.trim().length < 5) {
              showNotification('يرجى إدخال عنوان الكفيل بشكل صحيح', 'error');
              return false;
          }
          
          if (!guarantorWorkplace || guarantorWorkplace.trim().length < 3) {
              showNotification('يرجى إدخال مكان عمل الكفيل بشكل صحيح', 'error');
              return false;
          }
          
          if (isNaN(guarantorSalary) || guarantorSalary <= 0) {
              showNotification('يرجى إدخال راتب الكفيل بشكل صحيح', 'error');
              return false;
          }
          
          // التحقق من المستندات المطلوبة للكفيل الأول
          if (loanSettings.requireAllDocuments) {
              const requiredDocuments = [
                  { id: 'guarantor-id-front', name: 'البطاقة الموحدة للكفيل (الوجه الأمامي)' },
                  { id: 'guarantor-id-back', name: 'البطاقة الموحدة للكفيل (الوجه الخلفي)' },
                  { id: 'guarantor-residence-front', name: 'بطاقة سكن الكفيل (الوجه الأمامي)' },
                  { id: 'guarantor-residence-back', name: 'بطاقة سكن الكفيل (الوجه الخلفي)' },
                  { id: 'guarantor-salary-certificate', name: 'تأييد براتب الكفيل' }
              ];
              
              for (const doc of requiredDocuments) {
                  const fileInput = document.getElementById(doc.id);
                  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                      showNotification(`يرجى إرفاق ${doc.name}`, 'error');
                      return false;
                  }
              }
          }
          
          // التحقق من الكفيل الثاني إذا كان مطلوباً
          const requireSecondGuarantor = loanSettings.requireSecondGuarantor[borrowerCategory];
          const hasSecondGuarantor = !document.getElementById('second-guarantor-section').classList.contains('hidden-section');
          
          if (requireSecondGuarantor && !hasSecondGuarantor) {
              showNotification('يجب إضافة كفيل ثاني لهذا النوع من القروض', 'error');
              return false;
          }
          
          // التحقق من معلومات الكفيل الثاني إذا كان موجوداً
          if (hasSecondGuarantor) {
              const guarantor2Name = document.getElementById('guarantor2-name').value;
              const guarantor2Phone = document.getElementById('guarantor2-phone').value;
              const guarantor2Address = document.getElementById('guarantor2-address').value;
              const guarantor2Workplace = document.getElementById('guarantor2-workplace').value;
              const guarantor2Salary = parseFloat(document.getElementById('guarantor2-salary').value);
              
              if (!guarantor2Name || guarantor2Name.trim().length < 3) {
                  showNotification('يرجى إدخال اسم الكفيل الثاني بشكل صحيح', 'error');
                  return false;
              }
              
              if (!guarantor2Phone || !/^\d{10,11}$/.test(guarantor2Phone.replace(/\s/g, ''))) {
                  showNotification('يرجى إدخال رقم هاتف الكفيل الثاني بشكل صحيح', 'error');
                  return false;
              }
              
              if (!guarantor2Address || guarantor2Address.trim().length < 5) {
                  showNotification('يرجى إدخال عنوان الكفيل الثاني بشكل صحيح', 'error');
                  return false;
              }
              
              if (!guarantor2Workplace || guarantor2Workplace.trim().length < 3) {
                  showNotification('يرجى إدخال مكان عمل الكفيل الثاني بشكل صحيح', 'error');
                  return false;
              }
              
              if (isNaN(guarantor2Salary) || guarantor2Salary <= 0) {
                  showNotification('يرجى إدخال راتب الكفيل الثاني بشكل صحيح', 'error');
                  return false;
              }
              
              // التحقق من المستندات المطلوبة للكفيل الثاني
              if (loanSettings.requireAllDocuments) {
                  const requiredDocuments = [
                      { id: 'guarantor2-id-front', name: 'البطاقة الموحدة للكفيل الثاني (الوجه الأمامي)' },
                      { id: 'guarantor2-id-back', name: 'البطاقة الموحدة للكفيل الثاني (الوجه الخلفي)' },
                      { id: 'guarantor2-residence-front', name: 'بطاقة سكن الكفيل الثاني (الوجه الأمامي)' },
                      { id: 'guarantor2-residence-back', name: 'بطاقة سكن الكفيل الثاني (الوجه الخلفي)' },
                      { id: 'guarantor2-salary-certificate', name: 'تأييد براتب الكفيل الثاني' }
                  ];
                  
                  for (const doc of requiredDocuments) {
                      const fileInput = document.getElementById(doc.id);
                      if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                          showNotification(`يرجى إرفاق ${doc.name}`, 'error');
                          return false;
                      }
                  }
              }
          }
          
          return true;
      }
      
      /**
       * تحديث بيانات المراجعة في الخطوة الرابعة
       */
      function updateLoanReviewData() {
          // معلومات القرض الأساسية
          const borrowerCategory = document.getElementById('borrower-category').value;
          const borrowerName = document.getElementById('borrower-name').value;
          const borrowerPhone = document.getElementById('borrower-phone').value;
          const borrowerAddress = document.getElementById('borrower-address').value;
          const loanAmount = parseFloat(document.getElementById('loan-amount').value);
          const interestRate = parseFloat(document.getElementById('interest-rate').value);
          const loanPeriod = parseInt(document.getElementById('loan-period').value);
          
          // تحديث عناصر المراجعة
          document.getElementById('review-borrower-category').textContent = getCategoryName(borrowerCategory);
          document.getElementById('review-borrower-name').textContent = borrowerName;
          document.getElementById('review-borrower-phone').textContent = borrowerPhone;
          document.getElementById('review-borrower-address').textContent = borrowerAddress;
          document.getElementById('review-loan-amount').textContent = formatCurrency(loanAmount);
          document.getElementById('review-interest-rate').textContent = `${interestRate}%`;
          document.getElementById('review-loan-period').textContent = `${loanPeriod} شهر`;
          
          // حساب القسط الشهري وإجمالي المبلغ
          const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanPeriod);
          const totalAmount = loanAmount + (loanAmount * interestRate / 100 * loanPeriod / 12);
          
          document.getElementById('review-monthly-payment').textContent = formatCurrency(monthlyPayment);
          document.getElementById('review-total-amount').textContent = formatCurrency(totalAmount);
          
          // معلومات الكفيل
          const guarantorName = document.getElementById('guarantor-name').value;
          document.getElementById('review-guarantor-name').textContent = guarantorName;
          
          // التحقق من المستندات
          const documentsStatus = loanSettings.requireAllDocuments ? 'مكتملة' : 'قيد المراجعة';
          document.getElementById('review-guarantor-documents').textContent = documentsStatus;
          
          // معلومات الكفيل الثاني
          const secondGuarantorSection = document.getElementById('second-guarantor-section');
          const hasSecondGuarantor = !secondGuarantorSection.classList.contains('hidden-section');
          
          if (hasSecondGuarantor) {
              const guarantor2Name = document.getElementById('guarantor2-name').value;
              document.getElementById('review-has-second-guarantor').textContent = guarantor2Name;
          } else {
              document.getElementById('review-has-second-guarantor').textContent = 'غير مضاف';
          }
      }
      
      /**
       * إعداد مستمعي الأحداث لحقول حساب القرض
       */
      function setupLoanCalculationListeners() {
          // حقول الحساب
          const loanAmountInput = document.getElementById('loan-amount');
          const interestRateInput = document.getElementById('interest-rate');
          const loanPeriodInput = document.getElementById('loan-period');
          
          // ملخص القرض
          const summaryAmount = document.getElementById('summary-amount');
          const summaryInterest = document.getElementById('summary-interest');
          const summaryTotal = document.getElementById('summary-total');
          const summaryMonthly = document.getElementById('summary-monthly');
          
          // تحديث الملخص عند تغيير أي حقل
          const updateLoanSummary = function() {
              const loanAmount = parseFloat(loanAmountInput.value) || 0;
              const interestRate = parseFloat(interestRateInput.value) || 0;
              const loanPeriod = parseInt(loanPeriodInput.value) || 0;
              
              // حساب قيمة الفوائد
              const interestValue = loanAmount * interestRate / 100 * loanPeriod / 12;
              
              // حساب إجمالي المبلغ
              const totalAmount = loanAmount + interestValue;
              
              // حساب القسط الشهري
              const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanPeriod);
              
              // تحديث عناصر الملخص
              summaryAmount.textContent = formatCurrency(loanAmount);
              summaryInterest.textContent = formatCurrency(interestValue);
              summaryTotal.textContent = formatCurrency(totalAmount);
              summaryMonthly.textContent = formatCurrency(monthlyPayment);
          };
          
          // إضافة مستمعي الأحداث
          if (loanAmountInput) loanAmountInput.addEventListener('input', updateLoanSummary);
          if (interestRateInput) interestRateInput.addEventListener('input', updateLoanSummary);
          if (loanPeriodInput) loanPeriodInput.addEventListener('input', updateLoanSummary);
          
          // التنفيذ الأولي
          updateLoanSummary();
      }
      
      /**
       * تحديث حدود القرض بناءً على فئة المقترض
       * @param {string} category - فئة المقترض
       */
      function updateLoanLimitsBasedOnCategory(category) {
          if (!category) return;
          
          // تحديث الحد الأقصى لمبلغ القرض
          const maxLoanAmount = loanSettings.maxLoanAmount[category];
          const maxLoanHint = document.getElementById('max-loan-hint');
          if (maxLoanHint) {
              maxLoanHint.textContent = `الحد الأقصى: ${formatCurrency(maxLoanAmount)}`;
          }
          
          // تحديث الحد الأدنى للراتب
          const minSalary = loanSettings.minSalary[category];
          const minSalaryHint = document.getElementById('min-salary-hint');
          if (minSalaryHint) {
              minSalaryHint.textContent = `الحد الأدنى: ${formatCurrency(minSalary)}`;
          }
          
          // تحديث نسبة الفائدة الافتراضية
          const defaultInterestRate = loanSettings.defaultInterestRate[category];
          const interestRateInput = document.getElementById('interest-rate');
          if (interestRateInput && (!interestRateInput.value || interestRateInput.value === '0')) {
              interestRateInput.value = defaultInterestRate;
          }
          
          // تحديث المدة الافتراضية للقرض
          const defaultLoanPeriod = loanSettings.defaultLoanPeriod[category];
          const loanPeriodInput = document.getElementById('loan-period');
          if (loanPeriodInput && (!loanPeriodInput.value || loanPeriodInput.value === '0')) {
              loanPeriodInput.value = defaultLoanPeriod;
          }
          
          // تحديث ملخص القرض
          const updateEvent = new Event('input');
          const loanAmountInput = document.getElementById('loan-amount');
          if (loanAmountInput) loanAmountInput.dispatchEvent(updateEvent);
          
          // التحقق من الكفيل الثاني الإجباري
          const requireSecondGuarantor = loanSettings.requireSecondGuarantor[category];
          const addSecondGuarantorBtn = document.getElementById('add-second-guarantor-btn');
          
          if (addSecondGuarantorBtn) {
              if (requireSecondGuarantor) {
                  addSecondGuarantorBtn.innerHTML = '<i class="fas fa-plus-circle"></i> إضافة كفيل ثاني (إلزامي)';
                  addSecondGuarantorBtn.classList.add('required-action');
              } else {
                  addSecondGuarantorBtn.innerHTML = '<i class="fas fa-plus-circle"></i> إضافة كفيل ثاني';
                  addSecondGuarantorBtn.classList.remove('required-action');
              }
          }
      }
      
      /**
       * إعداد مستمعي الأحداث لمعاينة الملفات
       */
      function setupFilePreviewListeners() {
          // العثور على جميع حقول تحميل الملفات
          const fileInputs = document.querySelectorAll('.file-input');
          
          fileInputs.forEach(input => {
              input.addEventListener('change', function(e) {
                  const previewId = this.id + '-preview';
                  const previewContainer = document.getElementById(previewId);
                  
                  if (!previewContainer) return;
                  
                  if (this.files && this.files[0]) {
                      const file = this.files[0];
                      
                      // التحقق من نوع الملف
                      if (file.type.match('image.*')) {
                          // معاينة الصورة
                          const reader = new FileReader();
                          
                          reader.onload = function(e) {
                              previewContainer.innerHTML = `<img src="${e.target.result}" alt="معاينة الملف">`;
                              previewContainer.classList.add('has-preview');
                          };
                          
                          reader.readAsDataURL(file);
                      } else if (file.type === 'application/pdf') {
                          // معاينة PDF
                          previewContainer.innerHTML = `
                              <div class="pdf-preview">
                                  <i class="fas fa-file-pdf"></i>
                                  <div class="file-info">
                                      <span>${file.name}</span>
                                      <span>${(file.size / 1024).toFixed(2)} KB</span>
                                  </div>
                              </div>
                          `;
                          previewContainer.classList.add('has-preview');
                      } else {
                          // معاينة ملف عادي
                          previewContainer.innerHTML = `
                              <div class="file-preview-generic">
                                  <i class="fas fa-file"></i>
                                  <div class="file-info">
                                      <span>${file.name}</span>
                                      <span>${(file.size / 1024).toFixed(2)} KB</span>
                                  </div>
                              </div>
                          `;
                          previewContainer.classList.add('has-preview');
                      }
                  } else {
                      // إزالة المعاينة
                      previewContainer.innerHTML = '';
                      previewContainer.classList.remove('has-preview');
                  }
              });
          });
      }
      
      /**
       * إعداد مستمعي الأحداث للكفيل الثاني
       */
      function setupSecondGuarantorListeners() {
          // أزرار إضافة/إزالة الكفيل الثاني
          const addSecondGuarantorBtn = document.getElementById('add-second-guarantor-btn');
          const removeSecondGuarantorBtn = document.getElementById('remove-second-guarantor-btn');
          const secondGuarantorSection = document.getElementById('second-guarantor-section');
          
          if (addSecondGuarantorBtn && secondGuarantorSection) {
              addSecondGuarantorBtn.addEventListener('click', function() {
                  // إظهار قسم الكفيل الثاني
                  secondGuarantorSection.classList.remove('hidden-section');
                  // إخفاء زر الإضافة
                  this.style.display = 'none';
              });
          }
          
          if (removeSecondGuarantorBtn && secondGuarantorSection) {
              removeSecondGuarantorBtn.addEventListener('click', function() {
                  // إخفاء قسم الكفيل الثاني
                  secondGuarantorSection.classList.add('hidden-section');
                  // إظهار زر الإضافة
                  if (addSecondGuarantorBtn) {
                      addSecondGuarantorBtn.style.display = 'block';
                  }
                  
                  // مسح البيانات المدخلة
                  const inputs = secondGuarantorSection.querySelectorAll('input');
                  inputs.forEach(input => {
                      if (input.type === 'text' || input.type === 'tel' || input.type === 'number') {
                          input.value = '';
                      } else if (input.type === 'file') {
                          input.value = '';
                          const previewId = input.id + '-preview';
                          const previewContainer = document.getElementById(previewId);
                          if (previewContainer) {
                              previewContainer.innerHTML = '';
                              previewContainer.classList.remove('has-preview');
                          }
                      }
                  });
              });
          }
      }
      
      /**
       * تقديم طلب القرض
       */
      function submitLoanApplication() {
          // التحقق من الموافقة على الشروط
          const agreementCheckbox = document.getElementById('loan-agreement');
          if (!agreementCheckbox || !agreementCheckbox.checked) {
              showNotification('يجب الموافقة على شروط وأحكام القرض', 'error');
              return;
          }
          
          // جمع بيانات القرض
          const loanData = collectLoanFormData();
          
          // إضافة حقول إضافية
          loanData.id = generateUniqueId();
          loanData.status = 'pending';
          loanData.createdAt = new Date().toISOString();
          
          // رفع المستندات المرفقة
          uploadLoanDocuments(loanData).then(updatedLoanData => {
              // إضافة القرض إلى القائمة
              if (addLoan(updatedLoanData)) {
                  // إظهار رسالة النجاح
                  showNotification('تم إرسال طلب القرض بنجاح', 'success');
                  
                  // إعادة تعيين النموذج
                  resetLoanForm();
                  
                  // الانتقال إلى صفحة القروض
                  setActivePage('loans');
              } else {
                  showNotification('حدث خطأ أثناء إرسال طلب القرض', 'error');
              }
          }).catch(error => {
              console.error('خطأ في رفع مستندات القرض:', error);
              showNotification('حدث خطأ أثناء رفع المستندات', 'error');
          });
      }
      
      /**
       * جمع بيانات نموذج القرض
       * @returns {Object} - بيانات القرض
       */
      function collectLoanFormData() {
          // بيانات القرض الأساسية
          const loanData = {
              borrowerCategory: document.getElementById('borrower-category').value,
              borrowerName: document.getElementById('borrower-name').value,
              borrowerPhone: document.getElementById('borrower-phone').value,
              borrowerAltPhone: document.getElementById('borrower-alt-phone').value,
              borrowerIdNumber: document.getElementById('borrower-id-number').value,
              borrowerAddress: document.getElementById('borrower-address').value,
              loanAmount: parseFloat(document.getElementById('loan-amount').value),
              interestRate: parseFloat(document.getElementById('interest-rate').value),
              loanPeriod: parseInt(document.getElementById('loan-period').value),
              
              // بيانات المقترض
              borrowerSalary: parseFloat(document.getElementById('borrower-salary').value),
              borrowerWorkplace: document.getElementById('borrower-workplace').value,
              borrowerWorkAddress: document.getElementById('borrower-work-address').value,
              borrowerServiceYears: parseFloat(document.getElementById('borrower-service-years').value),
              
              // بيانات الكفيل الأول
              guarantorName: document.getElementById('guarantor-name').value,
              guarantorPhone: document.getElementById('guarantor-phone').value,
              guarantorAltPhone: document.getElementById('guarantor-alt-phone').value,
              guarantorAddress: document.getElementById('guarantor-address').value,
              guarantorWorkplace: document.getElementById('guarantor-workplace').value,
              guarantorSalary: parseFloat(document.getElementById('guarantor-salary').value)
          };
          
          // التحقق من وجود كفيل ثاني
          const secondGuarantorSection = document.getElementById('second-guarantor-section');
          const hasSecondGuarantor = secondGuarantorSection && !secondGuarantorSection.classList.contains('hidden-section');
          
          loanData.hasSecondGuarantor = hasSecondGuarantor;
          
          if (hasSecondGuarantor) {
              // بيانات الكفيل الثاني
              loanData.guarantor2Name = document.getElementById('guarantor2-name').value;
              loanData.guarantor2Phone = document.getElementById('guarantor2-phone').value;
              loanData.guarantor2AltPhone = document.getElementById('guarantor2-alt-phone').value;
              loanData.guarantor2Address = document.getElementById('guarantor2-address').value;
              loanData.guarantor2Workplace = document.getElementById('guarantor2-workplace').value;
              loanData.guarantor2Salary = parseFloat(document.getElementById('guarantor2-salary').value);
          }
          
          return loanData;
      }
      
      /**
       * رفع مستندات القرض
       * @param {Object} loanData - بيانات القرض
       * @returns {Promise} - وعد بالانتهاء
       */
      async function uploadLoanDocuments(loanData) {
          // نسخة من بيانات القرض
          const updatedLoanData = { ...loanData };
          
          // قائمة المستندات للرفع
          const documents = [
              { field: 'borrowerIdFront', inputId: 'borrower-id-front' },
              { field: 'borrowerIdBack', inputId: 'borrower-id-back' },
              { field: 'borrowerResidenceFront', inputId: 'borrower-residence-front' },
              { field: 'borrowerResidenceBack', inputId: 'borrower-residence-back' },
              { field: 'borrowerSalaryCertificate', inputId: 'borrower-salary-certificate' },
              { field: 'borrowerWorkCertificate', inputId: 'borrower-work-certificate' },
              
              { field: 'guarantorIdFront', inputId: 'guarantor-id-front' },
              { field: 'guarantorIdBack', inputId: 'guarantor-id-back' },
              { field: 'guarantorResidenceFront', inputId: 'guarantor-residence-front' },
              { field: 'guarantorResidenceBack', inputId: 'guarantor-residence-back' },
              { field: 'guarantorSalaryCertificate', inputId: 'guarantor-salary-certificate' },
              { field: 'guarantorWorkCertificate', inputId: 'guarantor-work-certificate' }
          ];
          
          // إضافة مستندات الكفيل الثاني إذا كان موجوداً
          if (loanData.hasSecondGuarantor) {
              documents.push(
                  { field: 'guarantor2IdFront', inputId: 'guarantor2-id-front' },
                  { field: 'guarantor2IdBack', inputId: 'guarantor2-id-back' },
                  { field: 'guarantor2ResidenceFront', inputId: 'guarantor2-residence-front' },
                  { field: 'guarantor2ResidenceBack', inputId: 'guarantor2-residence-back' },
                  { field: 'guarantor2SalaryCertificate', inputId: 'guarantor2-salary-certificate' },
                  { field: 'guarantor2WorkCertificate', inputId: 'guarantor2-work-certificate' }
              );
          }
          
          // رفع المستندات بالتتابع
          for (const doc of documents) {
              const fileInput = document.getElementById(doc.inputId);
              
              if (fileInput && fileInput.files && fileInput.files.length > 0) {
                  const file = fileInput.files[0];
                  const fileExtension = file.name.split('.').pop().toLowerCase();
                  const fileName = `${loanData.id}_${doc.field}.${fileExtension}`;
                  const filePath = `loans/${loanData.id}/${fileName}`;
                  
                  try {
                      // رفع الملف
                      const fileUrl = await uploadFileToStorage(file, filePath);
                      
                      // تحديث البيانات
                      updatedLoanData[doc.field] = fileUrl;
                  } catch (error) {
                      console.error(`خطأ في رفع الملف ${doc.inputId}:`, error);
                  }
              }
          }
          
          return updatedLoanData;
      }
      
      /**
       * إعادة تعيين نموذج القرض
       */
      function resetLoanForm() {
          // إعادة تعيين النموذج
          document.querySelectorAll('.loan-form').forEach(form => {
              form.reset();
          });
          
          // إخفاء قسم الكفيل الثاني
          const secondGuarantorSection = document.getElementById('second-guarantor-section');
          if (secondGuarantorSection) {
              secondGuarantorSection.classList.add('hidden-section');
          }
          
          // إظهار زر إضافة الكفيل الثاني
          const addSecondGuarantorBtn = document.getElementById('add-second-guarantor-btn');
          if (addSecondGuarantorBtn) {
              addSecondGuarantorBtn.style.display = 'block';
          }
          
          // مسح معاينة الملفات
          document.querySelectorAll('.file-preview').forEach(preview => {
              preview.innerHTML = '';
              preview.classList.remove('has-preview');
          });
          
          // العودة إلى الخطوة الأولى
          goToLoanStep(1);
      }
      
      /**
       * إعداد مستمعي أحداث صفحة الإعدادات
       */
      function setupLoanSettingsEventListeners() {
          // تبديل التبويبات
          document.querySelectorAll('.tab-btn').forEach(button => {
              button.addEventListener('click', function() {
                  // إزالة الكلاس النشط من جميع الأزرار والمحتويات
                  document.querySelectorAll('.tab-btn').forEach(btn => {
                      btn.classList.remove('active');
                  });
                  document.querySelectorAll('.tab-content').forEach(content => {
                      content.classList.remove('active');
                  });
                  
                  // إضافة الكلاس النشط للزر المحدد
                  this.classList.add('active');
                  
                  // إظهار المحتوى المناسب
                  const tabId = this.getAttribute('data-tab');
                  const tabContent = document.querySelector(`.tab-content[data-tab="${tabId}"]`);
                  if (tabContent) {
                      tabContent.classList.add('active');
                  }
              });
          });
          
          // حفظ الإعدادات
          const saveSettingsBtn = document.getElementById('save-loan-settings-btn');
          if (saveSettingsBtn) {
              saveSettingsBtn.addEventListener('click', saveLoanSettingsFromForm);
          }
          
          // استعادة الإعدادات الافتراضية
          const resetSettingsBtn = document.getElementById('reset-loan-settings-btn');
          if (resetSettingsBtn) {
              resetSettingsBtn.addEventListener('click', function() {
                  if (confirm('هل أنت متأكد من استعادة الإعدادات الافتراضية؟')) {
                      resetLoanSettings();
                  }
              });
          }
          
          // تحديث حالة إعدادات Firebase
          const useFirebaseDB = document.getElementById('settings-use-firebase-db');
          const useFirebaseStorage = document.getElementById('settings-use-firebase-storage');
          const firebaseConfigSection = document.getElementById('firebase-config-section');
          
          function updateFirebaseVisibility() {
              if (useFirebaseDB.checked || useFirebaseStorage.checked) {
                  firebaseConfigSection.style.display = 'block';
              } else {
                  firebaseConfigSection.style.display = 'none';
              }
          }
          
          if (useFirebaseDB && useFirebaseStorage && firebaseConfigSection) {
              useFirebaseDB.addEventListener('change', updateFirebaseVisibility);
              useFirebaseStorage.addEventListener('change', updateFirebaseVisibility);
              updateFirebaseVisibility();
          }
          
          // تحميل الإعدادات الحالية إلى النموذج
          loadLoanSettingsToForm();
      }
      
      /**
       * تحميل إعدادات القروض إلى النموذج
       */
      function loadLoanSettingsToForm() {
          // الإعدادات العامة
          document.getElementById('settings-loan-notifications').checked = loanSettings.enableNotifications;
          document.getElementById('settings-require-all-documents').checked = loanSettings.requireAllDocuments;
          
          // إعدادات الفئات
          const categories = ['kasb', 'employee', 'military', 'social'];
          
          categories.forEach(category => {
              // الحد الأقصى لمبلغ القرض
              document.getElementById(`settings-${category}-max-amount`).value = loanSettings.maxLoanAmount[category];
              
              // نسبة الفائدة الافتراضية
              document.getElementById(`settings-${category}-interest-rate`).value = loanSettings.defaultInterestRate[category];
              
              // المدة الافتراضية للقرض
              document.getElementById(`settings-${category}-period`).value = loanSettings.defaultLoanPeriod[category];
              
              // الحد الأدنى للراتب
              document.getElementById(`settings-${category}-min-salary`).value = loanSettings.minSalary[category];
              
              // نسبة القرض للراتب القصوى
              document.getElementById(`settings-${category}-loan-salary-ratio`).value = loanSettings.maxLoanToSalaryRatio[category];
              
              // كفيل ثاني إجباري
              document.getElementById(`settings-${category}-second-guarantor`).checked = loanSettings.requireSecondGuarantor[category];
          });
          
          // إعدادات Firebase
          document.getElementById('settings-use-firebase-db').checked = loanSettings.useFirebaseDB;
          document.getElementById('settings-use-firebase-storage').checked = loanSettings.useFirebaseStorage;
          
          document.getElementById('settings-firebase-api-key').value = loanSettings.firebaseConfig.apiKey || '';
          document.getElementById('settings-firebase-auth-domain').value = loanSettings.firebaseConfig.authDomain || '';
          document.getElementById('settings-firebase-project-id').value = loanSettings.firebaseConfig.projectId || '';
          document.getElementById('settings-firebase-storage-bucket').value = loanSettings.firebaseConfig.storageBucket || '';
          document.getElementById('settings-firebase-messaging-sender-id').value = loanSettings.firebaseConfig.messagingSenderId || '';
          document.getElementById('settings-firebase-app-id').value = loanSettings.firebaseConfig.appId || '';
      }
      
      /**
       * حفظ إعدادات القروض من النموذج
       */
      function saveLoanSettingsFromForm() {
          // نسخة من الإعدادات الحالية
          const newSettings = { ...loanSettings };
          
          // الإعدادات العامة
          newSettings.enableNotifications = document.getElementById('settings-loan-notifications').checked;
          newSettings.requireAllDocuments = document.getElementById('settings-require-all-documents').checked;
          
          // إعدادات الفئات
          const categories = ['kasb', 'employee', 'military', 'social'];
          
          categories.forEach(category => {
              // الحد الأقصى لمبلغ القرض
              newSettings.maxLoanAmount[category] = parseFloat(document.getElementById(`settings-${category}-max-amount`).value);
              
              // نسبة الفائدة الافتراضية
              newSettings.defaultInterestRate[category] = parseFloat(document.getElementById(`settings-${category}-interest-rate`).value);
              
              // المدة الافتراضية للقرض
              newSettings.defaultLoanPeriod[category] = parseInt(document.getElementById(`settings-${category}-period`).value);
              
              // الحد الأدنى للراتب
              newSettings.minSalary[category] = parseFloat(document.getElementById(`settings-${category}-min-salary`).value);
              
              // نسبة القرض للراتب القصوى
              newSettings.maxLoanToSalaryRatio[category] = parseFloat(document.getElementById(`settings-${category}-loan-salary-ratio`).value);
              
              // كفيل ثاني إجباري
              newSettings.requireSecondGuarantor[category] = document.getElementById(`settings-${category}-second-guarantor`).checked;
          });
          
          // إعدادات Firebase
          newSettings.useFirebaseDB = document.getElementById('settings-use-firebase-db').checked;
          newSettings.useFirebaseStorage = document.getElementById('settings-use-firebase-storage').checked;
          
          newSettings.firebaseConfig = {
              apiKey: document.getElementById('settings-firebase-api-key').value,
              authDomain: document.getElementById('settings-firebase-auth-domain').value,
              projectId: document.getElementById('settings-firebase-project-id').value,
              storageBucket: document.getElementById('settings-firebase-storage-bucket').value,
              messagingSenderId: document.getElementById('settings-firebase-messaging-sender-id').value,
              appId: document.getElementById('settings-firebase-app-id').value
          };
          
          // تطبيق الإعدادات الجديدة
          Object.assign(loanSettings, newSettings);
          
          // حفظ الإعدادات
          if (saveLoanSettings()) {
              showNotification('تم حفظ إعدادات القروض بنجاح', 'success');
          } else {
              showNotification('حدث خطأ أثناء حفظ الإعدادات', 'error');
          }
      }
      
      /**
       * إعادة تعيين إعدادات القروض إلى الافتراضية
       */
      function resetLoanSettings() {
          // إعدادات القروض الافتراضية
          const defaultSettings = {
              enableNotifications: true,           // تفعيل الإشعارات
              maxLoanAmount: {                     // الحد الأقصى لمبلغ القرض حسب الفئة
                  kasb: 10000000,                  // كاسب
                  employee: 5000000,               // موظف
                  military: 7000000,               // عسكري
                  social: 3000000                  // رعاية اجتماعية
              },
              defaultInterestRate: {               // نسبة الفائدة الافتراضية حسب الفئة
                  kasb: 8,                         // كاسب
                  employee: 6,                     // موظف
                  military: 5,                     // عسكري
                  social: 4                        // رعاية اجتماعية
              },
              defaultLoanPeriod: {                 // المدة الافتراضية للقرض (بالأشهر)
                  kasb: 24,                        // كاسب
                  employee: 36,                    // موظف
                  military: 36,                    // عسكري
                  social: 24                       // رعاية اجتماعية
              },
              requireSecondGuarantor: {            // هل يتطلب كفيل ثاني إجباري؟
                  kasb: true,                      // كاسب
                  employee: false,                 // موظف
                  military: false,                 // عسكري
                  social: true                     // رعاية اجتماعية
              },
              minSalary: {                         // الحد الأدنى للراتب
                  kasb: 500000,                    // كاسب
                  employee: 500000,                // موظف
                  military: 600000,                // عسكري
                  social: 300000                   // رعاية اجتماعية
              },
              maxLoanToSalaryRatio: {              // نسبة القرض للراتب القصوى
                  kasb: 15,                        // كاسب (القرض يمكن أن يكون 15 ضعف الراتب)
                  employee: 12,                    // موظف
                  military: 12,                    // عسكري
                  social: 8                        // رعاية اجتماعية
              },
              autoSaveEnabled: true,               // حفظ تلقائي
              requireAllDocuments: true,           // طلب جميع المستندات إجباري
              useFirebaseStorage: false,           // استخدام تخزين Firebase
              useFirebaseDB: false,                // استخدام قاعدة بيانات Firebase
              firebaseConfig: {                    // إعدادات Firebase (يجب تعديلها)
                  apiKey: "",
                  authDomain: "",
                  projectId: "",
                  storageBucket: "",
                  messagingSenderId: "",
                  appId: ""
              }
          };
          
          // تطبيق الإعدادات الافتراضية
          Object.assign(loanSettings, defaultSettings);
          
          // حفظ الإعدادات
          if (saveLoanSettings()) {
              showNotification('تم استعادة إعدادات القروض الافتراضية بنجاح', 'success');
              
              // تحميل الإعدادات الافتراضية إلى النموذج
              loadLoanSettingsToForm();
          } else {
              showNotification('حدث خطأ أثناء استعادة الإعدادات الافتراضية', 'error');
          }
      }
      
      /**
       * عرض إشعار في النظام
       * @param {string} message - نص الإشعار
       * @param {string} type - نوع الإشعار (success, error, warning, info)
       */
      function showNotification(message, type = 'info') {
          if (typeof window.showNotification === 'function') {
              window.showNotification(message, type);
          } else {
              const notificationContainer = document.querySelector('.notification-container');
              
              if (!notificationContainer) {
                  const container = document.createElement('div');
                  container.className = 'notification-container';
                  document.body.appendChild(container);
              }
              
              // إنشاء الإشعار
              const notification = document.createElement('div');
              notification.className = `notification notification-${type} animate__animated animate__fadeInUp`;
              
              // اختيار أيقونة الإشعار
              let icon = 'info-circle';
              
              switch (type) {
                  case 'success':
                      icon = 'check-circle';
                      break;
                  case 'error':
                      icon = 'times-circle';
                      break;
                  case 'warning':
                      icon = 'exclamation-triangle';
                      break;
              }
              
              // محتوى الإشعار
              notification.innerHTML = `
                  <div class="notification-icon">
                      <i class="fas fa-${icon}"></i>
                  </div>
                  <div class="notification-content">
                      <div class="notification-message">${message}</div>
                  </div>
                  <button class="notification-close">
                      <i class="fas fa-times"></i>
                  </button>
              `;
              
              // إضافة الإشعار إلى الحاوية
              const container = document.querySelector('.notification-container');
              container.appendChild(notification);
              
              // زر إغلاق الإشعار
              const closeButton = notification.querySelector('.notification-close');
              closeButton.addEventListener('click', function() {
                  notification.classList.replace('animate__fadeInUp', 'animate__fadeOutDown');
                  setTimeout(() => {
                      notification.remove();
                  }, 500);
              });
              
              // إزالة الإشعار تلقائياً بعد فترة
              setTimeout(() => {
                  notification.classList.replace('animate__fadeInUp', 'animate__fadeOutDown');
                  setTimeout(() => {
                      notification.remove();
                  }, 500);
              }, 5000);
          }
      }
      
      /**
       * تقسيم العناصر إلى صفحات
       * @param {Array} items - العناصر
       * @param {number} currentPage - الصفحة الحالية
       * @param {number} perPage - عدد العناصر في الصفحة
       * @returns {Array} - العناصر في الصفحة الحالية
       */
      function paginateItems(items, currentPage, perPage) {
          const startIndex = (currentPage - 1) * perPage;
          const endIndex = startIndex + perPage;
          
          return items.slice(startIndex, endIndex);
      }
      
      /**
       * تحديث عناصر الترقيم
       * @param {string} paginationId - معرف حاوية الترقيم
       * @param {Array} items - العناصر
       * @param {number} currentPage - الصفحة الحالية
       * @param {number} perPage - عدد العناصر في الصفحة
       */
      function updatePagination(paginationId, items, currentPage, perPage) {
          const paginationContainer = document.getElementById(paginationId);
          
          if (!paginationContainer) return;
          
          // حساب عدد الصفحات
          const totalPages = Math.ceil(items.length / perPage);
          
          // إذا كانت هناك صفحة واحدة فقط، إخفاء الترقيم
          if (totalPages <= 1) {
              paginationContainer.innerHTML = '';
              return;
          }
          
          // إنشاء أزرار الترقيم
          let paginationHTML = '';
          
          // زر الصفحة السابقة
          paginationHTML += `
              <button class="pagination-btn prev-btn ${currentPage === 1 ? 'disabled' : ''}" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
                  <i class="fas fa-chevron-right"></i>
              </button>
          `;
          
          // زر الصفحة الأولى
          paginationHTML += `
              <button class="pagination-btn page-btn ${currentPage === 1 ? 'active' : ''}" data-page="1">1</button>
          `;
          
          // النقاط الأولى
          if (currentPage > 3) {
              paginationHTML += '<span class="pagination-dots">...</span>';
          }
          
          // الصفحات الوسطى
          for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
              paginationHTML += `
                  <button class="pagination-btn page-btn ${currentPage === i ? 'active' : ''}" data-page="${i}">${i}</button>
              `;
          }
          
          // النقاط الثانية
          if (currentPage < totalPages - 2) {
              paginationHTML += '<span class="pagination-dots">...</span>';
          }
          
          // زر الصفحة الأخيرة (إذا كان هناك أكثر من صفحة واحدة)
          if (totalPages > 1) {
              paginationHTML += `
                  <button class="pagination-btn page-btn ${currentPage === totalPages ? 'active' : ''}" data-page="${totalPages}">${totalPages}</button>
              `;
          }
          
          // زر الصفحة التالية
          paginationHTML += `
              <button class="pagination-btn next-btn ${currentPage === totalPages ? 'disabled' : ''}" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
                  <i class="fas fa-chevron-left"></i>
              </button>
          `;
          
          // تحديث المحتوى
          paginationContainer.innerHTML = paginationHTML;
          
          // إضافة مستمعي الأحداث لأزرار الترقيم
          setupPaginationEventListeners(paginationId);
      }
      
      /**
       * إعداد مستمعي أحداث أزرار الترقيم
       * @param {string} paginationId - معرف حاوية الترقيم
       */
      function setupPaginationEventListeners(paginationId) {
          // الحصول على أزرار الترقيم
          const paginationButtons = document.querySelectorAll(`#${paginationId} .pagination-btn`);
          
          // إضافة مستمعي الأحداث
          paginationButtons.forEach(button => {
              button.addEventListener('click', function() {
                  if (this.classList.contains('disabled')) return;
                  
                  // الحصول على رقم الصفحة
                  const page = parseInt(this.getAttribute('data-page'));
                  
                  // تحديث الصفحة الحالية حسب نوع الصفحة
                  switch (paginationId) {
                      case 'loans-pagination':
                          currentLoanPage = page;
                          renderLoansTable();
                          break;
                      case 'approved-loans-pagination':
                          renderApprovedLoansTable();
                          break;
                      case 'rejected-loans-pagination':
                          renderRejectedLoansTable();
                          break;
                  }
              });
          });
      }
      
      /**
       * فتح نافذة منبثقة
       * @param {string} modalId - معرف النافذة
       */
      function openModal(modalId) {
          const modal = document.getElementById(modalId);
          
          if (!modal) return;
          
          modal.style.display = 'flex';
          
          // تأخير صغير لإضافة الفئة المتحركة
          setTimeout(() => {
              const modalContent = modal.querySelector('.modal');
              if (modalContent) {
                  modalContent.classList.add('animate__fadeInUp');
                  modalContent.classList.remove('animate__fadeOutDown');
              }
          }, 10);
      }
      
      /**
       * إغلاق نافذة منبثقة
       * @param {string} modalId - معرف النافذة
       */
      function closeModal(modalId) {
          const modal = document.getElementById(modalId);
          
          if (!modal) return;
          
          // إضافة فئة الخروج بالتأثير
          const modalContent = modal.querySelector('.modal');
          if (modalContent) {
              modalContent.classList.remove('animate__fadeInUp');
              modalContent.classList.add('animate__fadeOutDown');
          }
          
          // تأخير قبل إخفاء النافذة
          setTimeout(() => {
              modal.style.display = 'none';
          }, 300);
      }
      
      /**
       * تعيين الصفحة النشطة
       * @param {string} pageId - معرف الصفحة
       */
      function setActivePage(pageId) {
          // إخفاء جميع الصفحات
          document.querySelectorAll('.page').forEach(page => {
              page.style.display = 'none';
          });
          
          // إظهار الصفحة المطلوبة
          const activePage = document.getElementById(`${pageId}-page`);
          if (activePage) {
              activePage.style.display = 'block';
          }
          
          // تحديث القائمة الجانبية
          document.querySelectorAll('.nav-link').forEach(link => {
              link.classList.remove('active');
          });
          
          const activeLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
          if (activeLink) {
              activeLink.classList.add('active');
              
              // في حالة الشاشات الصغيرة
              if (window.innerWidth < 992) {
                  const sidebar = document.querySelector('.sidebar');
                  if (sidebar && sidebar.classList.contains('expanded')) {
                      sidebar.classList.remove('expanded');
                  }
              }
          }
          
          // تحديث عنوان الصفحة
          updatePageTitle(pageId);
          
          // تحديث البيانات حسب الصفحة
          switch (pageId) {
              case 'loans':
                  renderLoansTable();
                  updateLoanDashboardStats();
                  break;
              case 'approved-loans':
                  renderApprovedLoansTable();
                  break;
              case 'rejected-loans':
                  renderRejectedLoansTable();
                  break;
              case 'add-loan':
                  resetLoanForm();
                  break;
          }
      }
      
      /**
       * تحديث عنوان الصفحة
       * @param {string} pageId - معرف الصفحة
       */
      function updatePageTitle(pageId) {
          let title = '';
          
          switch (pageId) {
              case 'loans':
                  title = 'القروض النشطة';
                  break;
              case 'add-loan':
                  title = 'إضافة قرض جديد';
                  break;
              case 'approved-loans':
                  title = 'القروض الموافق عليها';
                  break;
              case 'rejected-loans':
                  title = 'القروض المرفوضة';
                  break;
              case 'loan-settings':
                  title = 'إعدادات نظام القروض';
                  break;
              default:
                  return;
          }
          
          // تحديث عنوان الصفحة
          document.title = `${title} - نظام الإدارة`;
          
          // تحديث عنوان الصفحة في الواجهة
          const pageTitle = document.querySelector('.page-title');
          if (pageTitle) {
              pageTitle.textContent = title;
          }
      }
      
      // تصدير الوظائف والمتغيرات اللازمة
      window.LoanSystem = {
          initLoanSystem,
          addLoan,
          updateLoan,
          approveLoan,
          rejectLoan,
          deleteLoan,
          calculateMonthlyPayment,
          createInstallmentsForLoan,
          renderLoansTable,
          renderApprovedLoansTable,
          renderRejectedLoansTable,
          setupLoanEventListeners,
          setActivePage
      };
      
      // تهيئة النظام عند تحميل الصفحة
      document.addEventListener('DOMContentLoaded', function() {
          console.log('تهيئة نظام القروض...');
          initLoanSystem();
          
          // تحديث علامات العملة
          updateCurrencyDisplay();
      });
      
      // إعلان النظام عالمياً
      if (typeof window.loadedModules === 'undefined') {
          window.loadedModules = {};
      }
      window.loadedModules.loanSystem = true;
      
      })();




      /**
 * إصلاح مشاكل الاستجابة في نظام القروض - الإصدار 1.0.2
 * 
 * هذا الملف يحتوي على إصلاحات وتحسينات لمعالجة مشاكل استجابة الأزرار في نظام القروض
 * خاصة في معالج إضافة القرض حيث لا يستجيب زر "التالي" للانتقال بين الخطوات
 * 
 * تاريخ التحديث: مايو 2025
 */

/**
 * دالة مساعدة لإعادة تأسيس مستمع الحدث للزر
 * تعريف الدالة قبل استخدامها في الدوال الأخرى
 */
window.rebindButtonEvent = function(buttonId, eventHandler) {
    const button = document.getElementById(buttonId);
    
    if (!button) {
        console.warn(`لم يتم العثور على الزر بالمعرف: ${buttonId}`);
        return false;
    }
    
    // إزالة المستمعين السابقين
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    // إضافة مستمع جديد
    newButton.addEventListener('click', function(e) {
        e.preventDefault();
        console.log(`تم النقر على الزر: ${buttonId}`);
        eventHandler.call(this, e);
    });
    
    return true;
};

/**
 * تحسين دالة تنسيق العملة
 */
window.formatCurrency = function(amount, addCurrency = true) {
    // التأكد من أن القيمة رقمية
    amount = parseFloat(amount);
    
    if (isNaN(amount)) return '0';
    
    // تقريب المبلغ إلى أقرب قيمتين عشريتين
    amount = Math.round(amount * 100) / 100;
    
    try {
        // تنسيق المبلغ باستخدام الفواصل للآلاف
        const formatted = amount.toLocaleString('ar-SA', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
        
        // إضافة العملة إذا كان مطلوبًا
        const currency = (window.settings?.currency || 'دينار');
        return addCurrency ? `${formatted} ${currency}` : formatted;
    } catch (error) {
        // في حالة حدوث خطأ، استخدم طريقة تنسيق بسيطة
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (addCurrency ? ' دينار' : '');
    }
};

/**
 * تحسين دالة حساب القسط الشهري
 */
window.calculateMonthlyPayment = function(loanAmount, interestRate, loanPeriod) {
    // حماية من القيم غير الصالحة
    loanAmount = parseFloat(loanAmount) || 0;
    interestRate = parseFloat(interestRate) || 0;
    loanPeriod = parseInt(loanPeriod) || 1;
    
    // تحويل نسبة الفائدة السنوية إلى شهرية
    const monthlyRate = interestRate / 100 / 12;
    
    // حساب إجمالي المبلغ مع الفائدة
    const totalAmount = loanAmount + (loanAmount * interestRate / 100 * loanPeriod / 12);
    
    // حساب القسط الشهري (القسط الثابت) - المبلغ الإجمالي مقسوم على عدد الأشهر
    return Math.round((totalAmount / loanPeriod) * 100) / 100;
};

/**
 * تحسين دالة عرض الإشعارات
 */
window.showNotification = function(message, type = 'info') {
    console.log(`عرض إشعار (${type}): ${message}`);
    
    // التحقق من وجود دالة عرض الإشعارات في النظام
    if (typeof window.showSystemNotification === 'function') {
        return window.showSystemNotification(message, type);
    }
    
    const notificationContainer = document.querySelector('.notification-container');
    
    if (!notificationContainer) {
        // إنشاء حاوية الإشعارات إذا لم تكن موجودة
        const container = document.createElement('div');
        container.className = 'notification-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.left = '20px';
        container.style.zIndex = '9999';
        container.style.direction = 'rtl';
        document.body.appendChild(container);
    }
    
    // إنشاء الإشعار
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} animate__animated animate__fadeInUp`;
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.background = type === 'success' ? '#10b981' : 
                                   type === 'error' ? '#ef4444' : 
                                   type === 'warning' ? '#f59e0b' : '#3b82f6';
    notification.style.color = 'white';
    notification.style.padding = '15px';
    notification.style.borderRadius = '5px';
    notification.style.margin = '10px 0';
    notification.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    notification.style.maxWidth = '350px';
    
    // اختيار أيقونة الإشعار
    let icon = 'info-circle';
    
    switch (type) {
        case 'success':
            icon = 'check-circle';
            break;
        case 'error':
            icon = 'times-circle';
            break;
        case 'warning':
            icon = 'exclamation-triangle';
            break;
    }
    
    // محتوى الإشعار
    notification.innerHTML = `
        <div class="notification-icon" style="margin-left: 12px;">
            <i class="fas fa-${icon}" style="font-size: 24px;"></i>
        </div>
        <div class="notification-content" style="flex: 1;">
            <div class="notification-message" style="font-size: 14px; font-weight: 500;">${message}</div>
        </div>
        <button class="notification-close" style="background: none; border: none; color: white; cursor: pointer;">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // إضافة الإشعار إلى الحاوية
    const container = document.querySelector('.notification-container');
    container.appendChild(notification);
    
    // زر إغلاق الإشعار
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', function() {
        notification.classList.replace('animate__fadeInUp', 'animate__fadeOutDown');
        setTimeout(() => {
            notification.remove();
        }, 500);
    });
    
    // إزالة الإشعار تلقائياً بعد فترة
    setTimeout(() => {
        notification.classList.replace('animate__fadeInUp', 'animate__fadeOutDown');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 5000);
};

/**
 * الحصول على اسم الفئة
 */
window.getCategoryName = function(category) {
    switch (category) {
        case 'kasb': return 'كاسب';
        case 'employee': return 'موظف';
        case 'military': return 'عسكري';
        case 'social': return 'رعاية اجتماعية';
        default: return category || '';
    }
};

/**
 * استدعاء هذه الدالة في بداية تحميل الصفحة لإصلاح مشاكل الاستجابة
 */
function fixLoanSystemButtonIssues() {
    console.log('جاري تطبيق إصلاحات استجابة أزرار نظام القروض...');
    
    // الانتظار حتى تحميل DOM بالكامل
    document.addEventListener('DOMContentLoaded', function() {
        // إصلاح مشاكل معالج إضافة القرض (الأولوية القصوى)
        fixLoanWizardNavigation();
        
        // إصلاح مشاكل تبويبات تفاصيل القرض
        fixLoanDetailsTabs();
        
        // إصلاح مشاكل النوافذ المنبثقة
        fixModalInteractions();
        
        // إصلاح مشاكل عامة في الاستجابة
        fixGeneralButtonResponsiveness();
        
        console.log('تم تطبيق إصلاحات استجابة أزرار نظام القروض بنجاح');
    });
    
    // تطبيق الإصلاحات مباشرة في حالة تحميل DOM بالفعل
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        fixLoanWizardNavigation();
        fixLoanDetailsTabs();
        fixModalInteractions();
        fixGeneralButtonResponsiveness();
        
        console.log('تم تطبيق إصلاحات استجابة أزرار نظام القروض بنجاح (تطبيق فوري)');
    }
}

/**
 * إصلاح مشاكل التنقل في معالج إضافة القرض
 */
function fixLoanWizardNavigation() {
    console.log('إصلاح مشاكل التنقل في معالج إضافة القرض...');
    
    // تحسين دالة التنقل بين الخطوات
    window.goToLoanStep = function(stepNumber) {
        console.log(`الانتقال إلى الخطوة ${stepNumber}`);
        
        // التأكد من وجود العناصر الضرورية
        const wizardSteps = document.querySelectorAll('.wizard-step');
        const contentSteps = document.querySelectorAll('.wizard-content-step');
        
        if (!wizardSteps.length || !contentSteps.length) {
            console.error('لم يتم العثور على عناصر معالج إضافة القرض');
            return;
        }
        
        // تحديث الخطوات
        wizardSteps.forEach(step => {
            const stepNum = parseInt(step.getAttribute('data-step'));
            
            step.classList.remove('active', 'completed');
            
            if (stepNum === stepNumber) {
                step.classList.add('active');
            } else if (stepNum < stepNumber) {
                step.classList.add('completed');
            }
        });
        
        // تحديث المحتوى
        contentSteps.forEach(content => {
            const contentStepNum = parseInt(content.getAttribute('data-step'));
            
            content.classList.remove('active');
            
            if (contentStepNum === stepNumber) {
                content.classList.add('active');
                // إضافة تأخير صغير للتأكد من عرض المحتوى بشكل صحيح
                setTimeout(() => {
                    content.style.display = 'block';
                }, 50);
            } else {
                content.style.display = 'none';
            }
        });
    };
    
    // إعادة التأسيس لمستمعي الأحداث في معالج إضافة القرض
    function rebindWizardEventListeners() {
        // أزرار "التالي" لكل خطوة
        rebindButtonEvent('loan-info-next', function() {
            console.log('تم النقر على زر التالي في الخطوة الأولى');
            if (validateLoanInfoStep()) {
                window.goToLoanStep(2);
            }
        });
        
        rebindButtonEvent('borrower-info-next', function() {
            console.log('تم النقر على زر التالي في الخطوة الثانية');
            if (validateBorrowerInfoStep()) {
                window.goToLoanStep(3);
            }
        });
        
        rebindButtonEvent('borrower-info-prev', function() {
            console.log('تم النقر على زر السابق في الخطوة الثانية');
            window.goToLoanStep(1);
        });
        
        rebindButtonEvent('guarantor-info-next', function() {
            console.log('تم النقر على زر التالي في الخطوة الثالثة');
            if (validateGuarantorInfoStep()) {
                window.goToLoanStep(4);
                updateLoanReviewData();
            }
        });
        
        rebindButtonEvent('guarantor-info-prev', function() {
            console.log('تم النقر على زر السابق في الخطوة الثالثة');
            window.goToLoanStep(2);
        });
        
        rebindButtonEvent('review-prev', function() {
            console.log('تم النقر على زر السابق في الخطوة الرابعة');
            window.goToLoanStep(3);
        });
        
        rebindButtonEvent('review-loan-btn', function() {
            console.log('تم النقر على زر مراجعة وإرسال طلب القرض');
            window.goToLoanStep(4);
            updateLoanReviewData();
        });
        
        // إضافة مستمعي الأحداث لخطوات المعالج
        document.querySelectorAll('.wizard-step').forEach(step => {
            step.addEventListener('click', function() {
                const currentStep = parseInt(document.querySelector('.wizard-step.active')?.getAttribute('data-step') || '1');
                const targetStep = parseInt(this.getAttribute('data-step'));
                
                console.log(`تم النقر على الخطوة ${targetStep}، الخطوة الحالية: ${currentStep}`);
                
                // السماح بالانتقال إلى الخطوات السابقة فقط
                if (targetStep < currentStep) {
                    window.goToLoanStep(targetStep);
                } else if (targetStep > currentStep) {
                    // التحقق من الخطوات السابقة عند محاولة الانتقال للأمام
                    let isValid = true;
                    
                    for (let i = currentStep; i < targetStep; i++) {
                        switch (i) {
                            case 1:
                                isValid = validateLoanInfoStep();
                                break;
                            case 2:
                                isValid = validateBorrowerInfoStep();
                                break;
                            case 3:
                                isValid = validateGuarantorInfoStep();
                                break;
                        }
                        
                        if (!isValid) break;
                    }
                    
                    if (isValid) {
                        window.goToLoanStep(targetStep);
                        if (targetStep === 4) {
                            updateLoanReviewData();
                        }
                    }
                }
            });
        });
    }
    
    // إعادة تأسيس مستمعي الأحداث للكفيل الثاني
    function rebindSecondGuarantorListeners() {
        const addSecondGuarantorBtn = document.getElementById('add-second-guarantor-btn');
        const removeSecondGuarantorBtn = document.getElementById('remove-second-guarantor-btn');
        const secondGuarantorSection = document.getElementById('second-guarantor-section');
        
        if (addSecondGuarantorBtn && secondGuarantorSection) {
            addSecondGuarantorBtn.addEventListener('click', function() {
                console.log('تم النقر على زر إضافة كفيل ثاني');
                // إظهار قسم الكفيل الثاني
                secondGuarantorSection.classList.remove('hidden-section');
                secondGuarantorSection.style.display = 'block';
                // إخفاء زر الإضافة
                this.style.display = 'none';
            });
        }
        
        if (removeSecondGuarantorBtn && secondGuarantorSection) {
            removeSecondGuarantorBtn.addEventListener('click', function() {
                console.log('تم النقر على زر إزالة كفيل ثاني');
                // إخفاء قسم الكفيل الثاني
                secondGuarantorSection.classList.add('hidden-section');
                secondGuarantorSection.style.display = 'none';
                // إظهار زر الإضافة
                if (addSecondGuarantorBtn) {
                    addSecondGuarantorBtn.style.display = 'block';
                }
                
                // مسح البيانات المدخلة
                const inputs = secondGuarantorSection.querySelectorAll('input');
                inputs.forEach(input => {
                    if (input.type === 'text' || input.type === 'tel' || input.type === 'number') {
                        input.value = '';
                    } else if (input.type === 'file') {
                        input.value = '';
                        const previewId = input.id + '-preview';
                        const previewContainer = document.getElementById(previewId);
                        if (previewContainer) {
                            previewContainer.innerHTML = '';
                            previewContainer.classList.remove('has-preview');
                        }
                    }
                });
            });
        }
    }
    
    // تحسين تدفق التحقق من الخطوة الأولى
    window.validateLoanInfoStep = function() {
        console.log('التحقق من بيانات الخطوة الأولى...');
        
        const borrowerCategory = document.getElementById('borrower-category')?.value;
        const borrowerName = document.getElementById('borrower-name')?.value;
        const borrowerPhone = document.getElementById('borrower-phone')?.value;
        const borrowerIdNumber = document.getElementById('borrower-id-number')?.value;
        const borrowerAddress = document.getElementById('borrower-address')?.value;
        const loanAmount = parseFloat(document.getElementById('loan-amount')?.value);
        const interestRate = parseFloat(document.getElementById('interest-rate')?.value);
        const loanPeriod = parseInt(document.getElementById('loan-period')?.value);
        
        // التحقق من وجود العناصر أولاً
        if (!document.getElementById('borrower-category') ||
            !document.getElementById('borrower-name') ||
            !document.getElementById('borrower-phone') ||
            !document.getElementById('borrower-id-number') ||
            !document.getElementById('borrower-address') ||
            !document.getElementById('loan-amount') ||
            !document.getElementById('interest-rate') ||
            !document.getElementById('loan-period')) {
            console.error('لم يتم العثور على بعض عناصر النموذج في الخطوة الأولى');
            showNotification('حدث خطأ أثناء التحقق من البيانات، يرجى تحديث الصفحة', 'error');
            return false;
        }
        
        // التحقق من الحقول المطلوبة
        if (!borrowerCategory) {
            showNotification('يرجى اختيار نوع المقترض', 'error');
            return false;
        }
        
        if (!borrowerName || borrowerName.trim().length < 3) {
            showNotification('يرجى إدخال اسم المقترض بشكل صحيح', 'error');
            return false;
        }
        
        if (!borrowerPhone || !/^\d{10,11}$/.test(borrowerPhone.replace(/\s/g, ''))) {
            showNotification('يرجى إدخال رقم هاتف صحيح', 'error');
            return false;
        }
        
        if (!borrowerIdNumber || borrowerIdNumber.trim().length < 5) {
            showNotification('يرجى إدخال رقم البطاقة الشخصية بشكل صحيح', 'error');
            return false;
        }
        
        if (!borrowerAddress || borrowerAddress.trim().length < 5) {
            showNotification('يرجى إدخال عنوان المقترض بشكل صحيح', 'error');
            return false;
        }
        
        // التحقق من مبلغ القرض
        if (isNaN(loanAmount) || loanAmount <= 0) {
            showNotification('يرجى إدخال مبلغ القرض بشكل صحيح', 'error');
            return false;
        }
        
        // التحقق من الحد الأقصى للقرض حسب الفئة
        const maxLoanAmount = window.loanSettings?.maxLoanAmount[borrowerCategory] || 10000000;
        if (loanAmount > maxLoanAmount) {
            showNotification(`مبلغ القرض يتجاوز الحد الأقصى المسموح به (${formatCurrency(maxLoanAmount)})`, 'error');
            return false;
        }
        
        // التحقق من نسبة الفائدة
        if (isNaN(interestRate) || interestRate < 0 || interestRate > 20) {
            showNotification('يرجى إدخال نسبة الفائدة بشكل صحيح (بين 0 و 20)', 'error');
            return false;
        }
        
        // التحقق من مدة القرض
        if (isNaN(loanPeriod) || loanPeriod < 6 || loanPeriod > 60 || loanPeriod % 6 !== 0) {
            showNotification('يرجى إدخال مدة القرض بشكل صحيح (بين 6 و 60 شهر، مضاعفات 6)', 'error');
            return false;
        }
        
        console.log('تم التحقق من بيانات الخطوة الأولى بنجاح');
        return true;
    };
    
    // تحسين تدفق التحقق من الخطوة الثانية
    window.validateBorrowerInfoStep = function() {
        console.log('التحقق من بيانات الخطوة الثانية...');
        
        const borrowerCategory = document.getElementById('borrower-category')?.value;
        const borrowerSalary = parseFloat(document.getElementById('borrower-salary')?.value);
        const borrowerWorkplace = document.getElementById('borrower-workplace')?.value;
        const borrowerWorkAddress = document.getElementById('borrower-work-address')?.value;
        const borrowerServiceYears = parseFloat(document.getElementById('borrower-service-years')?.value);
        
        // التحقق من وجود العناصر أولاً
        if (!document.getElementById('borrower-salary') ||
            !document.getElementById('borrower-workplace') ||
            !document.getElementById('borrower-work-address') ||
            !document.getElementById('borrower-service-years')) {
            console.error('لم يتم العثور على بعض عناصر النموذج في الخطوة الثانية');
            showNotification('حدث خطأ أثناء التحقق من البيانات، يرجى تحديث الصفحة', 'error');
            return false;
        }
        
        // التحقق من الحقول المطلوبة
        if (isNaN(borrowerSalary) || borrowerSalary <= 0) {
            showNotification('يرجى إدخال الراتب الشهري بشكل صحيح', 'error');
            return false;
        }
        
        // التحقق من الحد الأدنى للراتب
        const minSalary = window.loanSettings?.minSalary[borrowerCategory] || 300000;
        if (borrowerSalary < minSalary) {
            showNotification(`الراتب الشهري أقل من الحد الأدنى المطلوب (${formatCurrency(minSalary)})`, 'error');
            return false;
        }
        
        if (!borrowerWorkplace || borrowerWorkplace.trim().length < 3) {
            showNotification('يرجى إدخال مكان العمل بشكل صحيح', 'error');
            return false;
        }
        
        if (!borrowerWorkAddress || borrowerWorkAddress.trim().length < 5) {
            showNotification('يرجى إدخال عنوان العمل بشكل صحيح', 'error');
            return false;
        }
        
        if (isNaN(borrowerServiceYears) || borrowerServiceYears < 0) {
            showNotification('يرجى إدخال مدة الخدمة بشكل صحيح', 'error');
            return false;
        }
        
        // التحقق من حد القرض نسبة إلى الراتب
        const loanAmount = parseFloat(document.getElementById('loan-amount')?.value);
        const maxLoanToSalaryRatio = window.loanSettings?.maxLoanToSalaryRatio[borrowerCategory] || 15;
        const maxLoanBasedOnSalary = borrowerSalary * maxLoanToSalaryRatio;
        
        if (loanAmount > maxLoanBasedOnSalary) {
            showNotification(`مبلغ القرض يتجاوز الحد المسموح به بناءً على الراتب (${formatCurrency(maxLoanBasedOnSalary)})`, 'error');
            return false;
        }
        
        // التحقق من المستندات المطلوبة
        if (window.loanSettings?.requireAllDocuments) {
            const requiredDocuments = [
                { id: 'borrower-id-front', name: 'البطاقة الموحدة (الوجه الأمامي)' },
                { id: 'borrower-id-back', name: 'البطاقة الموحدة (الوجه الخلفي)' },
                { id: 'borrower-residence-front', name: 'بطاقة السكن (الوجه الأمامي)' },
                { id: 'borrower-residence-back', name: 'بطاقة السكن (الوجه الخلفي)' },
                { id: 'borrower-salary-certificate', name: 'تأييد بالراتب' },
                { id: 'borrower-work-certificate', name: 'تأييد استمرارية بالعمل' }
            ];
            
            for (const doc of requiredDocuments) {
                const fileInput = document.getElementById(doc.id);
                if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                    showNotification(`يرجى إرفاق ${doc.name}`, 'error');
                    return false;
                }
            }
        }
        
        console.log('تم التحقق من بيانات الخطوة الثانية بنجاح');
        return true;
    };
    
    // تحسين تدفق التحقق من الخطوة الثالثة
    window.validateGuarantorInfoStep = function() {
        console.log('التحقق من بيانات الخطوة الثالثة...');
        
        const borrowerCategory = document.getElementById('borrower-category')?.value;
        const guarantorName = document.getElementById('guarantor-name')?.value;
        const guarantorPhone = document.getElementById('guarantor-phone')?.value;
        const guarantorAddress = document.getElementById('guarantor-address')?.value;
        const guarantorWorkplace = document.getElementById('guarantor-workplace')?.value;
        const guarantorSalary = parseFloat(document.getElementById('guarantor-salary')?.value);
        
        // التحقق من وجود العناصر أولاً
        if (!document.getElementById('guarantor-name') ||
            !document.getElementById('guarantor-phone') ||
            !document.getElementById('guarantor-address') ||
            !document.getElementById('guarantor-workplace') ||
            !document.getElementById('guarantor-salary')) {
            console.error('لم يتم العثور على بعض عناصر النموذج في الخطوة الثالثة');
            showNotification('حدث خطأ أثناء التحقق من البيانات، يرجى تحديث الصفحة', 'error');
            return false;
        }
        
        // التحقق من الحقول المطلوبة للكفيل الأول
        if (!guarantorName || guarantorName.trim().length < 3) {
            showNotification('يرجى إدخال اسم الكفيل بشكل صحيح', 'error');
            return false;
        }
        
        if (!guarantorPhone || !/^\d{10,11}$/.test(guarantorPhone.replace(/\s/g, ''))) {
            showNotification('يرجى إدخال رقم هاتف الكفيل بشكل صحيح', 'error');
            return false;
        }
        
        if (!guarantorAddress || guarantorAddress.trim().length < 5) {
            showNotification('يرجى إدخال عنوان الكفيل بشكل صحيح', 'error');
            return false;
        }
        
        if (!guarantorWorkplace || guarantorWorkplace.trim().length < 3) {
            showNotification('يرجى إدخال مكان عمل الكفيل بشكل صحيح', 'error');
            return false;
        }
        
        if (isNaN(guarantorSalary) || guarantorSalary <= 0) {
            showNotification('يرجى إدخال راتب الكفيل بشكل صحيح', 'error');
            return false;
        }
        
        // التحقق من المستندات المطلوبة للكفيل الأول
        if (window.loanSettings?.requireAllDocuments) {
            const requiredDocuments = [
                { id: 'guarantor-id-front', name: 'البطاقة الموحدة للكفيل (الوجه الأمامي)' },
                { id: 'guarantor-id-back', name: 'البطاقة الموحدة للكفيل (الوجه الخلفي)' },
                { id: 'guarantor-residence-front', name: 'بطاقة سكن الكفيل (الوجه الأمامي)' },
                { id: 'guarantor-residence-back', name: 'بطاقة سكن الكفيل (الوجه الخلفي)' },
                { id: 'guarantor-salary-certificate', name: 'تأييد براتب الكفيل' }
            ];
            
            for (const doc of requiredDocuments) {
                const fileInput = document.getElementById(doc.id);
                if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                    showNotification(`يرجى إرفاق ${doc.name}`, 'error');
                    return false;
                }
            }
        }
        
        // التحقق من الكفيل الثاني إذا كان مطلوباً
        const requireSecondGuarantor = window.loanSettings?.requireSecondGuarantor[borrowerCategory] || false;
        const secondGuarantorSection = document.getElementById('second-guarantor-section');
        const hasSecondGuarantor = secondGuarantorSection && !secondGuarantorSection.classList.contains('hidden-section');
        
        if (requireSecondGuarantor && !hasSecondGuarantor) {
            showNotification('يجب إضافة كفيل ثاني لهذا النوع من القروض', 'error');
            return false;
        }
        
        // التحقق من معلومات الكفيل الثاني إذا كان موجوداً
        if (hasSecondGuarantor) {
            const guarantor2Name = document.getElementById('guarantor2-name')?.value;
            const guarantor2Phone = document.getElementById('guarantor2-phone')?.value;
            const guarantor2Address = document.getElementById('guarantor2-address')?.value;
            const guarantor2Workplace = document.getElementById('guarantor2-workplace')?.value;
            const guarantor2Salary = parseFloat(document.getElementById('guarantor2-salary')?.value);
            
            if (!guarantor2Name || guarantor2Name.trim().length < 3) {
                showNotification('يرجى إدخال اسم الكفيل الثاني بشكل صحيح', 'error');
                return false;
            }
            
            if (!guarantor2Phone || !/^\d{10,11}$/.test(guarantor2Phone.replace(/\s/g, ''))) {
                showNotification('يرجى إدخال رقم هاتف الكفيل الثاني بشكل صحيح', 'error');
                return false;
            }
            
            if (!guarantor2Address || guarantor2Address.trim().length < 5) {
                showNotification('يرجى إدخال عنوان الكفيل الثاني بشكل صحيح', 'error');
                return false;
            }
            
            if (!guarantor2Workplace || guarantor2Workplace.trim().length < 3) {
                showNotification('يرجى إدخال مكان عمل الكفيل الثاني بشكل صحيح', 'error');
                return false;
            }
            
            if (isNaN(guarantor2Salary) || guarantor2Salary <= 0) {
                showNotification('يرجى إدخال راتب الكفيل الثاني بشكل صحيح', 'error');
                return false;
            }
            
            // التحقق من المستندات المطلوبة للكفيل الثاني
            if (window.loanSettings?.requireAllDocuments) {
                const requiredDocuments = [
                    { id: 'guarantor2-id-front', name: 'البطاقة الموحدة للكفيل الثاني (الوجه الأمامي)' },
                    { id: 'guarantor2-id-back', name: 'البطاقة الموحدة للكفيل الثاني (الوجه الخلفي)' },
                    { id: 'guarantor2-residence-front', name: 'بطاقة سكن الكفيل الثاني (الوجه الأمامي)' },
                    { id: 'guarantor2-residence-back', name: 'بطاقة سكن الكفيل الثاني (الوجه الخلفي)' },
                    { id: 'guarantor2-salary-certificate', name: 'تأييد براتب الكفيل الثاني' }
                ];
                
                for (const doc of requiredDocuments) {
                    const fileInput = document.getElementById(doc.id);
                    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                        showNotification(`يرجى إرفاق ${doc.name}`, 'error');
                        return false;
                    }
                }
            }
        }
        
        console.log('تم التحقق من بيانات الخطوة الثالثة بنجاح');
        return true;
    };
    
    // تحسين تحديث بيانات المراجعة
    window.updateLoanReviewData = function() {
        console.log('تحديث بيانات المراجعة...');
        
        try {
            // معلومات القرض الأساسية
            const borrowerCategory = document.getElementById('borrower-category')?.value || '';
            const borrowerName = document.getElementById('borrower-name')?.value || '';
            const borrowerPhone = document.getElementById('borrower-phone')?.value || '';
            const borrowerAddress = document.getElementById('borrower-address')?.value || '';
            const loanAmount = parseFloat(document.getElementById('loan-amount')?.value || '0');
            const interestRate = parseFloat(document.getElementById('interest-rate')?.value || '0');
            const loanPeriod = parseInt(document.getElementById('loan-period')?.value || '0');
            
            // تحديث عناصر المراجعة
            const reviewElements = {
                'review-borrower-category': getCategoryName(borrowerCategory),
                'review-borrower-name': borrowerName,
                'review-borrower-phone': borrowerPhone,
                'review-borrower-address': borrowerAddress,
                'review-loan-amount': formatCurrency(loanAmount),
                'review-interest-rate': `${interestRate}%`,
                'review-loan-period': `${loanPeriod} شهر`
            };
            
            // تحديث العناصر
            for (const [id, value] of Object.entries(reviewElements)) {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                }
            }
            
            // حساب القسط الشهري وإجمالي المبلغ
            const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanPeriod);
            const totalAmount = loanAmount + (loanAmount * interestRate / 100 * loanPeriod / 12);
            
            const reviewMonthlyPayment = document.getElementById('review-monthly-payment');
            const reviewTotalAmount = document.getElementById('review-total-amount');
            
            if (reviewMonthlyPayment) reviewMonthlyPayment.textContent = formatCurrency(monthlyPayment);
            if (reviewTotalAmount) reviewTotalAmount.textContent = formatCurrency(totalAmount);
            
            // معلومات الكفيل
            const guarantorName = document.getElementById('guarantor-name')?.value || '';
            const reviewGuarantorName = document.getElementById('review-guarantor-name');
            if (reviewGuarantorName) reviewGuarantorName.textContent = guarantorName;
            
            // التحقق من المستندات
            const documentsStatus = window.loanSettings?.requireAllDocuments ? 'مكتملة' : 'قيد المراجعة';
            const reviewGuarantorDocuments = document.getElementById('review-guarantor-documents');
            if (reviewGuarantorDocuments) reviewGuarantorDocuments.textContent = documentsStatus;
            
            // معلومات الكفيل الثاني
            const secondGuarantorSection = document.getElementById('second-guarantor-section');
            const hasSecondGuarantor = secondGuarantorSection && !secondGuarantorSection.classList.contains('hidden-section');
            const reviewHasSecondGuarantor = document.getElementById('review-has-second-guarantor');
            
            if (reviewHasSecondGuarantor) {
                if (hasSecondGuarantor) {
                    const guarantor2Name = document.getElementById('guarantor2-name')?.value || '';
                    reviewHasSecondGuarantor.textContent = guarantor2Name;
                } else {
                    reviewHasSecondGuarantor.textContent = 'غير مضاف';
                }
            }
            
            console.log('تم تحديث بيانات المراجعة بنجاح');
        } catch (error) {
            console.error('خطأ في تحديث بيانات المراجعة:', error);
        }
    };
    
    // إعادة تأسيس مستمعي الأحداث لحقول حساب القرض
    function rebindLoanCalculationListeners() {
        // حقول الحساب
        const loanAmountInput = document.getElementById('loan-amount');
        const interestRateInput = document.getElementById('interest-rate');
        const loanPeriodInput = document.getElementById('loan-period');
        
        // ملخص القرض
        const summaryAmount = document.getElementById('summary-amount');
        const summaryInterest = document.getElementById('summary-interest');
        const summaryTotal = document.getElementById('summary-total');
        const summaryMonthly = document.getElementById('summary-monthly');
        
        // تحديث الملخص عند تغيير أي حقل
        const updateLoanSummary = function() {
            const loanAmount = parseFloat(loanAmountInput?.value) || 0;
            const interestRate = parseFloat(interestRateInput?.value) || 0;
            const loanPeriod = parseInt(loanPeriodInput?.value) || 0;
            
            // حساب قيمة الفوائد
            const interestValue = loanAmount * interestRate / 100 * loanPeriod / 12;
            
            // حساب إجمالي المبلغ
            const totalAmount = loanAmount + interestValue;
            
            // حساب القسط الشهري
            const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanPeriod);
            
            // تحديث عناصر الملخص
            if (summaryAmount) summaryAmount.textContent = formatCurrency(loanAmount);
            if (summaryInterest) summaryInterest.textContent = formatCurrency(interestValue);
            if (summaryTotal) summaryTotal.textContent = formatCurrency(totalAmount);
            if (summaryMonthly) summaryMonthly.textContent = formatCurrency(monthlyPayment);
        };
        
        // إضافة مستمعي الأحداث
        if (loanAmountInput) loanAmountInput.addEventListener('input', updateLoanSummary);
        if (interestRateInput) interestRateInput.addEventListener('input', updateLoanSummary);
        if (loanPeriodInput) loanPeriodInput.addEventListener('input', updateLoanSummary);
        
        // التنفيذ الأولي
        updateLoanSummary();
    }
    
    // إعادة تأسيس مستمعي الأحداث للمستندات
    function rebindFilePreviewListeners() {
        // العثور على جميع حقول تحميل الملفات
        const fileInputs = document.querySelectorAll('.file-input');
        
        fileInputs.forEach(input => {
            input.addEventListener('change', function(e) {
                const previewId = this.id + '-preview';
                const previewContainer = document.getElementById(previewId);
                
                if (!previewContainer) return;
                
                if (this.files && this.files[0]) {
                    const file = this.files[0];
                    
                    // التحقق من نوع الملف
                    if (file.type.match('image.*')) {
                        // معاينة الصورة
                        const reader = new FileReader();
                        
                        reader.onload = function(e) {
                            previewContainer.innerHTML = `<img src="${e.target.result}" alt="معاينة الملف">`;
                            previewContainer.classList.add('has-preview');
                        };
                        
                        reader.readAsDataURL(file);
                    } else if (file.type === 'application/pdf') {
                        // معاينة PDF
                        previewContainer.innerHTML = `
                            <div class="pdf-preview">
                                <i class="fas fa-file-pdf"></i>
                                <div class="file-info">
                                    <span>${file.name}</span>
                                    <span>${(file.size / 1024).toFixed(2)} KB</span>
                                </div>
                            </div>
                        `;
                        previewContainer.classList.add('has-preview');
                    } else {
                        // معاينة ملف عادي
                        previewContainer.innerHTML = `
                            <div class="file-preview-generic">
                                <i class="fas fa-file"></i>
                                <div class="file-info">
                                    <span>${file.name}</span>
                                    <span>${(file.size / 1024).toFixed(2)} KB</span>
                                </div>
                            </div>
                        `;
                        previewContainer.classList.add('has-preview');
                    }
                } else {
                    // إزالة المعاينة
                    previewContainer.innerHTML = '';
                    previewContainer.classList.remove('has-preview');
                }
            });
        });
    }
    
    // تنفيذ إعادة تأسيس مستمعي الأحداث
    rebindWizardEventListeners();
    rebindSecondGuarantorListeners();
    rebindLoanCalculationListeners();
    rebindFilePreviewListeners();
}

/**
 * إصلاح مشاكل تبويبات تفاصيل القرض
 */
function fixLoanDetailsTabs() {
    console.log('إصلاح مشاكل تبويبات تفاصيل القرض...');
    
    // تحسين دالة إعداد مستمعي الأحداث لعلامات التبويب
    window.setupLoanDetailsTabs = function() {
        const tabButtons = document.querySelectorAll('.loan-tab-btn');
        const tabContents = document.querySelectorAll('.loan-tab-content');
        
        if (!tabButtons.length || !tabContents.length) {
            console.warn('لم يتم العثور على عناصر تبويبات تفاصيل القرض');
            return;
        }
        
        console.log(`تم العثور على ${tabButtons.length} زر تبويب و ${tabContents.length} محتوى تبويب`);
        
        tabButtons.forEach(button => {
            // إزالة المستمعين السابقين
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // إضافة مستمع جديد
            newButton.addEventListener('click', function() {
                console.log(`تم النقر على تبويب ${this.textContent.trim()}`);
                
                // إزالة الكلاس النشط من جميع الأزرار والمحتويات
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // إضافة الكلاس النشط للزر المحدد
                this.classList.add('active');
                
                // إظهار المحتوى المناسب
                const tabId = this.getAttribute('data-tab');
                if (!tabId) {
                    console.error('الزر لا يحتوي على سمة data-tab');
                    return;
                }
                
                const tabContent = document.getElementById(tabId);
                if (tabContent) {
                    tabContent.classList.add('active');
                    // تأكيد أن المحتوى ظاهر
                    tabContent.style.display = 'block';
                } else {
                    console.error(`لم يتم العثور على محتوى التبويب للمعرف: ${tabId}`);
                }
            });
        });
        
        // التأكد من أن التبويب الأول نشط
        if (tabButtons.length > 0 && tabContents.length > 0) {
            tabButtons[0].classList.add('active');
            const firstTabId = tabButtons[0].getAttribute('data-tab');
            const firstTabContent = document.getElementById(firstTabId);
            
            if (firstTabContent) {
                firstTabContent.classList.add('active');
                firstTabContent.style.display = 'block';
            }
        }
    };
}

/**
 * إصلاح مشاكل النوافذ المنبثقة
 */
function fixModalInteractions() {
    console.log('إصلاح مشاكل النوافذ المنبثقة...');
    
    // تحسين دالة فتح النافذة المنبثقة
    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        
        if (!modal) {
            console.error(`لم يتم العثور على النافذة المنبثقة بالمعرف: ${modalId}`);
            return;
        }
        
        console.log(`فتح النافذة المنبثقة: ${modalId}`);
        
        // التأكد من أن النافذة ظاهرة
        modal.style.display = 'flex';
        modal.style.opacity = '1';
        
        // تأخير صغير لإضافة الفئة المتحركة
        setTimeout(() => {
            const modalContent = modal.querySelector('.modal');
            if (modalContent) {
                // إزالة الفئة المتحركة السابقة قبل إضافة الجديدة
                modalContent.classList.remove('animate__fadeOutDown');
                void modalContent.offsetWidth; // إعادة تدفق لإجبار التحديث
                modalContent.classList.add('animate__fadeInUp');
            }
        }, 10);
        
        // إضافة مستمع للنقر خارج النافذة لإغلاقها
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modalId);
            }
        });
        
        // إضافة مستمع لمفتاح ESC لإغلاق النافذة
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal(modalId);
            }
        });
    };
    
    // تحسين دالة إغلاق النافذة المنبثقة
    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        
        if (!modal) {
            console.error(`لم يتم العثور على النافذة المنبثقة بالمعرف: ${modalId}`);
            return;
        }
        
        console.log(`إغلاق النافذة المنبثقة: ${modalId}`);
        
        // إضافة فئة الخروج بالتأثير
        const modalContent = modal.querySelector('.modal');
        if (modalContent) {
            modalContent.classList.remove('animate__fadeInUp');
            modalContent.classList.add('animate__fadeOutDown');
        }
        
        // تأخير قبل إخفاء النافذة
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    };
    
    // إعادة تأسيس مستمعي الأحداث لجميع النوافذ المنبثقة
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        // زر الإغلاق
        const closeButton = modal.querySelector('.modal-close, .modal-close-btn');
        if (closeButton) {
            // إزالة المستمعين السابقين
            const newCloseButton = closeButton.cloneNode(true);
            closeButton.parentNode.replaceChild(newCloseButton, closeButton);
            
            // إضافة مستمع جديد
            newCloseButton.addEventListener('click', function(e) {
                e.preventDefault();
                const modalId = modal.id;
                closeModal(modalId);
            });
        }
    });
}

/**
 * إصلاح مشاكل عامة في استجابة الأزرار
 */
function fixGeneralButtonResponsiveness() {
    console.log('إصلاح مشاكل عامة في استجابة الأزرار...');
    
    // إصلاح أزرار التصفية
    document.querySelectorAll('.filter-buttons .btn').forEach(button => {
        button.addEventListener('click', function() {
            console.log(`تم النقر على زر التصفية: ${this.textContent.trim()}`);
            
            // تحديث الزر النشط
            document.querySelectorAll('.filter-buttons .btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // تحديث تصفية القروض
            const filter = this.getAttribute('data-filter');
            window.currentLoanFilter = filter;
            
            if (typeof window.renderLoansTable === 'function') {
                window.renderLoansTable();
            }
        });
    });
    
    // إصلاح أزرار الإضافة/التحديث العامة
    rebindButtonEvent('new-loan-btn', function() {
        console.log('تم النقر على زر إضافة قرض جديد');
        setActivePage('add-loan');
    });
    
    rebindButtonEvent('add-first-loan-btn', function() {
        console.log('تم النقر على زر إضافة أول قرض');
        setActivePage('add-loan');
    });
    
    rebindButtonEvent('refresh-loans-btn', function() {
        console.log('تم النقر على زر تحديث القروض');
        
        if (typeof window.renderLoansTable === 'function') {
            window.renderLoansTable();
        }
        
        showNotification('تم تحديث بيانات القروض', 'success');
    });
    
    // تحسين تحديث عنوان الصفحة
    function updatePageTitle(pageId) {
        let title = '';
        
        switch (pageId) {
            case 'loans':
                title = 'القروض النشطة';
                break;
            case 'add-loan':
                title = 'إضافة قرض جديد';
                break;
            case 'approved-loans':
                title = 'القروض الموافق عليها';
                break;
            case 'rejected-loans':
                title = 'القروض المرفوضة';
                break;
            case 'loan-settings':
                title = 'إعدادات نظام القروض';
                break;
            default:
                return;
        }
        
        // تحديث عنوان الصفحة
        document.title = `${title} - نظام الإدارة`;
        
        // تحديث عنوان الصفحة في الواجهة
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) {
            pageTitle.textContent = title;
        }
    }
}
    
    // تحسين دالة تعيين الصفحة النشطة
    window.setActivePage = function(pageId) {
        console.log(`تعيين الصفحة النشطة: ${pageId}`);
        
        // إخفاء جميع الصفحات
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
        });
        
        // إظهار الصفحة المطلوبة
        const activePage = document.getElementById(`${pageId}-page`);
        if (activePage) {
            activePage.style.display = 'block';
        } else {
            console.error(`لم يتم العثور على الصفحة بالمعرف: ${pageId}-page`);
            return;
        }
        
        // تحديث القائمة الجانبية
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            
            // في حالة الشاشات الصغيرة
            if (window.innerWidth < 992) {
                const sidebar = document.querySelector('.sidebar');
                if (sidebar && sidebar.classList.contains('expanded')) {
                    sidebar.classList.remove('expanded');
                }
            }
        }
        
        // تحديث عنوان الصفحة
        updatePageTitle(pageId);
        
        // تحديث البيانات حسب الصفحة
        switch (pageId) {
            case 'loans':
                if (typeof window.renderLoansTable === 'function') {
                    window.renderLoansTable();
                }
                if (typeof window.updateLoanDashboardStats === 'function') {
                    window.updateLoanDashboardStats();
                }
                break;
            case 'approved-loans':
                if (typeof window.renderApprovedLoansTable === 'function') {
                    window.renderApprovedLoansTable();
                }
                break;
            case 'rejected-loans':
                if (typeof window.renderRejectedLoansTable === 'function') {
                    window.renderRejectedLoansTable();
                }
                break;
            case 'add-loan':
                if (typeof window.resetLoanForm === 'function') {
                    window.resetLoanForm();
                } else {
                    // إعادة تعيين بسيطة للنموذج إذا لم تكن الدالة موجودة
                    document.querySelectorAll('.loan-form').forEach(form => {
                        if (form && typeof form.reset === 'function') {
                            form.reset();
                        }
                    });
                }
                
                // التأكد من أن الخطوة الأولى نشطة
                goToLoanStep(1);
                break;
        }
    };
    
    // إصلاح زر تقديم طلب القرض
    rebindButtonEvent('submit-loan-btn', function() {
        console.log('تم النقر على زر تقديم طلب القرض');
        
        // التحقق من الموافقة على الشروط
        const agreementCheckbox = document.getElementById('loan-agreement');
        if (!agreementCheckbox || !agreementCheckbox.checked) {
            showNotification('يجب الموافقة على شروط وأحكام القرض', 'error');
            return;
        }
        
        // تقديم طلب القرض
        if (typeof window.submitLoanApplication === 'function') {
            window.submitLoanApplication();
        } else {
            console.error('دالة تقديم طلب القرض غير موجودة');
            showNotification('حدث خطأ أثناء تقديم الطلب، يرجى تحديث الصفحة', 'error');
        }
    });
    
    // إصلاح زر مراجعة وإرسال طلب القرض
    rebindButtonEvent('review-loan-btn', function() {
        console.log('تم النقر على زر مراجعة وإرسال طلب القرض');
        
        const wizardSteps = document.querySelectorAll('.wizard-step');
        const stepsCount = wizardSteps.length;
        
        // الانتقال إلى الخطوة الأخيرة (المراجعة)
        goToLoanStep(stepsCount);
        updateLoanReviewData();
    });
    
    // إصلاح أزرار التصفية
    document.querySelectorAll('.filter-buttons .btn').forEach(button => {
        button.addEventListener('click', function() {
            console.log(`تم النقر على زر التصفية: ${this.textContent.trim()}`);
            
            // تحديث الزر النشط
            document.querySelectorAll('.filter-buttons .btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // تحديث تصفية القروض
            const filter = this.getAttribute('data-filter');
            window.currentLoanFilter = filter;
            
            if (typeof window.renderLoansTable === 'function') {
                window.renderLoansTable();
            }
        });
    });
    
    // إصلاح أزرار الإضافة/التحديث العامة
    rebindButtonEvent('new-loan-btn', function() {
        console.log('تم النقر على زر إضافة قرض جديد');
        setActivePage('add-loan');
    });
    
    rebindButtonEvent('add-first-loan-btn', function() {
        console.log('تم النقر على زر إضافة أول قرض');
        setActivePage('add-loan');
    });
    
    rebindButtonEvent('refresh-loans-btn', function() {
        console.log('تم النقر على زر تحديث القروض');
        
        if (typeof window.renderLoansTable === 'function') {
            window.renderLoansTable();
        }
        
        showNotification('تم تحديث بيانات القروض', 'success');
    });
    
    // تحسين تحديث عنوان الصفحة
    function updatePageTitle(pageId) {
        let title = '';
        
        switch (pageId) {
            case 'loans':
                title = 'القروض النشطة';
                break;
            case 'add-loan':
                title = 'إضافة قرض جديد';
                break;
            case 'approved-loans':
                title = 'القروض الموافق عليها';
                break;
            case 'rejected-loans':
                title = 'القروض المرفوضة';
                break;
            case 'loan-settings':
                title = 'إعدادات نظام القروض';
                break;
            default:
                return;
        }
        
        // تحديث عنوان الصفحة
        document.title = `${title} - نظام الإدارة`;
        
        // تحديث عنوان الصفحة في الواجهة
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) {
            pageTitle.textContent = title;
        }
    }
    
    // إصلاح الدالة المساعدة للحصول على اسم الفئة
    window.getCategoryName = function(category) {
        switch (category) {
            case 'kasb': return 'كاسب';
            case 'employee': return 'موظف';
            case 'military': return 'عسكري';
            case 'social': return 'رعاية اجتماعية';
            default: return category || '';
        }
    };


/**
 * نقطة البدء لتطبيق جميع الإصلاحات
 */
(function() {
    // تطبيق الإصلاحات
    fixLoanSystemButtonIssues();
    
    // تسجيل التنفيذ
    console.log('تم تنفيذ إصلاحات استجابة أزرار نظام القروض');
    
    // إضافة مستمع حدث تحميل الصفحة للتأكد من تطبيق الإصلاحات
    window.addEventListener('load', function() {
        console.log('تم تحميل الصفحة بالكامل، التأكد من تطبيق الإصلاحات...');
        
        // تأخير صغير للتأكد من تحميل جميع العناصر
        setTimeout(() => {
            fixLoanSystemButtonIssues();
        }, 500);
    });
})();

/**
 * إصلاح مشكلة تنسيق التواريخ في نظام القروض - الإصدار 1.0.0
 * 
 * هذا الملف يعالج مشكلة خطأ "Cannot read properties of undefined (reading 'replace')"
 * الذي يحدث في دالة formatDate عند محاولة تنسيق تاريخ غير معرف (undefined)
 * 
 * تاريخ الإصدار: مايو 2025
 */

/**
 * دالة معزّزة لتنسيق التاريخ بشكل آمن
 * تتعامل مع التواريخ غير المعرفة والقيم الفارغة وسلاسل النصوص غير الصالحة
 * 
 * @param {string|Date|null|undefined} date - التاريخ المراد تنسيقه
 * @param {string} format - صيغة التنسيق (اختياري)
 * @returns {string} - التاريخ المنسق أو علامة '-' إذا كان التاريخ غير صالح
 */
window.formatDate = function(date, format) {
    // التحقق من وجود التاريخ
    if (date === null || date === undefined || date === '') {
        console.log('تم استدعاء formatDate مع قيمة غير صالحة:', date);
        return '-';
    }
    
    // إذا لم يتم تحديد الصيغة، استخدم الصيغة الافتراضية من الإعدادات أو 'YYYY/MM/DD'
    if (!format) {
        format = (window.settings && window.settings.dateFormat) ? window.settings.dateFormat : 'YYYY/MM/DD';
    }
    
    try {
        // تحويل التاريخ إلى كائن Date
        const dateObj = date instanceof Date ? date : new Date(date);
        
        // التحقق من صحة التاريخ
        if (isNaN(dateObj.getTime())) {
            console.log('تم استدعاء formatDate مع تاريخ غير صالح:', date);
            return '-';
        }
        
        // الحصول على مكونات التاريخ
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        
        // تنسيق التاريخ حسب الصيغة المطلوبة
        let formattedDate = format;
        formattedDate = formattedDate.replace('YYYY', year);
        formattedDate = formattedDate.replace('MM', month);
        formattedDate = formattedDate.replace('DD', day);
        
        return formattedDate;
    } catch (error) {
        console.error('خطأ في تنسيق التاريخ:', error, 'القيمة:', date);
        return '-';
    }
};

/**
 * دالة معززة لإنشاء حقول التاريخ بشكل آمن
 * تضيف خاصية تاريخ النظام الحالي افتراضياً
 * 
 * @param {string} inputId - معرف حقل الإدخال
 * @param {boolean} required - هل الحقل مطلوب
 * @param {string} defaultDate - التاريخ الافتراضي (اختياري)
 */
window.setupDateField = function(inputId, required, defaultDate) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    // تعيين التاريخ الافتراضي
    if (!input.value) {
        if (defaultDate) {
            input.value = formatDate(defaultDate, 'YYYY-MM-DD');
        } else {
            // استخدام تاريخ اليوم كقيمة افتراضية
            input.value = new Date().toISOString().split('T')[0];
        }
    }
    
    // إضافة خاصية required إذا كان مطلوباً
    if (required) {
        input.setAttribute('required', 'required');
    }
};

/**
 * تطبيق الإصلاح على جميع دوال التاريخ في النظام
 */
function applyDateFormatFixes() {
    console.log('جاري تطبيق إصلاحات تنسيق التواريخ...');
    
    // تعيين دالة formatDate الجديدة
    const originalFormatDate = window.formatDate;
    
    // إصلاح مشكلة تنسيق التاريخ في جداول الأقساط
    fixInstallmentTableDates();
    
    // إصلاح مشكلة تنسيق التاريخ في جداول القروض
    fixLoanTableDates();
    
    // إصلاح مشكلة عرض التواريخ في النماذج
    setupAllDateFields();
    
    console.log('تم تطبيق إصلاحات تنسيق التواريخ بنجاح');
}

/**
 * إصلاح عرض التواريخ في جداول الأقساط
 */
function fixInstallmentTableDates() {
    try {
        // تأمين دالة عرض جدول الأقساط إذا كانت موجودة
        if (typeof window.renderInstallmentsTable === 'function') {
            const originalRenderInstallmentsTable = window.renderInstallmentsTable;
            
            window.renderInstallmentsTable = function() {
                try {
                    return originalRenderInstallmentsTable.apply(this, arguments);
                } catch (error) {
                    console.error('خطأ في عرض جدول الأقساط:', error);
                    
                    // محاولة إصلاح الخطأ إذا كان متعلقاً بالتواريخ
                    if (error.message && error.message.includes('undefined') && error.message.includes('replace')) {
                        console.log('محاولة إصلاح خطأ التواريخ في جدول الأقساط...');
                        return {}; // إرجاع كائن فارغ كحل مؤقت
                    }
                    
                    throw error; // إعادة إلقاء الخطأ إذا لم يكن متعلقاً بالتواريخ
                }
            };
        }
    } catch (error) {
        console.error('خطأ في تطبيق إصلاح تواريخ الأقساط:', error);
    }
}

/**
 * إصلاح عرض التواريخ في جداول القروض
 */
function fixLoanTableDates() {
    try {
        // تأمين دالة عرض جدول القروض إذا كانت موجودة
        if (typeof window.renderLoansTable === 'function') {
            const originalRenderLoansTable = window.renderLoansTable;
            
            window.renderLoansTable = function() {
                try {
                    return originalRenderLoansTable.apply(this, arguments);
                } catch (error) {
                    console.error('خطأ في عرض جدول القروض:', error);
                    
                    // محاولة إصلاح الخطأ إذا كان متعلقاً بالتواريخ
                    if (error.message && error.message.includes('undefined') && error.message.includes('replace')) {
                        console.log('محاولة إصلاح خطأ التواريخ في جدول القروض...');
                        
                        // تحديث كل القروض بتواريخ افتراضية إذا كانت غير موجودة
                        if (window.loans && Array.isArray(window.loans)) {
                            window.loans.forEach(loan => {
                                if (!loan.createdAt) {
                                    loan.createdAt = new Date().toISOString();
                                }
                            });
                        }
                        
                        // محاولة تنفيذ الدالة مرة أخرى بعد الإصلاح
                        return originalRenderLoansTable.apply(this, arguments);
                    }
                    
                    throw error; // إعادة إلقاء الخطأ إذا لم يكن متعلقاً بالتواريخ
                }
            };
        }
    } catch (error) {
        console.error('خطأ في تطبيق إصلاح تواريخ القروض:', error);
    }
}

/**
 * إعداد جميع حقول التاريخ في النظام
 */
function setupAllDateFields() {
    try {
        // حقل تاريخ الصرف في نافذة الموافقة على القرض
        setupDateField('disbursement-date', true);
        
        // إضافة حدث تحميل الصفحة لإعداد حقول التاريخ
        window.addEventListener('load', function() {
            // حقل تاريخ الصرف في نافذة الموافقة على القرض
            setupDateField('disbursement-date', true);
            
            console.log('تم إعداد حقول التاريخ');
        });
    } catch (error) {
        console.error('خطأ في إعداد حقول التاريخ:', error);
    }
}

/**
 * إصلاح مشاكل عرض القروض
 */
function fixLoanDisplay() {
    try {
        // إصلاح مشكلة تحديث بيانات القرض
        if (typeof window.updateLoan === 'function') {
            const originalUpdateLoan = window.updateLoan;
            
            window.updateLoan = function(loanId, updatedData) {
                // التأكد من وجود تاريخ التحديث
                if (!updatedData.updatedAt) {
                    updatedData.updatedAt = new Date().toISOString();
                }
                
                return originalUpdateLoan.call(this, loanId, updatedData);
            };
        }
        
        // إصلاح مشكلة إضافة قرض جديد
        if (typeof window.addLoan === 'function') {
            const originalAddLoan = window.addLoan;
            
            window.addLoan = function(newLoan) {
                // التأكد من وجود تاريخ الإنشاء
                if (!newLoan.createdAt) {
                    newLoan.createdAt = new Date().toISOString();
                }
                
                return originalAddLoan.call(this, newLoan);
            };
        }
    } catch (error) {
        console.error('خطأ في تطبيق إصلاح عرض القروض:', error);
    }
}

/**
 * إصلاح مشكلة رفع مستندات القرض
 */
function fixLoanDocumentUpload() {
    try {
        // تحسين دالة رفع مستندات القرض
        if (typeof window.uploadLoanDocuments === 'function') {
            const originalUploadLoanDocuments = window.uploadLoanDocuments;
            
            window.uploadLoanDocuments = async function(loanData) {
                try {
                    return await originalUploadLoanDocuments.call(this, loanData);
                } catch (error) {
                    console.error('تم التقاط خطأ في رفع مستندات القرض:', error);
                    
                    // إرجاع بيانات القرض دون تغيير كحل مؤقت
                    window.showNotification('حدث خطأ أثناء رفع المستندات، سيتم حفظ البيانات الأساسية فقط', 'warning');
                    return { ...loanData };
                }
            };
        }
    } catch (error) {
        console.error('خطأ في تطبيق إصلاح رفع المستندات:', error);
    }
}

// تطبيق الإصلاحات عند تحميل الملف
(function() {
    // تطبيق إصلاحات تنسيق التواريخ
    applyDateFormatFixes();
    
    // إصلاح مشاكل عرض القروض
    fixLoanDisplay();
    
    // إصلاح مشكلة رفع المستندات
    fixLoanDocumentUpload();
    
    console.log('تم تنفيذ إصلاحات تنسيق التواريخ ورفع المستندات');
    
    // إضافة مستمع حدث تحميل الصفحة للتأكد من تطبيق الإصلاحات
    window.addEventListener('load', function() {
        setTimeout(function() {
            applyDateFormatFixes();
            fixLoanDisplay();
            fixLoanDocumentUpload();
        }, 500);
    });
})();


/**
 * إصلاح فوري لأخطاء نظام القروض - الإصدار 1.0.0
 * 
 * هذا الملف يقوم بإصلاح فوري للأخطاء الحرجة في نظام القروض:
 * 1. خطأ في دالة formatDate: Cannot read properties of undefined (reading 'replace')
 * 2. خطأ في permissions-enforcement.js: Cannot read properties of null (reading 'parentNode')
 * 
 * تاريخ الإصدار: مايو 2025
 */

// تنفيذ الإصلاحات فورًا
(function() {
    console.log('جاري تطبيق الإصلاحات الفورية لنظام القروض...');
    
    // ===== 1. إصلاح دالة formatDate =====
    
    // حفظ دالة formatDate الأصلية إذا كانت موجودة
    const originalFormatDate = window.formatDate;
    
    // تعريف دالة formatDate المحسنة
    window.formatDate = function(date, format) {
        // التحقق من وجود التاريخ
        if (date === null || date === undefined || date === '') {
            console.log('تم استدعاء formatDate مع قيمة غير صالحة:', date);
            return '-';
        }
        
        // استخدام الصيغة الافتراضية إذا لم يتم تحديد الصيغة
        if (!format) {
            // التحقق من وجود settings.dateFormat
            if (window.settings && window.settings.dateFormat) {
                format = window.settings.dateFormat;
            } else {
                format = 'YYYY/MM/DD'; // صيغة افتراضية
            }
        }
        
        try {
            // تحويل التاريخ إلى كائن Date
            const dateObj = date instanceof Date ? date : new Date(date);
            
            // التحقق من صحة التاريخ
            if (isNaN(dateObj.getTime())) {
                console.log('تم استدعاء formatDate مع تاريخ غير صالح:', date);
                return '-';
            }
            
            // الحصول على مكونات التاريخ
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            
            // استخدام طريقة آمنة لاستبدال النص
            let formattedDate = format;
            formattedDate = formattedDate.replace(/YYYY/g, year);
            formattedDate = formattedDate.replace(/MM/g, month);
            formattedDate = formattedDate.replace(/DD/g, day);
            
            return formattedDate;
        } catch (error) {
            console.error('خطأ في تنسيق التاريخ:', error, 'القيمة:', date);
            
            // محاولة استخدام الدالة الأصلية إذا كانت موجودة
            if (typeof originalFormatDate === 'function') {
                try {
                    return originalFormatDate(date, format);
                } catch (fallbackError) {
                    // في حالة فشل الدالة الأصلية أيضًا
                    console.error('فشل الرجوع إلى الدالة الأصلية:', fallbackError);
                }
            }
            
            // إرجاع نص التاريخ كما هو أو "-" إذا لم يكن موجودًا
            return date ? date.toString() : '-';
        }
    };
    
    // ===== 2. إصلاح دالة رفع المستندات =====
    
    // إذا كانت دالة uploadLoanDocuments موجودة، قم بإصلاحها
    if (typeof window.uploadLoanDocuments === 'function') {
        // حفظ الدالة الأصلية
        const originalUploadLoanDocuments = window.uploadLoanDocuments;
        
        // استبدال الدالة بنسخة محسنة
        window.uploadLoanDocuments = async function(loanData) {
            // التأكد من وجود كائن loanData
            if (!loanData) {
                console.error('خطأ: بيانات القرض غير موجودة (uploadLoanDocuments)');
                return {};
            }
            
            // إضافة تاريخ الإنشاء إذا لم يكن موجودًا
            if (!loanData.createdAt) {
                loanData.createdAt = new Date().toISOString();
            }
            
            try {
                // محاولة استدعاء الدالة الأصلية
                return await originalUploadLoanDocuments.call(this, loanData);
            } catch (error) {
                console.error('تم التقاط خطأ في رفع مستندات القرض:', error);
                
                // إرجاع بيانات القرض دون تغيير كحل مؤقت
                if (typeof window.showNotification === 'function') {
                    window.showNotification('حدث خطأ أثناء رفع المستندات، سيتم حفظ البيانات الأساسية فقط', 'warning');
                }
                
                // إرجاع نسخة من البيانات الأصلية
                return { ...loanData };
            }
        };
        
        console.log('تم إصلاح دالة رفع المستندات');
    }
    
    // ===== 3. إصلاح دالة إضافة قرض =====
    
    // إذا كانت دالة addLoan موجودة، قم بإصلاحها
    if (typeof window.addLoan === 'function') {
        // حفظ الدالة الأصلية
        const originalAddLoan = window.addLoan;
        
        // استبدال الدالة بنسخة محسنة
        window.addLoan = function(newLoan) {
            // التأكد من وجود كائن newLoan
            if (!newLoan) {
                console.error('خطأ: بيانات القرض غير موجودة (addLoan)');
                return false;
            }
            
            // إضافة تاريخ الإنشاء إذا لم يكن موجودًا
            if (!newLoan.createdAt) {
                newLoan.createdAt = new Date().toISOString();
            }
            
            try {
                // محاولة استدعاء الدالة الأصلية
                return originalAddLoan.call(this, newLoan);
            } catch (error) {
                console.error('خطأ في إضافة القرض:', error);
                
                // محاولة تنفيذ عملية الإضافة يدويًا
                try {
                    if (window.loans && Array.isArray(window.loans)) {
                        window.loans.push(newLoan);
                        
                        // محاولة حفظ البيانات
                        if (typeof window.saveLoanData === 'function') {
                            window.saveLoanData();
                        }
                        
                        return true;
                    }
                } catch (fallbackError) {
                    console.error('فشل في محاولة الإضافة اليدوية للقرض:', fallbackError);
                }
                
                return false;
            }
        };
        
        console.log('تم إصلاح دالة إضافة قرض');
    }
    
    // ===== 4. إصلاح دالة عرض جدول القروض =====
    
    // إذا كانت دالة renderLoansTable موجودة، قم بإصلاحها
    if (typeof window.renderLoansTable === 'function') {
        // حفظ الدالة الأصلية
        const originalRenderLoansTable = window.renderLoansTable;
        
        // استبدال الدالة بنسخة محسنة
        window.renderLoansTable = function() {
            // التأكد من وجود مصفوفة القروض
            if (!window.loans) {
                window.loans = [];
            }
            
            // التأكد من أن التواريخ موجودة لكل قرض
            window.loans.forEach(loan => {
                if (!loan.createdAt) {
                    loan.createdAt = new Date().toISOString();
                }
            });
            
            try {
                // محاولة استدعاء الدالة الأصلية
                return originalRenderLoansTable.call(this);
            } catch (error) {
                console.error('خطأ في عرض جدول القروض:', error);
                
                // محاولة بسيطة لعرض الجدول
                const tableBody = document.querySelector('#loans-table tbody');
                if (tableBody) {
                    tableBody.innerHTML = '<tr><td colspan="9" class="text-center">حدث خطأ أثناء عرض القروض. يرجى تحديث الصفحة.</td></tr>';
                }
                
                // إخفاء الشاشة الفارغة
                const emptyPlaceholder = document.getElementById('loans-empty');
                if (emptyPlaceholder) {
                    emptyPlaceholder.style.display = window.loans.length === 0 ? 'flex' : 'none';
                }
                
                return null;
            }
        };
        
        console.log('تم إصلاح دالة عرض جدول القروض');
    }
    
    // ===== 5. إصلاح خطأ parentNode في permissions-enforcement.js =====
    
    // إضافة تابع آمن للعمليات على DOM
    function addDOMSafety() {
        // حماية للعمليات على parentNode
        const originalCreateElement = document.createElement;
        document.createElement = function() {
            const element = originalCreateElement.apply(this, arguments);
            
            // إضافة تابع آمن لخاصية parentNode
            const originalParentNodeGetter = Object.getOwnPropertyDescriptor(Node.prototype, 'parentNode').get;
            
            Object.defineProperty(element, 'parentNode', {
                get: function() {
                    try {
                        return originalParentNodeGetter.call(this);
                    } catch (error) {
                        console.warn('تم تجاوز خطأ في الوصول إلى parentNode:', error);
                        return null;
                    }
                }
            });
            
            return element;
        };
        
        // إضافة رقعة للأساليب التي تستخدم parentNode
        const safeRemoveChild = function(parent, child) {
            if (parent && child && typeof parent.removeChild === 'function') {
                try {
                    return parent.removeChild(child);
                } catch (error) {
                    console.warn('تم تجاوز خطأ في removeChild:', error);
                }
            }
            return null;
        };
        
        // إضافة الدالة المساعدة للنافذة
        window.safeRemoveChild = safeRemoveChild;
        
        console.log('تم إضافة حماية للعمليات على DOM');
    }
    
    // تنفيذ إصلاح DOM فقط إذا كانت المتصفح يدعم
    if (typeof document !== 'undefined' && typeof Node !== 'undefined') {
        try {
            addDOMSafety();
        } catch (error) {
            console.error('فشل في إضافة حماية DOM:', error);
        }
    }
    
    console.log('تم تطبيق الإصلاحات الفورية بنجاح');
    
    // تنفيذ الإصلاحات مرة أخرى بعد تحميل الصفحة للتأكد
    window.addEventListener('load', function() {
        // إعادة تطبيق الإصلاحات بعد تحميل الصفحة للتأكد
        setTimeout(function() {
            if (typeof window.renderLoansTable === 'function') {
                const reloadLoans = window.renderLoansTable;
                try {
                    reloadLoans();
                    console.log('تم إعادة تحميل جدول القروض بنجاح');
                } catch (error) {
                    console.error('فشل في إعادة تحميل جدول القروض:', error);
                }
            }
        }, 1000);
    });
})();






