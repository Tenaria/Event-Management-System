<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;
use Response;

class eventController extends Controller
{
	public function test() {
		$test = $request->input('test');
		
		$users = DB::table('users')
			->insert([
				'users_fname' => $test
			]);

		//var_dump('hi');
		die(var_dump($users));

		return Response::json([
			'title' => 'Nice',
        	'body' => 'Hello World!'
		], 200);
	}
	
	public function create_account(Request $request) {
		
		$passInput = $request->input('password');
		$test= $request->input('password_confirm'); 
		
		$fnameInput = $request->input('fname');
		$lnameInput = $request->input('lname');
		$token = $request->input('token');
		$token_data = validate_jwt($token);

		error_log($fnameInput);

    	return Response::json([], 200);

		// //make sure password are correct
		// if ($passInput === $test) {
		// 	//success
		// } else {
		// 	//failed
		// 	//send message to the frontend?
		// }
		// if($token_data) {
		// 	$user_data = DB::table()
		// 	->where([
		// 		['users_active', 1],
		// 		['users_id', $token_data['user_id']]
		// 		])
		// 	->first();
			
		// if(!is_null($user_data)) {
		// 	DB::table()
		// 	->where([
		// 		[''],
		// 		['users_id', $token_data['user_id']]
		// 	])
		// 	->update(['users_fname' => $fnameInput],
		// 		['users_lname' => $lnameInput],
		// 		['users_password' => $passInput]
		// 	);
		
		// return the success (with code 200)
		// }

		// return the error (with code 401)
	}
	


		

}
