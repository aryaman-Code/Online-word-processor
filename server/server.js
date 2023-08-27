const Document =require('./Document')
const mongoose=require('mongoose')
const dotenv = require('dotenv');

require('dotenv').config();

const PORT=process.env.PORT || 3001
const url=process.env.URL;
const MONGOURL=process.env.MONGOURL
console.log(MONGOURL)
console.log(url)

//console.log(process.env.NODE_ENV)
// mongoose.connect("mongodb+srv://aryamanraj4u:KcCSaCFiVXDyPzcC@cluster0.evvjavh.mongodb.net/?retryWrites=true&w=majority", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
mongoose.connect(MONGOURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})


const io=require('socket.io')(PORT,{
  cors:{
    origin:url,
    methods:['GET','POST']
  }
})

const defaultValue=""

io.on('connection',socket=>{
  socket.on('get-document', async (documentId)=>{
    const document= await findOrCreateDocument(documentId)
    console.log(document)
    socket.join(documentId)
    socket.emit('load-document',document.data)
    socket.on('send-changes',(delta)=>{
        socket.broadcast.to(documentId).emit('receive-changes',delta)
     })
     socket.on("save-document",async data=>{
      await Document.findByIdAndUpdate(documentId,{data});
     })
  })
})
  
 //   console.log("Connected")
 async function findOrCreateDocument(id)
 {
   if(id==null)return

   const document=await Document.findById(id)
   if(document)return document;
   return await Document.create({_id:id , data:defaultValue})
 }

