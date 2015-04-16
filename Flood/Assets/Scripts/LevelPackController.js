#pragma strict

var levelPackContent : Transform;
var levelPackButtonPrefab : GameObject;

var selectedPackContent : Transform;
var levelButtonPrefab : GameObject;

var levelPackTitle : UnityEngine.UI.Text;

var canvas : Canvas;

private var m_selectedPack : LevelPack;

function Start() {
   LoadLevelPacks();
}

function LoadLevelPacks() {

   for (var levelPack in LevelDB.Packs) {
      LoadPack(levelPack);
   }

}


function LoadPack(levelPack : LevelPack) {
   var buttonInstance = GameObject.Instantiate(levelPackButtonPrefab).GetComponent.<LevelPackButton>();

   buttonInstance.transform.SetParent(levelPackContent);
   
   var rectTransform = buttonInstance.GetComponent.<RectTransform>();
   var yOffset =  -LevelDB.Packs.length * rectTransform.rect.height;
   rectTransform.anchoredPosition = new Vector3(0, yOffset, 0);
   rectTransform.localScale = Vector3.one;

   buttonInstance.title.text = levelPack.title;
   buttonInstance.description.text = levelPack.description;
   buttonInstance.completion.text = "0 / " + levelPack.count;

   buttonInstance.levelPack = levelPack;

   // TODO Don't do this after each add.
   var scrollingTransform = levelPackContent.GetComponent.<RectTransform>();
   scrollingTransform.sizeDelta = new Vector2(scrollingTransform.rect.width, rectTransform.rect.height * LevelDB.Packs.length);
}

function SelectLevelPack(levelPack : LevelPack) {
   m_selectedPack = levelPack;
   levelPackTitle.text = m_selectedPack.title;

   var scrollingTransform = selectedPackContent.GetComponent.<RectTransform>();
   var tileSize = 200; // This needs to be kept in sync with the prefab
   var tilesPerRow : int = 5; // this...
   var tilePadding = 19; // ...and this are arbitrary, but they look good on 9:16 screens.

   var index = 0;
   for (var level in m_selectedPack.levels) {
      var buttonInstance = GameObject.Instantiate(levelButtonPrefab).GetComponent.<LevelButton>();

      buttonInstance.transform.SetParent(selectedPackContent);

      var row = index/tilesPerRow + 1;
      var column = (index + tilesPerRow) % tilesPerRow + 1;
      var yOffset =  row * (-tileSize-tilePadding) + 5;
      var xOffset =  column * (tileSize + tilePadding) - 5;

      var rectTransform = buttonInstance.GetComponent.<RectTransform>();
      rectTransform.anchoredPosition = new Vector3(xOffset, yOffset, 0);
      rectTransform.localScale = Vector3.one;

      buttonInstance.id.text = ""+level.id;
      buttonInstance.level = level;

      index += 1;
   }

   var totalRows = m_selectedPack.levels.length / tilesPerRow;
   scrollingTransform.sizeDelta = new Vector2(scrollingTransform.rect.width, totalRows*tileSize + totalRows*tilePadding);
}