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

//AUTHENTICATION ROUTES
Route::post('/log_in', 'eventAjaxController@log_in');

Route::get('/', 'eventAjaxController@log_in');

Route::post('/test', 'eventAjaxController@test');
