// vim: set ts=2; smartindent; tabstop=2; shiftwidth=2
/*
	 0NNN	Call		Calls RCA 1802 program at address NNN. Not necessary for most ROMs.
	 00E0	Display	disp_clear()	Clears the screen.
	 00EE	Flow	return;	Returns from a subroutine.
	 1NNN	Flow	goto NNN;	Jumps to address NNN.
	 2NNN	Flow	*(0xNNN)()	Calls subroutine at NNN.
	 3XNN	Cond	if(Vx==NN)	Skips the next instruction if VX equals NN. (Usually the next instruction is a jump to skip a code block)
	 4XNN	Cond	if(Vx!=NN)	Skips the next instruction if VX doesn't equal NN. (Usually the next instruction is a jump to skip a code block)
	 5XY0	Cond	if(Vx==Vy)	Skips the next instruction if VX equals VY. (Usually the next instruction is a jump to skip a code block)
	 6XNN	Const	Vx = NN	 Sets VX to NN.
	 7XNN	Const	Vx += NN	Adds NN to VX.
	 8XY0	Assign	Vx=Vy	Sets VX to the value of VY.
	 8XY1	BitOp	Vx=Vx|Vy	Sets VX to VX or VY. (Bitwise OR operation)
	 8XY2	BitOp	Vx=Vx&Vy	Sets VX to VX and VY. (Bitwise AND operation)
	 8XY3	BitOp	Vx=Vx^Vy	Sets VX to VX xor VY.
	 8XY4	Math	Vx += Vy	Adds VY to VX. VF is set to 1 when there's a carry, and to 0 when there isn't.
	 8XY5	Math	Vx -= Vy	VY is subtracted from VX. VF is set to 0 when there's a borrow, and 1 when there isn't.
	 8XY6	BitOp	Vx >> 1	Shifts VX right by one. VF is set to the value of the least significant bit of VX before the shift.[2]
	 8XY7	Math	Vx=Vy-Vx	Sets VX to VY minus VX. VF is set to 0 when there's a borrow, and 1 when there isn't.
	 8XYE	BitOp	Vx << 1	Shifts VX left by one. VF is set to the value of the most significant bit of VX before the shift.[2]
	 9XY0	Cond	if(Vx!=Vy)	Skips the next instruction if VX doesn't equal VY. (Usually the next instruction is a jump to skip a code block)
	 ANNN	MEM	I = NNN	Sets I to the address NNN.
	 BNNN	Flow	PC=V0+NNN	Jumps to the address NNN plus V0.
	 CXNN	Rand	Vx=rand()&NN	Sets VX to the result of a bitwise and operation on a random number (Typically: 0 to 255) and NN.
	 DXYN	Disp	draw(Vx,Vy,N)	Draws a sprite at coordinate (VX, VY) that has a width of 8 pixels and a height of N pixels. Each row of 8 pixels is read as bit-coded starting from memory location I; I value doesnât change after the execution of this instruction. As described above, VF is set to 1 if any screen pixels are flipped from set to unset when the sprite is drawn, and to 0 if that doesnât happen
	 EX9E	KeyOp	if(key()==Vx)	Skips the next instruction if the key stored in VX is pressed. (Usually the next instruction is a jump to skip a code block)
	 EXA1	KeyOp	if(key()!=Vx)	Skips the next instruction if the key stored in VX isn't pressed. (Usually the next instruction is a jump to skip a code block)
	 FX07	Timer	Vx = get_delay()	Sets VX to the value of the delay timer.
	 FX0A	KeyOp	Vx = get_key()	A key press is awaited, and then stored in VX. (Blocking Operation. All instruction halted until next key event)
	 FX15	Timer	delay_timer(Vx)	Sets the delay timer to VX.
	 FX18	Sound	sound_timer(Vx)	Sets the sound timer to VX.
	 FX1E	MEM	I +=Vx	Adds VX to I.[3]
	 FX29	MEM	I=sprite_addr[Vx]	Sets I to the location of the sprite for the character in VX. Characters 0-F (in hexadecimal) are represented by a 4x5 font.
	 FX33	BCD	set_BCD(Vx);
 *(I+0)=BCD(3);

 *(I+1)=BCD(2);

 *(I+2)=BCD(1);

 Stores the binary-coded decimal representation of VX, with the most significant of three digits at the address in I, the middle digit at I plus 1, and the least significant digit at I plus 2. (In other words, take the decimal representation of VX, place the hundreds digit in memory at location in I, the tens digit at location I+1, and the ones digit at location I+2.)
 FX55	MEM	reg_dump(Vx,&I)	Stores V0 to VX (including VX) in memory starting at address I.[4]
 FX65	MEM	reg_load(Vx,&I)	Fills V0 to VX (including VX) with values from memory starting at address I.[4]
 */
  var chip8_fontset = new Array(
		0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
		0x20, 0x60, 0x20, 0x20, 0x70, // 1
		0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
		0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
		0x90, 0x90, 0xF0, 0x10, 0x10, // 4
		0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
		0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
		0xF0, 0x10, 0x20, 0x40, 0x40, // 7
		0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
		0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
		0xF0, 0x90, 0xF0, 0x90, 0x90, // A
		0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
		0xF0, 0x80, 0x80, 0x80, 0xF0, // C
		0xE0, 0x90, 0x90, 0x90, 0xE0, // D
		0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
		0xF0, 0x80, 0xF0, 0x80, 0x80  // F
		);
