export default {
    size2Str:(limit) =>{
        let resB;
        if((resB = limit/1024/1024/1024)>=1){
            return `${resB.toFixed(2)} GB`.replace(/\.00/,'')
        }else if((resB = limit/1024/1024)>=1){
            return `${resB.toFixed(2)} MB`.replace(/\.00/,'')
        }else if((resB = limit/1024)>=1){
            return `${resB.toFixed(2)} KB`.replace(/\.00/,'')
        }else{
            return `${limit} B`
        }
    },
    fileUid:()=>{
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    }
}