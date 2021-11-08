import { Component, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subject, timer, BehaviorSubject } from 'rxjs';
import { switchMap, startWith, scan, takeWhile, takeUntil, mapTo, finalize } from 'rxjs/operators';

@Component({
  selector: 'core-number-tracker',
  template: `{{ currentNumber }}`
})
export class NumberTrackerComponent implements OnDestroy {
  @Input()
  set end(endRange: number) {
    this._counterSub$.next(endRange);
  }
  @Output()
  complete = new EventEmitter<boolean>();
  public currentNumber = 0;
  private _counterSub$ = new BehaviorSubject(0);
  private _onDestroy$ = new Subject();

  constructor() {
    this._counterSub$
      .pipe(
        switchMap(endRange => {
          return timer(0, 5).pipe(
            startWith(this.currentNumber),
            scan((acc: number, curr: number) => acc + curr),
            takeWhile(() => endRange > this.currentNumber),
            finalize(() => this.complete.emit(true))
          )
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe((val: number) => this.currentNumber = this._counterSub$.value > val ?  val: this._counterSub$.value);
  }

  ngOnDestroy() {
    this._onDestroy$.next();
    this._onDestroy$.complete();
  }
}
