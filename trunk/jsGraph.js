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
	jsGraphSVG.def = document.createElementNS(svgNS, "def");
	this.svg.appendChild(jsGraphSVG.def);
	jsGraphSVG.defId = 0;
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
		return new SVGObject(o);
	}
	this.ellipse = function(point1, point2, fill, stroke, strokeWidth){
		var o = document.createElementNS(svgNS, "ellipse");
		setFillStroke(o, fill, stroke, strokeWidth);
		o.setAttribute("cx", ((point1[0]+point2[0])/2)+"px");
		o.setAttribute("cy", ((point1[1]+point2[1])/2)+"px");
		o.setAttribute("rx", ((point2[0]-point1[0])/2)+"px");
		o.setAttribute("ry", ((point2[1]-point1[1])/2)+"px");
		this.svg.appendChild(o);
		return new SVGObject(o);
	}
	this.rect = function(point1, point2, fill, stroke, strokeWidth){
		var o = document.createElementNS(svgNS, "rect");
		setFillStroke(o, fill, stroke, strokeWidth);
		o.setAttribute("x", point1[0]+"px");
		o.setAttribute("y", point1[1]+"px");
		o.setAttribute("width", (point2[0]-point1[0])+"px");
		o.setAttribute("height", (point2[1]-point1[1])+"px");
		this.svg.appendChild(o);
		return new SVGObject(o);
	}
	this.roundRect = function(point1, point2, r, fill, stroke, strokeWidth){
		var o = document.createElementNS(svgNS, "rect");
		setFillStroke(o, fill, stroke, strokeWidth);
		o.setAttribute("x", point1[0]+"px");
		o.setAttribute("y", point1[1]+"px");
		o.setAttribute("width", (point2[0]-point1[0])+"px");
		o.setAttribute("height", (point2[1]-point1[1])+"px");
		o.setAttribute("rx", parseInt(r)+"px");
		o.setAttribute("ry", parseInt(r)+"px");
		this.svg.appendChild(o);
		return new SVGObject(o);
	}
	this.line = function(point1, point2, stroke, strokeWidth){
		var o = document.createElementNS(svgNS, "line");
		setFillStroke(o, null, stroke, strokeWidth);
		o.setAttribute("x1", point1[0]+"px");
		o.setAttribute("y1", point1[1]+"px");
		o.setAttribute("x2", point2[0]+"px");
		o.setAttribute("y2", point2[1]+"px");
		o.setAttribute("stroke-linejoin", "miter");
		this.svg.appendChild(o);
		return new SVGObject(o);
	}
	
}
function SVGObject(obj){
	svgNS = "http://www.w3.org/2000/svg";
	this.obj = obj;
	this.gradient = function(color, d){
		var o = document.createElementNS(svgNS, "linearGradient");
		o.id='_jsGraphSVGDef'+jsGraphSVG.defId;
		jsGraphSVG.defId++;
		o.setAttribute('x1','0%');
		o.setAttribute('y1','0%');
		if (d == 'h'){
			o.setAttribute('x2','100%');
			o.setAttribute('y2','0%');
		} else { // v
			o.setAttribute('x2','0%');
			o.setAttribute('y2','100%');
		}
				
		
		var s1=document.createElementNS(svgNS, "stop");
		s1.setAttribute('offset','0%');
		
		s1.setAttribute('style','stop-opacity:1;stop-color:'+this.obj.getAttribute('fill'));
		s1.style.stopColor='red';//obj.fill;
		var s2=document.createElementNS(svgNS, "stop");
		s2.setAttribute('offset','100%');
		s2.setAttribute('style','stop-opacity:1;stop-color:'+color);
		
		o.appendChild(s1);
		o.appendChild(s2);
		
		jsGraphSVG.def.appendChild(o);
		this.obj.setAttribute('style',"fill:url(#"+o.id+")");
	}
}

//end svg

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
		return new VMLObject(o);
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
		return new VMLObject(o);
	}
	this.rect = function(point1, point2, fill, stroke, strokeWidth){
		var o = document.createElement("v:Rect");
		o.style.position = "absolute";
		setFillStroke(o, fill, stroke, strokeWidth);
		o.style.width = (point2[0] - point1[0]) + "px";
		o.style.height = (point2[1] - point1[1]) + "px";
		o.style.left = point1[0] + "px";
		o.style.top = point1[1] + "px";
		this.target.appendChild(o);
		return new VMLObject(o);
	}
	this.roundRect = function(point1, point2, r, fill, stroke, strokeWidth){
		var o = document.createElement("v:RoundRect");
		o.style.position = "absolute";
		setFillStroke(o, fill, stroke, strokeWidth);
		o.style.width = (point2[0] - point1[0]) + "px";
		o.style.height = (point2[1] - point1[1]) + "px";
		o.arcsize=r/Math.min(point2[0] - point1[0],point2[1] - point1[1]);
		o.style.left = point1[0] + "px";
		o.style.top = point1[1] + "px";
		this.target.appendChild(o);
		return new VMLObject(o);
	}
	this.line = function(point1, point2, stroke, strokeWidth){
		var o = document.createElement("v:line");
		o.style.position = "absolute";
		setFillStroke(o, null, stroke, strokeWidth);
		o.from=point1[0]+','+point1[1];
		o.to=point2[0]+','+point2[1];
		this.target.appendChild(o);
		return new VMLObject(o);
	}
}
function VMLObject(obj){
	this.obj = obj;
	this.gradient = function(color, d){
		var o = document.createElement("v:fill");
		o.type='gradient';
		o.color2=color;
		if (d == 'h'){
			angle = 270;
		} else { //v
			angle = 180;
		}
		o.angle = angle;
		this.obj.appendChild(o);
	}
}
//end vml
