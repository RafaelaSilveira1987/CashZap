// Instâncias dos gráficos
let categoryChart = null;
let trendChart = null;
let reportCategoryChart = null;
let reportFlowChart = null;

// Configuração padrão dos gráficos
const chartDefaults = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: {
            labels: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()
            }
        }
    }
};

// Cores para os gráficos
const chartColors = [
    '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

// ========== GRÁFICO DE DESPESAS POR CATEGORIA ==========

function createCategoryChart(data) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    // Destruir gráfico anterior se existir
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    const labels = Object.keys(data);
    const values = Object.values(data);
    
    if (labels.length === 0) {
        ctx.parentElement.innerHTML = '<p class="no-data">Nenhuma despesa registrada</p>';
        return;
    }
    
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: chartColors,
                borderWidth: 0
            }]
        },
        options: {
            ...chartDefaults,
            plugins: {
                ...chartDefaults.plugins,
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// ========== GRÁFICO DE TENDÊNCIAS MENSAIS ==========

function createTrendChart(data) {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    
    // Destruir gráfico anterior se existir
    if (trendChart) {
        trendChart.destroy();
    }
    
    const labels = Object.keys(data).map(key => {
        const [year, month] = key.split('-');
        return getMonthName(parseInt(month));
    });
    
    const receitasData = Object.values(data).map(d => d.receitas);
    const despesasData = Object.values(data).map(d => d.despesas);
    
    if (labels.length === 0) {
        ctx.parentElement.innerHTML = '<p class="no-data">Nenhum dado disponível</p>';
        return;
    }
    
    trendChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Receitas',
                    data: receitasData,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: '#10b981',
                    borderWidth: 1
                },
                {
                    label: 'Despesas',
                    data: despesasData,
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderColor: '#ef4444',
                    borderWidth: 1
                }
            ]
        },
        options: {
            ...chartDefaults,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        },
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
                    },
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim()
                    }
                },
                x: {
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                ...chartDefaults.plugins,
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            }
        }
    });
}

// ========== GRÁFICO DE CATEGORIA PARA RELATÓRIOS ==========

function createReportCategoryChart(data) {
    const ctx = document.getElementById('reportCategoryChart');
    if (!ctx) return;
    
    // Destruir gráfico anterior se existir
    if (reportCategoryChart) {
        reportCategoryChart.destroy();
    }
    
    const labels = Object.keys(data);
    const values = Object.values(data);
    
    if (labels.length === 0) {
        ctx.parentElement.innerHTML = '<p class="no-data">Nenhuma despesa registrada</p>';
        return;
    }
    
    reportCategoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Despesas',
                data: values,
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: '#ef4444',
                borderWidth: 1
            }]
        },
        options: {
            ...chartDefaults,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        },
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
                    },
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim()
                    }
                },
                y: {
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                ...chartDefaults.plugins,
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.parsed.x);
                        }
                    }
                }
            }
        }
    });
}

// ========== GRÁFICO DE FLUXO DE CAIXA PARA RELATÓRIOS ==========

function createReportFlowChart(data) {
    const ctx = document.getElementById('reportFlowChart');
    if (!ctx) return;
    
    // Destruir gráfico anterior se existir
    if (reportFlowChart) {
        reportFlowChart.destroy();
    }
    
    const labels = Object.keys(data).map(key => {
        const [year, month] = key.split('-');
        return getMonthName(parseInt(month));
    });
    
    const receitasData = Object.values(data).map(d => d.receitas);
    const despesasData = Object.values(data).map(d => d.despesas);
    const saldoData = Object.values(data).map(d => d.receitas - d.despesas);
    
    if (labels.length === 0) {
        ctx.parentElement.innerHTML = '<p class="no-data">Nenhum dado disponível</p>';
        return;
    }
    
    reportFlowChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Receitas',
                    data: receitasData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Despesas',
                    data: despesasData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Saldo',
                    data: saldoData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            ...chartDefaults,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        },
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
                    },
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim()
                    }
                },
                x: {
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                ...chartDefaults.plugins,
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            }
        }
    });
}

// Atualizar cores dos gráficos ao mudar tema
function updateChartColors() {
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();
    const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();
    
    const charts = [categoryChart, trendChart, reportCategoryChart, reportFlowChart];
    
    charts.forEach(chart => {
        if (chart) {
            if (chart.options.plugins && chart.options.plugins.legend) {
                chart.options.plugins.legend.labels.color = textColor;
            }
            
            if (chart.options.scales) {
                if (chart.options.scales.y) {
                    chart.options.scales.y.ticks.color = secondaryColor;
                    if (chart.options.scales.y.grid) {
                        chart.options.scales.y.grid.color = borderColor;
                    }
                }
                if (chart.options.scales.x) {
                    chart.options.scales.x.ticks.color = secondaryColor;
                    if (chart.options.scales.x.grid) {
                        chart.options.scales.x.grid.color = borderColor;
                    }
                }
            }
            
            chart.update();
        }
    });
}
