#pragma strict

var levelPackContent : Transform;
var levelPackButtonPrefab : GameObject;

var selectedPackContent : Transform;
var levelButtonPrefab : GameObject;


private var m_levelPacks = new List.<LevelPack>();
private var m_selectedPack : LevelPack;
private var m_selectedLevel : Level;

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

function SelectLevelPack(levelPack : LevelPack) {
   m_selectedPack = levelPack;
   Debug.Log(m_selectedPack.title);

   var scrollingTransform = selectedPackContent.GetComponent.<RectTransform>();
   var tilesPerRow = 5;
   var tileSize = scrollingTransform.rect.width/tilesPerRow;

   for (var level in m_selectedPack.levels) {
      var buttonInstance = GameObject.Instantiate(levelButtonPrefab).GetComponent.<LevelButton>();

      buttonInstance.transform.SetParent(selectedPackContent);

      var rectTransform = buttonInstance.GetComponent.<RectTransform>();
      var yOffset =  ( (level.id-1) / tilesPerRow + 1) * -tileSize;
      var xOffset = ( (level.id - 1 + tilesPerRow) % tilesPerRow) * tileSize;
      rectTransform.anchoredPosition = new Vector3(xOffset, yOffset, 0);

      buttonInstance.id.text = ""+level.id;
      buttonInstance.level = level;
   }

   scrollingTransform.sizeDelta = new Vector2(scrollingTransform.rect.width, (m_selectedPack.levels.Count / tilesPerRow * tileSize));
}

function SelectLevel(level : Level) {
   m_selectedLevel = level;
}