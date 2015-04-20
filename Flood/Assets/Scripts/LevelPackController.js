#pragma downcast

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

static var screenWidth = 1080;

// Calculated when a page is made.
var pageOffsets = new List.<int>();

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

var releaseTime : float = 0;
var wasTouching = false;
function Update() {
   if (pageOffsets.Count == 0) {
      return;
   }

   var isTouching = Input.GetMouseButton(0);
   //var touchEnded = Input.GetMouseButtonUp(0);
   for (var touch in Input.touches) {
      if (touch.phase != TouchPhase.Ended && touch.phase != TouchPhase.Canceled) {
          isTouching = true;
      } 
   }

   if (isTouching) {
      wasTouching = true;
      return;
   }


   if (!isTouching && wasTouching) {
      releaseTime = Time.time;
      wasTouching = false;
   }

   var inertiaLag : float = .1; // Time in seconds before snap kicks in.
   var timeSinceRelease = Time.time - releaseTime;
   if (timeSinceRelease < inertiaLag) {
      return;
   }

   var scrollRect = selectedPackContent.GetComponent.<RectTransform>();
   var currentPosition = scrollRect.position.x;
   var smallestDistance = Mathf.Infinity;
   var targetPosition = 0;
   for (var offset in pageOffsets) {
      var dist = Mathf.Abs(currentPosition - offset);
      if (dist < smallestDistance) {
         targetPosition = offset;
         smallestDistance = dist;
      }
   }

   if (currentPosition == targetPosition) {
      return;
   }

   scrollRect.position.x = (Mathf.Abs(currentPosition - targetPosition) < 3) 
      ? targetPosition
      : Mathf.Lerp(scrollRect.position.x, targetPosition, timeSinceRelease - inertiaLag);
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


   var totalPages : int = m_selectedPack.levels.length/tilesPerPage;

   var index = 0;

   var inexplicableOffset = pageSize/2.0 - (totalPages-1)*pageSize/2.0;

   var minTileOffset = Mathf.Infinity;
   var maxTileOffset = -Mathf.Infinity;

   for (var child : Transform in selectedPackContent.transform) {
      Destroy(child.gameObject);
   }

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




   // Set up  the width of the scrolling rect.
   var scrollingTransform = selectedPackContent.GetComponent.<RectTransform>();
   scrollingTransform.sizeDelta.x = (maxTileOffset - minTileOffset) - pageSize;

   // Set up offsets for snapping.
   pageOffsets = new List.<int>();
   var lastPageX = 502;
   for (var p = 0 ; p < totalPages ; ++p) {
      pageOffsets.Add(lastPageX);
      lastPageX += screenWidth/2;
   }

}