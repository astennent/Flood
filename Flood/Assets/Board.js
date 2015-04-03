#pragma strict

import System.Collections.Generic;

class Board extends MonoBehaviour {

   var m_tiles = new List.<List.<Tile> >();
   var m_borderTiles = new HashSet.<Tile>();
   var m_floodedTiles = new HashSet.<Tile>();

   public var scrollbarThumb : ScrollThumb;

   private var m_size : int;
   private var m_numColors : int;

   function SetSize(size : int) {
      m_size = size;
      Regenerate();
   }

   function SetNumColors(numColors : int) {
      m_numColors = numColors;
      Regenerate();
      
      scrollbarThumb.setNumColors(numColors);
   }

   function Start () {
      m_size = 15;
      m_numColors = 5;
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

   function ProcessClick(targetColor : int) {
      ProcessClick(0, 0, targetColor);
   }

   function ProcessClick(clickedTile : Tile) {
      ProcessClick(clickedTile.x(), clickedTile.y(), clickedTile.getColor());
   }

   function ProcessClick(tileX : int, tileY : int, targetColor : int) {
      if (m_borderTiles.Count == 0) {
         Regenerate();
         return;
      }

      var oldBorderTiles = new List.<Tile>(m_borderTiles);
      for (var tile in oldBorderTiles) {
         floodFrom(tile, targetColor);
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
   }
}
