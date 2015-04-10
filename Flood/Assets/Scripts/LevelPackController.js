#pragma strict

var levelPackContent : Transform;
var levelPackButtonPrefab : GameObject;

private var m_levelPacks = new List.<LevelPack>();

function Start() {
   LoadLevelPacks();
}

function LoadLevelPacks() {
   // stub. TODO: Use JSON.
   var levelPack1 = new LevelPack("Small Pack", "Free small boards, 9x9", 150);
   var levelPack2 = new LevelPack("Medium Pack", "Free medium boards, 11x11", 150);
   var levelPack3 = new LevelPack("Large Pack", "Free large boards, 15x15", 150);
   var levelPack4 = new LevelPack("Huge Pack", "Free huge boards, 19x19", 150);

   AddToLevelPacks(levelPack1);
   AddToLevelPacks(levelPack2);
   AddToLevelPacks(levelPack3);
   AddToLevelPacks(levelPack4);
   AddToLevelPacks(levelPack1);
   AddToLevelPacks(levelPack2);
}


function AddToLevelPacks(levelPack : LevelPack) {
   var buttonInstance = GameObject.Instantiate(levelPackButtonPrefab).GetComponent.<LevelPackButton>();

   buttonInstance.transform.SetParent(levelPackContent);
   var rectTransform = buttonInstance.GetComponent.<RectTransform>();
   var yOffset =  300 - (m_levelPacks.Count * rectTransform.rect.height);
   rectTransform.anchoredPosition = new Vector3(0, yOffset, 0);

   buttonInstance.title.text = levelPack.title;
   buttonInstance.description.text = levelPack.description;
   buttonInstance.completion.text = "0 / " + levelPack.count;

   buttonInstance.levelPack = levelPack;

   m_levelPacks.Add(levelPack);
}