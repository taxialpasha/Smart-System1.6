/**
 * employee-add-fix.js
 * ملف لإصلاح مشكلة تكرار إضافة الموظف في قائمة الموظفين
 */

(function() {
    console.log("تطبيق إصلاح مشكلة تكرار إضافة الموظفين");
    
    // متغير للتحقق من حالة الإضافة
    let isAddingEmployee = false;
    
    // الانتظار حتى اكتمال تحميل المستند
    document.addEventListener('DOMContentLoaded', function() {
        // تنفيذ الإصلاح بعد تأخير قصير للتأكد من تحميل جميع المكونات
        setTimeout(fixEmployeeAddDuplication, 500);
    });
    
    /**
     * إصلاح مشكلة تكرار إضافة الموظفين
     */
    function fixEmployeeAddDuplication() {
        try {
            // 1. الوصول إلى زر الإضافة
            const saveEmployeeBtn = document.getElementById('save-employee-btn');
            if (!saveEmployeeBtn) {
                console.warn("لم يتم العثور على زر حفظ الموظف");
                return;
            }
            
            // 2. إزالة جميع مستمعي الأحداث الحالية
            const newButton = saveEmployeeBtn.cloneNode(true);
            saveEmployeeBtn.parentNode.replaceChild(newButton, saveEmployeeBtn);
            
            // 3. إضافة مستمع حدث جديد مع تحقق إضافي
            newButton.addEventListener('click', function(event) {
                // منع تكرار العملية إذا كانت جارية بالفعل
                if (isAddingEmployee) {
                    console.log("عملية إضافة الموظف جارية بالفعل، تجاهل النقرة المتكررة");
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                }
                
                // تعيين حالة الإضافة
                isAddingEmployee = true;
                
                // استدعاء دالة إضافة الموظف الأصلية
                console.log("إضافة موظف جديد (مع منع التكرار)...");
                
                try {
                    // جمع بيانات الموظف
                    const employeeData = collectEmployeeFormData();
                    
                    if (!employeeData) {
                        showNotification('يرجى إدخال جميع البيانات المطلوبة بشكل صحيح', 'error');
                        isAddingEmployee = false;
                        return;
                    }
                    
                    // التحقق من عدم وجود موظف بنفس البيانات
                    const isDuplicate = checkDuplicateEmployee(employeeData);
                    if (isDuplicate) {
                        showNotification('يوجد موظف بنفس البيانات مسجل بالفعل', 'warning');
                        isAddingEmployee = false;
                        return;
                    }
                    
                    // إضافة معرف فريد وتاريخ الإنشاء
                    employeeData.id = Date.now().toString();
                    employeeData.createdAt = new Date().toISOString();
                    employeeData.status = 'active';
                    
                    // إضافة الموظف إلى المصفوفة
                    window.employees.push(employeeData);
                    
                    // حفظ البيانات
                    saveEmployeesData();
                    
                    // تحديث الجدول
                    renderEmployeesTable();
                    
                    // إغلاق النافذة المنبثقة
                    closeModal('add-employee-modal');
                    
                    // عرض إشعار النجاح
                    showNotification(`تم إضافة الموظف ${employeeData.name} بنجاح!`, 'success');
                } catch (error) {
                    console.error("حدث خطأ أثناء إضافة الموظف:", error);
                    showNotification('حدث خطأ أثناء إضافة الموظف', 'error');
                } finally {
                    // إعادة تعيين حالة الإضافة في جميع الحالات
                    setTimeout(function() {
                        isAddingEmployee = false;
                    }, 500);
                }
            });
            
            console.log("تم تطبيق إصلاح مشكلة تكرار إضافة الموظفين بنجاح");
        } catch (error) {
            console.error("حدث خطأ أثناء تطبيق إصلاح مشكلة تكرار إضافة الموظفين:", error);
        }
    }
    
    /**
     * التحقق من وجود موظف بنفس البيانات
     * @param {Object} employeeData - بيانات الموظف المراد التحقق منها
     * @returns {boolean} - إذا كان هناك موظف بنفس البيانات
     */
    function checkDuplicateEmployee(employeeData) {
        if (!window.employees || !Array.isArray(window.employees)) {
            return false;
        }
        
        // التحقق من وجود موظف بنفس الاسم ورقم الهاتف
        return window.employees.some(employee => 
            employee.name === employeeData.name && 
            employee.phone === employeeData.phone
        );
    }
    
    /**
     * جمع بيانات الموظف من النموذج
     * نسخة من الدالة الأصلية للتوافق
     */
    function collectEmployeeFormData() {
        // استخدام الدالة الأصلية إذا كانت متاحة
        if (typeof window.collectEmployeeFormData === 'function') {
            return window.collectEmployeeFormData();
        }
        
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
     * وظيفة مساعدة لعرض الإشعارات
     * تستخدم الدالة الموجودة في النظام إذا كانت متاحة
     */
    function showNotification(message, type = 'success') {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            console.log(`إشعار (${type}): ${message}`);
            alert(message);
        }
    }
})();