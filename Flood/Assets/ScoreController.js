#pragma strict

private var m_currentMoves = 0;
public var board : Board;

public var bestText : TextMesh;
public var currentText : TextMesh;

private static var DEFAULT_BEST = 99999;

var recordClearedText : ClearedText;
var nonRecordClearedText : ClearedText;

function GetCurrentMoves() {
   return m_currentMoves;
}

function Reset() {
   m_currentMoves = 0;
   UpdateBestText();
   UpdateCurrentMovesText();
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
}

private function getKey() {
   var numColors = board.GetNumColors();
   var size = board.GetSize();
   return numColors + "-" + size;
}

private function GetBestScore() {
   var key = getKey();
   var best = PlayerPrefs.GetInt(key);
   if (best == 0) {
      best = DEFAULT_BEST;
   }
   return best;
}

private function SetBestScore() {
   var key = getKey();
   PlayerPrefs.SetInt(key, m_currentMoves);
   UpdateBestText();
}