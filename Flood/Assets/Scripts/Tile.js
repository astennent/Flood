#pragma strict
class Tile extends MonoBehaviour {

   public var m_front : Renderer;
   public var m_back : Renderer;

   private var desiredRotation : Quaternion;
   var m_originalColor : int = -1;
   var m_colorIndex : int = -1;

   var m_board : Board;
   private var gridPosition : Vector2;

   var flipStartTime : float = 0;
  
   // Update is called once per frame
   function Update () {
     UpdateFlipPosition();
	}

   public static function Destroy(tile : Tile) {
      GameObject.Destroy(tile.gameObject);
   }

   public static function Instantiate(board : Board, x : int, y : int, numColors : int) {
      var tile = GameObject.Instantiate(Prefabs.getTilePrefab(), Vector3.zero, board.transform.rotation);
      tile.Initialize(board, x, y, numColors);
      return tile;
   }

   private function Initialize(board : Board, x : int, y : int, numColors : int) {
      m_board = board;
      gridPosition = new Vector2(x,y);
      desiredRotation = transform.rotation;
      m_originalColor = (Random.Range(0, 1.0) * numColors);
      setColor(m_originalColor, Vector2.zero);
   }

   private function updateZ(elapsedTime : float) {
      // The "set position" operation is relatively expensive compared to get position,
      // So we perform a check that will only update position if necessary.
      var desiredZ = (elapsedTime > .25) ? 0 : -1;
      var currentZ = transform.position.z;
      if (desiredZ == currentZ) {
         return;
      }

      if (Mathf.Abs(currentZ - desiredZ) < .1) {
         transform.position.z = desiredZ;
      } else {
         transform.position.z = Mathf.Lerp(currentZ, desiredZ, elapsedTime*1.2);
      } 
   }

   private function updateRotation(elapsedTime : float) {
      // "set rotation" benefits from a similar optimization as position.
      if (Quaternion.Angle(transform.rotation, desiredRotation) > .01) { 
         transform.rotation = Quaternion.Lerp(transform.rotation, desiredRotation, elapsedTime*1.5);
      } else {
         transform.rotation = desiredRotation;
         m_back.enabled = false;
      }
   }

   function UpdateFlipPosition() {
      var elapsedTime = Time.time - flipStartTime;
      if (elapsedTime > 0) {
         updateZ(elapsedTime);
         if (m_back.enabled) {
            updateRotation(elapsedTime);
         }
      }
   }

   public function decreaseAnimationDelay(delay : float) {
      flipStartTime -= delay;
   }

   // Returns the time offset so that the board can avoid delay when clicking far away.
   public function setColor(colorIndex : int, clickOrigin : Vector2) {
      if (Mathf.Abs(transform.position.z) > .005) {
         transform.position.z = 0;
      }

      // set up rotation.
      transform.rotation = desiredRotation;
      transform.Rotate(Vector3.forward, 180);
      desiredRotation = transform.rotation;
      transform.Rotate(Vector3.forward, 180);

      m_back.material = ColorController.colorMaterials[colorIndex];

      var animationDelay = Vector2.Distance(gridPosition, clickOrigin)/30.0;
      flipStartTime = Time.time + animationDelay;

      // Ensure this is enabled (it probably is not, unless the user is clicking really fast)
      m_back.enabled = true;
      
      // Swap back and front.
      var temp = m_front;
      m_front = m_back;
      m_back = temp;

      // Don't flip if you're already the right color
      if (m_colorIndex == colorIndex) {
         transform.rotation = desiredRotation;
      } else {
         m_colorIndex = colorIndex;
      }

      return animationDelay;
   }

   public function revert() {
      setColor(m_originalColor, Vector2.zero);
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
}
