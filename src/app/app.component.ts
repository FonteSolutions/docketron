import {Component, OnDestroy} from '@angular/core';
import {Socket} from 'ng-socket-io';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
    title = 'Docketron';

    constructor(private socket: Socket) {
        socket.fromEvent('message').subscribe(data => {
            setInterval(() => {
                socket.emit('_message', {'aaa': 123});
            }, 5000);
            console.log('data received', data);
        });
    }

    ngOnDestroy() {
        this.socket.disconnect();
    }
}
