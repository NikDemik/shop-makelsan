<?php

class base_api_client
{
	public static $login="";
	public static $pass="";
	
	private $api_path = "https://base.sstmk.ru/api/";
	
	private function send_request($params)
	{
		$params['login'] = $this->login;
		$params['pass'] = md5($this->pass);
		$content = http_build_query($params);
		$context = stream_context_create(array(
			'http' => array(
				'method' => 'POST',
				'header' => 'Content-Type: application/x-www-form-urlencoded' . PHP_EOL,
				'content' => $content,
			),
	   	 ));

	    return file_get_contents($this->api_path,false,$context);
	}
	
	public function get_main_categories()
	{
		$params = array(
			"action"=>"get_main_categories",
		);
		
		$result = $this->send_request($params);
		
		if (!empty($result))
			$result = json_decode($result,true);
		else 
			$result = false;
		return $result;
	}
	
	public function get_all_categories()
	{
		$params = array(
			"action"=>"get_all_categories",
		);
		
		$result = $this->send_request($params);
		if (!empty($result))
			$result = json_decode($result,true);
		else 
			$result = false;
		return $result;
	}
	
	public function get_goods_by_cat_id($id)
	{
		$params = array(
			"action"	=>"get_goods_by_cat_id",
			"cat_id"	=>$id
		);
		
		$result = $this->send_request($params);
		if (!empty($result))
			$result = json_decode($result,true);
		else 
			$result = false;
		return $result;
	}
	
	public function get_fields($id)
	{
		$params = array(
			"action"	=>"get_fields",
			"cat_id"	=>$id
		);
		
		$result = $this->send_request($params);
		if (!empty($result))
			$result = json_decode($result,true);
		else 
			$result = false;
		return $result;
	}
}

