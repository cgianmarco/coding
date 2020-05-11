for(let p = 0; p < 3; p++){

	for(let j = 0; j < 4; j++){
		agent.move(UP)
		for(let k = 0; k < 6; k++){

			agent.place(DOWN)
			agent.move(FORWARD)

			
		}
		agent.turn(LEFT)

	}
}


for(let p = 0; p < 3; p++){

	for(let j = 0; j < 4; j++){
		agent.move(UP)
		for(let k = 0; k < 6; k++){

			agent.place(DOWN)
			agent.move(BACK)

			
		}
		agent.turn(RIGHT)

	}
}

