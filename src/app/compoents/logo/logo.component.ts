import { Component } from '@angular/core';
import {siteName} from "../../env";

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.css']
})
export class LogoComponent {

    protected readonly siteName = siteName;
}
