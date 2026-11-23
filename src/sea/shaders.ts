const COMMON = /* glsl */ `#version 300 es
precision highp float;
precision highp int;
uniform vec2 uView;        // F, horizon (screen units, half height = 1)
uniform float uAspect, uCamH, uTime;
uniform vec4 uWave[6];     // kx, kz, amplitude, phase (phase carries camera + time)
uniform vec4 uRip[10];     // x, z (camera relative), age, strength

uint pcg(uint v){ uint s=v*747796405u+2891336453u; uint w=((s>>((s>>28u)+4u))^s)*277803737u; return (w>>22u)^w; }
vec4 rand4(uint h){ uint a=pcg(h),b=pcg(a),c=pcg(b),d=pcg(c); return vec4(a,b,c,d)/4294967295.0; }

// height and slopes of the sea at p (camera relative x, z)
vec3 sea(vec2 p, float z){
  vec3 o=vec3(0.);
  for(int i=0;i<6;i++){
    vec4 w=uWave[i];
    float lod=1.-smoothstep(6.,26.,z*length(w.xy)*.12);
    float a=w.x*p.x+w.y*p.y+w.w;
    float s=sin(a), c=cos(a);
    o.x+=w.z*lod*(s+.28*s*s);
    o.yz+=w.xy*(w.z*lod*c*(1.+.56*s));
  }
  for(int i=0;i<10;i++){
    vec4 r=uRip[i];
    if(r.w<=0.) continue;
    vec2 d=p-r.xy; float l=length(d)+1e-4;
    float front=r.z*1.9, x=l-front;
    float env=exp(-x*x*5.)*r.w*exp(-r.z*1.15)*smoothstep(0.,.12,r.z);
    o.x+=env*cos(x*9.);
    o.yz+=d/l*(env*(-9.*sin(x*9.)-10.*x*cos(x*9.)));
  }
  return o;
}
`;

