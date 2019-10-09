<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;
use Response;

class eventAjaxController extends Controller
{
	public function test() {

		return Response::json([
			'title' => 'Nice',
        	'body' => 'Hello World!'
		], 200);
	}
}
