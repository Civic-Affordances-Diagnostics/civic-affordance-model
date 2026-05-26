<?php
/**
 * USCIVICINFRA derived theme CSS entry point.
 *
 * Hubzilla calls this file as the theme stylesheet. Load redbasic first,
 * then append the restrained Civic Infrastructure overrides.
 */

if (!defined('PROJECT_BASE')) {
	define('PROJECT_BASE', dirname(__DIR__, 4));
}

define('USCIVICINFRA_THEME_ROOT', dirname(__DIR__));
define('USCIVICINFRA_THEME_BASE', PROJECT_BASE . '/view/theme');

require_once(USCIVICINFRA_THEME_BASE . '/redbasic/php/style.php');

$uscivicinfra_css = USCIVICINFRA_THEME_ROOT . '/css/style.css';
if (file_exists($uscivicinfra_css)) {
	echo "\n/* USCIVICINFRA overrides */\n";
	echo file_get_contents($uscivicinfra_css);
}
