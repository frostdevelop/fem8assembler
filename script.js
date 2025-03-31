const index = {"NOP":"00", "HLT":"01", "OUT":"02", "LDA":"03", "MVA":"04", "MVR":"05", "INC":"06", "DEC":"07", "ADD":"08", "SUB":"09", "AND":"0A", "IOR":"0B", "XOR":"0C", "NOT":"0D", "SAR":"0E", "SAL":"0F", "JUP":"10", "JPP":"11", "JPL":"12", "JZO":"13", "JPG":"14", "JLE":"15", "JGE":"16", "JNZ":"17", "CLR":"18", "INP":"19", "MPR":"1A", "MRP":"1B", "MPA":"1C", "MAP":"1D", "MLT":"1E", "DIV":"1F"}
const namrgx = /^[^'"]{3,}$/; // /^[0-9a-zA-Z_]{3,}$/
function process(inp){
  let to = inp.split("\n");
  let t = to;
  let num = 0;
  let out = "";
  let errlog = "";
  for(let i = 0; i < t.length; i++){
    if(t[i].length == 0 || t[i][0] == "#"){
      t.splice(i,1);
      i--
      continue
    }
    let ins = t[i].split(" ");
    if(ins.length == 1 && ins[0].charAt(ins[0].length-1)==":"){
      const replace = ins[0].substr(0,ins[0].length-1);
      if(!namrgx.test(replace)){
        errlog += 'NameError: Marker '+replace+' is too short or has a quote in it.\nLine: '+(i+1).toString()+'\n';
      }else if(index[replace.toUpperCase()] != undefined){
        errlog += 'NameError: Marker '+replace+' is a reserved name.\nLine: '+(i+1).toString()+'\n';
      }
      let loc = ((i*2)-num).toString(16).toUpperCase();
      if(loc.length == 1){
        loc = "0"+loc;
      }
      t.splice(i,1);
      i--
      for(let j=0;j<t.length;j++){
        const spins = t[j].split(" ");
        if(spins[1] == replace){
        	spins[1] = loc;
        	t[j] = spins.join(' ');
        }
      }
      continue;
    }else if(ins.length == 3 && ins[1] == '='){
        if(!namrgx.test(ins[0])){
          errlog += 'NameError: Definition '+ins[0]+' is too short or has a quote in it.\nLine: '+(i+1).toString()+'\n';
        }else if(index[ins[0].toUpperCase()] != undefined){
          errlog += 'NameError: Definition '+ins[0]+' is a reserved name.\nLine: '+(i+1).toString()+'\n';
        }
    	const hval = toHex(ins[2]);
    	if(Number.isInteger(hval)){
          let err = 'CosmicError: Ask dev to debug\n';
          switch(hval){
            case 0:
              err = 'ValueError: Definition ' + ins[0] + '\'s Value(S) '+ins[2]+' is not an 8-bit Value or Character\nLine: '+(i+1).toString()+'\n';
              break;
            case 1:
              err = "ValueError: Definition " + ins[0] + "'s Value(N) " + ins[2] + " is not a 8-bit Value or Character\nLine: "+(i+1).toString()+'\n';
              break;
            case 2:
              err = "ValueError: Definition " + ins[0] + "'s Value(N) " + ins[2] + " is Not a Number!\nLine: "+(i+1).toString()+'\n';
              break;
            case 3:
              err = "OverflowError: Definition " + ins[0] + "'s Value(N) " + ins[2] + " is too Big!\nLine: "+(i+1).toString()+'\n';
              break;
            case 4:
              err = "ValueError: Definition " + ins[0] + "'s Value(H) " + ins[2] + " is not a 8-bit Value or Character\nLine: "+(i+1).toString()+'\n';
          }
          errlog += err;
          //alert(err);
          //return err;
          continue;
        }
      	t.splice(i,1);
      	for(let j=0;j<t.length;j++){
        	const spins = t[j].split(" ");
        	if(spins[1] == ins[0]){
        		spins[1] = hval;
          		t[j] = spins.join(' ');
        	}
      	}
    	i--;
    	continue;
    }
  }
  //console.log(t)
  if(t.length > 128){
  	return errlog+'OverflowError: Instructions overflow to a size of '+(t.length*2).toString()+'\n';
  	//alert(error);
  	//return error;
  }
  
  if(errlog){
    return errlog;
  }
  
  for(let i = 0; i < t.length; i++){
    let ins = t[i].split(" ");
    let hex = "";
    if(ins.length > 2 && !((ins[2][0] == ";") || ins[1][0] == ";")){
      errlog += "SyntaxError: More than one argument\nLine: "+(i+1).toString()+'\n';
      continue;
    }
    let insh = index[ins[0].toUpperCase()];
    if(insh == "00" || insh == "01"){
      hex += hexify(insh)+"0x00,";
    } else if(insh == undefined){
      errlog += "SyntaxError: Unknown Command: "+ins[0]+"\nLine: "+(i+1).toString()+'\n';
      continue;
    } else {
      const hval = toHex(ins[1]);
      /*
      if(hval.length > 2){
        const err = hval+'\nLine: '+(i+1);
        alert(err);
        return err;
      }
      */
      if(Number.isInteger(hval)){
        let err = 'CosmicError: Ask dev to debug';
        switch(hval){
          case 0:
            err = 'ValueError: Argument(S) '+ins[1]+' is not an 8-bit Value or Character\nLine: '+(i+1).toString()+'\n';
            break;
          case 1:
            err = "ValueError: Argument(N) " + ins[1] + " is not a 8-bit Value or Character\nLine: "+(i+1).toString()+'\n';
            break;
          case 2:
            err = "ValueError: Argument(N) " + ins[1] + " is Not a Number!\nLine: "+(i+1).toString()+'\n';
            break;
          case 3:
            err = "OverflowError: Argument(N) " + ins[1] + " is too Big!\nLine: "+(i+1).toString()+'\n';
            break;
          case 4:
            err = "ValueError: Argument(H) " + ins[1] + " is not a 8-bit Value or Character\nLine: "+(i+1).toString()+'\n';
        }
        errlog += err;
        //alert(err);
        //return err;
        continue;
      }
      hex += hexify(insh)+hexify(hval);
    }
    out += hex;
  }
  return errlog ? errlog : out.substr(0, out.length-1);
}

function hexify(s){
  return "0x"+s+",";
}

function toHex(ival){
  if(ival.length == 3  && ival[0] == ival[2] && (ival[0] == '"' || ival[0] == "'")){
  	ival = ival[1].charCodeAt(0).toString(16).padStart(2,'0');
  }else if(ival.length == 1){
    if(/[0-9A-Fa-f]/.test(ival)){
      ival = '0'+ival;
    }else{
      return 0; //'ValueError: Argument '+ival+' is not an 8-bit Value or Character'
    }
  }else{
    if(ival.length > 3){
      let val = NaN;
      switch(ival.substr(0,2)){
        case '0b':
          val = parseInt(ival.substr(2),2);
          break;
        case '0o':
          val = parseInt(ival.substr(2),8);
          break;
        case '0i':
          val = parseInt(ival.substr(2));
          break;
        default:
          return 1; //"ValueError: Argument " + ival + " is not a 8-bit Value or Character"
          break;
      }
      if(Number.isNaN(val)){
        return 2; //"ValueError: Argument " + ival + " is Not a Number!"
      }else if(val > 255){
        return 3; //"OverflowError: Argument " + ival + " is too Big!"
      }
      ival = val.toString('16').padStart(2,'0');
    }else if(!(/^[0-9A-Fa-f]{2}$/i.test(ival))){
      return 4; //"ValueError: Argument " + ival + " is not a 8-bit Value or Character"
    }
  }
  return ival.toUpperCase();
}

document.getElementById("Trigger").addEventListener("click", ()=>{
  document.getElementById("Output").value = process(document.getElementById("Input").value);
});

window.onbeforeunload = ()=>{
  if(document.getElementById("Input").value != ""){return 'Are you sure you have saved your work?';}else{return;}
}