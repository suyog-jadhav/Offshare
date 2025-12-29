import app from "./app.js";





app.get("/",(req,res)=>{
    res.send("Hello World!");
})

app.listen(8000, '0.0.0.0', () => {
  console.log("Server is running on port 8000");
});