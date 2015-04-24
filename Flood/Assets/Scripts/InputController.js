#pragma strict

private static var lastMousePosition = Vector2.zero;
private static var deltaPosition = Vector2.zero;
private static var mouseDeltaPosition = Vector2.zero;
private static var inputFrozen = false;
private static var inputFreezeTime = 1.0;
static var inputFreezeDelay : float = 0.0;
static var sensitivity = 10;
static var mouseSensitivity = 5;

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
		return UP;
	} 
	if (Input.GetKeyDown(KeyCode.DownArrow)) {
		return DOWN;
	}
	if (Input.GetKeyDown(KeyCode.LeftArrow)) {
		return LEFT;
	}
	if (Input.GetKeyDown(KeyCode.RightArrow)) {
		return RIGHT;
	}

	if (Input.touchCount == 0 || Input.GetMouseButtonUp(0)) {
		unfreezeInput();
	}

	if (inputFrozen) {
		return NONE;
	}

	if (Input.GetMouseButtonDown(0)) {
		mouseDeltaPosition = Vector2.zero;
	}

	if (Input.touchCount > 0)  {
		var touch = Input.GetTouch(0);
		deltaPosition /= 2.0;
		deltaPosition += touch.deltaPosition;
	} else if (Input.GetMouseButton(0)) {
		mouseDeltaPosition /= 2.0; // fade old values.
		mouseDeltaPosition += Input.mousePosition-lastMousePosition;
		lastMousePosition = Input.mousePosition;
	}

	var extractTouchDirection = (Input.touchCount == 0 && deltaPosition.magnitude > sensitivity);
	if (extractTouchDirection) {
		return extractDirection(true);
	}

	var extractMouseDirection = (Input.GetMouseButtonUp(0) && mouseDeltaPosition.magnitude > sensitivity);
	if (extractMouseDirection) {
		return extractDirection(false);
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

static function extractDirection(useTouch : boolean) {
	var delta = (useTouch) ? deltaPosition : mouseDeltaPosition;
	Debug.Log(delta);
	if (Mathf.Pow(delta.x, 2) > Mathf.Pow(delta.y, 2)) {
		var direction: int;
		if (delta.x > 0) {
			direction = RIGHT;
		} else {
			direction = LEFT;
		}
	} else {
		if (delta.y > 0) {
			direction = UP;
		} else {
			direction = DOWN;
		}
	}
	freezeInput();
	deltaPosition = Vector2.zero;
	return direction;
}