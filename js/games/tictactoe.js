/* Tres en raya: local, ligero y sin dependencias. */
window.TicTacToe = class {
  constructor(container) { this.container=container; this.board=Array(9).fill(''); this.turn='X'; this.over=false; }
  init() {
    this.container.innerHTML = `<section class="mini-game ttt-game"><div class="mini-game-head"><div><span class="mini-kicker">CLÁSICO</span><h2>Tres en raya</h2></div><span class="mini-score" id="ttt-status">Turno de X</span></div><div class="ttt-board" role="group" aria-label="Tablero de tres en raya">${this.board.map((_,i)=>`<button class="ttt-cell" data-i="${i}" aria-label="Casilla ${i+1}"></button>`).join('')}</div><div class="mini-game-foot"><span>Dos jugadores · mismo dispositivo</span><button class="btn btn-secondary btn-sm" id="ttt-reset">Nueva partida</button></div></section>`;
    this.cells=[...this.container.querySelectorAll('.ttt-cell')]; this.status=this.container.querySelector('#ttt-status');
    this.cells.forEach((b,i)=>b.onclick=()=>this.play(i)); this.container.querySelector('#ttt-reset').onclick=()=>this.restart();
  }
  play(i) { if(this.over||this.board[i]) return; this.board[i]=this.turn; this.render(); const line=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]].find(a=>a.every(n=>this.board[n]===this.turn)); if(line){this.over=true;this.status.textContent=this.turn+' gana';line.forEach(n=>this.cells[n].classList.add('is-winner'));window.storage?.setScore?.('tictactoe',1);return;} if(this.board.every(Boolean)){this.over=true;this.status.textContent='Empate';return;} this.turn=this.turn==='X'?'O':'X';this.status.textContent='Turno de '+this.turn; }
  render(){this.cells.forEach((b,i)=>{b.textContent=this.board[i];b.classList.toggle('mark-x',this.board[i]==='X');b.classList.toggle('mark-o',this.board[i]==='O');b.disabled=!!this.board[i]||this.over;});}
  restart(){this.board=Array(9).fill('');this.turn='X';this.over=false;this.status.textContent='Turno de X';this.cells.forEach(b=>{b.textContent='';b.disabled=false;b.classList.remove('mark-x','mark-o','is-winner');});}
  destroy(){}
};