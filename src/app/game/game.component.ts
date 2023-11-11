import { Injectable, inject } from '@angular/core';
import { Component } from '@angular/core';
import { Game } from 'src/models/game';
import { OnInit } from '@angular/core'
import { MatDialog, } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { Firestore, collection, doc, collectionData, getFirestore, onSnapshot } from '@angular/fire/firestore';
import { Observable, Subscription, } from 'rxjs';
import { addDoc, getDoc, deleteDoc } from '@firebase/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionReference } from 'firebase/firestore/lite';




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

  firestore: Firestore = inject(Firestore)
  gamesRef: CollectionReference
  gamesData$: Observable<any[]>;
  gamesDataSubscribtion: Subscription
  currentGameId: string



  constructor(private route: ActivatedRoute,
    public dialog: MatDialog, private router: Router) {
    this.game = new Game()
    this.gamesRef = this.getGamesRef()
    this.gamesData$ = collectionData(this.gamesRef)

    this.gamesDataSubscribtion = this.gamesData$.subscribe((game) => {
      console.log('game update', game);
    });


  }

  ngOnInit() {
    this.newGame()
  }

  ngOnDestroy() {
    if (this.gamesData$) {
      this.gamesDataSubscribtion.unsubscribe()
    }

    console.log('unsub games')
  }

  getGamesRef() {
    return collection(this.firestore, 'games')
  }

  async addGame() {
    try {
      let docRef = await addDoc(this.gamesRef, this.game.toJson());
      console.log("Document written with ID: ", docRef?.id);
      this.currentGameId = docRef.id;
      // Navigating to the '/game' route with the 'id' parameter
      this.router.navigate(['/game', this.currentGameId]);
    } catch (err) {
      console.error(err);
    }
  }





  // =======================================





  newGame() {
    this.game = new Game()
    this.addGame()
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

