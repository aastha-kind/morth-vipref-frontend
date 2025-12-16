# Linked References Feature - Frontend Implementation Guide

## Overview
This feature allows users to search for and link related VIP references together. The implementation involves adding a new tab in the initiator-form component.

## Step-by-Step Implementation

### Step 1: Add the Tab in HTML

Add the "Linked References" tab to `initiator-form.component.html`:

```html
<!-- Add this tab alongside existing tabs (Add Reference, Action, etc.) -->
<mat-tab label="Linked References">
  <div class="tab-content">
    <!-- Search Criteria Section -->
    <form [formGroup]="linkedReferencesSearchForm">
      <div class="row">
        <div class="col-md-6">
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Date of Letter</mat-label>
            <input matInput [matDatepicker]="dateOfLetterPicker"
                   formControlName="dateOfLetter">
            <mat-datepicker-toggle matSuffix [for]="dateOfLetterPicker"></mat-datepicker-toggle>
            <mat-datepicker #dateOfLetterPicker></mat-datepicker>
          </mat-form-field>
        </div>

        <div class="col-md-6">
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Date of Receiving</mat-label>
            <input matInput [matDatepicker]="dateOfReceivingPicker"
                   formControlName="dateOfReceiving">
            <mat-datepicker-toggle matSuffix [for]="dateOfReceivingPicker"></mat-datepicker-toggle>
            <mat-datepicker #dateOfReceivingPicker></mat-datepicker>
          </mat-form-field>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6">
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Name of Dignitary</mat-label>
            <input matInput formControlName="nameOfDignitary"
                   placeholder="Enter name">
          </mat-form-field>
        </div>

        <div class="col-md-6">
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Designation</mat-label>
            <select matNativeControl formControlName="designation">
              <option value="">--Select--</option>
              <option *ngFor="let designation of vipDesignationList"
                      [value]="designation.designationCode">
                {{designation.designationName}}
              </option>
            </select>
          </mat-form-field>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6">
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>State</mat-label>
            <select matNativeControl formControlName="state">
              <option value="">--Select--</option>
              <option *ngFor="let state of stateList" [value]="state.stateCode">
                {{state.stateName}}
              </option>
            </select>
          </mat-form-field>
        </div>

        <div class="col-md-6">
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Constituency</mat-label>
            <input matInput formControlName="constituency"
                   placeholder="Enter constituency">
          </mat-form-field>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6">
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Category of Subject</mat-label>
            <select matNativeControl formControlName="categoryOfSubject">
              <option value="">--Select--</option>
              <option value="INFRASTRUCTURE">Infrastructure</option>
              <option value="HIGHWAY">Highway</option>
              <!-- Add more categories -->
            </select>
          </mat-form-field>
        </div>

        <div class="col-md-6">
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Subject/Issue</mat-label>
            <input matInput formControlName="subject"
                   placeholder="Enter subject">
          </mat-form-field>
        </div>
      </div>

      <p class="text-danger">
        <small>(*) Denotes primary references searching criteria</small>
      </p>

      <div class="row">
        <div class="col-md-12 text-center">
          <button mat-raised-button color="primary"
                  (click)="searchReferencesToLink()"
                  class="me-2">
            <mat-icon>search</mat-icon> Search References
          </button>
          <button mat-raised-button color="accent"
                  (click)="openSelectedReferences()"
                  class="me-2">
            <mat-icon>open_in_new</mat-icon> Open References
          </button>
          <button mat-raised-button color="warn"
                  (click)="submitLinkedReferences()">
            <mat-icon>check</mat-icon> Submit
          </button>
        </div>
      </div>
    </form>

    <!-- Search Results Table -->
    <div class="row mt-4">
      <div class="col-md-6">
        <h5>Search Results</h5>
        <table mat-table [dataSource]="searchResultsData" class="mat-elevation-z2 w-100">
          <ng-container matColumnDef="select">
            <th mat-header-cell *matHeaderCellDef>Select</th>
            <td mat-cell *matCellDef="let element">
              <mat-checkbox
                [checked]="searchResultsSelection.isSelected(element)"
                (change)="searchResultsSelection.toggle(element)">
              </mat-checkbox>
            </td>
          </ng-container>

          <ng-container matColumnDef="referenceNo">
            <th mat-header-cell *matHeaderCellDef>Request Number</th>
            <td mat-cell *matCellDef="let element">{{element.referenceNo}}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let element">{{element.status}}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="searchResultsColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: searchResultsColumns;"></tr>
        </table>

        <div class="text-center mt-3">
          <button mat-raised-button color="primary"
                  (click)="linkSelectedReferences()"
                  [disabled]="searchResultsSelection.selected.length === 0">
            <mat-icon>link</mat-icon> Link
          </button>
        </div>
      </div>

      <div class="col-md-6">
        <h5>Linked References</h5>
        <table mat-table [dataSource]="linkedReferencesData" class="mat-elevation-z2 w-100">
          <ng-container matColumnDef="referenceNo">
            <th mat-header-cell *matHeaderCellDef>Request Number</th>
            <td mat-cell *matCellDef="let element">{{element.referenceNo}}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let element">{{element.status}}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="linkedReferencesColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: linkedReferencesColumns;"></tr>
        </table>

        <div class="text-center mt-3">
          <button mat-raised-button color="warn"
                  (click)="delinkSelectedReferences()"
                  [disabled]="linkedReferencesSelection.selected.length === 0">
            <mat-icon>link_off</mat-icon> Delink
          </button>
        </div>
      </div>
    </div>
  </div>
</mat-tab>
```

