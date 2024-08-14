const index = {"NOP":"00", "HLT":"01", "OUT":"02", "LDA":"03", "MVA":"04", "MVR":"05", "INC":"06", "DEC":"07", "ADD":"08", "SUB":"09", "AND":"0A", "IOR":"0B", "XOR":"0C", "NOT":"0D", "SAR":"0E", "SAL":"0F", "JUP":"10", "JPP":"11", "JPL":"12", "JZO":"13", "JPG":"14", "JLE":"15", "JGE":"16", "JNZ":"17", "CLR":"18", "INP":"19", "MPR":"1A", "MRP":"1B", "MPA":"1C", "MAP":"1D", "MLT":"1E", "DIV":"1F"}
function process(inp){
  let to = inp.split("\n");
  let t = to;
  let num = 0;
  let out = "";
  for(let i = 0; i < t.length; i++){
    if(t[i][0] == "#"){
      t.splice(i,1);
      i--
      continue
    }
    let ins = t[i].split(" ");
    if(ins.length == 1 && ins[0].charAt(ins[0].length-1)==":"){
      let loc = ((i*2)-num).toString(16).toUpperCase();
      if(loc.length == 1){
        loc = "0"+loc;
      }
      t.splice(i,1);
      i--
      let replace = ins[0].substr(0,ins[0].length-1);
      for(let j=0;j<t.length;j++){
        if(t[j].split(" ")[1] == replace){
          t[j] = t[j].replace(replace, loc)
        }
      }
    }
  }
  console.log(t)
  for(let i = 0; i < t.length; i++){
    let ins = t[i].split(" ");
    let hex = "";
    if(ins.length > 2 && !((ins[2][0] == ";") || ins[1][0] == ";")){
      let error = "SyntaxError: More than one argument at line "+(i+1);
      alert(error);
      return error;
    }
    if(ins.length == 0){
      let error = "SyntaxError: Less than one argument at line "+(i+1);
      alert(error);
      return error;
    }
    let insh = index[ins[0]];
    if(insh == "00" || insh == "01"){
      hex += hexify(insh)+"0x00,";
    } else if(insh == undefined){
      let error = "SyntaxError: Unknown Command: "+ins[0]+" at line "+(i+1);
      alert(error);
      return error;
    } else {
      if(!(/^[0-9A-F]{2}$/i.test(ins[1]))){
        let error = "ValueError: Argument " + ins[1] + " is not a 8-bit Hex Value at line " + (i+1);
        alert(error);
        return error;
      }
      hex += hexify(insh)+hexify(ins[1]);
    }
    out += hex;
  }
  return out.substr(0, out.length-1);
}

function hexify(s){
  return "0x"+s+",";
}

document.getElementById("Trigger").addEventListener("click", ()=>{
  document.getElementById("Output").value = process(document.getElementById("Input").value);
});