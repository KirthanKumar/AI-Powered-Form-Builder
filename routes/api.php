<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FormController;
use App\Http\Controllers\Api\SchemaController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PublicFormController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/forms', [FormController::class, 'index']);
    Route::post('/forms', [FormController::class, 'store']);
    Route::get('/forms/{form}', [FormController::class, 'show']);
    Route::post('/forms/{form}/publish', [FormController::class, 'publish']);
    Route::post('/forms/{form}/unpublish', [FormController::class, 'unpublish']);
    Route::get('/forms/{form}/schema', [SchemaController::class, 'schema']);
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

Route::get('/public/forms/{uuid}', [PublicFormController::class, 'show']);