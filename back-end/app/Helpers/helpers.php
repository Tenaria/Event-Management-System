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
                "email_subject" => $email_subject,
                "product_name" => "GoMeet",
                "company_name" => "GoMeet",
                "company_address" => "Block G13, UNSW"
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
                "email_subject" => $email_subject,
                "product_name" => "GoMeet",
                "company_name" => "GoMeet",
                "company_address" => "Block G13, UNSW"
            ]
        );
    }
}

if (!function_exists('timetable_check_clash')) {
    // helper function to check if there is a clash
    function timetable_check_clash($taken_dates_array, $given_date_x, $given_date_y, $given_date_duration, $given_date_week) {
        $clash_detected = false;

        while($given_date_duration > 0) {
            $given_date_y += 1;

            if(isset($taken_dates_array[$given_date_week][$given_date_x]) && in_array($given_date_y, $taken_dates_array[$given_date_week][$given_date_x])) {
                $clash_detected = true;
            }

            $given_date_duration -= 0.5;
        }

        return $clash_detected;
    }
}

if (!function_exists('check_valid_time_descriptor')) {
    //returns false if something went wrong, otherwise whether the given timestamps can recurr "weekly", "monthly" or "yearly"
    function check_valid_time_descriptor($start_timestamp, $end_timestamp, $descriptor, $recurrence) {
        $difference = $end_timestamp-$start_timestamp;

        //recurrence to happen daily
        if($descriptor == "daily") {
            //24 hours in a day, 60 minutes, 60 seconds
            $daily = 24*60*60*1000;

            if($difference >= $daily) {
                return false;
            }
        //recurrence to happen weekly
        } else if($descriptor == "weekly") {
            //7 days in a week, same as above
            $weekly = 7*24*60*60*1000;

            if($difference >= $weekly) {
                return false;
            }
        } else if($descriptor == "fortnightly") {
            //2 weeks in a fornight, 7 days in a week, same as above
            $fortnightly = 2*7*24*60*60*1000;

            if($difference >= $fortnightly) {
                return false;
            }
        //recurrence to happen monthly
        } else if($descriptor == "month") {
            //check both timestamps return the same month in the same year, otherwise can't do a monthly timestamp
            $start_month = date('Y-m', $start_timestamp);
            $end_month = date('Y-m', $end_timestamp);

            if($start_month != $end_month) {
               return false;
            }
        //recurrence to happen yearly
        } else if($descriptor == "yearly") {
            $yearly = 365*24*60*60*1000;

            if($difference >= $yearly) {
                return false;
            }
        //recurrence to happen some other invalid way
        } else if(is_null($descriptor) && $recurrence > 1) {
            return false;
        } else if(!is_null($descriptor)) {
            return false;
        }

        return true;
    }
}

