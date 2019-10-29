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

// SPRINT 1 (AUTHENTICATION ROUTES)
Route::post('/log_in', 'eventAjaxController@log_in');
Route::post('/sign_up', 'eventAjaxController@sign_up');
Route::post('/get_account_details', 'eventAjaxController@get_account_details');
Route::post('/create_account', 'eventController@create_account');
Route::post('/edit_account', 'eventAjaxController@edit_account');
Route::post('/get_account_details', 'eventAjaxController@get_account_details');

// SPRINT 2 (EVENT ROUTES)
Route::post('/create_event', 'eventAjaxController@create_event');
Route::post('/edit_event', 'eventAjaxController@edit_event');
Route::post('/get_event_details', 'eventAjaxController@get_event_details');
Route::post('/cancel_event', 'eventAjaxController@cancel_event');
Route::post('/get_upcoming_events', 'eventAjaxController@get_upcoming_events');
Route::post('/get_invited_events_past', 'eventAjaxController@get_invited_events_past');
Route::post('/get_invited_events_upcoming', 'eventAjaxController@get_invited_events_upcoming');
Route::post('/get_emails_exclude_user', 'eventAjaxController@get_emails_exclude_user');
Route::get('/','eventAjaxController@mark_as_going');

// SPRINT 3 (ROUTES)
Route::post('/get_attendees_of_event', 'eventAjaxController@get_attendees_of_event');
Route::post('/get_past_events', 'eventAjaxController@get_past_events');
Route::post('/get_timetable_details', 'eventAjaxController@get_timetable_details');
Route::post('/save_timetable_details', 'eventAjaxController@save_timetable_details');
Route::post('/load_event_sessions', 'eventAjaxController@load_event_sessions');
Route::post('/create_event_sessions', 'eventAjaxController@create_event_sessions');
Route::post('/edit_event_sessions', 'eventAjaxController@edit_event_sessions');
Route::post('/remove_event_sessions', 'eventAjaxController@remove_event_sessions');
Route::post('/search_public_event', 'eventAjaxController@search_public_event');
Route::post('/get_tags', 'eventAjaxController@get_tags');
Route::post('/cancel_event_sessions', 'eventAjaxController@cancel_event_sessions');

// SPRINT 4 (ROUTES)
// US-6 (Notify Attendees), US-16 (Mark as Going), US-4 (Cancel Session from Event)

// SPRINT 5 (ROUTES)
// US10 (Setup Custom Reminders), US-14(Tagging Events), US-15 (Search for an Event), US-17 (Send Invitations)

// SPRINT 6 (ROUTES)
// US-9 (View Clashing Events)/US-7 (Manage Availabilities), US-13 (Summary Dashboard)

Route::post('/create_account', 'eventController@create_account');

//Route::post('/test', 'eventAjaxController@test');

