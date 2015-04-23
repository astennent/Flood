#pragma strict

var levelPackScrollRect : UnityEngine.UI.ScrollRect;
var levelPackContent : RectTransform;
var levelPackButtonPrefab : GameObject;

var selectedPackContent : RectTransform;
var levelButtonPrefab : GameObject;

var levelPackTitle : UnityEngine.UI.Text;

var canvas : Canvas;

private var m_selectedPack : LevelPack;

static var tilesPerRow = 5; // this...
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

}

var releaseTime : float = 0;
var wasTouching = false;
private var desiredPage = 0;
function Update() {
   if (!m_selectedPack) {
      return;
   }

   var scrollDirection = InputController.getInputDirection();
   if (scrollDirection == InputController.LEFT) {
      desiredPage += 1;
   } else if (scrollDirection == InputController.RIGHT) {
      desiredPage -= 1;
   }

   var totalPages : int = m_selectedPack.levels.length/tilesPerPage;
   desiredPage = Mathf.Clamp(desiredPage, 0, totalPages-1);

   var contentRect = selectedPackContent.GetComponent.<RectTransform>();
   var currentPosition = contentRect.anchoredPosition.x;
   var targetPosition = (totalPages - desiredPage -1) * screenWidth;

   Debug.Log(targetPosition);

   if (currentPosition == targetPosition) {
      return;
   }

   if (Mathf.Abs(currentPosition - targetPosition) < 10) {
      contentRect.anchoredPosition.x = targetPosition;
      return;
   }

   levelPackScrollRect.inertia = false;
   var lerpSpeed = 0.5;
   contentRect.anchoredPosition.x = Mathf.Lerp(contentRect.anchoredPosition.x, targetPosition, lerpSpeed);
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


   for (var pageTransform : Transform in selectedPackContent.transform) {
      for (var buttonTransform : Transform in pageTransform) {
         var levelButton = buttonTransform.GetComponent.<LevelButton>();
         var index = levelButton.index + levelButton.page * tilesPerPage;
         var level = levelPack.GetLevel(index);

         if (level) {
            levelButton.id.text = ""+(index+1);
            levelButton.level = level;
         } 

         levelButton.gameObject.SetActive( (level != null) );
      }
   }

   var totalPages : int = m_selectedPack.levels.length/tilesPerPage;
   selectedPackContent.sizeDelta = new Vector2(screenWidth * (totalPages-1), selectedPackContent.sizeDelta.y); 
}