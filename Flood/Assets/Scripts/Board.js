#pragma strict

import System.Collections.Generic;

class Board extends MonoBehaviour {

   var m_tiles = new List.<List.<Tile> >();
   var m_borderTiles = new HashSet.<Tile>();
   var m_floodedTiles = new HashSet.<Tile>();

   public var scrollbarThumb : ScrollThumb;
   public var colorTiles : List.<ColorTile>;
   private var scoreController : ScoreController;

   private var m_size : int; // for Zen
   private var m_numColors : int; // For Zen
   private var m_level : Level;

   private var m_promptEnabled = false;
   private var m_promptCallback : Function;
   private var m_promptCallbackParam : int;

   public var m_guiSkin : GUISkin;

   // Used for maintaining randomness for Zen mode.
   private var zenSeed : int;

   // Each entry is a list of tiles that were flooded each turn.
   private var m_undoStack = new LinkedList.<UndoNode>() ;

   private var m_hinting : boolean = false;

   function SetSize(size : int) {
      Prompt(SetSizeSkipPrompt, size);      
   }
   function SetSizeSkipPrompt(size : int) {
      m_size = size;
      Regenerate();
   }
   function GetSize() {
      return (m_level) ? m_level.size : m_size;
   }
   function SetNumColors(numColors : int) {
      Prompt(SetNumColorsSkipPrompt, numColors);
   }
   function SetNumColorsSkipPrompt(numColors : int) {
      m_numColors = numColors;
      Regenerate();

      scrollbarThumb.setNumColors(numColors);
      for (colorTile in colorTiles) {
         var shouldEnable = (colorTile.colorIndex < numColors);
         colorTile.SetEnabled(shouldEnable);
      }
   }
   function GetNumColors() {
      return (m_level) ? m_level.numColors : m_numColors;
   }

   function Prompt(callbackFunction : Function, param : int) {

      // If they just started or finished the game, don't prompt.
      if (!HasGameStarted() || HasGameEnded()) {
         callbackFunction(param);
         return;
      }

      m_promptCallback = callbackFunction;
      m_promptCallbackParam = param;
      m_promptEnabled = true;
   }



   function Start () {
      zenSeed = Random.value * Mathf.Infinity;
      m_size = 15;
      m_numColors = 5;
      scoreController = GetComponent.<ScoreController>();
      Regenerate();
   }

   function GetTile(y : int, x : int) {
      if (y >= 0 && x >= 0 && y < GetSize() && x < GetSize()) {
         return m_tiles[y][x];
      }
      return null;
   }

   // Returns true if this tile is surrounded by flooded neighbors.
   private function floodFrom(tile : Tile, targetColor : int) {
      var x = tile.x();
      var y = tile.y();
      var allNeighborsFlooded = floodNeighbor(tile, GetTile(y-1, x), targetColor);
      allNeighborsFlooded = floodNeighbor(tile, GetTile(y+1, x), targetColor) && allNeighborsFlooded;
      allNeighborsFlooded = floodNeighbor(tile, GetTile(y, x-1), targetColor) && allNeighborsFlooded;
      allNeighborsFlooded = floodNeighbor(tile, GetTile(y, x+1), targetColor) && allNeighborsFlooded;
      if (allNeighborsFlooded) {
         m_borderTiles.Remove(tile);
      }
   }

   // Helper for ProcessClick.
   // Returns false if the neighbor remains unflooded after execution.
   private function floodNeighbor(tile : Tile, neighbor : Tile, targetColor : int) {
      if (!neighbor || m_floodedTiles.Contains(neighbor)) {
         return true;
      }


      if (neighbor.getColor() == targetColor) {
         if (m_undoStack.Count > 0) {
            m_undoStack.Last.Value.tiles.Add(neighbor);
         }
         m_floodedTiles.Add(neighbor);
         m_borderTiles.Add(neighbor);
         floodFrom(neighbor, targetColor);
         return true;
      }

      return false;
   }

   function ProcessClick(tileX : int, tileY : int) {
      ProcessClick(tileX, tileY, m_tiles[tileY][tileX].getColor());
   } 

