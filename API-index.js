import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
        const SUPABASE_URL = 'https://joootssfsyqruiflpfib.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvb290c3Nmc3lxcnVpZmxwZmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNjY2NjcsImV4cCI6MjA1ODg0MjY2N30.Cx4fqgC-PVy2vud4kNUhaJrJvKGZCjae76VSqxxLXvI';
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        async function carregarProdutos() {
            const { data, error } = await supabase.from('Produto').select('*');
            if (error) {
                console.error('Erro ao buscar produtos:', error);
                return;
            }

            const tabela = document.getElementById("ListaProdutos");
            tabela.innerHTML = '';

            data.forEach(produto => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${produto.CodProduto}</td>
                    <td>${produto.Descricao}</td>
                    <td><input type="number" min="0" value="0" id="Quantidade-${produto.CodProduto}" class="form-control" style="width: 80px;"></td>
                `;
                tabela.appendChild(row);
            });
        }
        document.addEventListener("DOMContentLoaded", () => {
        document.querySelector("button").onclick = Pedido;
        });

        async function Pedido() {
            const { data: produtos, error } = await supabase.from('Produto').select('*');
            if (error) {
                console.error('Erro ao buscar produtos:', error);
                return;
            }
            let produtosSelecionados = [];
            let temProdutoSelecionado = false;  // Para verificar se algum produto foi selecionado

            produtos.forEach(produto => {
                const Quantidade = document.getElementById(`Quantidade-${produto.CodProduto}`).value;
                
                if (Quantidade > 0) {
                    temProdutoSelecionado = true; 
                    produtosSelecionados.push({
                        CodProduto: produto.CodProduto,
                        Descricao: produto.Descricao,
                        Quantidade: parseInt(Quantidade)
                    });
                }
            });

            // Verifique se pelo menos um produto foi selecionado
            if (!temProdutoSelecionado) {
                alert("Por favor, selecione pelo menos um produto com quantidade maior que 0.");
                return;
            }

            const { error: upsertError } = await supabase
            .from('Produto')
            .upsert(produtosSelecionados, { onConflict: ['CodProduto'] });

            if (upsertError) {
                console.error('Erro ao salvar pedido:', upsertError);
                alert("Erro ao salvar o pedido")
                return;
            }

             // Armazenar os produtos selecionados no localStorage (caso precise de salvar)
            localStorage.setItem('produtosSelecionados', JSON.stringify(produtosSelecionados));

            alert("Pedido confirmado!");

            // Resetar os campos manualmente
            produtos.forEach(produto => {
                const campo = document.getElementById(`Quantidade-${produto.CodProduto}`);
                if (campo) campo.value = 0;
            });

            // Pequeno atraso para que o usuário veja o reset antes do redirecionamento
            setTimeout(() => {
                window.location.href = 'entrega.html';
            }, 300); // 0.3s
        }

        carregarProdutos();