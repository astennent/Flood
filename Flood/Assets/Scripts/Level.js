#pragma strict

class Level {
   var id : int = -1;
   var optimal : int = -1;
   var seed : int = -1;
   var size : int = -1;
   var numColors : int = -1;

   function Level(id : int, seedOffset : int) {
      this.id = id;
      this.seed = id+seedOffset;
   }

   function GetStars() {
      
   }
}