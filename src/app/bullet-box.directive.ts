import { Directive, OnInit, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appBulletBox]'
})
export class BulletBoxDirective implements OnInit {
  description: string;
  @Input() form: any;
  @Output() newBullet = new EventEmitter();
  @HostListener('keydown.enter', ['$event']) onEnter(event: KeyboardEvent) {
    this.rawValue = this.rawValue += '\n• ';
    event.preventDefault();
  }
  @HostListener('change', ['$event']) change(event) {
    this.newBullet.emit(this.rawValue);
  }

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
    this.rawValue = this.form.get('description').value;
  }

  get rawValue(): string {
    return this.elementRef.nativeElement.value;
  }
  set rawValue(value: string) {
    this.elementRef.nativeElement.value = value;
  }
}
