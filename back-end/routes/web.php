<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    error_log('Test!');
    return response()->json([
        'title' => 'Welcome to our web application',
        'body' => 'Hello World!'
    ]);
});

Route::post('/test', 'eventAjaxController@test');
