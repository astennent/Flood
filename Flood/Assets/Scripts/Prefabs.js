﻿#pragma strict


class Prefabs extends MonoBehaviour {

   static var s_instance : Prefabs;
   public var tilePrefab : TileObject;

	function Start () {
	  s_instance = this;
	}
	
	public static function getTilePrefab() {
      return s_instance.tilePrefab;
   }
}
