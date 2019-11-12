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

// basic authentication routes
Route::post('/log_in', 'eventAjaxController@log_in');
Route::post('/sign_up', 'eventAjaxController@sign_up');

// account routes
Route::post('/get_account_details', 'eventAjaxController@get_account_details');
Route::post('/create_account', 'eventController@create_account');
Route::post('/edit_account', 'eventAjaxController@edit_account');
Route::post('/get_account_details', 'eventAjaxController@get_account_details');

// event modification routes
Route::post('/create_event', 'eventAjaxController@create_event');
Route::post('/edit_event', 'eventAjaxController@edit_event');
Route::post('/cancel_event', 'eventAjaxController@cancel_event');
Route::post('/uncancel_event', 'eventAjaxController@uncancel_event');
Route::post('/mark_as_going','eventAjaxController@mark_as_going');
Route::post('/unmark_as_going', 'eventAjaxController@unmark_as_going');

// event grabbing routes
Route::post('/get_upcoming_events', 'eventAjaxController@get_upcoming_events');
Route::post('/get_invited_events_past', 'eventAjaxController@get_invited_events_past');
Route::post('/get_invited_events_upcoming', 'eventAjaxController@get_invited_events_upcoming');
Route::post('/get_past_events', 'eventAjaxController@get_past_events');

Route::post('/get_attendees_of_event', 'eventAjaxController@get_attendees_of_event');
Route::post('/get_event_details', 'eventAjaxController@get_event_details');
Route::post('/search_public_event', 'eventAjaxController@search_public_event');


// select routes
Route::post('/get_emails_exclude_user', 'eventAjaxController@get_emails_exclude_user');
Route::post('/get_tags', 'eventAjaxController@get_tags');


// session routes
Route::post('/load_event_sessions', 'eventAjaxController@load_event_sessions');
Route::post('/create_event_sessions', 'eventAjaxController@create_event_sessions');
Route::post('/edit_event_sessions', 'eventAjaxController@edit_event_sessions');
Route::post('/remove_event_sessions', 'eventAjaxController@remove_event_sessions');
Route::post('/cancel_event_sessions', 'eventAjaxController@cancel_event_sessions');
Route::post('/uncancel_event_sessions', 'eventAjaxController@uncancel_event_sessions');

// timetable routes
Route::post('/get_timetable_details', 'eventAjaxController@get_timetable_details');
//Route::post('/save_timetable_details', 'eventAjaxController@save_timetable_details');
Route::post('/add_timetable_block', 'eventAjaxController@add_timetable_block');
Route::post('/remove_timetable_block', 'eventAjaxController@remove_timetable_block');

// other routes
Route::get('/', 'eventAjaxController@get_summary_dashboard');
Route::post('/notify_attendees', 'eventAjaxController@notify_attendees');
//Route::get('/','eventAjaxController@tags_list');