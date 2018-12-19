import { TestBed } from '@angular/core/testing';

import { WikiintroService } from './wikiintro.service';

describe('WikiintroService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WikiintroService = TestBed.get(WikiintroService);
    expect(service).toBeTruthy();
  });
});
