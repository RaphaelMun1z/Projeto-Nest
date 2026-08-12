import http from 'k6/http';
import { check } from 'k6';

// Carrega um PDF válido usado por todas as requisições do teste.
const pdf = open('./documento.pdf', 'b');

// Gera um identificador com a data e a hora do início da execução.
const executionId = new Date().toISOString().replace(/\D/g, '');

export const options = {
    scenarios: {
        createDocuments: {
            // Cria usuários virtuais para enviar uma requisição cada um.
            executor: 'per-vu-iterations',
            vus: 40,
            // Executa criação por usuário.
            iterations: 40,
            // Permite até um minuto para concluir as criações.
            maxDuration: '1m',
        },
    },
};

export default function () {
    // Gera um nome diferente para evitar conflito com o nome único do arquivo.
    const fileName = `documento-${executionId}-${__VU}-${__ITER}.pdf`;

    // Envia o PDF e os campos obrigatórios para criar o documento.
    const response = http.post('http://localhost:3000/documents', {
        file: http.file(pdf, fileName, 'application/pdf'),
        disciplina: 'Engenharia de Software',
        universidade: 'Universidade de Teste',
        ano_curriculo: '2026',
        description: 'Documento criado durante o teste de carga',
    });

    // Exibe o status e a mensagem da API quando a criação falha.
    if (response.status !== 201) {
        console.log(`Status ${response.status}: ${response.body}`);
    }

    // Verifica se a API criou o documento com sucesso.
    check(response, {
        'cria o documento': (res) => res.status === 201,
    });
}
