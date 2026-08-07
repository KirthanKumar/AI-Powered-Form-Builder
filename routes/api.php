<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FormController;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/forms', [FormController::class, 'store']);
});