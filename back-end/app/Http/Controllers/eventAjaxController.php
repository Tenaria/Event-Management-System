<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;
use Response;
use Firebase\JWT\JWT;

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

	        if(!is_null($check)) {
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
	                    ->select('users_id', 'users_password')
	                    ->where([
	                    	['users_email', $email],
	                    	['users_active', 1]
	                    ])
	                    ->first();

	        if (!is_null($user) && !is_null($password) && Hash::check($password, $user_data->users_password)) {
	        	$key = env('JWT_KEY');

	        	$timestamp = strtotime('+3 days', $timestamp);

	        	$token = [
	        		'user_id' => $user->users_id,
	        		'expiration' => $timestamp,
	        		'email' => $users->users_email,
	        		'name' => $users->users_fname." ".$users->users_lname
	        	];

	        	$jwt = JWT::encode($token, $key);

	        	return Response::json([
	        		'token' => $token
	        	], 200);
	        }
        }

        return Response::json([], 401);
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

		return Response::json([], 401);
	}

	public function test (Request $request) {
    $name = $request->input('name');
    error_log($name);

    return Response::json([], 200);
  }
}
