// ========== MÓDULO DE METAS E ALERTAS INTELIGENTES - MORDOMOPAY ==========

async function getMetas(userId) {
    const { data, error } = await supabaseClient
        .from('metas_financeiras')
        .select('*')
        .eq('usuario_id', userId)
        .eq('status', 'ativa');
    
    if (error) {
        console.error('Erro ao buscar metas:', error);
        return [];
    }
    return data;
}

async function renderMetasUI() {
    const container = document.getElementById('goals-container');
    if (!container) return;

    const userId = CONFIG.currentUser.id;
    const metas = await getMetas(userId);

    if (metas.length === 0) {
        container.innerHTML = '<p class="no-data">Nenhuma meta ativa definida. Comece a planejar seu futuro!</p>';
        return;
    }

    let html = '';
    metas.forEach(meta => {
        const progresso = Math.min((meta.valor_atual / meta.valor_alvo) * 100, 100);
        html += `
            <div class="goal-item">
                <div class="goal-info">
                    <span><strong>${meta.titulo}</strong></span>
                    <span>${formatCurrency(meta.valor_atual)} / ${formatCurrency(meta.valor_alvo)} (${progresso.toFixed(0)}%)</span>
                </div>
                <div class="goal-progress-container">
                    <div class="goal-progress-bar" style="width: ${progresso}%; background-color: ${meta.cor || 'var(--primary)'}"></div>
                </div>
                ${meta.versiculo ? `<p class="small italic mt-1">${meta.versiculo}</p>` : ''}
            </div>
        `;
    });
    container.innerHTML = html;
}

function analisarGastosIA(transacoes) {
    console.log('🤖 [IA] Analisando padrões de gastos...');
    
    const gastosPorCategoria = {};
    transacoes.filter(t => t.tipo === 'saida' || t.tipo === 'despesa').forEach(t => {
        const catNome = t.categoria_trasacoes?.descricao || 'Outros';
        gastosPorCategoria[catNome] = (gastosPorCategoria[catNome] || 0) + parseFloat(t.valor);
    });

    const sugestoes = [];
    for (const [cat, valor] of Object.entries(gastosPorCategoria)) {
        if (valor > 300 && (cat.toLowerCase().includes('delivery') || cat.toLowerCase().includes('lazer'))) {
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