function OP_nnn (opcode) { return opcode & 0xFFF;}
function OP_nn(opcode) { return (opcode & 0xFF);}
function OP_n (opcode) { return (opcode & 0xF);}
function OP_X (opcode) { return ((opcode & 0xF00) >> 8);}
function OP_Y (opcode) { return ((opcode & 0xF0) >> 4);}

function chip8() {
	this.key_is_pressed =false;
	this.memory = new Array(4096);
	this.v = new Array(16);
	this.r = new Array(8);
	this.I=0;
	this.pc=0x200; //program counter starts at 0x200
	this.gfx = new Array(128*64); //x -y
	this.delay_timer;
	this.sound_timer;
	this.stack = new Array(16);
	this.sp;
	this.key = new Array(16);
	this.done = false;
	this.esm = false;
// If the draw flag is set, update the screen
	this.drawFlag= false;
	this.ckey;

};

chip8.prototype.isDone = function() {
	return done;
}
chip8.prototype.initialize = function () {
	this.pc     = 0x200;  // Program counter starts at 0x200
	//opcode = 0;      // Reset current opcode
	this.I      = 0;      // Reset index register
	this.sp     = 0;      // Reset stack pointer
	// Load fontset
	for(var i = 0; i < 80; ++i) {
		this.memory[i] = chip8_fontset[i];
	}
	// Reset timers
	this.delay_timer=0;
	this.sound_timer=0;
}
chip8.prototype.getMaxX = function() {
	return this.esm? 128: 64;
}
chip8.prototype.getMaxY = function() {
	return this.esm? 64: 32;
}
chip8.prototype.getGfx = 	function () {
	return this.gfx;
}
chip8.prototype.setInstructionAt = 	function (offset, opcode) {
	this.memory[offset]  = (opcode & 0xFF00) >> 8; 
	this.memory[offset+1]  = (opcode & 0xFF); 
}

chip8.prototype.LoadInstruction =   function (offset, opcode) {
	opcode = htons(opcode);
	setInstructionAt(pc + (2*offset), opcode);
}
chip8.prototype.loadGame =	function (game) {
	for (var i=0; i< game.length; i++) {
		this.memory[this.pc +i ] = game[i];
	}
}

