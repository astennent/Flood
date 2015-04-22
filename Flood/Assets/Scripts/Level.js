#pragma strict

class Level {
   var id : int = -1;
   var optimal : int = -1;
   var seed : int = -1;
   var size : int = -1;
   var numColors : int = -1;

   function Level(id : int) {
      this.id = id;
      this.seed = id;
   }

   function Level(id : int, size : int, numColors : int, optimal : int) {
      this.id = id;
      this.seed = id;
      this.size = size;
      this.numColors = numColors;
      this.optimal = optimal;
   }

}