/** The sea: one instanced draw per distance band, strokes anchored to the water, far to near. */
export const SEA_VS = COMMON + /* glsl */ `
layout(location=0) in vec2 aCorner;
uniform ivec4 uGrid;       // cols, rows, first col, first row
uniform vec4 uStep;        // dx, dz, offset x, offset z (camera relative)
uniform vec2 uBand;        // near z, far z
uniform int uLayer;        // 0 body, 1 light
uniform vec3 uDeep,uMid,uTeal,uLight,uCool,uWarm,uHot,uSkyTop,uSkyLow,uSun,uFoam;
uniform vec4 uSunDir;      // screen x of the sun, height, glitter, haze
uniform vec4 uTitle;       // centre x,y and half size x,y of the painted title
uniform float uTitleK;
uniform vec4 uBoat[4];     // x, z (camera relative), scale, lean
uniform vec4 uStone;       // x, height, z, size
uniform vec2 uCamW;        // camera x, z modulo 20 pi, for patterns that stay on the water
out vec2 vUv; flat out vec4 vCol; flat out vec2 vPaint;

float sail(float x, float h){ // signed inside test of the sail silhouette, unit boat
  float main=step(.12,h)*step(h,1.5)*step(-.62*(1.-(h-.12)/1.38),x)*step(x,.03);
  float jib=step(.14,h)*step(h,1.16)*step(.06,x)*step(x,.06+.44*(1.-(h-.14)/1.02));
  return max(main,jib);
}
void main(){
  int id=gl_InstanceID;
  int row=uGrid.y-1-id/uGrid.x, col=id%uGrid.x;
  int wr=row+uGrid.w, wc=col+uGrid.z;
  uint h=pcg(uint(wc)*73856093u ^ uint(wr)*19349663u ^ uint(uLayer*83492791+int(uBand.x*97.)));
  vec4 r=rand4(h), r2=rand4(pcg(h+17u));
  float X=(float(col)+r.x+.5*float(wr&1))*uStep.x+uStep.z;
  float Z=(float(row)+r.y)*uStep.y+uStep.w;
  float fade=smoothstep(uBand.x*.93,uBand.x*1.05,Z)*(1.-smoothstep(uBand.y*.95,uBand.y*1.07,Z));
  vec3 s=sea(vec2(X,Z),Z);
  vec2 scr=vec2(uView.x*X/Z, uView.x*(s.x-uCamH)/Z+uView.y);
  float persp=uView.x/Z;
  float rowPx=persp*uCamH*uStep.y/Z;

  // which colour does this dab carry
  float slope=s.z*1.15+(r.z-.5)*.34;
  float q=.41+slope*1.0+s.x*1.6+(r2.x-.5)*.30+sin(dot(vec2(X,Z)+uCamW,vec2(.3,.5)))*.07;
  float far=smoothstep(8.,70.,Z);
  q+=far*.22;
  vec2 tb=abs(scr-uTitle.xy)/max(uTitle.zw,vec2(.01));
  float inTitle=uTitleK*(1.-smoothstep(.75,1.25,max(tb.x,tb.y)));
  q-=inTitle*.17;
  vec3 col3=mix(uDeep,uMid,smoothstep(.08,.42,q));
  col3=mix(col3,uTeal,smoothstep(.40,.72,q));
  col3=mix(col3,uLight,smoothstep(.70,1.08,q));
  float pick=r2.y;
  if(pick<.10) col3=mix(col3,uCool,.62);
  else if(pick<.155) col3=mix(col3,uWarm,.55*(1.-inTitle*.6));
  else if(pick<.20) col3=mix(col3,uSkyTop,.5*(1.-inTitle*.5));
  col3*=.93+.14*r2.z;

  // sun path: a dab turns to light when its slope throws the sun at you
  float dx=(scr.x-uSunDir.x)/(.10+.5*(1.-smoothstep(1.,14.,Z))+.10*far);
  float path=exp(-dx*dx)*uSunDir.z;
  float spark=path*(.42+slope*1.4+r2.w*.75);
  float spk=smoothstep(.62,.86,spark);
  col3=mix(col3,mix(uSun,uLight,r.w*.35),spk);
  // stray sparkles and the odd white crest
  float crest=smoothstep(.20,.30,s.x+(r.w-.5)*.10)*step(.62,r2.w)*(1.-inTitle*.7);
  col3=mix(col3,uFoam,max(crest*.9,step(.986,r2.w)*(1.-inTitle)*(1.-far)*.8));

  // reflections of the boats: a dab lying in the mirrored silhouette takes its colour
  for(int i=0;i<4;i++){
    vec4 b=uBoat[i];
    if(b.z<=0.||Z>b.y) continue;
    float up=uCamH*(b.y/Z-1.)/b.z;
    float wob=(s.y*1.5+(r.z-.5)*.55)*(.25+up*.55)+sin(up*9.+uTime*2.2+b.x)*.05*(.3+up);
    float bx=(X*b.y/Z-b.x)/b.z+b.w*up*.6;
    float in_=sail(bx+wob,up*1.05);
    float hull=step(abs(bx+wob*.6),.64)*step(up,.2);
    float keep=step(r2.x,.82-up*.28);
    col3=mix(col3,mix(uFoam,uSun,r.w*.7),in_*keep);
    col3=mix(col3,mix(uHot,uWarm,r.w*.6),hull*keep);
  }
  // the stone's shadow on the water
  vec2 sd=(vec2(X,Z)-uStone.xz)*vec2(1.,.62);
  float sh=exp(-dot(sd,sd)/(.05+uStone.w*uStone.w*2.2+uStone.y*.06))*uStone.w*4.;
  col3=mix(col3,uDeep*.55,clamp(sh*(1.-uStone.y*.32),0.,.8));
  // ring light where a ripple stands up
  float lift=0.;
  for(int i=0;i<10;i++){ vec4 q4=uRip[i]; if(q4.w<=0.) continue; float x=length(vec2(X,Z)-q4.xy)-q4.z*1.9; lift+=exp(-x*x*14.)*q4.w*exp(-q4.z*1.3)*6.; }
  col3=mix(col3,uFoam,clamp(lift*(.35+r2.w*.9)-.25,0.,.92));

  // air between here and the horizon
  col3=mix(col3,uSkyLow,far*uSunDir.w*(.55+.25*r.w));

  float len,thick,ang;
  vec2 w=vec2(X,Z)+uCamW;
  float swirl=sin(w.x*.8+w.y*1.3+sin(w.y*.6)*1.4)*.6+sin(w.x*1.7-w.y*.9+1.3)*.4;
  float near=1.-smoothstep(3.,11.,Z);
  if(uLayer==0){ len=uStep.x*persp*(.62+.5*r.w); thick=max(rowPx*(1.25+.8*r2.z),.0046); }
  else { len=uStep.x*persp*(.36+.42*r.w); thick=max(rowPx*(.7+.55*r2.z),.0030); }
  ang=atan(clamp(s.y*1.1,-.75,.75)*(1.-far))*(.35+.65*near)+(r.z-.5)*.22*(1.-far*.8)+swirl*.26*near;
  thick=min(thick,len*.36);
  float bend=(r2.x-.5)*.5+swirl*.35*near+clamp(s.y,-1.,1.)*.15;
  len*=fade; thick*=fade;
  float u=aCorner.x, v=aCorner.y;
  vec2 d=vec2(cos(ang),sin(ang)), n=vec2(-d.y,d.x);
  vec2 pos=scr+d*u*len+n*(v*thick+bend*(u*u-.33)*len*.5);
  if(fade<.02||abs(scr.x)>uAspect+len*1.4) pos=vec2(9.);
  gl_Position=vec4(pos.x/uAspect,pos.y,0.,1.);
  int st=int(r.x*5.99);
  float flip=r2.y>.5?1.:-1.;
  vUv=vec2((float(st%2)+.5+.5*u*flip)*.5,(float(st/2)+.5+.49*v)*.25);
  vCol=vec4(col3, uLayer==0?1.:.94);
  vPaint=vec2(mix(.55,1.,r.w)*(1.-far*.55)+spk*.3, .16);
}`;

