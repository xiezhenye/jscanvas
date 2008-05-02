function createJsGraph(target,width,height) {
	if (document.createElementNS) {
		return new jsGraphSVG(target,width,height);
	} else if(document.createStyleSheet) {
		return new jsGraphVML(target,width,height);
	}
}
var JsGraphUtil={
calcCenter:function(shape,param){
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
},
rotate:function(points,arg,center){
	var ps=[];
	for(var i=0;i<points.length;i++){
		var t=arg/180.0*Math.PI;
		var dx=points[i][0]-center[0];
		var dy=points[i][1]-center[1];
		ps.push([dx*Math.cos(t)-dy*Math.sin(t)+center[0],dx*Math.sin(t)+dy*Math.cos(t)+center[1]]);
	}
	return ps;
}
}
function jsGraphBindShapeFunc(space,o,target){
	o.group=function(point){
		var ret=new space.Group(target,point);
		return ret;
	}
	o.polygon=function(points){
		var ret=new space.Polygon(target,points);
		return ret;
	}
	o.circle=function(point,r){
		var ret=new space.Circle(target,point,r);
		return ret;
	}
	o.ellipse = function(point1, point2){
		var ret=new space.Ellipse(target,point1, point2);
		return ret;
	}
	o.rect = function(point1, point2){
		var ret=new space.Rect(target,point1, point2);
		return ret;
	}
	o.roundRect = function(point1, point2, r){
		var ret=new space.RoundRect(target,point1, point2,r);
		return ret;
	}
	o.line = function(point1, point2){
		var ret=new space.Line(target,point1, point2);
		return ret;
	}
	o.arc = function(point, r, beginArg, arg){
		var ret=new space.Arc(target,point, r, beginArg, arg);
		return ret;
	}
	o.sector = function(point, r, beginArg, arg){
		var ret=new space.Sector(target,point, r, beginArg, arg);
		return ret;
	}
}
function jsGraphShape(){
	this.show=function(){
		this.o.style.visibility='visible';
	}
	this.hide=function(){
		this.o.style.visibility='hidden';
	}
}

//begin svg
var jsGraphShapeSVG={}
jsGraphShapeSVG.Base=function(){
	this.svgNS = "http://www.w3.org/2000/svg";
	this.svg=null;
	this.setSVG=function(svg){
		this.svg=svg;
	}
	this.fill=function(fill){
		if (fill != null) {
			this.o.setAttribute("fill", fill);
		} else {
			this.o.setAttribute("fill", "none");
		}
		return this;
	}
	this.stroke=function(stroke, strokeWidth){
		if (stroke != null) {
			this.o.setAttribute("stroke", stroke);
		} else {
			this.o.setAttribute("stroke", "none");
		}
		if (strokeWidth != null) {
			this.o.setAttribute("stroke-width", strokeWidth+'px');
		} else {
			this.o.setAttribute("stroke-width", 0+'px');
		}
		return this;
	}
	this.draw=function(svg){
		this.svg.appendChild(this.o);
	}
	this.rotate=function(arg,center){
		var t = this.o.getAttribute('transform');
		if (t==null){
			t='';
		}
		var m=t.match(/^(.*)rotate\(([^\)]+)\)\s*$/)
		if (m){
			var ps=m[2].split(' ');
			t=m[1]+" rotate("+(arg+parseInt(ps[0]))+" "+center[0]+" "+center[1]+")"
		} else {
			t+= " rotate("+arg+" "+center[0]+" "+center[1]+")"
		}
		this.o.setAttribute('transform',t);
		return this;
	}
	this.onclick=function(callback){
		var self=this;
		this.o.onclick=function(e){
			callback(e,self);
		}
		return this;
	}
}
jsGraphShapeSVG.Base.prototype=new jsGraphShape();

jsGraphShapeSVG.Group=function(svg,point){
	this.o = document.createElementNS(this.svgNS, "g");
	this._point=point;
	this.svg=svg;
	this.init= function (point){
		var t='translate('+point[0]+','+point[1]+')';
		this.o.setAttribute('transform',t);
		this.svg.appendChild(this.o);
	}
	this.init(point);
	this.oldRotate=this.rotate;
	this.rotate=function(arg,center){
		this.oldRotate(arg,[center[0]-this._point[0],center[1]-this._point[1]]);
	}
	jsGraphBindShapeFunc(jsGraphShapeSVG,this,this.o);
}
jsGraphShapeSVG.Group.prototype=new jsGraphShapeSVG.Base();

