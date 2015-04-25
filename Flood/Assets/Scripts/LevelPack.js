#pragma strict

class LevelPack {
   var title : String;
   var count : int;
   var description : String;

   var levels : Level[];

   function LevelPack(title : String, description : String, count : int, seedOffset : int) {
      this.title = title;
      this.description = description;
      this.levels = new Level[count];
      this.count = levels.length;

      for (var i = 1 ; i <= count ; ++i) {
         this.levels[i-1] = new Level(i, seedOffset);
      }
   }

   function SetSize(size : int) {
      return SetSize([size]);
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
   function SetSize(sizes : int[]) {
      for (var index = 0 ; index < levels.length ; ++index) {
         var sizeIndex = index * sizes.length / levels.length;
         levels[index].size = sizes[sizeIndex];
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

