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
Route::post('/get_account_details', 'eventAjaxController@get_account_details');

Route::get('/', 'eventAjaxController@get_account_details');

Route::post('/test', 'eventAjaxController@test');
