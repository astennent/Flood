#pragma strict

class Level {
   var id : int;
   var optimal : int;
   var best : int;
   var seed : int;

   var size : int;
   var numColors : int;

   function Level(id : int) {
      this.id = id;

      //TODO, read these.
      this.seed = id;
      this.optimal = 20;
      this.best = 25;
      this.size = 9;
      this.numColors = 5;
   }

}