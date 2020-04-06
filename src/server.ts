import * as express from "express";
const app = express();


app.get("/", (req: any, res: { send: (arg0: string) => void; }) => {
    res.send("Hello World10");
})



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    // if (err) {
    //     return console.error("EEEEEEE:", err);
    // }
    return console.log(`server is listening on ${PORT}`);
});

// app.listen(PORT, () => {
//     console.log(`Server is running in http://localhost:${PORT}`)
// })