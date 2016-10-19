

function TripGraphEditor(renderer, graph) {
  this.graph = graph;
  this.renderer = renderer;
  this.applyDelta = undefined;
}

TripGraphEditor.prototype.acceptTouchEvent = function(viewer, world, type) {
  if (type == 'wheel') {
    return false;
  }

  this.startWorldPos = world;
  var clickedLabel = this.findLabelAtWorldPos(world);
  if (clickedLabel) {
    var properties = clickedLabel.properties;
    this.applyDelta = function(delta) {
      properties.labelCoord.x += delta.x;
      properties.labelCoord.y += delta.y;
      properties.labelBbox.min.x += delta.x;
      properties.labelBbox.min.y += delta.y;
      properties.labelBbox.max.x += delta.x;
      properties.labelBbox.max.y += delta.y;
      TripGraph.placeLeaderLine(clickedLabel);
    };
    return true;
  } else {
    var p = this.closestBezier(world);

    var threshold = this.renderer.pinchZoom.worldDistanceFromViewerDistance(
        10 * this.renderer.pixelRatio);

    if (p && p.d < threshold) {
      var pointToMove =  p.edge.controlPoints[p.t < .5 ? 0 : 1];
      this.applyDelta = function(delta) {
        pointToMove.x += delta.x;
        pointToMove.y += delta.y;
      };
      return true;
    }
  }

  this.applyDelta = undefined;
  return false;
};

TripGraphEditor.prototype.handleMouseDown = function(event) {
  event.preventDefault();
};

TripGraphEditor.prototype.handleMouseMove = function(event) {
  event.preventDefault();
  var viewerPos = Utils.eventPosInElementCoordinates(event, event.srcElement);
  this.handleMotion(viewerPos);
}

TripGraphEditor.prototype.handleMotion = function(viewerPos) {
  if (!this.applyDelta) {
    return;
  }

  var worldPos = this.renderer.pinchZoom.worldPosFromViewerPos(
      viewerPos.x, viewerPos.y);

  var delta = {
    x: worldPos.x - this.startWorldPos.x,
    y: worldPos.y - this.startWorldPos.y
  };
  this.startWorldPos = worldPos;

  this.applyDelta(delta);
  this.renderer.refreshIfNotMoving();
};

TripGraphEditor.prototype.handleMouseUp = function(event) {
  event.preventDefault();
  this.applyDelta = undefined;
};

TripGraphEditor.prototype.handleMouseWheel = function(event) {
  event.preventDefault();
};

TripGraphEditor.prototype.handleStart = function(event) {
  event.preventDefault();
};

TripGraphEditor.prototype.handleEnd = function(event) {
  event.preventDefault();
  this.applyDelta = undefined;
};

TripGraphEditor.prototype.handleMove = function(event) {
  event.preventDefault();
  if (event.touches.length != 1) {
    this.applyDelta = undefined;
    return;
  }

  var viewerPos = Utils.eventPosInElementCoordinates(event.touches[0],
                                                     event.srcElement);
  this.handleMotion(viewerPos);
};

TripGraphEditor.prototype.closestBezier = function(p) {
  var nearest;
  for (var i in this.graph.edges) {
    var e = this.graph.edges[i];
    var b = this.graph.bezier(e);
    if (b) {
        var candidate = b.project(p);
        if (!nearest || candidate.d < nearest.d) {
          nearest = candidate;
          nearest.edge = e;
          nearest.bezier = b;
        }
    }
  }
  return nearest;
};
TripGraphEditor.prototype.findLabelAtWorldPos = function(pos) {
  for (var i in this.graph.nodes) {
    var node = this.graph.nodes[i];
    if (node.properties && node.properties.labelBbox
        && bboxContains(node.properties.labelBbox, pos)) {
      return node;
    }
  }
  return undefined;
};

