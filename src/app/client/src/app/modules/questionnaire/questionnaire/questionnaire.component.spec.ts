import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { BehaviorSubject, throwError, of, of as observableOf } from "rxjs";
import { QuestionnaireComponent } from "./questionnaire.component";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { SharedModule } from "@sunbird/shared";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SuiModule } from "ng2-semantic-ui";
import {
  InputTypeAttachmentComponent,
  InputTypeCheckboxComponent,
  InputTypeDatePickerComponent,
  InputTypeNumberComponent,
  InputTypeRadioComponent,
  InputTypeRangeComponent,
  InputTypeTextComponent,
  PageQuestionsComponent,
  MatrixQuestionsComponent,
  QuestionGenericInputsComponent,
  RemarksComponent
} from "../components";
import { Location } from "@angular/common";
import {
  Questionnaire,
  Payload,
  SubmissionSuccessResp,
  AlertMetaData,
  ProfileData
} from "./questionnaire.component.mock";
import { QuestionnaireService } from "../questionnaire.service";
import {
  COLUMN_TYPE,
  LayoutService,
  ResourceService,
  ConfigService
} from "@sunbird/shared";
import {
  IAssessmentDetails,
  AssessmentInfo,
  Section
} from "../Interface/assessmentDetails";
import { ObservationUtilService } from "../../observation/service";
import { ActivatedRoute } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CacheService } from "ng2-cache-service";
import { APP_BASE_HREF } from "@angular/common";
import { TranslateService, TranslateStore } from "@ngx-translate/core";
import { ObservationService } from "@sunbird/core";

