#pragma downcast

var levelPackScrollRect : UnityEngine.UI.ScrollRect;
var levelPackContent : Transform;
var levelPackButtonPrefab : GameObject;

var selectedPackContent : Transform;
var levelButtonPrefab : GameObject;

var levelPackTitle : UnityEngine.UI.Text;

var canvas : Canvas;

private var m_selectedPack : LevelPack;

static var tilesPerRow = 5; // this...
static var tilesPerPage = 35;
static var screenWidth = 1080;

var levelButtons : List.<LevelButton>;

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
      levelPackScrollRect.inertia = true;
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

   var contentRect = selectedPackContent.GetComponent.<RectTransform>();
   var currentPosition = contentRect.anchoredPosition.x;
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

   if (Mathf.Abs(currentPosition - targetPosition) < 10) {
      contentRect.anchoredPosition.x = targetPosition;
      return;
   }

   levelPackScrollRect.inertia = false;
   var lerpSpeed = Time.time - releaseTime;
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
         levelButton = buttonTransform.GetComponent.<LevelButton>();
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
   Debug.Log(totalPages);
   selectedPackContent.sizeDelta = new Vector2(screenWidth * (totalPages-1), selectedPackContent.sizeDelta.y); 
   selectedPackContent.anchoredPosition.x = 0;

   // Set up offsets for snapping.
   pageOffsets = new List.<int>();
   for (var p = 0 ; p < totalPages ; ++p) {
      pageOffsets.Add(screenWidth * p);
   }

}