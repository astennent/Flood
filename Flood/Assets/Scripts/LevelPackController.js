static var s_levelPacks = new List.<LevelPack>();

function Start() {
   LoadLevelPacks();
}

static function GetLevelPacks() {
   return s_levelPacks;
}

function LoadLevelPacks() {
   // stub. TODO: Use JSON.
   var levelPack1 = new LevelPack("Small Pack", "Free small boards, 9x9", 150);
   var levelPack2 = new LevelPack("Medium Pack", "Free medium boards, 11x11", 150);
   var levelPack3 = new LevelPack("Large Pack", "Free large boards, 15x15", 150);
   var levelPack4 = new LevelPack("Huge Pack", "Free huge boards, 19x19", 150);

   s_levelPacks.Add(levelPack1);
   s_levelPacks.Add(levelPack2);
   s_levelPacks.Add(levelPack3);
   s_levelPacks.Add(levelPack4);
   s_levelPacks.Add(levelPack1);
   s_levelPacks.Add(levelPack2);
   s_levelPacks.Add(levelPack3);
   s_levelPacks.Add(levelPack4);
   
   s_levelPacks.Add(levelPack1);
   s_levelPacks.Add(levelPack2);
   s_levelPacks.Add(levelPack3);
   s_levelPacks.Add(levelPack4);
   s_levelPacks.Add(levelPack1);
   s_levelPacks.Add(levelPack2);
   s_levelPacks.Add(levelPack3);
   s_levelPacks.Add(levelPack4);
}
