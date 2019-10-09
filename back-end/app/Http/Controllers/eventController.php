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


}
