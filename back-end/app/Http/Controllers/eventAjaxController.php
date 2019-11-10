<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;
use Response;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Hash;

class eventAjaxController extends Controller
{
	/*
		function to add a user to the users database given a set of information
	*/
	public function sign_up(Request $request) {
        $fname = $request->input('fname'); // STRING; NOT EMPTY
        $lname = $request->input('lname'); // STRING; NOT EMPTY
        $email = $request->input('email'); // STRING; NOT EMPTY
        $password = $request->input('password'); //STRING; NOT EMPTY
        $password_confirm = $request->input('password_confirm'); //STRING; NOT EMPTY

        // Check all details have values
        if(!empty($fname) && !empty($lname) && !empty($email) && !empty($password) && !empty($password_confirm)) {
        	//check that another user has not already registered with the same email address
             $check = DB::table('users')
	                        ->where([
	                            ['users_email', $email],
	                            ['users_active', 1]
	                        ])
	                        ->first();

	        if(is_null($check)) {
	        	// check that the two passwords match, that user has not made a typo
	           	if($password == $password_confirm) {
		            $user_id = DB::table('users')
			                            ->insertGetId([
			                            	'users_fname' => $fname, 
			                            	'users_lname' => $lname, 
			                            	'users_email' => $email, 
			                                'users_password' => Hash::make($password),
			                                'users_active' => 1
			                            ]);
			        
			        return Response::json([], 200);
		        }

		        return Response::json([
		        	'status' => 'no_match'
		        ], 400);
	        }

	        return Response::json([
	        	'status' => 'email_in_use'
	        ], 400);
        }

       	return Response::json([
        	'status' => 'missing_input'
        ], 400);
    }

    /*
    	log in functionality, that given some credentials will check they match against the database for some user
    */
	public function log_in(Request $request) {
		$email = $request->input('email'); // STRING; NOT EMPTY
        $password = $request->input('password'); // STRING; NOT EMPTY

        if (!isset($email) || empty($email)) {
			return Response::json(['error' => 'email is either not set or null'], 400);
		}

		if (!isset($password) || empty($password)) {
			return Response::json(['error' => 'password is either not set or null'], 400);
		}

		// check all fields exist
        if(isset($email) && !is_null($email) && isset($password) && !is_null($password)) {
        	$user = DB::table('users')
	                    ->where([
	                    	['users_email', $email],
	                    	['users_active', 1]
	                    ])
	                    ->first();

	        // check that email exists in the database, with a valid matching password as wat is stored
	        if (!is_null($user) && !is_null($password) && Hash::check($password, $user->users_password)) {
	        	// grab secret key from env file for JWT
	        	$key = env('JWT_KEY');

	        	// set expiration date of JWt token
	        	$timestamp = strtotime('+30 days', time());

	        	// set necessary details of JWT token that may be usefull
	        	$token = [
	        		'user_id' => $user->users_id,
	        		'expiration' => $timestamp,
	        		'email' => $user->users_email,
	        		'name' => $user->users_fname." ".$user->users_lname
	        	];

	        	// create JWT token
	        	$jwt = JWT::encode($token, $key);

	        	// pass JWT token back to front-end
	        	return Response::json([
	        		'token' => $jwt
	        	], 200);
	        } else {
				return Response::json(['error' => 'user does not exist or password is wrong'], 400);
	        }
        }

        return Response::json([], 400);
	}

	/*
	function to get a user's details including name and email
	*/

