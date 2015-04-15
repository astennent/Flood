#pragma strict

class LevelPack {
   var title : String;
   var count : int;
   var description : String;

   var levels = new List.<Level>();

   // Constructor
   function LevelPack(title : String, description : String, count : int) {
      this.title = title;
      this.description = description;
      this.count = count;

      for (var id = 1 ; id <= count ; ++id) {
         var level = new Level(id);
         levels.Add(level);
      }
   }
}