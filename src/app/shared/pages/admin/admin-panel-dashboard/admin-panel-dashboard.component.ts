import { Component } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-admin-panel-dashboard',
  standalone: false,
  templateUrl: './admin-panel-dashboard.component.html',
  styleUrl: './admin-panel-dashboard.component.css'
})
export class AdminPanelDashboardComponent {

public lineChartData: ChartConfiguration<'line'>['data'] = {
labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
datasets: [
{ data: [120, 200, 150, 80, 220, 300, 250], label: 'Payment', tension: 0.4, fill: true },
{ data: [180, 150, 130, 210, 240, 260, 230], label: 'Canceled', tension: 0.4, fill: false }
]
};
public lineChartOptions: ChartOptions<'line'> = {
responsive: true,
plugins: {
legend: { position: 'top' }
}
};


// Small sparkline chart (Profit)
public sparklineData: ChartConfiguration<'line'>['data'] = {
labels: Array.from({ length: 20 }, (_, i) => i + 1),
datasets: [{ data: [5,6,8,7,10,12,15,14,16,18,16,20,22,21,24,26,25,27,28,30], label: 'Profit', tension: 0.4, fill: true }]
};
public sparklineOptions: ChartOptions<'line'> = { responsive: true, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } };


// Table data
public traffic = [
{ day: 'Mon', visits: 784, trend: '+69%' },
{ day: 'Tue', visits: 541, trend: '-19%' },
{ day: 'Wed', visits: 702, trend: '-26%' },
{ day: 'Thu', visits: 870, trend: '+61%' },
{ day: 'Fri', visits: 796, trend: '-19%' }
];
}
