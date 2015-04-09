#pragma strict

class LevelPack {
   var title : String;
   var count : int;
   var description : String;

   // Constructor
   function LevelPack(title : String, description : String, count : int) {
      this.title = title;
      this.description = description;
      this.count = count;
   }
}