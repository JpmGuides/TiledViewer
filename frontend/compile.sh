#!/bin/bash

cd "$( dirname "${BASH_SOURCE[0]}" )"

FILES="utils.js affinetransform.js pinchzoom.js CanvasTilesRenderer.js htmlinterface.js TileLayer.js ScaleLayer.js"

cat $FILES | jsmin > ../mapviewer.min.js
cat $FILES > ../mapviewer.js
