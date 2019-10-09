<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;

class eventController extends Controller
{
	public function test() {
		
		return Response::json([
			'title' => 'Nice',
        	'body' => 'Hello World!'
		], 200);
	}
}
