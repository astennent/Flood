#pragma strict

var myCamera : Camera;

function Start () {
   myCamera = GetComponent.<Camera>();
   var p1 = new Vector3(-7, -5.5, 0);
   var p2 = new Vector3(7, 5.5, 0);

   var precision = 0.01;
   ZoomToPoints(p1, p2, precision);
}

function IsPointVisible(point : Vector3) {
   var viewportPoint = myCamera.WorldToViewportPoint(point);
   return (viewportPoint.z > 0 && (new Rect(0, 0, 1, 1)).Contains(viewportPoint));
}

function ZoomToPoints(point1 : Vector3, point2 : Vector3, precision : float) {
   
   // Focus the camera at the center of the two points.
   var closePoint = (point1 + point2)/2;
   transform.LookAt(closePoint, transform.up);

   //Zoom out until both points are visible by the camera.
   while (!IsPointVisible(point1) || !IsPointVisible(point2)) {
      transform.position -= 50 * transform.forward;
   }


   // Binary search to the given precision
   var farPoint = transform.position;
   while (Vector3.Distance(closePoint, farPoint) > precision) {
      var midPoint = (farPoint + closePoint)/2;
      transform.position = midPoint;
      if (IsPointVisible(point1) && IsPointVisible(point2)) {
         farPoint = midPoint;
      } else {
         closePoint = midPoint;
      }
   }

}

// This doesn't really go on the camera, but I don't want to make a GameController.
function Update() {
   if (Input.GetKeyDown(KeyCode.Escape)) { 
      Application.Quit();
   }
}