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
    Route::patch('/forms/{form}/sections/{sectionId}', [SchemaController::class, 'renameSection']);
    Route::delete('/forms/{form}/sections/{sectionId}', [SchemaController::class, 'deleteSection']);
    Route::post('/forms/{form}/sections/{sectionId}/fields', [SchemaController::class, 'addField']);
    Route::patch('/forms/{form}/fields/{fieldId}', [SchemaController::class, 'updateField']);
    Route::delete('/forms/{form}/fields/{fieldId}', [SchemaController::class, 'deleteField']);
    Route::post('/forms/{form}/fields/{fieldId}/duplicate', [SchemaController::class, 'duplicateField']);
    Route::patch('/forms/{form}/sections/{sectionId}/fields/move', [SchemaController::class, 'moveField']);
});
