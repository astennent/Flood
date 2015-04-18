#pragma strict

class LevelPack {
   var title : String;
   var count : int;
   var description : String;

   var levels : Level[];

   // Constructor
   function LevelPack(title : String, description : String, levels : Level[]) {
      this.title = title;
      this.description = description;
      this.levels = levels;
      this.count = levels.length; 
   }

   function LevelPack(title : String, description : String, count : int) {
      this.title = title;
      this.description = description;
      this.levels = new Level[count];
      this.count = levels.length;

      for (var i = 1 ; i <= count ; ++i) {
         this.levels[i-1] = new Level(i);
      }
   }
}

