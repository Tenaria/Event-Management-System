<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;
use Response;
use Firebase\JWT\JWT;

class eventAjaxController extends Controller
{
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
	public function create_account(Request $request){
		$users_fname = $request->input('users_fname');
		$users_lname = $request->input('users_lname');
		$users_email = $request->input('users_email');
		$users_password = $request->input('users_password');
		if(isset($users_fname) && !is_null($users_fname) && 
			isset($users_lname) && !is_null($users_lname) && 
			isset($users_email) && !is_null($users_email) && 
			isset($users_password) && !is_null($users_password)){
			/**check if email exists in DB**/
			if(DB::table('users')->where(['users_email',$users_email])->exists()){
				//TODO: not sure what to return, so I just returned empty and 400
				return Response::json([],400);
			}else{
				DB::table('users')->insert(['users_fname'=>$users_fname,
										'users_lname'=>$users_lname,
										'users_email'=>$users_email,
										'users_password'=>Hash::make($users_password)]);
				return Respnse::json([],200);
			}
		}
		return Response::json([],400);
	}
	public function test (Request $request) {
    $name = $request->input('name');
    error_log($name);

    return Response::json([], 200);
  }
}
