// 存储数据和过期时间(以秒为单位)
const set = (key, value, ttl)=> {
    const now = new Date();
    const item = {
        value: value,
        expiry: now.getTime() + ttl*1000
    };
    localStorage.setItem(key, JSON.stringify(item));
}

// 读取数据并检查有效期
const get = (key) => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
        return null;
    }
    const item = JSON.parse(itemStr);
    const now = new Date();
    if (now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        return null;
    }
    return item.value;
}
// 删除
const remove = (key) => {
    localStorage.removeItem(key)
}
// 更新
const update = (key,newUserInfo)=>{
    let userInfo = get(key)
    if(userInfo){
        localStorage.setItem(key,JSON.stringify(newUserInfo))
    }
}

const LocalStorage = {
    set,
    get,
    remove,
    update
}
export default LocalStorage;