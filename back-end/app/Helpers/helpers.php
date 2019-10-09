<?php

use Firebase\JWT\JWT;

if (!function_exists('validate_jwt')) {
    function validate_jwt($token=null) {
        if(isset($token) && !empty($token) && !is_null($token)) {
            $decoded = JWT::decode($token, env('JWT_KEY'), ['HS256']);
            $decoded = (array) $decoded;

            if($decoded['expiration'] < time()) {
                return $decoded;
            }
        }

        return false;
    }
}