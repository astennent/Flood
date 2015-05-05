#pragma strict


class Prefabs extends MonoBehaviour {

   static var s_instance : Prefabs;
   public var tilePrefab : TileObject;
   public var boardPrefab : GameObject;

	function Start () {
	  s_instance = this;
	}
	
	public static function getTilePrefab() {
      return s_instance.tilePrefab;
   }

   public static function getBoardPrefab() {
      return s_instance.boardPrefab;
   }
}