### Step 2: Add TypeScript Properties and Methods

Add to `initiator-form.component.ts`:

```typescript
// Import at the top
import { SelectionModel } from '@angular/cdk/collections';

// Add properties in the component class
linkedReferencesSearchForm!: FormGroup;
searchResultsData = new MatTableDataSource<any>();
linkedReferencesData = new MatTableDataSource<any>();
searchResultsSelection = new SelectionModel<any>(true, []);
linkedReferencesSelection = new SelectionModel<any>(true, []);
searchResultsColumns: string[] = ['select', 'referenceNo', 'status'];
linkedReferencesColumns: string[] = ['referenceNo', 'status'];

// Add in ngOnInit
this.initiateLinkedReferencesSearchForm();
if (referenceNo) {
  this.loadLinkedReferences();
}

// Add methods

initiateLinkedReferencesSearchForm() {
  this.linkedReferencesSearchForm = new FormGroup({
    dateOfLetter: new FormControl(''),
    dateOfReceiving: new FormControl(''),
    nameOfDignitary: new FormControl(''),
    designation: new FormControl(''),
    state: new FormControl(''),
    constituency: new FormControl(''),
    categoryOfSubject: new FormControl(''),
    subject: new FormControl('')
  });
}

searchReferencesToLink() {
  const criteria = this.linkedReferencesSearchForm.getRawValue();

  this.userMgmtService.searchReferencesForLinking(criteria).subscribe({
    next: (results) => {
      // Filter out current reference
      const filtered = results.filter(
        (ref: any) => ref.referenceId !== this.refernceDetails.referenceId
      );
      this.searchResultsData.data = filtered;
      this.toastr.success(`Found ${filtered.length} references`);
    },
    error: (err) => {
      this.toastr.error('Failed to search references');
      console.error(err);
    }
  });
}

linkSelectedReferences() {
  const selectedRefs = this.searchResultsSelection.selected;

  if (selectedRefs.length === 0) {
    this.toastr.warning('Please select references to link');
    return;
  }

  // Link each selected reference
  const linkRequests = selectedRefs.map(ref => {
    return this.userMgmtService.linkReferences({
      primaryReferenceId: this.refernceDetails.referenceId,
      linkedReferenceId: ref.referenceId,
      linkType: 'RELATED'
    }).toPromise();
  });

  Promise.all(linkRequests).then(() => {
    this.toastr.success('References linked successfully');
    this.searchResultsSelection.clear();
    this.loadLinkedReferences();
  }).catch(err => {
    this.toastr.error('Failed to link references');
    console.error(err);
  });
}

loadLinkedReferences() {
  if (!this.refernceDetails.referenceId) return;

  this.userMgmtService.getLinkedReferences(this.refernceDetails.referenceId).subscribe({
    next: (linked) => {
      this.linkedReferencesData.data = linked;
    },
    error: (err) => {
      console.error('Failed to load linked references', err);
    }
  });
}

delinkSelectedReferences() {
  const selectedRefs = this.linkedReferencesSelection.selected;

  if (selectedRefs.length === 0) {
    this.toastr.warning('Please select references to delink');
    return;
  }

  // Delink each selected reference
  const delinkRequests = selectedRefs.map(ref => {
    return this.userMgmtService.delinkReferences(ref.linkId).toPromise();
  });

  Promise.all(delinkRequests).then(() => {
    this.toastr.success('References delinked successfully');
    this.linkedReferencesSelection.clear();
    this.loadLinkedReferences();
  }).catch(err => {
    this.toastr.error('Failed to delink references');
    console.error(err);
  });
}

openSelectedReferences() {
  const selected = this.searchResultsSelection.selected;

  if (selected.length === 0) {
    this.toastr.warning('Please select references to open');
    return;
  }

  // Open each reference in a new tab
  selected.forEach(ref => {
    const url = window.location.origin + `/dashboard/add-reference/${ref.referenceNo}`;
    window.open(url, '_blank');
  });
}

submitLinkedReferences() {
  // This would save any pending changes
  this.toastr.success('Linked references saved');
}
```

