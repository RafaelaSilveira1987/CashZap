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
    const gastosPorDiaSemana = [0,0,0,0,0,0,0]; // Dom-Sab
    const periodosMes = { '1-10': 0, '11-20': 0, '21-31': 0 };

    transacoes.filter(t => t.tipo === 'saida' || t.tipo === 'despesa').forEach(t => {
        const valor = parseFloat(t.valor);
        const data = new Date(t.data);
        
        // Por Categoria
        const catNome = t.categoria_trasacoes?.descricao || 'Outros';
        gastosPorCategoria[catNome] = (gastosPorCategoria[catNome] || 0) + valor;

        // Por Dia da Semana
        gastosPorDiaSemana[data.getDay()] += valor;

        // Por Período do Mês
        const dia = data.getDate();
        if (dia <= 10) periodosMes['1-10'] += valor;
        else if (dia <= 20) periodosMes['11-20'] += valor;
        else periodosMes['21-31'] += valor;
    });

    const sugestoes = [];
    const alertas = [];

    // 1. Análise de Padrões Temporais
    const diaMaisCaro = gastosPorDiaSemana.indexOf(Math.max(...gastosPorDiaSemana));
    const diasNomes = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    if (Math.max(...gastosPorDiaSemana) > 0) {
        alertas.push({
            categoria: 'Padrão',
            mensagem: `📊 Padrão detectado: Suas maiores despesas costumam ocorrer aos **${diasNomes[diaMaisCaro]}s**.`
        });
    }

    const periodoMaisCaro = Object.keys(periodosMes).reduce((a, b) => periodosMes[a] > periodosMes[b] ? a : b);
    if (periodosMes[periodoMaisCaro] > 0) {
        alertas.push({
            categoria: 'Padrão',
            mensagem: `📅 Você tende a gastar mais no período de **${periodoMaisCaro}** do mês.`
        });
    }

    // 2. Alertas de Gastos Excessivos e Sugestões (Lógica anterior mantida e refinada)
    const mediasCategorias = { 'Alimentação': 800, 'Transporte': 300, 'Lazer': 200 };
    for (const [cat, valor] of Object.entries(gastosPorCategoria)) {
        if (mediasCategorias[cat] && valor > mediasCategorias[cat] * 1.3) {
            alertas.push({
                categoria: cat,
                mensagem: `⚠️ Seus gastos com ${cat} estão ${((valor/mediasCategorias[cat]-1)*100).toFixed(0)}% acima da média.`
            });
        }
        if (valor > 300 && (cat.toLowerCase().includes('delivery') || cat.toLowerCase().includes('lazer'))) {
            sugestoes.push({
                categoria: cat,
                mensagem: `Economizando 20% em ${cat}, você teria ${formatCurrency(valor*0.2)} extras para suas metas.`,
                versiculo: "Provérbios 21:20"
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
