import { Injectable, inject } from '@angular/core';
import { Component } from '@angular/core';
import { Game } from 'src/models/game';
import { OnInit } from '@angular/core'
import { MatDialog, } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { Firestore, collection, doc, collectionData, getFirestore, onSnapshot } from '@angular/fire/firestore';
import { Observable, Subscription, } from 'rxjs';
import { addDoc, getDoc, deleteDoc, updateDoc } from '@firebase/firestore';
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



  game: Game;

  firestore: Firestore = inject(Firestore)
  gamesRef: CollectionReference
  gamesData$: Observable<any[]>;
  gamesDataSubscribtion: Subscription
  public currentGameId: string



  constructor(private route: ActivatedRoute,
    public dialog: MatDialog, private router: Router) {

    this.gamesRef = this.getGamesRef()
    this.gamesData$ = collectionData(this.gamesRef)
    this.newGame()

    this.gamesDataSubscribtion = this.gamesData$.subscribe((game) => {

      game.forEach(game => {
        if (game.id === this.currentGameId) {
          this.game.currentPlayer = game.currentPlayer
          this.game.playedCards = game.playedCards
          this.game.players = game.players
          this.game.stack = game.stack
          this.game.currentCard = game.currentCard
          this.game.pickCardAnimation = game.pickCardAnimation
          console.log('updated from firestore')
          console.log('game update', game);
        }
      });
    });
  }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.gamesDataSubscribtion.unsubscribe()
    console.log('unsub games')
  }

  getGamesRef() {
    return collection(this.firestore, 'games')
  }

  getSingleDocRef(docId: string) {
    return doc(this.gamesRef, docId)
  }

  async addGame() {
    try {
      this.route.params.subscribe((params) => {
        if (params['id'].length > 0) {
          this.navigateToId(params['id'])
          this.currentGameId = params['id']
        } else {
          this.setCurrentGame()
        }
      })
    } catch (err) {
      console.error(err);
    }
  }

  navigateToId(id: string) {
    this.router.navigate(['/game', id]);
  }


  async setCurrentGame() {
    await this.addGameDoc()
    this.navigateToId(this.currentGameId)
    await this.saveGame()
  }

  async addGameDoc() {
    let docRef = await addDoc(this.gamesRef, this.game.toJson());
    console.log("Document written with ID: ", docRef?.id);
    this.currentGameId = docRef.id;
  }

  async saveGame() {
    const updateData = {
      id: this.currentGameId,
      currentPlayer: this.game.currentPlayer,
      playedCards: this.game.playedCards,
      players: this.game.players,
      stack: this.game.stack,
      pickCardAnimation: this.game.pickCardAnimation,
      currentCard: this.game.currentCard

    }
    await updateDoc(this.getSingleDocRef(this.currentGameId), updateData)
  }

  // =======================================

  newGame() {
    this.game = new Game()
    this.addGame()
  }

  takeCard() {
    if (!this.game.pickCardAnimation && this.game.stack.length > 0) {

      this.game.currentCard = this.game.stack.pop()!;
      this.game.pickCardAnimation = true;
      console.log('New card:' + this.game.currentCard)
      this.game.currentPlayer++
      this.game.currentPlayer = this.game.currentPlayer % this.game.players.length
      this.saveGame()
      setTimeout(() => {
        this.game.playedCards.push(this.game.currentCard)
        this.game.pickCardAnimation = false
        this.saveGame()
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
        this.saveGame()
      }
    });
  }




}

