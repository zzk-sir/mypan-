const regs = {
    email:/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
    number:/^[0-9]+$/,
    password:/^[a-zA-Z0-9_-]{8,32}$/,
    shareCode:/^[a-zA-Z0-9]+$/,
    space:/^\d+$/
}
const verify = (rule,value,reg,callback)=>{
    if(value){
        if(reg.test(value)){
            callback()
        }else{
            callback(new Error(rule.message))
        }
    }else{
        callback()
    }
}
export default {
    email:(rule,value,callback)=>{
        return verify(rule,value,regs.email,callback)
    },
    number:(rule,value,callback)=>{
        return verify(rule,value,regs.number,callback)
    },
    password:(rule,value,callback)=>{
        return verify(rule,value,regs.password,callback)
    },
    shareCode:(rule,value,callback)=>{
        return verify(rule,value,regs.shareCode,callback)
    },
    space:(rule,value,callback)=>{
        return verify(rule,value,regs.space,callback)
    },
}