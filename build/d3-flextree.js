(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (factory());
}(this, function () { 'use strict';

    function count(node) {
      var sum = 0,
          children = node.children,
          i = children && children.length;
      if (!i) sum = 1;
      else while (--i >= 0) sum += children[i].value;
      node.value = sum;
    }

    function node_count() {
      return this.eachAfter(count);
    }

    function node_each(callback) {
      var node = this, current, next = [node], children, i, n;
      do {
        current = next.reverse(), next = [];
        while (node = current.pop()) {
          callback(node), children = node.children;
          if (children) for (i = 0, n = children.length; i < n; ++i) {
            next.push(children[i]);
          }
        }
      } while (next.length);
      return this;
    }

    function node_eachBefore(callback) {
      var node = this, nodes = [node], children, i;
      while (node = nodes.pop()) {
        callback(node), children = node.children;
        if (children) for (i = children.length - 1; i >= 0; --i) {
          nodes.push(children[i]);
        }
      }
      return this;
    }

    function node_eachAfter(callback) {
      var node = this, nodes = [node], next = [], children, i, n;
      while (node = nodes.pop()) {
        next.push(node), children = node.children;
        if (children) for (i = 0, n = children.length; i < n; ++i) {
          nodes.push(children[i]);
        }
      }
      while (node = next.pop()) {
        callback(node);
      }
      return this;
    }

    function node_sum(value) {
      return this.eachAfter(function(node) {
        var sum = +value(node.data) || 0,
            children = node.children,
            i = children && children.length;
        while (--i >= 0) sum += children[i].value;
        node.value = sum;
      });
    }

    function node_sort(compare) {
      return this.eachBefore(function(node) {
        if (node.children) {
          node.children.sort(compare);
        }
      });
    }

    function node_path(end) {
      var start = this,
          ancestor = leastCommonAncestor(start, end),
          nodes = [start];
      while (start !== ancestor) {
        start = start.parent;
        nodes.push(start);
      }
      var k = nodes.length;
      while (end !== ancestor) {
        nodes.splice(k, 0, end);
        end = end.parent;
      }
      return nodes;
    }

    function leastCommonAncestor(a, b) {
      if (a === b) return a;
      var aNodes = a.ancestors(),
          bNodes = b.ancestors(),
          c = null;
      a = aNodes.pop();
      b = bNodes.pop();
      while (a === b) {
        c = a;
        a = aNodes.pop();
        b = bNodes.pop();
      }
      return c;
    }

    function node_ancestors() {
      var node = this, nodes = [node];
      while (node = node.parent) {
        nodes.push(node);
      }
      return nodes;
    }

    function node_descendants() {
      var nodes = [];
      this.each(function(node) {
        nodes.push(node);
      });
      return nodes;
    }

    function node_leaves() {
      var leaves = [];
      this.eachBefore(function(node) {
        if (!node.children) {
          leaves.push(node);
        }
      });
      return leaves;
    }

    function node_links() {
      var root = this, links = [];
      root.each(function(node) {
        if (node !== root) { // Don’t include the root’s parent, if any.
          links.push({source: node.parent, target: node});
        }
      });
      return links;
    }

    function hierarchy(data, children) {
      var root = new Node(data),
          valued = +data.value && (root.value = data.value),
          node,
          nodes = [root],
          child,
          childs,
          i,
          n;

      if (children == null) children = defaultChildren;

      while (node = nodes.pop()) {
        if (valued) node.value = +node.data.value;
        if ((childs = children(node.data)) && (n = childs.length)) {
          node.children = new Array(n);
          for (i = n - 1; i >= 0; --i) {
            nodes.push(child = node.children[i] = new Node(childs[i]));
            child.parent = node;
            child.depth = node.depth + 1;
          }
        }
      }

      return root.eachBefore(computeHeight);
    }

    function node_copy() {
      return hierarchy(this).eachBefore(copyData);
    }

    function defaultChildren(d) {
      return d.children;
    }

    function copyData(node) {
      node.data = node.data.data;
    }

    function computeHeight(node) {
      var height = 0;
      do node.height = height;
      while ((node = node.parent) && (node.height < ++height));
    }

    function Node(data) {
      this.data = data;
      this.depth =
      this.height = 0;
      this.parent = null;
    }

    Node.prototype = hierarchy.prototype = {
      constructor: Node,
      count: node_count,
      each: node_each,
      eachAfter: node_eachAfter,
      eachBefore: node_eachBefore,
      sum: node_sum,
      sort: node_sort,
      path: node_path,
      ancestors: node_ancestors,
      descendants: node_descendants,
      leaves: node_leaves,
      links: node_links,
      copy: node_copy
    };

    function treemapDice(parent, x0, y0, x1, y1) {
      var nodes = parent.children,
          node,
          i = -1,
          n = nodes.length,
          k = parent.value && (x1 - x0) / parent.value;

      while (++i < n) {
        node = nodes[i], node.y0 = y0, node.y1 = y1;
        node.x0 = x0, node.x1 = x0 += node.value * k;
      }
    }

    function treemapSlice(parent, x0, y0, x1, y1) {
      var nodes = parent.children,
          node,
          i = -1,
          n = nodes.length,
          k = parent.value && (y1 - y0) / parent.value;

      while (++i < n) {
        node = nodes[i], node.x0 = x0, node.x1 = x1;
        node.y0 = y0, node.y1 = y0 += node.value * k;
      }
    }

    var phi = (1 + Math.sqrt(5)) / 2;

    function squarifyRatio(ratio, parent, x0, y0, x1, y1) {
      var rows = [],
          nodes = parent.children,
          row,
          nodeValue,
          i0 = 0,
          i1 = 0,
          n = nodes.length,
          dx, dy,
          value = parent.value,
          sumValue,
          minValue,
          maxValue,
          newRatio,
          minRatio,
          alpha,
          beta;

      while (i0 < n) {
        dx = x1 - x0, dy = y1 - y0;

        // Find the next non-empty node.
        do sumValue = nodes[i1++].value; while (!sumValue && i1 < n);
        minValue = maxValue = sumValue;
        alpha = Math.max(dy / dx, dx / dy) / (value * ratio);
        beta = sumValue * sumValue * alpha;
        minRatio = Math.max(maxValue / beta, beta / minValue);

        // Keep adding nodes while the aspect ratio maintains or improves.
        for (; i1 < n; ++i1) {
          sumValue += nodeValue = nodes[i1].value;
          if (nodeValue < minValue) minValue = nodeValue;
          if (nodeValue > maxValue) maxValue = nodeValue;
          beta = sumValue * sumValue * alpha;
          newRatio = Math.max(maxValue / beta, beta / minValue);
          if (newRatio > minRatio) { sumValue -= nodeValue; break; }
          minRatio = newRatio;
        }

        // Position and record the row orientation.
        rows.push(row = {value: sumValue, dice: dx < dy, children: nodes.slice(i0, i1)});
        if (row.dice) treemapDice(row, x0, y0, x1, value ? y0 += dy * sumValue / value : y1);
        else treemapSlice(row, x0, y0, value ? x0 += dx * sumValue / value : x1, y1);
        value -= sumValue, i0 = i1;
      }

      return rows;
    }

    (function custom(ratio) {

      function squarify(parent, x0, y0, x1, y1) {
        squarifyRatio(ratio, parent, x0, y0, x1, y1);
      }

      squarify.ratio = function(x) {
        return custom((x = +x) > 1 ? x : 1);
      };

      return squarify;
    })(phi);

    (function custom(ratio) {

      function resquarify(parent, x0, y0, x1, y1) {
        if ((rows = parent._squarify) && (rows.ratio === ratio)) {
          var rows,
              row,
              nodes,
              i,
              j = -1,
              n,
              m = rows.length,
              value = parent.value;

          while (++j < m) {
            row = rows[j], nodes = row.children;
            for (i = row.value = 0, n = nodes.length; i < n; ++i) row.value += nodes[i].value;
            if (row.dice) treemapDice(row, x0, y0, x1, y0 += (y1 - y0) * row.value / value);
            else treemapSlice(row, x0, y0, x0 += (x1 - x0) * row.value / value, y1);
            value -= row.value;
          }
        } else {
          parent._squarify = rows = squarifyRatio(ratio, parent, x0, y0, x1, y1);
          rows.ratio = ratio;
        }
      }

      resquarify.ratio = function(x) {
        return custom((x = +x) > 1 ? x : 1);
      };

      return resquarify;
    })(phi);

    // Node-link tree diagram using the Reingold-Tilford "tidy" algorithm,
    // as improved by A.J. van der Ploeg, 2013, "Drawing Non-layered Tidy
    // Trees in Linear Time".
    function flextree() {

        // The spacing between nodes can be specified in one of two ways:
        // - separation - returns center-to-center distance
        //   in units of root-node-x-size
        // - spacing - returns edge-to-edge distance in the same units as
        //   node sizes
        var separation = defaultTreeSeparation;
        var spacing = null;
        var size = [1, 1]; // xSize, ySize
        var nodeSize = null;

        // This stores the xSize of the root node, for use with the spacing
        // function
        var wroot = null;

        // The main layout function:
        function flextree(root) {
            var wt = wrapTree(root);

            wroot = wt;
            zerothWalk(wt, 0);
            firstWalk(wt);
            secondWalk(wt, 0);
            renormalize(wt);

            return root;
        }

        function TreeNode(node) {
            this.t = node;
            this.prelim = 0;
            this.mod = 0;
            this.shift = 0;
            this.change = 0;
            this.msel = 0;
            this.mser = 0;

            node.x = 0;
            node.y = 0;

            if (size) {
                this.xSize = 1;
                this.ySize = 1;
            } else if (Array.isArray(nodeSize)) {
                this.xSize = nodeSize[0];
                this.ySize = nodeSize[1];
            } else {
                var ns = nodeSize(node);
                this.xSize = ns[0];
                this.ySize = ns[1];
            }

            this.children = [];
            this.numChildren = 0;
        }

        TreeNode.prototype = Object.create(hierarchy.prototype);

        // Every node in the tree is wrapped in an object that holds data
        // used during the algorithm
        function wrapTree(t) {
            var wt = new TreeNode(t);

            var children = wt.children;
            var numChildren = t.children ? t.children.length : 0;
            for (var i = 0; i < numChildren; ++i) {
                children.push(wrapTree(t.children[i]));
            }
            wt.numChildren = numChildren;

            return wt;
        }

        // Recursively set the y coordinate of the children, based on
        // the y coordinate of the parent, and its height. Also set parent
        // and depth.
        function zerothWalk(wt, initial) {
            wt.t.y = initial;
            _zerothWalk(wt);
        }

        function _zerothWalk(wt) {
            var kid_y = wt.t.y + wt.ySize,
                i;
            for (i = 0; i < wt.children.length; ++i) {
                var kid = wt.children[i];
                kid.t.y = kid_y;
                _zerothWalk(wt.children[i]);
            }
        }

        function firstWalk(wt) {
            if (wt.numChildren === 0) {
                setExtremes(wt);
                return;
            }
            firstWalk(wt.children[0]);

            var ih = updateIYL(bottom(wt.children[0].el), 0, null);

            for (var i = 1; i < wt.numChildren; ++i) {
                firstWalk(wt.children[i]);

                // Store lowest vertical coordinate while extreme nodes still point
                // in current subtree.
                var minY = bottom(wt.children[i].er);
                separate(wt, i, ih);
                ih = updateIYL(minY, i, ih);
            }
            positionRoot(wt);
            setExtremes(wt);
        }

        function setExtremes(wt) {
            if (wt.numChildren === 0) {
                wt.el = wt;
                wt.er = wt;
                wt.msel = wt.mser = 0;
            } else {
                wt.el = wt.children[0].el;
                wt.msel = wt.children[0].msel;
                wt.er = wt.children[wt.numChildren - 1].er;
                wt.mser = wt.children[wt.numChildren - 1].mser;
            }
        }

        function separate(wt, i, ih) {
            // Right contour node of left siblings and its sum of modifiers.
            var sr = wt.children[i - 1];
            var mssr = sr.mod;

            // Left contour node of current subtree and its sum of modifiers.
            var cl = wt.children[i];
            var mscl = cl.mod;

            while (sr !== undefined && cl !== undefined) {
                if (bottom(sr) > ih.lowY) ih = ih.nxt;

                // How far to the left of the right side of sr is the left side
                // of cl? First compute the center-to-center distance, then add
                // the "gap" (separation or spacing)
                var dist = mssr + sr.prelim - (mscl + cl.prelim);
                if (separation !== null) {
                    dist += separation(sr.t, cl.t) * wroot.xSize;
                } else if (spacing !== null) {
                    dist += sr.xSize / 2 + cl.xSize / 2 + spacing(sr.t, cl.t);
                }
                if (dist > 0) {
                    mscl += dist;
                    moveSubtree(wt, i, ih.index, dist);
                }

                // Fix for layout bug, https://github.com/Klortho/d3-flextree/issues/1,
                // HT @lianyi
                else if (i === 1 && mscl === 0 && sr.numChildren === 0 && cl.numChildren > 1 && dist < 0) {
                        mscl += dist;
                        moveSubtree(wt, i, ih.index, dist);
                    }

                var sy = bottom(sr);
                var cy = bottom(cl);

                // Advance highest node(s) and sum(s) of modifiers
                if (sy <= cy) {
                    sr = nextRightContour(sr);
                    if (sr !== undefined) mssr += sr.mod;
                }
                if (sy >= cy) {
                    cl = nextLeftContour(cl);
                    if (cl !== undefined) mscl += cl.mod;
                }
            }

            // Set threads and update extreme nodes. In the first case, the
            // current subtree must be taller than the left siblings.
            if (sr === undefined && cl !== undefined) setLeftThread(wt, i, cl, mscl);

            // In this case, the left siblings must be taller than the current
            // subtree.
            else if (sr !== undefined && cl === undefined) setRightThread(wt, i, sr, mssr);
        }

        function moveSubtree(wt, i, si, dist) {
            // Move subtree by changing mod.
            wt.children[i].mod += dist;
            wt.children[i].msel += dist;
            wt.children[i].mser += dist;
            distributeExtra(wt, i, si, dist);
        }

        function nextLeftContour(wt) {
            return wt.numChildren === 0 ? wt.tl : wt.children[0];
        }

        function nextRightContour(wt) {
            return wt.numChildren === 0 ? wt.tr : wt.children[wt.numChildren - 1];
        }

        function bottom(wt) {
            return wt.t.y + wt.ySize;
        }

        function setLeftThread(wt, i, cl, modsumcl) {
            var li = wt.children[0].el;
            li.tl = cl;

            // Change mod so that the sum of modifier after following thread
            // is correct.
            var diff = modsumcl - cl.mod - wt.children[0].msel;
            li.mod += diff;

            // Change preliminary x coordinate so that the node does not move.
            li.prelim -= diff;

            // Update extreme node and its sum of modifiers.
            wt.children[0].el = wt.children[i].el;
            wt.children[0].msel = wt.children[i].msel;
        }

        // Symmetrical to setLeftThread.
        function setRightThread(wt, i, sr, modsumsr) {
            var ri = wt.children[i].er;
            ri.tr = sr;
            var diff = modsumsr - sr.mod - wt.children[i].mser;
            ri.mod += diff;
            ri.prelim -= diff;
            wt.children[i].er = wt.children[i - 1].er;
            wt.children[i].mser = wt.children[i - 1].mser;
        }

        // Position root between children, taking into account their mod.
        function positionRoot(wt) {
            wt.prelim = (wt.children[0].prelim + wt.children[0].mod - wt.children[0].xSize / 2 + wt.children[wt.numChildren - 1].mod + wt.children[wt.numChildren - 1].prelim + wt.children[wt.numChildren - 1].xSize / 2) / 2;
        }

        function secondWalk(wt, modsum) {
            modsum += wt.mod;
            // Set absolute (non-relative) horizontal coordinate.
            wt.t.x = wt.prelim + modsum;
            addChildSpacing(wt);
            for (var i = 0; i < wt.numChildren; i++) {
                secondWalk(wt.children[i], modsum);
            }
        }

        function distributeExtra(wt, i, si, dist) {
            // Are there intermediate children?
            if (si !== i - 1) {
                var nr = i - si;
                wt.children[si + 1].shift += dist / nr;
                wt.children[i].shift -= dist / nr;
                wt.children[i].change -= dist - dist / nr;
            }
        }

        // Process change and shift to add intermediate spacing to mod.
        function addChildSpacing(wt) {
            var d = 0,
                modsumdelta = 0;
            for (var i = 0; i < wt.numChildren; i++) {
                d += wt.children[i].shift;
                modsumdelta += d + wt.children[i].change;
                wt.children[i].mod += modsumdelta;
            }
        }

        // Make/maintain a linked list of the indexes of left siblings and their
        // lowest vertical coordinate.
        function updateIYL(minY, i, ih) {
            // Remove siblings that are hidden by the new subtree.
            while (ih !== null && minY >= ih.lowY) ih = ih.nxt;
            // Prepend the new subtree.
            return {
                lowY: minY,
                index: i,
                nxt: ih
            };
        }

        // Renormalize the coordinates
        function renormalize(wt) {

            // If a fixed tree size is specified, scale x and y based on the extent.
            // Compute the left-most, right-most, and depth-most nodes for extents.
            if (size !== null) {
                var left = wt,
                    right = wt,
                    bottom = wt;
                var toVisit = [wt],
                    node;
                while (node = toVisit.pop()) {
                    var t = node.t;
                    if (t.x < left.t.x) left = node;
                    if (t.x > right.t.x) right = node;
                    if (t.depth > bottom.t.depth) bottom = node;
                    if (node.children) toVisit = toVisit.concat(node.children);
                }

                var sep = separation === undefined ? 0.5 : separation(left.t, right.t) / 2;
                var tx = sep - left.t.x;
                var kx = size[0] / (right.t.x + sep + tx);
                var ky = size[1] / (bottom.t.depth > 0 ? bottom.t.depth : 1);

                toVisit = [wt];
                while (node = toVisit.pop()) {
                    var t = node.t;
                    t.x = (t.x + tx) * kx;
                    t.y = t.depth * ky;
                    if (node.children) toVisit = toVisit.concat(node.children);
                }
            }

            // Else either a fixed node size, or node size function was specified.
            // In this case, we translate such that the root node is at x = 0.
            else {
                    var rootX = wt.t.x;
                    moveRight(wt, -rootX);
                }
        }

        function moveRight(wt, move) {
            wt.t.x += move;
            for (var i = 0; i < wt.numChildren; ++i) {
                moveRight(wt.children[i], move);
            }
        }

        // Setter and getter methods

        flextree.separation = function (x) {
            if (!arguments.length) return separation;
            separation = x;
            spacing = null;
            return flextree;
        };

        flextree.spacing = function (x) {
            if (!arguments.length) return spacing;
            spacing = x;
            separation = null;
            return flextree;
        };

        flextree.size = function (x) {
            if (!arguments.length) return size;
            size = x;
            nodeSize = null;
            return flextree;
        };

        flextree.nodeSize = function (x) {
            if (!arguments.length) return nodeSize;
            nodeSize = x;
            size = null;
            return flextree;
        };

        return flextree;
    }

    function defaultTreeSeparation(a, b) {
        return a.parent === b.parent ? 1 : 2;
    }

    module.exports = flextree;

}));