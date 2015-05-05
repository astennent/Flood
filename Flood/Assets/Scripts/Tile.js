#pragma strict

class Tile {

   private var m_tileObject : TileObject;
   private var m_colorIndex : int = -1;
   private var m_originalColor : int = -1;
   
   private var gridPosition : Vector2;

   function Tile(x : int, y : int, size : int, rotation : Quaternion, numColors : int) {
      m_tileObject = TileObject.Instantiate(x, y, size, rotation, numColors);
      gridPosition = new Vector2(x,y);
      m_originalColor = (Random.Range(0.0, 1.0) * numColors);
      m_colorIndex = m_originalColor; 
      m_tileObject.setColor(m_originalColor, Random.Range(0, 0.5));
   }

   function Tile(x : int, y : int, color : int) {
      m_originalColor = color;
      m_colorIndex = color;
      gridPosition = new Vector2(x,y);
   }

   function Destroy() {
      TileObject.Destroy(m_tileObject);
   }

   public function revert() {
      m_colorIndex = m_originalColor;
      if (m_tileObject) {
         m_tileObject.setColor(m_originalColor, 0);
      }
   }

   public function getColor() {
      return m_colorIndex;
   }

   public function x() {
      return gridPosition.x;
   }
   public function y() {
      return gridPosition.y;
   }

   public function decreaseAnimationDelay(delay : float) {
      if (m_tileObject) {
         m_tileObject.decreaseAnimationDelay(delay);
      }
   }

   public function setColor(colorIndex : int, clickOrigin : Vector2) {
      m_colorIndex = colorIndex;
      // TODO: Don't flip if you're already the right color
      var animationDelay : float = Vector2.Distance(gridPosition, clickOrigin)/30.0;
      if (m_tileObject) {
         m_tileObject.setColor(colorIndex, animationDelay);
      }
      return animationDelay;
   }

   public function OnThemeChange() {
      m_tileObject.setColor(m_colorIndex, Random.Range(0.0, 1.0));
   }

}