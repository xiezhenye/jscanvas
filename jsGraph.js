function createJsGraph(target,width,height) {
	if (document.createElementNS) {
		return new jsGraphSVG(target,width,height);
	} else if(document.createStyleSheet) {
		return new jsGraphVML(target,width,height);
	}
}
var JsGraphUtil={};
JsGraphUtil.calcCenter=function(shape,param){
	switch (shape)
	{
	case 'rect':
	case 'roundRect':
	case 'line':
	case 'ellipse':
		return [(param[0][0]+param[1][0])/2, (param[0][1]+param[1][1])/2];
	case 'polygon':
		var sx=0;var sy=0;
		var l=param[0].length;
		for (var i=0;i<l ;i++ ){
			sx+=param[0][i][0];
			sy+=param[0][i][1];
		}
		return [sx/l,sy/l];
	case 'circle':
		return param[0];
	}
}
JsGraphUtil.rotate=function(points,arg,center){
	var ps=[];
	for(var i=0;i<points.length;i++){
		var t=arg/180*Math.PI;
		var dx=points[i][0]-center[0];
		var dy=points[i][1]-center[1];
		ps.push([dx*Math.cos(t)-dy*Math.sin(t)+center[0],dx*Math.sin(t)+dy*Math.cos(t)+center[1]]);
	}
	return ps;
}

function jsGraphShapeSVG(){
	this.setSVG=function(svg){
		this.svg=svg;
	}
	this.setFillStroke=function(fill, stroke, strokeWidth){
		if (stroke != null) {
			this.o.setAttribute("stroke", stroke);
		} else {
			this.o.setAttribute("stroke", "none");
		}
		if (strokeWidth != null) {
			this.o.setAttribute("stroke-width", strokeWidth);
		}
		if (fill != null) {
			this.o.setAttribute("fill", fill);
		} else {
			this.o.setAttribute("fill", "none");
		}
	}
	this.draw=function(svg){
		this.svg.appendChild(this.o);
	}
}
function jsGraphPolygonSVG(points){
	this.o = document.createElementNS(svgNS, "polygon");
	this.init= function (points){
		var pointsAttr = '';
		for (var i=0;i<points.length ;i++ ){
			pointsAttr+= points[i][0]+','+points[i][1]+' ';
		}
		this.points=points;
		this.o.setAttribute("points", pointsAttr);
	}
	this.init(points);
	this.rotate=function(arg,center){
		var newPoints = JsGraphUtil.rotate(this.points,arg,center);
		this.init(newPoints);
	}
}
jsGraphPolygonSVG.prototype=new jsGraphShapeSVG();

