const util = require("node:util");
const exec = util.promisify(require("node:child_process").exec);
const express = require("express");
const { json } = require("body-parser");
const fs = require("fs").promises;
const app = express();
const port  =  process.env.PORT|| 5000;
app.use(json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.removeHeader("X-powered-by");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  // res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  if (req.method == "OPTIONS") {
    res.status(200);
    res.end();
  } else {
    next();
  }
});
/*{
  language : string,
  code : string,
  input: string,
}*/
async function runCode(snippet) {
  const { stdout, stderr } = await exec(snippet);
  if (stderr != "") {
    return { status: 404, result: stderr };
  }
  return { status: 200, result: stdout };
}
app.post("/code", async (req, res) => {
  lang = req.body.language;
  code = req.body.code;
  inp = req.body.input || null;
  let ext = "";
  switch (lang) {
    case "c":
      ext = "c";
      break;
    case "cpp":
      ext = "cpp";
      break;
    case "python3":
      ext = "py";
      break;
    case "java":
      ext = "java";
      break;
    default:
      res.status(200);
      res.send({
        status:404,
        result: "unrecognized code language"
      })
      return;
  }
  try {
    let err = await fs.writeFile("code." + ext, code);
    if(inp){
      err = await fs.writeFile("input.txt",inp);
    }
    let snippet = "";
    switch (lang) {
      case "cpp":
        if(inp){
          snippet = "g++ code.cpp && ./a.out < input.txt";
        }else{
          snippet = "g++ code.cpp && ./a.out";
        }
        break;
      case "c":
        if(inp){
          snippet = "gcc code.c && ./a.out < input.txt";
        }else{
          snippet = "gcc code.c && ./a.out";
        }
        break;
      case "python3":
        if(inp){
          snippet = "python3 code.py < input.txt";
        }else{
          snippet = "python3 code.py";
        }
        break;
      case "java":
        if(inp){
          snippet = "javac code.java && java code < input.txt";
        }else{
          snippet = "javac code.java && java code";
        }
        break;
      default:
        res.status(200);
        res.send({
          status:404,
          result: "unrecognized code language"
        })
        return;
    }
    let codeResult = await runCode(snippet);
    res.status(200);
    res.send(codeResult);
  } catch (err) {
    console.log(err);
    res.status(200);
    res.send({
      status: 404,
      result: err.stderr,
    });
  }
});
app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
