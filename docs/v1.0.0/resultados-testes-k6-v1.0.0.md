## Resultados dos testes k6

| Endpoint | VUs | Iterations configuradas por VU | Iteracoes planejadas | Iteracoes concluidas | Sucesso | Tempo medio | P95 | Maximo | Duracao |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `POST /documents -> completed` | 5 | 1 | 5 | 5 | 100% | 510,4 ms | 513,4 ms | 514 ms | 0,7 s |
| `POST /documents -> completed` | 5 | 10 | 50 | 50 | 100% | 500,72 ms | 515,54 ms | 517 ms | 5,5 s |
| `POST /documents -> completed` | 10 | 10 | 100 | 100 | 100% | 537,08 ms | 634,15 ms | 1,04 s | 6,7 s |
| `POST /documents -> completed` | 25 | 25 | 625 | 625 | 100% | 1,20 s | 2,32 s | 3,83 s | 34,8 s |
| `POST /documents -> completed` | 40 | 40 | 1.600 | 1.600 | 100% | 1,39 s | 2,56 s | 3,85 s | 1 min 02,7 s |
| `POST /documents -> completed` | 40 | 40 | 1.600 | 1.600 | 100% | 2,08 s | 3,84 s | 10,66 s | 1 min 35,2 s |
| `POST /documents -> completed` | 50 | 50 | 2.500 | 2.500 | 100% | 2,45 s | 4,71 s | 8,41 s | 2 min 13,6 s |
| `POST /documents -> completed` | 100 | 100 | 10.000 | 4.226 | 100% das concluidas | 6,95 s | 14,68 s | 20,47 s | 5 min |

### Metrica de processamento

| Metrica | Media | Minimo | Mediana | P90 | P95 | Maximo |
|---|---:|---:|---:|---:|---:|---:|
| `document_processing_duration` | 1,39 s | 506 ms | 1,52 s | 2,12 s | 2,56 s | 3,85 s |

### Indicadores do teste

| Indicador | Resultado |
|---|---:|
| Checks executados | 3.200 |
| Checks aprovados | 3.200 (100%) |
| Checks reprovados | 0 (0%) |
| Requisicoes HTTP | 7.431 |
| Requisicoes HTTP com erro | 0 (0%) |
| Vazao de requisicoes HTTP | 118,44 requisicoes/s |
| Vazao de iteracoes | 25,50 iteracoes/s |
| Usuarios virtuais | 40 |

### Observacao

O tempo da metrica `document_processing_duration` representa o intervalo entre a aceitacao do upload e a conclusao do processamento pelo worker. As requisicoes de consulta de status usadas pelo polling nao sao incluidas nessa metrica.