   function ProcessClick(targetColor : int) {
      ProcessClick(0, 0, targetColor);
   }

   function ProcessClick(tileX : int, tileY : int, targetColor : int) {
      // Reset the game.
      if (HasGameEnded()) {
         Regenerate();
         return;
      }

      m_undoStack.AddLast(new UndoNode(m_tiles[0][0].getColor()));
      var oldFloodedCount = m_floodedTiles.Count;
      var oldBorderTiles = new List.<Tile>(m_borderTiles);
      for (var tile in oldBorderTiles) {
         floodFrom(tile, targetColor);
      }

      var origin : Vector2 = new Vector2(tileX, tileY);
      var minDelay = Mathf.Infinity; // big number.
      for (var tile in m_floodedTiles) {
         var tileDelay = tile.setColor(targetColor, origin, m_hinting);
         if (tileDelay < minDelay) {
            minDelay = tileDelay;
         }
      }

      if (m_hinting) {
         return;
      }

      if (m_floodedTiles.Count > oldFloodedCount) {
         scoreController.Increment();
      } else {
         m_undoStack.RemoveLast();
      }


      // Ensure that no matter where you click, animation will begin immediately. Not doing this
      // makes it look like the game is lagging when you click far away from flooded tiles.
      if (minDelay > 0) {
         for (var tile in m_floodedTiles) {
            tile.decreaseAnimationDelay(minDelay);
         }
      }

      if (HasGameEnded()) {
         scoreController.Finish();
      }
   }

   function Update() {
      if (Input.GetKeyDown(KeyCode.U)) {
         Undo();
      }
      if (Input.GetKeyDown(KeyCode.H)) {
         CalculateHint();
      }
   }

   function Undo() {
      if (m_undoStack.Count == 0) {
         return; // Nothing to undo.
      }

      var lastUndoNode = m_undoStack.Last.Value;
      var toRevert = lastUndoNode.tiles;

      for (var revertedTile in toRevert) {
         revertedTile.revert(m_hinting);
         m_floodedTiles.Remove(revertedTile);
         m_borderTiles.Remove(revertedTile);
      }

      for (revertedTile in toRevert) {
         var x = revertedTile.x();
         var y = revertedTile.y();

         var neighbor = GetTile(y-1, x);
         if (neighbor && m_floodedTiles.Contains(neighbor))
            m_borderTiles.Add(neighbor);
         neighbor = GetTile(y+1, x);
         if (neighbor && m_floodedTiles.Contains(neighbor))
            m_borderTiles.Add(neighbor);
         neighbor = GetTile(y, x-1);
         if (neighbor && m_floodedTiles.Contains(neighbor))
            m_borderTiles.Add(neighbor);
         neighbor = GetTile(y, x+1);
         if (neighbor && m_floodedTiles.Contains(neighbor))
            m_borderTiles.Add(neighbor);
      }     

      for (var tile in m_floodedTiles) {
         tile.setColor(lastUndoNode.color, new Vector2(tile.x(), tile.y()), m_hinting);
      } 

      m_undoStack.RemoveLast();
   }


   function LoadLevel(level : Level) {
      if (m_level == null) {
         zenSeed = Random.value;
      }
      m_level = level;
      Regenerate();
   }

   function LoadZen() {
      if (m_level != null) {
         Random.seed = zenSeed;
      }
      m_level = null;
      Regenerate();
   }

   function Regenerate() {
      for (var tileRow in m_tiles) {
         for (var tile in tileRow) {
            Tile.Destroy(tile);
         }
      }

      // Destroy() does actually remove objects from memory. In order to remove objects from memory
      // and not just the Engine's scene, you need to call this function.
      Resources.UnloadUnusedAssets();

      m_tiles.Clear();
      m_borderTiles.Clear();
      m_floodedTiles.Clear();

      if (m_level) {
         Random.seed = m_level.seed;
      }

      var size = GetSize();
      var numColors = GetNumColors();

      for (var y = 0 ; y < size ; y++) {
         var tileRow = new List.<Tile>();
         for (var x = 0 ; x < size ; x++) {
            var tile : Tile = Tile.Instantiate(this, x, y, numColors);

            tile.transform.localScale /= size;
            var adjust = size/2;

            var xPosition = x - adjust;
            var yPosition = y - adjust;
            tile.transform.position += Vector3.right * (xPosition) / size * 10;
            tile.transform.position += -Vector3.up * (yPosition) / size * 10;
            tileRow.Add(tile);
         }
         m_tiles.Add(tileRow);
      }

      var firstTile = m_tiles[0][0];
      m_floodedTiles.Add(firstTile);
      m_borderTiles.Add(firstTile);
      floodFrom(firstTile, firstTile.getColor());

      scoreController.Reset();
   }

