#pragma strict

class Level {
   var id : int;
   var optimal : int;
   var best : int;
   var seed : int;

   function Level(id : int) {
      this.id = id;

      //TODO, read these.
      this.seed = id;
      this.optimal = 20;
      this.best = 25;
   }

}