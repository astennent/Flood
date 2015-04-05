#pragma strict

import System.Collections.Generic;

class Board extends MonoBehaviour {

   var m_tiles = new List.<List.<Tile> >();
   var m_borderTiles = new HashSet.<Tile>();
   var m_floodedTiles = new HashSet.<Tile>();

   public var scrollbarThumb : ScrollThumb;
   public var colorTiles : List.<ColorTile>;
   private var scoreController : ScoreController;

   private var m_size : int;
   private var m_numColors : int;

   private var m_promptEnabled = false;
   private var m_promptCallback : Function;
   private var m_promptCallbackParam : int;

   public var m_guiSkin : GUISkin;

   function SetSize(size : int) {
      Prompt(SetSizeSkipPrompt, size);      
   }
   function SetSizeSkipPrompt(size : int) {
      m_size = size;
      Regenerate();
   }
   function GetSize() {
      return m_size;
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
      return m_numColors;
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

   function OnGUI() {

      if (!m_promptEnabled) {
         return;
      }

      GUI.skin = m_guiSkin;

      // Draw background box.
      var width = Screen.width/2;
      var height = Screen.height/2;
      var boxLeft = width/2;
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
      GUI.Label(textRect, "This will reset the board and you will lose your progress. Continue?");
   }

   function Start () {
      m_size = 15;
      m_numColors = 5;
      scoreController = GetComponent.<ScoreController>();
      Regenerate();
   }

   // Returns true if this tile is surrounded by flooded neighbors.
   private function floodFrom(tile : Tile, targetColor : int) {
      var allNeighborsFlooded = true;
      if (tile.y() > 0) {
         allNeighborsFlooded = floodNeighbor(tile, -1, 0, targetColor) && allNeighborsFlooded;
      }   
      if (tile.x() > 0) {
         allNeighborsFlooded = floodNeighbor(tile, 0, -1, targetColor) && allNeighborsFlooded;
      }      
      if (tile.y() < m_size-1) {
         allNeighborsFlooded = floodNeighbor(tile, 1, 0, targetColor) && allNeighborsFlooded;
      }   
      if (tile.x() < m_size-1) {
         allNeighborsFlooded = floodNeighbor(tile, 0, 1, targetColor) && allNeighborsFlooded;
      }  
      if (allNeighborsFlooded) {
         m_borderTiles.Remove(tile);
      }
   }

   // Helper for ProcessClick.
   // Returns true if the neighbor is flooded after execution.
   private function floodNeighbor(tile : Tile, vertical : int, horizontal : int, targetColor : int) {
      var neighbor = m_tiles[tile.y()+vertical][tile.x()+horizontal];
      if (m_floodedTiles.Contains(neighbor)) {
         return true;
      }

      if (neighbor.getColor() == targetColor) {
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

      var oldFloodedCount = m_floodedTiles.Count;
      var oldBorderTiles = new List.<Tile>(m_borderTiles);
      for (var tile in oldBorderTiles) {
         floodFrom(tile, targetColor);
      }

      if (m_floodedTiles.Count > oldFloodedCount) {
         scoreController.Increment();
      }

      var origin = new Vector2(tileX, tileY);
      var minDelay = 100000.0; // big number.
      for (var tile in m_floodedTiles) {
         var tileDelay = tile.setColor(targetColor, origin);
         if (tileDelay < minDelay) {
            minDelay = tileDelay;
         }
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

   function Regenerate() {
      for (var tileRow in m_tiles) {
         for (var tile in tileRow) {
            GameObject.Destroy(tile.gameObject);
         }
      }

      // Destroy() does actually remove objects from memory. In order to remove objects from memory
      // and not just the Engine's scene, you need to call this function.
      Resources.UnloadUnusedAssets();

      m_tiles.Clear();
      m_borderTiles.Clear();
      m_floodedTiles.Clear();

      for (var y = 0 ; y < m_size ; y++) {
         var tileRow = new List.<Tile>();
         for (var x = 0 ; x < m_size ; x++) {
            var tile : Tile = Tile.Instantiate(Prefabs.getTilePrefab(), transform.position, transform.rotation);
            tile.Initialize(this, x, y, m_numColors);

            tile.transform.localScale /= m_size;
            var adjust = m_size/2;

            var xPosition = x - adjust;
            var yPosition = y - adjust;
            tile.transform.position += Vector3.right * (xPosition) / m_size * 10;
            tile.transform.position += -Vector3.up * (yPosition) / m_size * 10;
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
}
