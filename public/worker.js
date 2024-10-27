self.onmessage = function(e) {
    let res = getSHAstr(e.data)
    self.postMessage(res)
};

function getSHAstr(v) {
    const decoder = new TextDecoder('utf-8')
    return decoder.decode(v,{stream:true})
}