	public function get_account_details(Request $request) {
		$token = $request->input('token'); // STRING; NOT EMPTY

		if (!isset($token) || empty($token)) {
			return Response::json(['error' => 'JWT is either not set or null'], 400);
		}

		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				// query the database to check that a user exists and that the user that the person is trying to access is the same user as the person logged in (for security)
				$user_data = DB::table('users')
								 ->where([
									['users_active', 1],
									['users_id', $token_data['user_id']]
								])
								->first();

				if(!is_null($user_data)) {
					// return first name, last name and email
					return Response::json([
		        		'users_fname' => $user_data->users_fname,
		        		'users_lname' => $user_data->users_lname,
		        		'users_email' => $user_data->users_email
		        	], 200);
				} else {
					return Response::json(['error' => 'user does not exist'], 400);
				}
			}
		}

		return Response::json([], 400);
	}

	/*
	function to modify a user's account given some new information
	*/

	public function edit_account(Request $request) {
		$fnameInput = $request->input('fname'); // STRING; NOT EMPTY;
		$lnameInput = $request->input('lname'); // STRING; NOT EMPTY;
		$password = $request->input('password'); // STRING;;
		$password_confirm= $request->input('password_confirm'); // STRING;
		$token = $request->input('token'); // STRING; NOT EMPTY

		// check valus are set
		if (!isset($token) || empty($token)) {
			return Response::json(['error' => 'JWT is either not set or null'], 400);
		}

		if (!isset($fnameInput) || empty($fnameInput)) {
			return Response::json(['error' => 'first name is either not set or null'], 400);
		}

		if (!isset($lnameInput) || empty($lnameInput)) {
			return Response::json(['error' => 'last name is either not set or null'], 400);
		}

		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				// query the database to check that a user exists and that the user that the person is trying to access is the same user as the person logged in (for security)
				$user_data = DB::table('users')
								 ->where([
									['users_active', 1],
									['users_id', $token_data['user_id']]
								])
								->first();

				if(!is_null($user_data)) {
					// if the user wishes to change their password, chack that the new passwords match so that the user hasn't made an error
					if(!is_null($password) && $password == $password_confirm && proper_empty_check($password)) {
						DB::table('users')
							->where([
								['users_active', 1],
								['users_id', $token_data['user_id']]
							])
							->update([
								'users_fname' => $fnameInput, 
								'users_lname' => $lnameInput,
								'users_password' => Hash::make($password)	
							]);
					//otherwise we are editing other details not password related such as first name and last name
					} else {
						DB::table('users')
							->where([
								['users_active', 1],
								['users_id', $token_data['user_id']]
							])
							->update([
								'users_fname' => $fnameInput, 
								'users_lname' => $lnameInput
							]);
					}
					
					return Response::json([], 200);
				} else {
					return Response::json(['error' => 'user does not exist'], 400);
				}
			}
		}
		return Response::json([], 400);
	}

	/*
		basic function to create an event in the database given a set of details
	*/
	public function create_event(Request $request) {
		$token = $request->input('token'); // STRING; NOT EMPTY
		$event_name = $request->input('event'); // STRING; NOT EPTY
		$event_desc = $request->input('desc'); // STRING
		$event_location = $request->input('event_location'); // STRING; NOT EMPTY
		$event_attendees = $request->input('event_attendees'); // ARRAY OF INTEGERS
		$event_public = $request->input('event_public'); // INTEGER 1 OR 0; NOT NULL
		$tags = $request->input('event_tags'); // ARRAY OF STRINGS

		// check all fields are set as necessary
		if (!isset($token) || empty($token)) {
			return Response::json(['error' => 'JWT is either not set or null'], 400);
		}

		if (!isset($event_name) || empty($event_name)) {
			return Response::json(['error' => 'event name is either not set or null'], 400);
		}

		if (!isset($event_location) || empty($event_location)) {
			return Response::json(['error' => 'event location is either not set or null'], 400);
		}
		
		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				if(isset($event_name) && !empty($event_name)) {
					//INSERT EVENT NAME AND DESCRIPTION INTO DATABASE
					$currentTimeInSeconds = time();
					$new_event_id = DB::table('events')
										->insertGetId([
											'events_active' => 1,
											'events_name' => $event_name,
											'events_desc' => $event_desc,
											'events_createdat' => $currentTimeInSeconds,
											'events_createdby' => $token_data['user_id'],
											'events_public' => $event_public
										]);

					//INSERT EVENT LOCATION INTO DATABASE
					$attributes_name_to_id = get_event_attributes_pk();
					DB::table('events_attributes_values')
						->insert([
							'attributes_values_attributes_id' => $attributes_name_to_id['location'],
							'attributes_values_value' => $event_location,
							'attributes_values_active' => 1,
							'attributes_values_events_id' => $new_event_id
						]);

					//INESRT OWNER
					DB::table('events_access')
								->insert([
									'access_user_id' => $token_data['user_id'],
									'access_active' => 1,
									'access_events_id' => $new_event_id
								]);

					//INESRT EVENT ATTENDEES IF GIVEN
					if(isset($event_attendees) && !empty($event_attendees)) {
						foreach($event_attendees as $attendee) {
							DB::table('events_access')
								->insert([
									'access_user_id' => $attendee,
									'access_active' => 1,
									'access_events_id' => $new_event_id
								]);
						}
					}

					//INSERT TAGS
					if(isset($tags) && !empty($tags)) {
						$tags_insert = [];
						foreach($tags as $tag) {
							$tags_insert[] = [
								'tags_linking_events_id' => $new_event_id,
								'tags_linking_value' => strtolower($tag),
								'tags_linking_active' => 1
							];	
						}

						DB::table('events_tags_linking')
							->insert($tags_insert);
					}

					return Response::json([], 200);
				}

				return Response::json([], 400);
			}
		}
		
		return Response::json([], 400);
	}

	/*
		given a new set of details, modifies and updates database to reflect these changes for an existing event
	*/
	public function edit_event(Request $request) {
		$token = $request->input('token'); // STRING; NOT EMPTY
		$event_id = $request->input('event_id'); // INTEGER; NOT EMPTY
		$new_event_name = $request->input('event_name'); // STRING; NOT EMPTY
		$new_event_desc = $request->input('event_desc'); // STRING
		$new_event_location = $request->input('event_location'); // STRING; NOT EMPTY
		$new_event_attendees = $request->input('event_attendees'); // ARRAY OF INTEGERS
		$new_event_public = $request->input('event_public'); // INTEGER 0 OR 1; NOT NULL
		$new_tags = $request->input('event_tags'); // ARRAY OF STRINGS

		// check all fields are set as necessary
		if (!isset($token) || empty($token)) {
			return Response::json(['error' => 'JWT is either not set or null'], 400);
		}

		if (!isset($event_id) || empty($event_id)) {
			return Response::json(['error' => 'event id is either not set or null'], 400);
		}

		if (!isset($new_event_name) || empty($new_event_name)) {
			return Response::json(['error' => 'event name is either not set or null'], 400);
		}

		if (!isset($new_event_location) || empty($new_event_location)) {
			return Response::json(['error' => 'event location is either not set or null'], 400);
		}

		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				// check that event exists and is created by user
				// cannot edit events that you do not own
				$event_data = DB::table('events')
								->where ([
									['events_active', 1],
									['events_createdby',$token_data['user_id']],
									['events_id', $event_id]
								])
								->first();

				if(!is_null($event_data)) {
					//grab the attributes that match a string to the primary key in the database
					$attributes_name_to_id = get_event_attributes_pk();

					if(isset($new_event_name) && !empty($new_event_name)) {
						//update event name, description and whether it is public or private
						DB::table('events')
							->where([
								['events_active', 1],
								['events_createdby',$token_data['user_id']],
								['events_id', $event_id]
							])
							->update([
								'events_name' => $new_event_name,
								'events_public' => $new_event_public,
								'events_desc' => $new_event_desc
							]);

						//grab all event attributes related to the event
						$event_attributes = DB::table('events_attributes_values')
												->where([
													['attributes_values_events_id', $event_id],
													['attributes_values_active', 1]
												])
												->get();

						//map the attribute id (primary key) to the attribute value for the event
						$current_attributes_array = [];
						if(!is_null($event_attributes)) {
							foreach($event_attributes as $attribute) {
								$attribute_id = $attribute->attributes_values_attributes_id;
								$attribute_value = $attribute->attributes_values_value;
								if($attribute_value != NULL) {
									$current_attributes_array[$attribute_id] = $attribute_value;
								} else {
									$current_attributes_array[$attribute_id] = "";
								}
							}
						}
				
						// INSERT LOCATION IF NOT EXIST IN DATABASE ALREADY
						$location_id = $attributes_name_to_id['location'];
						if(!isset($current_attributes_array[$location_id])) {
							DB::table('events_attributes_values')
								->insert([
									'attributes_values_attributes_id' => $location_id,
									'attributes_values_value' => $new_event_location,
									'attributes_values_active' => 1,
									'attributes_values_events_id' => $event_id
								]);
						// OTHERWISE UPDATE LOCATION IF CHANGE HAS OCCURRED
						} else if($new_event_location !== $current_attributes_array[$location_id]) {
							if(!($current_attributes_array[$location_id] == "" && $new_event_location == NULL)) {
								DB::table('events_attributes_values')
								->where([
									['attributes_values_attributes_id', $location_id],
									['attributes_values_active', 1],
									['attributes_values_events_id', $event_id]
								])
								->update(['attributes_values_value' => $new_event_location]);
							}
						}

						if(!is_null($new_event_attendees)) {
							// UPDATE THE ATTENDEES
							if(!isset($new_event_attendees) || empty($new_event_attendees)) {
								$new_event_attendees = [$token_data['user_id']];
							} else if (!in_array($token_data['user_id'], $new_event_attendees)) {
							    $new_event_attendees[] = $token_data['user_id'];
							}

							// grab all the attendees currently in the database for calculations
							$attendees = DB::table('events_access')
											->where([
												//['access_active', 1],
												['access_events_id', $event_id]
											])
											->get();

							$current_attendees = [];
							$inactive_attendees = [];
							if(!is_null($attendees)) {
								foreach($attendees as $attendee) {
									if($attendee->access_active == 1) {
										$current_attendees[] = $attendee->access_user_id;
									} else {
										$inactive_attendees[] = $attendee->access_user_id;
									}
								}
							}

							// figure out what attendees have been newly added in this edit transaction
							$new_attendees = array_diff($new_event_attendees, $current_attendees);
							// figure out what attendees have been removed in this edit transaction
							$old_attendees = array_diff($current_attendees, $new_event_attendees);

							// REMOVE OLD ATTENDEES
							$attendees = DB::table('events_access')
											->where([
												['access_active', 1],
												['access_events_id', $event_id]
											])
											->whereIn('access_user_id', $old_attendees)
											->update(['access_active' => 0]);

							// ADD IN NEW ATTENDEES
							$insert = [];
							if(!empty($new_attendees)) {
								foreach($new_attendees as $new_attendee) {
									$insert[] = [
										'access_user_id' => $new_attendee,
										'access_active' => 1,
										'access_events_id' => $event_id
									];
								}

								DB::table('events_access')
									->insert($insert);
							}
						}
						
						if(!is_null($new_tags)) {
							// UPDATE THE TAGS
							if(!isset($new_tags) || empty($new_tags)) {
								$new_tags = [];
							}

							// grab a list of tags alreayd existing in the database for calculation
							$tags = DB::table('events_tags_linking')
										->where([
											['tags_linking_events_id', $event_id],
											['tags_linking_active', 1]
										])
										->get();

							$current_tags = [];
							if(!is_null($tags)) {
								foreach($tags as $tag) {
									$current_tags[] = strtolower($tag->tags_linking_value);
								}
							}

							$new_tag_arr = [];
							if(!is_null($new_tags)) {
								foreach($new_tags AS $new_tag) {
									$new_tag_arr[] = strtolower($new_tag);
								}
							}

							// figure out what tags have been newly added in this update
							$new_taggerino = array_diff($new_tag_arr, $current_tags);
							// figure out what tags have been removed in this update
							$old_tags = array_diff($current_tags, $new_tag_arr);

							// REMOVE TAGS
							DB::table('events_tags_linking')
								->where([
									['tags_linking_events_id', $event_id],
									['tags_linking_active', 1]
								])
								->whereIn('tags_linking_value', $old_tags)
								->update(['tags_linking_active' => 0]);

							// ADD NEW TAGS
							$insert_tags = [];
							if(!empty($new_taggerino)) {
								foreach($new_taggerino as $new_tag) {
									$insert_tags[] = [
										'tags_linking_active' => 1,
										'tags_linking_value' => $new_tag,
										'tags_linking_events_id' => $event_id
									];
								}

								DB::table('events_tags_linking')
									->insert($insert_tags);
							}
						}

						return Response::json([], 200);
					}	
				}
				
				return Response::json(['status' => 'Event does not exist'], 400);
			} 
		
			return Response::json([], 400);
		}	
	}

	public function get_event_clash(Request $request){
		$token = $request->input('token');
		$events_id = $request->input('events_id');
		$start_timestamp = $request->input('start_timestamp');
		$end_timestamp = $request->input('end_timestamp');
		if(isset($token) && !empty($token)&& isset($start_timestamp)
			&& !empty($end_timestamp) && isset($end_timestamp)&&!empty($end_timestamp)){
			$token_data = validate_jwt($token);
			if($token_data == true){
				$user_id = $token_data["user_id"];
				if(DB::table('events')->where([['events_id', $events_id], ['events_createdby', $user_id]])->exists()){
					$attendees = DB::table('events_sessions as es')
						->where([['es.sessions_events_id', $events_id],['es.sessions_status', 0]])
						->joins('events_sessions_attendance as esa', 'esa.sessions_attendance_sessions_id', '=', 'es.sessions_id')
						->where([['esa.sessions_attendance_going', 1], ['esa.sessions_attendance_active', 0]])
						->joins('events_access as ea', 'esa.sessions_attendance_access_id', '=', 'ea.access_id')
						->where([['ea.access_active', 0], ['ea.access_archived', 0]])
						->select('ea.access_user_id')						
						->get();
					if(isset($attendees) && !empty($attendees)){
						$clashlist = [];
						foreach($attendees as $attendee){
							$clash = DB::tables('events_access as ea')
								->where([['ea.access_user_id', $attendee->access_user_id],['ea.access_active', 0], ['ea.access_archived', 0]])
								->joins('events_sessions_attendance as esa', 'ea.access_id', 'es.sessions_attendance_access_id')
								->where([['esa.sessions_attendance_going', 1], ['esa.sessions_attendance_active', 0]])
								->joins('events_sessions as es', 'esa.sessions_attendance_sessions_id', '=', 'es.sessions_id')
								->where([['es.sessions_start_time', '<=', $start_timestamp],['es.sessions_end_time', '>=', $end_timestamp], ['es.sessions_active', 1], ['es.sessions_status', 0]])
								->select('es.session_id')
								->get();
							if(isset($clash) && !empty($clash)) {
								$clashlist[] = ['sessions_id' => $clash->sessions_id];
							}
						}
						return Response::json(['clashes'=> $clashlist], 200);

					}

				}
									
			}

		}
		return Response::json([], 400);

	}

	public function mark_as_going(Request $request) {
		$token = $request->input('token'); // STRING; NOT EMPTY
		$event_id = $request->input('event_id'); // INTEGER; NOT EMPTY
		$session_id = $request->input('session_id'); // INTEGER; NOT EMPTY

		// check all values exist as necessary
		if (!isset($token) || empty($token)) {
			return Response::json(['error' => 'JWT is either not set or null'], 400);
		}

		if (!isset($event_id) || empty($event_id)) {
			return Response::json(['error' => 'event id is either not set or null'], 400);
		}

		if (!isset($session_id) || empty($session_id)) {
			return Response::json(['error' => 'session id is either not set or null'], 400);
		}

		if(isset($token) && !empty($token) && isset($event_id) && !empty($event_id) && isset($session_id) && !empty($session_id)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				//check that event is valid and exists
				$event_data = DB::table('events')
								->where ([
									['events_active', 1],
									['events_id', $event_id],
									['events_status', 0]
								])
								->first();

				if(!is_null($event_data)) {
					// check if event is public - anyone can join these events
					if($event_data->events_public == 1) {
						// check that session is valid and exists
						$session_data = DB::table('events_sessions')
											->where([
												['sessions_active', 1],
												['sessions_events_id', $event_id],
												['sessions_id', $session_id]
											])
											->first();

						if(!is_null($session_data)){
							$acess_id = 0;
							//CHECK iF USER ALREADY HAS ACCESS TO A EVENT
							$curr_event_access = DB::table('events_access')
												->where([
													['access_events_id', $event_id],
													['access_active', 1],
													['access_user_id', $token_data['user_id']]
												])
												->first();

							//IF SO, THEN SESSIONS ATTENDANCE
							if(!is_null($curr_event_access)) {
								$access_id = $curr_event_access->access_id;
							//IF NOT THEN INESRT ACCESS, THEN SESSIONS ATTENDANCE
							} else{
								$access_id = DB::table('events_access')
												->insertGetId([
													'access_user_id' => $token_data['user_id'],
													'access_active' => 1,
													'access_events_id' => $event_id,
													'access_archived' => 0
												]);
							}
							
							//UPDATE OR INSERT AS NECESSARYY
							if($access_id != 0) {
								DB::table('events_sessions_attendance')
									->updateOrInsert([
										'sessions_attendance_sessions_id' => $session_id,
										'sessions_attendance_access_id' => $access_id
										],
										['sessions_attendance_active' => 1,
										 'sessions_attendance_going' => 1
										]
									);
							} else {
								return Response::json(['error' => 'access id has not been set (bacekend issue)'], 400);
							}
							
							return Response::json([], 200);
						} else {
							return Response::json(['error' => 'session does not exist'], 400);
						}

					//event is not public - user must be invited to be able to attend				
					} else if($event_data->events_public == 0) {
						// check that user has been invited to a session and has been given access
						$session_data = DB::table('events_sessions AS s')
											->join('events_access AS a', function($join) {
												$join->on('a.access_events_id', '=', 's.sessions_events_id')
													->where('a.access_active', 1);
											})
											->where([
												['s.sessions_active', 1],
												['s.sessions_events_id', $event_id],
												['s.sessions_id', $session_id]
												
											])
											->first();
						
						if(!is_null($session_data)){
							//update or insert attendance in database as necessary
							DB::table('events_sessions_attendance')
								->updateOrInsert([
									'sessions_attendance_sessions_id' => $session_id,
									'sessions_attendance_activeccess_id' => $session_data->access_id
									],
									['sessions_attendance_active' => 1,
									 'sessions_attendance_going' => 1
									]
								);
							
							return Response::json([], 200);
						} else {
							return Response::json(['error' => 'session or access does not exist and it should'], 400);
						}
					}
				} else {
					return Response::json(['error' => 'event does not exist'], 400);
				}			
			}					
		}						
		return Response::json([], 400);
	}

	public function unmark_as_going(Request $request) {
		$token = $request->input('token'); // STRING; NOT EMPTY
		$event_id = $request->input('event_id'); //INTEGER; NOT EMPTY
		$session_id = $request->input('session_id'); // INTEGER; NOT EMPTY

		// check all values exist as necessary
		if (!isset($event_id) || empty($event_id)) {
			return Response::json(['error' => 'event id is either not set or null'], 400);
		}

		if (!isset($session_id) || empty($session_id)) {
			return Response::json(['error' => 'session id is either not set or null'], 400);
		}
		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				//make sure event, session and access exist
				$access = DB::table('events AS e')
								->join('events_access AS a', function($join) use ($token_data, $event_id) {
									$join->on('a.access_events_id', '=', 'e.events_id')
										->where([
											['a.access_active', 1],
											['a.access_user_id', $token_data['user_id']],
											['a.access_events_id', $event_id]
										]);
								})
								->join('events_sessions AS s', function($join) use($session_id) {
									$join->on('s.sessions_events_id', '=', 'a.access_events_id')
										->where([
											['s.sessions_id', $session_id],
											['s.sessions_active', 1],
											['s.sessions_status', 0]
										]);
								})
								->join('events_sessions_attendance AS sa', function($join) use ($session_id) {
									$join->on('a.access_id', '=', 'sa.sessions_attendance_access_id')
										->where([
											['sa.sessions_attendance_going', 1],
											['sa.sessions_attendance_active', 1],
											['sa.sessions_attendance_sessions_id', $session_id]
										]);
								})
								->where([
									['e.events_id', $event_id],
									['e.events_active', 1],
									['e.events_status', 0]
								])
								->first();

				if(!is_null($access)) {
					$sessions_attendance_id = $access->sessions_attendance_id;

					DB::table('events_sessions_attendance')
						->where([
							['sessions_attendance_id', $sessions_attendance_id]
						])
						->delete();

					return Response::json([], 200);
				}

				return Response::json(['error' => 'event, session or access does not exist in the database'], 400);
			}
		}
		
		return Response::json(['error' => 'JWT is either not set or null'], 400);
	}

	/*
		grab the details of an event such as locatoin, name, description, etc.
	*/
	public function get_event_details(Request $request) {
		$token = $request->input('token'); // STRING; NOT EMPTY
		$event_id = $request->input('event_id'); // INTEGER; NOT EMPTY

		// check all values are set as necessary
		if (!isset($token) || empty($token)) {
			return Response::json(['error' => 'JWT is either not set or null'], 400);
		}

		if (!isset($event_id) || empty($event_id)) {
			return Response::json(['error' => 'event id is either not set or null'], 400);
		}

		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				// check event exists
				$event_data = DB::table('events AS e')
								->select('e.*', 'a.access_id', DB::raw("(SELECT GROUP_CONCAT(tl.tags_linking_value SEPARATOR '~') FROM events_tags_linking AS tl WHERE tl.tags_linking_active=1 AND tl.tags_linking_events_id=e.events_id) as `tags`"))
								->leftJoin('events_access AS a', function($join) use($token_data) {
									$join->on('a.access_events_id', '=', 'e.events_id')
										->where([
											['a.access_active', 1],
											['a.access_user_id', $token_data['user_id']]
										]);
								})
								->where ([
									['e.events_active', 1],
									['e.events_id', $event_id]
								])
								->first();

								/*
									DB::raw("(SELECT GROUP_CONCAT(DISTINCT CONCAT(u.users_fname, '~', u.users_lname, '~', IFNULL(sa.sessions_attendance_going, 0), '~', a.access_id, '~', u.users_email) SEPARATOR '`') FROM events_access a INNER JOIN events_sessions_attendance sa ON sa.sessions_attendance_access_id=a.access_id INNER JOIN users u on u.users_id=a.access_user_id WHERE a.access_events_id=s.sessions_events_id AND a.access_active=1 AND u.users_active=1 AND sa.sessions_attendance_sessions_id=s.sessions_id) as 'attendees'")
								*/

				if(!is_null($event_data)) {
					//if the event is private, we need to do some extra checking to see if the user is allowed to see it
					if($event_data->events_public == 0) {
						if(!isset($event_data->access_id) || empty($event_data->access_id) || is_null($event_data->access_id)) {
							return Response::json(['error' => 'unauthorised access to private event'], 400);
						}
					}

					$tags = [];
					if(!is_null($event_data->tags)) {
						$tags_data = explode('~', $event_data->tags);
						foreach($tags_data AS $tag_data) {
							$tags[] = $tag_data;
						}
					}

					// grab string to primary key mapping of attributes
					$attributes_name_to_id = get_event_attributes_pk();

					// grab all the attribute values of an event
					$event_attributes = DB::table('events_attributes_values')
												->where([
													['attributes_values_events_id', $event_id],
													['attributes_values_active', 1]
												])
												->get();

					// map the primary key to a human readable string
					$current_attributes_array = [];
					$id_to_name_array = [];
					if(!empty($attributes_name_to_id)) {
						foreach($attributes_name_to_id as $name => $id) {
							$current_attributes_array[$name] = null;
							$id_to_name_array[$id] = $name;
						}
					}

					// map the string to the attribute value of an event
					if(!is_null($event_attributes)) {
						foreach($event_attributes as $attribute) {
							$attribute_id = $attribute->attributes_values_attributes_id;
							$attribute_value = $attribute->attributes_values_value;

							$attribute_name = $id_to_name_array[$attribute_id];

							$current_attributes_array[$attribute_name] = $attribute_value;
						}
					}

					//check if event is cancelled
					$cancelled = false;
					if($event_data->events_status == 1) {
						$cancelled = true;
					}

					// return details
					return Response::json([
						'events_id' => $event_data->events_id,
						'events_name' => $event_data->events_name,
						'events_public' => $event_data->events_public,
						//'events_createdby' => $event_data->events_createdby,
						'events_createdat' => $event_data->events_createdat,
						'events_desc' => $event_data->events_desc,
						'attributes' => $current_attributes_array,
						'tags' => $tags,
						'events_cancelled' => $cancelled
						//attributes['location'] WILL GIVE YOU THE LOCATION
		        	], 200);
				} else {
					return Response::json(['error' => 'event does not exist'], 400);
				}
			}
		}
		
		return Response::json([], 400);
	}

	/*
		functoinality to cancel the entirety of an event
	*/
	public function cancel_event(Request $request) {
		$token = $request->input('token'); // STRING; NOT EMPTY
		$event_id = $request->input('event_id'); // INTEGER; NOT EMPTY

		// check all values are set as necessary
		if (!isset($token) || empty($token)) {
			return Response::json(['error' => 'JWT is either not set or null'], 400);
		}

		if (!isset($event_id) || empty($event_id)) {
			return Response::json(['error' => 'event id is either not set or null'], 400);
		}
		
		if(isset($token) && !empty($token) && isset($event_id) && !empty($event_id)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				// check event exists, belongs to user (as you cannot cancel another person's event) and has not already been cancelled or deleted
				$event_data = DB::table('events')
								->where ([
									['events_active', 1],
									['events_createdby', $token_data['user_id']],
									['events_id', $event_id],
									['events_status', 0]
								])
								->first();

				if(!is_null($event_data)) {
					//perform the actual update to set the event status to cancelled
					DB::table('events')
								->where ([
									['events_active', 1],
									['events_createdby', $token_data['user_id']],
									['events_id', $event_id],
									['events_status', 0]
								])
								->update(['events_status' => 1]);

					return Response::json([], 200);
				} else {
					return Response::json(['error' => 'event does not exist'], 400);
				}
			}
		}
		
		return Response::json([], 400);
	}
	/*
		uncancel event, the reverse of cancel event to uncancel an event in the case the user has accidently cancelled it or would like to revert a cancellation for some reason
	*/
	public function uncancel_event(Request $request) {
		$token = $request->input('token'); // STRING; NOT EMPTY
		$event_id = $request->input('event_id'); // INTEGER; NOT EMPTY

		// check all values are set as necessary
		if (!isset($token) || empty($token)) {
			return Response::json(['error' => 'JWT is either not set or null'], 400);
		}

		if (!isset($event_id) || empty($event_id)) {
			return Response::json(['error' => 'event id is either not set or null'], 400);
		}
		
		if(isset($token) && !empty($token) && isset($event_id) && !empty($event_id)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				// check event exists, belongs to user (as you cannot ucancel another person's event) and has already been cancelled but not deleted as you need an event to be cancelled before you can uncancel it
				$event_data = DB::table('events')
								->where ([
									['events_active', 1],
									['events_createdby', $token_data['user_id']],
									['events_id', $event_id],
									['events_status', 1]
								])
								->first();

				if(!is_null($event_data)) {
					//perform the actual update to set the event status to cuncancelled
					DB::table('events')
								->where ([
									['events_active', 1],
									['events_createdby', $token_data['user_id']],
									['events_id', $event_id],
									['events_status', 1]
									
								])
								->update(['events_status' => 0]);

					return Response::json([], 200);
				} else {
					return Response::json(['error' => 'event does not exist'], 400);
				}
			}
		}
		
		return Response::json([], 400);
		
	}

	/*
		function to get events created by the logged in user that have sessions in the future or do not have sessions set yet
	*/
	public function get_upcoming_events(Request $request) {
		$token = $request->input('token'); // STRING; NOT EMPTY

		if (!isset($token) || empty($token)) {
			return Response::json(['error' => 'JWT is either not set or null'], 400);
		}
		
		// check token is set
		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				// build an array of upcoming events (session set in future or no session set)
				$events_array = [];
				// figure out which events are upcoming under the definition written above
				$event_data = DB::table('events AS e')
								->select('e.*', DB::raw("IFNULL((SELECT s.sessions_end_time FROM events_sessions AS s WHERE s.sessions_events_id=e.events_id AND s.sessions_active=1 ORDER BY s.sessions_end_time DESC LIMIT 1), 0) as 'dates_latest'"), DB::raw("(SELECT count(a.access_user_id) FROM events_access AS a WHERE a.access_events_id=e.events_id) as 'num_attendees'"), DB::raw("(SELECT GROUP_CONCAT(DISTINCT CONCAT(t.tags_linking_value) SEPARATOR '~') FROM events_tags_linking AS t WHERE t.tags_linking_events_id=e.events_id AND t.tags_linking_active=1) as 'tags'"))
								->where ([
									['e.events_active', 1],
									['e.events_createdby',$token_data['user_id']]
									
								])
								->havingRaw('dates_latest=0 OR dates_latest > '.round(microtime(true) * 1000))
								->get();

				if(!is_null($event_data)) {
					foreach($event_data as $event) {
						$event_status = "ONGOING";

						$tags = [];
						if(isset($event->tags) && !is_null($event->tags)) {
							$tag_data = explode('~', $event->tags);
							foreach($tag_data AS $tag) {
								$tags[] = $tag;
							}
						}

						// check if event has been cancelled
						$cancelled = false;
						if($event->events_status) {
							$cancelled = true;
						}

						// check if event is public or private
						$public = false;
						if($event->events_public == 1) {
							$public = true;
						}

						// calculate the number of people invited to the event
						$num_attendees = 0;
						if(isset($event->num_attendees) && !empty($event->num_attendees)) {
							$num_attendees = $event->num_attendees;
						}

						// build array containing all relevant data
						$events_array[] = [
							'events_id' => $event->events_id,
							'events_name' => $event->events_name,
							'events_desc' => $event->events_desc,
							'events_status' => $event_status,
							'events_public' => $public,
							'events_cancelled' => $cancelled,
							'events_attendees_count' => $num_attendees,
							'events_tags' => $tags
						];
					}
				}

				// return events array
				return Response::json(['events' => $events_array], 200);
			}
		}
		
		return Response::json([], 400);
	}

	/*
		function to return upcoming events (with a session in the future or no session set) that the logged in user is invited to but the logged in user is not the creator of
	*/
	public function get_invited_events_upcoming(Request $request){
		$token = $request->input('token'); // STRING; NOT EMPTY

		//check token is set
		if (!isset($token) || empty($token)) {
			return Response::json(['error' => 'JWT is either not set or null'], 400);
		}

		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true){
				//build array of event details of upcomig events
				$events_array = [];
				//query for events that a user has not created but has been invited to 
				// and is in the future under the definitions specified in the function explanation
				$event_data = DB::table('events_access AS a')
								->select('e.events_id', 'e.events_name', 'e.events_public', 'e.events_desc', 'e.events_status', DB::raw("IFNULL((SELECT s.sessions_end_time FROM events_sessions AS s WHERE s.sessions_events_id=e.events_id AND s.sessions_active=1 ORDER BY s.sessions_end_time DESC LIMIT 1), 0) as 'dates_latest'"), DB::raw("(SELECT GROUP_CONCAT(DISTINCT CONCAT(t.tags_linking_value) SEPARATOR '~') FROM events_tags_linking AS t WHERE t.tags_linking_events_id=a.access_events_id AND t.tags_linking_active=1) as 'tags'"))
								->join('events AS e', 'a.access_events_id', '=', 'e.events_id')
								->where([
									["a.access_user_id", $token_data['user_id']],
									["a.access_active", 1], 
									//["a.access_accepted", 0],
									["e.events_createdby", '!=', $token_data['user_id']],
									["a.access_archived", 0]
								])
								->havingRaw('dates_latest=0 OR dates_latest > '.round(microtime(true) * 1000))
								->get();

				if(!is_null($event_data)){
					foreach($event_data as $event){
						$event_status = "ONGOING";

						$tags = [];
						if(isset($event->tags) && !is_null($event->tags)) {
							$tag_data = explode('~', $event->tags);
							foreach($tag_data AS $tag) {
								$tags[] = $tag;
							}
						}

						// chekc if event has been cancelled
						$cancelled = false;
						if($event->events_status) {
							$cancelled = true;
						}

						// check if event is public or private
						$public = false;
						if($event->events_public == 1) {
							$public = true;
						}

						// build array of event details for upcoming events that user is invited to
						$events_array[] = [
							'events_id' => $event->events_id,
							'events_name' => $event->events_name,
							'events_desc' => $event->events_desc,
							'events_status' => $event_status,
							'events_public' => $public,
							'events_cancelled' => $cancelled,
							'events_tags' => $tags
						];
					}
				}

				return Response::json(['events' => $events_array], 200);
			}

			return Response::json([],400);
		}

		return Response::json([],400);
	}

	/*
		get events that a user has been invited to but did not create that has had a session in the past
	*/
	public function get_invited_events_past(Request $request){
		$token = $request->input('token'); // STRING; NOT EMPTY

		// check if token is set
		if (!isset($token) || empty($token)) {
			return Response::json(['error' => 'JWT is either not set or null'], 400);
		}

		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true){
				// build array of event details of events that the logged in user has been invited to but did not create 
				// and where the event has had a session that has already occured
				$events_array = [];
				//query the database for these events
				$event_data = DB::table('events_access AS a')
								->select('e.events_id', 'e.events_name', 'e.events_public', 'e.events_status', 'e.events_desc', DB::raw("IFNULL((SELECT s.sessions_start_time FROM events_sessions AS s  WHERE s.sessions_events_id=e.events_id AND s.sessions_active=1 ORDER BY s.sessions_start_time ASC LIMIT 1), 2147483647000) as 'dates_earliest'"), DB::raw("(SELECT GROUP_CONCAT(DISTINCT CONCAT(t.tags_linking_value) SEPARATOR '~') FROM events_tags_linking AS t WHERE t.tags_linking_events_id=a.access_events_id AND t.tags_linking_active=1) as 'tags'"))
								->join('events AS e', 'a.access_events_id', '=', 'e.events_id')
								->where([
									["a.access_user_id", $token_data['user_id']],
									["a.access_active", 1], 
									["a.access_archived", 0],
									["e.events_createdby", '!=', $token_data['user_id']]
								])
								->havingRaw('dates_earliest < '.round(microtime(true) * 1000))
								->get();

				if(!is_null($event_data)){
					foreach($event_data as $event){
						$event_status = "PAST";
						$tags = [];
						if(isset($event->tags) && !is_null($event->tags)) {
							$tag_data = explode('~', $event->tags);
							foreach($tag_data AS $tag) {
								$tags[] = $tag;
							}
						}

						// check if event has been cancelled
						$cancelled = false;
						if($event->events_status) {
							$cancelled = true;
						}

						// check if event is public or private
						$public = false;
						if($event->events_public == 1) {
							$public = true;
						}

						//build event details in the array following the restrictons mentioned earlier in the function
						$events_array[] = [
							'events_id' => $event->events_id,
							'events_name' => $event->events_name,
							'events_desc' => $event->events_desc,
							'events_status' => $event_status,
							'events_public' => $public,
							'events_cancelled' => $cancelled,
							'events_tags' => $tags
						];
					}
				}

				return Response::json(['events'=>$events_array],200);
			}

			return Response::json([],400);
		}

		return Response::json([],400);
	}

	/*
		 DO NOT USE: OLD CODE
	*/
	// public function get_upcoming_public_events(Request $request) {
	// 	$token = $request->input('token'); // STRING; NOT EMPTY

	// 	// check token is set
	// 	if (!isset($token) || empty($token)) {
	// 		return Response::json(['error' => 'JWT is either not set or null'], 400);
	// 	}

	// 	if(isset($token) && !empty($token)) {
	// 		$token_data = validate_jwt($token);
	// 		if($token_data == true){
	// 			// build events array with details of public events that have a session that has not ocurred yet
	// 			$events_array = [];
	// 			// query the events that are public, were not created by the logged in user and have a session in the future
	// 			$event_data = DB::table('events AS e')
	// 							->select('e.*', 'a.access_id', DB::raw("IFNULL((SELECT s.sessions_end_time FROM events_sessions AS s WHERE s.sessions_events_id=e.events_id AND s.sessions_active=1 ORDER BY s.sessions_end_time DESC LIMIT 1), 0) as 'dates_latest'"))
	// 							->leftJoin('events_access AS a', function($join) use ($token_data) {
	// 								$join->on('a.access_events_id', '=', 'e.events_id')
	// 									->where([
	// 										["a.access_user_id", $token_data['user_id']],
	// 										["a.access_active", 1]
	// 									]);
	// 							})
	// 							->where ([
	// 								['e.events_active', 1],
	// 								['e.events_createdby','!=',$token_data['user_id']],
	// 								['e.events_public', 1]
	// 							])
	// 							//->havingRaw('a.access_id IS NULL')
	// 							->havingRaw('dates_latest=0 OR dates_latest > '.time())
	// 							->get();

	// 			if(!is_null($event_data)){
	// 				foreach($event_data as $event) {
	// 					// this means that the user is already attending the event
	// 					// so skip the event as we don't want to show events the logged in user is already aware of
	// 					if(isset($event->access_id) && !empty($event->access_id)) {
	// 						continue;
	// 					}

	// 					// check if event is cancelled
	// 					$cancelled = false;
	// 					if($event->events_status) {
	// 						$cancelled = true;
	// 					}

	// 					$event_status = "ONGOING";
	// 					$public = "PUBLIC";

	// 					// build array containing event details
	// 					$events_array[] = [
	// 						'events_id' => $event->events_id,
	// 						'events_name' => $event->events_name,
	// 						'events_desc' => $event->events_desc,
	// 						'events_status' => $event_status,
	// 						'events_public' => $public,
	// 						'events_cancelled' => $cancelled
	// 					];
	// 				}
	// 			}

	// 			return Response::json(['events'=>$events_array],200);
	// 		}

	// 		return Response::json([],400);
	// 	}

	// 	return Response::json([],400);
	// }

	// public function get_events_managed_by_user(Request $request) {
	// 	$token = $request->input('token');
		
	// 	if(isset($token) && !empty($token)) {
	// 		$token_data = validate_jwt($token);
	// 		if($token_data == true) {
	// 			$events_array = [];
	// 			$event_data = DB::table('events AS e')
	// 							->select('e.*', DB::raw("IFNULL((SELECT s.sessions_end_time FROM events_sessions AS s WHERE s.sessions_events_id=e.events_id AND s.sessions_active=1 ORDER BY s.sessions_end_time DESC LIMIT 1), 0) as 'dates_latest'"))
	// 							->where ([
	// 								['e.events_active', 1],
	// 								['e.events_createdby',$token_data['user_id']]
									
	// 							])
	// 							->havingRaw('dates_latest > '.time())
	// 							->get();

	// 			if(!is_null($event_data)) {
	// 				foreach($event_data as $event) {
	// 					$event_status = "ONGOING";
	// 					if($event_status == 1) {
	// 						$event_status = "CANCELLED";
	// 					}

	// 					$public = "PRIVATE";
	// 					if($events_public == 1) {
	// 						$public = "PUBLIC";
	// 					}

	// 					$events_array[] = [
	// 						'events_name' => htmlspecialchars($event->events_name),
	// 						'events_desc' => htmlspecialchars($event->events_status),
	// 						'events_status' => $event_status,
	// 						'events_public' => $public
	// 					];
	// 				}
	// 			}

	// 			return Response::json(['events' => $events_array], 200);
	// 		}
	// 	}
	// 
	// 	return Response::json([], 400);
	// }

	/*
		given an event id, returns the attendees of the event
	*/
	public function get_attendees_of_event(Request $request) {
		$token = $request->input('token'); // STRING; NOT EMPTY
		$event_id = $request->input('event_id'); // INTEGER; NOT EMPTY

		// check parameters are set as necessary
		if(!isset($token) || empty($token)) {
			return Response::json(['error' => 'You need to provide a JWT'], 400);
		}

		if(!isset($event_id) || empty($event_id)) {
			return Response::json([
				'error' => 'You need to provide a value for parameter "event_id"'
			], 400);
		}
		
		$token_data = validate_jwt($token);
		if($token_data == true) {
			//array to store all user info for users that are attending an event
			$return = [];
			
			

			//get all the attendees of an evnet where the event is active and the user has been invited to the event
			$attendees = DB::table('events_access AS a')
							->select('u.users_email', 'u.users_id', 'e.events_public', 'a.access_user_id')
							->join('events AS e', 'a.access_events_id', '=', 'e.events_id')
							->join('users AS u', 'a.access_user_id', '=', 'u.users_id')
							->where([
								['a.access_events_id', $event_id],
								['e.events_active', 1],
								['a.access_active', 1]
							])
							->get();

			if(!is_null($attendees) && count($attendees) > 0) {
				$return_error = true;

				foreach($attendees AS $attendee) {
					//if the event is private, we need to do some extra checking to see if the user is allowed to see it
					if($attendee->events_public == 0) {
						if($attendee->users_id == $token_data['user_id']) {
							$return_error = false;
						}
					} else if($attendee->events_public == 1) {
						$return_error = false;
					}
					// build array of user details
					$return[] = [
						'email' => $attendee->users_email,
						'id' => $attendee->users_id
					];
				}

				if($return_error == true) {
					return Response::json(['error' => 'unauthorised access to private event'], 400);
				}
			}

			// return user details if applicable
			return Response::json(['attendees' => $return], 200);
		} else {
			return Response::json(['error' => 'Your JWT is invalid'], 400);
		}
	}
	
	/*
		function to get simple details including a count of how many events the user has attended in the past week and how many events the user will attend in the next week
	*/
 	public function get_summary_dashboard(Request $request) {
 		$token = $request->input('token');

 		if (!isset($token) || empty($token)) {
 			return Response::json(['error' => 'JWT is either not set or null'], 400);
 		}
		
 		if (isset($token) && !empty($token)) {
 			$token_data = validate_jwt($token);
 			if($token_data == true) {
 				$lastWk_event_number = 0;
				$lastWk_public = 0;
				$lastWk_private = 0;
 				$nextWk_event_number = 0;
				$nextWk_public = 0;
				$nextWk_private = 0;
 				$thisWk_event_number = 0;
				$thisWk_public = 0;
				$thisWk_private = 0;
				
 				//getting last week events
				
				
				$event_data = DB::table('events AS e')
								->select('e.*', DB::raw("IFNULL((SELECT s.sessions_start_time FROM events_sessions AS s  WHERE s.sessions_events_id=e.events_id AND s.sessions_active=1 ORDER BY s.sessions_start ASC LIMIT 1), 2147483647) as 'earliest_date'"), DB::raw("IFNULL((SELECT s.sessions_end_time FROM events_sessions AS s  WHERE s.sessions_events_id=e.events_id AND s.sessions_active=1 ORDER BY s.sessions_start ASC LIMIT 1), 2147483647) as 'latest_date'"))
								->where ([
									['e.events_active', 1],
									['e.events_createdby', $token_data['user_id']]
								])
								->get();
								
				if(!is_null($event_data)) {
					foreach($event_data as $events) {
						// checking last week events
						if(($events->earliest_date > round(microtime(true) * 1000)) - (7 * 24 * 60 * 60 * 1000) && ($events->earliest_date < round(microtime(true) * 1000))) {
							if ($event->events_public == 1) {
								$lastWk_public++;
							} else {
								$lastWk_private++;
							}
							//$lastWk_event_number++;	
							
						}
						
						//checking for next week events
						if(($events->latest_date = 0 OR $events->latest_date > (round(microtime(true) * 1000)) +  (7 * 24 * 60 * 60 * 1000)) && ($events->latest_date OR $events->latest_date > round(microtime(true) * 1000))) {
							//$nextWk_event_number++;
							if ($event->events_public == 1) {
								$nextWk_public++;
							} else {
								$nextWk_private++;
							}
						}
						
						//checking for this week events
						if(($events->latest_date = 0 OR $events->latest_date < (round(microtime(true) * 1000))) && ($events->earliest_date > round(microtime(true) * 1000))) {
							//$thisWk_event_number++;
							if ($event->events_public == 1) {
								$thisWk_public++;
							} else {
								$thisWk_private++;
							}
						}
						
					}
					$lastWk_event_number = $lastWk_private + $lastWk_public;
					$nextWk_event_number = $nextWk_private + $nextWk_public;
					$thisWk_event_number = $thisWk_private + $thisWk_public;
				}
				
				
				
			}
 		}
 	}

	/*
		function to get past events created by the logged in user
	*/
	public function get_past_events(Request $request) {
		$token = $request->input('token'); // STRINg; NOT EMPTY

		// check token is set
		if (!isset($token) || empty($token)) {
			return Response::json(['error' => 'JWT is either not set or null'], 400);
		}
		
		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				// build array of event details of events that have already had a session occur 
				// and was created by the user
				$events_array = [];
				// query for events that were created by the user, not deleted/removed and have had atleast one session in the past
				$event_data = DB::table('events AS e')
								->select('e.*', DB::raw("IFNULL((SELECT s.sessions_start_time FROM events_sessions AS s  WHERE s.sessions_events_id=e.events_id AND s.sessions_active=1 ORDER BY s.sessions_start_time ASC LIMIT 1), 2147483647000) as 'dates_earliest'"), DB::raw("(SELECT GROUP_CONCAT(DISTINCT CONCAT(t.tags_linking_value) SEPARATOR '~') FROM events_tags_linking AS t WHERE t.tags_linking_events_id=e.events_id AND t.tags_linking_active=1) as 'tags'"))
								->where ([
									['e.events_active', 1],
									['e.events_createdby', $token_data['user_id']]
									//['e.events_status', 0]
								])
								->havingRaw('dates_earliest < '.round(microtime(true) * 1000))
								->get();

				if(!is_null($event_data)) {
					foreach($event_data as $event) {
						$event_status = "PAST";
						$tags = [];
						if(isset($event->tags) && !is_null($event->tags)) {
							$tag_data = explode('~', $event->tags);
							foreach($tag_data AS $tag) {
								$tags[] = $tag;
							}
						}

						// if($event_status == 1) {
						// 	$event_status = "CANCELLED";
						// }
						$cancelled = false;
						if($event->events_status) {
							$cancelled = true;
						}

						$public = false;
						if($event->events_public == 1) {
							$public = true;
						}

						$events_array[] = [
							'events_id' => $event->events_id,
							'events_name' => $event->events_name,
							'events_desc' => $event->events_desc,
							'events_status' => $event_status,
							'events_public' => $public,
							'events_cancelled' => $cancelled,
							'events_tags' => $tags
						];
					}
				}

				return Response::json(['events' => $events_array], 200);
			}
		}
		
		return Response::json([], 400);
	}

	/*
		function for "select" in front-end to get tags
	*/
	public function get_tags(Request $request) {
		$token = $request->input('token'); // STRING; NOT EMPTY
		$search_term = $request->input('search_term'); // STRING
		
		// check token is set
		if (!isset($token) || empty($token)) {
			return Response::json(['error' => 'JWT is either not set or null'], 400);
		}

		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				$results = [];

				// grab all the tags from the database
				$tag_data = DB::table('tags')
								->where([
									['tags_active', 1]
								]);

				// filter out tags to what the user is looking for if necessary
				if(isset($search_term) && !is_null($search_term)) {
					$tag_data = $tag_data->where('tags_name', 'like', '%'.$search_term.'%');
				}

				$tag_data = $tag_data->get();

				if(!is_null($tag_data)) {
					foreach($tag_data as $data) {
						// build array containing data about tags
						$results[] = [
							'id' => $data->tags_id,
							'tag' => $data->tags_name
						];
					}
				}

				return Response::json(['results' => $results], 200);
			}
		}
		
		return Response::json([], 400);
	}

	/*
		This function will return a list of users based on the search term provided in the parameter
		'search_term'.
	*/
	public function get_emails_exclude_user(Request $request) {
		$token = $request->input('token'); // STRING; NOT EMPTY
		$search_term = $request->input('search_term'); // STRING; NOT EMPTY

		// check all fields are set as necessary
		if (!isset($token) || empty($token)) {
			return Response::json(['error' => 'JWT is either not set or null'], 400);
		}

		if (!isset($search_term) || is_null($search_term)) {
			return Response::json(['error' => 'Parameter "search_term" is not given'], 400);
		}
		
		$token_data = validate_jwt($token);
		if($token_data == true) {
			$results = [];

			// query the database for users matcihng the search paramter entered
			$user_data = DB::table('users')
							->where([
								['users_active', 1],
								['users_id', '!=', $token_data['user_id']],
								['users_email', 'like', '%'.$search_term.'%']
							])
							->get();

			if(!is_null($user_data)) {
				foreach($user_data as $data) {
					//build array containing user data of user searched for before returning to front-end
					$results[] = [
						'id' => $data->users_id,
						'email' => $data->users_email
					];
				}
			}
			return Response::json(['results' => $results], 200);
		} else {
			return Response::json(['error' => 'Your JWT is invalid!'], 400);
		}
	}

	/*
		function to find public events. Can be given a query to narrow down the search.
	*/
	public function search_public_event(Request $request){
		$token = $request->input('token'); // STRING; NOT EMPTY
		$search_term = $request->input('search_term'); // STRING

		// check token is set as necessary
		if (!isset($token) || empty($token)) {
			return Response::json(['error' => 'JWT is either not set or null'], 400);
		}

		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				// build array contianing event info for public events
				$results = [];

				// query database for events that are public, happening in the future and have not been cancelled or removed
				// exclude events that were created by logged in user
				$event_data = DB::table('events AS e')
								->select('e.*', 'a.access_id', DB::raw("(SELECT count(a.access_user_id) FROM events_access AS a WHERE a.access_events_id=e.events_id) as 'num_attendees'"), DB::raw("IFNULL((SELECT s.sessions_end_time FROM events_sessions AS s WHERE s.sessions_events_id=e.events_id AND s.sessions_active=1 ORDER BY s.sessions_end_time DESC LIMIT 1), 0) as 'dates_latest'"), DB::raw("(SELECT GROUP_CONCAT(DISTINCT CONCAT(t.tags_linking_value) SEPARATOR '~') FROM events_tags_linking AS t WHERE t.tags_linking_events_id=e.events_id AND t.tags_linking_active=1) as 'tags'"))
								->leftJoin('events_access AS a', function($join) use ($token_data) {
									$join->on('a.access_events_id', '=', 'e.events_id')
										->where([
											["a.access_user_id", $token_data['user_id']],
											["a.access_active", 1]
										]);
								})
								->where([
									['e.events_status', 0],
									['e.events_public', 1],
									['e.events_active', 1],
									['e.events_createdby','!=',$token_data['user_id']],
								])
								->orderBy('e.events_createdat', 'desc');
								//->havingRaw('dates_latest > '.time());
								//->havingRaw('a.access_id IS NULL');

				// if a query parameter for the search term has been set, narrow down to events with similar terms
				if(isset($search_term) && !is_null($search_term)) {
					$event_data = $event_data->where('e.events_name', 'like', '%'.$search_term.'%');
				}

				//grab data
				$event_data = $event_data->get();

				if(!is_null($event_data)) {
					foreach($event_data as $data) {
						// this means that the user is already attending the event
						// so skip as they do not need to discover events they are alreayd aware of
						if(isset($data->access_id) && !empty($data->access_id)) {
							continue;
						}

						$tags = [];
						if(isset($data->tags) && !is_null($data->tags)) {
							$tag_data = explode('~', $data->tags);
							foreach($tag_data AS $tag) {
								$tags[] = $tag;
							}
						}

						// calculate number of attendees to the event
						$num_attendees = 0;
						if(isset($data->num_attendees) && !empty($data->num_attendees)) {
							$num_attendees = $data->num_attendees;
						}

						// build array containing details of event before returning it
						$results[] = [
							'events_id' => $data->events_id,
							'events_name' => $data->events_name,
							'events_desc' => $data->events_desc,
							'events_attendees_count' => $num_attendees,
							'events_tags' => $tags
						];
					}
				}

				return Response::json(['results' => $results], 200);
			}
		}
		
		return Response::json([], 400);
	}

	/*
		functoin to load all sessions (start date and end dates) for an event
	*/
	public function load_event_sessions(Request $request) {
		$token = $request->input('token'); // STRING; NOT EMPTY
		$event_id = $request->input('event_id'); // INTEGER

		//check all fields are set as necessary
		if (!isset($token) || empty($token)) {
			return Response::json(['error' => 'JWT is either not set or null'], 400);
		}

		if (!isset($event_id) || empty($event_id)) {
			return Response::json(['error' => 'event id is either not set or null'], 400);
		}
		
		if(isset($token) && !empty($token) && isset($event_id) && !empty($event_id)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				// check that event exists and is valid
				$event_data = DB::table('events AS e')
								->leftJoin('events_access AS a', function($join) use($token_data) {
									$join->on('a.access_events_id', '=', 'e.events_id')
										->where([
											['a.access_active', 1],
											['a.access_user_id', $token_data['user_id']]
										]);
								})
								->where ([
									['e.events_active', 1],
									['e.events_id', $event_id],
									['e.events_status', 0]
								])
								->first();

				if(!is_null($event_data)) {
					if($event_data->events_public == 0) {
						if(!isset($event_data->access_id) || empty($event_data->access_id) || is_null($event_data->access_id)) {
							return Response::json(['error' => 'unauthorised access to private event'], 400);
						}
					}
					// build array of session details for eeents
					$sessions = [];
					// query database for active sessions for an event
					$session_data = DB::table('events_sessions AS s')
										->select('s.sessions_id', 's.sessions_start_time', 's.sessions_end_time', 's.sessions_status', DB::raw("(SELECT GROUP_CONCAT(DISTINCT CONCAT(u.users_fname, '~', u.users_lname, '~', IFNULL(sa.sessions_attendance_going, 0), '~', a.access_id, '~', u.users_email) SEPARATOR '`') FROM events_access a INNER JOIN events_sessions_attendance sa ON sa.sessions_attendance_access_id=a.access_id INNER JOIN users u on u.users_id=a.access_user_id WHERE a.access_events_id=s.sessions_events_id AND a.access_active=1 AND u.users_active=1 AND sa.sessions_attendance_sessions_id=s.sessions_id) as 'attendees'"))
										->where([
											['s.sessions_active', 1],
											['s.sessions_events_id', $event_id]
										])
										->get();

					if(!is_null($session_data)) {
						foreach($session_data as $data) {
							$attendess_arr = [];
							// parse data by brekaing down structure made by group concat
							if(isset($data->attendees) && !empty($data->attendees)) {
								$attendees = explode('`', $data->attendees);

								foreach($attendees AS $attendee) {
									$attendee = explode('~', $attendee);
									//0 is first name
									//1 is last name
									//2 is attendance going
									//3 is access id
									$going = true;
									if(!isset($attendee[2]) || empty($attendee[2])) {
										$going = false;
									}

									$attendess_arr[] = [
										'access_id' => $attendee[3],
										'name' => $attendee[0].' '.$attendee[1],
										'email' => $attendee[4]
									];
								}
							}

							// check if session has been cancelled
							$cancelled = false;
							if($data->sessions_status == 1) {
								$cancelled = true;
							}

							// build data about each session before returning
							$sessions[] = [
								'id' => $data->sessions_id,
								'start_timestamp' => $data->sessions_start_time,
								'end_timestamp' => $data->sessions_end_time,
								'attendees_going' => $attendess_arr,
								'cancelled' => $cancelled
							];
						}
					}

					return Response::json(['sessions' => $sessions], 200);
				} else {
					return Response::json(['error' => 'event does not exist'], 400);
				}
			}
		}
		
		return Response::json([], 400);
	}

	/*
		function that can create a session and attach it to an event
	*/
	public function create_event_sessions(Request $request) {
		$token = $request->input('token'); // STRING; NOT EMPTY
		$event_id = $request->input('event_id'); // INTEGER; NOT EMPTY
		$start_timestamp = $request->input('start_timestamp'); // INTEGER; NOT EMPTY
		$end_timestamp = $request->input('end_timestamp'); // INTEGER; NOT EMPTY
		$recurring = $request->input('recurring'); // INTEGER
		$recurring_descriptor = $request->input('recurring_descriptor'); // STRING "daily" or "weekly" or "monthly" or "yearly" or NULL

		// check all fields are set as necessary
		if (!isset($token) || empty($token)) {
			return Response::json(['error' => 'JWT is either not set or null'], 400);
		}

		if (!isset($event_id) || empty($event_id)) {
			return Response::json(['error' => 'event_id is either not set or null'], 400);
		}

		if (!isset($start_timestamp) || empty($start_timestamp)) {
			return Response::json(['error' => 'start timestamp is either not set or null'], 400);
		}

		if (!isset($end_timestamp) || empty($end_timestamp)) {
			return Response::json(['error' => 'end timestamp is either not set or null'], 400);
		}

		if (!isset($recurring) || empty($recurring)) {
			return Response::json(['error' => 'recurring is either not set or null. Recurring should be atleast 1.'], 400);
		}

		// check the the descriptor given is valid for the date range
		// e.g you can set it to weekly for a date spanning over a week
		$valid_recurring_descriptor = check_valid_time_descriptor($start_timestamp, $end_timestamp, $recurring_descriptor, $recurring);

		// return error if descriptor isn't valid
		if($valid_recurring_descriptor == false) {
			return Response::json(['error' => 'invalid descriptor.'], 400);
		}
		
		$token_data = validate_jwt($token);
		if($token_data == true) {
			// check events exists and is valid, not cancelled nad not set
			$event_data = DB::table('events')
							->where ([
								['events_active', 1],
								['events_id', $event_id],
								['events_createdby', $token_data['user_id']],
								['events_status', 0]
							])
							->first();

			if(!is_null($event_data)) {
				$insert = [];
				// insert first timestamp instance
				$insert[] = [
							'sessions_start_time' => $start_timestamp,
							'sessions_end_time' => $end_timestamp,
							'sessions_active' => 1,
							'sessions_events_id' => $event_id
						];

				$recurring--; // decrement recurring number

				// if recurring is set to greater than one we need additional insertions
				if(!is_null($recurring_descriptor) && $recurring >= 1) {
					while($recurring > 0) {
						// check if recurrence is daily
						if($recurring_descriptor == "daily") {
							$addition = 24*60*60*1000;
							$start_timestamp += $addition;
							$end_timestamp += $addition;
						// or check if recurrence is weekly
						} else if($recurring_descriptor == "weekly") {
							$addition = 7*24*60*60*1000;
							$start_timestamp += $addition;
							$end_timestamp += $addition;
						// or check if recurrence is fortnightly
						} else if($recurring_descriptor == "fortnightly") {
							$addition = 2*7*24*60*60*1000;
							$start_timestamp += $addition;
							$end_timestamp += $addition;
						// or check if recurrence is monthly
						} else if($recurring_descriptor == "monthly") {
							$start_timestamp = strtotime('+1 month', $start_timestamp); 
							$end_timestamp = strtotime('+1 month', $end_timestamp);
						// or check if recurrence is yearly
						} else if($recurring_descriptor == "yearly") {
							$addition = 365*24*60*60*1000;
							$start_timestamp += $addition;
							$end_timestamp += $addition;
						}

						// create new insertion with incremented timestamps
						$insert[] = [
							'sessions_start_time' => $start_timestamp,
							'sessions_end_time' => $end_timestamp,
							'sessions_active' => 1,
							'sessions_events_id' => $event_id
						];

						$recurring--; //decrement recurring number
					}
				}

				// create the session in the database
				$new_session_id = DB::table('events_sessions')
										->insert($insert);

				return Response::json([], 200);
			}

			return Response::json(['error' => 'Event does not exist'], 400);
		}

		return Response::json(['error' => 'Token data is not valid'], 400);
	}

	/*
		edit event sessions
	*/
	public function edit_event_sessions(Request $request) {
		$token = $request->input('token'); // STRING; NOT EMPTY
		$session_id = $request->input('session_id'); // INTEGER; NOT EMPYT
		$event_id = $request->input('event_id'); // INTEGER; NOT EMPTY
		$start_timestamp = $request->input('start_timestamp'); // INTEGER; NOT EMPTY
		$end_timestamp = $request->input('end_timestamp'); // INTEGER; NOTY EMPTY

		// check all fields are set as necessary
		if (!isset($token) || empty($token)) {
			return Response::json(['error' => 'JWT is either not set or null'], 400);
		}

		if (!isset($event_id) || empty($event_id)) {
			return Response::json(['error' => 'Parameter "event_id" is not set'], 400);
		}

		if (!isset($session_id) || empty($session_id)) {
			return Response::json(['error' => 'Parameter "session_id" is not set'], 400);
		}

		if (!isset($start_timestamp) || empty($start_timestamp)) {
			return Response::json(['error' => 'Parameter "start_timestamp" is not set'], 400);
		}

		if (!isset($end_timestamp) || empty($end_timestamp)) {
			return Response::json(['error' => 'Parameter "end_timestamp" is not set'], 400);
		}
		
		$token_data = validate_jwt($token);
		if($token_data == true) {
			// check event is valid, active and not cancelled
			$event_data = DB::table('events')
							->where ([
								['events_active', 1],
								['events_id', $event_id],
								['events_createdby', $token_data['user_id']],
								['events_status', 0]
							])
							->first();

			if(!is_null($event_data)) {
				DB::table('events_sessions')
					->where([
						['sessions_events_id', $event_id],
						['sessions_id', $session_id]
					])
					->update([
						'sessions_start_time' => $start_timestamp,
						'sessions_end_time' => $end_timestamp
					]);

				return Response::json([], 200);
			}
			
			return Response::json(['error' => 'Could not find the event!'], 400);
		}
		
		return Response::json(['error' => 'Your JWT is invalid!'], 400);
	}

	/*
		given a session id, removes that session from the event. Used to remove errors completely from an event.
	*/
	public function remove_event_sessions(Request $request) {
		$token = $request->input('token'); // STRING; NOT EMPTY
		$session_id = $request->input('session_id'); // INTEGER; NOT EMPTY
		$event_id = $request->input('event_id'); // INTEGER; NOT EMPTY

		// check all parameters are set as necessart
		if (!isset($token) || empty($token)) {
			return Response::json(['error' => 'JWT is either not set or null'], 400);
		}

		if (!isset($session_id) || empty($session_id)) {
			return Response::json(['error' => 'session id is either not set or null'], 400);
		}

		if (!isset($event_id) || empty($event_id)) {
			return Response::json(['error' => 'event id is either not set or null'], 400);
		}
		
		if(isset($token) && !empty($token) && isset($event_id) && !empty($event_id) && isset($session_id) && !empty($session_id)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				// check event exists, is not cancelled and belongs to user
				$event_data = DB::table('events')
								->where ([
									['events_active', 1],
									['events_id', $event_id],
									['events_createdby', $token_data['user_id']],
									['events_status', 0]
								])
								->first();

				if(!is_null($event_data)) {
					// set the session as inactive (e.g "removin it")
					DB::table('events_sessions')
						->where([
							['sessions_events_id', $event_id],
							['sessions_id', $session_id]
						])
						->update(['sessions_active' => 0]);

					return Response::json([], 200);
				} else {
					return Response::json(['error' => 'event does not exist'], 400);
				}
			}
		}
		
		return Response::json([], 400);
	}

	/*
		cancel an event session; is different from remove as the session will still show in the event but in a cancelled status.
	*/
	public function cancel_event_sessions(Request $request){
		$token = $request->input('token'); // STRING; NOT EMPTY
		$session_id = $request->input('session_id'); // INTEGER; NOT EMPTY
		$events_id = $request->input('event_id'); // INTEGER; NOT EMPTY

		// check all fields are set as necessary
		if (!isset($token) || empty($token)) {
			return Response::json(['error' => 'JWT is either not set or null'], 400);
		}

		if (!isset($session_id) || empty($session_id)) {
			return Response::json(['error' => 'session id is either not set or null'], 400);
		}

		if (!isset($events_id) || empty($events_id)) {
			return Response::json(['error' => 'event id is either not set or null'], 400);
		}
			
		if(isset($token) && !empty($token) && isset($session_id) && !empty($session_id)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				// grab event and check it belongs to the user, is not cancelled and is still active
				$event = DB::table('events')
							->select('events_createdby', 'events_status')
							->where([
								['events_active', 1],
								['events_id', $events_id],
								['events_createdby', $token_data['user_id']],
								['events_status', 0]
							])
							->get();

				if(!is_null($event)){
					// check session exists, has not been cancelled and belongs to event before removing it
					$session_exists = DB::table('events_sessions')
										->where([
											['sessions_events_id', $events_id],
											['sessions_id', $session_id],
											['sessions_status', 0]
										])
										->first();

					if(!is_null($session_exists)) {
						// set session as cancelled in the database
						DB::table('events_sessions')
							->where([
								['sessions_id', $session_id]
							])
							->update(['sessions_status' => 1]);

						return Response::json([],200);
					}
				}
			} else {
				return Response::json(['error' => 'event does not exist or belong to user'], 400);
			}
		}
			
		return Response::json([], 400);
	}

	/*
		cancel an event session; is different from remove as the session will still show in the event but in a cancelled status.
	*/
	public function uncancel_event_sessions(Request $request){
		$token = $request->input('token'); // STRING; NOT EMPTY
		$session_id = $request->input('session_id'); // INTEGER; NOT EMPTY
		$events_id = $request->input('event_id'); // INTEGER; NOT EMPTY

		// check all fields are set as necessary
		if (!isset($token) || empty($token)) {
			return Response::json(['error' => 'JWT is either not set or null'], 400);
		}

		if (!isset($session_id) || empty($session_id)) {
			return Response::json(['error' => 'session id is either not set or null'], 400);
		}

		if (!isset($events_id) || empty($events_id)) {
			return Response::json(['error' => 'event id is either not set or null'], 400);
		}
			
		if(isset($token) && !empty($token) && isset($session_id) && !empty($session_id)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				// grab event and check it belongs to the user, is not cancelled and is still active
				$event = DB::table('events')
							->select('events_createdby', 'events_status')
							->where([
								['events_active', 1],
								['events_id', $events_id],
								['events_createdby', $token_data['user_id']],
								['events_status', 0]
							])
							->get();

				if(!is_null($event)){
					// check session exists, has not been cancelled and belongs to event before removing it
					$session_exists = DB::table('events_sessions')
										->where([
											['sessions_events_id', $events_id],
											['sessions_id', $session_id],
											['sessions_status', 1]
										])
										->first();

					if(!is_null($session_exists)) {
						// set session as cancelled in the database
						DB::table('events_sessions')
							->where([
								['sessions_id', $session_id]
							])
							->update(['sessions_status' => 0]);

						return Response::json([],200);
					}
				}
			} else {
				return Response::json(['error' => 'event does not exist or belong to user'], 400);
			}
		}
			
		return Response::json([], 400);
	}

	public function get_timetable_details(Request $request) {
		$token = $request->input('token');
		$week_start = $request->input('week_start'); // INTEGER NOT NULL (EPOCH IN MILLISECONDS OF START OF WEEK)

		if (!isset($token) || empty($token)) {
			return Response::json(['error' => 'JWT is either not set or null'], 400);
		}

		if (!isset($week_start) || empty($week_start)) {
			return Response::json(['error' => 'Week start is either not set or null'], 400);
		}
		
		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				$timetable_data = [];
				// RETURN THE TIMETABLE DATA FOR THE GIVEN WEEK START AND THE OWNER (USER ID GRABBED FRO TOKEN)
				$existing_data = DB::table('timetables')
								->where([
									['timetables_week_start', '>=', $week_start],
									['timetables_active', 1],
									['timetables_owner', $token_data['user_id']]
								])
								->orderBy('timetables_coordinate_x', 'asc')
								->orderBy('timetables_coordinate_y', 'asc')
								->get();

				if(count($existing_data) > 0) {
					foreach($existing_data as $data) {
						$timetable_data[] = [
							'coordinate_x' => $data->timetables_coordinate_x,
							'coordinate_y' => $data->timetables_coordinate_y,
							'duration' => $data->timetables_duration,
							'label' => $data->timetables_label
						];
					}
				}

				//returns data in a two dimensional array in the format
					//COORDINATE X => INT 0-23
					//COORINDATE Y => INT 0-23
					//DURATION => FLOAT 0-24
					//LABEL => STRING BUT CAN BE NULL
				return Response::json(['timetable_data' => $timetable_data], 200);
			}
		}
		
		return Response::json([], 400);
	}

	/*
		function to remove a timetable block given an id
	*/
	public function remove_timetable_block(Request $request) {
		$token = $request->input('token');
		$timetable_id = $request->input('timetable_id'); // INTEGER NOT NULL 

		if (!isset($token) || empty($token)) {
			return Response::json(['error' => 'JWT is either not set or null'], 400);
		}

		if (!isset($timetable_id) || empty($timetable_id)) {
			return Response::json(['error' => 'Timetable ID is either not set or null'], 400);
		}
		
		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				// remove the timetable block
				DB::table('timetables')
								->where([
									['timetables_active', 1],
									['timetables_owner', $token_data['user_id']],
									['timetables_id', $timetable_id]
								])
								->update(['timetables_active' => 0]);

				return Response::json([], 200);
			}
		}
		
		return Response::json([], 400);
	}

	/*
		function to add a timetable block given data indicated below
	*/
	public function add_timetable_block(Request $request) {
		$token = $request->input('token');
		$coordinate_x = $request->input('coordinate_x'); // INTEGER 0 - 47 NOT NULL
		$coordinate_y = $request->input('coordinate_y'); // INTEGER 0 - 47 NOT NULL
		$week_start = $request->input('week_start'); // INTEGER NOT NULL (EPOCH IN MILLISECONDS OF START OF WEEK)
		$duration = $request->input('duration'); // INTEGER IF NULL WILL BE SET TO 0.5
		$recurring = $request->input('recurring'); // INTEGER MINIMUM 1
		$recurring_descriptor = $request->input('recurring_descriptor'); // STRING CAN BE NULL
		$labelling = $request->input('labelling'); // STRING CAN BE NULL
		$ignore_clashes = $request->input('ignore_clashes');
		$insert = [];

		if($ignore_clashes != true) {
			$ignore_clashes == false;
		}

		if (!isset($token) || empty($token)) {
			return Response::json(['error' => 'JWT is either not set or null'], 400);
		}

		if (!isset($coordinate_x) || is_null($coordinate_x)) {
			return Response::json(['error' => 'Coordinate x is either not set or null'], 400);
		}

		if (!isset($coordinate_y) || is_null($coordinate_y)) {
			return Response::json(['error' => 'Coordinate y is either not set or null'], 400);
		}
		
		if (!isset($week_start) || is_null($week_start)) {
			return Response::json(['error' => 'Week start is either not set or null'], 400);
		}

		if (!isset($duration) || is_null($duration)) {
			$duration = 0.5;
		}

		if (!isset($recurring) || empty($recurring)) {
			return Response::json(['error' => 'recurring is either not set or null. Recurring should be atleast 1.'], 400);
		}

		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				//first check we have a valid duration set. It can not exceed 47
				if($coordinate_y + $duration > 47) {
					return Response::json(['error' => 'Coordinate Y + Duration exceeds the day'], 400);
				}

				//next we want to check if a valid time descriptor is set
				if(!is_null($recurring_descriptor) && $recurring_descriptor != "daily" && $recurring_descriptor
				 != "weekly" && $recurring_descriptor != "fortnightly" && $recurring_descriptor != "monthly") {
					return Response::json(['error' => 'Invalid descriptor passed through'], 400);
				}

				//now we want to check for clashes between the new coordinate and existing coordinates
				$existing_data = DB::table('timetables')
									->where([
										['timetables_week_start', '>=', $week_start],
										['timetables_active', 1],
										['timetables_owner', $token_data['user_id']]
									])
									->get();

				//create an array of all time blocks tha are token
				$taken_counters = [];
				if(count($existing_data) > 0) {
					foreach($existing_data as $data) {
						$local_duration = $data->timetables_duration;
						$local_week_start = $data->timetables_week_start;
						$x = $data->timetables_coordinate_x;
						$y = $data->timetables_coordinate_y;

						while($local_duration > 0) {
							$taken_counters[$local_week_start][$x][] = $y;
							$y += 1;
							$local_duration = $local_duration - 0.5;
						}
					}
				}

				//check for clashes
				if($ignore_clashes == false && timetable_check_clash($taken_counters, $coordinate_x, $coordinate_y, $duration, $week_start)) {
					return Response::json(['error' => 'clash detected!'], 400);
				} else if(!timetable_check_clash($taken_counters, $coordinate_x, $coordinate_y, $duration, $week_start)) {
					// insert first timetable instance
					$insert[] = [
						'timetables_week_start' => $week_start,
						'timetables_coordinate_x' => $coordinate_x,
						'timetables_coordinate_y' => $coordinate_y,
						'timetables_duration' => $duration,
						'timetables_label' => $labelling,
						'timetables_active' => 1,
						'timetables_owner' => $token_data['user_id']
					];
				}

				

				$recurring--; // decrement recurring number

				// if recurring is set to greater than one we need additional insertions
				$one_week = 7*24*60*60*1000;
				if(!is_null($recurring_descriptor) && $recurring >= 1) {
					while($recurring > 0) {
						// check if recurrence is daily
						if($recurring_descriptor == "daily") {
							$coordinate_x++;
							if($coordinate_x > 6) {
								$coordinate_x = 0;
								$week_start += $one_week;
							}
						// or check if recurrence is weekly
						} else if($recurring_descriptor == "weekly") {
							$week_start += $one_week;
						// or check if recurrence is fortnightly
						} else if($recurring_descriptor == "fortnightly") {
							$week_start += $one_week*2;
						// or check if recurrence is monthly
						} else if($recurring_descriptor == "monthly") {
							$time_to_add = $one_week*4;
						}

						$recurring--; //decrement recurring number

						if($ignore_clashes == false && timetable_check_clash($taken_counters, $coordinate_x, $coordinate_y, $duration, $week_start)) {
							return Response::json(['error' => 'clash detected!'], 400);
						} else if($ignore_clashes == true && timetable_check_clash($taken_counters, $coordinate_x, $coordinate_y, $duration, $week_start)) {
							continue;
						}

						// create new insertion with incremented timestamps
						$insert[] = [
							'timetables_week_start' => $week_start,
							'timetables_coordinate_x' => $coordinate_x,
							'timetables_coordinate_y' => $coordinate_y,
							'timetables_duration' => $duration,
							'timetables_label' => $labelling,
							'timetables_active' => 1,
							'timetables_owner' => $token_data['user_id']
						];
					}
				}

				// create the session in the database
				$new_session_id = DB::table('timetables')
										->insert($insert);

				//$coordinate_x
				//$coordinate_y
				//$week_start
				//$duration
				//$recurring
				//$recurring_descriptor
				//$labelling

				return Response::json([], 200);
			}
		}
		
		return Response::json([], 400);
	}

	/*
		IGNORE THIS FOR NOW
	*/
	public function save_timetable_details(Request $request) {
		$token = $request->input('token');
		$week_start = $request->input('week_start'); // INTEGER NOT NULL (EPOCH IN MILLISECONDS OF START OF WEEK)
		$timetable_data = $request->input('timetable_data');
		//ASSUMES TIMETABLE DATA IS AN ASSOCIATE TWO DIMENSIONAL ARRAY IN THE FORMAT:
			//"coordinate_x" => int NOT NULL
			//"coordinate_y" => int NOT NULL
			//"duration" => FLOAT 0-24
			//"recurring" => integer (IF NULL THEN DEFAULTS TO 1 CYCLE)
			//"labelling" => string NULLABLE

		if (!isset($token) || empty($token)) {
			return Response::json(['error' => 'JWT is either not set or null'], 400);
		}

		if (!isset($week_start) || empty($week_start)) {
			return Response::json(['error' => 'Week start is either not set or null'], 400);
		}
		
		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				$one_week = 7*24*60*60*1000;

				//sorting through newly passed through data
				$max_recurrence = 1;
				$new_coordinates = [];
				$recurring_coordinates = [];
				$all_data_indexed_by_coordinate = [];
				if(!is_null($timetable_data)) {
					foreach($imetable_data as $data) {
						// if($data["coordinate_y"] + duration > 24) {
						// 	return Response::json(['error' => 'Coordinate + Duration exceeds the day'], 400);
						// }

						if(is_numeric($data["recurring"]) && $data["recurring"] > $max_recurrence) {
							$max_recurrence = (int)$data["recurring"];
						}

						if(!is_numeric($data['recurring']) && $data['recurring'] > 1) {
							$recurring_coordinates[] = $data;
						}

						$coordinate = $data["coordinate_x"].",".$data["coordinate_y"];
						$new_coordinates[] = $coordinate;
						$all_data_indexed_by_coordinate[$coordinate] = $data;
					}
				}

				// grab existing data in the database
				$existing_data = DB::table('timetables')
									->where([
										['timetables_week_start', '>=', $week_start],
										['timetables_active', 1],
										['timetables_owner', $token_data['user_id']]
									])
									->get();

				$existing_coordinates_this_week = [];
				$existing_coordinates_other_week = [];
				$existing_coordinate_to_id_mapping = [];
				if(count($existing_data) > 0) {
					foreach($existing_data as $data) {
						$x = $data->timetables_coordinate_x;
						$y = $data->timetables_coordinate_y;
						$coordinate = $x.",".$y;

						if($data->timetables_week_start == $week_start) {
							$existing_coordinates_this_week[] = $coordinate;
						} else {
							$existing_coordinates_other_week[$data->timetables_week_start][] = $coordinate;
						}

						$existing_coordinate_to_id_mapping[$coordinate] = $data->timetables_id;
					}
				}

				$insert = [];
				// figure out which coordinates are new to add for the current week
				$new_coordinates = array_diff($new_coordinates, $existing_coordinates_this_week);

				if(count($new_coordinates) > 0) {
					foreach($new_coordinates AS $new_coordinate) {
						$local_data = $all_data_indexed_by_coordinate[$new_coordinate];

						$insert[] = [
							'timetables_week_start' => $week_start,
							'timetables_coordinate_x' => $local_data["coordinate_x"],
							'timetables_coordinate_y' => $local_data["coordinate_y"],
							'timetables_duration' => $local_data["duration"],
							'timetables_label' => $local_data["label"],
							'timetables_active' => 1,
							'timetables_owner' => $token_data['user_id']
						];
					}
				}

				// figure out which coordinates to remove
				$old_coordinates = array_diff($existing_coordinates_this_week, $new_coordinates);

				// check recurring coordinates and see if we need to abort due to a clash with a future coordinate
				// figure out which coordinates to add for future weeks
				// try to add them, if clash detected abort transaction
				if(count($recurring_coordinates) > 0) {
					foreach($recurring_coordinates as $recurring_coordinate) {
						$beginning = $week_start;
						$recurring = $recurring_coordinate["recurring"] - 1; //subtract one since we already do the first insert above
						while($recurring > 0) {
							$recurring_week_start += $one_week;

							//TODO: CLAIRE: CHECK FOR CLASHES

							//"coordinate_x" => int NOT NULL
							//"coordinate_y" => int NOT NULL
							//"duration" => FLOAT 0-24
							//"recurring" => integer (IF NULL THEN DEFAULTS TO 1 CYCLE)
							//"labelling" => string NULLABLE

							$insert[] = [
								'timetables_week_start' => $recurring_week_start,
								'timetables_coordinate_x' => $recurring_coordinate["coordinate_x"],
								'timetables_coordinate_y' => $recurring_coordinate["coordinate_y"],
								'timetables_duration' => $recurring_coordinate["duration"],
								'timetables_label' => $recurring_coordinate["label"],
								'timetables_active' => 1,
								'timetables_owner' => $token_data['user_id']
							];

							$recurring--;
						}
					}
				}

				// actually remove old coordinates
				if(count($old_coordinates) > 0) {
					$to_remove_array = [];

					foreach($old_coordinate AS $old_coordinate) {
						$to_remove_array[] = $existing_coordinate_to_id_mapping[$old_coordinate];
					}

					DB::table('timetables')
						->where([
							['timetables_owner', $token_data['user_id']],
							['timetables_active', 1]
						])
						->whereIn('timetables_id', $to_remove_array)
						->update(['timetables_active' => 0]);
				}

				//insert new coordinates
				if(count($insert) > 0) {
					DB::table('timetables')
						->insert($insert);
				}

				// success
				return Response::json([], 200);
			}
		}
		
		return Response::json(['error' => 'invalid or expired JWT token'], 400);
	}

	public function timetable_privacy(Request $request){
		$token = $request->input('token');
		$user_ids = $request->input('user_ids');
		if (!isset($token) || empty($token)) {
			return Response::json(['error' => 'JWT is either not set or null'], 400);
		}
		
		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				$viewer = DB::table('timetable_show')
					->where([['timetable_show_owner', $token_data['user_id']],['timetable_show_active', 1]])
					->pluck('timetable_show_viewer')->toArray();	
					//remove id from show
				foreach(array_diff($viewer, $user_ids) as $remove){

						DB::table('timetable_show')
						->where([['timetable_show_owner', $token_data['user_id']],
							['timetable_show_viewer', $remove]])
						->update(['timetable_show_active', 0]);

				}
				//add id to show
				foreach(array_diff($user_ids, $viewer) as $add){
					if(is_int($add)){
						$update = DB::table('timetable_show')
						->where([['timetable_show_owner', $token_data['user_id']],
								['timetable_show_viewer', $add]])
						->first();
						if(isset($update) && !empty($update)){
							DB::table('timetable_show')
							->where([['timetable_show_owner', $token_data['user_id']],
								['timetable_show_viewer', $add]])
							->update(['timetable_show_active', 1]);
						}else{
							DB::table('timetable_show')
							->insert(['timetable_show_owner' => $token_data['user_id'],
								'timetable_show_viewer' => $add,
								'timetable_show_active' => 1
								]);
						}
					}
				}

			}
			return Response::json([], 200);
		}
		
		return Response::json([], 400);
	}
}
