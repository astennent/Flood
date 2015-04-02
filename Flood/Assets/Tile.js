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

   var directionChangeTime : float = 0;
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
   private function setZ(z : float) {
      if (Mathf.Abs(transform.position.z - z) > .01) {
         transform.position.z = z;
      }
   }

   function UpdateFlipPosition() {


      if (Time.time - directionChangeTime > .25) {
         setZ(Mathf.Lerp(transform.position.z, 0, .3));
      } 
      else if (Time.time - directionChangeTime > 0) { 
         setZ(Mathf.Lerp(transform.position.z, -1, .3));
      }

      if (Time.time - flipStartTime > 0) {
         transform.rotation = Quaternion.Lerp(transform.rotation, desiredRotation, .2);
      }
   }

   public function decreaseAnimationDelay(delay : float) {
      directionChangeTime -= delay;
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
      directionChangeTime = Time.time + animationDelay;
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
