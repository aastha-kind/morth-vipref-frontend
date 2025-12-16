import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  
  isGrevianceButton: boolean = true;
  isLoginedButton: boolean = true;
  isHomeButton: boolean = false;
  originalFontSize!: number;
  currentFontSize!: number;
  private router = inject(Router);
  languages = [
    { label: 'English', value: 'en', icon: 'assets/img/language-2.png' },
    { label: 'हिन्दी - Hindi', value: 'hi', icon: 'assets/img/language-2.png' }
  ];
  selectedLanguage = 'en';

  ngOnInit(): void {
    this.setNavbarButtons();
    const fontSize = window.getComputedStyle(document.body).getPropertyValue('font-size');
    this.originalFontSize = parseInt(fontSize, 10);
    this.currentFontSize = this.originalFontSize;
  }
  setNavbarButtons() {
    const currentUrl = this.router.url;
    if (currentUrl !== undefined && currentUrl !== null) {
      if (currentUrl == "/login") {
        this.isLoginedButton = false;
        this.isHomeButton = true;
        this.isGrevianceButton = false;
      }
      if (currentUrl == "/public-greviance") {
        this.isLoginedButton = false;
        this.isHomeButton = true;
        this.isGrevianceButton = false;
      }
    }
  }
  userLogin() {
    this.router.navigate(['/login'])
  }
  publicGreviance() {
    this.router.navigate(['/public-greviance'])
  }

  increaseFontSize() {
    var body = document.getElementsByTagName('body')[0];
    if (this.currentFontSize < this.originalFontSize + 4) {
      this.currentFontSize += 2;
      body.style.fontSize = this.currentFontSize + 'px';
    }
  }

  reduceFontSize() {
    if (this.currentFontSize > this.originalFontSize - 6) {
      this.currentFontSize -= 2;
      document.body.style.fontSize = this.currentFontSize + 'px';
      
    }
  }

  resetFontSize() {
    this.currentFontSize = this.originalFontSize;
    document.body.style.fontSize = this.originalFontSize + 'px';
  }
navigateHome(){
  this.router.navigate(['/']);
}
}
