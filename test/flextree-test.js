var tape = require("tape");
var util = require('util');
var flextree = require("../build/d3-flextree.js").flextree;


// This modifies tape's Test.prototype with chai assertions.
// (Reference: http://chaijs.com/api/assert/):
require('tape-chai');


tape("flextree() exports what it should.", function(test) {
  test.isFunction(flextree);

  const tree = flextree();
  test.isFunction(tree);

  test.end();
});


const treeData = [
  // 0
  { name: "root",
    children: [
      {name: "kid0"},
      {name: "kid1"},
      {name: "kid2"}
  ]},

  // 1 - empty children array
  { name: 'root', children: [] },

  // 2 - empty children arrays
  { name: 'root', children: [
    { children: [] },
    { children: [{}] },
    { children: [{}] },
  ]},

  // 3 - small tree
  { name: 'root', width: 1,
    children: [
      { name: 'long', width: 3,
        children: [
          { name: 'leaf0', width: 1, },
          { name: 'leaf1', width: 1, }
        ]
      },
      { name: 'short', width: 1,
        children: [
          { name: 'leaf2', width: 1, }
        ]
      }
    ]
  },
];


tape("computes a simple tree layout", function(test) {
  const engine = flextree();
  const tree = engine(treeData[0]);
  // If needed, you can turn this into an array of nodes with:
  //nodes = engine.hierarchy(tree).descendants;

  test.deepEqual(tree,
    { name: "root", depth: 0, x: 0.5, y: 0,
      children: [
        { name: "kid0", depth: 1, x: 0.16666666666666666, y: 1, },
        { name: "kid1", depth: 1, x: 0.5, y: 1, },
        { name: "kid2", depth: 1, x: 0.8333333333333333, y: 1, },
      ]
    }
  );
  test.end();
});

tape('can handle an empty children array on root', function(test) {
  const engine = flextree();
  const tree = engine(treeData[1]);
  test.deepEqual(tree,
    { name: "root", depth: 0, x:0.5, y: 0, children: [] }
  );
  test.end();
});

tape('can handle an empty children array on children', function(test) {
  const engine = flextree();
  const tree = engine(treeData[2]);
  //console.log('tree: ' + util.inspect(tree, {depth: 10}));
  test.deepEqual(tree,
    { name: 'root', x: 0.5, y: 0, depth: 0,
      children: [
        { x: 0.16666666666666666, y: 0.5, depth: 1,
          children: [], },
        { x: 0.5, y: 0.5, depth: 1,
          children: [{ x: 0.5, y: 1, depth: 2 }] },
        { x: 0.8333333333333333, y: 0.5, depth: 1,
          children: [{ x: 0.8333333333333333, y: 1, depth: 2 }]}
      ]
    }
  );
  test.end();
});

tape('can layout a tree, all defaults', function(test) {
  const engine = flextree();
  const tree = engine(treeData[3]);
  console.log(util.inspect(tree, {depth: 7}));
  checkLayout(test, tree, {
    root: { x: 0.55, y: 0 },
    long: { x: 0.3, y: 0.5 },
    leaf0: { x: 0.2, y: 1 },
    leaf1: { x: 0.4, y: 1 },
    short: { x: 0.8, y: 0.5 },
    leaf2: { x: 0.8, y: 1 },
  });
  test.end();
});

tape('can layout a tree with fixed node widths', function(test) {
  const engine = flextree().nodeSize([2, 2]);
  const tree = engine(treeData[3]);
  checkLayout(test, tree, {
    root: { x: 0, y: 0 },
    long: { x: -2.5, y: 2 },
    leaf0: { x: -3.5, y: 4 },
    leaf1: { x: -1.5, y: 4 },
    short: { x: 2.5, y: 2 },
    leaf2: { x: 2.5, y: 4 },
  });
  test.end();
});

