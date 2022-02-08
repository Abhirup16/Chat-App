const socket = io()
socket.on('countUpdate',(count)=>{
    console.log('The count has been updated',count)
})
//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('#send-message')
const $sharelocation = document.querySelector('#Share-location')
const $messages = document.querySelector('#messages')

//Templates
const messagetemplate = document.querySelector('#message-template').innerHTML
const locationtemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template')

//Options
const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix: true})

const autoscroll = () =>{
    const $newMessage = $messages.lastElementChild
    
    const newMessageStyles = getComputeStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $message.scrollTop + visibleHeight
    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

}

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    const text = $messageFormInput.value
    $messageFormButton.setAttribute('disabled','disable')
    $messageFormInput.value=''
    socket.emit('sendmessage',text,()=>{console.log('message delivered!')})
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.focus()
})
socket.on('locationMessage',(url)=>{
    console.log(url)
    const html=Mustache.render(locationtemplate,{url:url.text,createdAt: moment(url.createdAt).format('h:mm a'),username:url.username})
    $messages.insertAdjacentHTML('beforeend',html)
})
socket.on('message',(message)=>{

    const html = Mustache.render(messagetemplate,
        {
        message:message.text,
       createdAt:moment(message.createdAt).format('h:mm a'),
       username:message.username})
    $messages.insertAdjacentHTML('beforeend',html)
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHtml=html
})
$sharelocation.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
       $sharelocation.setAttribute('disabled','disable')
        socket.emit('sendlocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            console.log('Location Shared!')
        })
        $sharelocation.removeAttribute('disabled')
    })
})

socket.emit('join',{username,room},(error)=>{
  console.log(error)
})