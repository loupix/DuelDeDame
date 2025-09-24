# Script PowerShell pour nettoyer le projet
Write-Host "🧹 Nettoyage du projet..." -ForegroundColor Cyan

# Supprimer les dossiers de cache
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✅ Dossier .next supprimé" -ForegroundColor Green
}

if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "✅ Cache node_modules supprimé" -ForegroundColor Green
}

if (Test-Path "api\dist") {
    Remove-Item -Recurse -Force "api\dist"
    Write-Host "✅ Dossier api/dist supprimé" -ForegroundColor Green
}

Write-Host "🎉 Nettoyage terminé !" -ForegroundColor Green
Write-Host "Vous pouvez maintenant exécuter: npm run build" -ForegroundColor Yellow