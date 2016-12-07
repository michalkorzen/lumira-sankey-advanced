/**
 * sap.viz.ext.sankeyadvanced by Michal Korzen
 * Sankey d3.js by Michael Bostock [https://github.com/d3/d3-plugins/tree/master/sankey]
 * All rights reserved.
 */

define("sap_viz_ext_sankeyadvanced-src/js/render", ["sap_viz_ext_sankeyadvanced-src/js/utils/util"], function(util) {
	/*
	 * This function is a drawing function; you should put all your drawing logic in it.
	 * it's called in moduleFunc.prototype.render
	 * @param {Object} data - proceessed dataset, check dataMapping.js
	 * @param {Object} container - the target d3.selection element of plot area
	 * @example
	 *   container size:     this.width() or this.height()
	 *   chart properties:   this.properties()
	 *   dimensions info:    data.meta.dimensions()
	 *   measures info:      data.meta.measures()
	 */
	var render = function(data, container) {
		var color_option = 'process-oriented';
		var isaggregated = 0;
		var window_width = this.width();
		var window_height = this.height();
		container.selectAll('svg').remove();
		//var svg = container.append('svg');
		//svg.attr("width", width).attr("height", height);

		var svg = container.append('svg').attr('width', window_width).attr('height', window_height);
		//def gradient
		var defs = svg.append("defs");

		var gradient = defs.append("linearGradient")
			.attr("id", "gradient")
			.attr("x1", "0%")
			.attr("y1", "0%")
			.attr("x2", "100%")
			.attr("y2", "0%")
			.attr("spreadMethod", "pad");
		gradient.append("stop")
			.attr("offset", "0%")
			.attr("stop-color", "rgb(255,0,0)")
			.attr("stop-opacity", 1);
		gradient.append("stop")
			.attr("offset", "100%")
			.attr("stop-color", "#c00")
			.attr("stop-opacity", 0);

		gradient = defs.append("linearGradient")
			.attr("id", "gradient2")
			.attr("x1", "0%")
			.attr("y1", "0%")
			.attr("x2", "100%")
			.attr("y2", "0%")
			.attr("spreadMethod", "pad");
		gradient.append("stop")
			.attr("offset", "0%")
			.attr("stop-color", "rgb(0,255,0)")
			.attr("stop-opacity", 1);
		gradient.append("stop")
			.attr("offset", "100%")
			.attr("stop-color", "rgb(0,255,0")
			.attr("stop-opacity", 0);

		var vis = svg.append('g').attr('class', 'vis').attr('width', window_width).attr('height', window_height);
		$(".sap_viz_ext_sankey.node rect").css({
			cursor: 'move',
			'fill-opacity': .9,
			'shape-rendering': 'crispEdges'
		});
		$(".sap_viz_ext_sankey.node text").css({
			'pointer-events': 'none',
			'text-shadow': '0 1px 0 #fff'
		});
		$(".sap_viz_ext_sankey.link").css({
			fill: 'none',
			stroke: '#000',
			'stroke-opacity': .2
		});
		$(".sap_viz_ext_sankey.link:hover").css({
			'stroke-opacity': .5
		});

		var d3_sankey = function() {
			var sankey = {},
				nodeWidth = 24,
				nodePadding = 24,
				size = [1, 1],
				nodes = [],
				links = [];

			sankey.nodeWidth = function(_) {
				if (!arguments.length) {
					return nodeWidth;
				}
				nodeWidth = +_;
				return sankey;
			};

			sankey.nodePadding = function(_) {
				if (!arguments.length) {
					return nodePadding;
				}
				nodePadding = +_;
				return sankey;
			};

			sankey.nodes = function(_) {
				if (!arguments.length) {
					return nodes;
				}
				nodes = _;
				return sankey;
			};

			sankey.links = function(_) {
				if (!arguments.length) {
					return links;
				}
				links = _;
				return sankey;
			};

			sankey.size = function(_) {
				if (!arguments.length) {
					return size;
				}
				size = _;
				return sankey;
			};

			sankey.layout = function(iterations) {
				computeNodeLinks();
				computeNodeValues();
				computeNodeBreadths();
				computeNodeDepths(iterations);
				computeLinkDepths();
				return sankey;
			};

			sankey.relayout = function() {
				computeLinkDepths();
				return sankey;
			};

			function center(node) {
				return node.y + node.dy / 2;
			}

			function value(link) {
				return link.value;
			}

			sankey.link = function() {
				var curvature = .5;

				function link(d) {
					var x0 = d.source.x + d.source.dx,
						x1 = d.target.x,
						xi = d3.interpolateNumber(x0, x1),
						x2 = xi(curvature),
						x3 = xi(1 - curvature),
						y0 = d.source.y + d.sy + d.dy / 2,
						y1 = d.target.y + d.ty + d.dy / 2;

					if (d.target.name === "NULLSPACE" || d.target.name === "CUTSPACE") {
						y1 = y0 + 0.1;
						x1 = x0 + 20;
						xi = d3.interpolateNumber(x0, x1);
						x2 = xi(curvature);
						x3 = xi(1 - curvature);
					}

					return "M" + x0 + "," + y0 + "C" + x2 + "," + y0 + " " + x3 + "," + y1 + " " + x1 + "," + y1;
				}

				link.curvature = function(_) {
					if (!arguments.length) {
						return curvature;
					}
					curvature = +_;
					return link;
				};

				return link;
			};

			// Populate the sourceLinks and targetLinks for each node.
			// Also, if the source and target are not objects, assume they are indices.
			function computeNodeLinks() {
				nodes.forEach(function(node) {
					node.sourceLinks = [];
					node.targetLinks = [];
				});
				links.forEach(function(link) {
					var source = link.source,
						target = link.target;
					if (typeof source === "number") {
						source = link.source = nodes[link.source];
					}
					if (typeof target === "number") {
						target = link.target = nodes[link.target];
					}
					source.sourceLinks.push(link);
					target.targetLinks.push(link);
				});
			}

			// Compute the value (size) of each node by summing the associated links.
			function computeNodeValues() {
				nodes.forEach(function(node) {
					node.value = Math.max(
						d3.sum(node.sourceLinks, value),
						d3.sum(node.targetLinks, value)
					);
				});
			}

			// Iteratively assign the breadth (x-position) for each node.
			// Nodes are assigned the maximum breadth of incoming neighbors plus one;
			// nodes with no incoming links are assigned breadth zero, while
			// nodes with no outgoing links are assigned the maximum breadth.
			function computeNodeBreadths() {
				nodes.forEach(function(d) {
					d.x = parseInt(d.name.substring(0, d.name.indexOf("-")));
					d.dx = nodeWidth;
				});

				var x = d3.max(nodes, function(d) {
					return d.x;
				});
				nodes.filter(function(l) {
					return l.name === "NULLSPACE" || l.name === "CUTSPACE";
				}).forEach(function(d) {
					d.x = d3.max(nodes, function(f) {
						return f.x;
					}) + 1;
				});

				scaleNodeBreadths((width - nodeWidth - 20) / (x));
			}

			function moveSourcesRight() {
				nodes.forEach(function(node) {
					if (!node.targetLinks.length) {
						node.x = d3.min(node.sourceLinks, function(d) {
							return d.target.x;
						}) - 1;
					}
				});
			}

			function moveSinksRight(x) {
				nodes.forEach(function(node) {
					if (!node.sourceLinks.length) {
						node.x = x - 1;
					}
				});
			}

			function scaleNodeBreadths(kx) {
				nodes.forEach(function(node) {
					node.x *= kx;
				});
			}

			function computeNodeDepths(iterations) {
				var nodesByBreadth = d3.nest()
					.key(function(d) {
						return d.x;
					})
					.sortKeys(d3.ascending)
					.entries(nodes)
					.map(function(d) {
						return d.values;
					});

				function initializeNodeDepth() {
					var ky = d3.min(nodesByBreadth, function(nodes) {
						return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
					});

					nodesByBreadth.forEach(function(nodes) {
						nodes.forEach(function(node, i) {
							node.y = i;
							node.dy = node.value * ky;
						});
					});

					links.forEach(function(link) {
						link.dy = link.value * ky;
					});
				}

				function relaxLeftToRight(alpha) {
					nodesByBreadth.forEach(function(nodes, breadth) {
						nodes.forEach(function(node) {
							if (node.targetLinks.length) {
								var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
								node.y += (y - center(node)) * alpha;
							}
						});
					});

					function weightedSource(link) {
						return center(link.source) * link.value;
					}
				}

				function relaxRightToLeft(alpha) {
					function weightedTarget(link) {
						return center(link.target) * link.value;
					}

					nodesByBreadth.slice().reverse().forEach(function(nodes) {
						nodes.forEach(function(node) {
							if (node.sourceLinks.length) {
								var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
								node.y += (y - center(node)) * alpha;
							}
						});
					});
				}

				function resolveCollisions() {
					nodesByBreadth.forEach(function(nodes) {
						var node,
							dy,
							y0 = 0,
							n = nodes.length,
							i;

						// Push any overlapping nodes down.
						nodes.sort(ascendingDepth);
						for (i = 0; i < n; ++i) {
							node = nodes[i];
							dy = y0 - node.y;
							if (dy > 0) {
								node.y += dy;
							}
							y0 = node.y + node.dy + nodePadding;
						}

						// If the bottommost node goes outside the bounds, push it back up.
						dy = y0 - nodePadding - size[1];
						if (dy > 0) {
							y0 = node.y -= dy;

							// Push any overlapping nodes back up.
							for (i = n - 2; i >= 0; --i) {
								node = nodes[i];
								dy = node.y + node.dy + nodePadding - y0;
								if (dy > 0) {
									node.y -= dy;
								}
								y0 = node.y;
							}
						}
					});
				}

				function ascendingDepth(a, b) {
					return a.y - b.y;
				}

				initializeNodeDepth();
				resolveCollisions();
				for (var alpha = 1; iterations > 0; --iterations) {
					relaxRightToLeft(alpha *= .99);
					resolveCollisions();
					relaxLeftToRight(alpha);
					resolveCollisions();
				}
			}

			function computeLinkDepths() {
				function ascendingSourceDepth(a, b) {
					//if(a.target.name.substring(a.target.name.indexOf("-") + 1) === b.target.name.substring(b.target.name.indexOf("-") + 1)) {
					if (a.source.y === b.source.y) {
						return b.processlength - a.processlength;
					}
					return a.source.y - b.source.y;
				}

				function ascendingTargetDepth(a, b) {
					if (a.target.name === "NULLSPACE") {
						return 1;
					}
					if (b.target.name === "NULLSPACE") {
						return -1;
					}
					if (a.target.y === b.target.y) {
						return b.processlength - a.processlength;
					}
					return a.target.y - b.target.y;
				}

				nodes.forEach(function(node) {
					node.sourceLinks.sort(ascendingTargetDepth);
					node.targetLinks.sort(ascendingSourceDepth);
				});
				nodes.forEach(function(node) {
					var sy = 0,
						ty = 0;
					node.sourceLinks.forEach(function(link) {
						link.sy = sy;
						sy += link.dy;
					});
					node.targetLinks.forEach(function(link) {
						link.ty = ty;
						ty += link.dy;
					});
				});
			}

			return sankey;
		};

		function displayerror(text) {
			vis.append('text').text(text)
				.attr('x', window_width / 2)
				.attr('y', window_height / 2)
				.attr('text-anchor', 'middle')
				.attr('fill', 'black')
				.style('opacity', 0.3)
				.attr('font-size', '28px');
		}
		//Sankey plugin ends
		var meta = data.meta;
		var _ds = meta.dimensions('Nodes');
		var _ms = meta.measures('Flow');
		if (_ds[0] === "Dimension") {
			displayerror("dimension is not defined");
			return;
		}
		var ds = _ds[0];
		if (_ms[0] === "Measure") {
			displayerror("measure is not defined");
			return;
		}
		var ms = _ms[0];

		var margin = {
				top: 30,
				right: 1,
				bottom: 1,
				left: 1
			},
			width = window_width - margin.left - margin.right,
			height = window_height - margin.top - margin.bottom;

		var formatNumber = d3.format(".0f"),
			format = function(d) {
				return formatNumber(d);
			},
			color = d3.scale.category10();

		var vis_g = vis.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		var sankey = d3_sankey()
			.nodeWidth(15)
			.nodePadding(30)
			.size([width, height]);

		var path = sankey.link();

		var graph = {
			"nodes": [],
			"links": []
		};

		graph.nodes.push({
			"name": "NULLSPACE"
		});

		data.filter(function(d) {
			return d[ds] !== null;
		}).forEach(function(d) {
			//if(d[ds] === null) {continue;}
			var temp_nodes = d[ds].split(">");
			if (temp_nodes.length === 1) {
				graph.nodes.push({
					"name": "0-" + temp_nodes[0]
				});
			}
			for (var i = 0; i < temp_nodes.length; i++) {
				if (i + 1 < temp_nodes.length) {
					//alert(temp_nodes[i] + " > " + temp_nodes[i+1]);
					var temp_source_node = i.toString() + "-" + temp_nodes[i];
					var temp_target_node = (i + 1).toString() + "-" + temp_nodes[i + 1];

					if (i === 9) {
						temp_target_node = "CUTSPACE";
						i = temp_nodes.length;
					}

					graph.nodes.push({
						"name": temp_source_node
					});
					graph.nodes.push({
						"name": temp_target_node
					});
					graph.links.push({
						"source": temp_source_node,
						"target": temp_target_node,
						"value": +d[ms],
						"processlength": temp_nodes.length,
						"process": d[ds] //.replace(">", "").replace(" ", "")
					});
				} else {
					graph.links.push({
						"source": i.toString() + "-" + temp_nodes[i],
						"target": "NULLSPACE",
						"value": +d[ms],
						"processlength": temp_nodes.length,
						"process": d[ds] //.replace(">", "").replace(" ", "")////"NULLSPACE"
					});
				}
			}
		});

		//window.glinks = graph.links;

		// return only the distinct / unique nodes
		graph.nodes = d3.keys(d3.nest()
			.key(function(d) {
				return d.name;
			})
			.map(graph.nodes));

		////////////////////////////////////////////////////////////////////
		if (data.length > 150) {
			var nested_data = d3.nest()
				.key(function(d) {
					return [d.source, d.target];
				})
				.rollup(function(d) {
					return d3.sum(d, function(g) {
						return g.value;
					});
				})
				.entries(graph.links);

			graph.links = [];

			nested_data.forEach(function(d) {
				graph.links.push({
					"source": d.key.split(",")[0],
					"target": d.key.split(",")[1],
					"value": +d.values,
					"processlength": 1,
					"process": d.key.split(",")[0] + ">" + d.key.split(",")[1]
				});
			});

			nested_data = null;

			isaggregated = 1;
			color_option = 'node-oriented';
		}
		////////////////////////////////////////////////////////////////////

		// loop through each link replacing the text with its index from node
		graph.links.forEach(function(d, i) {
			graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
			graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
		});
		//now loop through each nodes to make nodes an array of objects
		// rather than an array of strings
		graph.nodes.forEach(function(d, i) {
			graph.nodes[i] = {
				"name": d
			};
		});

		try {
			sankey
				.nodes(graph.nodes)
				.links(graph.links)
				.layout(1);
		} catch (err) {
			displayerror(err.message);
			return;
		}

		function redraw(coloring_option) {
			vis_g.selectAll('g').remove();

			var link = vis_g.append("g").selectAll(".link")
				.data(graph.links)
				.enter().append("path")
				.attr("class", "sap_viz_ext_sankey link")
				.attr("d", path)
				.style("stroke-width", function(d) {
					return Math.max(1, d.dy);
				})
				.style("stroke", function(d) {
					//return d.color = color(d.source.name.substring(d.source.name.indexOf("-")+1));//d.name.replace(/ .*/, ""));
					if (d.target.name === "NULLSPACE") {
						return "url(#gradient)";
					}
					if (d.target.name === "CUTSPACE") {
						return "url(#gradient2)";
					}
					switch (coloring_option) {
						case 'process-oriented':
							return color(d.process);
						case 'input-output':
							return 'rgb(31, 119, 180)';
						case 'node-oriented':
							return color(d.source.name.substring(d.source.name.indexOf("-") + 1));
					}
					return color(d.process);
				})
				.on("mouseover", function(d) {
					vis_g.selectAll(".link").filter(function(l) {
						return l.process === d.process;
					}).transition().style('stroke-opacity', 0.7);
				})
				.on("mouseout", function(d) {
					vis_g.selectAll(".link").filter(function(l) {
						return l.process === d.process;
					}).transition().style('stroke-opacity', 0.2);
				})
				.sort(function(a, b) {
					return b.dy - a.dy;
				});

			link.append("title")
				.text(function(d) {
					return d.process.replace(new RegExp(">", 'g'), " → ") + "\n" + (isaggregated === 0 ? '' : '(aggregated)' + "\n") + format(d.value);
				});

			function dragmove(d) {
				d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
				sankey.relayout();
				link.attr("d", path);
			}

			var node = vis_g.append("g").selectAll(".node")
				.data(graph.nodes)
				.enter().append("g")
				.attr("class", "sap_viz_ext_sankey node")
				.attr("transform", function(d) {
					return "translate(" + d.x + "," + d.y + ")";
				})
				//.on("click",showtooltiptest)
				.call(d3.behavior.drag()
					.origin(function(d) {
						return d;
					})
					.on("dragstart", function() {
						this.parentNode.appendChild(this);
					})
					.on("drag", dragmove));

			node.append("rect")
				.attr("height", function(d) {
					return d.dy;
				})
				.attr("width", sankey.nodeWidth())
				.style("fill", function(d) {
					return color(d.name.substring(d.name.indexOf("-") + 1)); //d.name.replace(/ .*/, ""));
				})
				.style("stroke", function(d) {
					return d3.rgb(d.color).darker(2);
				})
				.on("mouseover", function(d) {
					vis_g.selectAll(".link").filter(function(l) {
						return l.source === d || l.target === d;
					}).transition().style('stroke-opacity', 0.7);
				})
				.on("mouseout", function(d) {
					vis_g.selectAll(".link").filter(function(l) {
						return l.source === d || l.target === d;
					}).transition().style('stroke-opacity', 0.2);
				})
				.append("title")
				.text(function(d) {
					return d.name.substring(d.name.indexOf("-") + 1) + "\n" + format(d.value);
				});

			node.append("text")
				.attr("x", +15)
				.attr("y", -6)
				.attr("dy", ".35em")
				.attr("text-anchor", "end")
				.attr("transform", null)
				.text(function(d) {
					return d.name.substring(d.name.indexOf("-") + 1);
				})
				.filter(function(d) {
					return d.x < width / 2;
				})
				.attr("x", 0)
				.attr("text-anchor", "start");
		}

		redraw(color_option);

		var menu = svg.append('g');
		menu.append('rect')
			.style('fill', 'rgb(217,217,217)')
			.attr('x', window_width - 334)
			.attr('width', 334)
			.attr('y', 0)
			.attr('height', 20);

		menu.append('text').text('PROCESS-ORIENTED')
			.style('cursor', isaggregated === 0 ? 'pointer' : 'default')
			.attr('x', window_width - 12)
			.attr('y', 13)
			.attr('text-anchor', 'end')
			.attr('fill', 'black')
			.style('text-decoration', isaggregated === 0 ? 'none' : 'line-through')
			.on("click", function() {
				if (isaggregated === 0) {
					color_option = 'process-oriented';
					redraw(color_option);
				}
			});
		menu.append('text').text('INPUT-OUTPUT')
			.style('cursor', 'pointer')
			.attr('x', window_width - 177)
			.attr('y', 13)
			.attr('text-anchor', 'middle')
			.attr('fill', 'black')
			.on("click", function() {
				color_option = 'input-output';
				redraw(color_option);
			});
		menu.append('text').text('NODE-ORIENTED')
			.style('cursor', 'pointer')
			.attr('x', window_width - 322)
			.attr('y', 13)
			.attr('text-anchor', 'start')
			.attr('fill', 'black')
			.on("click", function() {
				color_option = 'node-oriented';
				redraw(color_option);
			});
	};

	return render;
});