function jsGraphSVG(target, width, height) {
	var svgNS = "http://www.w3.org/2000/svg";
	this.svg = document.createElementNS(svgNS, "svg");
	this.svg.setAttribute('width',width);
	this.svg.setAttribute('height',height);
	jsGraphSVG.def = document.createElementNS(svgNS, "def");
	this.svg.appendChild(jsGraphSVG.def);
	jsGraphSVG.defId = 0;
	target.appendChild(this.svg);
	/////////////////////////////
	this.POLYGON=function(points){
		var ret=new jsGraphPolygonSVG(points);
		ret.setSVG(this.svg);
		return ret;
	}
	/////////////////////////////
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
		return new SVGObject(o,['circle',[point, r]]);
	}
	this.ellipse = function(point1, point2, fill, stroke, strokeWidth){
		var o = document.createElementNS(svgNS, "ellipse");
		setFillStroke(o, fill, stroke, strokeWidth);
		o.setAttribute("cx", ((point1[0]+point2[0])/2)+"px");
		o.setAttribute("cy", ((point1[1]+point2[1])/2)+"px");
		o.setAttribute("rx", ((point2[0]-point1[0])/2)+"px");
		o.setAttribute("ry", ((point2[1]-point1[1])/2)+"px");
		this.svg.appendChild(o);
		return new SVGObject(o,['ellipse',[point1, point2]]);
	}
	this.rect = function(point1, point2, fill, stroke, strokeWidth){
		var o = document.createElementNS(svgNS, "rect");
		setFillStroke(o, fill, stroke, strokeWidth);
		o.setAttribute("x", point1[0]+"px");
		o.setAttribute("y", point1[1]+"px");
		o.setAttribute("width", (point2[0]-point1[0])+"px");
		o.setAttribute("height", (point2[1]-point1[1])+"px");
		this.svg.appendChild(o);
		return new SVGObject(o,['rect',[point1, point2]]);
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
		return new SVGObject(o,['roundRect',[point1,point2,r]]);
	}
	this.line = function(point1, point2, stroke, strokeWidth){
		var o = document.createElementNS(svgNS, "line");
		setFillStroke(o, null, stroke, strokeWidth);
		o.setAttribute("x1", point1[0]+"px");
		o.setAttribute("y1", point1[1]+"px");
		o.setAttribute("x2", point2[0]+"px");
		o.setAttribute("y2", point2[1]+"px");
		this.svg.appendChild(o);
		return new SVGObject(o,['line',[point1, point2]]);
	}
	this.polygon = function(points, fill, stroke, strokeWidth) {
		var o = document.createElementNS(svgNS, "polygon");
		var pointsAttr = '';
		for (var i=0;i<points.length ;i++ ){
			pointsAttr+= points[i][0]+','+points[i][1]+' ';
		}
		o.setAttribute("points", pointsAttr);
		setFillStroke(o, fill, stroke, strokeWidth);
		this.svg.appendChild(o);
		return new SVGObject(o,['polygon',[points]]);
	}
	this.arc = function(point, r, beginArg, arg, fill, stroke, strokeWidth){
		var o = document.createElementNS(svgNS, "path");
		var bx = r * Math.cos((beginArg-90)/180*Math.PI)+point[0];
		var by = r * Math.sin((beginArg-90)/180*Math.PI)+point[1];
		var ex = r * Math.cos((beginArg-90+arg)/180*Math.PI)+point[0];
		var ey = r * Math.sin((beginArg-90+arg)/180*Math.PI)+point[1];
		var d = 'M'+bx+' '+by+' A'+r+' '+r+' 0 0 1 '+ex+' '+ey;
		setFillStroke(o, fill, stroke, strokeWidth);
		o.setAttribute("d", d);
		this.svg.appendChild(o);
		return new SVGObject(o,['arc',[point, r, beginArg, arg]]);
	}
	//this.sector
}
function SVGObject(obj,param){
	svgNS = "http://www.w3.org/2000/svg";
	this.param=param;
	this.obj = obj;
	this.obj.setAttribute('transform','');
	this.setCenter = function(point){
	}
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
	this.rotate=function(arg){
		var t = this.obj.getAttribute('transform');
		var o = JsGraphUtil.calcCenter(this.param[0],this.param[1]);
		t+= " rotate("+arg+" "+o[0]+" "+o[1]+")"
		this.obj.setAttribute('transform',t);
	}
}

//end svg


function jsGraphShapeVML(){
	jsGraphShapeVML.curId=1;
	
	this.fill='white';
	this.stroke='black';
	this.strokeWidth=1;
	this._onclick=function(){};

	this.setTarget=function(target){
		this.target=target;
	}
	this.setFill=function(fill){
		if (fill != null) {
			this.o.fillcolor = fill;
		} else {
			this.o.filled = "false";
		}
		this.fill=fill;
		return this;
	}
	this.setStroke=function(stroke, strokeWidth){
		if (strokeWidth != 0) {
			this.o.strokeweight = strokeWidth;
		} else {
			this.o.strokeweight = "0";
			this.o.stroked = "false";
		}
		this.o.strokecolor = stroke;
		if (stroke==null){
			this.o.stroked = "false";
		}	
		this.stroke=stroke;
		this.strokeWidth=strokeWidth;
		return this;
	}
	this.onclick=function(f){
		this._onclick=f;
		this.o.onclick=function(){
			if (this._onclick){
				this._onclick(window.event);
			}
		}
	}
	this._beforeInit=function(){
		if(this.o){
			this.target.removeChild(this.o);
		}
		if (!this.id){
			this.id=jsGraphShapeVML.curId;
		}
	}
	this._afterInit=function(){
		this.o.style.position = "absolute";
		this.onclick(this._onclick);
		this.o.style.zIndex=this.id;
		this.setStroke(this.stroke,this.strokeWidth);
		this.setFill(this.fill);
		this.target.appendChild(this.o);
		
	}
}
function jsGraphPolygonVML(target,points){
	this.target=target;
	jsGraphShapeVML.curId++;

	this.init= function (points){
		this._beforeInit();
		this.o = document.createElement("v:polyline");
		var pointsAttr='';
		for (var i=0;i<points.length ;i++ ){
			pointsAttr+= points[i][0]+','+points[i][1]+' ';
		}
		pointsAttr+= points[0][0]+','+points[0][1];
		this.params=arguments;
		this.o.setAttribute('points',pointsAttr);
		this._afterInit();
	}
	this.init(points);
	this.rotate=function(arg,center){
		var newPoints = JsGraphUtil.rotate(this.params[0],arg,center);
		this.init(newPoints);
		return this;
	}
}
jsGraphPolygonVML.prototype=new jsGraphShapeVML();

