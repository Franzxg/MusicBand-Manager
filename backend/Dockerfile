# Stage 1: dipendenze PHP (anche quelle di sviluppo, servono per i test)
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --no-scripts --no-autoloader
COPY . .
RUN composer dump-autoload --optimize --no-scripts

# Stage 2: PHP 8.3 FPM
FROM php:8.3-fpm-alpine
RUN docker-php-ext-install pdo_mysql

COPY docker/php.ini /usr/local/etc/php/conf.d/zz-app.ini
COPY docker/www.conf /usr/local/etc/php-fpm.d/zz-app.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

WORKDIR /var/www/html
COPY --from=vendor /app ./
# .env vuoto: la configurazione arriva solo da compose (evita i warning di phpdotenv)
RUN touch .env \
    && php artisan package:discover --ansi \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 9000
# Lanciato con sh: non dipende dal bit di esecuzione (checkout su Windows)
ENTRYPOINT ["sh", "/usr/local/bin/entrypoint.sh"]
