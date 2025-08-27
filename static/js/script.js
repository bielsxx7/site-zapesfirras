document.addEventListener('DOMContentLoaded', () => {
    // --- Referências de Elementos ---
    const telaCarregamento = document.getElementById('tela-carregamento');
    const conteudoPrincipal = document.getElementById('conteudo-principal');
    const menuHamburguer = document.querySelector('.menu-hamburguer');
    const menuNavegacao = document.querySelector('.menu-navegacao');
    const carrosselCategorias = document.querySelector('.carrossel-categorias');
    const botaoAnterior = document.querySelector('.botao-anterior');
    const botaoProximo = document.querySelector('.botao-proximo');

    const caixaPesquisa = document.querySelector('.caixa-pesquisa');
    const botaoPesquisa = document.querySelector('.botao-pesquisa');
    const entradaPesquisa = document.querySelector('.texto-pesquisa');
    const mensagemSemResultados = document.getElementById('sem-resultados');
    
    const botoesDetalhes = document.querySelectorAll('.botao-detalhes');
    const botoesAdicionar = document.querySelectorAll('.botao-adicionar');

    const sobreposicaoModal = document.getElementById('modal-sobreposicao');
    const botaoFecharModal = document.getElementById('botao-fechar-modal');
    const imagemProdutoModal = document.getElementById('imagem-produto-modal');
    const nomeProdutoModal = document.getElementById('nome-produto-modal');
    const descProdutoModal = document.getElementById('desc-produto-modal');
    const detalhesProdutoModal = document.getElementById('detalhes-produto-modal');
    const precoProdutoModal = document.getElementById('preco-produto-modal');
    const entradaQuantidade = document.querySelector('.entrada-quantidade');
    const botaoMais = document.querySelector('.botao-mais');
    const botaoMenos = document.querySelector('.botao-menos');
    const botaoAdicionarCarrinhoModal = document.querySelector('.botao-adicionar-carrinho-modal');
    const areaObservacaoProduto = document.getElementById('observacao-produto');
    
    const botaoCarrinho = document.getElementById('botao-carrinho');
    const painelCarrinho = document.getElementById('painel-carrinho');
    const sobreposicaoCarrinho = document.getElementById('sobreposicao-carrinho');
    const botaoFecharPainel = document.getElementById('botao-fechar-painel');
    const containerItensCarrinho = document.getElementById('itens-carrinho');
    const subtotalCarrinho = document.getElementById('subtotal-carrinho');
    const totalCarrinho = document.getElementById('total-carrinho');
    const contadorCarrinhoSpan = document.getElementById('contador-carrinho');
    const notificacao = document.getElementById('notificacao');
    const textoNotificacao = document.getElementById('texto-notificacao');

    let precoProdutoAtual = 0;
    let carrinho = [];
    const TAXA_ENTREGA = 5.00;

    // --- Lógica de Carregamento ---
    const duracaoCarregamento = 3000;
    setTimeout(() => {
        if (telaCarregamento) {
            telaCarregamento.style.opacity = '0';
            telaCarregamento.style.visibility = 'hidden';
        }
        if (conteudoPrincipal) conteudoPrincipal.style.display = 'block';
    }, duracaoCarregamento);

    // --- Lógica do Menu Hambúrguer ---
    if (menuHamburguer && menuNavegacao) {
        menuHamburguer.addEventListener('click', () => {
            menuNavegacao.classList.toggle('ativo');
        });
    }

    // --- Lógica do Carrossel ---
    if (carrosselCategorias && botaoAnterior && botaoProximo) {
        const valorRolagem = 250;
        botaoProximo.addEventListener('click', () => {
            carrosselCategorias.scrollBy({
                left: valorRolagem,
                behavior: 'smooth'
            });
        });
        botaoAnterior.addEventListener('click', () => {
            carrosselCategorias.scrollBy({
                left: -valorRolagem,
                behavior: 'smooth'
            });
        });
    }

    // --- Lógica de Pesquisa (Corrigida) ---
    if (botaoPesquisa && caixaPesquisa && entradaPesquisa) {
        botaoPesquisa.addEventListener('click', (event) => {
            event.preventDefault();
            caixaPesquisa.classList.toggle('ativo');
            if (caixaPesquisa.classList.contains('ativo')) {
                entradaPesquisa.focus();
            }
        });

        entradaPesquisa.addEventListener('input', () => {
            const termoPesquisa = entradaPesquisa.value.toLowerCase().trim();
            let produtoEncontrado = false;
            let primeiroProdutoEncontrado = null;
            const cartoesProduto = document.querySelectorAll('.cartao-produto');

            cartoesProduto.forEach(cartao => {
                const nomeProduto = cartao.querySelector('h3').textContent.toLowerCase();

                if (nomeProduto.includes(termoPesquisa)) {
                    cartao.style.display = 'flex';
                    produtoEncontrado = true;
                    if (!primeiroProdutoEncontrado) {
                        primeiroProdutoEncontrado = cartao;
                    }
                } else {
                    cartao.style.display = 'none';
                }
            });

            if (produtoEncontrado) {
                mensagemSemResultados.style.display = 'none';
                if (termoPesquisa.length > 0 && primeiroProdutoEncontrado) {
                    primeiroProdutoEncontrado.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } else {
                mensagemSemResultados.style.display = 'block';
            }
        });
    }
    
    // --- Lógica para ABRIR e FECHAR o Modal ---
    botoesDetalhes.forEach(btn => {
        btn.addEventListener('click', (event) => {
            const cartao = event.target.closest('.cartao-produto');
            if (!cartao) return;

            const nome = cartao.getAttribute('data-nome');
            const desc = cartao.querySelector('h4').textContent;
            const detalhes = cartao.querySelector('p').textContent;
            const preco = parseFloat(cartao.getAttribute('data-preco'));
            const imagem = cartao.querySelector('.container-detalhes-produto img').src;

            imagemProdutoModal.src = imagem;
            nomeProdutoModal.textContent = nome;
            descProdutoModal.textContent = desc;
            detalhesProdutoModal.textContent = detalhes;
            precoProdutoModal.textContent = `R$ ${preco.toFixed(2).replace('.', ',')}`;
            entradaQuantidade.value = 1;
            precoProdutoAtual = preco;
            atualizarPrecoTotal();
            if (areaObservacaoProduto) areaObservacaoProduto.value = '';

            sobreposicaoModal.classList.add('ativo');
            
            document.addEventListener('keydown', prenderTeclado);
            if (entradaQuantidade) entradaQuantidade.focus();
        });
    });

    if (botaoFecharModal) {
        botaoFecharModal.addEventListener('click', () => {
            sobreposicaoModal.classList.remove('ativo');
            document.removeEventListener('keydown', prenderTeclado);
        });
    }
    
    // --- Lógica para o botão de Adicionar Rápido ---
    botoesAdicionar.forEach(btn => {
        btn.addEventListener('click', (event) => {
            const cartao = event.target.closest('.cartao-produto');
            if (!cartao) return;

            const nome = cartao.getAttribute('data-nome');
            const preco = parseFloat(cartao.getAttribute('data-preco'));
            const imagem = cartao.querySelector('.container-detalhes-produto img').src;

            adicionarAoCarrinho(nome, 1, preco, null, imagem);
            mostrarNotificacao(event, `1 "${nome}" adicionado!`);
        });
    });
    
    // --- Lógica do Seletor de Quantidade ---
    function atualizarPrecoTotal() {
        const quantidade = parseInt(entradaQuantidade.value);
        const precoTotal = precoProdutoAtual * quantidade;
        botaoAdicionarCarrinhoModal.textContent = `Adicionar R$ ${precoTotal.toFixed(2).replace('.', ',')}`;
    }

    if (botaoMais && botaoMenos) {
        botaoMais.addEventListener('click', () => {
            let quantidade = parseInt(entradaQuantidade.value);
            entradaQuantidade.value = quantidade + 1;
            atualizarPrecoTotal();
        });

        botaoMenos.addEventListener('click', () => {
            let quantidade = parseInt(entradaQuantidade.value);
            if (quantidade > 1) {
                entradaQuantidade.value = quantidade - 1;
                atualizarPrecoTotal();
            }
        });
    }

    if (botaoAdicionarCarrinhoModal) {
        botaoAdicionarCarrinhoModal.addEventListener('click', (event) => {
            const quantidade = parseInt(entradaQuantidade.value);
            const nomeProduto = nomeProdutoModal.textContent;
            const observacaoProduto = areaObservacaoProduto.value;
            const imagemProduto = imagemProdutoModal.src;
            adicionarAoCarrinho(nomeProduto, quantidade, precoProdutoAtual, observacaoProduto, imagemProduto);
            sobreposicaoModal.classList.remove('ativo');
            mostrarNotificacao(event, `${quantidade} "${nomeProduto}" adicionado!`);
        });
    }

    // --- Lógica do Painel do Carrinho ---
    function adicionarAoCarrinho(nome, quantidade, preco, observacao, imagem) {
        const indiceItemExistente = carrinho.findIndex(item => item.nome === nome);
        if (indiceItemExistente !== -1) {
            carrinho[indiceItemExistente].quantidade += quantidade;
        } else {
            carrinho.push({ nome, quantidade, preco, observacao, imagem });
        }
        renderizarCarrinho();
    }
    
    function renderizarCarrinho() {
        if (carrinho.length === 0) {
            containerItensCarrinho.innerHTML = '<p class="mensagem-carrinho-vazio">Seu carrinho está vazio.</p>';
            subtotalCarrinho.textContent = 'R$ 0,00';
            totalCarrinho.textContent = `R$ ${TAXA_ENTREGA.toFixed(2).replace('.', ',')}`;
            contadorCarrinhoSpan.textContent = '0';
            contadorCarrinhoSpan.classList.remove('ativo');
            return;
        }

        containerItensCarrinho.innerHTML = '';
        let subtotal = 0;
        let totalItens = 0;

        carrinho.forEach((item, index) => {
            const observacaoHTML = item.observacao ? `<p class="observacao-item">Obs: ${item.observacao}</p>` : '';
            const itemHTML = `
                <div class="cartao-item" data-nome="${item.nome}">
                    <img src="${item.imagem}" alt="${item.nome}" class="imagem-item">
                    <div class="info-item">
                        <span class="nome-item">${item.nome}</span>
                        ${observacaoHTML}
                        <div class="seletor-quantidade">
                            <button class="botao-quantidade botao-menos" data-indice="${index}">-</button>
                            <span class="quantidade-item">${item.quantidade}</span>
                            <button class="botao-quantidade botao-mais" data-indice="${index}">+</button>
                        </div>
                    </div>
                    <div class="preco-item">R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</div>
                    <button class="botao-remover" data-indice="${index}">
                        <ion-icon name="trash-outline"></ion-icon>
                    </button>
                </div>
            `;
            containerItensCarrinho.innerHTML += itemHTML;
            subtotal += item.preco * item.quantidade;
            totalItens += item.quantidade;
        });
        
        const taxaEntrega = TAXA_ENTREGA;
        const total = subtotal + taxaEntrega;

        subtotalCarrinho.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        totalCarrinho.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        contadorCarrinhoSpan.textContent = totalItens;
        if (totalItens > 0) {
            contadorCarrinhoSpan.classList.add('ativo');
        } else {
            contadorCarrinhoSpan.classList.remove('ativo');
        }

        const botoesRemover = document.querySelectorAll('.cartao-item .botao-remover');
        botoesRemover.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const indice = e.target.closest('.botao-remover').getAttribute('data-indice');
                carrinho.splice(indice, 1);
                renderizarCarrinho();
            });
        });
        
        const botoesMaisCarrinho = document.querySelectorAll('.cartao-item .botao-mais');
        botoesMaisCarrinho.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const indice = e.target.closest('.botao-mais').getAttribute('data-indice');
                carrinho[indice].quantidade++;
                renderizarCarrinho();
            });
        });

        const botoesMenosCarrinho = document.querySelectorAll('.cartao-item .botao-menos');
        botoesMenosCarrinho.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const indice = e.target.closest('.botao-menos').getAttribute('data-indice');
                if (carrinho[indice].quantidade > 1) {
                    carrinho[indice].quantidade--;
                    renderizarCarrinho();
                } else {
                    carrinho.splice(indice, 1);
                    renderizarCarrinho();
                }
            });
        });
    }
    