describe("QuestionaireComponent", () => {
  let component: QuestionnaireComponent;
  let baseHref;
  let fixture: ComponentFixture<QuestionnaireComponent>;
  let questionnaireService,
    resourceService,
    activedReoute,
    observationUtilService;
  const resourceBundle = { 
    frmelmnts: {
      lbl: {
        continue: "Continue"
      },
      alert: {
        successfullySaved: "Your Form has been saved successfully!",
        saveConfirm: "Are you sure you want to save this form?",
        submitConfirm: "Are you sure you want to submit the form?",
        successfullySubmitted: "Your form has been submitted successfully!",
        failedToSave: "Failed to save the form!",
        submissionFailed: "Failed to submit the form!"
      },
      btn: {
        back: "Back",
        yes: "Yes",
        ok: "Ok",
        no: "No"
      }
    },
    languageSelected$: of({})
  };
  let observationService = {
    post: () => of(),
    delete: () => of()
  };

  observationUtilService = {
    getProfileDataList: () =>
      new Promise((resolve, reject) => {
        resolve;
      }),
    getAlertMetaData: () => AlertMetaData,
    showPopupAlert: () =>
      new Promise((resolve, reject) => {
        resolve;
      })
  };
  questionnaireService = {
    mapSubmissionToAssessment: () => Questionnaire.result,
    setSubmissionId: () =>{},
    getEvidenceData: () => {}
  };
  class FakeActivatedRoute {
    queryParamsMock = new BehaviorSubject<any>({
      subject: ["English"],
      selectedTab: "textbook"
    });
    params = of({});
    get queryParams() {
      return this.queryParamsMock.asObservable();
    }
    snapshot = {
      params: { slug: "ap" },
      data: {
        telemetry: {
          env: "explore",
          pageid: "explore",
          type: "view",
          subtype: "paginate"
        }
      },
      queryParams: {}
    };
    public changeQueryParams(queryParams) {
      this.queryParamsMock.next(queryParams);
    }
    public changeSnapshotQueryParams(queryParams) {
      this.snapshot.queryParams = queryParams;
    }
  }
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SuiModule,
        RouterTestingModule,
        FormsModule,
        SharedModule,
        HttpClientTestingModule,
        ReactiveFormsModule
      ],
      declarations: [
        QuestionnaireComponent,
        InputTypeAttachmentComponent,
        InputTypeCheckboxComponent,
        InputTypeDatePickerComponent,
        InputTypeNumberComponent,
        InputTypeRadioComponent,
        InputTypeRangeComponent,
        InputTypeTextComponent,
        PageQuestionsComponent,
        MatrixQuestionsComponent,
        QuestionGenericInputsComponent,
        RemarksComponent
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        CacheService,
        LayoutService,
        QuestionnaireService,
        ConfigService,
        Location,
        TranslateService,
        TranslateStore,
        { provide: ResourceService, useValue: resourceBundle },
        { provide: ActivatedRoute, useClass: FakeActivatedRoute },
        { provide: APP_BASE_HREF, useValue: baseHref },
        { provide: ObservationService, useValue: observationService },
        { provide: ObservationUtilService, useValue: observationUtilService },
        { provide: QuestionnaireService, useValue: questionnaireService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionnaireComponent);
    component = fixture.componentInstance;
    component.queryParams = "";
    observationService = TestBed.get(ObservationService);
    observationUtilService = TestBed.get(ObservationUtilService);
    component.queryParams = {
      observationId: "60af3cc30258ca7ed1fab9d1",
      entityId: "5fd098e2e049735a86b748ac",
      submissionNumber: 3,
      evidenceCode: "OB"
    };
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should fetch Questionnare", (done) => {
    spyOn(component, "getQuestionnare").and.callThrough();
    spyOn(observationService, "post").and.returnValue(
      observableOf(Questionnaire)
    );
    component.getQuestionnare();
    setTimeout(() => {
      expect(component.getQuestionnare).toHaveBeenCalled();
      expect(observationService.post).toHaveBeenCalled();
      done();
    });
  });



  it("Should call submitEvidence", () => {
    component.assessmentInfo = <any>Questionnaire.result;
    spyOn(component, "submitEvidence").and.callThrough();
    spyOn(observationService, "post").and.returnValue(
      observableOf(SubmissionSuccessResp)
    );
    spyOn(component,"openAlert");
    component.openAlert(resourceBundle.frmelmnts.alert.successfullySubmitted);
    component.submitEvidence(Payload);
    expect(component.submitEvidence).toHaveBeenCalled();
    expect(observationService.post).toHaveBeenCalled();
  });

  it("Should navigate to back", () => {
    spyOn(component, "goBack").and.callThrough();
    component.goBack();
    const location = fixture.debugElement.injector.get(Location);
    expect(component.goBack).toHaveBeenCalled();
  });

  it("Should initialize config", () => {
    spyOn(component, "initConfiguration").and.callThrough();
    component.initConfiguration();
    expect(component.initConfiguration).toHaveBeenCalled();
  });

  it("Should decide back or continue action", done => {
    spyOn(component, "backOrContinue").and.callThrough();
    spyOn(observationUtilService, "getAlertMetaData").and.callFake(
      () => AlertMetaData
    );
    spyOn(observationUtilService, "showPopupAlert").and.callFake(() =>
      Promise.resolve(true)
    );
    component.backOrContinue();
    setTimeout(() => {
      expect(observationUtilService.getAlertMetaData).toHaveBeenCalled();
      expect(observationUtilService.showPopupAlert).toHaveBeenCalled();
      expect(component.backOrContinue).toHaveBeenCalled();
      done();
    }, 10);
  });

  it("Should open alert box", () => {
    let msg = "Save";
    let showCancel = false;
    spyOn(observationUtilService, "getAlertMetaData").and.callFake(
      () => AlertMetaData
    );
    spyOn(observationUtilService, "showPopupAlert").and.callFake(() =>
      Promise.resolve(true)
    );
    spyOn(component, "openAlert").and.returnValue(true);
    component.openAlert(msg, showCancel);
    expect(component.openAlert).toHaveBeenCalled();
  });

  it("Should do actions on Submit", done => {
    let msg = "Save";
    component.openAlert(msg, true);
    spyOn(component, "onSubmit").and.callThrough();
    spyOn(component, "openAlert").and.returnValue(() => true);
    spyOn(observationUtilService, "getProfileDataList").and.callFake(() =>
      Promise.resolve(ProfileData)
    );
    component.onSubmit();
    expect(component.onSubmit).toHaveBeenCalled();
    expect(component.openAlert).toHaveBeenCalled();
    done();
  });

  it("Should call Deactivate", () => {
    spyOn(component, "canDeactivate").and.callThrough();
    component.canDeactivate();
    expect(component.canDeactivate).toHaveBeenCalled();
  });

  // it("Should call scrollToContent", () => {
  //   let id = "S1";
  //   spyOn(component, "scrollToContent").and.callThrough();
  //   component.scrollToContent(id);
  //   expect(component.scrollToContent).toHaveBeenCalled();
  // });
});
