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

    // Adicionar botão para nova meta
    let html = `
        <div class="mb-3">
            <button class="btn btn-primary btn-sm" onclick="toggleMetaForm()">+ Nova Meta Personalizada</button>
        </div>
        <div id="new-meta-form" style="display:none;" class="card mb-3 p-3 bg-dark">
            <input type="text" id="meta-titulo" placeholder="Título da Meta (ex: Reserva de Emergência)" class="form-control mb-2">
            <input type="number" id="meta-alvo" placeholder="Valor Alvo (R$)" class="form-control mb-2">
            <button class="btn btn-success btn-sm" onclick="salvarNovaMeta()">Salvar Meta</button>
        </div>
    `;

    if (metas.length === 0) {
        container.innerHTML = html + '<p class="no-data">Nenhuma meta ativa definida. Comece a planejar seu futuro!</p>';
        return;
    }
    metas.forEach(meta => {
        const progresso = Math.min((meta.valor_atual / meta.valor_alvo) * 100, 100);
        
        // Lógica de Marcos (Notificações)
        const marcos = [25, 50, 75, 100];
        marcos.forEach(marco => {
            if (progresso >= marco && (!meta.ultimo_marco || meta.ultimo_marco < marco)) {
                console.log(`🎉 [MARCO ATINGIDO] ${meta.titulo}: ${marco}% atingido!`);
                // Aqui poderíamos disparar o webhook para o WhatsApp
            }
        });

        html += `
            <div class="goal-item mb-3">
                <div class="goal-info d-flex justify-content-between">
                    <span><strong>${meta.titulo}</strong></span>
                    <span>${formatCurrency(meta.valor_atual)} / ${formatCurrency(meta.valor_alvo)} (${progresso.toFixed(0)}%)</span>
                </div>
                <div class="goal-progress-container" style="height: 10px; background: #333; border-radius: 5px; overflow: hidden;">
                    <div class="goal-progress-bar" style="width: ${progresso}%; height: 100%; background-color: var(--primary); transition: width 0.5s;"></div>
                </div>
                ${meta.versiculo ? `<p class="small italic mt-1">${meta.versiculo}</p>` : ''}
            </div>
        `;
    });
    container.innerHTML = html;
}

function toggleMetaForm() {
    const form = document.getElementById('new-meta-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function salvarNovaMeta() {
    const titulo = document.getElementById('meta-titulo').value;
    const alvo = parseFloat(document.getElementById('meta-alvo').value);
    const userId = CONFIG.currentUser.id;

    if (!titulo || isNaN(alvo)) {
        alert('Preencha todos os campos corretamente.');
        return;
    }

    const { error } = await supabaseClient
        .from('metas_financeiras')
        .insert([{ usuario_id: userId, titulo: titulo, valor_alvo: alvo, valor_atual: 0 }]);

    if (error) {
        console.error('Erro ao salvar meta:', error);
        alert('Erro ao salvar meta.');
    } else {
        alert('Meta criada com sucesso! "O plano do diligente leva à fartura."');
        toggleMetaForm();
        renderMetasUI();
    }
}

function analisarGastosIA(transacoes) {
    console.log('🤖 [IA] Analisando padrões de gastos...');
    
    const gastosPorCategoria = {};
    transacoes.filter(t => t.tipo === 'saida' || t.tipo === 'despesa').forEach(t => {
        const catNome = t.categoria_trasacoes?.descricao || 'Outros';
        gastosPorCategoria[catNome] = (gastosPorCategoria[catNome] || 0) + parseFloat(t.valor);
    });

    const sugestoes = [];
    const alertas = [];

    // Média fictícia para comparação (em um sistema real, viria do histórico)
    const mediasCategorias = {
        'Alimentação': 800,
        'Transporte': 300,
        'Lazer': 200,
        'Saúde': 150
    };

    for (const [cat, valor] of Object.entries(gastosPorCategoria)) {
        // 1. Alertas de Gastos Excessivos
        if (mediasCategorias[cat] && valor > mediasCategorias[cat] * 1.3) {
            const excesso = ((valor / mediasCategorias[cat]) - 1) * 100;
            alertas.push({
                categoria: cat,
                mensagem: `⚠️ Atenção! Seus gastos com ${cat} este mês já são ${excesso.toFixed(0)}% maiores que a média.`
            });
        }

        // 2. Sugestões de Economia
        if (valor > 300 && (cat.toLowerCase().includes('delivery') || cat.toLowerCase().includes('lazer') || cat.toLowerCase().includes('alimentação'))) {
            const economia = valor * 0.2;
            sugestoes.push({
                categoria: cat,
                mensagem: `Você gastou ${formatCurrency(valor)} em ${cat} este mês. Reduzindo 20%, economizaria ${formatCurrency(economia)}.`,
                versiculo: "Provérbios 21:20 - 'Na casa do sábio há comida escolhida e azeite, mas o tolo tudo desperdiça'"
            });
        }
    }
    
    return { sugestoes, alertas };
}

function renderAlertasUI(alertas, sugestoes) {
    const container = document.getElementById('sabedoria-container');
    if (!container) return;

    let htmlAlertas = '';
    alertas.forEach(a => {
        htmlAlertas += `<div class="alert-item mb-2 p-2" style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; border-radius: 4px;">
            <p class="small mb-0">${a.mensagem}</p>
        </div>`;
    });

    let htmlSugestoes = '';
    sugestoes.forEach(s => {
        htmlSugestoes += `<div class="suggest-item mb-2 p-2" style="background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; border-radius: 4px;">
            <p class="small mb-1"><strong>Dica de Economia:</strong> ${s.mensagem}</p>
            <p class="small italic mb-0" style="font-size: 0.75rem;">${s.versiculo}</p>
        </div>`;
    });

    if (htmlAlertas || htmlSugestoes) {
        const div = document.createElement('div');
        div.className = 'card mt-4';
        div.innerHTML = `
            <div class="card-header"><h3><i class="fas fa-lightbulb"></i> Insights do Mordomo</h3></div>
            <div class="card-body">${htmlAlertas}${htmlSugestoes}</div>
        `;
        container.appendChild(div);
    }
}
