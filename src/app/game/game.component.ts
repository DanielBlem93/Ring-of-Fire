import { Injectable, inject } from '@angular/core';
import { Component } from '@angular/core';
import { Game } from 'src/models/game';
import { OnInit } from '@angular/core'
import { MatDialog, } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { Firestore, collection, doc, collectionData, getFirestore, onSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { addDoc } from '@firebase/firestore';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})

@Injectable({
  providedIn: 'root'
})




export class GameComponent implements OnInit {


  pickCardAnimation = false;
  currentCard: string = '';
  game: Game;

  gamesDataBase
  unsubParams;
  unsubGames;
  gameId
  firestore: Firestore = inject(Firestore)



  constructor(private route: ActivatedRoute,
    public dialog: MatDialog) {

    this.game = new Game()
    this.unsubGames = this.subGames()
    this.gamesDataBase = collection(this.firestore, 'games')
    this.gamesDataBase.subscribe()
    
  }

  ngOnInit() {
    this.newGame()
    this.route.params.subscribe((params) => {
      this.gameId = params['id']
      console.log('params:', params['id'])

    })
    this.addGame()
    console.log('database', this.gamesDataBase)
    let ref = doc(this.gamesDataBase,)
    console.log('ref',ref.path)

  }

  ngOnDestroy() {
    this.unsubGames()
    console.log('unsub games')
  }



  subGames() {
    console.log('sub games')
    return onSnapshot(this.getGamesRef(), (list) => {
      list.forEach(element => {
        // console.log('elementdata:', element.data(), 'id:', element.id)


      });
    })
  }

  getGamesRef() {
    return collection(this.firestore, 'games')
  }

  async addGame() {
    try {

      const docRef = await addDoc(this.getGamesRef(), this.game.toJson())

      console.log("Document written with ID: ", docRef?.id);
    }
    catch (err) {
      console.error(err);
    }
  }





  // =======================================





  newGame() {
    this.game = new Game()

  }

  takeCard() {
    if (!this.pickCardAnimation && this.game.stack.length > 0) {

      this.currentCard = this.game.stack.pop()!;
      this.pickCardAnimation = true;


      console.log('New card:' + this.currentCard)
      console.log(this.game)
      this.game.currentPlayer++
      this.game.currentPlayer = this.game.currentPlayer % this.game.players.length
      setTimeout(() => {

        this.game.playedCards.push(this.currentCard)
        this.pickCardAnimation = false
      }, 1000);

    } else {
      console.warn('Der Kartenstapel ist leer/karte ziehen geblockt.');
    }

  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent,);

    dialogRef.afterClosed().subscribe((name: string) => {
      if (name && name.length > 0) {
        this.game.players.push(name)
      }

    });
  }




}

