<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FormController;
use App\Http\Controllers\Api\SchemaController;
use App\Http\Controllers\Api\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/forms', [FormController::class, 'store']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/forms/{form}/sections', [SchemaController::class, 'addSection']);
    Route::post('/forms/{form}/sections/{sectionId}/fields', [SchemaController::class, 'addField']);
    Route::patch('/forms/{form}/fields/{fieldId}', [SchemaController::class, 'updateField']);
});
