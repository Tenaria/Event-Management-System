<?php

use Firebase\JWT\JWT;

if (!function_exists('validate_jwt')) {
    function validate_jwt($token=null) {
        if(isset($token) && !empty($token) && !is_null($token)) {
            $decoded = JWT::decode($token, env('JWT_KEY'), ['HS256']);
            $decoded = (array) $decoded;

            if($decoded['expiration'] > time()) {
                return $decoded;
            }
        }

        return false;
    }
}

if (!function_exists('proper_empty_check')) {
    function proper_empty_check($string="") {
        return (str_replace(' ', '', $string) != '');
    }
}

if (!function_exists('get_event_attributes_pk')) {
    function get_event_attributes_pk() {
        $attributes_array = [];
        $attributes = DB::table('event_attributes')   
                        ->select('events_attributes_id', 'events_attributes_name')
                        ->get();

        foreach($attributes as $attribute) {
            $name = $attribute->events_attributes_name;
            $primary_key = $attribute->events_attributes_id;
            
            $attributes_array[$name] = $primary_key;
        }

        return $attributes_array;
    }
}

