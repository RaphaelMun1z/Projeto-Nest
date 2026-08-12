## Resultados dos testes k6

| Endpoint | VUs | Iterations configuradas por VU | Iteracoes planejadas | Iteracoes concluidas | Sucesso | Tempo medio | P95 | Maximo | Duracao |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `GET /documents` | 5 | 10 | 50 | 50 | 100% | 6,63 ms | 40,56 ms | 44,59 ms | 10,1 s |
| `POST /documents` | 5 | 1 | 5 | 5 | 100% | 105,72 ms | 145,07 ms | 150,09 ms | 0,2 s |
| `POST /documents` | 10 | 10 | 100 | 100 | 100% | 213,78 ms | 310,02 ms | 374,22 ms | 2,3 s |
| `POST /documents` | 25 | 25 | 625 | 625 | 100% | 550,86 ms | 677,04 ms | 931,74 ms | 14,1 s |
| `POST /documents` | 40 | 40 | 1.600 | 1.600 | 100% | 954,64 ms | 1,59 s | 2 s | 39,5 s |
| `POST /documents` | 50 | 50 | 2.500 | 2.062 | 100% das concluidas | 1,47 s | 2,42 s | 4,17 s | 1 min |
| `POST /documents` | 100 | 100 | 10.000 | 2.542 | 100% das concluidas | 2,41 s | 4,59 s | 6,96 s | 1 min |
