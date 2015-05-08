#pragma strict

private static var s_currentMoves = 0;
private static var s_instance : ScoreController;
public var board : Board;

public var bestText : TextMesh;
public var currentText : TextMesh;

public var gameStars : List.<GameStar>;

private static var DEFAULT_BEST = 99999;

var recordClearedText : ClearedText;
var nonRecordClearedText : ClearedText;

function Start() {
   s_instance = this;
}

static function GetCurrentMoves() {
   return s_currentMoves;
}

function Reset() {
   s_currentMoves = 0;
   UpdateBestText();
   UpdateCurrentMovesText();
   UpdateGameStars();
   EndGameButton.Hide();
}

private function UpdateBestText() {
   setText(bestText, GetBestScore());
}

private function UpdateGameStars() {
   var level = board.GetLevel();
   var numStars = GetBestStars(level);
   for (var gameStar in gameStars) {
      gameStar.UpdateForNumStars(level, numStars);
   }
}

private function UpdateCurrentMovesText() {
   setText(currentText, s_currentMoves);
}

private function setText(textMesh : TextMesh, score : int) {
   if (score == DEFAULT_BEST) {
      textMesh.text = "---";
   } else {
      textMesh.text = "" + score;
   }
}

function Increment() {
   s_currentMoves += 1;
   UpdateCurrentMovesText();
}

function Decrement() {
   s_currentMoves -= 1;
   UpdateCurrentMovesText();
}

function Finish() {
   if (s_currentMoves < GetBestScore()) {
      recordClearedText.Display();
      SetBestScore();
      UpdateGameStars();
   } else {
      nonRecordClearedText.Display();
   }
   var level = board.GetLevel();
   
   var isZen = (level == null);
   EndGameButton.Display(isZen);

   var oldStars = GetBestStars(level);
   var earnedStars = calculateEarnedStars(s_currentMoves, board.GetCurrentOptimal());
   if (earnedStars > oldStars) {
      SetBestStars(earnedStars);
   }

   UpdateGameStars();
}

private static function calculateEarnedStars(moves : int, optimal : int) {
   if (moves <= optimal) {
      return 4;
   } else if (moves <= optimal + 1) {
      return 3;
   } else if (moves <= optimal + 3) {
      return 2; 
   } else if (moves <= optimal + 5) {
      return 1;
   }
   return 0;
}

private static function getStarsKey(level : Level) {
   return getKey(level, true);
}
private static function getKey(level : Level) : String {
   return getKey(level, false);
}
private static function getKey(level : Level, stars : boolean) : String {
   var numColors = (level == null) ? s_instance.board.GetNumColors() : level.numColors;
   var size = (level == null) ? s_instance.board.GetSize() : level.size;
   var key = numColors + "-" + size;
   
   if (level) {
      key += "-"+level.seed;
   }

   if (stars) {
      key += "s";
   }
   
   return key;
}

private function GetBestScore() {
   var level = board.GetLevel();
   var key = getKey(level);
   var best = PlayerPrefs.GetInt(key);
   if (best == 0) {
      best = DEFAULT_BEST;
   }
   return best;
}

private function SetBestScore() {
   var level = board.GetLevel();
   var key = getKey(level);
   PlayerPrefs.SetInt(key, s_currentMoves);
   UpdateBestText();
}

static function GetBestStars(level : Level) {
   var key = getStarsKey(level);
   var numStars = PlayerPrefs.GetInt(key);
   return numStars; 
} 

private function SetBestStars(earnedStars : int) {
   var level = board.GetLevel();
   var key = getStarsKey(level);
   PlayerPrefs.SetInt(key, earnedStars);
}