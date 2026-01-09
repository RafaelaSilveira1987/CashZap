// ========== MÓDULO DE FERRAMENTAS MORDOMO FIEL - MORDOMOPAY ==========

const FERRAMENTAS = {
    // Calculadora de Dízimos
    calcularDizimo: function(renda, percentual = 10) {
        const dizimo = renda * (percentual / 100);
        const restante = renda - dizimo;
        return { dizimo, restante };
    },

    // Projeções Financeiras
    projetarEconomia: function(valorMensal, meses, taxaJuros = 0.005) {
        let total = 0;
        const projecao = [];
        for (let i = 1; i <= meses; i++) {
            total = (total + valorMensal) * (1 + taxaJuros);
            projecao.push({ mes: i, valor: total });
        }
        return projecao;
    }
};

function renderCalculadoraDizimoUI() {
    const container = document.getElementById('ferramentas-container');
    if (container) {
        container.innerHTML = `
            <div class="card tools-card mb-4">
                <div class="card-header">
                    <h3><i class="fas fa-calculator"></i> Calculadora de Dízimos e Ofertas</h3>
                </div>
                <div class="card-body">
                    <div class="form-group">
                        <label>Renda Bruta (R$)</label>
                        <input type="number" id="calcRenda" placeholder="Ex: 3000" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Percentual (%)</label>
                        <input type="number" id="calcPercent" value="10" class="form-control">
                    </div>
                    <button class="btn btn-primary" onclick="executarCalculoDizimo()">Calcular</button>
                    <div id="calcResult" class="mt-3" style="display:none;">
                        <p><strong>Dízimo Sugerido:</strong> <span id="resDizimo" class="text-success"></span></p>
                        <p><strong>Restante para Gestão:</strong> <span id="resRestante"></span></p>
                        <p class="mt-2 italic small">"Trazei todos os dízimos à casa do tesouro..." - Malaquias 3:10</p>
                    </div>
                </div>
            </div>
        `;
   async function executarCalculoDizimo() {
    const renda = parseFloat(document.getElementById('calcRenda').value);
    const percent = parseFloat(document.getElementById('calcPercent').value);
    
    if (isNaN(renda)) return;
    
    const { dizimo, restante } = FERRAMENTAS.calcularDizimo(renda, percent);
    
    document.getElementById('resDizimo').textContent = formatCurrency(dizimo);
    document.getElementById('resRestante').textContent = formatCurrency(restante);
    document.getElementById('calcResult').style.display = 'block';

    // Adicionar botão para registrar o dízimo
    const btnContainer = document.createElement('div');
    btnContainer.className = 'mt-3';
    btnContainer.innerHTML = `<button class="btn btn-whatsapp" onclick="registrarDizimo(${dizimo})"><i class="fas fa-check"></i> Registrar Dízimo Pago</button>`;
    
    const existingBtn = document.getElementById('calcResult').querySelector('.btn-whatsapp');
    if (!existingBtn) document.getElementById('calcResult').appendChild(btnContainer);
}

async function registrarDizimo(valor) {
    const userId = CONFIG.currentUser.id;
    const { error } = await supabaseClient
        .from('dizimos_ofertas')
        .insert([{ usuario_id: userId, valor: valor, tipo: 'dizimo', status: 'pago' }]);

    if (error) {
        console.error('Erro ao registrar dízimo:', error);
        alert('Erro ao registrar dízimo.');
    } else {
        alert('Dízimo registrado com sucesso! "Deus ama quem dá com alegria."');
        navigateToPage('dashboard');
    }
}

function renderProjecaoUI(transactions) {
    const container = document.getElementById('projecao-container');
    if (!container) return;

    // Calcular média de economia mensal
    let r = 0, d = 0;
    transactions.forEach(t => {
        if (t.tipo === 'entrada' || t.tipo === 'receita') r += t.valor;
        else d += t.valor;
    });
    
    const economiaMensal = Math.max(0, r - d);
    const projecao = FERRAMENTAS.projetarEconomia(economiaMensal, 12);
    const total12Meses = projecao[11].valor;

    container.innerHTML = `
        <div class="card projecao-card mb-4">
            <div class="card-header">
                <h3><i class="fas fa-chart-line"></i> Projeção de Mordomia (12 meses)</h3>
            </div>
            <div class="card-body">
                <p>Mantendo sua média atual de economia de <strong>${formatCurrency(economiaMensal)}</strong>:</p>
                <div class="projecao-destaque">
                    <span class="valor-projecao">${formatCurrency(total12Meses)}</span>
                    <span class="label-projecao">Acumulados em 1 ano</span>
                </div>
                <p class="small mt-2">Considerando rendimento médio de 0.5% a.m.</p>
            </div>
        </div>
    `;
}
