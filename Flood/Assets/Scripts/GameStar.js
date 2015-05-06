#pragma strict

var index : int;

function UpdateForNumStars(level : Level, numStars : int) {
   var active = (index < numStars);
   var alpha = (level == null) ? 0
      : active ? 1
      : .5;

   var color = (active) ? ColorController.GetStarColor(numStars) : Color.white;
   color.a = alpha;
   GetComponent.<UnityEngine.UI.Image>().color = color;
}