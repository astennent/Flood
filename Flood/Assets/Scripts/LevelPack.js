#pragma strict

class LevelPack {
   var name : String;
   var count : int;
   var description : String;

   // Constructor
   function LevelPack(name : String, description : String, count : int) {
      this.name = name;
      this.description = description;
      this.count = count;
   }
}