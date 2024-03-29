import {Component, Input} from '@angular/core';
import {Message} from "../../../chat/group/group-chat-view/Message";
import { MatIcon } from '@angular/material/icon';
import {MatIconButton, MatMiniFabButton} from '@angular/material/button';

import { FileShareComponent } from '../../../file-share/file-share.component';

@Component({
    selector: 'app-post-files-viewer',
    templateUrl: './post-files-viewer.component.html',
    styleUrls: ['./post-files-viewer.component.scss'],
    standalone: true,
  imports: [FileShareComponent, MatIconButton, MatIcon, MatMiniFabButton]
})
export class PostFilesViewerComponent {
  @Input() files: Message[] = [];
  showingFileIndex = 0;


  showBackButton(): boolean {
    return this.showingFileIndex > 0;
  }

  showNextButton(): boolean {
    return this.showingFileIndex < this.files.length - 1;
  }
}
