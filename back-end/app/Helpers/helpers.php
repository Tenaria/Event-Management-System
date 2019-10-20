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