jsGraphShapeSVG.Polygon=function(svg,points){
	this.o = document.createElementNS(this.svgNS, "polygon");
	this.svg=svg;
	this.init= function (points){
		var pointsAttr = '';
		for (var i=0;i<points.length ;i++ ){
			pointsAttr+= points[i][0]+','+points[i][1]+' ';
		}
		this.points=points;
		this.o.setAttribute("points", pointsAttr);
		this.svg.appendChild(this.o);
	}
	this.init(points);
}
jsGraphShapeSVG.Polygon.prototype=new jsGraphShapeSVG.Base();

jsGraphShapeSVG.Circle=function(svg,point, r){
	this.svg=svg;
	this.o = document.createElementNS(this.svgNS, "circle");
	this.init = function(point, r){
		this.o.setAttribute("r", r);
		this.o.setAttribute("cx", point[0]+"px");
		this.o.setAttribute("cy", point[1]+"px");
		this.svg.appendChild(this.o);
		//return new SVGObject(o,['circle',[point, r]]);
	}
	this.init(point, r);
}
jsGraphShapeSVG.Circle.prototype=new jsGraphShapeSVG.Base();

jsGraphShapeSVG.Rect=function(svg,point1, point2){
	this.svg=svg;
	this.o = document.createElementNS(this.svgNS, "rect");
	this.init = function(point1, point2){
		this.o.setAttribute("x", point1[0]+"px");
		this.o.setAttribute("y", point1[1]+"px");
		this.o.setAttribute("width", (point2[0]-point1[0])+"px");
		this.o.setAttribute("height", (point2[1]-point1[1])+"px");
		this.svg.appendChild(this.o);
	}
	this.init(point1,point2);
}
jsGraphShapeSVG.Rect.prototype=new jsGraphShapeSVG.Base();

jsGraphShapeSVG.Ellipse=function(svg,point1, point2){
	this.svg=svg;
	this.o = document.createElementNS(this.svgNS, "ellipse");
	this.init = function(point1, point2){
		this.o.setAttribute("cx", ((point1[0]+point2[0])/2)+"px");
		this.o.setAttribute("cy", ((point1[1]+point2[1])/2)+"px");
		this.o.setAttribute("rx", ((point2[0]-point1[0])/2)+"px");
		this.o.setAttribute("ry", ((point2[1]-point1[1])/2)+"px");
		this.svg.appendChild(this.o);
		//return new SVGObject(o,['ellipse',[point1, point2]]);
	}
	this.init(point1,point2);
}
jsGraphShapeSVG.Ellipse.prototype=new jsGraphShapeSVG.Base();

jsGraphShapeSVG.RoundRect=function(svg,point1, point2,r){
	this.svg=svg;
	this.o = document.createElementNS(this.svgNS, "rect");
	this.init = function(point1, point2,r){
		this.o.setAttribute("x", point1[0]+"px");
		this.o.setAttribute("y", point1[1]+"px");
		this.o.setAttribute("width", (point2[0]-point1[0])+"px");
		this.o.setAttribute("height", (point2[1]-point1[1])+"px");
		this.o.setAttribute("rx", parseInt(r)+"px");
		this.o.setAttribute("ry", parseInt(r)+"px");
		this.svg.appendChild(this.o);
		//return new SVGObject(o,['roundRect',[point1,point2,r]]);
	}
	this.init(point1,point2,r);
}
jsGraphShapeSVG.RoundRect.prototype=new jsGraphShapeSVG.Base();

jsGraphShapeSVG.Line=function(svg,point1, point2){
	this.svg=svg;
	this.o = document.createElementNS(this.svgNS, "line");
	this.init = function(point1, point2){
		this.o.setAttribute("x1", point1[0]+"px");
		this.o.setAttribute("y1", point1[1]+"px");
		this.o.setAttribute("x2", point2[0]+"px");
		this.o.setAttribute("y2", point2[1]+"px");
		this.svg.appendChild(this.o);
	}
	this.init(point1, point2);
}
jsGraphShapeSVG.Line.prototype=new jsGraphShapeSVG.Base();

jsGraphShapeSVG.Arc=function(svg,point, r, beginArg, arg){
	this.svg=svg;
	this.o = document.createElementNS(this.svgNS, "path");
	this.init = function(point, r, beginArg, arg){
		var bx = r * Math.cos((beginArg-90)/180*Math.PI)+point[0];
		var by = r * Math.sin((beginArg-90)/180*Math.PI)+point[1];
		var ex = r * Math.cos((beginArg-90+arg)/180*Math.PI)+point[0];
		var ey = r * Math.sin((beginArg-90+arg)/180*Math.PI)+point[1];
		var dr=arg>0?1:0;
		var d = 'M'+bx+' '+by+' A'+r+' '+r+' 0 0 '+dr+' '+ex+' '+ey;
		this.o.setAttribute("d", d);
		this.svg.appendChild(this.o);
	}
	this.init(point, r, beginArg, arg);
}
jsGraphShapeSVG.Arc.prototype=new jsGraphShapeSVG.Base();

