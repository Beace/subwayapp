var dataset;
var width = window.innerWidth,
	height = window.innerHeight;
d3.json('../data/shanghaisubway.json', function(error, data) {
	dataset = data;
	var padding = {
		top: 80,
		right: 80,
		left: 80,
		bottom: 80 
	};
	var svg = d3.select('body').append('svg')
		.attr('width', width)
		.attr('height', height);
	var gdpmax = 0;
	var maxX = [];
	for (var i = 0; i < dataset.length; i++) {
		maxX[i] = [];
		for (var j = 0; j < dataset[i].p.length; j++) {
			maxX[i][j] = dataset[i].p[j];
		}
	}
	console.log(maxX);

	// 比例尺
	var xScale = d3.scale.linear()
		.domain([-600, 600])
		.range([0, width - padding.left - padding.right]);
	var yScale = d3.scale.linear()
		.domain([-600, 600])
		.range([height - padding.top - padding.bottom, 0]);


	var linePath = d3.svg.line()
		.x(function(d) {
			return xScale(d.x);
		})
		.y(function(d) {
			return yScale(d.y);
		})
	var colors = [
		'#cc0000', '#009900', '#009900', '#f9e103', '#660066', '#cc00cc',
		'#ff3265', '#ff7f00', '#0066cc', '#95d3db', '#b3b3b3', '#c9a7d5',
		'#c9a7d5', '#e796c1', '#800000', '#800000', '#0c785e', '77c8c7'
	];
	svg.selectAll('path')
		.data(maxX)
		.enter()
		.append('path')
		.attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
		.attr('d', function(d) {
			return linePath(d);
		})
		.attr('fill', 'none')
		.attr('stroke-width', '3')
		.attr('stroke', function(d, i) {
			return colors[i];
		})


	// 绘制xy轴
	var xAxis = d3.svg.axis()
		.scale(xScale)
		.ticks(5)
		.tickFormat(d3.format('d'))
		.orient('bottom');
	var yAxis = d3.svg.axis()
		.scale(yScale)
		.ticks(5)
		.tickFormat(d3.format('d'))
		.orient('left');

	svg.append('g').attr('class', 'xaxis axis')
		.attr('transform', 'translate(' + padding.left + ',' + height / 2 + ')')
		.call(xAxis);

	svg.append('g').attr('class', 'yaxis axis')
		.attr('transform', 'translate(' + width / 2 + ',' + padding.top + ')')
		.call(yAxis);
})