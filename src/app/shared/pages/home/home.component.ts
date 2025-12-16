import { AfterViewInit, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
declare var bootstrap: any;
@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit{

  ngAfterViewInit() {
    const carouselElement = document.querySelector('#withIndicators');
    if (carouselElement) {
      const carousel = bootstrap.Carousel.getOrCreateInstance(carouselElement, {
        interval: 3000,
        ride: 'carousel',
      });
      carousel.cycle();
    }
  }
}