chip8.prototype.emulateCycle = 	function () {
	this.emulateCycle_();
	if (this.pc >  this.memory.length)
		this.done= true;
	if (this.delay_timer)
		this.delay_timer--;
	if (this.sound_timer)
		this.sound_timer--;

}
//chip8.prototype.VOP_X  = function(opcode) { return  v[OP_X(opcode)];}
//chip8.prototype.VOP_Y  = function(opcode) { return  v[OP_Y(opcode)];}
// Emulate one cycle
chip8.prototype.emulateCycle_= 	function () {
	this.drawFlag = false;
	var opcode = this.memory[this.pc] << 8 | this.memory[this.pc + 1];
	var t1,t2;
	var i,j;
	switch(opcode & 0xF000) {
		case 0x0000:
			switch(opcode) {
				case 0x0000: //clear screen
					//noop
					break;
				case 0x00FD: // stop emulator
					//							printf("clear screen\n");
					this.done =true;
					break;
				case 0x00Fb: // scroll 4 pixels to the right
					// not implemented
					abort();
					break;
				case 0x00Fc: // scroll 4 pixels to the left
					// not implemented
					abort();
					break;
				case 0x00FF: // enabled extend screen mode
					// not implemented
					this.esm = true;
					break;
				case 0x00Fe: // disable extend screen mode
					this.esm = false;
					break;
				case 0x00E0: //clear screen
					drawFlag = true;
					memset(gfx, 0, sizeof(gfx));
					break;
				case 0x00EE: // return
					if (this.sp == 0) {
						printf("sp == 0 at ps %d\n", pc);
						this.done =true;
					}
					this.pc = this.stack[this.sp -1] ;
					this.sp--;
					break; //we want it to move to next instruction
				default:
					if ((opcode & 0xFFF0) == 0x00c0) {
						var rowsiz = getMaxX();
						var colsiz = getMaxY();
						var n = (opcode & 0xf);
						var start_row = 0, last_row = colsiz - n - 1;
						for (var row = last_row; row >= start_row; row--) {
							for (var x = 0; x < rowsiz; x++) {
								var from = row * rowsiz + x;
								var to = (row + n) * rowsiz + x;
								gfx[to] = gfx[from];
							}
						}
					}
					else if (opcode != 0) {
						this.done =true;
						printf("known opcode: %x \n", opcode);
					}
			};
			break;
		case 0x1000: //1NNN	Flow	goto NNN;	Jumps to address NNN.
			this.pc = OP_nnn(opcode);
			return;
		case 0x2000:  //2NNN	Flow	*(0xNNN)()	Calls subroutine at NNN.
			if (this.sp ==16)  {
				printf("stack overflow at ps %d\n", pc);
				this.done =true;
			}
			this.stack[this.sp] = this.pc;
			this.sp++;
			this.pc = opcode &0xFFF;
			return; // notice return here
		case 0x3000:   //3XNN	Cond	if(Vx==NN)	Skips the next instruction if VX equals NN. (Usually the next instruction is a jump to skip a code block)
			if (this.v[OP_X(opcode)] == OP_nn(opcode))
				this.pc= (this.pc +2) & 0xFFF;
			break;
		case 0x4000: //4XNN	Cond	if(Vx!=NN)	Skips the next instruction if VX doesn't equal NN. (Usually the next instruction is a jump to skip a code block)
			if (this.v[OP_X(opcode)] != OP_nn(opcode))
				this.pc= (this.pc + 2) & 0xFFF;
			break;
		case 0x5000: //5XY0	Cond	if(Vx==Vy)	Skips the next instruction if VX equals VY. (Usually the next instruction is a jump to skip a code block)
			if (this.v[OP_X(opcode)] == this.v[OP_Y(opcode)])
				this.pc= (this.pc +2) & 0xFFF;
			break;
		case 0x6000: //6XNN	Const	Vx = NN	Sets VX to NN.
			this.v[OP_X(opcode)] = OP_nn(opcode);
			break;
		case 0x7000: //  7XNN	Const	Vx += NN	Adds NN to VX.
			this.v[OP_X(opcode)] += OP_nn(opcode);
			break;
		case 0x8000:
			this.handle8(opcode);
			break;
		case 0x9000: //9XY0	Cond	if(Vx!=Vy)	Skips the next instruction if VX doesn't equal VY. (Usually the next instruction is a jump to skip a code block)
			if (v[OP_X(opcode)] != this.v[OP_Y(opcode)])
				this.pc=(this.pc +2) & 0xFFF;
			break;
		case 0xA000: // ANNN	MEM	I = NNN	Sets I to the address NNN.
			this.I = OP_nnn(opcode);
			break;
		case 0xB000: // BNNN	Flow	PC=V0+NNN	Jumps to the address NNN plus V0.
			this.pc = (this.v[0] +OP_nnn(opcode)) & 0xFFF;
			return;
		case 0xC000: //CXNN	Rand	Vx=rand()&NN	Sets VX to the result of a bitwise and operation on a random number (Typically: 0 to 255) and NN.
			t1= Math.random() & OP_nn(opcode);
			this.v[OP_X(opcode)] = t1;
			break;
		case 0xD000:  //DXYN	Disp	draw(Vx,Vy,N)	Draws a sprite at coordinate (VX, VY) that has a width of 8 pixels and a height of N pixels. Each row of 8 pixels is read as bit-coded starting from memory location I; I value doesnât change after the execution of this instruction. As described above, VF is set to 1 if any screen pixels are flipped from set to unset when the sprite is drawn, and to 0 if that doesnât happen
			this.drawFlag = true;

			this.v[0xF] = 0;
			t1=OP_X(opcode);
			t2=OP_Y(opcode);
			if (this.esm && ((opcode &0xF) == 0)) {
				for (j=0; j < (opcode &0xF); j++) {
					var hi = this.memory[this.I +2 * j ];
					var lo = this.memory[this.I +2 * j +2 ];
					var sprite = hi << 8 | lo;
					for (var i= 0; i < 16; i++) {
						var px = (this.v[t1] +i) & 127;
						var py = (this.v[t2] +j) & 63;
						var pos = 128 * py + px;
						//what to plot
						var pixel = (sprite &( 1 << (15 - i) )) != 0;
						v[15] |= (this.gfx[pos] & pixel);
						this.gfx[pos] ^= pixel;

					}
				}
			}
			else for (j=0; j < (opcode &0xF); j++) {
				var pixel = this.memory[this.I+ j];
				for (var i=0; i< 8; i++) {
					if((pixel & (0x80 >> i)) != 0)
					{
						if(this.gfx[(this.v[t1] + i + ((this.v[t2] + j) * this.getMaxX()))] == 1)
							this.v[0xF] = 1;
						this.gfx[(this.v[t1] + i + ((this.v[t2] + j) * this.getMaxX()))] ^= 1;
					}
				}
			}
			break;
		case 0xE000:
			t1= OP_X(opcode);
			if ((opcode &0xFF) == 0x9E) {
				if (this.keypress(v[t1])) //EX9E	KeyOp	if(key()==Vx)	Skips the next instruction if the key stored in VX is pressed. (Usually the next instruction is a jump to skip a code block)
					this.pc= (this.pc +2) & 0xFFF;
			} else { // EXA1	KeyOp	if(key()!=Vx)	Skips the next instruction if the key stored in VX isn't pressed. (Usually the next instruction is a jump to skip a code block)
				if (!this.keypress(this.v[t1]))
					this.pc =(this.pc + 2) &0xFFF;
			}
			break;
		case 0xF000:
			this.handleF(opcode);
			break;
		default:
			printf("known opcode: %x \n", opcode);
			this.done =true;
	};
	this.pc+=2;
}
chip8.prototype.keyConvert = function(k) {
	var ckey=-1;
	/*
		 if (k>= '0' && k <= '9')
		 ckey = k - '0';
		 if (k>= 'a' && k <= 'f')
		 ckey = 10 + (k - 'a');
	 */
	switch(k) {
		case 88: return 0;
		case 49: return 1;
		case 50: return 2;
		case 51: return 3;
		case 81: return 4;
		case 87: return 5;
		case 69: return 6;
		case 65: return 7;
		case 83: return 8;
		case 68: return 9;
		case 90: return 10;
		case 'c': return 11;
		case 52: return 12;
		case 'r': return 13;
		case 'f': return 14;
		case 'v': return 15;
	}
	return ckey;
}

