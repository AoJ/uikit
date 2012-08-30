@echo off

del build\ui.css
del build\ui.js
mkdir build
touch build\ui.css
touch build\ui.js
node index.js emitter dialog overlay alert confirmation notification menu card tabs interactivedialog select ko-notes