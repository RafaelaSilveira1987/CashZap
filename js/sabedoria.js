// ========== MÓDULO DE SABEDORIA E CONQUISTAS - MORDOMOPAY ==========

const SABEDORIA = {
    versiculos: [
        { texto: "Provérbios 21:20", mensagem: "Na casa do sábio há comida escolhida e azeite, mas o tolo tudo desperdiça." },
        { texto: "Lucas 14:28", mensagem: "Qual de vocês, se quiser construir uma torre, primeiro não se assenta e calcula o preço, para ver se tem dinheiro suficiente para completá-la?" },
        { texto: "Provérbios 22:7", mensagem: "O rico domina sobre o pobre, e o que toma emprestado é servo do que empresta." },
        { texto: "Mateus 25:21", mensagem: "Muito bem, servo bom e fiel! Você foi fiel no pouco, eu o porei sobre o muito." },
        { texto: "Filipenses 4:19", mensagem: "O meu Deus suprirá todas as necessidades de vocês, de acordo com as suas gloriosas riquezas em Cristo Jesus." }
    ],
    
    dicas: [
        "O dízimo é um ato de adoração e reconhecimento de que tudo pertence a Deus.",
        "Evite dívidas de consumo; elas escravizam o seu futuro.",
        "Poupe com propósito: para emergências, para generosidade e para o futuro.",
        "A mordomia fiel começa com a honestidade em cada centavo gasto.",
        "Contentamento é a chave para a paz financeira: aprenda a viver com o que Deus proveu."
    ],
    
    badges_info: [
        { id: 'dizimista', nome: "🌱 Dizimista Fiel", desc: "3 meses consecutivos de dízimo", icone: "fa-seedling" },
        { id: 'mordomo', nome: "💎 Mordomo Fiel", desc: "30 dias sem gastos supérfluos", icone: "fa-gem" },
        { id: 'gestor', nome: "🏆 Gestor Sábio", desc: "6 meses de economia positiva", icone: "fa-trophy" },
        { id: 'provedor', nome: "⭐ Provedor Diligente", desc: "Todas categorias organizadas", icone: "fa-star" }
    ]
};

function getVersiculoAleatorio() {
    const index = Math.floor(Math.random() * SABEDORIA.versiculos.length);
    return SABEDORIA.versiculos[index];
}

function getDicaAleatoria() {
    const index = Math.floor(Math.random() * SABEDORIA.dicas.length);
    return SABEDORIA.dicas[index];
}

function renderSabedoriaUI() {
    const versiculo = getVersiculoAleatorio();
    const dica = getDicaAleatoria();
    
    const container = document.getElementById('sabedoria-container');
    if (container) {
        container.innerHTML = `
            <div class="card sabedoria-card">
                <div class="card-header">
                    <h3><i class="fas fa-bible"></i> Sabedoria do Dia</h3>
                </div>
                <div class="card-body">
                    <blockquote class="versiculo-text">
                        "${versiculo.mensagem}"
                        <cite>— ${versiculo.texto}</cite>
                    </blockquote>
                    <hr>
                    <p class="dica-text"><strong>Dica de Mordomia:</strong> ${dica}</p>
                </div>
            </div>
        `;
    }
}

async function renderBadgesUI() {
    const container = document.getElementById('badges-container');
    if (!container) return;

    const userId = CONFIG.currentUser.id;
    const { data: userBadges, error } = await supabaseClient
        .from('badges')
        .select('nome')
        .eq('usuario_id', userId);

    const conquistados = userBadges ? userBadges.map(b => b.nome) : [];

    let html = '<div class="badges-grid">';
    SABEDORIA.badges_info.forEach(badge => {
        const conquistado = conquistados.includes(badge.nome) || conquistados.includes(badge.id);
        html += `
            <div class="badge-item ${conquistado ? 'conquistado' : 'bloqueado'}" title="${badge.desc}">
                <div class="badge-icon"><i class="fas ${badge.icone}"></i></div>
                <span class="badge-name">${badge.nome}</span>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}
