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
   private var oldZenSeed : int;

   // Each entry is a list of tiles that were flooded each turn.
   private var m_undoStack = new LinkedList.<UndoNode>() ;
   private var m_hinting : boolean = false;
   private var m_officialClone : Board;
   private var m_optimal : int = 0;
   private static var s_mainBoard : Board;

   public var optimalText : TextMesh;
   public var gameTitle : UnityEngine.UI.Text;

   private static var LARGE_NUMBER = 9999999;

   function IsZen() {
      return (m_level == null);
   }
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
      // Don't process anything if you clicked through a menu.
      if (!MenuController.IsOnGame()) {
         return;
      }

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

   var s_floodFromCount = 0;
   // 5 colors, second highest board count: Approx 225k, 900k
   private function floodFrom(tile : Tile) {
      s_floodFromCount++;
      
      if (!m_floodedTiles.Contains(tile)) {
         m_floodedTiles.Add(tile);
         m_undoStack.Last.Value.newlyFlooded.Add(tile);
      }

      var x = tile.x();
      var y = tile.y();
      var neighbors = [
         GetTile(y-1, x),
         GetTile(y+1, x),
         GetTile(y, x-1),
         GetTile(y, x+1)
      ];

      for (var neighbor in neighbors) {
         if (!neighbor || m_floodedTiles.Contains(neighbor)) {
            continue;
         }

         if (neighbor.getColor() == tile.getColor()) {
            floodFrom(neighbor);
         } else if (!m_borderTiles.Contains(neighbor)) {
            m_borderTiles.Add(neighbor);
            m_undoStack.Last.Value.newlyBorder.Add(neighbor);
         }
      }

      if (m_borderTiles.Contains(tile)) {
         m_borderTiles.Remove(tile);
         m_undoStack.Last.Value.newlyNonBorder.Add(tile);
      }

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
         return;
      }

      m_undoStack.AddLast(new UndoNode(m_tiles[0][0].getColor()));
      var oldFloodedCount = m_floodedTiles.Count;
      var oldBorderTiles = new List.<Tile>(m_borderTiles);
      for (var tile in oldBorderTiles) {
         if (tile.getColor() == targetColor) {
            floodFrom(tile);
         }
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
      } else if (m_undoStack.Count > 1) {
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

      var iterator = Random.value;
   }

   function Undo() {
      if (m_undoStack.Count <= 1) {
         return; // Nothing to undo.
      }

      var lastUndoNode = m_undoStack.Last.Value;

      for (var newlyFloodedTile in lastUndoNode.newlyFlooded) {
         newlyFloodedTile.revert();
         m_floodedTiles.Remove(newlyFloodedTile);
      }
      
      for (var newlyNonBorderTile in lastUndoNode.newlyNonBorder) {
         m_borderTiles.Add(newlyNonBorderTile);
      }

      for (var newlyBorderTile in lastUndoNode.newlyBorder) {
         m_borderTiles.Remove(newlyBorderTile);
      }

      for (var tile in m_floodedTiles) {
         tile.setColor(lastUndoNode.color, new Vector2(tile.x(), tile.y()));
      } 

      m_undoStack.RemoveLast();
      if (!m_hinting) {
         scoreController.Decrement();
      }
   }

   function LoadZen() {
      LoadLevel(null);
   }

   function LoadLevel(level : Level) {
      if (m_level != level) {
         m_level = level;
         Regenerate();
         ActivateTileButtons(level == null);
         RefreshNumColorButtons();
      }
      gameTitle.text = (m_level) ? m_level.GetTitle() : "";
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

   function Replay() {
      Regenerate(true);
   }

   function NextLevel() {
      if (IsZen()) {
         Regenerate();
      } else {
         var nextLevel = LevelPackController.GetLevelAfter(m_level);
         if (nextLevel) {
            LoadLevel(nextLevel);
         } else {
            MenuController.SwitchToSelectedPack();
         }
      }
   }

   function Regenerate() {
      Regenerate(false);
   }

   private function Regenerate(useOldZenSeed : boolean) {

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
      } else {
         if (!useOldZenSeed) {
            oldZenSeed = Random.value * LARGE_NUMBER;
         }
         Random.seed = oldZenSeed;
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
      m_officialClone = clone;
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
      m_undoStack.AddLast(new UndoNode(firstTile.getColor()));
      m_borderTiles.Add(firstTile);
      floodFrom(firstTile);
   }

//////////////////////////////

   function SetOptimal(cloneBoard : Board, numSteps : int) {
      if (cloneBoard == m_officialClone) {
         m_optimal = numSteps;
      }
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
      Debug.Log(s_floodFromCount);
      s_mainBoard.SetOptimal(this, numSteps);
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
   var newlyFlooded = new List.<Tile>();
   var newlyBorder = new List.<Tile>();
   var newlyNonBorder = new List.<Tile>();
   var color : int = -1;

   function UndoNode(color : int) {
      this.color = color;
   }
}
