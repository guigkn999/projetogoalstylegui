const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.json());

const arquivo = './carrinho.json';
const arquivoCompras = './compras.json'; // Arquivo para o histórico de vendas

// Função para ler o carrinho atual
function lerCarrinho() {
    try {
        const data = fs.readFileSync(arquivo, 'utf8');
        return JSON.parse(data || '[]');
    } catch {
        return [];
    }
}

// Função para salvar o estado do carrinho
function salvarCarrinho(carrinho) {
    fs.writeFileSync(
        arquivo,
        JSON.stringify(carrinho, null, 2)
    );
}

// Função para salvar o pedido finalizado no histórico de compras
function salvarCompraNoHistorico(compra) {
    let compras = [];
    try {
        const data = fs.readFileSync(arquivoCompras, 'utf8');
        compras = JSON.parse(data || '[]');
    } catch {
        compras = [];
    }
    compras.push(compra);
    fs.writeFileSync(
        arquivoCompras,
        JSON.stringify(compras, null, 2)
    );
}

// LISTAR ITENS DO CARRINHO
app.get('/api/carrinho', (req, res) => {
    res.json(lerCarrinho());
});

// ADICIONAR PRODUTO AO CARRINHO
app.post('/api/carrinho', (req, res) => {
    const produto = req.body;
    let carrinho = lerCarrinho();
    carrinho.push(produto);
    salvarCarrinho(carrinho);
    res.json({ mensagem: 'Produto adicionado' });
});

// AUMENTAR QUANTIDADE (Adiciona duplicado para manter a lógica atual)
app.put('/api/carrinho/:nome/mais', (req, res) => {
    let carrinho = lerCarrinho();
    const nome = decodeURIComponent(req.params.nome);
    const item = carrinho.find(p => p.nome === nome);

    if (item) {
        carrinho.push(item);
    }

    salvarCarrinho(carrinho);
    res.json({ mensagem: 'Quantidade aumentada' });
});

// DIMINUIR QUANTIDADE
app.put('/api/carrinho/:nome/menos', (req, res) => {
    let carrinho = lerCarrinho();
    const nome = decodeURIComponent(req.params.nome);
    const index = carrinho.findIndex(p => p.nome === nome);

    if (index !== -1) {
        carrinho.splice(index, 1);
    }

    salvarCarrinho(carrinho);
    res.json({ mensagem: 'Quantidade diminuída' });
});

// REMOVER TODAS AS UNIDADES DE UM PRODUTO
app.delete('/api/carrinho/:nome', (req, res) => {
    let carrinho = lerCarrinho();
    const nome = decodeURIComponent(req.params.nome);
    carrinho = carrinho.filter(p => p.nome !== nome);
    salvarCarrinho(carrinho);
    res.json({ mensagem: 'Produto removido' });
});

// LIMPAR TODO O CARRINHO (Rota manual se necessário)
app.delete('/api/carrinho', (req, res) => {
    salvarCarrinho([]);
    res.json({ mensagem: 'Carrinho limpo' });
});

// FINALIZAR COMPRA (Processa, gera o pedido, salva no histórico e limpa o carrinho)
app.post('/api/checkout', (req, res) => {
    let carrinho = lerCarrinho();

    if (carrinho.length === 0) {
        return res.status(400).json({ erro: 'O carrinho está vazio.' });
    }

    // Calcula o valor total no servidor por questões de segurança
    let total = 0;
    carrinho.forEach(item => {
        let precoNumero = Number(
            item.preco
                .replace('R$', '')
                .replace(/\./g, '')
                .replace(',', '.')
        );
        total += precoNumero;
    });

    // Cria a estrutura do pedido finalizado
    const novoPedido = {
        id_pedido: Date.now().toString(), // ID único temporário baseado no timestamp
        data: new Date().toISOString(),
        itens: carrinho,
        total: total
    };

    // Salva permanentemente no histórico e limpa o carrinho atual
    salvarCompraNoHistorico(novoPedido);
    salvarCarrinho([]); 

    res.status(201).json({
        mensagem: 'Compra finalizada com sucesso no back-end!',
        pedido: novoPedido
    });
});

// Servir imagens estáticas
app.use('/img', express.static('img'));

// Inicialização do servidor
app.listen(3000, () => {
    console.log('🚀 Servidor rodando na porta 3000');
});