FROM composer:2 AS builder

WORKDIR /app

COPY composer.json ./

RUN composer install \
    --no-interaction \
    --no-dev \
    --prefer-dist \
    --optimize-autoloader

FROM php:8.4-cli-alpine

WORKDIR /app

RUN apk add --no-cache imagemagick imagemagick-dev font-dejavu libjpeg-turbo libjpeg-turbo-dev \
    && apk add --no-cache --virtual .build-deps autoconf build-base \
    && pecl channel-update pecl.php.net \
    && pecl install imagick \
    && docker-php-ext-enable imagick \
    && apk del imagemagick-dev \
    && apk del .build-deps

COPY --from=builder /app/vendor ./vendor
COPY public ./public
COPY src ./src

RUN chown -R www-data:www-data /app

USER www-data

EXPOSE 8000

CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
