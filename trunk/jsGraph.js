function createJsGraph(target) {
	if (document.createElementNS) {
		return new jsGraphSVG(target);
	} else if(document.createStyleSheet) {
		return new jsGraphVML(target);
	}
}

function jsGraphSVG(target) {
	var svgNS = "http://www.w3.org/2000/svg";
	this.svg = document.createElementNS(svgNS, "svg");
	target.appendChild(this.svg);
	function setFillStroke(o, fill, stroke, strokeWidth){
		if (stroke != null) {
			o.setAttribute("stroke", stroke);
		} else {
			o.setAttribute("stroke", "none");
		}
		if (strokeWidth != null) {
			o.setAttribute("stroke-width", strokeWidth);
		}
		if (fill != null) {
			o.setAttribute("fill", fill);
		} else {
			o.setAttribute("fill", "none");
		}
	}
	this.circle = function(point, r, fill, stroke, strokeWidth){
		var o = document.createElementNS(svgNS, "circle");
		setFillStroke(o, fill, stroke, strokeWidth);
		o.setAttribute("r", r);
		o.setAttribute("cx", point[0]+"px");
		o.setAttribute("cy", point[1]+"px");
		this.svg.appendChild(o);
	}
	this.ellipse = function(point1, point2, fill, stroke, strokeWidth){
		var o = document.createElementNS(svgNS, "ellipse");
		setFillStroke(o, fill, stroke, strokeWidth);
		o.setAttribute("cx", ((point1[0]+point2[0])/2)+"px");
		o.setAttribute("cy", ((point1[1]+point2[1])/2)+"px");
		o.setAttribute("rx", ((point2[0]-point1[0])/2)+"px");
		o.setAttribute("ry", ((point2[1]-point1[1])/2)+"px");
		this.svg.appendChild(o);
	}
	this.rect = function(point1, point2, fill, stroke, strokeWidth){
		var o = document.createElementNS(svgNS, "rect");
		setFillStroke(o, fill, stroke, strokeWidth);
		o.setAttribute("x", point1[0]+"px");
		o.setAttribute("y", point1[1]+"px");
		o.setAttribute("width", (point2[0]-point1[0])+"px");
		o.setAttribute("height", (point2[1]-point1[1])+"px");
		this.svg.appendChild(o);
	}
	this.roundRect = function(point1, point2, r, fill, stroke, strokeWidth){
		var o = document.createElementNS(svgNS, "rect");
		setFillStroke(o, fill, stroke, strokeWidth);
		o.setAttribute("x", point1[0]+"px");
		o.setAttribute("y", point1[1]+"px");
		o.setAttribute("width", (point2[0]-point1[0])+"px");
		o.setAttribute("height", (point2[1]-point1[1])+"px");
		if (typeof r == 'object'){
			o.setAttribute("rx", r[0]+"px");
			o.setAttribute("ry", r[1]+"px");
		} else {
			o.setAttribute("rx", parseInt(r)+"px");
			o.setAttribute("ry", parseInt(r)+"px");
		}
		this.svg.appendChild(o);
	}
	
}

function jsGraphVML(target) {
	document.namespaces.add("v", "urn:schemas-microsoft-com:vml");
	var style = document.createStyleSheet();
	style.addRule('v\\:*', "behavior: url(#default#VML);");
	target.style.position='relative';
	this.target = target;
	function setFillStroke(o, fill, stroke, strokeWidth){
		if (strokeWidth != null) {
			o.strokeweight = strokeWidth;
		} else {
			o.strokeweight = "0px";
		}
		if (stroke != null) {
			o.strokecolor = stroke;
		} else {
			o.stroked = "false"
		}
		if (fill != null) {
			o.fillcolor = fill;
		} else {
			o.filled = false;
		}
	}
	this.circle = function(point, r, fill, stroke, strokeWidth){
		var o = document.createElement("v:oval");
		o.style.position = "absolute";
		setFillStroke(o, fill, stroke, strokeWidth);
		o.style.width = (r*2) + "px";
		o.style.height = (r*2) + "px";
		o.style.left = (point[0]-r) + "px";
		o.style.top = (point[1]-r) + "px";
		this.target.appendChild(o);
	}
	this.ellipse = function(point1, point2, fill, stroke, strokeWidth){
		var o = document.createElement("v:oval");
		o.style.position = "absolute";
		setFillStroke(o, fill, stroke, strokeWidth);
		o.style.width = (point2[0] - point1[0]) + "px";
		o.style.height = (point2[1] - point1[1]) + "px";
		o.style.left = point1[0] + "px";
		o.style.top = point1[1] + "px";
		this.target.appendChild(o);
	}
	
}
