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
	minePairArray:[],
	MinePair:function(mineCounter){
		this.mineCounter = mineCounter;
		this.posArray = [];
		this.isInThisArray = function(minePairArray){
			for(let i=0 ; i<minePairArray.length ; i++){
				var mineCounter = minePairArray[i].mineCounter;
				var posArray = minePairArray[i].posArray;
				if(this.mineCounter != mineCounter)continue;
				if(this.posArray.length != posArray.length)continue;
				for(j = 0 ; j<this.posArray.length;j++){
					if( !this.posArray[j].isInThisArray(posArray)){
						break;
					}
				}
				if(j == this.posArray.length-1){
					return true;
				}
			}
			return false;
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
		var newMinePairArray = [];
		
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
					if(surroundUnit.hasClass("flagged") || surroundUnit.hasClass("hint-mine")){
						flaggedCounter ++;
					}else if(surroundUnit.hasClass("enabled") && !surroundUnit.hasClass("hint-safe")){
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
			}else{
				// strategy 2		
				for(let i = 0;i<this.minePairArray.length;i++){
					var minePair = this.minePairArray[i];
					var minePairPosArray = minePair.posArray;
					for( window.j=0 ; window.j<minePairPosArray.length ; window.j++ ){
						pos = minePairPosArray[window.j];
						if(!pos.isInThisArray(enabledPosArray))break;
					}
					if(window.j == minePairPosArray.length){
						var filteredMineCounter = unitData.mineCounter - minePair.mineCounter;
						var filteredEnabledCounter = enabledCounter - minePairPosArray.length;
						if(filteredEnabledCounter == 0)continue;
						if(filteredMineCounter - flaggedCounter  == filteredEnabledCounter){
							for(let k =0;k<enabledPosArray.length;k++){
								var enabledPos = enabledPosArray[k];
								if(!enabledPos.isInThisArray(findMinePos) &&  !enabledPos.isInThisArray(minePairPosArray) ){
									findMinePos.push(enabledPos);
								}
							}
						}else if(filteredMineCounter - flaggedCounter == 0){
							for(let k=0;k<enabledPosArray.length;k++){
								var enabledPos = enabledPosArray[k];
								if(!enabledPos.isInThisArray(findSafePos)&&  !enabledPos.isInThisArray(minePairPosArray) ){
									findSafePos.push(enabledPos);
								}
							}
						}
					}
				}
			}
			//save findMinePair
			if(unitData.mineCounter - flaggedCounter == (enabledCounter - 1) ){
				var findMinePair = new $mineSweeperAI.MinePair(unitData.mineCounter - flaggedCounter);
				for(let i = 0 ; i<enabledPosArray.length;i++){
					findMinePair.posArray.push(enabledPosArray[i]);
				}
				if(!findMinePair.isInThisArray(newMinePairArray)){
					newMinePairArray.push(findMinePair)
				}
			}
		}
		this.minePairArray = newMinePairArray;
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
		/*	the 
			In order to let computer can find minepair and use minepair to find the other unit status 
		*/
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
