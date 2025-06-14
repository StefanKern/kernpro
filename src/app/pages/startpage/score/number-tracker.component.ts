import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { interval, Subject } from 'rxjs';
import { finalize, scan, takeUntil, takeWhile } from 'rxjs/operators';

@Component({
    selector: 'core-number-tracker',
    template: `{{ currentNumber() }}`
})
export class NumberTrackerComponent implements OnDestroy , OnInit{
  @Input({required: true})
  end: number = 0;
  @Output()
  complete = new EventEmitter<boolean>();
  public currentNumber = signal<number>(0);
  private destroy$ = new Subject<void>();

  ngOnInit() {
    interval(5).pipe(
      scan((acc: number, curr: number) => acc + curr),
      takeWhile(() => this.end > this.currentNumber()),
      finalize(() => this.complete.emit(true)),
      takeUntil(this.destroy$)
    ).subscribe((val: number) => this.currentNumber.set(this.end > val ?  val: this.end));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
