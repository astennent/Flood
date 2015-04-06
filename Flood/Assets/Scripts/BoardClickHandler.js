#pragma strict

private var m_board : Board;

function Start() {
   m_board = GetComponent.<Board>();
}

function OnMouseDown() {
   var zPosition = -Camera.main.transform.position.z; // distance from camera to 0.
   var mousePosition = Input.mousePosition;
   mousePosition.y = Screen.height - mousePosition.y; // Stupid unity.
   var position = Camera.main.ScreenToWorldPoint(new Vector3(mousePosition.x, mousePosition.y, zPosition));

   // position is a point between -5 and 5 on the x and y axes, and 0 for z. We don't care about z, 
   // and want to scale the -5 to 5 into tile coordinates.

   var size = m_board.GetSize();
   var tileX = (position.x + 5) * size / 10.0;
   var tileY = (position.y + 5) * size / 10.0;

   m_board.ProcessClick(tileX, tileY);
}