#pragma strict
class Tile extends MonoBehaviour {

   public var m_front : GameObject;
   public var m_back : GameObject;

   public static var colors = [
      Color.red,
      Color.green,
      Color.blue,
      Color.yellow,
      Color.cyan,
      Color.magenta,
      new Color(1, .4, 0) //orange
   ];

   private var desiredRotation : Quaternion;
   var m_colorIndex : int = -1;

   var m_board : Board;
   private var gridPosition : Vector2;

   var flipStartTime : float = 0;

   function OnMouseDown() {
      m_board.ProcessClick(this);
   }
   
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


   // The "set position" operation is a relatively expensive operation compared to get position,
   // So we perform a check that will only update position if necessary.
   private function approachZ(z : float) {
      if (Mathf.Abs(transform.position.z - z) > .005) {
         transform.position.z = Mathf.Lerp(transform.position.z, z, .3);
      }
   }

   function UpdateFlipPosition() {

      var elapsedTime = Time.time - flipStartTime;
      if (elapsedTime > .25) {
         approachZ(0);
      } 
      else if (elapsedTime > 0) { 
         approachZ(-1);
      }

      // "set rotation" requires a similar optimization as approachZ.
      if (elapsedTime > 0 && 
            Quaternion.Angle(transform.rotation, desiredRotation) > .1) { 
         transform.rotation = Quaternion.Lerp(transform.rotation, desiredRotation, elapsedTime*1.5);
      }
   }

   public function decreaseAnimationDelay(delay : float) {
      flipStartTime -= delay;
   }

   // Returns the time offset so that the board can avoid delay when clicking far away.
   public function setColor(colorIndex : int, clickOrigin : Vector2) {
      transform.rotation = desiredRotation;
      transform.position.z = 0;

      // set up rotation.
      transform.Rotate(Vector3.forward, 180);
      desiredRotation = transform.rotation;
      transform.Rotate(Vector3.forward, 180);


      m_back.GetComponent.<Renderer>().material.color = colors[colorIndex];

      var animationDelay = Vector2.Distance(gridPosition, clickOrigin)/30.0;
      flipStartTime = Time.time + animationDelay;

      // Swap
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
