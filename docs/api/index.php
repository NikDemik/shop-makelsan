<?php
include("api_client.php");
$api = new base_api_client(); 

//Ваши авторизационные данные
$api->login="";
$api->pass="";

$cats = $api->get_all_categories();

if (!empty($cats['error_code']))
{
	echo $cats['error_title'];
	exit;
}	
foreach ($cats as $cat)
{
	$fields = $api->get_fields($cat['id']);
	$data = $api->get_goods_by_cat_id($cat['id']);
	echo $cat['name'].":<br>";
	echo "Описание полей:<br>";
	echo "<pre>";
		print_r($fields);
	echo "</pre>";
	echo "Товары:<br>";
	echo "<pre>";
		print_r($data);
	echo "</pre>";
}
		
