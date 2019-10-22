<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;
use Response;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Hash;

class eventAjaxController extends Controller
{
	public function sign_up(Request $request) {
        $fname = $request->input('fname');
        $lname = $request->input('lname');
        $email = $request->input('email');
        $password = $request->input('password');
        $password_confirm = $request->input('password_confirm');

        if(!empty($fname) && !empty($lname) && !empty($email) && !empty($password) && !empty($password_confirm)) {
             $check = DB::table('users')
	                        ->where([
	                            ['users_email', $email],
	                            ['users_active', 1]
	                        ])
	                        ->first();

	        if(is_null($check)) {
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

	public function log_in(Request $request) {
		$email = $request->input('email');
        $password = $request->input('password');

        if(isset($email) && !is_null($email) && isset($password) && !is_null($password)) {
        	$user = DB::table('users')
	                    ->where([
	                    	['users_email', $email],
	                    	['users_active', 1]
	                    ])
	                    ->first();

	        if (!is_null($user) && !is_null($password) && Hash::check($password, $user->users_password)) {
	        	$key = env('JWT_KEY');

	        	$timestamp = strtotime('+3 days', time());

	        	$token = [
	        		'user_id' => $user->users_id,
	        		'expiration' => $timestamp,
	        		'email' => $user->users_email,
	        		'name' => $user->users_fname." ".$user->users_lname
	        	];

	        	$jwt = JWT::encode($token, $key);

	        	return Response::json([
	        		'token' => $jwt
	        	], 200);
	        }
        }

        return Response::json([], 400);
	}

	public function get_account_details(Request $request) {
		$token = $request->input('token');

		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				$user_data = DB::table('users')
								 ->where([
									['users_active', 1],
									['users_id', $token_data['user_id']]
								])
								->first();

				if(!is_null($user_data)) {
					return Response::json([
		        		'users_fname' => $user_data->users_fname,
		        		'users_lname' => $user_data->users_lname,
		        		'users_email' => $user_data->users_email
		        	], 200);
				}
			}
		}

		return Response::json([], 400);
	}

	public function edit_account(Request $request) {
		$fnameInput = $request->input('fname');
		$lnameInput = $request->input('lname');
		$password = $request->input('password');
		$password_confirm= $request->input('password_confirm'); 
		
		$token = $request->input('token');

		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				$user_data = DB::table('users')
								 ->where([
									['users_active', 1],
									['users_id', $token_data['user_id']]
								])
								->first();

				if(!is_null($user_data)) {
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
				}
			}
		}
		return Response::json([], 400);
	}

	// S P R I N T 2 S T A R T //
	public function create_event(Request $request) {
		$token = $request->input('token');
		$event_name = $request->input('event'); //STRING
		$event_desc = $request->input('desc'); //STRING
		$event_location = $request->input('event_location'); //STRING
		$event_attendees = $request->input('event_attendees'); //ASSUME IS PASSED THROUGH AS AN ARRAY OF USER IDS
		$event_public = $request->input('event_public');
		
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

					//INESRT EVENT ATTENDEES IF GIVEN
					if(isset($event_attendees) && !empty($event_attendees)) {
						foreach($event_attendees as $attendee) {
							DB::table('events_access')
								->insert([
									'acces_user_id' => $attendee,
									'access_active' => 1,
									'access_events_id' => $new_event_id
								]);
						}
					}

					return Response::json([], 200);
				}

				return Response::json([], 400);
			}
		}
		
		return Response::json([], 400);
	}

	public function edit_event(Request $request) {
		$token = $request->input('token');
		$event_id = $request->input('event_id');
		$new_event_name = $request->input('event_name');
		$new_event_desc = $request->input('event_desc');
		$new_event_location = $request->input('event_location');
		$new_event_attendees = $request->input('event_attendees');
		$new_event_public = $request->input('event_public');

		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			
			if($token_data == true) {
				$event_data = DB::table('events')
								->where ([
									['events_active', 1],
									['events_createdby',$token_data['users_id']],
									['events_id', $event_id]
								])
								->first();

				if(!is_null($event_data)) {
					$attributes_name_to_id = get_event_attributes_pk();

					if(isset($new_event_name) && !empty($new_event_name)) {
						//update event name, description and whether it is public or private
						DB::table('events')
							->where([
								['events_active', 1],
								['events_createdby',$token_data['users_id']],
								['events_id', $event_id]
							])
							->update([
								'events_name' => $new_event_name,
								'events_public' => $new_event_public,
								'events_desc' => $new_event_desc
							]);

						$event_attributes = DB::table('events_attributes_values')
												->where([
													['attributes_values_events_id', $event_id],
													['attributes_values_active', 1]
												])
												->get();

						$current_attributes_array = [];
						if(!is_null($event_attributes)) {
							foreach($event_attributes as $attribute) {
								$attribute_id = $attribute->attributes_values_attributes_id;
								$attribute_value = $attribute->attributes_values_value;
								$current_attributes_array[$attribute_id] = $attribute_value;
							}
						}

						// INSERT LOCATION IF NOT EXIST
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
						} else if($location !== $current_attributes_array[$location_id]) {
							DB::table('events_attributes_values')
								->where([
									['attributes_values_attributes_id', $location_id],
									['attributes_values_active', 1],
									['attributes_values_events_id', $event_id]
								])
								->update(['attributes_values_value' => $new_event_location]);
						}

						//UPDATE THE ATTENDEES
						if(!isset($new_event_attendees) || empty($new_event_attendees)) {
							$new_event_attendees= [];
						}
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
								if($attendee->events_active == 1) {
									$current_attendees[] = $attendee;
								} else {
									$inactive_attendees[] = $attendee;
								}
							}
						}

						$new_attendees = array_diff($new_event_attendees, $current_attendees);
						$old_attendees = array_diff($current_attendees, $new_event_attendees);

						//REMOVE OLD ATTENDEES
						$attendees = DB::table('events_access')
										->where([
											['access_active', 1],
											['access_events_id', $event_id]
										])
										->whereIn('access_user_id', $old_attendees)
										->update(['access_active' => 0]);

						//ADD IN NEW ATTENDEES
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
								->insert($new_attendees);
						}
						

						return Response::json([], 200);
					}	
				}
				
				Response::json([
	        	'status' => 'Event name required'
				], 400);
			} 
		
		return Response::json([], 400);
		}	
	}

	public function get_event_details(Request $request) {
		$token = $request->input('token');
		$event_id = $request->input('event_id');
		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				$event_data = DB::table('events')
								->where ([
									['events_active', 1],
									['events_id',$token_data['users_id']],
									['events_id', $event_id]
									
								])
								->first();

				if(!is_null($event_data)) {
					$attributes_name_to_id = get_event_attributes_pk();

					$event_attributes = DB::table('events_attributes_values')
												->where([
													['attributes_values_events_id', $event_id],
													['attributes_values_active', 1]
												])
												->get();

					$current_attributes_array = [];
					$id_to_name_array = [];
					if(!empty($attributes_name_to_id)) {
						foreach($attributes_name_to_id as $name => $id) {
							$current_attributes_array[$name] = null;
							$id_to_name_array[$id] = $name;
						}
					}

					if(!is_null($event_attributes)) {
						foreach($event_attributes as $attribute) {
							$attribute_id = $attribute->attributes_values_attributes_id;
							$attribute_value = $attribute->attributes_values_value;

							$attribute_name = $id_to_name_array[$attribute_id];

							$current_attributes_array[$attribute_name] = $attribute_value;
						}
					}

					return Response::json([
		        		'events_name' => $event_data->events_name,
		        		'events_public' => $event_data->events_public,
		        		//'events_createdby' => $event_data->events_createdby,
						'events_createdat' => $event_data->events_createdat,
						'events_desc' => $event_data->events_desc,
						'attributes' => $current_attributes_array
						//attributes['location'] WILL GIVE YOU THE LOCATION
		        	], 200);
				}
				return Response::json([], 400);
			}
		}
		
		return Response::json([], 400);
	}

	public function cancel_event(Request $request) {
		$token = $request->input('token');
		$event_id = $request->input('event_id');
		
		if(isset($token) && !empty($token) && isset($event_id) && !empty($event_id)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				$event_data = DB::table('events')
								->where ([
									['events_active', 1],
									['events_createdby',$token_data['user_id']],
									['events_id', $event_id]
									
								])
								->first();
				if(!is_null($event_data)) {
					DB::table('events')
								->where ([
									['events_active', 1],
									['events_createdby',$token_data['user_id']],
									['events_id', $event_id]
									
								])
								->update(['events_status' => 1]);

					return Response::json([], 200);
				}

				return Response::json([], 400);
			}
		}
		
		return Response::json([], 400);
	}

	public function get_upcoming_events(Request $request) {
		$token = $request->input('token');
		
		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				//TODO: CLAIRE: TEST
				$events_array = [];
				$event_data = DB::table('events AS e')
								->select('e.*', DB::raw("IFNULL((SELECT s.sessions_end_time FROM events_sessions AS s WHERE s.sessions_events_id=e.events_id AND s.sessions_active=1 ORDER BY s.sessions_end_time DESC LIMIT 1), 0) as 'dates_latest'"))
								->where ([
									['e.events_active', 1],
									['e.events_createdby',$token_data['user_id']],
									['e.events_status', 0]
									
								])
								->havingRaw('dates_latest=0 OR dates_latest > '.time())
								->get();

				if(!is_null($event_data)) {
					foreach($event_data as $event) {
						$event_status = "ONGOING";
						// if($event_status == 1) {
						// 	$event_status = "CANCELLED";
						// }

						$public = "PRIVATE";
						if($event->events_public == 1) {
							$public = "PUBLIC";
						}

						$events_array[] = [
							'events_id' => $event->events_id,
							'events_name' => htmlspecialchars($event->events_name),
							'events_desc' => htmlspecialchars($event->events_status),
							'events_status' => $event_status,
							'events_public' => $public
						];
					}
				}

				return Response::json(['events' => $events_array], 200);
			}
		}
		
		return Response::json([], 400);
	}
	public function get_invited_events_upcoming(Request $request){
		$token = $request->input('token');
		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true){
				$events_array = [];
				$event_data = DB::table('events_access AS a')
								->select('e.events_id', 'e.events_name', 'e.events_public', DB::raw("IFNULL((SELECT s.sessions_end_time FROM events_sessions AS s WHERE s.sessions_events_id=e.events_id AND s.sessions_active=1 ORDER BY s.sessions_end_time DESC LIMIT 1), 0) as 'dates_latest'"))
								->join('events AS e', 'a.access_events_id', '=', 'e.events_id')
								->where([
									["a.access_user_id", $token_data['user_id']],
									["a.access_active", 1], 
									["a.access_accepted", 0],
									["e.events_createdby", '!=', $token_data['user_id']]
								])
								->havingRaw('dates_latest=0 OR dates_latest > '.time())
								->get();

				if(!is_null($event_data)){
					foreach($event_data as $event){
						$event_status = "ONGOING";
						// if($event_status == 1) {
						// 	$event_status = "CANCELLED";
						// }

						$public = "PRIVATE";
						if($event->events_public == 1) {
							$public = "PUBLIC";
						}

						$events_array[] = [
							'events_id' => $event->events_id,
							'events_name' => htmlspecialchars($event->events_name),
							'events_desc' => htmlspecialchars($event->events_status),
							'events_status' => $event_status,
							'events_public' => $public
						];
					}
				}
				return Response::json(['events'=>$events_array],200);
			}
			return Response::json([],400);
		}
		return Response::json([],400);
	}

	public function get_invited_events_past(Request $request){
		$token = $request->input('token');
		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true){
				$events_array = [];
				$event_data = DB::table('events_access AS a')
								->select('e.events_id', 'e.events_name', 'e.events_public', DB::raw("IFNULL((SELECT s.sessions_start_time FROM events_sessions AS s  WHERE s.sessions_events_id=e.events_id AND s.sessions_active=1 ORDER BY s.sessions_start ASC LIMIT 1), 2147483647) as 'dates_earliest'"))
								->join('events AS e', 'a.access_events_id', '=', 'e.events_id')
								->where([
									["a.access_user_id", $token_data['user_id']],
									["a.access_active", 1], 
									["a.access_accepted", 0],
									["e.events_createdby", '!=', $token_data['user_id']]
								])
								->havingRaw('dates_earliest > '.time())
								->get();

				if(!is_null($event_data)){
					foreach($event_data as $event){
						$event_status = "PAST";
						// if($event_status == 1) {
						// 	$event_status = "CANCELLED";
						// }

						$public = "PRIVATE";
						if($events_public == 1) {
							$public = "PUBLIC";
						}

						$events_array[] = [
							'events_id' => $event->events_id,
							'events_name' => htmlspecialchars($event->events_name),
							'events_desc' => htmlspecialchars($event->events_status),
							'events_status' => $event_status,
							'events_public' => $public
						];
					}
				}
				return Response::json(['events'=>$events_array],200);
			}
			return Response::json([],400);
		}
		return Response::json([],400);
	}

	public function get_upcoming_public_events(Request $request) {
		$token = $request->input('token');
		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true){
				$events_array = [];
				$event_data = DB::table('events AS e')
								->select('e.*', 'a.access_id', DB::raw("IFNULL((SELECT s.sessions_end_time FROM events_sessions AS s WHERE s.sessions_events_id=e.events_id AND s.sessions_active=1 ORDER BY s.sessions_end_time DESC LIMIT 1), 0) as 'dates_latest'"))
								->leftJoin('events_access AS a', function($join) use ($token_data) {
									$join->on('a.access_events_id', '=', 'e.events_id')
										->where([
											["a.access_user_id", $token_data['user_id']],
											["a.access_active", 1]
										]);
								})
								->where ([
									['e.events_active', 1],
									['e.events_createdby','!=',$token_data['user_id']],
									['e.events_status', 0],
									['e.events_public', 1]
								])
								->havingRaw('a.access_id IS NULL')
								->havingRaw('dates_latest=0 OR dates_latest > '.time())
								->get();

				if(!is_null($event_data)){
					foreach($event_data as $event) {
						//this means that the user is already attending the event
						//so skip
						// if(isset($event->access_id) && !empty($event->access_id)) {
						// 	continue;
						// }

						$event_status = "ONGOING";
						$public = "PUBLIC";

						$events_array[] = [
							'events_id' => $event->events_id,
							'events_name' => htmlspecialchars($event->events_name),
							'events_desc' => htmlspecialchars($event->events_status),
							'events_status' => $event_status,
							'events_public' => $public
						];
					}
				}

				return Response::json(['events'=>$events_array],200);
			}

			return Response::json([],400);
		}

		return Response::json([],400);
	}

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
	// S P R I N T 2 E N D //

	// S P R I N T 3 S T A R T //
	public function get_past_events(Request $request) {
		$token = $request->input('token');
		
		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				//TODO: CLAIRE: TEST
				$events_array = [];
				$event_data = DB::table('events AS e')
								->select('e.*', DB::raw("IFNULL((SELECT s.sessions_start_time FROM events_sessions AS s  WHERE s.sessions_events_id=e.events_id AND s.sessions_active=1 ORDER BY s.sessions_start ASC LIMIT 1), 2147483647) as 'dates_earliest'"))
								->where ([
									['e.events_active', 1],
									['e.events_createdby', $token_data['user_id']],
									['e.events_status', 0]
									
								])
								->havingRaw('dates_earliest > '.time())
								->get();

				if(!is_null($event_data)) {
					foreach($event_data as $event) {
						$event_status = "PAST";
						// if($event_status == 1) {
						// 	$event_status = "CANCELLED";
						// }

						$public = "PRIVATE";
						if($events_public == 1) {
							$public = "PUBLIC";
						}

						$events_array[] = [
							'events_id' => $event->events_id,
							'events_name' => htmlspecialchars($event->events_name),
							'events_desc' => htmlspecialchars($event->events_status),
							'events_status' => $event_status,
							'events_public' => $public
						];
					}
				}

				return Response::json(['events' => $events_array], 200);
			}
		}
		
		return Response::json([], 400);
	}

	//ASSUMES THAT USER PUTS IN ATLEAST ONE
	public function get_emails_exclude_user(Request $request) {
		$token = $request->input('token');
		$search_term = $request->input('search_term');
		
		if(isset($token) && !empty($token) && isset($search_term) && !is_null($search_term)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				$results = [];

				$user_data = DB::table('users')
								->where([
									['users_active', 1],
									['users_id', '!=', $token_data['user_id']],
									['users_email', 'like', '%'.$search_term.'%']
								])
								->get();

				if(!is_null($user_data)) {
					foreach($user_data as $data) {
						$results[] = [
							'id' => $data->users_id,
							'email' => $data->users_email
						];
					}
				}

				return Response::json(['results' => $emails], 200);
			}
		}
		
		return Response::json([], 400);
	}

	public function get_timetable_details(Request $request) {
		$token = $request->input('token');
		
		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				//TODO

				return Response::json([], 400);
			}
		}
		
		return Response::json([], 400);
	}

	public function save_timetable_details(Request $request) {
		$token = $request->input('token');
		
		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				//TODO

				return Response::json([], 400);
			}
		}
		
		return Response::json([], 400);
	}

	public function load_event_sessions(Request $request) {
		$token = $request->input('token');
		
		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				//TODO

				return Response::json([], 400);
			}
		}
		
		return Response::json([], 400);
	}

	public function save_event_sessions(Request $request) {
		$token = $request->input('token');
		
		if(isset($token) && !empty($token)) {
			$token_data = validate_jwt($token);
			if($token_data == true) {
				//TODO

				return Response::json([], 400);
			}
		}
		
		return Response::json([], 400);
	}
	// S P R I N T 3 E N D //


	// public function test (Request $request) {
	// 	$name = $request->input('name');
	// 	error_log($name);

	// 	return Response::json([], 200);
	// }
}
