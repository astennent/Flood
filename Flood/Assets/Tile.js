#pragma strict
class Tile extends MonoBehaviour {

   public var m_front : Renderer;
   public var m_back : Renderer;

   private var desiredRotation : Quaternion;
   var m_colorIndex : int = -1;

   var m_board : Board;
   private var gridPosition : Vector2;

   var flipStartTime : float = 0;
  
   // Update is called once per frame
   function Update () {
     UpdateFlipPosition();
	}

   public function Initialize(board : Board, x : int, y : int, numColors : int) {
      m_board = board;
      gridPosition = new Vector2(x,y);
      desiredRotation = transform.rotation;
      setColor((Random.Range(0, 1.0) * numColors), Vector2.zero);
   }

   function UpdateFlipPosition() {
      var elapsedTime = Time.time - flipStartTime;
      if (elapsedTime > 0) {

         // The "set position" operation is relatively expensive compared to get position,
         // So we perform a check that will only update position if necessary.
         var desiredZ = (elapsedTime > .25) ? 0 : -1;
         if (Mathf.Abs(transform.position.z - desiredZ) > .001) {
            transform.position.z = Mathf.Lerp(transform.position.z, desiredZ, elapsedTime*1.2);
         }

         // "set rotation" benefits from a similar optimization as position.
         if (m_back.enabled) {
            if (Quaternion.Angle(transform.rotation, desiredRotation) > .005) { 
               transform.rotation = Quaternion.Lerp(transform.rotation, desiredRotation, elapsedTime*1.5);
            } else {
               m_back.enabled = false;
            }
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
      //m_back.material.SetColor("_Color", colors[colorIndex]);

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
