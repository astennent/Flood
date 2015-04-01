#pragma strict

import System.Collections.Generic;

class Board extends MonoBehaviour {

   var m_tiles = new List.<List.<Tile> >();
   var m_borderTiles = new HashSet.<Tile>();
   var m_floodedTiles = new HashSet.<Tile>();
   var m_size : int;

   function Start () {
      Generate(15);
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

   function ProcessClick(clickedTile : Tile) {
      if (m_borderTiles.Count == 0) {
         Generate(m_size);
         return;
      }

      var targetColor = clickedTile.getColor();
      var oldBorderTiles = new List.<Tile>(m_borderTiles);
      for (var tile in oldBorderTiles) {
         floodFrom(tile, targetColor);
      }

      var origin = new Vector2(clickedTile.x(), clickedTile.y());
      for (var tile in m_floodedTiles) {
         tile.setColor(targetColor, origin);
      }
   }

   function Generate(size : int) {
      m_size = size;

      for (var tileRow in m_tiles) {
         for (var tile in tileRow) {
            Destroy(tile.gameObject);
         }
      }

      m_tiles.Clear();
      m_borderTiles.Clear();
      m_floodedTiles.Clear();

      for (var y = 0 ; y < size ; y++) {
         var tileRow = new List.<Tile>();
         for (var x = 0 ; x < size ; x++) {
            var tile : Tile = Tile.Instantiate(Prefabs.getTilePrefab(), transform.position, transform.rotation);
            tile.Initialize(this, x, y);

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
   }
}
