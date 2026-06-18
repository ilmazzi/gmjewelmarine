<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EntityController;
use App\Http\Controllers\Api\UploadController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => ['ok' => true]);

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

Route::middleware('auth.api')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/upload', [UploadController::class, 'store']);
});

Route::get('/entities/{entity}', [EntityController::class, 'index']);
Route::get('/entities/{entity}/{id}', [EntityController::class, 'show']);
Route::post('/entities/{entity}', [EntityController::class, 'store']);
Route::put('/entities/{entity}/{id}', [EntityController::class, 'update']);
Route::patch('/entities/{entity}/{id}', [EntityController::class, 'update']);
Route::delete('/entities/{entity}/{id}', [EntityController::class, 'destroy']);