/** Free strokes: sky, boats, stone, spray. */
export const FREE_VS = COMMON + /* glsl */ `
layout(location=0) in vec2 aCorner;
layout(location=1) in vec4 aPos;   // x,y,z, mode 0 world / 1 screen / 2 y above the moving water
layout(location=2) in vec4 aShape; // half length, half thickness, angle, bend
layout(location=3) in vec4 aCol;
layout(location=4) in vec4 aMisc;  // stamp, paint
out vec2 vUv; flat out vec4 vCol; flat out vec2 vPaint;
void main(){
  vec3 p=aPos.xyz;
  float len=aShape.x, thick=aShape.y, ang=aShape.z, a=aCol.a;
  vec2 scr; vec3 col=aCol.rgb;
  if(aPos.w<.5){
    float k=uView.x/p.z; scr=vec2(p.x*k,(p.y-uCamH)*k+uView.y); len*=k; thick*=k;
    if(p.z<.35) a=0.;
  } else if(aPos.w<1.5){
    scr=p.xy;
  } else {
    if(p.z<.5){ gl_Position=vec4(9.); return; }
    vec3 s=sea(p.xz,p.z);
    float k=uView.x/p.z;
    scr=vec2(p.x*k,(s.x+p.y-uCamH)*k+uView.y);
    len*=k; thick*=k; ang+=atan(s.y*.4);
  }
  float u=aCorner.x, v=aCorner.y;
  vec2 d=vec2(cos(ang),sin(ang)), n=vec2(-d.y,d.x);
  vec2 pos=scr+d*u*len+n*(v*thick+aShape.w*(u*u-.33)*len*.5);
  gl_Position=vec4(pos.x/uAspect,pos.y,0.,1.);
  int st=int(aMisc.x);
  vUv=vec2((float(st%2)+.5+.5*u)*.5,(float(st/2)+.5+.49*v)*.25);
  vCol=vec4(col,a); vPaint=vec2(aMisc.y,.16);
}`;

export const STROKE_FS = /* glsl */ `#version 300 es
precision highp float;
uniform sampler2D uBrush;
in vec2 vUv; flat in vec4 vCol; flat in vec2 vPaint;
layout(location=0) out vec4 oCol; layout(location=1) out vec4 oH;
void main(){
  vec4 b=texture(uBrush,vUv);
  float a=b.a*vCol.a;
  if(a<.03) discard;
  a=smoothstep(.05,.7,a);
  vec3 c=vCol.rgb*(1.-vPaint.y*.5+vPaint.y*b.r*1.15);
  oCol=vec4(c,a);
  oH=vec4(b.r*vPaint.x,0.,0.,a);
}`;

