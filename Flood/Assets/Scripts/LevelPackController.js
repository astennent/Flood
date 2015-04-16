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

   var index = 0;
   for (var levelPack in LevelDB.Packs) {
      LoadPack(levelPack, index);
      ++index;
   }

}

var restPosition : float;
function Update() {

   var touchCurrent = Input.GetMouseButton(0);
   var touchEnded = Input.GetMouseButtonUp(0);
   for (var touch in Input.touches) {
      if (touch.phase != TouchPhase.Ended && touch.phase != TouchPhase.Canceled) {
          touchCurrent = true;
      } else if (touch.phase == TouchPhase.Ended) {
         touchEnded = true;
      }
   }

   var updatedPosition = (selectedPackContent.GetComponent.<RectTransform>().anchoredPosition.x);
   if (!touchCurrent && touchEnded) {
      if (touchEnded) {
         var restDelta = updatedPosition - restPosition;
         Debug.Log(restDelta);
      } else {
         restPosition = updatedPosition;
      }
   } 

}


function LoadPack(levelPack : LevelPack, index : int) {
   var buttonInstance = GameObject.Instantiate(levelPackButtonPrefab).GetComponent.<LevelPackButton>();

   buttonInstance.transform.SetParent(levelPackContent);
   
   var rectTransform = buttonInstance.GetComponent.<RectTransform>();
   var yOffset =  -index * rectTransform.rect.height;
   rectTransform.anchoredPosition = new Vector3(0, yOffset, 0);
   rectTransform.localScale = Vector3.one;

   buttonInstance.title.text = levelPack.title;
   buttonInstance.description.text = levelPack.description;
   buttonInstance.completion.text = "0 / " + levelPack.count;

   buttonInstance.levelPack = levelPack;

   var scrollingTransform = levelPackContent.GetComponent.<RectTransform>();
   scrollingTransform.sizeDelta = new Vector2(scrollingTransform.rect.width, rectTransform.rect.height * LevelDB.Packs.length);
}

function SelectLevelPack(levelPack : LevelPack) {
   m_selectedPack = levelPack;
   levelPackTitle.text = m_selectedPack.title;

   var scrollingTransform = selectedPackContent.GetComponent.<RectTransform>();
   var tileSize = 200; // This needs to be kept in sync with the prefab
   var tilesPerRow = 5; // this...
   var tilePadding = 19; // ...and this are arbitrary, but they look good on 9:16 screens.
   var tilesPerPage = 35;

   var index = 0;
   for (var level in m_selectedPack.levels) {
      var buttonInstance = GameObject.Instantiate(levelButtonPrefab).GetComponent.<LevelButton>();

      buttonInstance.transform.SetParent(selectedPackContent);

      var page = index / tilesPerPage;
      var indexOnPage = index % tilesPerPage;
      var row = indexOnPage/tilesPerRow + 1;
      var column = (indexOnPage + tilesPerRow) % tilesPerRow;

      var verticalPadding = 5;
      var horizontalPadding = 5;
      var yOffset =  row * (-tileSize-tilePadding) + verticalPadding;

      var pageSize = 1080;
      var pagePadding = 100;
      var pageOffset = (page-1)*pageSize + (page)*pagePadding;
      var columnOffset =  (column) * (tileSize + tilePadding);
      var xOffset = (pageSize/2) + columnOffset + pageOffset + horizontalPadding;

      var rectTransform = buttonInstance.GetComponent.<RectTransform>();
      rectTransform.anchoredPosition = new Vector3(xOffset, yOffset, 0);
      rectTransform.localScale = Vector3.one;

      buttonInstance.id.text = ""+level.id;
      buttonInstance.level = level;

      index += 1;
   }

   var totalRows = tilesPerPage / tilesPerRow;
   //scrollingTransform.sizeDelta = new Vector2(scrollingTransform.rect.width, totalRows*tileSize + totalRows*tilePadding);
}