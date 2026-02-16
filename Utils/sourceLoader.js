var sourceLoader={
    sources:{},
    sourceNum:0,
    loadedNum:0,
    allLoaded:true,
    load:function(type,src,id){
        sourceLoader.sourceNum++;
        sourceLoader.allLoaded=false;
        let source;
        let done=false;
        const loaded=function(){
            if (done) return;
            done=true;
            sourceLoader.loadedNum++;
            if(sourceLoader.loadedNum==sourceLoader.sourceNum){
                sourceLoader.allLoaded=true;
            }
        };//Code copy
        if (type=='img'){
            source=new Image();
            source.onload=loaded;
            source.onerror=function(){
                try{
                    const c=document.createElement('canvas');
                    c.width=c.height=8;
                    const ctx=c.getContext('2d');
                    ctx.fillStyle='#ff00ff';
                    ctx.fillRect(0,0,8,8);
                    ctx.fillStyle='#000000';
                    ctx.fillRect(0,0,4,4);
                    ctx.fillRect(4,4,4,4);
                    sourceLoader.sources[id]=c;
                }catch(e){}
                loaded();
            };
            source.src=src;
            sourceLoader.sources[id]=source;
        }
        if (type=='audio'){
            source=new Audio();
            source.addEventListener('canplaythrough',loaded,false);
            source.addEventListener('error',loaded,false);
            //source.oncanplaythrough=loaded;
            source.src=src;//Pose after listener to prevent fired early
            sourceLoader.sources[id]=source;
        }
        //For my Dojo: src==pathName
        if (type=='js'){
            const node=document.createElement('script');
            node.onload=function(){
                //Load builder
                _$.modules[src]=_$.define.loadedBuilders.shift();
                loaded();
            };
            node.onerror=loaded;
            node.src=src+'.js';
            document.getElementsByTagName('head')[0].appendChild(node);
        }
    },
    allOnLoad:function(callback){
        if (sourceLoader.allLoaded) {
            callback();
        }
        else {
            const LoadedBlock=document.getElementsByClassName('LoadedBlock')[0];
            if (LoadedBlock) LoadedBlock.style.width=(100*this.loadedNum/this.sourceNum)+"%";
            setTimeout(() => {
                sourceLoader.allOnLoad(callback);
            },100);
        }
    }
};
