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
Route::post('/sign_up', 'eventAjaxController@sign_up');
Route::post('/get_account_details', 'eventAjaxController@get_account_details');
Route::post('/create_account', 'eventController@create_account');
Route::get('/','eventAjaxController@edit_account');
Route::post('/edit_account', 'eventAjaxController@edit_account');
Route::post('/get_account_details', 'eventAjaxController@get_account_details');

//EVENT ROUTES
Route::post('/create_event', 'eventAjaxController@create_event');
Route::post('/edit_event', 'eventAjaxController@edit_event');
Route::post('/get_event_details', 'eventAjaxController@get_event_details');
Route::post('/cancel_event', 'eventAjaxController@cancel_event');

Route::post('/create_account', 'eventController@create_account');

Route::post('/test', 'eventAjaxController@test');

