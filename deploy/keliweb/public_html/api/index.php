<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Expected FTP layout:
// domains/gmjewelmarine.it/public_html/api/index.php
// domains/gmjewelmarine.it/laravel/vendor/autoload.php
$laravelPath = dirname(__DIR__, 2).'/laravel';

if (file_exists($maintenance = $laravelPath.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $laravelPath.'/vendor/autoload.php';

/** @var Application $app */
$app = require_once $laravelPath.'/bootstrap/app.php';

$app->handleRequest(Request::capture());