chip8.prototype.setKeys = function(k) {
	ckey = this.keyConvert(k);
	if (ckey != -1)
		this.key[ckey] = 1;
}
chip8.prototype.keypress = function (k) {
	if (k >0xF)
		return 0;
	var pressed = this.key[k];
	this.key[k] = 0;

	return pressed;
}
//chip8.prototype.getchar= function () {
//}

chip8.prototype.handle8 = function (opcode) {
	var Vx = this.v[OP_X(opcode)];
	var Vy = this.v[OP_Y(opcode)];
	switch(opcode &0xF) {
		case 0: //8XY0	Assign	Vx=Vy	Sets VX to the value of VY.
			this.v[OP_X(opcode)]=this.v[OP_Y(opcode)];
			break;
		case 1: //8XY1	BitOp	Vx=Vx|Vy	Sets VX to VX or VY. (Bitwise OR operation)
			this.v[OP_X(opcode)] |= Vy;
			break;
		case 2: //8XY2	BitOp	Vx=Vx&Vy	Sets VX to VX and VY. (Bitwise AND operation)
			this.v[OP_X(opcode)] &= Vy;
			break;
		case 3: //8XY3	BitOp	Vx=Vx^Vy	Sets VX to VX xor VY.
			this.v[OP_X(opcode)] ^= Vy;
			break;
		case 4: //8XY4	Math	Vx += Vy	Adds VY to VX. VF is set to 1 when there's a carry, and to 0 when there isn't.
			this.v[0xF] = 0;
			if ((Vx +Vy) > 0xFF)
				this.v[0xF] = 1;
			this.v[OP_X(opcode)]+= Vy;
			break;
		case 5: //8XY5	Math	Vx -= Vy	VY is subtracted from VX. VF is set to 0 when there's a borrow, and 1 when there isn't.
			this.v[0xF] = Vx > Vy;
			this.v[OP_X(opcode)]-= Vy;
			break;
		case 6: //8XY6	BitOp	Vx >> 1	Shifts VX right by one. VF is set to the value of the least significant bit of VX before the shift.[2]
			v[0xF] = Vx&1;
			this.v[OP_X(opcode)]= Vx>> 1;
			break;
		case 7: //8XY7	Math	Vx=Vy-Vx	Sets VX to VY minus VX. VF is set to 0 when there's a borrow, and 1 when there isn't.
			v[0xF] = Vy > Vx;
			this.v[OP_X(opcode)]= Vy - Vx;
			break;
		case 0xE: //8XYE	BitOp	Vx << 1	Shifts VX left by one. VF is set to the value of the most significant bit of VX before the shift.[2]
			this.v[0xF] = (Vx & 0x80) >0;
			this.v[OP_X(opcode)] = Vx<<1;
			break;
	}
}
chip8.prototype.handleF = function(opcode) {
		switch (opcode &0xFF) {
		case 0x07: // FX07	Timer	Vx = get_delay()	Sets VX to the value of the delay timer.
			this.v[OP_X(opcode)] = this.delay_timer;
			break;
		case 0x0A: // FX0A	KeyOp	Vx = get_key()	A key press is awaited, and then stored in VX. (Blocking Operation. All instruction halted until next key event)
			this.v[OP_X(opcode)] = keyConvert(this.getchar());
			break;
		case 0x15: // FX15	Timer	delay_timer(Vx)	Sets the delay timer to VX.
			this.delay_timer =this.v[OP_X(opcode)];
			break;
		case 0x18: //FX18	Sound	sound_timer(Vx)	Sets the sound timer to VX.
			this.sound_timer = this.v[OP_X(opcode)];
			break;
		case 0x1E: //FX1E	MEM	I +=Vx	Adds VX to I.[3]
			this.I += this.v[OP_X(opcode)];
			break;
		case 0x29: // FX29	MEM	I=sprite_addr[Vx]	Sets I to the location of the sprite for the character in VX. Characters 0-F (in hexadecimal) are represented by a 4x5 font.
			this.I = ( this.v[OP_X(opcode)] &0xF) * 5;
			break;
		case 0x30: // FX29	MEM	I=sprite_addr[Vx]	Sets I to the location of the sprite for the character in VX. Characters 0-F (in hexadecimal) are represented by a 4x5 font.
			this.I = 0x8200 + ( this.v[OP_X(opcode)] &0xF) * 10;
			break;
		case 0x33:
			/*
				 FX33	BCD	set_BCD(Vx);
			 *(I+0)=BCD(3);
			 *(I+1)=BCD(2);
			 *(I+2)=BCD(1);
			 Stores the binary-coded decimal representation of VX, with the most significant of three digits at the address in I, the middle digit at I plus 1, and the least significant digit at I plus 2. (In other words, take the decimal representation of VX, place the hundreds digit in memory at location in I, the tens digit at location I+1, and the ones digit at location I+2.)
			 */
			var Vx=  this.v[OP_X(opcode)];
			this.memory[this.I]     = Vx / 100;
			this.memory[this.I + 1] = (Vx / 10) % 10;
			this.memory[this.I + 2] = (Vx % 100) % 10;
			break;
		case 0x55: //V
			for (var i=0; i<=OP_X(opcode); i++) {
				this.memory[this.I+i] = this.v[i];
			}
			break;
		case 0x65: // FX65	MEM	reg_load(Vx,&I)	Fills V0 to VX (including VX) with values from memory starting at address I.[4]
			for (var i=0; i<=OP_X(opcode); i++) {
				this.v[i] = this.memory[this.I+i];
			}
			break;
		case 0x75: // FX75	store V regs in r reg
			for (var i=0; i<=OP_X(opcode); i++) {
				this.r[i]= this.v[i];
			}
			break;
		case 0x85: // FX85	store r regs in V reg
			for (var i=0; i<=OP_X(opcode); i++) {
				this.v[i] = this.r[i];
			}
			break;
	}
}

