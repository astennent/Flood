#pragma strict

var levelPackScrollRect : UnityEngine.UI.ScrollRect;
var levelPackContent : RectTransform;
var levelPackButtonPrefab : GameObject;

var selectedPackContent : RectTransform;
var levelPackTitle : UnityEngine.UI.Text;

var canvas : Canvas;

var starsImages : UnityEngine.Sprite[];

private static var m_selectedPack : LevelPack;

static var tilesPerRow = 5; 
static var tilesPerPage = 35;
static var screenWidth = 1080;

var levelButtons : List.<LevelButton>;

function Start() {
   LoadLevelPacks();
}

function LoadLevelPacks() {
   var index = 0;
   for (var levelPack in LevelDB.Packs) {
      LoadPack(levelPack, index);
      ++index;
   }
   RefreshLevelPackButtonCompletion();
}

private var pageSetTime = 0;
private var desiredPage = 0;
function Update() {
   if (!m_selectedPack || !MenuController.IsOnSelectedPack()) {
      return;
   }

   var scrollDirection = InputController.getInputDirection();
   if (scrollDirection == InputController.LEFT) {
      SetPage(desiredPage + 1);
   } else if (scrollDirection == InputController.RIGHT) {
      SetPage(desiredPage - 1);
   }

   // Let the scrollview handle scrolling.
   if (Input.touchCount > 0 || Input.GetMouseButton(0)) {
      return;
   }

   var contentRect = selectedPackContent.GetComponent.<RectTransform>();
   var currentPosition = contentRect.anchoredPosition.x;
   var totalPages : int = m_selectedPack.levels.length/tilesPerPage;
   if (Input.GetMouseButtonUp(0) && scrollDirection == InputController.NONE) {
      var closestPage : int = (currentPosition + screenWidth/2) / screenWidth;
      SetPage(totalPages - closestPage - 1);
   } 

   var targetPosition = (totalPages - desiredPage -1) * screenWidth;
   if (Mathf.Abs(currentPosition - targetPosition) < 5) {
      contentRect.anchoredPosition.x = targetPosition;
      return;
   }

   var lerpSpeed = 0.2;
   contentRect.anchoredPosition.x = Mathf.Lerp(contentRect.anchoredPosition.x, targetPosition, lerpSpeed);
}

private function SetPage(page : int) {
   if (Time.time - pageSetTime > .5) {
      var totalPages : int = m_selectedPack.levels.length/tilesPerPage;
      page = Mathf.Clamp(page, 0, totalPages-1);
      desiredPage = page;
      pageSetTime = Time.time;
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

   buttonInstance.levelPack = levelPack;

   var scrollingTransform = levelPackContent.GetComponent.<RectTransform>();
   scrollingTransform.sizeDelta = new Vector2(scrollingTransform.rect.width, rectTransform.rect.height * LevelDB.Packs.length);
}

function RefreshLevelPackButtonCompletion() {
   for (var buttonTransform : Transform in levelPackContent.transform) {
      var buttonInstance = buttonTransform.GetComponent.<LevelPackButton>();
      var levelPack = buttonInstance.levelPack;
      buttonInstance.completion.text = levelPack.CountStars() + " / " + levelPack.count*4;
   }
}

// TODO: This is just to make sure the stars images are refreshed when pressing back.
// This could be done more efficiently if you just check the button for the current level.
function RefreshLevelButtons() {
   for (var pageTransform : Transform in selectedPackContent.transform) {
      for (var buttonTransform : Transform in pageTransform) {
         var levelButton = buttonTransform.GetComponent.<LevelButton>();
         DrawLevelButton(levelButton);
      }
   }
}

function SelectLevelPack(levelPack : LevelPack) {
   m_selectedPack = levelPack;
   levelPackTitle.text = m_selectedPack.title;

   RefreshLevelButtons();

   // Ensure the scroll area is the right size
   var totalPages : int = m_selectedPack.levels.length/tilesPerPage;
   selectedPackContent.sizeDelta = new Vector2(screenWidth * (totalPages-1), selectedPackContent.sizeDelta.y); 

   // Scroll to the first page
   SetPage(0);
}

private function DrawLevelButton(levelButton : LevelButton) {
   var index = levelButton.index + levelButton.page * tilesPerPage;
   var level = m_selectedPack.GetLevel(index);
   if (level) {
      levelButton.id.text = ""+(index+1);
      levelButton.level = level;
      var numStars = level.GetBestStars();
      levelButton.SetStarsImage(starsImages[numStars]);
   } 

   levelButton.gameObject.SetActive( (level != null) );
}

static function GetLevelAfter(level : Level) {
   // TODO: Actually go searching for the level. (Not necessary as of the time of writing this)
   return m_selectedPack.GetLevel(level.id);
}
