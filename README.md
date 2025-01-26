# Python Package Definition Navigator

![Demo Image](https://github.com/southglory/python-package-definition-navigator/blob/master/dev_log/demo.png)

![Demo GIF](https://github.com/southglory/python-package-definition-navigator/blob/master/dev_log/demo.gif)

Navigate directly to the definition of methods or classes in your Python virtual environment. This extension makes it easy to locate and open definitions, even for packages that the default Python extension cannot track.

---

## Why was this extension created?

The reason for creating this extension is that, unlike the paid version of PyCharm, VS Code has limited support for Django. For example, when using Python packages like django_bootstrap5 in django-html templates, VS Code does not automatically track the methods or resources being loaded. This limitation prevents developers from navigating freely to the code resources using typical shortcuts like F12 or Ctrl+leftClick.

To address this inconvenience, I developed this extension. It allows developers to simply drag-select a method or class name from a Python package and press a shortcut key to navigate directly to the resource, even when F12 fails to work.

---

## Features

- **Shortcut-based Navigation**:
  Quickly jump to the definition of a method or class in `Lib/site-packages`.

- **Scoped Search**:
  Searches exclusively within your Python virtual environment's `Lib/site-packages` directory.

---

## How to Use

1. **Set a Shortcut**:
   - By default, the shortcut is `Ctrl+1 Ctrl+d`. You can configure this in your VS Code settings if needed.

2. **Highlight a Method or Class Name**:
   - Select the name of the method or class you want to find in the `Lib/site-packages` directory. For example:

     ```python
     {% bootstrap_pagination %}
     ```

3. **Press the Shortcut**:
   - With the text still selected, press the shortcut. The extension will locate the corresponding method or class in your virtual environment and open it directly.

---

## Examples

### Example 1: Navigate to a Definition

- Highlight `bootstrap_pagination` in your Django template:

  ```python
  {% bootstrap_pagination %}
  ```

- Press Ctrl+1 Ctrl+D.
- The extension will open the file django_bootstrap5/templatetags/bootstrap_pagination.py and navigate to the definition of bootstrap_pagination

---

### Example 2: Search for a File

- Highlight 'django_bootstrap5' in your editor:

 ```python
{% load django_bootstrap5 %}
 ```

- Press Ctrl+1 Ctrl+F.
- The extension will search for example.py and example.html in your workspace and virtual environment.
- If multiple matches are found, select the file to open from the quick pick menu.

---

## Keybindings

| Shortcut            | Action                                           |
|---------------------|--------------------------------------------------|
| `Ctrl+1 Ctrl+D`     | Navigate to Python definition in site-packages   |
| `Ctrl+1 Ctrl+F`     | Search for `.py` or `.html` files by name        |

---

## Installation

1. Install the extension from the VS Code Marketplace.
2. Make sure the Python extension (`ms-python.python`) is installed and a virtual environment is activated.

---

## Why Use This?

- The default Python extension often fails to track certain methods or classes in third-party libraries.
- Django developers can quickly navigate between templates and backend code without manually searching files.
- Easily locate files by name, even in large workspaces.

---

## Known Issues

- **Large Virtual Environments**:
  Searching across large `Lib/site-packages` directories may take time. Future versions will optimize performance.
  
- **Limited File Extensions**:
  Currently supports only `.py` and `.html` files for file search.

---

## Future Plans

- Add support for additional file extensions.
- Optimize performance for large virtual environments.
- Enhance definition search to include other patterns like decorators or constants.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/southglory/python-package-definition-navigator).
