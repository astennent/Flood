#pragma strict

var levelPackContent : Transform;
var levelPackButtonPrefab : GameObject;

var selectedPackContent : Transform;
var levelButtonPrefab : GameObject;

var levelPackTitle : UnityEngine.UI.Text;

var canvas : Canvas;

private var m_selectedPack : LevelPack;

static var tileSize = 190; // This needs to be kept in sync with the prefab
static var tilesPerRow = 5; // this...
static var tilePadding = 25; // ...and this are arbitrary, but they look good on 9:16 screens.
static var tilesPerPage = 35;
static var pageSize = tilesPerRow*tileSize + (tilesPerRow-1)*tilePadding;
static var pagePadding = 100;

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

var currentPosition : float;
var restPosition : float = 0;
function Update() {

   // var touchCurrent = Input.GetMouseButton(0);
   // var touchEnded = Input.GetMouseButtonUp(0);
   // for (var touch in Input.touches) {
   //    if (touch.phase != TouchPhase.Ended && touch.phase != TouchPhase.Canceled) {
   //        touchCurrent = true;
   //    } else if (touch.phase == TouchPhase.Ended) {
   //       touchEnded = true;
   //    }
   // }

   // var rectTransform = selectedPackContent.GetComponent.<RectTransform>();
   // var updatedPosition = rectTransform.anchoredPosition.x;
   // var positionDelta = updatedPosition - currentPosition;
   // if (!touchCurrent && touchEnded) {
   //    if (positionDelta < -200) {
   //       Debug.Log("Swipe Left");
   //       SwipeSelectedPack(-pageSize);
   //    }
   //    if (positionDelta > 200) {
   //       Debug.Log("Swipe right");
   //       SwipeSelectedPack(pageSize);
   //    }
   // } 
   // if (!touchCurrent && !touchEnded) {
   //    //
   // }
   // if (touchCurrent && !touchEnded) {
   //    //rectTransform.position.x += positionDelta;
   // }

   var scrollRect = selectedPackContent.GetComponent.<RectTransform>();
   Debug.Log(selectedPackContent.position.x);
   //scrollRect.position.x = 1000;



}

// private function SwipeSelectedPack(adjust : float) {
//    var scrollRect = selectedPackContent.GetComponent.<RectTransform>();
//    //scrollRect.position.x = 1000;
// }


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


   var totalPages : int = m_selectedPack.levels.length/tilesPerPage;

   var index = 0;

   var inexplicableOffset = pageSize/2.0 - (totalPages-1)*pageSize/2.0;

   var minTileOffset = Mathf.Infinity;
   var maxTileOffset = -Mathf.Infinity;

   for (var level in m_selectedPack.levels) {
      var buttonInstance = GameObject.Instantiate(levelButtonPrefab).GetComponent.<LevelButton>();

      buttonInstance.transform.SetParent(selectedPackContent);

      var page = index / tilesPerPage;
      var indexOnPage = index % tilesPerPage;
      var row = indexOnPage/tilesPerRow + 1;
      var column = (indexOnPage + tilesPerRow) % tilesPerRow;

      var verticalPadding = 5;
      var yOffset =  row * (-tileSize-tilePadding) + verticalPadding;

      var pageOffset = (page-1)*pageSize + (page)*pagePadding;
      var columnOffset =  (column) * (tileSize + tilePadding);
      var horizontalPadding = 41 - 47*totalPages;
      var xOffset = columnOffset + pageOffset + inexplicableOffset + horizontalPadding;

      if (xOffset+tileSize > maxTileOffset) {
         maxTileOffset = xOffset+tileSize;
      }
      if (xOffset < minTileOffset) {
         minTileOffset = xOffset;
      }

      var rectTransform = buttonInstance.GetComponent.<RectTransform>();
      rectTransform.anchoredPosition = new Vector3(xOffset, yOffset, 0);
      rectTransform.localScale = Vector3.one;

      buttonInstance.id.text = ""+level.id;
      buttonInstance.level = level;

      index += 1;
   }


   var scrollingTransform = selectedPackContent.GetComponent.<RectTransform>();
   scrollingTransform.sizeDelta.x = (maxTileOffset - minTileOffset) - pageSize;
   //scrollingTransform.sizeDelta.x = (pageSize * (totalPages-1)) + (pagePadding*(totalPages-1));
   //Debug.Log(scrollingTransform.sizeDelta.x);
   scrollingTransform.position.x = 1;
}