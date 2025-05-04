/**
 * employee-function-fix.js
 * Archivo para corregir funciones no definidas en el sistema de empleados
 */

(function() {
    console.log("Aplicando corrección para funciones no definidas");
    
    // Esperar a que el documento esté completamente cargado
    document.addEventListener('DOMContentLoaded', function() {
        // Ejecutar después de un breve retraso para asegurar que todos los componentes estén cargados
        setTimeout(fixMissingFunctions, 500);
    });
    
    /**
     * Corregir las funciones que faltan
     */
    function fixMissingFunctions() {
        try {
            // Verificar si la función showEmployeeDetails está definida
            if (typeof window.showEmployeeDetails !== 'function') {
                // Definir la función si no existe
                window.showEmployeeDetails = function(employeeId) {
                    console.log(`Mostrando detalles del empleado: ${employeeId}`);
                    
                    // Intentar usar la función del módulo si está disponible
                    if (window.EmployeesModule && typeof window.EmployeesModule.showEmployeeDetails === 'function') {
                        return window.EmployeesModule.showEmployeeDetails(employeeId);
                    }
                    
                    // Implementación alternativa
                    const employee = window.employees ? window.employees.find(emp => emp.id === employeeId) : null;
                    if (!employee) {
                        if (typeof window.showNotification === 'function') {
                            window.showNotification('No se encontró al empleado', 'error');
                        } else {
                            alert('No se encontró al empleado');
                        }
                        return;
                    }
                    
                    // Abrir modal de detalles
                    const modal = document.getElementById('employee-details-modal');
                    if (modal) {
                        modal.classList.add('active');
                        
                        // Actualizar el título del modal
                        const modalTitle = modal.querySelector('.modal-title');
                        if (modalTitle) {
                            modalTitle.textContent = `Detalles del empleado - ${employee.name}`;
                        }
                        
                        // Llenar el contenido con datos básicos mientras se carga completamente
                        const contentContainer = modal.querySelector('#employee-details-content');
                        if (contentContainer) {
                            contentContainer.innerHTML = `
                                <div class="text-center">
                                    <p>Cargando detalles de ${employee.name}...</p>
                                </div>
                            `;
                            
                            // Intentar cargar los detalles completos
                            setTimeout(function() {
                                renderEmployeeDetails(employee, contentContainer);
                            }, 100);
                        }
                    }
                };
                
                console.log("Función showEmployeeDetails definida correctamente");
            }
            
            // Verificar otras funciones que podrían faltar
            checkAndFixOtherFunctions();
            
            console.log("Corrección para funciones no definidas aplicada con éxito");
        } catch (error) {
            console.error("Error al aplicar la corrección para funciones no definidas:", error);
        }
    }
    
    /**
     * Renderizar detalles del empleado
     */
    function renderEmployeeDetails(employee, container) {
        if (!employee || !container) return;
        
        // Verificar si hay una foto del empleado
        const hasPhoto = employee.documents && employee.documents.photo;
        
        // Crear contenido del modal
        container.innerHTML = `
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
                    <span class="employee-status ${employee.status}">${employee.status === 'active' ? 'Activo' : 'Inactivo'}</span>
                </div>
            </div>
            
            <div class="employee-details-grid">
                <div class="employee-detail-card">
                    <h4><i class="fas fa-user"></i> Información Personal</h4>
                    <div class="employee-detail-item">
                        <div class="employee-detail-label">Teléfono</div>
                        <div class="employee-detail-value">${employee.phone}</div>
                    </div>
                    <div class="employee-detail-item">
                        <div class="employee-detail-label">Dirección</div>
                        <div class="employee-detail-value">${employee.address || 'No especificado'}</div>
                    </div>
                    <div class="employee-detail-item">
                        <div class="employee-detail-label">Email</div>
                        <div class="employee-detail-value">${employee.email || 'No especificado'}</div>
                    </div>
                </div>
                
                <div class="employee-detail-card">
                    <h4><i class="fas fa-briefcase"></i> Información Laboral</h4>
                    <div class="employee-detail-item">
                        <div class="employee-detail-label">Cargo</div>
                        <div class="employee-detail-value">${employee.jobTitle}</div>
                    </div>
                    <div class="employee-detail-item">
                        <div class="employee-detail-label">Salario Base</div>
                        <div class="employee-detail-value">${formatCurrency(employee.baseSalary || 0)}</div>
                    </div>
                    <div class="employee-detail-item">
                        <div class="employee-detail-label">Comisión</div>
                        <div class="employee-detail-value">${employee.commissionRate || 0}%</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Verificar y corregir otras funciones que podrían faltar
     */
    function checkAndFixOtherFunctions() {
        // Formatear moneda
        if (typeof window.formatCurrency !== 'function') {
            window.formatCurrency = function(amount, addCurrency = true) {
                if (amount === undefined || amount === null || isNaN(amount)) {
                    return addCurrency ? "0 dinar" : "0";
                }
                
                amount = parseFloat(amount);
                if (amount % 1 !== 0) {
                    amount = amount.toFixed(0);
                }
                
                const parts = amount.toString().split('.');
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                
                const formattedAmount = parts.join('.');
                
                if (addCurrency) {
                    return formattedAmount + " dinar";
                } else {
                    return formattedAmount;
                }
            };
        }
        
        // Abrir modal
        if (typeof window.openModal !== 'function') {
            window.openModal = function(modalId) {
                const modal = document.getElementById(modalId);
                if (!modal) return;
                
                modal.classList.add('active');
            };
        }
        
        // Cerrar modal
        if (typeof window.closeModal !== 'function') {
            window.closeModal = function(modalId) {
                const modal = document.getElementById(modalId);
                if (!modal) return;
                
                modal.classList.remove('active');
            };
        }
    }
})();