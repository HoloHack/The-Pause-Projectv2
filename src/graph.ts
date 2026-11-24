/**
 * The Impact Network: a deterministic teaching diagram rendered in 3D with WebGL2.
 * It uses time as a fourth (temporal) variable. It does NOT predict real behaviour.
 */
export type NetworkAction = 'forward' | 'pause' | 'checkin' | 'adult';

type Point = { x: number; y: number; z: number; kind: 'message' | 'peer' | 'support' };
type Edge = { from: number; to: number; kind: 'message' | 'support' };

type Plan = { nodes: number[]; edges: Edge[] };
const NODES: Point[] = [
  {x:-2.9,y:0,z:0,kind:'message'},
  {x:-1.4,y:1.08,z:-.6,kind:'peer'},
  {x:-1.4,y:-.55,z:.38,kind:'peer'},
  {x:-.22,y:1.52,z:.24,kind:'peer'},
  {x:-.14,y:.36,z:-.5,kind:'peer'},
  {x:.18,y:-1.18,z:-.25,kind:'peer'},
  {x:1.24,y:1.54,z:-.36,kind:'peer'},
  {x:1.38,y:.44,z:.28,kind:'peer'},
  {x:1.65,y:-.75,z:-.5,kind:'peer'},
  {x:2.72,y:.98,z:-.3,kind:'peer'},
  {x:2.85,y:-.72,z:-.35,kind:'peer'},
  {x:.45,y:-1.83,z:.15,kind:'support'},
  {x:2.25,y:-1.75,z:.2,kind:'support'}
];
const BASE: Edge[] = [{from:0,to:1,kind:'message'},{from:0,to:2,kind:'message'}];
const PLANS: Record<NetworkAction,Plan> = {
  forward:{nodes:[0,1,2,3,4,5,6,7,8,9,10],edges:[...BASE,{from:1,to:3,kind:'message'},{from:1,to:4,kind:'message'},{from:2,to:5,kind:'message'},{from:3,to:6,kind:'message'},{from:4,to:7,kind:'message'},{from:5,to:8,kind:'message'},{from:6,to:9,kind:'message'},{from:7,to:9,kind:'message'},{from:8,to:10,kind:'message'}]},
  pause:{nodes:[0,1,2],edges:BASE},
  checkin:{nodes:[0,1,2,11],edges:[...BASE,{from:2,to:11,kind:'support'}]},
  adult:{nodes:[0,1,2,11,12],edges:[...BASE,{from:2,to:11,kind:'support'},{from:11,to:12,kind:'support'}]}
};

const VERTEX = `#version 300 es
precision highp float;
in vec3 aPosition;
in vec3 aColor;
in float aSize;
in float aPhase;
uniform mat4 uProjection;
uniform float uTime;
uniform float uYaw;
uniform float uCameraZ;
uniform float uWave;
out vec3 vColor;
out float vPulse;
void main() {
  float angle=uYaw;
  float co=cos(angle), si=sin(angle);
  vec3 p=vec3(co*aPosition.x+si*aPosition.z,aPosition.y,-si*aPosition.x+co*aPosition.z);
  // Small, bounded temporal movement reinforces that connections persist over time.
  p.y+=0.018*sin(uTime*0.55+aPhase*8.0);
  p.z-=uCameraZ;
  gl_Position=uProjection*vec4(p,1.0);
  float pulse=exp(-abs(uWave-aPhase)*7.0);
  vPulse=pulse;
  vColor=aColor;
  gl_PointSize=clamp(aSize*(1.0+pulse*0.3)*9.0/max(1.0,gl_Position.w),3.0,35.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
in vec3 vColor;
in float vPulse;
uniform int uMode;
out vec4 outColor;
void main(){
  float alpha;
  if(uMode==1){
    float radius=length(gl_PointCoord-vec2(.5));
    float core=1.0-smoothstep(.19,.37,radius);
    float halo=(1.0-smoothstep(.25,.5,radius))*.24;
    alpha=core+halo;
    if(alpha<.015) discard;
  } else {
    alpha=.53;
  }
  float luminous=1.0+.55*vPulse;
  outColor=vec4(min(vColor*luminous,vec3(1.0)),alpha);
}`;

type ShaderHandles = {
  position:number;color:number;size:number;phase:number;
  projection:WebGLUniformLocation;time:WebGLUniformLocation;yaw:WebGLUniformLocation;
  cameraZ:WebGLUniformLocation;wave:WebGLUniformLocation;mode:WebGLUniformLocation
};

