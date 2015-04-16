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
}

