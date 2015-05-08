#pragma strict

class Level {
   var id : int = -1;
   var optimal : int = -1;
   var seed : int = -1;
   var size : int = -1;
   var numColors : int = -1;
   var packTitle : String;

   function Level(id : int, seedOffset : int, packTitle : String) {
      this.id = id;
      this.seed = id+seedOffset;
      this.packTitle = packTitle;
   }

   function GetBestStars() {
      return ScoreController.GetBestStars(this);
   }

   function GetTitle() {
      return packTitle + " #" + id;
   }
}