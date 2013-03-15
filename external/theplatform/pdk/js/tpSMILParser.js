(function(){var a=false,b=/xyz/.test(function(){xyz
})?/\b_super\b/:/.*/;
this.Class=function(){};
Class.extend=function(g){var f=this.prototype;
a=true;
var e=new this();
a=false;
for(var d in g){e[d]=typeof g[d]=="function"&&typeof f[d]=="function"&&b.test(g[d])?(function(h,i){return function(){var k=this._super;
this._super=f[h];
var j=i.apply(this,arguments);
this._super=k;
return j
}
})(d,g[d]):g[d]
}function c(){if(!a&&this.init){this.init.apply(this,arguments)
}this.instanceOf=function(j){for(var i in j){if(typeof j[i]==="function"&&typeof this[i]!="function"){return false
}return true
}};
if(this["implements"]&&this["implements"].length>0){for(var h=0;
h<this["implements"].length;
h++){if(!this.instanceOf(this["implements"][h])){throw new Error("Interface not fully implemented")
}}}}c.prototype=e;
c.constructor=c;
c.extend=arguments.callee;
return c
}
})();