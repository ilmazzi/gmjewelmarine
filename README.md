# GM Jewel Marine

Frontend React/Vite con backend Laravel e database MySQL.

## Sviluppo Locale

1. Installa le dipendenze frontend:

```bash
npm install
```

2. Configura il backend:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

3. Crea un database MySQL chiamato `gm_jewel_marine`, poi lancia:

```bash
php artisan migrate --seed
php artisan storage:link
.\serve-local.ps1
```

4. In un secondo terminale avvia il frontend:

```bash
npm run dev
```

Il frontend usa il proxy Vite verso `http://localhost:8000` per `/api` e `/storage`.

## Credenziali Admin Iniziali

Email: `admin@gmjewelmarine.local`

Password: `ChangeMe123!`

Cambia queste credenziali prima della pubblicazione.

## Deploy

Build frontend:

```bash
npm run build
```

Pubblica `dist` come sito statico e configura Laravel sullo stesso dominio o sottodominio, con `.env` puntato al database MySQL di produzione.
