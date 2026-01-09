// ========== MÓDULO DE METAS E ALERTAS INTELIGENTES - MORDOMOPAY ==========

const METAS_DEFAULT = [
    { id: 1, nome: "Reserva de Emergência", alvo: 5000, atual: 1250, cor: "#10b981" },
    { id: 2, nome: "Dízimo do Mês", alvo: 440, atual: 440, cor: "#3b82f6" }
];

function renderMetasUI(metas = METAS_DEFAULT) {
    const container = document.getElementById('goals-container');
    if (container) {
        let html = '';
        metas.forEach(meta => {
            const progresso = Math.min((meta.atual / meta.alvo) * 100, 100);
            html += `
                <div class="goal-item">
                    <div class="goal-info">
                        <span>${meta.nome}</span>
                        <span>${formatCurrency(meta.atual)} / ${formatCurrency(meta.alvo)} (${progresso.toFixed(0)}%)</span>
                    </div>
                    <div class="goal-progress-container">
                        <div class="goal-progress-bar" style="width: ${progresso}%; background-color: ${meta.cor}"></div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html || '<p class="no-data">Nenhuma meta definida.</p>';
    }
}

function analisarGastosIA(transacoes, categorias) {
    console.log('🤖 [IA] Analisando padrões de gastos...');
    
    const gastosPorCategoria = {};
    transacoes.filter(t => t.tipo === 'SAIDA').forEach(t => {
        const catNome = t.categoria_trasacoes?.descricao || 'Outros';
        gastosPorCategoria[catNome] = (gastosPorCategoria[catNome] || 0) + t.valor;
    });

    const sugestoes = [];
    for (const [cat, valor] of Object.entries(gastosPorCategoria)) {
        if (valor > 300 && cat.toLowerCase().includes('delivery')) {
            const economia = valor * 0.2;
            sugestoes.push({
                categoria: cat,
                mensagem: `Você gastou ${formatCurrency(valor)} em ${cat} este mês. Reduzindo 20%, economizaria ${formatCurrency(economia)}.`,
                versiculo: "Provérbios 21:20 - 'Na casa do sábio há comida escolhida e azeite, mas o tolo tudo desperdiça'"
            });
        }
    }
    
    return sugestoes;
}

function verificarAlertasLimites(gastosPorCategoria, limites) {
    const alertas = [];
    for (const [cat, valor] of Object.entries(gastosPorCategoria)) {
        if (limites[cat] && valor > limites[cat] * 0.8) {
            const percent = (valor / limites[cat]) * 100;
            alertas.push({
                categoria: cat,
                mensagem: `⚠️ Atenção! Seus gastos com ${cat} já atingiram ${percent.toFixed(0)}% do limite definido.`
            });
        }
    }
    return alertas;
}
