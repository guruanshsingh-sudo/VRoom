// Dashboard Application JavaScript
class DashboardApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupCollapsibleSections();
        this.setupTaskInteractions();
        this.setupProgressTracking();
        this.setupFilters();
        this.setupProgressRings();
        this.initializeDefaultStates();
        this.setupKeyboardNavigation();
    }

    // Initialize default states
    initializeDefaultStates() {
        // Keep overview and stages sections open by default
        const defaultOpenSections = ['overview', 'stages'];
        defaultOpenSections.forEach(sectionId => {
            const content = document.getElementById(`${sectionId}-content`);
            const header = document.querySelector(`[data-section="${sectionId}"]`);
            if (content && header) {
                content.classList.remove('hidden');
                const arrow = header.querySelector('.toggle-arrow');
                if (arrow) {
                    arrow.classList.remove('rotated');
                }
            }
        });

        // Keep stage 1 open by default
        const stage1Content = document.getElementById('stage-1-content');
        const stage1Header = document.querySelector('[data-section="stage-1"]');
        if (stage1Content && stage1Header) {
            stage1Content.classList.remove('hidden');
            const arrow = stage1Header.querySelector('.toggle-arrow');
            if (arrow) {
                arrow.classList.remove('rotated');
            }
        }

        // Initialize progress tracking with current state
        this.updateStageProgress();
        this.updateOverallProgress();
    }

    // Setup collapsible sections
    setupCollapsibleSections() {
        const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
        
        collapsibleHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                this.toggleSection(header);
            });

            // Add keyboard support
            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleSection(header);
                }
            });

            // Make headers focusable
            if (!header.hasAttribute('tabindex')) {
                header.setAttribute('tabindex', '0');
            }
        });
    }

    toggleSection(header) {
        const sectionId = header.getAttribute('data-section');
        const content = document.getElementById(`${sectionId}-content`);
        const arrow = header.querySelector('.toggle-arrow');
        
        if (content && arrow) {
            const isHidden = content.classList.contains('hidden');
            
            if (isHidden) {
                content.classList.remove('hidden');
                arrow.classList.remove('rotated');
                this.animateExpand(content);
            } else {
                content.classList.add('hidden');
                arrow.classList.add('rotated');
            }
        }
    }

    animateExpand(element) {
        // Simple fade-in animation
        element.style.opacity = '0';
        element.style.transform = 'translateY(-10px)';
        
        requestAnimationFrame(() => {
            element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });

        setTimeout(() => {
            element.style.transition = '';
            element.style.opacity = '';
            element.style.transform = '';
        }, 300);
    }

    // Setup task checkbox interactions
    setupTaskInteractions() {
        const taskItems = document.querySelectorAll('.task-item');
        
        taskItems.forEach(taskItem => {
            const checkbox = taskItem.querySelector('input[type="checkbox"]');
            
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    this.updateTaskStatus(taskItem, checkbox.checked);
                    // Add small delay to ensure DOM is updated before recalculating progress
                    setTimeout(() => {
                        this.updateStageProgress();
                        this.updateOverallProgress();
                    }, 10);
                });
            }

            // Click anywhere on task item to toggle checkbox
            taskItem.addEventListener('click', (e) => {
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
        });
    }

    updateTaskStatus(taskItem, isCompleted) {
        const taskText = taskItem.querySelector('.task-text');
        const taskAssignee = taskItem.querySelector('.task-assignee');
        
        if (isCompleted) {
            taskItem.classList.add('completed');
            taskText.style.textDecoration = 'line-through';
            taskText.style.color = 'var(--color-text-secondary)';
            if (taskAssignee) {
                taskAssignee.style.opacity = '0.6';
            }
        } else {
            taskItem.classList.remove('completed');
            taskText.style.textDecoration = '';
            taskText.style.color = '';
            if (taskAssignee) {
                taskAssignee.style.opacity = '';
            }
        }
    }

    // Update progress tracking
    updateStageProgress() {
        const stageCards = document.querySelectorAll('.stage-card');
        
        stageCards.forEach(stageCard => {
            const tasks = stageCard.querySelectorAll('.task-item input[type="checkbox"]');
            const completedTasks = stageCard.querySelectorAll('.task-item input[type="checkbox"]:checked');
            
            if (tasks.length > 0) {
                const progressPercentage = Math.round((completedTasks.length / tasks.length) * 100);
                
                const progressFill = stageCard.querySelector('.progress-fill');
                const progressText = stageCard.querySelector('.progress-text');
                
                if (progressFill) {
                    progressFill.style.width = `${progressPercentage}%`;
                }
                
                if (progressText) {
                    progressText.textContent = `${progressPercentage}%`;
                }

                // Update stage status based on progress
                this.updateStageStatus(stageCard, progressPercentage);
            }
        });
    }

    updateStageStatus(stageCard, progressPercentage) {
        const statusBadge = stageCard.querySelector('.status-badge');
        
        if (statusBadge && !statusBadge.textContent.includes('Not Started')) {
            if (progressPercentage === 100) {
                statusBadge.textContent = 'Completed';
                statusBadge.className = 'status-badge status--success';
            } else if (progressPercentage > 0) {
                statusBadge.textContent = 'In Progress';
                statusBadge.className = 'status-badge status--warning';
            } else {
                statusBadge.textContent = 'Planning';
                statusBadge.className = 'status-badge status--info';
            }
        }
    }

    updateOverallProgress() {
        const allTasks = document.querySelectorAll('.task-item input[type="checkbox"]');
        const completedTasks = document.querySelectorAll('.task-item input[type="checkbox"]:checked');
        
        if (allTasks.length > 0) {
            const overallProgress = Math.round((completedTasks.length / allTasks.length) * 100);
            
            // Update header progress - find the first stat item that contains percentage
            const statItems = document.querySelectorAll('.quick-stats .stat-item');
            statItems.forEach(statItem => {
                const statValue = statItem.querySelector('.stat-value');
                const statLabel = statItem.querySelector('.stat-label');
                if (statLabel && statLabel.textContent === 'Overall Progress') {
                    statValue.textContent = `${overallProgress}%`;
                }
            });

            // Update progress ring
            this.updateProgressRing(overallProgress);
        }
    }

    updateProgressRing(percentage) {
        const progressRing = document.querySelector('.progress-ring');
        const progressValue = document.querySelector('.progress-value');
        
        if (progressRing && progressValue) {
            const angle = (percentage / 100) * 360;
            progressRing.style.background = `conic-gradient(var(--color-primary) ${angle}deg, var(--color-secondary) ${angle}deg)`;
            progressValue.textContent = `${percentage}%`;
        }
    }

    // Setup progress rings
    setupProgressRings() {
        const progressRings = document.querySelectorAll('.progress-ring[data-progress]');
        
        progressRings.forEach(ring => {
            const progress = parseInt(ring.getAttribute('data-progress'));
            const progressValue = ring.querySelector('.progress-value');
            
            if (progressValue) {
                progressValue.textContent = `${progress}%`;
                
                // Animate the ring
                setTimeout(() => {
                    const angle = (progress / 100) * 360;
                    ring.style.background = `conic-gradient(var(--color-primary) ${angle}deg, var(--color-secondary) ${angle}deg)`;
                }, 100);
            }
        });
    }

    // Setup database filters
    setupFilters() {
        const filterSelects = document.querySelectorAll('.database-filters select');
        
        filterSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                this.filterDatabase(select, e.target.value);
            });

            // Initialize with default filter state
            this.filterDatabase(select, select.value);
        });
    }

    filterDatabase(selectElement, filterValue) {
        const database = selectElement.closest('.stakeholder-database');
        if (!database) return;
        
        const rows = database.querySelectorAll('.table-row');
        let visibleCount = 0;
        
        rows.forEach(row => {
            const teamTag = row.querySelector('.team-tag');
            const shouldShow = filterValue === 'All Teams' || (teamTag && teamTag.textContent.trim() === filterValue);
            
            if (shouldShow) {
                row.style.display = 'grid'; // Use grid to maintain table layout
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        // Add filter feedback
        this.showFilterFeedback(database, filterValue, visibleCount);
    }

    showFilterFeedback(database, filterValue, resultCount) {
        // Remove existing feedback
        const existingFeedback = database.querySelector('.filter-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        // Add new feedback if filtering
        if (filterValue !== 'All Teams') {
            const feedback = document.createElement('div');
            feedback.className = 'filter-feedback';
            feedback.style.cssText = `
                padding: var(--space-8) var(--space-16);
                background-color: var(--color-bg-1);
                border-bottom: 1px solid var(--color-card-border-inner);
                font-size: var(--font-size-sm);
                color: var(--color-text-secondary);
                animation: slideDown 0.3s ease;
            `;
            feedback.textContent = `Showing ${resultCount} result(s) for: ${filterValue}`;
            
            const tableContainer = database.querySelector('.database-table');
            tableContainer.insertBefore(feedback, tableContainer.firstChild);
        }
    }

    // Setup keyboard navigation
    setupKeyboardNavigation() {
        // Add keyboard support for resource links
        const resourceLinks = document.querySelectorAll('.resource-link');
        resourceLinks.forEach(link => {
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleResourceClick(link);
                }
            });

            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleResourceClick(link);
            });
        });

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + / to show shortcuts (simulated)
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.showKeyboardShortcuts();
            }

            // Escape to close any open modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    handleResourceClick(link) {
        const resourceName = link.textContent;
        this.showResourceModal(resourceName);
    }

    showResourceModal(resourceName) {
        // Create and show a modal (simulated)
        const modal = this.createModal(resourceName);
        document.body.appendChild(modal);
        
        // Focus management
        const closeButton = modal.querySelector('.modal-close');
        if (closeButton) {
            closeButton.focus();
        }

        // Auto-close after 3 seconds
        setTimeout(() => {
            this.closeModal(modal);
        }, 3000);
    }

    createModal(resourceName) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        `;

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.cssText = `
            background-color: var(--color-surface);
            border-radius: var(--radius-lg);
            padding: var(--space-24);
            max-width: 400px;
            width: 90%;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--color-card-border);
        `;

        modalContent.innerHTML = `
            <h3 style="margin: 0 0 var(--space-12) 0; color: var(--color-text);">📄 ${resourceName}</h3>
            <p style="margin: 0 0 var(--space-16) 0; color: var(--color-text-secondary); font-size: var(--font-size-sm);">
                This resource would contain detailed information about ${resourceName.toLowerCase()}. 
                In a real implementation, this would link to the actual document or open an embedded viewer.
            </p>
            <button class="btn btn--primary modal-close" style="margin-right: var(--space-8);">Close</button>
            <button class="btn btn--outline">Download</button>
        `;

        modal.appendChild(modalContent);

        // Add click handlers
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });

        const closeButton = modalContent.querySelector('.modal-close');
        closeButton.addEventListener('click', () => {
            this.closeModal(modal);
        });

        return modal;
    }

    closeModal(modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => this.closeModal(modal));
    }

    showKeyboardShortcuts() {
        const shortcutsModal = document.createElement('div');
        shortcutsModal.className = 'modal';
        shortcutsModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        `;

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.cssText = `
            background-color: var(--color-surface);
            border-radius: var(--radius-lg);
            padding: var(--space-24);
            max-width: 500px;
            width: 90%;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--color-card-border);
        `;

        modalContent.innerHTML = `
            <h3 style="margin: 0 0 var(--space-16) 0; color: var(--color-text);">⌨️ Keyboard Shortcuts</h3>
            <div style="display: grid; gap: var(--space-8); margin-bottom: var(--space-16);">
                <div style="display: flex; justify-content: space-between; padding: var(--space-6) 0;">
                    <span style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">Toggle section</span>
                    <kbd style="background: var(--color-secondary); padding: var(--space-2) var(--space-6); border-radius: var(--radius-sm); font-size: var(--font-size-xs);">Enter / Space</kbd>
                </div>
                <div style="display: flex; justify-content: space-between; padding: var(--space-6) 0;">
                    <span style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">Show shortcuts</span>
                    <kbd style="background: var(--color-secondary); padding: var(--space-2) var(--space-6); border-radius: var(--radius-sm); font-size: var(--font-size-xs);">Ctrl + /</kbd>
                </div>
                <div style="display: flex; justify-content: space-between; padding: var(--space-6) 0;">
                    <span style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">Close modal</span>
                    <kbd style="background: var(--color-secondary); padding: var(--space-2) var(--space-6); border-radius: var(--radius-sm); font-size: var(--font-size-xs);">Escape</kbd>
                </div>
            </div>
            <button class="btn btn--primary modal-close">Got it</button>
        `;

        shortcutsModal.appendChild(modalContent);

        // Add click handlers
        shortcutsModal.addEventListener('click', (e) => {
            if (e.target === shortcutsModal) {
                this.closeModal(shortcutsModal);
            }
        });

        const closeButton = modalContent.querySelector('.modal-close');
        closeButton.addEventListener('click', () => {
            this.closeModal(shortcutsModal);
        });

        document.body.appendChild(shortcutsModal);
        closeButton.focus();
    }

    // Simulate real-time updates
    simulateRealTimeUpdates() {
        setInterval(() => {
            this.updateMetrics();
        }, 30000); // Update every 30 seconds
    }

    updateMetrics() {
        const metricValues = document.querySelectorAll('.metric-value-large');
        
        metricValues.forEach(metric => {
            const currentValue = metric.textContent;
            
            // Simulate small changes in metrics
            if (currentValue.includes('%')) {
                const numValue = parseInt(currentValue);
                const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
                const newValue = Math.max(0, Math.min(100, numValue + change));
                metric.textContent = `${newValue}%`;
            } else if (currentValue.includes(',')) {
                const numValue = parseInt(currentValue.replace(',', ''));
                const change = Math.floor(Math.random() * 1000) - 500;
                const newValue = Math.max(0, numValue + change);
                metric.textContent = newValue.toLocaleString();
            }
        });
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.9); }
    }
    
    .modal {
        animation: fadeIn 0.3s ease;
    }
    
    .filter-feedback {
        animation: slideDown 0.3s ease;
    }
    
    @keyframes slideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new DashboardApp();
    
    // Start real-time updates simulation
    dashboard.simulateRealTimeUpdates();
    
    // Add some initial interactivity hints
    setTimeout(() => {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: var(--space-20);
            right: var(--space-20);
            background-color: var(--color-surface);
            border: 1px solid var(--color-card-border);
            border-radius: var(--radius-md);
            padding: var(--space-12) var(--space-16);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            font-size: var(--font-size-sm);
            color: var(--color-text);
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;
        
        toast.innerHTML = `
            <strong>💡 Tip:</strong> Press <kbd style="background: var(--color-secondary); padding: var(--space-1) var(--space-4); border-radius: var(--radius-sm); font-size: var(--font-size-xs);">Ctrl+/</kbd> to see keyboard shortcuts
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }, 2000);
});

// Add additional CSS for animations
const additionalStyle = document.createElement('style');
additionalStyle.textContent = `
    @keyframes slideInRight {
        from { opacity: 0; transform: translateX(100%); }
        to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes slideOutRight {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100%); }
    }
`;
document.head.appendChild(additionalStyle);