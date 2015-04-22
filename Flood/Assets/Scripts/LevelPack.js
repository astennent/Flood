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

   function SetSize(size : int) {
      for (var level in levels) {
         level.size = size;
      }
      return this;
   }

   function SetNumColors(numColors : int) {
      return SetNumColors([numColors]);
   }

   function SetNumColors(numColorsArray : int[]) {
      for (var index = 0 ; index < levels.length ; ++index) {
         var numColorsIndex = index * numColorsArray.length / levels.length;
         levels[index].numColors = numColorsArray[numColorsIndex];
      }
      return this;
   }

   function GetLevel(index : int) {
      if (index >= levels.length) {
         return null;
      }
      return levels[index];
   }
}

