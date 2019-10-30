<?php

use Firebase\JWT\JWT;
use Postmark\PostmarkClient;

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
        $attributes = DB::table('events_attributes')   
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

if (!function_exists('send_generic_email')) {
    //e.g you have been added to an event, click here to view it!
    function send_generic_email($email, $email_subject, $to_name, $text_block, $button_url, $button_name) {
        $client = new PostmarkClient(env('POSTMARKCLIENT_KEY', ''));
        $sendResult = $client->sendEmailWithTemplate(
            "admin@go-meet.org",
            $email,
            14480530,
            [
                "to_name" => $to_name,
                "text_block" => $text_block,
                "button_url" => env('APP_URL', 'http://localhost:3000').$button_url,
                "button_name" => $button_name,
                "email_subject" => $email_subject
            ]
        );
    }
}

if (!function_exists('send_generic_email')) {
    //e.g you have been removed from the event blah by Claire. Sorry!
    function send_buttonless_email($email, $email_subject, $to_name, $text_block) {
        $client = new PostmarkClient(env('POSTMARKCLIENT_KEY', ''));
        $sendResult = $client->sendEmailWithTemplate(
            "admin@go-meet.org",
            $email,
            14480864,
            [
                "to_name" => $to_name,
                "text_block" => $text_block,
                "email_subject" => $email_subject
            ]
        );
    }
}