// --- Notificação Temporária ---
    let timeoutNotificacao;
    function mostrarNotificacao(event, mensagem) {
        clearTimeout(timeoutNotificacao);

        // Define o texto da notificação
        textoNotificacao.textContent = mensagem;

        // Calcula a posição para a notificação aparecer acima e centralizada no botão
        // Pega as dimensões do botão clicado para posicionar a notificação
        const rect = event.target.getBoundingClientRect();
        
        // Posiciona a notificação no centro horizontal do botão e acima dele
        notificacao.style.left = `${rect.left + rect.width / 2}px`;
        notificacao.style.top = `${rect.top - notificacao.offsetHeight - 10}px`; // 10px acima do botão


        notificacao.classList.add('mostrar');

        timeoutNotificacao = setTimeout(() => {
            notificacao.classList.remove('mostrar');
        }, 2000); // A notificação desaparece após 2 segundos
    }

    function fecharPainelCarrinho() {
        painelCarrinho.classList.remove('ativo');
        sobreposicaoCarrinho.classList.remove('ativo');
    }
    
    if (botaoCarrinho && painelCarrinho && sobreposicaoCarrinho && botaoFecharPainel) {
        botaoCarrinho.addEventListener('click', abrirPainelCarrinho);
        botaoFecharPainel.addEventListener('click', fecharPainelCarrinho);
        sobreposicaoCarrinho.addEventListener('click', fecharPainelCarrinho);
    }
});