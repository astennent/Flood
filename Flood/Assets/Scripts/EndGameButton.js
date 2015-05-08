private static var buttons = new List.<EndGameButton>();
private static var s_hidden = true;

private static var s_displayTime : float = 0;

static function Hide() {
   s_hidden = true;
   for (var button in buttons) {
      button.GetComponent.<UnityEngine.UI.Image>().color.a = 0;
      button.transform.position.y = 10000;
   }
}

static function Display(isZen : boolean) {
   s_hidden = false;
   s_displayTime = Time.time;
   for (var button in buttons) {
      button.m_text.text = (isZen) ? button.zenText : button.levelText;
   }
}

private var m_startPosition : float;
public var m_text : UnityEngine.UI.Text;
public var zenText : String;
public var levelText : String;

function Start() {
   buttons.Add(this);
   m_startPosition = transform.position.y;
   Hide();
}

function Update() {
   if (s_hidden) {
      return;
   }

   var animationDelay = 1.5;
   if (Time.time - s_displayTime < animationDelay) {
      return;
   }

   if (transform.position.y != m_startPosition) {
      transform.position.y = m_startPosition;
   }

   var alpha = Mathf.Clamp(2*(Time.time - animationDelay - s_displayTime), 0.0, 1.0);
   GetComponent.<UnityEngine.UI.Image>().color.a = alpha;
   m_text.color.a = alpha;
}