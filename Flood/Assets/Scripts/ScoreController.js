#pragma strict

private var m_currentMoves = 0;
public var board : Board;

public var bestText : TextMesh;
public var currentText : TextMesh;

private static var DEFAULT_BEST = 99999;

var recordClearedText : ClearedText;
var nonRecordClearedText : ClearedText;
var clickAnywhereText : ClearedText;

function GetCurrentMoves() {
   return m_currentMoves;
}

function Reset() {
   m_currentMoves = 0;
   UpdateBestText();
   UpdateCurrentMovesText();
   clickAnywhereText.Hide();
}

private function UpdateBestText() {
   setText(bestText, GetBestScore());
}

private function UpdateCurrentMovesText() {
   setText(currentText, m_currentMoves);
}

private function setText(textMesh : TextMesh, score : int) {
   if (score == DEFAULT_BEST) {
      textMesh.text = "---";
   } else {
      textMesh.text = "" + score;
   }
}

function Increment() {
   m_currentMoves += 1;
   UpdateCurrentMovesText();
}

function Finish() {
   if (m_currentMoves < GetBestScore()) {
      recordClearedText.Display();
      SetBestScore();
   } else {
      nonRecordClearedText.Display();
   }


   var oldStars = GetNumStars(board.GetLevel());
   var earnedStars = calculateEarnedStars(m_currentMoves, board.GetCurrentOptimal());
   if (earnedStars > oldStars) {
      SetBestStars(earnedStars);
   }

   clickAnywhereText.Display();
}

private static function calculateEarnedStars(moves : int, optimal : int) {
   if (moves <= optimal) {
      return 4;
   } else if (moves == optimal + 1) {
      return 3;
   } else if (moves == optimal + 2) {
      return 2; 
   } else if (moves == optimal + 3) {
      return 1;
   }
   return 0;
}

private function getStarsKey(level : Level) {
   return getKey(level, true);
}
private function getKey(level : Level) : String {
   return getKey(level, false);
}
private function getKey(level : Level, stars : boolean) : String {
   var numColors = (level == null) ? board.GetNumColors() : level.numColors;
   var size = (level == null) ? board.GetSize() : level.size;
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
   PlayerPrefs.SetInt(key, m_currentMoves);
   UpdateBestText();
}

function GetNumStars(level : Level) {
   var key = getStarsKey(level);
   var numStars = PlayerPrefs.GetInt(key);
   return numStars; 
} 

private function SetBestStars(earnedStars : int) {
   var level = board.GetLevel();
   var key = getStarsKey(level);
   PlayerPrefs.SetInt(key, earnedStars);
}