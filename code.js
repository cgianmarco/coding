for(let p = 0; p < 10; p++){

	agent.move(UP)

	for(let j = 0; j < 4; j++){
		for(let k = 0; k < 20; k++){

			agent.place(DOWN)
			agent.move(FORWARD)
			
		}
		agent.turn(LEFT)
	}
}

// agent.move(UP)
// agent.place(DOWN)
// agent.move(FORWARD)
// agent.place(DOWN)
// agent.move(LEFT)
// agent.place(DOWN)