function compile(gl:WebGL2RenderingContext,type:number,source:string):WebGLShader{
  const shader=gl.createShader(type);
  if(!shader)throw new Error('Unable to create shader');
  gl.shaderSource(shader,source);gl.compileShader(shader);
  if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
    const message=gl.getShaderInfoLog(shader)||'unknown compile error';gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}
function createProgram(gl:WebGL2RenderingContext):WebGLProgram{
  const vs=compile(gl,gl.VERTEX_SHADER,VERTEX);
  const fs=compile(gl,gl.FRAGMENT_SHADER,FRAGMENT);
  const program=gl.createProgram();
  if(!program)throw new Error('Unable to create WebGL program');
  gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
  gl.deleteShader(vs);gl.deleteShader(fs);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
    const message=gl.getProgramInfoLog(program)||'unknown link error';gl.deleteProgram(program);
    throw new Error(message);
  }
  return program;
}
function getLocation(gl:WebGL2RenderingContext,p:WebGLProgram,name:string):WebGLUniformLocation{
  const value=gl.getUniformLocation(p,name);
  if(value===null)throw new Error(`Missing uniform ${name}`);
  return value;
}
function perspective(fovRadians:number,aspect:number,near:number,far:number):Float32Array{
  const f=1/Math.tan(fovRadians/2);
  const range=1/(near-far);
  return new Float32Array([f/aspect,0,0,0, 0,f,0,0, 0,0,(near+far)*range,-1, 0,0,2*near*far*range,0]);
}
function rgb(kind:'message'|'support'):number[]{return kind==='support'?[.80,.91,.85]:[1,.67,.46]}
function packPoint(p:Point,phase:number,size:number):number[]{return [p.x,p.y,p.z,...rgb(p.kind==='support'?'support':'message'),size,phase]}
function packEdge(e:Edge,index:number,total:number):number[]{
  const a=NODES[e.from],b=NODES[e.to];
  const color=rgb(e.kind);
  const phaseA=Math.min(.95,index/Math.max(1,total));
  const phaseB=Math.min(.98,(index+1)/Math.max(1,total));
  return [a.x,a.y,a.z,...color,1,phaseA,b.x,b.y,b.z,...color,1,phaseB];
}

export class ImpactGraph {
  private gl:WebGL2RenderingContext|null=null;
  private canvas:HTMLCanvasElement;
  private container:HTMLElement;
  private program:WebGLProgram|null=null;
  private buffer:WebGLBuffer|null=null;
  private handles:ShaderHandles|null=null;
  private action:NetworkAction='forward';
  private points=new Float32Array();private lines=new Float32Array();
  private frame=0;private visible=false;private lost=false;private disposed=false;
  private start=performance.now();private pulseStart=performance.now();
  private reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  private resizeObserver:ResizeObserver|null=null;
  private visibilityObserver:IntersectionObserver|null=null;
  readonly available:boolean=false;

