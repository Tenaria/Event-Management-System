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

	public function test (Request $request) {
    $name = $request->input('name');
    error_log($name);

    return Response::json([], 200);
  }
}
