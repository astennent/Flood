/* It is faster to store a list of pre-made materials and swap them out when needed than to create
   a new material every time a Tile is instantiated or flipped. So we store the list of all 
   usable colors as materials here, where the materials can be accessed quickly at runtime. */
public static var colorMaterials : List.<Material>;
public static var colors : Color[];
private static var THEME_KEY = "theme";

var board : Board;
var themes : ThemeButton[];
function Start() {
   var savedThemeIndex = PlayerPrefs.GetInt(THEME_KEY);
   var defaultTheme = themes[savedThemeIndex];
   RefreshColorMaterials(defaultTheme.colors, defaultTheme.material);
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
         break;
      }
   }
   RefreshColorMaterials(themeButton.colors, themeButton.material);
   board.OnThemeChange();
}