/* It is faster to store a list of pre-made materials and swap them out when needed than to create
   a new material every time a Tile is instantiated or flipped. So we store the list of all 
   usable colors as materials here, where the materials can be accessed quickly at runtime. */
public static var colorMaterials : List.<Material>;
public static var colors : Color[];
public var starColors : List.<Color>;

private static var THEME_KEY = "theme";
private static var s_instance : ColorController;

var board : Board;
var themes : ThemeButton[];

function Start() {
   s_instance = this;
   var savedThemeIndex = PlayerPrefs.GetInt(THEME_KEY);
   var defaultTheme = themes[savedThemeIndex];
   RefreshColorMaterials(defaultTheme.colors, defaultTheme.material);
   UpdateThemeButtonSelection();
}

static function RefreshColorMaterials(colors : Color[], material : Material) {
   colorMaterials = new List.<Material>();
   for (var i = 0 ; i < colors.length ; i++) {
      colorMaterials.Add(new Material(material));
      colorMaterials[i].SetColor("_Color", colors[i]);
   }
}

public function SetColors(themeButton : ThemeButton) {
   for (var i = 0 ; i < themes.length ; ++i) {
      if (themeButton == themes[i]) {
         PlayerPrefs.SetInt(THEME_KEY, i);
      } 
   }
   RefreshColorMaterials(themeButton.colors, themeButton.material);
   board.OnThemeChange();
   UpdateThemeButtonSelection();
}

private function UpdateThemeButtonSelection() {
   var theme_key = PlayerPrefs.GetInt(THEME_KEY);
   for (var i = 0 ; i < themes.length ; ++i) {
      themes[i].SetSelected(theme_key == i);
   }
}

static function GetStarColor(numColors : int) {
   return s_instance.starColors[numColors];
}