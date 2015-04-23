#pragma strict

private static var deltaPosition = Vector2.zero;
private static var inputFrozen = false;
private static var inputFreezeTime = 1.0;
static var inputFreezeDelay : float = 0.0;
static var sensitivity = 10;

static var NONE = -1;
static var UP = 0;
static var DOWN = 1;
static var LEFT = 2;
static var RIGHT = 3;

static function getInputDirection() {
	if (inputFrozen && Time.time - inputFreezeTime > inputFreezeDelay) {
		unfreezeInput();
	}

	if(Input.GetKeyDown(KeyCode.UpArrow)) {
		return (UP);
	} 
	if (Input.GetKeyDown(KeyCode.DownArrow)) {
		return (DOWN);
	}
	if (Input.GetKeyDown(KeyCode.LeftArrow)) {
		return (LEFT);
	}
	if (Input.GetKeyDown(KeyCode.RightArrow)) {
		return (RIGHT);
	}

	if (Input.touchCount == 0) {
		unfreezeInput();
	}

	if (Input.touchCount > 0 && !inputFrozen)  {
		var touch = Input.GetTouch(0);
		deltaPosition += touch.deltaPosition;
 		if (deltaPosition.x > sensitivity || deltaPosition.x < -sensitivity || deltaPosition.y > sensitivity || deltaPosition.y < -sensitivity) {
 			return extractDirection();
 		}
	} 

	return NONE;
}

static function freezeInput() {
	inputFrozen = true;
	inputFreezeTime = Time.time;
}

static function unfreezeInput() {
	inputFrozen = false;
	deltaPosition = Vector2.zero;

}

static function extractDirection() {
	if (Mathf.Pow(deltaPosition.x, 2) > Mathf.Pow(deltaPosition.y, 2)) {
		var direction: int;
		if (deltaPosition.x > 0) {
			direction = RIGHT;
		} else {
			direction = LEFT;
		}
	} else {
		if (deltaPosition.y > 0) {
			direction = UP;
		} else {
			direction = DOWN;
		}
	}
	Debug.Log(direction);
	freezeInput();
	deltaPosition = Vector2.zero;
	return direction;
}