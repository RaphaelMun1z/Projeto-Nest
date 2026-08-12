import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const pdf = open('./documento.pdf', 'b');
const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
const executionId = new Date().toISOString().replace(/\D/g, '');

// Mede somente o tempo entre a aceitação do upload e a conclusão do worker.
// As consultas GET usadas para polling não entram nesta métrica.
export const processingDuration = new Trend('document_processing_duration', true);

export const options = {
    scenarios: {
        processDocuments: {
            executor: 'per-vu-iterations',
            vus: 100,
            iterations: 100,
            maxDuration: '5m',
        },
    },
};

export default function () {
    const fileName = `documento-${executionId}-${__VU}-${__ITER}.pdf`;
    const response = http.post(`${baseUrl}/documents`, {
        file: http.file(pdf, fileName, 'application/pdf'),
        disciplina: 'Engenharia de Software',
        universidade: 'Universidade de Teste',
        ano_curriculo: '2026',
        description: 'Documento criado durante o teste de processamento',
    });

    const accepted = check(response, {
        'aceita o documento': (res) => res.status === 202,
    });

    if (!accepted) {
        console.log(`Status ${response.status}: ${response.body}`);
        return;
    }

    const documentId = response.json('id');
    const processingStart = Date.now();
    let completed = false;

    for (let attempt = 0; attempt < 240; attempt++) {
        const statusResponse = http.get(`${baseUrl}/documents/${documentId}`);
        const status = statusResponse.json('status');

        if (status === 'completed') {
            processingDuration.add(Date.now() - processingStart);
            completed = true;
            break;
        }

        if (status === 'failed') {
            console.log(`Falha no processamento: ${statusResponse.body}`);
            break;
        }

        sleep(0.5);
    }

    check(null, {
        'processa o documento': () => completed,
    });
}
