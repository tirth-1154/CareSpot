/* ═══════════════════════════════════════════════════════════
   DocSpot Custom Admin Panel — JavaScript
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

    // ─── Sidebar Toggle (Mobile) ─────────────────────────────
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('adminSidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function () {
            sidebar.classList.toggle('open');
            if (overlay) overlay.classList.toggle('show');
        });
    }
    if (overlay) {
        overlay.addEventListener('click', function () {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
        });
    }

    // ─── Counter Animation ───────────────────────────────────
    const counters = document.querySelectorAll('.counter-value');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        if (isNaN(target)) return;

        let current = 0;
        const duration = 1200;
        const step = Math.max(1, Math.ceil(target / (duration / 16)));

        function update() {
            current += step;
            if (current >= target) {
                counter.textContent = target;
            } else {
                counter.textContent = current;
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    });

    // ─── Delete Modal ────────────────────────────────────────
    window.showDeleteModal = function (url, itemName) {
        const modal = document.getElementById('deleteModal');
        const itemLabel = document.getElementById('deleteItemName');
        const confirmBtn = document.getElementById('confirmDeleteBtn');

        if (modal && itemLabel && confirmBtn) {
            itemLabel.textContent = itemName || 'this item';
            modal.classList.add('show');

            // Clone node to remove old event listeners
            const newBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

            newBtn.addEventListener('click', function () {
                performDelete(url, modal);
            });
        }
    };

    window.closeDeleteModal = function () {
        const modal = document.getElementById('deleteModal');
        if (modal) modal.classList.remove('show');
    };

    function performDelete(url, modal) {
        const csrfCookie = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
        const csrfToken = csrfCookie ? csrfCookie.split('=')[1] : '';

        fetch(url, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json',
            },
        })
        .then(res => res.json())
        .then(data => {
            modal.classList.remove('show');
            if (data.status === 'success') {
                showToast(data.message || 'Deleted successfully!', 'success');
                setTimeout(() => location.reload(), 800);
            } else {
                showToast(data.message || 'Error deleting item.', 'error');
            }
        })
        .catch(err => {
            modal.classList.remove('show');
            showToast('Network error. Please try again.', 'error');
        });
    }

    // ─── Toast Notification ──────────────────────────────────
    window.showToast = function (message, type) {
        // Remove existing toast
        const existingToast = document.querySelector('.admin-toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = `admin-toast ${type || 'success'}`;
        toast.innerHTML = `<i class="fa-solid ${type === 'error' ? 'fa-circle-xmark' : 'fa-circle-check'}"></i> ${message}`;
        document.body.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    };

    // ─── Auto-submit Filter Forms (Live Search via AJAX) ─────
    const filterForms = document.querySelectorAll('.filter-bar');
    filterForms.forEach(form => {
        const textInputs = form.querySelectorAll('input[type="text"], input[type="search"]');
        const selects = form.querySelectorAll('select');
        const dateInputs = form.querySelectorAll('input[type="date"]');
        let timeout = null;

        function performAjaxSearch() {
            const url = new URL(form.action || window.location.href);
            const formData = new FormData(form);
            const params = new URLSearchParams(formData);
            url.search = params.toString();

            // Update URL bar without reload
            window.history.replaceState({}, '', url);

            // Subtle loading effect on the form
            form.style.opacity = '0.6';

            fetch(url)
                .then(res => res.text())
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    
                    const newFilterBar = doc.querySelector('.filter-bar');
                    if (newFilterBar) {
                        const newNodes = [];
                        let node = newFilterBar.nextSibling;
                        while (node) {
                            if (node.classList && node.classList.contains('admin-footer')) break;
                            if (node.tagName && node.tagName.toLowerCase() === 'footer') break;
                            newNodes.push(node);
                            node = node.nextSibling;
                        }

                        const currentFilterBar = document.querySelector('.filter-bar');
                        if (currentFilterBar) {
                            // Remove current nodes strictly between filter bar and footer
                            let currNode = currentFilterBar.nextSibling;
                            while (currNode) {
                                if (currNode.classList && currNode.classList.contains('admin-footer')) break;
                                if (currNode.tagName && currNode.tagName.toLowerCase() === 'footer') break;
                                const next = currNode.nextSibling;
                                currNode.remove();
                                currNode = next;
                            }

                            // Insert new nodes cleanly
                            const parent = currentFilterBar.parentNode;
                            const footer = document.querySelector('.admin-footer');
                            newNodes.forEach(n => {
                                // Prevent re-animating the whole container on live search
                                if (n.nodeType === Node.ELEMENT_NODE && n.classList.contains('animate-in')) {
                                    n.classList.remove('animate-in');
                                }
                                if (footer) {
                                    parent.insertBefore(n, footer);
                                } else {
                                    parent.appendChild(n);
                                }
                            });
                        }
                    }
                    form.style.opacity = '1';
                })
                .catch(err => {
                    console.error("AJAX Search Error:", err);
                    form.style.opacity = '1';
                });
        }

        // Auto-submit on typing with debounce (no page reload)
        textInputs.forEach(input => {
            input.addEventListener('input', function() {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    performAjaxSearch();
                }, 400); // 400ms debounce
            });
        });

        // Auto-submit on exact change
        selects.forEach(select => select.addEventListener('change', performAjaxSearch));
        dateInputs.forEach(input => input.addEventListener('change', performAjaxSearch));
        
        // Prevent manual form submission via enter key
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            performAjaxSearch();
        });
    });

    // ─── Dashboard Charts ────────────────────────────────────
    const chartDataUrl = document.getElementById('chartDataUrl');
    if (chartDataUrl && typeof Chart !== 'undefined') {
        loadCharts(chartDataUrl.value);
    }

});

// ─── Chart.js Initialization ─────────────────────────────────
function loadCharts(url) {
    fetch(url)
        .then(res => res.json())
        .then(data => {
            // Appointments Trend Line Chart
            const apptCtx = document.getElementById('appointmentsChart');
            if (apptCtx) {
                new Chart(apptCtx.getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: data.labels,
                        datasets: [{
                            label: 'Appointments',
                            data: data.appointments,
                            borderColor: '#4F46E5', /* Indigo */
                            backgroundColor: 'rgba(79, 70, 229, 0.1)',
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: '#4F46E5',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1,
                                    font: { size: 11 },
                                    color: '#94a3b8',
                                },
                                grid: { color: 'rgba(226, 232, 240, 0.5)' },
                            },
                            x: {
                                ticks: {
                                    font: { size: 11 },
                                    color: '#94a3b8',
                                },
                                grid: { display: false },
                            }
                        }
                    }
                });
            }

            // Status Doughnut Chart
            const statusCtx = document.getElementById('statusChart');
            if (statusCtx) {
                new Chart(statusCtx.getContext('2d'), {
                    type: 'doughnut',
                    data: {
                        labels: ['Pending', 'Accepted', 'Rejected'],
                        datasets: [{
                            data: [data.status.pending, data.status.accepted, data.status.rejected],
                            backgroundColor: ['#f59e0b', '#10b981', '#f43f5e'],
                            borderWidth: 0,
                            spacing: 3,
                            borderRadius: 6,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '72%',
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    padding: 16,
                                    usePointStyle: true,
                                    pointStyle: 'circle',
                                    font: { size: 12 },
                                    color: '#64748b',
                                }
                            }
                        }
                    }
                });
            }

            // User Registrations Bar Chart
            const userCtx = document.getElementById('usersChart');
            if (userCtx) {
                new Chart(userCtx.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: data.labels,
                        datasets: [{
                            label: 'New Users',
                            data: data.users,
                            backgroundColor: 'rgba(79, 70, 229, 0.8)',
                            borderRadius: 8,
                            borderSkipped: false,
                            barThickness: 28,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1,
                                    font: { size: 11 },
                                    color: '#94a3b8',
                                },
                                grid: { color: 'rgba(226, 232, 240, 0.5)' },
                            },
                            x: {
                                ticks: {
                                    font: { size: 11 },
                                    color: '#94a3b8',
                                },
                                grid: { display: false },
                            }
                        }
                    }
                });
            }

            // Specializations Horizontal Bar
            const specCtx = document.getElementById('specChart');
            if (specCtx) {
                new Chart(specCtx.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: data.specializations.labels,
                        datasets: [{
                            label: 'Doctors',
                            data: data.specializations.counts,
                            backgroundColor: [
                                'rgba(14, 165, 233, 0.7)',
                                'rgba(16, 185, 129, 0.7)',
                                'rgba(245, 158, 11, 0.7)',
                                'rgba(244, 63, 94, 0.7)',
                                'rgba(139, 92, 246, 0.7)',
                                'rgba(236, 72, 153, 0.7)',
                            ],
                            borderRadius: 8,
                            borderSkipped: false,
                            barThickness: 20,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        plugins: {
                            legend: { display: false },
                        },
                        scales: {
                            x: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1,
                                    font: { size: 11 },
                                    color: '#94a3b8',
                                },
                                grid: { color: 'rgba(226, 232, 240, 0.5)' },
                            },
                            y: {
                                ticks: {
                                    font: { size: 11 },
                                    color: '#94a3b8',
                                },
                                grid: { display: false },
                            }
                        }
                    }
                });
            }
        })
        .catch(err => console.error('Error loading chart data:', err));
}
