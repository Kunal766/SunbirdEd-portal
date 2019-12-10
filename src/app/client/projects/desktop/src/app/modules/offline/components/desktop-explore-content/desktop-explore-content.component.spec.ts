import { ConnectionService } from './../../services';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DesktopExploreContentComponent } from './desktop-explore-content.component';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';
import { TelemetryModule } from '@sunbird/telemetry';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ResourceService, ToasterService, SharedModule } from '@sunbird/shared';
import { CoreModule } from '@sunbird/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { response } from './desktop-explore-content.component.spec.data';
import { of as observableOf, throwError } from 'rxjs';
import { PublicPlayerService } from '@sunbird/public';


describe('DesktopExploreContentComponent', () => {
  let component: DesktopExploreContentComponent;
  let fixture: ComponentFixture<DesktopExploreContentComponent>;
  const resourceBundle = {
    messages: {
      fmsg: {
        m0004: 'Fetching data failed, please try again later...'
      }
    }
  };
  class FakeActivatedRoute {
    snapshot = {
      data: {
        softConstraints: { badgeAssertions: 98, board: 99, channel: 100 },
        telemetry: { env: 'browse', pageid: 'browse', type: 'view', subtype: 'paginate' }
      },
      params: { slug: 'ABC' },
      queryParams: { channel: '12345' }
    };
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DesktopExploreContentComponent],
      imports: [
        CommonConsumptionModule, TelemetryModule.forRoot(), RouterModule.forRoot([]), HttpClientTestingModule,
        CoreModule, SharedModule.forRoot(),
      ],
      providers: [{ provide: ActivatedRoute, useClass: FakeActivatedRoute }, ToasterService, ConnectionService,
      { provide: ResourceService, useValue: resourceBundle }, PublicPlayerService],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesktopExploreContentComponent);
    component = fixture.componentInstance;
    const router = TestBed.get(Router);
    spyOn(router.events, 'pipe').and.returnValue(observableOf());
    fixture.detectChanges();
  });

  it('should call ngOnInit for view all page', () => {
    const router = TestBed.get(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('view-all');
    const connectionService = TestBed.get(ConnectionService);
    spyOn(component, 'fetchRecentlyAddedContent');
    spyOn(connectionService, 'monitor').and.returnValue(observableOf(true));
    component.ngOnInit();
    expect(component.isConnected).toBeTruthy();
    expect(component.isViewAll).toBeTruthy();
    expect(component.fetchRecentlyAddedContent).toHaveBeenCalled();
  });

  it('should call ngOnInit for search page, get organization success', () => {
    spyOn(component.orgDetailsService, 'getOrgDetails').and.returnValue(observableOf(response.orgData));
    component.ngOnInit();
    expect(component.isViewAll).toBeFalsy();
    expect(component.hashTagId).toEqual('1234');
    expect(component.initFilters).toBeTruthy();
  });

  it('should call ngOnInit for search page, get organization error', () => {
    const router = TestBed.get(Router);
    spyOn(router, 'navigate');
    const connectionService = TestBed.get(ConnectionService);
    spyOn(component, 'fetchRecentlyAddedContent');
    spyOn(connectionService, 'monitor').and.returnValue(observableOf(true));
    spyOn(component.orgDetailsService, 'getOrgDetails').and.returnValue(throwError(undefined));
    component.ngOnInit();
    expect(component.isViewAll).toBeFalsy();
    expect(router.navigate).toHaveBeenCalledWith(['']);
  });

  it('should call goBack', () => {
    const router = TestBed.get(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('browse');
    spyOn(component.utilService, 'clearSearchQuery');
    spyOn(router, 'navigate');
    component.goBack();
    expect(component.utilService.clearSearchQuery).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/browse']);
  });

  it('should call playContent when online', () => {
    component.isBrowse = true;
    const publicPlayerService = TestBed.get(PublicPlayerService);
    spyOn(publicPlayerService, 'playContentForOfflineBrowse');
    component.playContent('test');
    expect(publicPlayerService.playContentForOfflineBrowse).toHaveBeenCalledWith('test');
  });

  it('should call playContent when offline', () => {
    const publicPlayerService = TestBed.get(PublicPlayerService);
    spyOn(publicPlayerService, 'playContent');
    component.playContent('test');
    expect(publicPlayerService.playContent).toHaveBeenCalledWith('test');
  });

  it('should call getFilters when in browse page', () => {
    const router = TestBed.get(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue('browse');
    component.getFilters(response.filtersData);
    expect(component.facets).toEqual(['board', 'medium', 'gradeLevel', 'subject', 'contentType']);
    expect(component.dataDrivenFilters).toEqual(response.filtersData);
  });
});
