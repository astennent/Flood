#pragma strict

import System.Collections.Generic;

class Board extends MonoBehaviour {

   var isOriginal = true;
   var m_tiles = new List.<List.<Tile> >();
   var m_borderTiles = new HashSet.<Tile>();
   var m_floodedTiles = new HashSet.<Tile>();

   public var scrollbarThumb : ScrollThumb;
   public var colorTiles : List.<ColorTile>;
   public var sizeTiles : List.<SizeTile>;
   public var numColorTiles : List.<NumColorTile>;
   public var scrollThumb : ScrollThumb;
   private var scoreController : ScoreController;

   private var m_size : int; // for Zen
   private var m_numColors : int; // For Zen
   private var m_level : Level;

   private var m_promptCallback : Function;
   private var m_promptCallbackParam : int;

   public var m_guiSkin : GUISkin;

   // Used for maintaining randomness for Zen mode.
   private var zenSeed : int;

   // Each entry is a list of tiles that were flooded each turn.
   private var m_undoStack = new LinkedList.<UndoNode>() ;
   private var m_hinting : boolean = false;
   private var m_optimal : int = 0;
   private static var s_mainBoard : Board;

   public var optimalText : TextMesh;


   function GetLevel() {
      return m_level;
   }
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
      RefreshNumColorButtons();
   }
   function GetNumColors() {
      return (m_level) ? m_level.numColors : m_numColors;
   }
   function GetCurrentOptimal() {
      return m_optimal;
   }

   function Prompt(callbackFunction : Function, param : int) {

      // If they just started or finished the game, don't prompt.
      if (!HasGameStarted() || HasGameEnded()) {
         callbackFunction(param);
         return;
      }

      m_promptCallback = callbackFunction;
      m_promptCallbackParam = param;

      MenuController.SwitchToConfirm();
   }

   function ExecutePromptCallback() {
      MenuController.SwitchToGame();
      m_promptCallback(m_promptCallbackParam);
   }

   function Start() {
      if (!isOriginal) {
         return;
      }
      s_mainBoard = this;
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
         var tileDelay = tile.setColor(targetColor, origin);
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
      if (m_optimal != 0) {
         optimalText.text = ""+m_optimal;
      }

      if (!isOriginal) {
         Destroy(gameObject);
      }
   }

   function Undo() {
      if (m_undoStack.Count == 0) {
         return; // Nothing to undo.
      }

      var lastUndoNode = m_undoStack.Last.Value;
      var toRevert = lastUndoNode.tiles;

      for (var revertedTile in toRevert) {
         revertedTile.revert();
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
         tile.setColor(lastUndoNode.color, new Vector2(tile.x(), tile.y()));
      } 

      m_undoStack.RemoveLast();
      scoreController.Decrement();
   }

   function LoadZen() {
      LoadLevel(null);
   }

   function LoadLevel(level : Level) {
      if (!m_level && level) { // Zen to ~Zen
         zenSeed = Random.value;
      } else if (m_level && !level) { //~Zen to Zen
         Random.seed = zenSeed;
      }

      if (m_level != level) {
         m_level = level;
         Regenerate();
         ActivateTileButtons(level == null);
         RefreshNumColorButtons();
      }
   }


   private function ActivateTileButtons(isEnabled : boolean) {
      for (var sizeTile in sizeTiles) {
         sizeTile.gameObject.SetActive(isEnabled);
      }
      for (var numColorTile in numColorTiles) {
         numColorTile.gameObject.SetActive(isEnabled);
      }
      scrollbarThumb.gameObject.SetActive(isEnabled);
   } 

   private function RefreshNumColorButtons() {
      var numColors = GetNumColors();
      scrollbarThumb.setNumColors(numColors);
      for (colorTile in colorTiles) {
         var shouldEnable = (colorTile.colorIndex < numColors);
         colorTile.SetEnabled(shouldEnable);
      }
   }

   // Flips tiles when color theme changes
   function OnThemeChange() {
      for (var tileRow in m_tiles) {
         for (var tile in tileRow) {
            tile.OnThemeChange();
         }
      }
      RefreshNumColorButtons();
   }

   function Regenerate() {
      for (var tileRow in m_tiles) {
         for (var tile in tileRow) {
            tile.Destroy();
         }
      }

      // Destroy() does actually remove objects from memory. In order to remove objects from memory
      // and not just the Engine's scene, you need to call this function.
      Resources.UnloadUnusedAssets();

      m_tiles.Clear();
      m_borderTiles.Clear();
      m_floodedTiles.Clear();
      m_undoStack.Clear();

      if (m_level) {
         Random.seed = m_level.seed;
      }

      var size = GetSize();
      var numColors = GetNumColors();

      for (var y = 0 ; y < size ; y++) {
         var tileRow = new List.<Tile>();
         for (var x = 0 ; x < size ; x++) {
            var tile : Tile = new Tile(x, y, size, transform.rotation, numColors);
            tileRow.Add(tile);
         }
         m_tiles.Add(tileRow);
      }

      DoInitialFlood();

      scoreController.Reset();

      m_optimal = 0;
      optimalText.text = "---";
      var clone = CloneBoard();
      clone.CalculateOptimal();
   }

   function HasGameStarted() {
      return (scoreController.GetCurrentMoves() > 0);
   }

   function HasGameEnded() {
      return (m_borderTiles.Count == 0);
   }

   function DoInitialFlood() {
      var firstTile = m_tiles[0][0];
      m_floodedTiles.Add(firstTile);
      m_borderTiles.Add(firstTile);
      floodFrom(firstTile, firstTile.getColor());
   }

//////////////////////////////

   function SetOptimal(numSteps : int) {
      m_optimal = numSteps;
   }

   function CloneBoard() : Board {
      var clone = GameObject.Instantiate(Prefabs.getBoardPrefab(), 
            Vector3.zero, transform.rotation).GetComponent.<Board>();
      clone.m_numColors = m_numColors;
      clone.m_size = m_size;
      clone.m_level = m_level;
      var clonedTiles = List.<List.<Tile> >();
      for (var tileRow in m_tiles) {
         var cloneRow = new List.<Tile>();
         for (var tile in tileRow) {
            var cloneTile = new Tile(tile.x(), tile.y(), tile.getColor());
            cloneRow.Add(cloneTile);
         }
         clonedTiles.Add(cloneRow);
      }
      clone.m_tiles = clonedTiles;

      clone.DoInitialFlood();
      return clone;
   }

   function CalculateOptimal() {
      var thread = System.Threading.Thread(CalculateOptimalHelper);
      thread.Start();
   }

   private function CalculateOptimalHelper() { 
      //Set the MAX_DEPTH based on the size and number of tiles.
      MAX_DEPTH = BASE_MAX_DEPTH - GetNumColors()/3 - GetSize()/6;

      var fullSize = GetSize() * GetSize();
      var numSteps = 0;
      while (true) {
         var hintNode = CalculateHint();
         if (hintNode.floodedCount == fullSize) {
            numSteps += hintNode.depth;
            break; 
         }
         m_hinting = true;
         ProcessClick(hintNode.color);
         numSteps += 1;
      }

      m_hinting = true;

      for (var i = 0 ; i < numSteps ; ++i) {
         Undo();
      }

      m_hinting = false;
      s_mainBoard.SetOptimal(numSteps);
   }

   function CalculateHint() {
      m_hinting = true;
      var hintNode = CalculateHint(0);
      m_hinting = false;
      return hintNode;
   }

   static var BASE_MAX_DEPTH = 7;
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
