System.register("chunks:///_virtual/999_YYB",["./YYB_gamemanager.ts"],(function(){return{setters:[null],execute:function(){}}}));

System.register("chunks:///_virtual/YYB_gamemanager.ts",["./rollupPluginModLoBabelHelpers.js","cc"],(function(t){var e,a,n,o,r,i,s,c,l,u,p,m,g,y;return{setters:[function(t){e=t.applyDecoratedDescriptor,a=t.initializerDefineProperty},function(t){n=t.cclegacy,o=t.Prefab,r=t._decorator,i=t.Component,s=t.find,c=t.instantiate,l=t.v3,u=t.tween,p=t.UIOpacity,m=t.Animation,g=t.AudioSource,y=t.Label}],execute:function(){var h,d,f,v,C;n._RF.push({},"847f5VfxulGmorA7IWkOmIP","YYB_gamemanager",void 0);const{ccclass:P,property:Y}=r;t("YYB_gamemanager",(h=P("YYB_gamemanager"),d=Y(o),h((C=e((v=class extends i{constructor(...t){super(...t),a(this,"TipPre",C,this),this.Score=0,this.muyu=null}start(){this.muyu=s("Canvas/木鱼")}onclick(){let t=c(this.TipPre);t.setParent(s("Canvas")),t.setPosition(l(600*Math.random()-300,400*Math.random()-100,0)),u(t).by(1,{position:l(0,200,0)}).call((()=>{t.destroy()})).start(),u(t.getComponent(p)).to(.9,{opacity:0}).start(),u(this.muyu).to(.12,{scale:l(1.05,1.05,1)}).to(.12,{scale:l(1,1,1)}).start(),s("Canvas/棍子").getComponent(m).play(),this.node.getComponent(g).play(),this.Score++,s("Canvas/功德").getComponent(y).string="功德："+this.Score}}).prototype,"TipPre",[d],{configurable:!0,enumerable:!0,writable:!0,initializer:function(){return null}}),f=v))||f));n._RF.pop()}}}));

(function(r) {
  r('virtual:///prerequisite-imports/999_YYB', 'chunks:///_virtual/999_YYB'); 
})(function(mid, cid) {
    System.register(mid, [cid], function (_export, _context) {
    return {
        setters: [function(_m) {
            var _exportObj = {};

            for (var _key in _m) {
              if (_key !== "default" && _key !== "__esModule") _exportObj[_key] = _m[_key];
            }
      
            _export(_exportObj);
        }],
        execute: function () { }
    };
    });
});