  constructor(canvas:HTMLCanvasElement){
    this.canvas=canvas;
    this.container=canvas.parentElement as HTMLElement;
    try{
      const gl=canvas.getContext('webgl2',{alpha:true,depth:false,stencil:false,antialias:true,powerPreference:'low-power'});
      if(!gl)throw new Error('WebGL2 unavailable');
      this.gl=gl;this.initialise();
      (this as {available:boolean}).available=true;
      this.buildVertices();
      this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas.parentElement as Element);
      this.visibilityObserver=new IntersectionObserver(items=>{
        this.visible=items.some(item=>item.isIntersecting)&&!document.hidden;
        if(this.visible)this.run();else this.stop();
      },{threshold:.04});
      this.visibilityObserver.observe(canvas);
      document.addEventListener('visibilitychange',this.onVisibility);
      canvas.addEventListener('webglcontextlost',this.onLost);
      canvas.addEventListener('webglcontextrestored',this.onRestore);
      this.resize();
    }catch(err){this.showFallback();console.warn('Using the accessible network diagram instead of WebGL.',err)}
  }
  private onVisibility=():void=>{this.visible=!document.hidden&&this.isOnScreen();if(this.visible)this.run();else this.stop()};
  private onLost=(event:Event):void=>{event.preventDefault();this.lost=true;this.stop();this.showFallback()};
  private onRestore=():void=>{
    if(this.disposed)return;
    try{this.lost=false;this.initialise();this.resize();this.run();this.container.classList.remove('no-webgl')}
    catch(err){this.lost=true;this.showFallback();console.warn('WebGL recovery unsuccessful',err)}
  };
  private isOnScreen():boolean{const r=this.canvas.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight}
  private showFallback():void{this.container.classList.add('no-webgl')}
  private initialise():void{
    const gl=this.gl;if(!gl)return;
    this.program=createProgram(gl);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);this.buffer=gl.createBuffer();if(!this.buffer)throw new Error('WebGL buffer unavailable');
    const p=this.program;
    this.handles={
      position:gl.getAttribLocation(p,'aPosition'),color:gl.getAttribLocation(p,'aColor'),size:gl.getAttribLocation(p,'aSize'),phase:gl.getAttribLocation(p,'aPhase'),
      projection:getLocation(gl,p,'uProjection'),time:getLocation(gl,p,'uTime'),yaw:getLocation(gl,p,'uYaw'),
      cameraZ:getLocation(gl,p,'uCameraZ'),wave:getLocation(gl,p,'uWave'),mode:getLocation(gl,p,'uMode')
    };
  }
  setAction(action:NetworkAction):void{this.action=action;this.buildVertices();this.pulseStart=performance.now();if(this.reduced)this.draw(performance.now())}
  replay():void{this.pulseStart=performance.now();this.run()}
  private buildVertices():void{
    const plan=PLANS[this.action];
    this.points=new Float32Array(plan.nodes.flatMap((id,i)=>packPoint(NODES[id],i/Math.max(1,plan.nodes.length),id===0?22:NODES[id].kind==='support'?19:15)));
    this.lines=new Float32Array(plan.edges.flatMap((e,i)=>packEdge(e,i,plan.edges.length)));
  }
  private resize():void{
    if(!this.gl||this.lost||this.disposed)return;
    const bounds=this.container.getBoundingClientRect();
    const dpr=Math.min(devicePixelRatio||1,innerWidth<700?1.2:1.6);
    const width=Math.max(1,Math.floor(bounds.width*dpr)),height=Math.max(1,Math.floor(bounds.height*dpr));
    if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height}
    this.gl.viewport(0,0,width,height);
    if(this.reduced)this.draw(performance.now());
  }
  private bindVertices(data:Float32Array):void{
    const gl=this.gl,h=this.handles,b=this.buffer;
    if(!gl||!h||!b)return;
    gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.DYNAMIC_DRAW);
    const stride=8*Float32Array.BYTES_PER_ELEMENT;
    const specs:[[number,number,number],[number,number,number],[number,number,number],[number,number,number]]=[
      [h.position,3,0],[h.color,3,3],[h.size,1,6],[h.phase,1,7]
    ];
    specs.forEach(([location,size,offset])=>{
      if(location>=0){gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,size,gl.FLOAT,false,stride,offset*4)}
    });
  }
  private draw=(now:number):void=>{
    const gl=this.gl,p=this.program,h=this.handles;
    if(!gl||!p||!h||this.lost||this.disposed)return;
    gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(p);
    const aspect=Math.max(.5,this.canvas.width/Math.max(1,this.canvas.height));
    gl.uniformMatrix4fv(h.projection,false,perspective(Math.PI/3.5,aspect,.1,40));
    gl.uniform1f(h.time,this.reduced?0:(now-this.start)/1000);
    gl.uniform1f(h.yaw,this.reduced?.11:.11+Math.sin(now/5800)*.035);
    gl.uniform1f(h.cameraZ,aspect<1.25?9.8:7.7);
    gl.uniform1f(h.wave,this.reduced?0:Math.min(1.7,(now-this.pulseStart)/1450));
    this.bindVertices(this.lines);gl.uniform1i(h.mode,0);gl.drawArrays(gl.LINES,0,this.lines.length/8);
    this.bindVertices(this.points);gl.uniform1i(h.mode,1);gl.drawArrays(gl.POINTS,0,this.points.length/8);
  };
  private run():void{
    if(this.disposed||this.lost||!this.gl)return;
    if(this.reduced){this.draw(performance.now());return}
    if(this.frame)return;
    const loop=(now:number):void=>{
      this.frame=0;
      if(this.disposed||this.lost||!this.visible)return;
      this.draw(now);
      this.frame=requestAnimationFrame(loop);
    };
    this.frame=requestAnimationFrame(loop);
  }
  private stop():void{if(this.frame){cancelAnimationFrame(this.frame);this.frame=0}}
  destroy():void{
    this.disposed=true;this.stop();this.resizeObserver?.disconnect();this.visibilityObserver?.disconnect();
    document.removeEventListener('visibilitychange',this.onVisibility);
    this.canvas.removeEventListener('webglcontextlost',this.onLost);
    this.canvas.removeEventListener('webglcontextrestored',this.onRestore);
    if(this.gl&&!this.lost){if(this.buffer)this.gl.deleteBuffer(this.buffer);if(this.program)this.gl.deleteProgram(this.program)}
  }
}
