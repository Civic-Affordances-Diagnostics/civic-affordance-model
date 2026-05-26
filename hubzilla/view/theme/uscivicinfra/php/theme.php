<?php
/**
 * Name: USCIVICINFRA
 * Description: Civic Infrastructure theme for Hubzilla, derived from redbasic.
 * Version: 0.1.0
 * MinVersion: 11.0
 * MaxVersion: 12.0
 * Author: Civic Affordances Diagnostics
 * Maintainer: TheRON <webmaster@kane-il.us>
 * Extends: redbasic
 * Theme_Color: rgb(247,245,239)
 * Background_Color: rgb(250,249,246)
 */

function uscivicinfra_init(&$a) {
	if (class_exists('App')) {
		App::$theme_info['extends'] = 'redbasic';
	}
}