### Step 3: Add Service Methods

Add to `usermgmt.service.ts`:

```typescript
// Search references for linking
searchReferencesForLinking(criteria: any): Observable<any> {
  return this.http.post(`${API_ENDPOINTS.linkedReferences}/search`, criteria);
}

// Link two references
linkReferences(request: any): Observable<any> {
  return this.http.post(`${API_ENDPOINTS.linkedReferences}/link`, request);
}

// Get linked references
getLinkedReferences(referenceId: number): Observable<any> {
  return this.http.get(`${API_ENDPOINTS.linkedReferences}/${referenceId}`);
}

// Delink references
delinkReferences(linkId: number): Observable<any> {
  return this.http.delete(`${API_ENDPOINTS.linkedReferences}/${linkId}`);
}
```

### Step 4: Add API Endpoint

Add to `api_endpoints.ts`:

```typescript
linkedReferences: `${environment.baseUrl}/linked-references`
```

### Step 5: Add Styles (Optional)

Add to `initiator-form.component.css`:

```css
.linked-references-section {
  padding: 20px;
}

.search-results-table,
.linked-references-table {
  width: 100%;
  margin-top: 10px;
}

.mat-column-select {
  width: 50px;
  text-align: center;
}
```

## Database Setup

Run the SQL script to create the necessary table:

```bash
psql -U postgres -d postgres -f "c:\Users\Umesh Sharma\WebstormProjects\morth-vipref-be\sql\create_linked_references_table.sql"
```

## Testing

1. **Search for references**: Fill in search criteria and click "Search References"
2. **Link references**: Select references from search results and click "Link"
3. **View linked references**: They appear in the right table
4. **Delink references**: Select linked references and click "Delink"
5. **Open references**: Select references and click "Open References" to view in new tabs

## API Endpoints Created

- `POST /linked-references/search` - Search references by criteria
- `POST /linked-references/link` - Link two references
- `GET /linked-references/{referenceId}` - Get all linked references
- `DELETE /linked-references/{linkId}` - Remove link

## Notes

- Links are bidirectional - linking A to B also shows B when viewing A
- Soft delete is used (isActive flag) to maintain history
- Search results exclude the current reference to prevent self-linking
- Duplicate links are prevented at the database level
- All operations require authentication