tape('can layout with a separation function', function(test) {
  const engine = flextree().separation(() => 1);
  const tree = engine(treeData[3]);
  checkLayout(test, tree, {
    root: { x: 7/12, y: 0 },
    long: { x: 4/12, y: 0.5 },
    leaf0: { x: 2/12, y: 1 },
    leaf1: { x: 6/12, y: 1 },
    short: { x: 10/12, y: 0.5 },
    leaf2: { x: 10/12, y: 1 },
  });
  test.end();
});


// Helpers:

function checkLayout(test, tree, expected) {
  const nodes = flextree.hierarchy(tree).descendants();
  nodes.forEach(wrap => {
    const node = wrap.data;
    const name = node.name;
    test.isDefined(name, 'checking node ' + name);

    const expNode = expected[name];
    test.isDefined(expNode, 'found expected node ' + name);
    test.closeTo(node.x, expNode.x, 0.0000001, 'node ' + name + ' x-coord');
    test.closeTo(node.y, expNode.y, 0.0000001, 'node ' + name + ' y-coord');
  });
}


/*
    "can use size to scale entire drawing, with custom separation":
    function(tree) {
      var t = tree()
        .size([10, 10])
        .separation(function() { return 1; });
      layoutEqual(
        t.nodes(clone(treedata)).map(layout),
        [
          { name: "root",  depth: 0, x:  70/12, y:  0, },
          { name: "long",  depth: 1, x:  40/12, y:  5, },
          { name: "leaf0", depth: 2, x:  20/12, y: 10, },
          { name: "leaf1", depth: 2, x:  60/12, y: 10, },
          { name: "short", depth: 1, x: 100/12, y:  5, },
          { name: "leaf2", depth: 2, x: 100/12, y: 10, },
        ]
      );
    },

    "can use nodeSize to specify node size, with custom separation":
    function(tree) {
      var t = tree()
        .nodeSize([10, 10])
        .separation(function(a, b) { return a.parent == b.parent ? 1: 1.5; });
      layoutEqual(
        t.nodes(clone(treedata)).map(layout),
        [
          { name: "root",  depth: 0, x:   0, y:  0, },
          { name: "long",  depth: 1, x: -10, y: 10, },
          { name: "leaf0", depth: 2, x: -15, y: 20, },
          { name: "leaf1", depth: 2, x:  -5, y: 20, },
          { name: "short", depth: 1, x:  10, y: 10, },
          { name: "leaf2", depth: 2, x:  10, y: 20, },
        ]
      );
    },

    // test08
    "can layout a tree with variable node size, zero spacing":
    function(tree) {
      var layout_engine = tree()
        .nodeSize(function(n) {return [n.x_size, n.y_size]})
        .spacing(function(n) {return 0;});
      var t = clone(tree_h);
      layout_engine.nodes(t);
      assert.ok(tree_equals(t, test08_expected),
        "layout not what was expected");
    },

    // test30
    "can layout a tree with variable node size, custom spacing":
    function(tree) {
      var layout_engine = tree()
        .nodeSize(function(n) {return [n.x_size, n.y_size]})
        .spacing(function(a, b) {
          return a.parent == b.parent ?
            0 : layout_engine.rootXSize();
        });
      var t = clone(tree_h);
      layout_engine.nodes(t);
      assert.ok(tree_equals(t, test30_expected),
        "layout not what was expected");
    }

  }
});

function layout(node) {
  delete node.children;
  delete node.parent;
  delete node.width;
  return node;
}

function clone(obj) {
  if (obj == null || typeof obj != "object") return obj;
  if (obj instanceof Array) {
    return obj.map(function(e) { return clone(e); });
  }
  var n = {};
  Object.keys(obj).forEach(function(k) {
    n[k] = clone(obj[k]);
  });
  return n;
}

function layoutEqual(actual, expected) {
    assert.equal(actual.length, expected.length, "node length mismatch");
    for (var i = 0; i < actual.length; ++i) {
        var a = actual[i],
            e = expected[i];
        assert.equal(a.name, e.name, "node #" + i + " name mismatch");
        assert.equal(a.depth, e.depth, "node #" + i + " depth mismatch");
        assertAlmostEqual(a.x, e.x, "node #" + i + " x");
        assertAlmostEqual(a.y, e.y, "node #" + i + " y");
    }
}


function almost_equals(a, b) {
  if (a == 0 && b == 0) return true;
  return ( Math.abs((b-a) / (b+a)) < 0.000000000001 );
}

function tree_equals(a, b) {
  if (!almost_equals(a.x, b.x) || !almost_equals(a.y, b.y)) return false;

  var a_num_children = a.children ? a.children.length : 0;
  var b_num_children = b.children ? b.children.length : 0;
  if (a_num_children != b_num_children) return false;
  if (a_num_children > 0) {
    if (a.children.length != b.children.length) return false;
    var i;
    for (i = 0; i < a.children.length; ++i) {
      if (!tree_equals(a.children[i], b.children[i])) return false;
    }
  }
  return true;
}

var treedata = {
  "name": "root",
  "width": 1,
  "children": [
    { "name": "long",
      "width": 3,
      "children": [
        { "name": "leaf0",
          "width": 1, },
        { "name": "leaf1",
          "width": 1, }
      ]
    },
    { "name": "short",
      "width": 1,
      "children": [
        { "name": "leaf2",
          "width": 1, }
      ]
    }
  ]
};

var tree_h = {
    "x_size": 30,
    "y_size": 30,
    "children": [
        {
            "x_size": 30,
            "y_size": 60,
            "children": [
                {
                    "x_size": 150,
                    "y_size": 30
                }
            ]
        },
        {
            "x_size": 30,
            "y_size": 30
        },
        {
            "x_size": 30,
            "y_size": 60
        },
        {
            "x_size": 30,
            "y_size": 30
        },
        {
            "x_size": 30,
            "y_size": 30
        },
        {
            "x_size": 30,
            "y_size": 30,
            "children": [
                {
                    "x_size": 150,
                    "y_size": 30,
                    "children": [
                        {
                            "x_size": 150,
                            "y_size": 30
                        },
                        {
                            "x_size": 150,
                            "y_size": 30
                        }
                    ]
                },
                {
                    "x_size": 150,
                    "y_size": 30
                }
            ]
        }
    ]
};

var test08_expected = {
  "x" : 0.0,
  "y" : 0.0,
  "children" : [ {
    "x" : -150.0,
    "y" : 30.0,
    "children" : [ {
      "x" : -150.0,
      "y" : 90.0
    } ]
  }, {
    "x" : -105.0,
    "y" : 30.0
  }, {
    "x" : -60.0,
    "y" : 30.0
  }, {
    "x" : 10.0,
    "y" : 30.0
  }, {
    "x" : 80.0,
    "y" : 30.0
  }, {
    "x" : 150.0,
    "y" : 30.0,
    "children" : [ {
      "x" : 75.0,
      "y" : 60.0,
      "children" : [ {
        "x" : 0.0,
        "y" : 90.0
      }, {
        "x" : 150.0,
        "y" : 90.0
      } ]
    }, {
      "x" : 225.0,
      "y" : 60.0
    } ]
  } ]
};

var test30_expected = {
  "x" : 0.0,
  "y" : 0.0,
  "children" : [ {
    "x" : -165.0,
    "y" : 30.0,
    "children" : [ {
      "x" : -165.0,
      "y" : 90.0
    } ]
  }, {
    "x" : -120.0,
    "y" : 30.0
  }, {
    "x" : -75.0,
    "y" : 30.0
  }, {
    "x" : 5.0,
    "y" : 30.0
  }, {
    "x" : 85.0,
    "y" : 30.0
  }, {
    "x" : 165.0,
    "y" : 30.0,
    "children" : [ {
      "x" : 90.0,
      "y" : 60.0,
      "children" : [ {
        "x" : 15.0,
        "y" : 90.0
      }, {
        "x" : 165.0,
        "y" : 90.0
      } ]
    }, {
      "x" : 240.0,
      "y" : 60.0
    } ]
  } ]
};

*/
