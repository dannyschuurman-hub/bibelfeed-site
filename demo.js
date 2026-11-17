(function(root){
 function demoMinutes(progress){return 3 + Math.round(Math.min(1, Math.max(0, progress)) * 6);}
 if(typeof module==='object') module.exports={demoMinutes};
 else root.demoMinutes=demoMinutes;
})(globalThis);
