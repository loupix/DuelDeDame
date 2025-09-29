# Déployer sur Portainer (RPi 2B+ et autres)

Ce guide explique comment construire et déployer l'image multi-arch et l'exécuter sur un noeud Portainer (Stack) avec persistance SQLite.

## 1) Build CI/CD automatique

- Le workflow GitHub Actions `.github/workflows/docker.yml` build et pousse l'image multi-arch vers GHCR.
- Cibles: `linux/amd64`, `linux/arm/v7` (RPi 2B+), `linux/arm64`.
- Tags: `latest` sur `main`, et tags semver sur release `vX.Y.Z`.

Pré-requis:
- Activer GitHub Packages: aucune config spéciale, le workflow utilise `${{ secrets.GITHUB_TOKEN }}`.

## 2) Pull depuis Portainer

Dans Portainer, crée une Stack avec ce `docker-compose.yml` minimal (image publiée sous `loupix`):

```yaml
version: '3.8'
services:
  web:
    image: ghcr.io/loupix/duel-de-dame:latest
    ports:
      - "3000:3000"
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - NEST_PORT=3001
      - NEXT_PUBLIC_API_URL=http://<ip_node>:3001
    volumes:
      - db_data:/app/api/data
    restart: unless-stopped
volumes:
  db_data:
```

- Remplace `<ip_node>` par l'IP du noeud Portainer accessible par les clients.
- Sur RPi 2B+, l'architecture est `arm/v7`. L'image multi-arch sélectionnera automatiquement la bonne variante.

## 3) Variables d'environnement utiles

- `NEST_PORT`: port d'écoute de l'API Nest (par défaut 3001, déjà exposé).
- `NEXT_PUBLIC_API_URL`: URL publique du backend vue par le navigateur. Mets l'IP/nom du noeud et le port 3001.
- `NODE_ENV`: garde `production`.

## 4) Persistance des données

- Le fichier SQLite vit dans `/app/api/data/duel-de-dame.sqlite`.
- Le volume `db_data` le persiste à travers les redéploiements.

## 5) Commandes utiles (local)

- Build local multi-arch et push vers GHCR:

```bash
docker buildx create --use --name x
docker login ghcr.io -u <user> -p <token>
export IMAGE=ghcr.io/<user>/duel-de-dame:dev
docker buildx build --platform linux/amd64,linux/arm/v7,linux/arm64 -t $IMAGE --push .
```

## 6) Notes

- Le conteneur lance l'API Nest et Next.js dans le même pod (monolithique) et expose 3000 (front) et 3001 (back).
- Si tu préfères séparer front/back, on peut ajouter 2 Dockerfiles et 2 services compose.
