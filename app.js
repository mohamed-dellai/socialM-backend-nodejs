const express=require('express')
const app=express()
const cors=require('cors')
const sql=require("mysql")
const fs=require('fs')

app.use(cors())
app.use(express.json({limit: '10mb'}))
var resulTosend=[]
const pool=sql.createPool({
  host:"localhost",
  user: "root",
  password: "",
  database: "media",
  connectionLimit: 10
})
app.get('/',(req,res)=>{


  res.end("you are in api")
})



app.post("/login",(req,res)=>{
     
     
     pool.query(`select name from users where password="${req.body.pass}" and email="${req.body.email}"`,(error,result,field)=>{
      if(error)
       return console.log(error)
       
      if(result.length===1)
        return res.json({login : "succssefull"})
      else 
        return res.json({login : "badIn"})
     })
     
     return;
})

app.post("/signin", (req,res)=>{
   console.log(req.body)
   pool.query(`select * from users where email="${req.body.email}"`,(err,result,field)=>{
    console.log(result)
     if(err)
       {return res.json({error: "server"})}
     if(result.length===0)
       
       {
        pool.query(`insert into users values ("${req.body.name}","${req.body.email}","${req.body.password}",${0})`)
        
        return res.json({error :"false"})

      
      }
     else
     {return res.json({error :"exist"})}
   })
   
   return
})

app.get('/home',(req,res)=>{
  
  pool.query(`select id,content,date,p.email,name,photo from posts p ,users u where u.email=p.email`,(err,result,field)=>{
    if (err)
      return res.send('error')
    resulTosend=result

    pool.query(`select id ,count(*) as num from likes group by(id)`,(err,result,field)=>{
          if(err)
           return res.end("error")
          for(let i=0;i<resulTosend.length;i++){
            for(let j=0;j<result.length;j++){
              if(resulTosend[i].id===result[j].id){
                resulTosend[i].likes=result[j].num
                break;
              }
              resulTosend[i].likes=0
            }
          }
          res.send(resulTosend)
      })

    return;
  })
  
  return;
})


  app.get('/home:email',(req,res)=>{
  
    pool.query(`select name,email,age from users where email="${req.params.email.substring(1)}"`,(err,result,field)=>{
      if (err)
        return res.send('error')
      
      
      res.send(result)
    })
  
  return;
})

app.post("/home/like",(req,res)=>{
  
  
  pool.query(`select * from likes where email="${req.body.email}" and id="${req.body.id}"`,(err,result,field)=>{
     if (err)
       return console.log(err)
     if(result.length!==0)
        return res.end("already exist")
    
      pool.query(`insert into likes values("${req.body.id}","${req.body.email}")`) 
     
  })
  return;

})

app.post('/upload', (req, res) => {
  
  pool.query(`select max(id) as id from posts`,(err,result,field)=>{

    if(err)
      return console.end(err)
    
    pool.query(`insert into posts values("${parseInt(result[0].id)+1}","${req.body.text}","${req.body.date}","${req.body.email}","${req.body.value}")`,(err,result,field)=>{
      if (err)
        return console.log(err)

      res.send("succsseful")
        
    })
  })
  
  return;
});

app.listen(5000,()=>{
    console.log("listening on port 5000...")
})


