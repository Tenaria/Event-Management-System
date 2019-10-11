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
Route::post('/create_account', 'eventController@create_account');
Route::get('/','eventController@edit_account');
Route::post('/get_account_details', 'eventAjaxController@get_account_details');

Route::post('/create_account', 'eventController@create_account');

Route::post('/test', 'eventAjaxController@test');