function jsGraphSVG(target, width, height) {
	var svgNS = "http://www.w3.org/2000/svg";	
	this.svg = document.createElementNS(svgNS, "svg");
	this.svg.setAttribute('width',width);
	this.svg.setAttribute('height',height);
	jsGraphSVG.def = document.createElementNS(svgNS, "def");
	this.svg.appendChild(jsGraphSVG.def);
	jsGraphSVG.defId = 0;
	target.appendChild(this.svg);
	jsGraphBindShapeFunc(jsGraphShapeSVG,this,this.svg);
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

//begin vml
var jsGraphShapeVML={}
jsGraphShapeVML.Base=function(){
	jsGraphShapeVML.Base.curId=1;
	this.setTarget=function(target){
		this.target=target;
	}
	this.fill=function(fill){
		if (fill != null) {
			this.o.fillcolor = fill;
		} else {
			this.o.filled = "false";
		}
		return this;
	}
	this.stroke=function(stroke, strokeWidth){
		if (strokeWidth != 0) {
			this.o.strokeweight = strokeWidth;
		} else {
			this.o.strokeweight = "0";
			this.o.stroked = "false";
		}
		
		if (stroke==null){
			this.o.stroked = "false";
		}else{
			this.o.strokecolor = stroke;
		}
		return this;
	}
	this.draw=function(target){
		var target=target||this.target;
		target.appendChild(this.o);
	}
	this.remove=function(){
		try{
		this.target.removeChild(this.o);
		}catch(e){}
	}
	this.onclick=function(f){
		this._onclick=f;
		var self=this;
		this.o.onclick=function(){
			f(window.event,self);
		}
		return this;
	}
	this._beforeInit=function(){
		if (!this.id){
			this.id=jsGraphShapeVML.Base.curId;
		}
	}
	this._afterInit=function(){
		this.o.style.zIndex=this.id;
		this.o.style.position = "absolute";
	}
}
jsGraphShapeVML.Base.prototype=new jsGraphShape();

jsGraphShapeVML.Polygon=function(target,points){
	this.target=target;
	jsGraphShapeVML.Base.curId++;
	this.o = document.createElement("v:polyline");
	this.init= function (points){
		this._beforeInit();
		var pointsAttr='';
		for (var i=0;i<points.length ;i++ ){
			pointsAttr+= points[i][0]+','+points[i][1]+' ';
		}
		pointsAttr+= points[0][0]+','+points[0][1];
		this.params=arguments;
		this.remove();
		this.o.points=pointsAttr;
		this.draw();
		this._afterInit();
	}
	this.init(points);
	this.rotate=function(arg,center){
		var newPoints = JsGraphUtil.rotate(this.params[0],arg,center);
		this.init(newPoints);
		return this;
	}
}
jsGraphShapeVML.Polygon.prototype=new jsGraphShapeVML.Base();

jsGraphShapeVML.Ellipse=function(target,point1, point2){
	this.target=target;
	jsGraphShapeVML.Base.curId++;
	this.o = document.createElement("v:oval");
	this.init= function (point1, point2){
		this._beforeInit();
		this.o.style.width = (point2[0] - point1[0]) + "px";
		this.o.style.height = (point2[1] - point1[1]) + "px";
		this.o.style.left = point1[0] + "px";
		this.o.style.top = point1[1] + "px";
		this.params=arguments;
		this._afterInit();
	}
	this.init(point1, point2);
	this.draw();
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
jsGraphShapeVML.Ellipse.prototype=new jsGraphShapeVML.Base();

jsGraphShapeVML.Circle=function(target,point, r){
	this.target=target;
	jsGraphShapeVML.Base.curId++;
	this.o = document.createElement("v:oval");
	this.init= function (point, r){
		this._beforeInit();
		this.o.style.width = (r*2) + "px";
		this.o.style.height = (r*2) + "px";
		this.o.style.left = (point[0]-r) + "px";
		this.o.style.top = (point[1]-r) + "px";
		this._point=point;
		this._r=r;
		this._afterInit();
	}
	this.init(point, r);
	this.draw();
	this.rotate=function(arg,center){
		var newPoints = JsGraphUtil.rotate([this._point],arg,center);
		this.init(newPoints[0],this._r);
		return this;
	}
}
jsGraphShapeVML.Circle.prototype=new jsGraphShapeVML.Base();

jsGraphShapeVML.Rect=function(target, point1, point2){
	this.target=target;
	jsGraphShapeVML.Base.curId++;
	this.o = document.createElement("v:Rect");
	this.init= function (point1, point2){
		this.params=arguments;
		this._beforeInit();
		
		this.o.style.width = (point2[0] - point1[0]) + "px";
		this.o.style.height = (point2[1] - point1[1]) + "px";
		this.o.style.left = point1[0] + "px";
		this.o.style.top = point1[1] + "px";
		this._afterInit();
	}
	this.init(point1, point2);
	this.draw();
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
jsGraphShapeVML.Rect.prototype=new jsGraphShapeVML.Base();

jsGraphShapeVML.RoundRect=function(target,point1, point2, r){
	this.target=target;
	jsGraphShapeVML.Base.curId++;
	this.o = document.createElement("v:RoundRect");
	this.init= function (point1, point2,r){
		this.params=arguments;
		this._beforeInit();
		this.o.style.position = "absolute";
		this.o.style.width = (point2[0] - point1[0]) + "px";
		this.o.style.height = (point2[1] - point1[1]) + "px";
		this.o.arcsize=r/Math.min(point2[0] - point1[0],point2[1] - point1[1]);
		this.o.style.left = point1[0] + "px";
		this.o.style.top = point1[1] + "px";
		this._afterInit();
	}
	this.init(point1, point2,r);
	this.draw();
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
jsGraphShapeVML.RoundRect.prototype=new jsGraphShapeVML.Base();

jsGraphShapeVML.Arc=function(target,point, r, beginArg, arg){
	this.target=target;
	jsGraphShapeVML.Base.curId++;
	this.o = document.createElement("v:arc");
	this.init =function(point, r, beginArg, arg){
		this.params=arguments;
		this._beforeInit();
		beginArg=beginArg>180?beginArg-360:beginArg;
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
	this.draw();
	this.rotate=function(arg,center){
		var newPoints = JsGraphUtil.rotate([this.params[0]],arg,center);
		this.init(newPoints[0],this.params[1],this.params[2]+arg,this.params[3]);
		return this;
	}
}
jsGraphShapeVML.Arc.prototype=new jsGraphShapeVML.Base();

jsGraphShapeVML.Line=function(target,point1, point2){
	this.target=target;
	jsGraphShapeVML.Base.curId++;
	this.o = document.createElement("v:line");
	this.init = function(point1, point2){
		this.params=arguments;
		this._beforeInit();
		this.o.style.position = "absolute";
		this.o.from=point1[0]+','+point1[1];
		this.o.to=point2[0]+','+point2[1];
		this._afterInit();
	}
	this.init(point1, point2);
	this.draw();
	this.rotate=function(arg,center){
		var newPoints = JsGraphUtil.rotate(this.params,arg,center);
		this.init(newPoints[0],newPoints[1]);
		return this;
	}
}
jsGraphShapeVML.Line.prototype=new jsGraphShapeVML.Base();

jsGraphShapeVML.Group=function(target,point){
	this.target=target;
	jsGraphShapeVML.Base.curId++;
	this.o=document.createElement("v:group");
	this.init = function(point){
		this._point=point;
		this._beforeInit();
		this.o.style.left=point[0]+'px';
		this.o.style.top=point[1]+'px';
		this.o.coordsize='1,1';
		this.o.style.width='1px';
		this.o.style.height='1px';
		this._afterInit();
	}
	this.init(point);	
	this.target.appendChild(this.o);
	this.rotate=function(arg,center){
		var newPoints = JsGraphUtil.rotate([this._point],arg,center);
		this.init(newPoints[0]);
		var old=this._rotation?parseInt(this.o.style.rotation):this._rotation=0;
		this._rotation+=parseInt(arg);
		this.o.style.rotation=this._rotation;
	}
	jsGraphBindShapeFunc(jsGraphShapeVML,this,this.o);
}
jsGraphShapeVML.Group.prototype=new jsGraphShapeVML.Base();
function jsGraphVML(target) {
	if(jsGraphVML.inited==undefined){
		document.namespaces.add("v", "urn:schemas-microsoft-com:vml");
		var style = document.createStyleSheet();
		style.addRule('v\\:*', "behavior: url(#default#VML);");
		target.style.position='relative';
	}
	jsGraphVML.inited=true;
	this.target = target;
	jsGraphBindShapeFunc(jsGraphShapeVML,this,this.target);
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

