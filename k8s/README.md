# Kubernetes

Os manifests desta pasta implantam a API, o worker assíncrono de extração,
PostgreSQL e Kafka no cluster local.
Em produção, PostgreSQL e Kafka podem ser substituídos por serviços gerenciados
ou deployments mantidos separadamente.

## Preparação

Construa e publique a imagem:

```bash
docker build -t projeto-nest:latest .
```

Em um cluster local, carregue a imagem conforme a ferramenta utilizada. Em um
cluster remoto, publique a imagem em um registry e altere `image` em
`deployment.yaml`, `worker-deployment.yaml` e `migration-job.yaml`.

O `POST /documents` registra o documento e retorna `202 Accepted`. A extração
é consumida pelo `document-extraction-worker`; consulte `GET /documents/:id`
até o status ser `completed` ou `failed`.

Crie um Secret real a partir do exemplo. Não versionar credenciais reais:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl -n document-service create secret generic document-service-secret \
  --from-literal=DB_USERNAME=postgres \
  --from-literal=DB_PASSWORD='senha-segura'
```

O arquivo `secret.example.yaml` serve apenas como referência e não faz parte
do `kustomization.yaml`.

## Deploy

```bash
kubectl apply -k k8s/
kubectl -n document-service get pods
kubectl -n document-service get hpa
```

Execute as migrations antes de disponibilizar a API:

```bash
kubectl -n document-service delete job document-service-migrations --ignore-not-found
kubectl apply -f k8s/migration-job.yaml
kubectl -n document-service wait --for=condition=complete job/document-service-migrations --timeout=180s
```

O Job usa as migrations compiladas em `dist/`, adequadas para a imagem de
produção.

O HPA exige o Metrics Server instalado no cluster. O `Service` é interno
(`ClusterIP`); para acesso externo, adicione um Ingress ou altere o tipo do
Service conforme a infraestrutura.
