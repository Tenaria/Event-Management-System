<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;
use Response;

class eventAjaxController extends Controller
{
	public function test (Request $request) {
    $name = $request->input('name');
    error_log($name);
    return response()->http_response_code(200);
  }
}
