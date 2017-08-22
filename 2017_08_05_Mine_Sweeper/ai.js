$mineSweeperAI = {
    Pos:function(row,col){  
		this.row = row;
		this.col = col;
		this.isInThisArray = function(posArray){
			for(var i = 0 ; i<posArray.length;i++){
				if(posArray[i].row == this.row &&
				   posArray[i].col == this.col){
					return true;
				}
			}
			return false
		}
	},
    getUnitData:function(unit){
		// format: position-<row>-<col>
		var idString = unit.id;
		var row = idString.split("-")[1];
		var col = idString.split("-")[2];
        // format: swept-num-<mineCounter>
        var index = 0;
        for(index=0 ; index<unit.classList.length;index++){
            if(unit.classList[index].indexOf("swept-num-") != -1){
                break;
            }
        }
		var sweptString = unit.classList[index];
		var mineCounter = sweptString.split("-")[2];
		return {
			row:parseInt(row),
			col:parseInt(col),
			mineCounter:parseInt(mineCounter)
		}
	},
	findMineAndSafePos:function(){
		var units = $grid.element.querySelectorAll(".grid-unit");
		var sweptUnits = document.querySelectorAll(".swept");
		var findMinePos = [];
		var findSafePos = [];
	
		for(let index=0 ; index<sweptUnits.length ; index++){
			var unit = sweptUnits[index];
			var unitData = $mineSweeperAI.getUnitData(unit);
			if(unitData.mineCounter == 0)continue;
			var flaggedCounter = 0;
			var enabledCounter = 0;
			var enabledPosArray = [];
			// surroundCount
			for(let r =unitData.row-1 ; r <= unitData.row+1 ; r++){
				for(let c = unitData.col-1 ; c <= unitData.col+1 ; c++){
					if(r == unitData.row && c == unitData.col)continue;
					surroundUnit = $grid.getUnit(r,c);
					if(surroundUnit == null)continue;
					if(surroundUnit.hasClass("flagged")){
						flaggedCounter ++;
					}
					if(surroundUnit.hasClass("enabled")){
						enabledCounter++;
						enabledPosArray.push(new $mineSweeperAI.Pos(r,c));
					}
				}
			}
			// strategy 1:
			if(unitData.mineCounter - flaggedCounter == enabledCounter){
				for(let i =0;i<enabledPosArray.length;i++){
					var enabledPos = enabledPosArray[i];
					if(!(enabledPos.isInThisArray(findMinePos))){
						findMinePos.push(enabledPos);
					}
				}
			}else if(unitData.mineCounter - flaggedCounter == 0){
				for(let i =0;i<enabledPosArray.length;i++){
					var enabledPos = enabledPosArray[i];
					if(!(enabledPos.isInThisArray(findSafePos))){
						findSafePos.push(enabledPos);
					}
				}
			}
		}
		return {
			findMinePos:findMinePos,
			findSafePos:findSafePos
		}
	},
	/*  hint format
		return {row:<num>,col:<num>,type: "safe" or "mine"}
		if not find hint it will return null 
	*/
	getHint:function(){
		var findResult = $mineSweeperAI.findMineAndSafePos()
		var findMinePos = findResult.findMinePos;
		var findSafePos = findResult.findSafePos;
		if(findMinePos.length==0 && findSafePos.length==0){
			var findResult = $mineSweeperAI.findMineAndSafePos()
			var findMinePos = findResult.findMinePos;
			var findSafePos = findResult.findSafePos;
		}
		if(findMinePos.length!=0){
			var pos = findMinePos[randomNumber(0,findMinePos.length-1)];
			return {
				row:pos["row"],
				col:pos["col"],
				type:"mine"
			}
		}else if(findSafePos.length!=0){
			var pos = findSafePos[randomNumber(0,findSafePos.length-1)];
			return {
				row:pos["row"],
				col:pos["col"],
				type:"safe"
			}	
		}else{
			return null;
		}
	}
}