/** Lettering: a brush pull that lies on the water and bends with it. */
export const LETTER_VS = COMMON + /* glsl */ `
layout(location=0) in vec4 aA; // x, z, along, across
layout(location=1) in vec4 aB; // when it is painted, which pull, length
uniform vec3 uOff;
out vec2 vUv; out float vWhen; flat out float vPull; out float vSlope; out float vAlong;
void main(){
  vec3 p=vec3(aA.x,0.,aA.y)+uOff;
  vec3 s=sea(p.xz,max(p.z,.5));
  p.x+=s.y*.10; p.y=s.x*.75;
  gl_Position=vec4(uView.x*p.x/uAspect, uView.x*(p.y-uCamH)+uView.y*p.z, p.z-.8, p.z);
  vUv=vec2(aA.z,aA.w); vWhen=aB.x; vPull=aB.y; vSlope=s.z; vAlong=aA.z*aB.z;
}`;

export const LETTER_FS = /* glsl */ `#version 300 es
precision highp float;
uniform sampler2D uLong;
uniform vec3 uSun,uFoam,uHot,uLight,uCool;
uniform float uDraw,uScatter;
in vec2 vUv; in float vWhen; flat in float vPull; in float vSlope; in float vAlong;
layout(location=0) out vec4 oCol; layout(location=1) out vec4 oH;
void main(){
  vec4 b=texture(uLong,vec2(vUv.x,(vPull+.5+.485*vUv.y)/4.));
  float wet=uDraw*1.06-vWhen-b.r*.02;
  float a=smoothstep(.35,.7,b.a)*smoothstep(0.,.012,wet)*(1.-uScatter);
  if(a<.02) discard;
  vec3 lit=mix(uFoam,vec3(1.,1.,.98),.5);
  vec3 c=mix(lit,mix(uFoam,uSun,.5),.5*(1.-b.r));
  float dirty=smoothstep(.5,.75,b.g);
  vec3 other=fract(vPull*.5)<.25?uHot:(vPull<2.?uLight:uCool);
  c=mix(c,other,dirty*.42*smoothstep(.05,.7,vUv.x));
  c*=.90+.16*b.r;
  c=mix(c,uCool,clamp(.10+vSlope*.9,0.,.22)*(1.-b.r));
  oCol=vec4(c,a);
  oH=vec4(.25+b.r*.95,0.,0.,a);
}`;

export const QUAD_VS = /* glsl */ `#version 300 es
void main(){ vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2); gl_Position=vec4(p*2.-1.,0.,1.); }`;

/** Underpainting: the ground the strokes are laid on. */
export const GROUND_FS = /* glsl */ `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uHorizon;
uniform vec3 uDeep,uMid,uTeal,uSkyTop,uSkyLow;
layout(location=0) out vec4 oCol; layout(location=1) out vec4 oH;
void main(){
  float y=gl_FragCoord.y/uRes.y*2.-1.;
  vec3 sky=mix(uSkyLow,uSkyTop,smoothstep(uHorizon,1.15,y));
  vec3 w=mix(mix(uDeep,uMid,.55),mix(uMid,uTeal,.6),smoothstep(-1.,uHorizon,y));
  oCol=vec4(y>uHorizon?sky:w,1.); oH=vec4(.25,0.,0.,1.);
}`;

/** Varnish: light the thickness of the paint, let the canvas through. */
export const VARNISH_FS = /* glsl */ `#version 300 es
precision highp float;
uniform sampler2D uCol,uH; uniform vec2 uRes; uniform vec2 uLightDir; uniform float uDpr,uFlash;
out vec4 o;
void main(){
  vec2 px=1./uRes, uv=gl_FragCoord.xy*px;
  float e=max(1.,uDpr*.8);
  float l=texture(uH,uv-vec2(e,0.)*px).r, r=texture(uH,uv+vec2(e,0.)*px).r;
  float d=texture(uH,uv-vec2(0.,e)*px).r, t=texture(uH,uv+vec2(0.,e)*px).r;
  vec2 g=vec2(l-r,d-t);
  float li=dot(g,normalize(uLightDir));
  vec4 paint=texture(uCol,uv);
  vec3 c=paint.rgb;
  vec2 w=gl_FragCoord.xy/uDpr*2.1;
  float weave=(sin(w.x)*sin(w.y*.5+sin(w.x*.5)*.6)+sin(w.y)*sin(w.x*.5))*.5;
  float thick=texture(uH,uv).r;
  c*=1.+li*.40+weave*.020*(1.-thick*.6);
  c+=max(li,0.)*max(li,0.)*.28;
  vec2 q=uv-.5; c*=1.-dot(q,q)*.10;
  c=mix(c,vec3(1.,.97,.88),uFlash);
  o=vec4(c*paint.a,paint.a);
}`;
