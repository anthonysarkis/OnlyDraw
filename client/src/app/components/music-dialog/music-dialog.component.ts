import { Component } from '@angular/core';
import { Track } from 'ngx-audio-player';

@Component({
    selector: 'app-music-dialog',
    templateUrl: './music-dialog.component.html',
    styleUrls: ['./music-dialog.component.scss'],
})
export class MusicDialogComponent {
    playlist: Track[];
    constructor() {
        this.playlist = [
            {
                title: 'Reflection | JAD',
                link: './assets/songs/reflection.mp3',
                artist: 'JAD',
            },
            {
                title: "Won't Mind | JAD",
                link: "./assets/songs/won't mind.mp3",
                artist: 'JAD',
            },
            {
                title: 'King Cap | Hxx',
                link: './assets/songs/KING CAP.mp3',
                artist: 'Hxx',
            },
            {
                title: 'Stay | JAD',
                link: './assets/songs/Stay.mp3',
                artist: 'JAD',
            },
            {
                title: 'Redfern | KFTU',
                link: './assets/songs/redfern.mp3',
                artist: 'KFTU',
            },
            {
                title: 'Earworm | Samaether',
                link: './assets/songs/earworm.mp3',
                artist: 'Samaether',
            },
            {
                title: 'QUESTIONS | lame angel',
                link: './assets/songs/QUESTIONS.mp3',
                artist: 'lame angel',
            },
            {
                title: 'Inspire | Fernie',
                link: './assets/songs/Inspire.mp3',
                artist: 'Fernie',
            },
            {
                title: 'HOMEWORK | Hxx',
                link: './assets/songs/HOMEWORK.mp3',
                artist: 'Hxx',
            },
        ];
    }
}