function jsGraphEllipseVML(target,point1, point2){
	this.target=target;
	jsGraphShapeVML.curId++;

	this.init= function (point1, point2){
		this._beforeInit();
		this.o = document.createElement("v:oval");
		this.o.style.width = (point2[0] - point1[0]) + "px";
		this.o.style.height = (point2[1] - point1[1]) + "px";
		this.o.style.left = point1[0] + "px";
		this.o.style.top = point1[1] + "px";
		this.params=arguments;
		this._afterInit();
	}
	this.init(point1, point2);
	this.rotate=function(arg,center){
		var c=[(this.params[0][0]+this.params[1][0])/2,(this.params[0][1]+this.params[1][1])/2];
		var np = JsGraphUtil.rotate([c],arg,center);
		var w=this.params[1][0]-this.params[0][0];
		var h=this.params[1][1]-this.params[0][1];
		var p1=[np[0][0]-w/2,np[0][1]-h/2];
		var p2=[np[0][0]+w/2,np[0][1]+h/2];
		this.init(p1,p2);
		var old=this._rotation?parseInt(this.o.style.rotation):this._rotation=0;
		this._rotation+=parseInt(arg);
		this.o.style.rotation = this._rotation;
		return this;
	}
}
jsGraphEllipseVML.prototype=new jsGraphShapeVML();

function jsGraphCircleVML(target,point, r){
	this.target=target;
	jsGraphShapeVML.curId++;

	this.init= function (point, r){
		this._beforeInit();
		this.o = document.createElement("v:oval");
		this.o.style.width = (r*2) + "px";
		this.o.style.height = (r*2) + "px";
		this.o.style.left = (point[0]-r) + "px";
		this.o.style.top = (point[1]-r) + "px";
		this._point=point;
		this._r=r;
		this._afterInit();
	}
	this.init(point, r);
	this.rotate=function(arg,center){
		var newPoints = JsGraphUtil.rotate([this._point],arg,center);
		this.init(newPoints[0],this._r);
		return this;
	}
}
jsGraphCircleVML.prototype=new jsGraphShapeVML();

function jsGraphRectVML(target, point1, point2){
	this.target=target;
	jsGraphShapeVML.curId++;
	this.init= function (point1, point2){
		this.params=arguments;
		this._beforeInit();
		this.o = document.createElement("v:Rect");
		this.o.style.width = (point2[0] - point1[0]) + "px";
		this.o.style.height = (point2[1] - point1[1]) + "px";
		this.o.style.left = point1[0] + "px";
		this.o.style.top = point1[1] + "px";
		this._afterInit();
	}
	this.init(point1, point2);
	this.rotate=function(arg,center){
		var c=[(this.params[0][0]+this.params[1][0])/2,(this.params[0][1]+this.params[1][1])/2];
		var np = JsGraphUtil.rotate([c],arg,center);
		var w=this.params[1][0]-this.params[0][0];
		var h=this.params[1][1]-this.params[0][1];
		var p1=[np[0][0]-w/2,np[0][1]-h/2];
		var p2=[np[0][0]+w/2,np[0][1]+h/2];
		this.init(p1,p2);
		var old=this._rotation?parseInt(this.o.style.rotation):this._rotation=0;
		this._rotation+=parseInt(arg);
		this.o.style.rotation = this._rotation;
		return this;
	}
}
jsGraphRectVML.prototype=new jsGraphShapeVML();