   function HasGameStarted() {
      return (scoreController.GetCurrentMoves() > 0);
   }

   function HasGameEnded() {
      return (m_borderTiles.Count == 0);
   }

   function OnGUI() {

      if (!m_promptEnabled) {
         return;
      }

      GUI.skin = m_guiSkin;

      // Draw background box.
      var width = Screen.width*3/4;
      var height = Screen.height*2/5;
      var boxLeft = Screen.width*1/8;
      var boxTop = height/2;
      var backgroundRect = new Rect(boxLeft, boxTop, width, height);
      GUI.Box(backgroundRect, "");

      // Draw buttons
      var buttonPadding = width/12;
      var buttonHeight = height/4;
      var buttonWidth = width * 3.0 / 8.0;
      var buttonTop = boxTop + height - buttonHeight - buttonPadding;
      var buttonRect = new Rect(boxLeft + buttonPadding, buttonTop, buttonWidth, buttonHeight);
      if (GUI.Button(buttonRect, "Continue") ) {
         m_promptEnabled = false;
         m_promptCallback(m_promptCallbackParam);
      }

      buttonRect.x += buttonWidth + buttonPadding;
      if (GUI.Button(buttonRect, "Cancel") ) {
         m_promptEnabled = false;
      }

      var textWidth = width - 2*buttonPadding;
      var textHeight = buttonTop - boxTop - buttonPadding;
      var textRect = new Rect(boxLeft + buttonPadding, boxTop + buttonPadding, textWidth, textHeight);
      GUI.color = new Color(.1, .1, .1);
      GUI.Label(textRect, "This will end the game and reset the board. Continue?");
   }

   function CalculateHint() {
      m_hinting = true;
      var hintNode = CalculateHint(0);
      m_hinting = false;
      ProcessClick(hintNode.color);
   }

   static var MAX_DEPTH = 3;
   function CalculateHint(currentDepth : int) : HintNode {
      var numFloodedTiles = m_floodedTiles.Count;
      var currentColor = m_tiles[0][0].getColor();
      if (currentDepth == MAX_DEPTH || numFloodedTiles == GetSize()*GetSize()) {
         return new HintNode(numFloodedTiles, currentColor, currentDepth);
      }

      var bestHintNode : HintNode;
      var bestFloodedCount : int = 0;

      var numColors = GetNumColors();
      for (var colorIndex = 0 ; colorIndex < numColors ; ++colorIndex) {
         ProcessClick(colorIndex);

         if (m_floodedTiles.Count > numFloodedTiles) {
            var hintNode = CalculateHint(currentDepth+1);

            if (hintNode.floodedCount > bestFloodedCount || 
                  (hintNode.floodedCount == bestFloodedCount && hintNode.depth < bestHintNode.depth)
                  ) {
               bestHintNode = hintNode;
               bestFloodedCount = hintNode.floodedCount;
            }
         }


         Undo();
      }

      if (currentDepth > 0) {
         bestHintNode.color = currentColor;
      }

      return bestHintNode;
   }

}

class HintNode {
   var floodedCount : int;
   var color : int;
   var depth : int;

   function HintNode(floodedCount : int, color : int, depth : int) {
      this.floodedCount = floodedCount;
      this.color = color;
      this.depth = depth;
   }
}

class UndoNode {
   var tiles = new List.<Tile>();
   var color : int = -1;

   function UndoNode(color : int) {
      this.color = color;
   }
}
