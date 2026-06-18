# Deploy Keliweb / DirectAdmin

Questa procedura e' pensata per hosting Linux con FTP e phpMyAdmin, senza SSH.

## 1. Build Frontend

Dal progetto locale:

```powershell
npm run build
```

## 2. Prepara Laravel

Assicurati che le dipendenze PHP siano presenti localmente:

```powershell
cd backend
composer config platform.php 8.2.0
composer install --no-dev --optimize-autoloader
```

Prima di caricare `vendor/`, controlla che `backend/vendor/composer/platform_check.php`
richieda `>= 8.2.0` e non `>= 8.4.1`.

Copia `backend/.env.keliweb.example` in `backend/.env` e compila:

```env
APP_KEY=...
DB_HOST=...
DB_DATABASE=...
DB_USERNAME=...
DB_PASSWORD=...
PUBLIC_UPLOAD_ROOT=/home/USERNAME/domains/gmjewelmarine.it/public_html/storage
```

Se `APP_KEY` e' vuota, usa quella del `.env` locale oppure genera una nuova key prima dell'upload.

## 3. Import Database

In DirectAdmin apri phpMyAdmin, seleziona il database creato e importa:

```text
deploy/keliweb/database.sql
```

Credenziali admin iniziali:

```text
admin@gmjewelmarine.local
ChangeMe123!
```

Cambia la password appena possibile.

## 4. Upload FTP

Struttura consigliata su DirectAdmin:

```text
domains/gmjewelmarine.it/
  laravel/
  public_html/
```

Carica in `domains/gmjewelmarine.it/laravel/` tutto il contenuto di `backend/`, inclusa la cartella `vendor/`.

Carica in `domains/gmjewelmarine.it/public_html/`:

```text
dist/*
deploy/keliweb/public_html/.htaccess
deploy/keliweb/public_html/api/index.php
deploy/keliweb/public_html/storage/uploads/
public/gm-jewel-marine-logo.png
```

Il file API deve finire esattamente qui:

```text
domains/gmjewelmarine.it/public_html/api/index.php
```

e si aspetta Laravel qui:

```text
domains/gmjewelmarine.it/laravel/
```

## 5. Test

Apri:

```text
https://gmjewelmarine.it/api/health
```

Deve rispondere:

```json
{"ok":true}
```

Poi prova:

```text
https://gmjewelmarine.it/login
```

## Note

- Le rotte React come `/catalogo`, `/admin`, `/annuncio/...` sono gestite da `.htaccess`.
- Le API Laravel sono sotto `/api`.
- Gli upload immagini vengono salvati in `/storage/uploads`.
