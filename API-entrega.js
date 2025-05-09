import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

        const SUPABASE_URL = 'https://joootssfsyqruiflpfib.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvb290c3Nmc3lxcnVpZmxwZmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNjY2NjcsImV4cCI6MjA1ODg0MjY2N30.Cx4fqgC-PVy2vud4kNUhaJrJvKGZCjae76VSqxxLXvI';
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        let produtosSelecionados = [];

        function carregarProdutos() {
            produtosSelecionados = JSON.parse(localStorage.getItem('produtosSelecionados')) || [];

            const tabela = document.getElementById("ListaProdutos");
            tabela.innerHTML = '';

            if (produtosSelecionados.length === 0) {
                tabela.innerHTML = '<tr><td colspan="3" class="text-center">Nenhum produto selecionado.</td></tr>';
                return;
            }

            produtosSelecionados.forEach(produto => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${produto.CodProduto}</td>
                    <td>${produto.Descricao}</td>
                    <td>${produto.Quantidade}</td>
                `;
                tabela.appendChild(row);
            });
        }

        async function salvarEntrega() {
            const entrega = {
                observacoes: document.getElementById('Observacoes').value,
                LocalCarga: document.getElementById('Carga').value,
                LocalDescarga: document.getElementById('Descarga').value,
                CidadeCarga: document.getElementById('CidadeCarga').value,
                CidadeDescarga: document.getElementById('CidadeDescarga').value,
                DataHoraCarga: document.getElementById('DataHoraCarga').value,
                DataHoraDescarga: document.getElementById('DataHoraDescarga').value,
                Matricula: document.getElementById('Matricula').value
            };

            const { error } = await supabase.from('Entrega').insert([entrega]);
            if (error) {
                console.error('Erro ao salvar entrega:', error);
                alert("Erro ao salvar entrega.");
                return;
            }

            gerarPDF(entrega);
        }

        async function gerarPDF(entrega) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.text("Empresa Demonstrativa, Lda", 20, 20);
            doc.setFontSize(12);
            doc.text("Rua teste", 20, 30);
            doc.text("4123-123 Cidade da Loja, Portugal", 20, 40);
            doc.text("email@empresa.com | Tel: 222 220 220", 20, 50);

            doc.setFontSize(14);
            doc.text("Guia de Transporte", 140, 20);
            doc.setFontSize(12);
            doc.text("Número: 2025/32", 140, 30);
            doc.text("Data/Hora: 2025-02-26 11:16:07", 140, 40);
            doc.text("Via Original", 140, 50);

            doc.setFillColor(0);
            doc.setTextColor(255);
            doc.rect(20, 60, 170, 10, "F");
            doc.text("Cliente Nº 32", 25, 67);
            doc.setTextColor(0);
            doc.text("Cliente empresa", 20, 75);
            doc.text("Rua Teste 2", 20, 85);
            doc.text("4000-208 Porto, Portugal", 20, 95);

            doc.setFont("helvetica", "bold");
            doc.text("Cod.", 20, 110);
            doc.text("Descrição", 40, 110);
            doc.text("Quant.", 110, 110);

            let y = 120;

            for (const produto of produtosSelecionados) {
                doc.setFont("helvetica", "normal");
                doc.text(produto.CodProduto, 20, y);
                doc.text(produto.Descricao, 40, y);
                doc.text(produto.Quantidade.toString(), 110, y);
                y += 10;
            }

            doc.text(`Observações: ${entrega.observacoes}`, 20, y + 10);
            doc.text(`Carga: ${entrega.LocalCarga}, ${entrega.CidadeCarga} ${entrega.DataHoraCarga}`, 20, y + 20);
            doc.text(`Descarga: ${entrega.LocalDescarga}, ${entrega.CidadeDescarga} ${entrega.DataHoraDescarga}`, 20, y + 30);
            doc.text(`Matrícula: ${entrega.Matricula}`, 20, y + 40);

            doc.save("guia_transporte.pdf");
        }

        document.addEventListener("DOMContentLoaded", () => {
            carregarProdutos();
            document.getElementById("confirmarBtn").addEventListener("click", salvarEntrega);
        });