function jsRoundRectShapeVML(target,point1, point2, r){
	this.target=target;
	jsGraphShapeVML.curId++;
	this.init= function (point1, point2,r){
		this.params=arguments;
		this._beforeInit();
		this.o = document.createElement("v:RoundRect");
		this.o.style.position = "absolute";
		this.o.style.width = (point2[0] - point1[0]) + "px";
		this.o.style.height = (point2[1] - point1[1]) + "px";
		this.o.arcsize=r/Math.min(point2[0] - point1[0],point2[1] - point1[1]);
		this.o.style.left = point1[0] + "px";
		this.o.style.top = point1[1] + "px";
		this._afterInit();
	}
	this.init(point1, point2,r);
	this.rotate=function(arg,center){
		var c=[(this.params[0][0]+this.params[1][0])/2,(this.params[0][1]+this.params[1][1])/2];
		var np = JsGraphUtil.rotate([c],arg,center);
		var w=this.params[1][0]-this.params[0][0];
		var h=this.params[1][1]-this.params[0][1];
		var p1=[np[0][0]-w/2,np[0][1]-h/2];
		var p2=[np[0][0]+w/2,np[0][1]+h/2];
		this.init(p1,p2);
		var old=this._rotation?parseInt(this.o.style.rotation):this._rotation=0;
		this._rotation+=parseInt(arg);
		this.o.style.rotation = this._rotation;
		return this;
	}
}
jsRoundRectShapeVML.prototype=new jsGraphShapeVML();

function jsArcShapeVML(target,point, r, beginArg, arg){
	this.target=target;
	jsGraphShapeVML.curId++;
	this.init =function(point, r, beginArg, arg){
		this.params=arguments;
		this._beforeInit();
		this.o = document.createElement("v:arc");
		this.o.StartAngle=beginArg;
		this.o.EndAngle=beginArg+arg;
		this.o.style.width=(r*2)+'px';
		this.o.style.height=(r*2)+'px';
		this.o.style.position = "absolute";
		this.o.style.left = (point[0]-r) + "px";
		this.o.style.top = (point[1]-r) + "px";
		this._afterInit();
	}
	this.init(point, r, beginArg, arg);
	this.rotate=function(arg,center){
		var newPoints = JsGraphUtil.rotate([this.params[0]],arg,center);
		this.init(newPoints[0],this.params[1],this.params[2]+arg,this.params[3]);
		return this;
	}
}
jsArcShapeVML.prototype=new jsGraphShapeVML();

function jsLineShapeVML(target,point1, point2){
	this.target=target;
	jsGraphShapeVML.curId++;
	this.init = function(point1, point2){
		this.params=arguments;
		this._beforeInit();
		this.o = document.createElement("v:line");
		this.o.style.position = "absolute";
		this.o.from=point1[0]+','+point1[1];
		this.o.to=point2[0]+','+point2[1];
		this._afterInit();
	}
	this.init(point1, point2);
	this.rotate=function(arg,center){
		var newPoints = JsGraphUtil.rotate(this.params,arg,center);
		this.init(newPoints[0],newPoints[1]);
		return this;
	}
}
jsLineShapeVML.prototype=new jsGraphShapeVML();

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
	this.polygon=function(points){
		var ret=new jsGraphPolygonVML(this.target,points);
		return ret;
	}
	this.circle=function(point,r){
		var ret=new jsGraphCircleVML(this.target,point,r);
		return ret;
	}
	
	this.ellipse = function(point1, point2){
		var ret=new jsGraphEllipseVML(this.target,point1, point2);
		return ret;
	}
	this.rect = function(point1, point2){
		var ret=new jsGraphRectVML(this.target,point1, point2);
		return ret;
	}
	this.roundRect = function(point1, point2, r){
		var ret=new jsRoundRectShapeVML(this.target,point1, point2,r);
		return ret;
	}
	this.line = function(point1, point2){
		var ret=new jsLineShapeVML(this.target,point1, point2);
		return ret;
	}
	this.arc = function(point, r, beginArg, arg){
		var ret=new jsArcShapeVML(this.target,point, r, beginArg, arg);
		return ret;
	}
}
function VMLObject(obj,param){
	this.obj = obj;
	this.param=param;

	this.setCenter=function(point){
		this.center=point;
		this.obj.style.centerX=point[0];
		this.obj.style.centerY=point[1];
	}
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
		this.gradient=o;
		this.obj.appendChild(o);
	}
	this.rotate = function(arg){
		var old=this.obj.style.rotation?parseInt(this.obj.style.rotation):0;
		this.obj.style.rotation = old+parseInt(arg);
		if (this.gradient){
			this.gradient.angle-=arg;
		}
	}
}
//end vml

