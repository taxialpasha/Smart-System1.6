/**
 * employee-functions-complete-fix.js
 * Script para corregir todas las funciones faltantes en el sistema de empleados
 */

(function() {
    console.log("Aplicando corrección completa para funciones del sistema de empleados");
    
    // Esperar a que el documento esté completamente cargado
    document.addEventListener('DOMContentLoaded', function() {
        // Ejecutar después de un breve retraso para asegurar que todos los componentes estén cargados
        setTimeout(fixAllEmployeeFunctions, 300);
    });
    
    /**
     * Corregir todas las funciones del sistema de empleados
     */
    function fixAllEmployeeFunctions() {
        try {
            // 1. Definir o corregir openModal
            if (typeof window.openModal !== 'function') {
                window.openModal = function(modalId) {
                    console.log(`Abriendo modal: ${modalId}`);
                    
                    const modal = document.getElementById(modalId);
                    if (!modal) {
                        console.error(`Modal no encontrado: ${modalId}`);
                        return;
                    }
                    
                    modal.classList.add('active');
                    
                    // Acciones especiales según el modal
                    if (modalId === 'add-employee-modal') {
                        prepareAddEmployeeModal();
                    } else if (modalId === 'pay-salary-modal') {
                        preparePaySalaryModal();
                    }
                };
            }
            
            // 2. Definir o corregir closeModal
            if (typeof window.closeModal !== 'function') {
                window.closeModal = function(modalId) {
                    const modal = document.getElementById(modalId);
                    if (!modal) return;
                    
                    modal.classList.remove('active');
                };
            }
            
            // 3. Definir o corregir addNewEmployee
            if (typeof window.addNewEmployee !== 'function') {
                window.addNewEmployee = function() {
                    console.log('Añadiendo nuevo empleado...');
                    
                    // Recoger datos del empleado del formulario
                    const employeeData = collectEmployeeFormData();
                    
                    if (!employeeData) {
                        showNotification('Por favor, introduce todos los datos requeridos correctamente', 'error');
                        return;
                    }
                    
                    // Añadir ID único y fecha de creación
                    employeeData.id = Date.now().toString();
                    employeeData.createdAt = new Date().toISOString();
                    employeeData.status = 'active';
                    
                    // Añadir el empleado al array
                    if (!window.employees) window.employees = [];
                    window.employees.push(employeeData);
                    
                    // Guardar los datos
                    if (typeof window.saveEmployeesData === 'function') {
                        window.saveEmployeesData();
                    } else {
                        try {
                            localStorage.setItem('employees', JSON.stringify(window.employees));
                        } catch (error) {
                            console.error('Error al guardar datos de empleados:', error);
                        }
                    }
                    
                    // Actualizar la tabla
                    if (typeof window.renderEmployeesTable === 'function') {
                        window.renderEmployeesTable();
                    }
                    
                    // Cerrar el modal
                    closeModal('add-employee-modal');
                    
                    // Mostrar notificación de éxito
                    showNotification(`Empleado ${employeeData.name} añadido con éxito!`, 'success');
                };
            }
            
            // 4. Definir o corregir showEmployeeDetails
            if (typeof window.showEmployeeDetails !== 'function') {
                window.showEmployeeDetails = function(employeeId) {
                    console.log(`Mostrando detalles del empleado: ${employeeId}`);
                    
                    // Intentar usar la función del módulo si está disponible
                    if (window.EmployeesModule && typeof window.EmployeesModule.showEmployeeDetails === 'function') {
                        return window.EmployeesModule.showEmployeeDetails(employeeId);
                    }
                    
                    if (!window.employees) return;
                    
                    const employee = window.employees.find(emp => emp.id === employeeId);
                    if (!employee) {
                        showNotification('No se encontró al empleado', 'error');
                        return;
                    }
                    
                    // Verificar si hay una foto del empleado
                    const hasPhoto = employee.documents && employee.documents.photo;
                    
                    // Crear contenido del modal
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
                            </div>
                            
                            <div class="employee-detail-card">
                                <h4><i class="fas fa-briefcase"></i> معلومات وظيفية</h4>
                                <div class="employee-detail-item">
                                    <div class="employee-detail-label">المسمى الوظيفي</div>
                                    <div class="employee-detail-value">${employee.jobTitle}</div>
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
                    `;
                    
                    // Abrir el modal de detalles
                    openModal('employee-details-modal');
                    
                    // Actualizar el contenido del modal
                    const contentContainer = document.getElementById('employee-details-content');
                    if (contentContainer) {
                        contentContainer.innerHTML = content;
                    }
                    
                    // Actualizar el título del modal
                    const modalTitle = document.querySelector('#employee-details-modal .modal-title');
                    if (modalTitle) {
                        modalTitle.textContent = `تفاصيل الموظف - ${employee.name}`;
                    }
                    
                    // Añadir listeners para los botones
                    setupEmployeeDetailsButtons(employeeId);
                };
            }
            
            // 5. Definir o corregir editEmployee
            if (typeof window.editEmployee !== 'function') {
                window.editEmployee = function(employeeId) {
                    console.log(`تعديل الموظف: ${employeeId}`);
                    
                    if (!window.employees) return;
                    
                    const employee = window.employees.find(emp => emp.id === employeeId);
                    if (!employee) {
                        showNotification('لم يتم العثور على الموظف', 'error');
                        return;
                    }
                    
                    // Abrir el modal de añadir empleado
                    openModal('add-employee-modal');
                    
                    // Rellenar el formulario con los datos del empleado
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
                    
                    // Mostrar las imágenes si existen
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
                    
                    // Cambiar el título del modal
                    const modalTitle = document.querySelector('#add-employee-modal .modal-title');
                    if (modalTitle) {
                        modalTitle.textContent = 'تعديل بيانات الموظف';
                    }
                    
                    // Cambiar el texto del botón de guardar
                    const saveButton = document.getElementById('save-employee-btn');
                    if (saveButton) {
                        saveButton.textContent = 'حفظ التعديلات';
                        
                        // Guardar el handler original
                        const originalClickHandler = saveButton.onclick;
                        
                        // Asignar nuevo handler
                        saveButton.onclick = function() {
                            // Recoger los datos actualizados
                            const updatedEmployeeData = collectEmployeeFormData();
                            
                            if (!updatedEmployeeData) {
                                showNotification('يرجى إدخال جميع البيانات المطلوبة بشكل صحيح', 'error');
                                return;
                            }
                            
                            // Actualizar los datos del empleado manteniendo los datos originales
                            updatedEmployeeData.id = employee.id;
                            updatedEmployeeData.createdAt = employee.createdAt;
                            updatedEmployeeData.status = employee.status;
                            
                            // Actualizar el empleado en el array
                            const employeeIndex = window.employees.findIndex(emp => emp.id === employeeId);
                            if (employeeIndex !== -1) {
                                window.employees[employeeIndex] = updatedEmployeeData;
                                
                                // Guardar los datos
                                if (typeof window.saveEmployeesData === 'function') {
                                    window.saveEmployeesData();
                                } else {
                                    try {
                                        localStorage.setItem('employees', JSON.stringify(window.employees));
                                    } catch (error) {
                                        console.error('Error al guardar datos de empleados:', error);
                                    }
                                }
                                
                                // Actualizar la tabla
                                if (typeof window.renderEmployeesTable === 'function') {
                                    window.renderEmployeesTable();
                                }
                                
                                // Cerrar el modal
                                closeModal('add-employee-modal');
                                
                                // Mostrar notificación de éxito
                                showNotification(`تم تحديث بيانات الموظف ${updatedEmployeeData.name} بنجاح!`, 'success');
                            }
                            
                            // Restaurar el botón de guardar al estado original
                            saveButton.textContent = 'إضافة';
                            saveButton.onclick = originalClickHandler || addNewEmployee;
                        };
                    }
                };
            }
            
            // 6. Definir o corregir collectEmployeeFormData
            if (typeof window.collectEmployeeFormData !== 'function') {
                window.collectEmployeeFormData = function() {
                    // Datos personales
                    const name = document.getElementById('employee-name')?.value.trim();
                    const phone = document.getElementById('employee-phone')?.value.trim();
                    const address = document.getElementById('employee-address')?.value.trim();
                    const email = document.getElementById('employee-email')?.value.trim();
                    const birthdate = document.getElementById('employee-birthdate')?.value;
                    const gender = document.getElementById('employee-gender')?.value;
                    
                    // Datos laborales
                    const jobTitle = document.getElementById('employee-job-title')?.value.trim();
                    const department = document.getElementById('employee-department')?.value;
                    const baseSalary = parseFloat(document.getElementById('employee-base-salary')?.value);
                    const commissionRate = parseFloat(document.getElementById('employee-commission-rate')?.value);
                    const hireDate = document.getElementById('employee-hire-date')?.value;
                    const contractType = document.getElementById('employee-contract-type')?.value;
                    
                    // Datos de documentos
                    const idNumber = document.getElementById('employee-id-number')?.value.trim();
                    const residenceCard = document.getElementById('employee-residence-card')?.value.trim();
                    const notes = document.getElementById('employee-notes')?.value.trim();
                    
                    // Verificar datos requeridos
                    if (!name || !phone || !address || !jobTitle || !baseSalary || isNaN(baseSalary) || 
                        !commissionRate || isNaN(commissionRate) || !hireDate || !idNumber) {
                        return null;
                    }
                    
                    // Recoger datos de imágenes
                    const idCardPreview = document.getElementById('id-card-preview');
                    const residenceCardPreview = document.getElementById('residence-card-preview');
                    const employeePhotoPreview = document.getElementById('employee-photo-preview');
                    
                    // Extraer datos de imágenes si existen
                    const idCardImage = idCardPreview?.querySelector('img') ? 
                        idCardPreview.querySelector('img').src : '';
                    
                    const residenceCardImage = residenceCardPreview?.querySelector('img') ? 
                        residenceCardPreview.querySelector('img').src : '';
                    
                    const photoImage = employeePhotoPreview?.querySelector('img') ? 
                        employeePhotoPreview.querySelector('img').src : '';
                    
                    // Crear objeto de empleado
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
                };
            }
            
            // 7. Definir o corregir formatCurrency si es necesario
            if (typeof window.formatCurrency !== 'function') {
                window.formatCurrency = function(amount, addCurrency = true) {
                    if (amount === undefined || amount === null || isNaN(amount)) {
                        return addCurrency ? "0 دينار" : "0";
                    }
                    
                    amount = parseFloat(amount);
                    if (amount % 1 !== 0) {
                        amount = amount.toFixed(0);
                    }
                    
                    const parts = amount.toString().split('.');
                    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    
                    const formattedAmount = parts.join('.');
                    
                    if (addCurrency) {
                        return formattedAmount + " دينار";
                    } else {
                        return formattedAmount;
                    }
                };
            }
            
            // 8. Definir o corregir showNotification si es necesario
            if (typeof window.showNotification !== 'function') {
                window.showNotification = function(message, type = 'success') {
                    console.log(`[${type}] ${message}`);
                    
                    // Crear elemento de notificación
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
                    
                    // Añadir la notificación al documento
                    document.body.appendChild(notification);
                    
                    // Añadir listener para el cierre
                    const closeButton = notification.querySelector('.notification-close');
                    if (closeButton) {
                        closeButton.addEventListener('click', () => {
                            document.body.removeChild(notification);
                        });
                    }
                    
                    // Cerrar automáticamente después de 5 segundos
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                        }
                    }, 5000);
                };
                
                function getNotificationIcon(type) {
                    switch (type) {
                        case 'success': return 'fa-check-circle';
                        case 'error': return 'fa-times-circle';
                        case 'warning': return 'fa-exclamation-triangle';
                        case 'info': default: return 'fa-info-circle';
                    }
                }
                
                function getNotificationTitle(type) {
                    switch (type) {
                        case 'success': return 'نجاح';
                        case 'error': return 'خطأ';
                        case 'warning': return 'تنبيه';
                        case 'info': default: return 'معلومات';
                    }
                }
            }
            
            console.log("Corrección completa para funciones del sistema de empleados aplicada con éxito");
            
        } catch (error) {
            console.error("Error al aplicar la corrección completa para funciones del sistema de empleados:", error);
        }
    }
    
    /**
     * Preparar el modal de añadir empleado
     */
    function prepareAddEmployeeModal() {
        try {
            // Resetear el formulario
            const form = document.getElementById('add-employee-form');
            if (form) form.reset();
            
            // Resetear las previsualizaciones de imágenes
            const idCardPreview = document.getElementById('id-card-preview');
            if (idCardPreview) idCardPreview.innerHTML = '';
            
            const residenceCardPreview = document.getElementById('residence-card-preview');
            if (residenceCardPreview) residenceCardPreview.innerHTML = '';
            
            const employeePhotoPreview = document.getElementById('employee-photo-preview');
            if (employeePhotoPreview) employeePhotoPreview.innerHTML = '';
            
            // Resetear las pestañas del formulario
            document.querySelectorAll('.form-tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            const personalInfoTab = document.querySelector('.form-tab-btn[data-tab="personal-info"]');
            if (personalInfoTab) personalInfoTab.classList.add('active');
            
            document.querySelectorAll('.form-tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            const personalInfoContent = document.getElementById('personal-info-tab');
            if (personalInfoContent) personalInfoContent.classList.add('active');
            
            // Resetear título y botón de guardar
            const modalTitle = document.querySelector('#add-employee-modal .modal-title');
            if (modalTitle) modalTitle.textContent = 'إضافة موظف جديد';
            
            const saveButton = document.getElementById('save-employee-btn');
            if (saveButton) {
                saveButton.textContent = 'إضافة';
                saveButton.onclick = addNewEmployee;
            }
            
            // Establecer fecha actual en la fecha de contratación
            const hireDateInput = document.getElementById('employee-hire-date');
            if (hireDateInput) {
                hireDateInput.value = new Date().toISOString().split('T')[0];
            }
        } catch (error) {
            console.error("Error al preparar el modal de añadir empleado:", error);
        }
    }
    
    /**
     * Preparar el modal de pagar salario
     */
    function preparePaySalaryModal() {
        try {
            // Resetear el formulario
            const form = document.getElementById('pay-salary-form');
            if (form) form.reset();
            
            // Ocultar la información del empleado
            const salaryInfoContainer = document.getElementById('employee-salary-info');
            if (salaryInfoContainer) salaryInfoContainer.style.display = 'none';
            
            // Poblar el select de empleados
            if (typeof window.populateEmployeeSelect === 'function') {
                window.populateEmployeeSelect();
            } else {
                populateEmployeeSelectFallback();
            }
            
            // Establecer fecha actual
            const salaryDateInput = document.getElementById('salary-date');
            if (salaryDateInput) {
                salaryDateInput.value = new Date().toISOString().split('T')[0];
            }
            
            // Establecer mes actual
            const salaryMonthSelect = document.getElementById('salary-month');
            if (salaryMonthSelect) {
                const currentMonth = new Date().getMonth() + 1; // Los meses empiezan en 0
                salaryMonthSelect.value = currentMonth.toString();
            }
        } catch (error) {
            console.error("Error al preparar el modal de pagar salario:", error);
        }
    }
    
    /**
     * Fallback para poblar el select de empleados
     */
    function populateEmployeeSelectFallback() {
        const employeeSelect = document.getElementById('salary-employee');
        if (!employeeSelect || !window.employees) return;
        
        // Vaciar el select
        employeeSelect.innerHTML = '<option value="">اختر الموظف</option>';
        
        // Ordenar empleados alfabéticamente
        const sortedEmployees = [...window.employees]
            .filter(employee => employee.status !== 'inactive')
            .sort((a, b) => a.name.localeCompare(b.name));
        
        // Añadir empleados al select
        sortedEmployees.forEach(employee => {
            const option = document.createElement('option');
            option.value = employee.id;
            option.textContent = `${employee.name} (${employee.jobTitle})`;
            employeeSelect.appendChild(option);
        });
    }
    
    /**
     * Configurar los botones en los detalles del empleado
     */
    function setupEmployeeDetailsButtons(employeeId) {
        const editButton = document.getElementById('edit-employee-btn');
        const paySalaryButton = document.getElementById('employee-pay-salary-btn');
        const deleteButton = document.getElementById('delete-employee-btn');
        
        if (editButton) {
            editButton.setAttribute('data-id', employeeId);
            editButton.onclick = function() {
                closeModal('employee-details-modal');
                if (typeof window.editEmployee === 'function') {
                    window.editEmployee(employeeId);
                }
            };
        }
        
        if (paySalaryButton) {
            paySalaryButton.setAttribute('data-id', employeeId);
            paySalaryButton.onclick = function() {
                closeModal('employee-details-modal');
                if (typeof window.openPaySalaryModalForEmployee === 'function') {
                    window.openPaySalaryModalForEmployee(employeeId);
                } else {
                    // Implementación alternativa
                    openModal('pay-salary-modal');
                    const employeeSelect = document.getElementById('salary-employee');
                    if (employeeSelect) {
                        employeeSelect.value = employeeId;
                        // Actualizar información del empleado
                        if (typeof window.updateEmployeeSalaryInfo === 'function') {
                            window.updateEmployeeSalaryInfo();
                        }
                    }
                }
            };
        }
        
        if (deleteButton) {
            deleteButton.setAttribute('data-id', employeeId);
            deleteButton.onclick = function() {
                closeModal('employee-details-modal');
                if (typeof window.deleteEmployee === 'function') {
                    window.deleteEmployee(employeeId);
                } else {
                    // Implementación alternativa
                    if (confirm(`هل أنت متأكد من رغبتك في حذف هذا الموظف؟`)) {
                        if (!window.employees) return;
                        
                        const employee = window.employees.find(emp => emp.id === employeeId);
                        if (!employee) return;
                        
                        // Eliminar el empleado
                        window.employees = window.employees.filter(emp => emp.id !== employeeId);
                        
                        // Eliminar transacciones de salario asociadas
                        if (window.salaryTransactions) {
                            window.salaryTransactions = window.salaryTransactions.filter(
                                transaction => transaction.employeeId !== employeeId
                            );
                        }
                        
                        // Guardar datos
                        try {
                            localStorage.setItem('employees', JSON.stringify(window.employees));
                            if (window.salaryTransactions) {
                                localStorage.setItem('salaryTransactions', JSON.stringify(window.salaryTransactions));
                            }
                        } catch (error) {
                            console.error('Error al guardar después de eliminar empleado:', error);
                        }
                        
                        // Actualizar tabla
                        if (typeof window.renderEmployeesTable === 'function') {
                            window.renderEmployeesTable();
                        }
                        
                        // Mostrar notificación
                        if (typeof window.showNotification === 'function') {
                            window.showNotification(`تم حذف الموظف ${employee.name} بنجاح!`, 'success');
                        }
                    }
                }
            };
        }
    }
})();