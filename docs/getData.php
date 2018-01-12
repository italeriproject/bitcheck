<?php
header('content-type: application/json; charset=utf-8');
switch($_GET['type']){
	case 'quoine_chart':
		echo file_get_contents('https://api.quoine.com/products/5');
		break;
	default:
		break;
}
