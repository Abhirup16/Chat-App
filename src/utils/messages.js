const generateMessage = (username,text)=>{
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}
const generatelocation = (username,text)=>{
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}
module.exports = {generateMessage,generatelocation}