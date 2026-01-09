// ========== MÓDULO DE FERRAMENTAS MORDOMO FIEL - MORDOMOPAY ==========

const FERRAMENTAS = {
    // Calculadora de Dízimos
    calcularDizimo: function(renda, percentual = 10) {
        const dizimo = renda * (percentual / 100);
        const restante = renda - dizimo;
        return { dizimo, restante };
    },

    // Projeções Financeiras com Cenários
    projetarEconomia: function(valorMensal, meses, taxaJuros = 0.005) {
        const calcular = (valor, taxa) => {
            let total = 0;
            for (let i = 1; i <= meses; i++) {
                total = (total + valor) * (1 + taxa);
            }
            return total;
        };

        return {
            realista: calcular(valorMensal, taxaJuros),
            otimista: calcular(valorMensal * 1.2, taxaJuros + 0.002),
            pessimista: calcular(valorMensal * 0.8, taxaJuros - 0.002)
        };
    },

    // Comparativo Temporal
    compararMeses: function(transacoes) {
        const agora = new Date();
        const mesAtual = agora.getMonth();
        const mesPassado = mesAtual === 0 ? 11 : mesAtual - 1;
        
        const gastosMes = (mes) => transacoes
            .filter(t => new Date(t.data).getMonth() === mes && (t.tipo === 'saida' || t.tipo === 'despesa'))
            .reduce((acc, t) => acc + parseFloat(t.valor), 0);

        const atual = gastosMes(mesAtual);
        const passado = gastosMes(mesPassado);
        const diferenca = passado > 0 ? ((atual / passado) - 1) * 100 : 0;

        return { atual, passado, diferenca };
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

    // 1. Comparativo Temporal
    const comp = FERRAMENTAS.compararMeses(transactions);
    const compHtml = `
        <div class="card mb-4">
            <div class="card-header"><h3><i class="fas fa-history"></i> Comparativo Temporal</h3></div>
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <p class="small mb-0">Este Mês: <strong>${formatCurrency(comp.atual)}</strong></p>
                        <p class="small mb-0">Mês Passado: <strong>${formatCurrency(comp.passado)}</strong></p>
                    </div>
                    <div class="text-right">
                        <span class="badge ${comp.diferenca <= 0 ? 'bg-success' : 'bg-danger'}">
                            ${comp.diferenca <= 0 ? '✅' : '⚠️'} ${Math.abs(comp.diferenca).toFixed(1)}% 
                            ${comp.diferenca <= 0 ? 'menos' : 'mais'} gastos
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 2. Projeções com Cenários
    let r = 0, d = 0;
    transactions.forEach(t => {
        if (t.tipo === 'entrada' || t.tipo === 'receita') r += t.valor;
        else d += t.valor;
    });
    
    const economiaMensal = Math.max(0, r - d);
    const proj = FERRAMENTAS.projetarEconomia(economiaMensal, 12);

    const projHtml = `
        <div class="card projecao-card mb-4">
            <div class="card-header">
                <h3><i class="fas fa-chart-line"></i> Projeção de Mordomia (12 meses)</h3>
            </div>
            <div class="card-body">
                <div class="projecao-cenarios">
                    <div class="cenario">
                        <span class="label">Otimista</span>
                        <span class="valor text-success">${formatCurrency(proj.otimista)}</span>
                    </div>
                    <div class="cenario destaque">
                        <span class="label">Realista</span>
                        <span class="valor">${formatCurrency(proj.realista)}</span>
                    </div>
                    <div class="cenario">
                        <span class="label">Pessimista</span>
                        <span class="valor text-danger">${formatCurrency(proj.pessimista)}</span>
                    </div>
                </div>
                <p class="small mt-3 italic text-center">"O coração do homem planeja o seu caminho, mas o Senhor lhe dirige os passos." - Provérbios 16:9</p>
            </div>
        </div>
    `;

    container.innerHTML = compHtml + projHtml;
}
