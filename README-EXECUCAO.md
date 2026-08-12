# Finalizar Docker e Kubernetes

```powershell
docker compose down --remove-orphans
kubectl delete namespace document-service --wait=true
```

# Docker Compose

```powershell
docker compose down --remove-orphans
docker compose up -d --build

while ($true) {
    Clear-Host
    docker compose ps
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
    Start-Sleep -Seconds 5
}
```

# Kubernetes

```powershell
kubectl delete namespace document-service --wait=true
docker build -t projeto-nest:latest .
kubectl apply -f k8s\namespace.yaml
kubectl -n document-service create secret generic document-service-secret --from-literal=DB_USERNAME=postgres --from-literal=DB_PASSWORD=postgres
kubectl apply -k k8s

while ($true) {
    Clear-Host
    Write-Host "DOCUMENT-SERVICE KUBERNETES - $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
    Write-Host ""

    $apiPods = kubectl -n document-service get pods -l app.kubernetes.io/name=document-service --field-selector=status.phase=Running --no-headers
    $workerPods = kubectl -n document-service get pods -l app.kubernetes.io/name=document-extraction-worker --field-selector=status.phase=Running --no-headers
    $apiCount = ($apiPods | Measure-Object).Count
    $workerCount = ($workerPods | Measure-Object).Count

    Write-Host "Instancias backend ativas: $apiCount" -ForegroundColor Green
    Write-Host ""
    Write-Host "CPU e memoria por instancia backend:" -ForegroundColor Yellow
    kubectl top pods -n document-service -l app.kubernetes.io/name=document-service

    Write-Host ""
    Write-Host "Instancias worker ativas: $workerCount" -ForegroundColor Green
    Write-Host ""
    Write-Host "CPU e memoria por instancia worker:" -ForegroundColor Yellow
    kubectl top pods -n document-service -l app.kubernetes.io/name=document-extraction-worker

    Write-Host ""
    Write-Host "Escalabilidade do HPA:" -ForegroundColor Yellow
    kubectl -n document-service get hpa

    Start-Sleep -Seconds 5
}
```

# k6

```powershell
k6 run -e BASE_URL=http://localhost:30080 .\documents.test.js
```
