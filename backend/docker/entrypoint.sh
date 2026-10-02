#!/bin/sh
set -e

# Chiave dell'app: se manca ne genera una valida solo per questo processo
if [ -z "$APP_KEY" ]; then
    APP_KEY="base64:$(head -c 32 /dev/urandom | base64)"
    export APP_KEY
    echo "APP_KEY vuota: generata una chiave temporanea"
fi

php artisan migrate --force

# Dati dimostrativi solo se richiesto e se non ci sono ancora utenti
if [ "$SEED_ON_START" = "true" ]; then
    USERS=$(php artisan tinker --execute="echo \Illuminate\Support\Facades\DB::table('users')->count();" | tail -n 1)
    if [ "$USERS" = "0" ]; then
        php artisan db:seed --force
    fi
fi

# I comandi sopra girano come root: i file creati devono restare scrivibili da php-fpm
chown -R www-data:www-data storage bootstrap/cache

exec php-fpm
