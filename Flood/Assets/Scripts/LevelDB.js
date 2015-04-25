class LevelDB {
   
   static var Packs = [
      LevelPack("Brook", "Beginner boards : 3 colors", 140, 0).SetSize([9, 11, 15, 19]).SetNumColors(3),
      LevelPack("Stream", "Easier boards : 4 colors", 140, 500).SetSize([9, 11, 15, 19]).SetNumColors(4),
      LevelPack("River", "Medium Boards : 5 colors", 140, 1000).SetSize([9, 11, 15, 19]).SetNumColors(5),
      LevelPack("Ocean", "Hard Boards : 6 colors", 140, 1500).SetSize([9, 11, 15, 19]).SetNumColors(6),
      LevelPack("Flood", "Extremely hard boards : 7 colors", 140, 2000).SetSize([9, 11, 15, 19]).SetNumColors(7)
   ];


}