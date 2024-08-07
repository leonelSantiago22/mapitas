import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrsComponent } from './ors.component';

describe('OrsComponent', () => {
  let component: OrsComponent;
  let fixture: ComponentFixture<OrsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
