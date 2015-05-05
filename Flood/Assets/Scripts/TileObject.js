#pragma strict
class TileObject extends MonoBehaviour {

   public var m_front : Renderer;
   public var m_back : Renderer;

   private var desiredRotation : Quaternion;
   private var flipStartTime : float = 0;
  
   // Update is called once per frame
   function Update () {
     UpdateFlipPosition();
   }

   public static function Destroy(tile : TileObject) {
      GameObject.Destroy(tile.gameObject);
   }

   public static function Instantiate(x : int, y : int, size : int, rotation : Quaternion, numColors : int) {
      var tile = GameObject.Instantiate(Prefabs.getTilePrefab(), Vector3.zero, rotation);
      
      tile.transform.localScale /= size;
      var adjust = size/2;

      var xPosition = x - adjust;
      var yPosition = y - adjust;
      tile.transform.position += Vector3.right * (xPosition) / size * 10;
      tile.transform.position += -Vector3.up * (yPosition) / size * 10;

      tile.desiredRotation = tile.transform.rotation;

      return tile;
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
   public function setColor(colorIndex : int, animationDelay : float) {
      if (Mathf.Abs(transform.position.z) > .005) {
         transform.position.z = 0;
      }

      // set up rotation.
      transform.rotation = desiredRotation;
      transform.Rotate(Vector3.forward, 180);
      desiredRotation = transform.rotation;
      transform.Rotate(Vector3.forward, 180);

      m_back.material = ColorController.colorMaterials[colorIndex];

      flipStartTime = Time.time + animationDelay;

      // Ensure this is enabled (it probably is not, unless the user is clicking really fast)
      m_back.enabled = true;
      
      // Swap back and front.
      var temp = m_front;
      m_front = m_back;
      m_back = temp;
   }



}
