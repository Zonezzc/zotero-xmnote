export async function registerPrefsScripts(_window: Window) {
  // This function is called when the prefs window is opened
  // See addon/content/preferences.xhtml onpaneload
  addon.data.prefs = {
    window: _window,
    columns: [],
    rows: [],
  };

  bindPrefEvents();
}

function bindPrefEvents() {
  // Add event listeners for XMnote preference controls if needed
  // Currently handled by the preferences.ts configuration module
}
